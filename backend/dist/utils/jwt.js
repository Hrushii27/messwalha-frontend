import jwt from 'jsonwebtoken';
import { config } from '../config/environment.js';
export const generateToken = (userId, role) => {
    return jwt.sign({ id: userId, role }, config.JWT_SECRET, {
        expiresIn: '1d',
    });
};
export const generateRefreshToken = (userId) => {
    return jwt.sign({ id: userId }, config.JWT_REFRESH_SECRET, {
        expiresIn: '7d',
    });
};
export const verifyToken = (token) => {
    return jwt.verify(token, config.JWT_SECRET);
};
export const verifyRefreshToken = (token) => {
    return jwt.verify(token, config.JWT_REFRESH_SECRET);
};
//# sourceMappingURL=jwt.js.map