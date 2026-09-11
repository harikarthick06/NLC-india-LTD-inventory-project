const mongoose = require('mongoose');
const env = require('./env');

let isConnected = false;

async function connectDB() {
  if (isConnected) return mongoose.connection;

  mongoose.set('strictQuery', true);

  try {
    await mongoose.connect(env.MONGO_URI);
    isConnected = true;
    // eslint-disable-next-line no-console
    console.log(`MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
    return mongoose.connection;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
}

async function disconnectDB() {
  if (!isConnected) return;
  await mongoose.disconnect();
  isConnected = false;
}

module.exports = { connectDB, disconnectDB };
