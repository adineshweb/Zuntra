const mongoose = require('mongoose');

const connectDB = async () => {
  const localUri = 'mongodb://127.0.0.1:27017/zuntra';
  const atlasUri = process.env.MONGO_URI;

  // Check if Atlas URI is set and is not a placeholder
  const isAtlasConfigured = atlasUri && !atlasUri.includes('placeholder') && atlasUri !== '';

  if (isAtlasConfigured) {
    try {
      console.log('Attempting connection to MongoDB Atlas...');
      await mongoose.connect(atlasUri);
      console.log('MongoDB Atlas Connected successfully.');
      return;
    } catch (error) {
      console.error('MongoDB Atlas connection failed:', error.message);
      console.log('Falling back to local MongoDB...');
    }
  } else {
    console.log('MongoDB Atlas not configured or is placeholder. Attempting local MongoDB connection...');
  }

  try {
    await mongoose.connect(localUri);
    console.log('Local MongoDB Connected successfully to:', localUri);
  } catch (error) {
    console.error('Local MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
