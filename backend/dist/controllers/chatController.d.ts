import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../middleware/auth.js';
export declare const getMyChats: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getChatMessages: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const createOrGetChat: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=chatController.d.ts.map