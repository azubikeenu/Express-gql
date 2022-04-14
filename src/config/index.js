import { config } from 'dotenv';

const { parsed } = config();

export const {
  PORT,
  DB,
  BASE_URL = `http://localhost:${PORT}`,
  SECRET,
} = parsed;
