const fs = require('fs');
const path = require('path');

/**
 * Enhanced logging for security-sensitive operations
 */
const logSecurityEvent = (event, data) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [SECURITY_EVENT:${event}] ${JSON.stringify(data)}\n`;
    
    // Log to console for real-time monitoring
    console.warn(logMessage);

    // Persist to a local security log file (ensure folder exists in production)
    const logPath = path.join(__dirname, '../../logs/security.log');
    try {
        const logDir = path.dirname(logPath);
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
        fs.appendFileSync(logPath, logMessage);
    } catch (err) {
        console.error('Failed to write to security log:', err.message);
    }
};

const activityLogger = (req, res, next) => {
    // Capture the original end function to log after response
    const originalEnd = res.end;
    
    res.end = function (...args) {
        if (res.statusCode >= 400) {
            // Log suspicious or failed requests
            logSecurityEvent('FAILED_REQUEST', {
                method: req.method,
                url: req.originalUrl,
                status: res.statusCode,
                ip: req.ip,
                body: req.method === 'POST' ? { ...req.body, password: '[REDACTED]' } : {}
            });
        }
        originalEnd.apply(res, args);
    };
    
    next();
};

module.exports = {
    activityLogger,
    logSecurityEvent
};
