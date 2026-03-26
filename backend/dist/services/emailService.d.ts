declare class EmailService {
    private transporter;
    constructor();
    sendMail(to: string, subject: string, html: string): Promise<boolean>;
    sendWelcomeEmail(email: string, name: string): Promise<boolean>;
    sendSubscriptionNotice(email: string, messName: string, endDate: string): Promise<boolean>;
    sendExpiryAlert(email: string, messName: string, daysLeft: number): Promise<boolean>;
    sendResetPasswordEmail(email: string, token: string): Promise<boolean>;
    sendOtpEmail(email: string, otp: string): Promise<boolean>;
}
export declare const emailService: EmailService;
export {};
//# sourceMappingURL=emailService.d.ts.map