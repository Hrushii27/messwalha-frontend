import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../middleware/auth.js';
export declare const toggleFavorite: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
export declare const getUserFavorites: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
//# sourceMappingURL=favoriteController.d.ts.map