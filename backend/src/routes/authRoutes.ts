import { Router } from 'express';
import { 
    register, 
    ownerRegister, 
    login, 
    firebaseAuth, 
    forgotPassword, 
    resetPassword,
    sendOtp,
    verifyOtp,
    googleLogin
} from '../controllers/authController.js';

const router = Router();

router.post('/register', register);
router.post('/owner-register', ownerRegister);
router.post('/login', login);
router.post('/google', googleLogin);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/firebase-login', firebaseAuth);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
