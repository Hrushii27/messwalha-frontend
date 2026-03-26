const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { body } = require('express-validator');
const { validateRequest } = require('../middleware/validation');

const weakPasswords = [
    "123456", "password", "qwerty", "111111",
    "abc123", "123123", "000000", "password1",
    "iloveyou", "admin", "letmein", "welcome"
];

const passwordValidation = body('password')
    .custom((value) => {
        if (weakPasswords.includes(value.toLowerCase())) {
            throw new Error('This password is too weak. Use a stronger password.');
        }
        return true;
    })
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number');

const registerValidation = [
    body('email').isEmail().normalizeEmail().trim().withMessage('Enter a valid email address'),
    body('name').trim().matches(/^[A-Za-z ]{2,}$/).withMessage('Enter a valid full name (min 2 characters)'),
    passwordValidation,
    body('college').optional().trim().isLength({ min: 2 }).withMessage('Enter a valid college name')
];

const ownerRegisterValidation = [
    body('email').isEmail().normalizeEmail().trim().withMessage('Enter a valid email address'),
    body('name').trim().matches(/^[A-Za-z ]{2,}$/).withMessage('Enter a valid full name (min 2 characters)'),
    body('phone').trim().matches(/^[0-9]{10}$/).withMessage('Enter a valid 10-digit phone number'),
    body('messName').trim().matches(/^[A-Za-z0-9 ]{3,}$/).withMessage('Mess name must be at least 3 characters'),
    body('city').trim().matches(/^[A-Za-z ]{2,}$/).withMessage('Enter a valid city name'),
    body('location').trim().isLength({ min: 5 }).withMessage('Enter a valid location (min 5 characters)'),
    passwordValidation
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
    passwordValidation,
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
