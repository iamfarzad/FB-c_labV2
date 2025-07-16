const fs = require('fs');
const path = require('path');

const adminRoutes = [
  'app/api/admin/ai-performance/route.ts',
  'app/api/admin/email-campaigns/route.ts',
  'app/api/admin/export/route.ts',
  'app/api/admin/real-time-activity/route.ts',
  'app/api/admin/token-usage/route.ts'
];

function protectRoute(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  
  // Check if already protected
  if (content.includes('adminAuthMiddleware')) {
    console.log(`Already protected: ${filePath}`);
    return;
  }

  // Add import
  const importMatch = content.match(/import.*from.*["']next\/server["']/);
  if (importMatch) {
    content = content.replace(
      importMatch[0],
      `${importMatch[0]}\nimport { adminAuthMiddleware } from "@/lib/auth"`
    );
  }

  // Add auth check to GET function
  const getMatch = content.match(/export async function GET\([^)]*\)\s*\{/);
  if (getMatch) {
    const authCheck = `
  // Check admin authentication
  const authResult = await adminAuthMiddleware(request);
  if (authResult) {
    return authResult;
  }`;
    
    content = content.replace(
      getMatch[0],
      `${getMatch[0]}${authCheck}`
    );
  }

  // Add auth check to POST function
  const postMatch = content.match(/export async function POST\([^)]*\)\s*\{/);
  if (postMatch) {
    const authCheck = `
  // Check admin authentication
  const authResult = await adminAuthMiddleware(request);
  if (authResult) {
    return authResult;
  }`;
    
    content = content.replace(
      postMatch[0],
      `${postMatch[0]}${authCheck}`
    );
  }

  fs.writeFileSync(filePath, content);
  console.log(`Protected: ${filePath}`);
}

adminRoutes.forEach(protectRoute);