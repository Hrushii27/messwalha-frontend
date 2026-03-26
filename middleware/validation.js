const { validationResult } = require('express-validator');

/**
 * Middleware to handle express-validator errors
 */
const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorArray = errors.array();
        console.warn('⚠️ Validation failed for request:', req.originalUrl);
        console.warn('Body:', JSON.stringify(req.body, null, 2));
        console.warn('Errors:', errorArray);
        
        // Return descriptive error for the first failure
        const firstError = errorArray[0];
        return res.status(400).json({ 
            status: 'ERROR', 
            message: `Validation failed: ${firstError.msg} in ${firstError.path || firstError.param}`,
            errors: errorArray 
        });
    }
    next();
};

module.exports = {
    validateRequest
};
