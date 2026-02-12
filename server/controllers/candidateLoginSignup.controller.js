const { v1: uuidv1, v4: uuidv4, v5: uuidv5 } = require('uuid');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const moment = require("moment");
const { formatResponse } = require("../helpers/utility.helper");
const { Op, col } = require("sequelize");
const { sendUserOTP, verifyEmailMobileOTP } = require("../helpers/otp.helper");
const db = require('../models');
const { getPagination, getPagingData } = require('../helpers/pagination.helper');
// const client = require('../config/redisConnect');


// exports.candidateLogin = async (req, res) => {
//     try {
//         let responseError = {};
//         const userData = await db.Users.findOne({
//             where: {
//                 [Op.or]: [
//                     { emailAddress: req.body.keyUser },
//                     { mobileNumber: req.body.keyUser }
//                 ]
//             }
//         });


//         if (!userData.isActive) {
//             responseError.keyUser = 'Your account is blocked';
//             return res.status(400).json(await formatResponse.error(responseError));
//         }
//         const match = await bcrypt.compare(req.body.keyPassword, userData.keyPassword);
//         if (!match) {
//             responseError.keyPassword = 'Password did not match your account';
//             return res.status(400).json(await formatResponse.error(responseError));
//         }

//         let emailAndMobileVerify = true;
//         let message = 'OTP has been sent to registered mobile number';

//         if (userData.emailVerifiedAt === null || userData.mobileVerifiedAt === null) {
//             emailAndMobileVerify = false;
//             await sendUserOTP(userData.id, userData.countryId, userData.mobileNumber, userData.emailAddress, userData.fullName, 'LoginEmailMobileVerifyOTP');
//             message = 'OTP has been sent to registered mobile number and Email ID';
//             const response = {
//                 uniqueId: userData.uniqueId,
//                 emailAndMobileVerify,
//                 message: message
//             };
//             return res.json(await formatResponse.success(response));
//         } else {
//             await db.UserSessions.update(
//                 { logoutAt: moment() },
//                 {
//                     where: {
//                         userId: userData.id,
//                         deviceType: 'WEB',
//                         logoutAt: { [Op.eq]: null },
//                     },
//                 }
//             )
//             // await sendUserOTP(userData.id, userData.countryId, userData.mobileNumber, userData.emailAddress, userData.fullName, 'loginOTP', true, 'Your HostelHost login verification OTP is:');
//             // message = 'OTP has been sent to registered mobile number';
//             const secret = userData.uniqueId + '!@#$%0o%988';
//             const accessKey = userData.uniqueId + '-' + uuidv4({}, null, 0);
//             const accessKeyHash = crypto.createHmac('sha256', secret).update(accessKey).digest('hex');
//             const accessToken = uuidv5(accessKeyHash, uuidv4({}, null, 0), null, 0);
//             const accessTokenHash = crypto.createHmac('sha256', secret).update(accessToken).digest('hex');
//             const accessTokenFinal = uuidv1({}, null, 0) + '-' + accessTokenHash + '-' + crypto.randomBytes(20).toString('hex') + '-' + uuidv4({}, null, 0);

//             const sessionData = {
//                 userId: userData.id,
//                 ipAddress: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
//                 userAgent: req.get('User-Agent'),
//                 accessKey: accessKeyHash,
//                 accessToken: accessTokenFinal,
//                 lastActivity: moment(),
//                 deviceType: 'WEB'
//             };

//             const newSession = await db.UserSessions.create(sessionData);
//             const country = await countryModel.findOne({
//                 where: { id: userData?.countryId },
//             });
//             const response = {
//                 accessToken: newSession.accessToken,
//                 uniqueId: userData.uniqueId,
//                 emailAddress: userData.emailAddress,
//                 firstName: userData.firstName,
//                 lastName: userData.lastName,
//                 name: userData.fullName,
//                 lastLogin: newSession.createdAt,
//                 emailAndMobileVerify: true,
//                 profilePic: global.config.serverHost + 'api/user/images/profile-pic.png'
//             };

//             // await client.set(newSession.accessToken, JSON.stringify(newSession));
//             return res.cookie('accessKey', newSession.accessKey, { httpOnly: true }).json(await formatResponse.success(response));
//         }
//         // const response = {
//         //     uniqueId: userData.uniqueId,
//         //     emailAndMobileVerify,
//         //     message : message
//         // };
//         // return res.json(await formatResponse.success(response));
//     } catch (e) {
//         console.log(e);
//         return res.status(400).json(await formatResponse.error());
//     }
// }

exports.candidateLogout = async (req, res) => {
    try {
        await db.UserSessions.update({ logoutAt: moment() }, { where: { userId: req.userId } })
        // await client.del(req.bearerToken)
        //if (sessionExpired) 
        return res.status(200).json(await formatResponse.success('logout'))

    } catch (e) {
        console.log(e)
        return res.status(400).json(await formatResponse.error())
    }
}

exports.candidateDeactivate = async (req, res) => {
    try {
        if (!req.query.userId) {
            return res.status(400).json(await formatResponse.error("UserId params missing"))
        }
        await db.CandidateDetails.update({ isActive: req.query.isActive }, { where: { id: req.query.userId } })
        return res.status(200).json(await formatResponse.success(req.query.isActive ? 'Re-activated' : 'Deactivated'))
    } catch (e) {
        console.log(e)
        return res.status(400).json(await formatResponse.error())
    }
}

exports.candidateLoginOtp = async (req, res, next) => {
    try {
        let responseError = {};
        const candidateData = await db.CandidateDetails.findOne({
            where: {
                [Op.or]: [
                    { email: req.query.keyUser },
                    { mobileNumber: req.query.keyUser }
                ]
            }
        });
        
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(req.query.keyUser);
        const isMobile = /^\d{6,15}$/.test(req.query.keyUser);
        let loginType = ''
        if (isEmail) {
            loginType = 'Email';
        } else if (isMobile) {
           loginType = 'Mobile';
        } else {
            responseError.message = 'Invalid input format';
            return res.status(400).json(await formatResponse.error(responseError))
        }


        let MobileNumber = '', Email = '';
        if (req.query.otpType === "register") {
            MobileNumber = /^\d+$/.test(req.query.keyUser) ? req.query.keyUser : ''
            Email = /^\d+$/.test(req.query.keyUser) ? '' : req.query.keyUser
            if (candidateData) {
                responseError.message = 'Candidate already registered';
                return res.status(400).json(await formatResponse.error(responseError));
            }
        } else if (req.query.otpType === "login") {
            MobileNumber = candidateData?.mobileNumber;
            Email = candidateData?.email;
            if (!candidateData) {
                responseError.message = 'Candidate not registered';
                return res.status(400).json(await formatResponse.error(responseError));
            }
            if (!candidateData?.isActive) {
                responseError.message = 'Candidate deactivated';
                return res.status(400).json(await formatResponse.error(responseError));
            }
        }

        const response = await sendUserOTP(null, MobileNumber, Email, candidateData?.id, req.query.otpType, `Your verification OTP is sent to registered ${loginType}:`, loginType);
        if (response) {
            return res.status(200).json({ status: 'success', msg: "OTP Generated" });
        } else {
            return res.status(400).json({ status: 'error', msg: response });
        }
    } catch (error) {
        if (global.config.debugger === true) {
            console.error(error.message)
        }
        return res.status(400).json({ status: 'failure', msg: error.message });
    }
};