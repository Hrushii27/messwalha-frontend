export declare const logger: {
    info: (message: string) => void;
    error: (message: string, error?: any) => void;
    warn: (message: string) => void;
};
export declare const httpLogger: (req: import("node:http").IncomingMessage, res: import("node:http").ServerResponse<import("node:http").IncomingMessage>, callback: (err?: Error) => void) => void;
//# sourceMappingURL=logger.d.ts.map