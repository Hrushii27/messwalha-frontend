const { verifyToken } = require('../utils/jwt');
const User = require('../models/user');

const authMiddleware = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        const decoded = verifyToken(token);
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ message: 'Token is not valid' });
        }
        req.owner = user; // Keep it as req.owner for compatibility with existing controllers
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

module.exports = authMiddleware;
