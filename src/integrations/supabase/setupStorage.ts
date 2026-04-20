
import { supabase } from "./client";

export const ensureStorageBuckets = async () => {
  try {
    // Check if bucket exists
    const { data: buckets, error: listBucketsError } = await supabase.storage.listBuckets();

    if (listBucketsError) {
      if (listBucketsError.message.includes("new row violates row-level security policy")) {
        console.warn("Row-level security policy violation when listing buckets, continuing without bucket creation.");
        return;
      }
      throw listBucketsError;
    }
    const bucketsToCreate = ['restaurant-images', 'avatars'];
    
    for (const bucketName of bucketsToCreate) {
      const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
      
      if (!bucketExists) {
        try {
          const { error } = await supabase.storage.createBucket(bucketName, {
            public: true,
            fileSizeLimit: 5242880 // 5MB for avatars, 10MB for restaurant-images? Let's use 5MB for both or keep 10MB
          });
          
          if (error && !error.message.includes("The resource already exists") && !error.message.includes("insufficient_privileges")) {
            console.error(`Error creating bucket ${bucketName}:`, error);
          } else {
            console.log(`Ensured bucket exists: ${bucketName}`);
          }
        } catch (err) {
          console.error(`Failed to ensure bucket ${bucketName}:`, err);
        }
      }
    }
  } catch (error) {
    // Already logged in the inner catch or above, but we log the final failure here
    console.error('Error in ensureStorageBuckets:', error);
    throw error;
  }
};
