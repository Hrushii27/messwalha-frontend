import morgan from 'morgan';
// Custom logger using morgan or winston could be here
// For simplicity, we'll use a basic console logger and morgan for http
export const logger = {
    info: (message) => console.log(`[INFO] ${new Date().toISOString()}: ${message}`),
    error: (message, error) => console.error(`[ERROR] ${new Date().toISOString()}: ${message}`, error),
    warn: (message) => console.warn(`[WARN] ${new Date().toISOString()}: ${message}`),
};
export const httpLogger = morgan('dev');
//# sourceMappingURL=logger.js.map