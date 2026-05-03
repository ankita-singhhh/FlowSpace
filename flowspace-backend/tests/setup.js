const mongoose = require('mongoose');

beforeAll(async () => {
  // If already connected, disconnect first
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  
  // Use test database URL or default to localhost test DB
  const testDbUrl = process.env.TEST_MONGO_URI || 'mongodb://localhost:27017/flowspace_test';
  await mongoose.connect(testDbUrl);
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});
