const {check}                = require("express-validator");
const db                     = require("../models");
const userModel              = db.Users;

module.exports.validateEmailMobileOTP = () => {
    return [
        check('refId').trim().isAlphanumeric().withMessage('Required valid user id').custom(value => {
            return userModel.findOne({where: {uniqueId: value}}).then(result => {
                if (!result) return Promise.reject('User not found');
            });
        }),
        check('mobileOTP').trim().isNumeric().withMessage('Required valid OTP'),
        check('emailOTP').trim().isNumeric().withMessage('Required valid OTP')
    ];
}

module.exports.validateOtp = () => {
    return [
        check('refId').trim().isAlphanumeric().withMessage('Required valid user id').custom(value => {
            return userModel.findOne({where: {uniqueId: value}}).then(result => {
                if (!result) return Promise.reject('User not found');
            });
        }),
        check('mobileOTP').trim().isNumeric().withMessage('Required valid OTP')
    ];
}