const app = require('./app');
const env = require('./config/env');
const { connectDB } = require('./config/db');

async function start() {
  await connectDB();
  const server = app.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`NLC Inventory API listening on port ${env.PORT} [${env.NODE_ENV}]`);
  });

  process.on('unhandledRejection', (err) => {
    // eslint-disable-next-line no-console
    console.error('Unhandled promise rejection:', err);
    server.close(() => process.exit(1));
  });
}

start();
