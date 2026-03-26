import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../middleware/auth.js';
export declare const createOrder: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
export declare const createOwnerOrder: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
export declare const verifyPayment: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const verifyOwnerPayment: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getMyPayments: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=paymentController.d.ts.map