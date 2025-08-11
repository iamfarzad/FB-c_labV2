#!/usr/bin/env node

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const PORT = 3000;
const LOCK_FILE = path.join(process.cwd(), '.dev-server.lock');

function checkPortUsage() {
  try {
    // Check if port 3000 is in use
    const result = execSync(`lsof -ti:${PORT}`, { encoding: 'utf8' }).trim();
    if (result) {
      console.log(`⚠️  Port ${PORT} is already in use by process(es): ${result}`);
      return result.split('\n');
    }
  } catch (error) {
    // Port is not in use
    return [];
  }
  return [];
}

function checkNextDevProcesses() {
  try {
    // Check for running Next.js dev processes
    const result = execSync('pgrep -f "next dev"', { encoding: 'utf8' }).trim();
    if (result) {
      console.log(`⚠️  Found running Next.js dev process(es): ${result}`);
      return result.split('\n');
    }
  } catch (error) {
    // No Next.js dev processes found
    return [];
  }
  return [];
}

function checkLockFile() {
  if (fs.existsSync(LOCK_FILE)) {
    try {
      const lockData = JSON.parse(fs.readFileSync(LOCK_FILE, 'utf8'));
      const now = Date.now();
      const lockAge = now - lockData.timestamp;
      
      // If lock is older than 5 minutes, consider it stale
      if (lockAge > 5 * 60 * 1000) {
        console.log('🔄 Removing stale lock file...');
        fs.unlinkSync(LOCK_FILE);
        return false;
      }
      
      console.log(`⚠️  Development server lock file exists (created ${Math.round(lockAge / 1000)}s ago)`);
      console.log(`   PID: ${lockData.pid}, Port: ${lockData.port}`);
      return true;
    } catch (error) {
      console.log('🔄 Removing corrupted lock file...');
      fs.unlinkSync(LOCK_FILE);
      return false;
    }
  }
  return false;
}

function createLockFile() {
  const lockData = {
    pid: process.pid,
    port: PORT,
    timestamp: Date.now(),
    cwd: process.cwd()
  };
  
  fs.writeFileSync(LOCK_FILE, JSON.stringify(lockData, null, 2));
  console.log('🔒 Created development server lock file');
}

function removeLockFile() {
  if (fs.existsSync(LOCK_FILE)) {
    fs.unlinkSync(LOCK_FILE);
    console.log('🔓 Removed development server lock file');
  }
}

function killProcesses(pids) {
  if (pids.length === 0) return;
  
  console.log('🔄 Terminating existing processes...');
  pids.forEach(pid => {
    try {
      execSync(`kill -9 ${pid}`);
      console.log(`   ✅ Killed process ${pid}`);
    } catch (error) {
      console.log(`   ❌ Failed to kill process ${pid}: ${error.message}`);
    }
  });
}

async function main() {
  console.log('🔍 Checking for existing development processes...\n');
  
  const portProcesses = checkPortUsage();
  const nextProcesses = checkNextDevProcesses();
  const hasLock = checkLockFile();
  
  if (portProcesses.length > 0 || nextProcesses.length > 0 || hasLock) {
    console.log('\n🚨 Multiple development instances detected!');
    console.log('\nOptions:');
    console.log('1. Kill existing processes and continue (recommended)');
    console.log('2. Exit and manually handle conflicts');
    console.log('3. Use different port');
    
    // For automated environments, default to killing processes
    if (process.env.AUTO_KILL === 'true') {
      console.log('\n🤖 Auto-killing existing processes...');
      killProcesses([...portProcesses, ...nextProcesses]);
      removeLockFile();
      createLockFile();
      console.log('✅ Ready to start development server');
      process.exit(0);
    }
    
    // For interactive environments, ask user
    const readline = require('readline')
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    rl.question('\nEnter choice (1-3): ', (answer) => {
      rl.close();
      
      switch (answer.trim()) {
        case '1':
          console.log('\n🔄 Killing existing processes...');
          killProcesses([...portProcesses, ...nextProcesses]);
          removeLockFile();
          createLockFile();
          console.log('✅ Ready to start development server');
          process.exit(0);
          break;
        case '2':
          console.log('❌ Exiting. Please handle conflicts manually.');
          process.exit(1);
          break;
        case '3':
          console.log('⚠️  Please modify the script to use a different port.');
          process.exit(1);
          break;
        default:
          console.log('❌ Invalid choice. Exiting.');
          process.exit(1);
      }
    });
  } else {
    console.log('✅ No conflicts detected');
    createLockFile();
    console.log('✅ Ready to start development server');
    process.exit(0);
  }
}

// Handle cleanup on exit
process.on('SIGINT', () => {
  console.log('\n🔄 Cleaning up...');
  removeLockFile();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🔄 Cleaning up...');
  removeLockFile();
  process.exit(0);
});

main();
