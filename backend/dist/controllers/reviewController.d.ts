import type { Request, Response, NextFunction } from 'express';
import type { AuthRequest } from '../middleware/auth.js';
export declare const createReview: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getMessReviews: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=reviewController.d.ts.map