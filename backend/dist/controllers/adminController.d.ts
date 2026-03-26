import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../middleware/auth.js';
export declare const getStats: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getAllUsers: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getAllMessesAdmin: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const verifyMess: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteUserAdmin: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=adminController.d.ts.map