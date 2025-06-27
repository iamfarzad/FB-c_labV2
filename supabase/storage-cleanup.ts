import { createClient } from '@supabase/supabase-js';

const BUCKET_NAME = 'FBC_bucket';
const EXPIRATION_TIME_MS = 60 * 60 * 1000; // 1 hour in milliseconds

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing required Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface StorageFile {
  name: string;
  created_at: string;
  updated_at: string;
  metadata: Record<string, unknown>;
}

/**
 * Deletes files older than the specified expiration time
 * @param expirationTimeMs Time in milliseconds after which files should be deleted
 */
export async function cleanupOldFiles(expirationTimeMs: number = EXPIRATION_TIME_MS): Promise<void> {
  try {
    console.log(`🔄 Starting cleanup of bucket: ${BUCKET_NAME}`);
    
    // List all files in the bucket
    const { data: files, error: listError } = await supabase
      .storage
      .from(BUCKET_NAME)
      .list();

    if (listError) {
      throw new Error(`Error listing files: ${listError.message}`);
    }

    if (!files || files.length === 0) {
      console.log('ℹ️ No files found in the bucket');
      return;
    }

    console.log(`📋 Found ${files.length} files to check`);
    const now = new Date();
    let deletedCount = 0;

    // Process each file
    for (const file of files as StorageFile[]) {
      try {
        const fileCreatedAt = new Date(file.created_at);
        const fileAge = now.getTime() - fileCreatedAt.getTime();

        if (fileAge > expirationTimeMs) {
          console.log(`🗑️ Deleting file: ${file.name} (${Math.floor(fileAge / 1000 / 60)} minutes old)`);
          
          const { error: deleteError } = await supabase
            .storage
            .from(BUCKET_NAME)
            .remove([file.name]);

          if (deleteError) {
            console.error(`❌ Error deleting file ${file.name}:`, deleteError);
          } else {
            deletedCount++;
            console.log(`✅ Deleted: ${file.name}`);
          }
        }
      } catch (fileError) {
        console.error(`⚠️ Error processing file ${file?.name || 'unknown'}:`, fileError);
      }
    }

    console.log(`✨ Cleanup complete. Deleted ${deletedCount} out of ${files.length} checked files`);
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  }
}

// Run the cleanup if this file is executed directly
if (require.main === module) {
  cleanupOldFiles()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Fatal error:', error);
      process.exit(1);
    });
}

export default cleanupOldFiles;
