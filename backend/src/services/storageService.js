const { bucket, useGCS, bucketName } = require('../config/gcs');
const fs = require('fs');
const path = require('path');

/**
 * Uploads a local file to GCS (if configured) or returns the local server static path
 * @param {Object} file - Express multer file object
 * @returns {Promise<String>} - Publicly accessible URL of the file
 */
exports.uploadFile = async (file) => {
  if (!file) return null;

  if (useGCS && bucket) {
    try {
      const gcsFileName = `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
      const destination = `evidence/${gcsFileName}`;
      
      console.log(`Uploading file ${file.path} to GCS bucket ${bucketName} as ${destination}`);

      // Upload file to GCS
      await bucket.upload(file.path, {
        destination,
        metadata: {
          contentType: file.mimetype,
        },
      });

      // Make the file public (optional - depending on bucket settings, but typically we want it readable)
      try {
        await bucket.file(destination).makePublic();
      } catch (err) {
        console.log('Could not make file public (might be public-by-default or IAM restricted):', err.message);
      }

      // Public GCS URL format
      const publicUrl = `https://storage.googleapis.com/${bucketName}/${destination}`;
      
      // Clean up the local temp file uploaded by multer
      fs.unlink(file.path, (err) => {
        if (err) console.error('Error deleting local temp file:', err);
      });

      return publicUrl;
    } catch (error) {
      console.error('GCS Upload failed, falling back to local file URL:', error.message);
      // Fallback: If GCS fails, we will just serve it from the local server folder
    }
  }

  // Local storage route: Return relative path of the file
  // Multer saves files directly in a directory (like backend/uploads). We'll make this dir static.
  // In server.js we will map: app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));
  const filename = path.basename(file.path);
  return `/uploads/${filename}`;
};
