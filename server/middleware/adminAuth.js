const isAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized. Please login.' });
    }

    if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Access denied. Administrator privileges required.' });
    }

    next();
};

module.exports = isAdmin;
