const { validationResult } = require('express-validator');

/**
 * Middleware to handle express-validator errors
 */
const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.warn('⚠️ Validation failed for request:', req.originalUrl, errors.array());
        return res.status(400).json({ 
            status: 'ERROR', 
            message: 'Validation failed',
            errors: errors.array() 
        });
    }
    next();
};

module.exports = {
    validateRequest
};
