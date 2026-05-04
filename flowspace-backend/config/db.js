const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.warn('⚠️  MONGO_URI not found in environment variables');
      console.warn('🔧 Running without database connection - some features may be limited');
      return;
    }
    
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    console.warn('🔧 Continuing without database connection - some features may be limited');
  }
};

module.exports = connectDB;
