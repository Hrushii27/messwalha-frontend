const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { body } = require('express-validator');
const { validateRequest } = require('../middleware/validation');

const registerValidation = [
    body('email').isEmail().normalizeEmail().withMessage('Invalid email address'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('phone').optional({ checkFalsy: true }).matches(/^[0-9]{10}$/).withMessage('Invalid phone number (10 digits required)')
];

const ownerRegisterValidation = [
    body('email').isEmail().normalizeEmail().withMessage('Invalid email address'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('messName').trim().notEmpty().withMessage('Mess Name is required'),
    body('location').trim().notEmpty().withMessage('Location is required'),
    body('city').trim().notEmpty().withMessage('City is required'),
    body('phone').matches(/^[0-9]{10}$/).withMessage('Valid phone number (10 digits) is required for owners')
];

const loginValidation = [
    body('email').isEmail().normalizeEmail().withMessage('Invalid email address'),
    body('password').notEmpty().withMessage('Password is required')
];

router.post('/register', registerValidation, validateRequest, authController.register);
router.post('/owner-register', ownerRegisterValidation, validateRequest, authController.ownerRegister);
router.post('/login', loginValidation, validateRequest, authController.login);
router.post('/forgot-password', [
    body('email').isEmail().normalizeEmail(),
    validateRequest
], authController.forgotPassword);
router.post('/reset-password', [
    body('token').notEmpty(),
    body('password').isLength({ min: 8 }),
    validateRequest
], authController.resetPassword);

// OTP Routes
router.post('/send-otp', body('email').isEmail(), validateRequest, authController.sendOTP);
router.post('/verify-otp', [
    body('email').isEmail(),
    body('otp').isLength({ min: 6, max: 6 })
], validateRequest, authController.verifyOTP);

// Google Auth Route
router.post('/google', authController.googleLogin);

module.exports = router;
