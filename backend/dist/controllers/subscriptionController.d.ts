import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../middleware/auth.js';
export declare const createSubscription: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getMySubscriptions: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getOwnerSubscribers: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getSubscriptionStatus: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
//# sourceMappingURL=subscriptionController.d.ts.map