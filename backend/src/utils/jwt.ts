import jwt from 'jsonwebtoken';
import { config } from '../config/environment.js';

export const generateToken = (userId: string, role: string) => {
    return jwt.sign({ id: userId, role }, config.JWT_SECRET, {
        expiresIn: '1d',
    });
};

export const generateRefreshToken = (userId: string) => {
    return jwt.sign({ id: userId }, config.JWT_REFRESH_SECRET, {
        expiresIn: '7d',
    });
};

export const verifyToken = (token: string) => {
    return jwt.verify(token, config.JWT_SECRET) as { id: string; role: string };
};

export const verifyRefreshToken = (token: string) => {
    return jwt.verify(token, config.JWT_REFRESH_SECRET) as { id: string };
};
