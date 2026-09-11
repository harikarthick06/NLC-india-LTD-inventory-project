require('dotenv').config();

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 5000,
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  MONGO_URI: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nlc_inventory',
  JWT_SECRET: process.env.JWT_SECRET || 'dev_only_insecure_secret_change_me',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || '',
  CLAUDE_MODEL: process.env.CLAUDE_MODEL || 'claude-sonnet-5',
  AUTH_RATE_LIMIT_MAX: parseInt(process.env.AUTH_RATE_LIMIT_MAX, 10) || 20,
  AI_RATE_LIMIT_MAX: parseInt(process.env.AI_RATE_LIMIT_MAX, 10) || 30,
  IS_TEST: process.env.NODE_ENV === 'test',
};

if (env.NODE_ENV === 'production' && env.JWT_SECRET === 'dev_only_insecure_secret_change_me') {
  // eslint-disable-next-line no-console
  console.warn('WARNING: JWT_SECRET is using the insecure default value in production.');
}

module.exports = env;
