import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../middleware/auth.js';
export declare const createMenu: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const updateMenu: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=menuController.d.ts.map