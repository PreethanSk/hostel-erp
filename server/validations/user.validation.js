const { check } = require("express-validator");

module.exports.validateRegister = () => {
    return [
        check('firstName').trim().isString().not().isEmpty().withMessage('Enter First Name'),
        check('lastName').trim().isString().not().isEmpty().withMessage('Enter Last Name'),
        check('emailAddress').trim().isString().not().isEmpty().withMessage('Enter Email Id'),
        check('mobileNumber').trim().isString().not().isEmpty().withMessage('Enter Mobile Number'),
    ];
};

module.exports.validateLogin = () => {
    return [
        check('keyUser').trim().not().isEmpty().withMessage('Email or Mobile number required'),
        check('keyOtp').trim().not().isEmpty().withMessage('OTP required'),
    ];
}

module.exports.validateSendOtp = () => {
    return [
        check('keyUser').trim().not().isEmpty().withMessage('Email or Mobile number required'),
        check('otpType').trim().not().isEmpty().withMessage('Otp type required'),
    ];
}

module.exports.validateVerifyOtp = () => {
    return [
        check('keyUser').trim().not().isEmpty().withMessage('Email or Mobile number required'),
        check('otpType').trim().not().isEmpty().withMessage('Otp type required'),
        check('otp').trim().not().isEmpty().withMessage('Otp is required'),
    ];
}

module.exports.validateForgot = () => {
    return [
        check('keyUser').trim().not().isEmpty().withMessage('Email or User Id required'),
        check('forgotType').trim().not().isEmpty().withMessage('Required'),
    ];
}


module.exports.validateChangePassword = () => {
    return [
        check('keyPassword').trim().not().isEmpty().withMessage('Password required'),
        check('otp').trim().not().isEmpty().withMessage('OTP required'),
        check('newPassword').trim().not().isEmpty().withMessage('New Password required').isLength({ min: 8, max: 20 }).withMessage('Password required minimum 8 characher').matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,20}$/).withMessage('Check a password between 8 to 20 characters which contain at least one lowercase letter, one uppercase letter, one numeric digit, and one special character'),
    ];
};