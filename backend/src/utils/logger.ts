import morgan from 'morgan';
import fs from 'fs';
import path from 'path';

// Custom logger using morgan or winston could be here
// For simplicity, we'll use a basic console logger and morgan for http

export const logger = {
    info: (message: string) => console.log(`[INFO] ${new Date().toISOString()}: ${message}`),
    error: (message: string, error?: any) => console.error(`[ERROR] ${new Date().toISOString()}: ${message}`, error),
    warn: (message: string) => console.warn(`[WARN] ${new Date().toISOString()}: ${message}`),
};

export const httpLogger = morgan('dev');
