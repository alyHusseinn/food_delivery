import 'dotenv/config';

const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 3000,
  DATABASE_URL: process.env.DATABASE_URL!,
  JWT_SECRET: process.env.JWT_SECRET!,
  GMAIL_USER: process.env.GMAIL_USER!,
  GMAIL_PASS: process.env.GMAIL_PASS!,
};

export default ENV;