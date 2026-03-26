export declare const generateToken: (userId: string, role: string) => string;
export declare const generateRefreshToken: (userId: string) => string;
export declare const verifyToken: (token: string) => {
    id: string;
    role: string;
};
export declare const verifyRefreshToken: (token: string) => {
    id: string;
};
//# sourceMappingURL=jwt.d.ts.map