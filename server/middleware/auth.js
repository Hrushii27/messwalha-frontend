const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        console.warn('⚠️ No token provided');
        return next(); // Continue, but req.user will be undefined
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.error('❌ Token verification failed:', err.message);
            return next();
        }
        req.user = user;
        next();
    });
};

module.exports = authenticateToken;
