import type { Request, Response, NextFunction } from 'express';
import type { AuthRequest } from '../middleware/auth.js';
export declare const getAllMesses: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getMessById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const createMess: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getMyMess: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const updateMess: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=messController.d.ts.map