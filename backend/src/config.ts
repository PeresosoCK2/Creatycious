import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: Number(process.env.PORT) || 4000,
  jwtSecret: process.env.JWT_SECRET || 'dev_secret_change_me',
  jwtExpiresIn: '7d',
  dbFile: process.env.DB_FILE || 'data/dev.db',
  uploadsDir: 'uploads',
} as const;
