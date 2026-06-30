const { Storage } = require('@google-cloud/storage');
const path = require('path');
const fs = require('fs');

let storage = null;
let bucket = null;
let useGCS = false;

const bucketName = process.env.GCS_BUCKET_NAME;
const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

try {
  if (bucketName && (keyPath || process.env.GCLOUD_PROJECT)) {
    const config = {};
    if (keyPath && fs.existsSync(keyPath)) {
      config.keyFilename = keyPath;
    }
    
    storage = new Storage(config);
    bucket = storage.bucket(bucketName);
    useGCS = true;
    console.log(`Google Cloud Storage configured to use bucket: ${bucketName}`);
  } else {
    console.log('Google Cloud Storage environment variables not fully configured. Using local file storage fallback.');
  }
} catch (error) {
  console.error('Error configuring Google Cloud Storage client:', error.message);
  console.log('Falling back to local file storage.');
}

module.exports = {
  storage,
  bucket,
  useGCS,
  bucketName
};
