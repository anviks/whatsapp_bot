import { config } from 'dotenv';

config();

export const CHROMIUM_PATH = process.env.CHROMIUM_PATH;
export const POLL_CRON = process.env.POLL_CRON || '';
export const CHAT_ID = process.env.CHAT_ID;
