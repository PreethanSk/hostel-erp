const { v1: uuidv1, v4: uuidv4, v5: uuidv5 } = require('uuid');
const crypto = require('crypto');
const moment = require("moment");
const { formatResponse } = require("../helpers/utility.helper");
const db = require("../models");
const { verifyCandidateOTP, verifyAdminOTP } = require("../helpers/otp.helper");
const { Op } = require("sequelize");
const userSessionModel = db.UserSessions;


exports.verifyEmailMobileOtpLogin = async (req, res, next) => {
    let responseError = {}
    try {
        const userData = await db.Users.findOne({
            where: {
                [Op.or]: [
                    { emailAddress: req.query.keyUser },
                    { mobileNumber: req.query.keyUser }
                ]
            },
            include: [
                {
                    model: db.BranchDetails,
                    as: 'BranchDetails',
                    attributes: ['id', 'branchName'],
                    required: false
                }
            ]
        })
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

        const otpStatus = await verifyAdminOTP(userData.id, req.query.otpType, req.query.otp, loginType);
        if (otpStatus.status === 'invalid') {
            if (!otpStatus.mobileOtp) {
                responseError.mobileOTP = 'Invalid OTP';
            }

            if (!otpStatus.emailOtp) {
                responseError.emailOTP = 'Invalid OTP';
            }
            if (otpStatus?.expiredAt) {
                responseError.emailOTP = 'OTP expired';
                responseError.mobileOTP = 'OTP expired';
            }

            return res.status(400).json(await formatResponse.error(responseError));
        }
        const verifiedAt = moment().format('YYYY-MM-DD HH:mm:ss')
        if (otpStatus.emailOtp) {
            await db.Users.update(
                { emailVerifiedAt: verifiedAt },
                { where: { id: userData.id } }
            )
        } else if (otpStatus.emailOtp) {
            await db.Users.update(
                { mobileVerifiedAt: verifiedAt },
                { where: { id: userData.id } }
            )
        }
        const secret = userData.id + '!@#$%0o%988';
        const accessKey = userData.id + '-' + uuidv4({}, null, 0);
        const accessKeyHash = crypto.createHmac('sha256', secret).update(accessKey).digest('hex');
        const accessToken = uuidv5(accessKeyHash, uuidv4({}, null, 0), null, 0);
        const accessTokenHash = crypto.createHmac('sha256', secret).update(accessToken).digest('hex');
        const accessTokenFinal = uuidv1({}, null, 0) + '-' + accessTokenHash + '-' + crypto.randomBytes(20).toString('hex') + '-' + uuidv4({}, null, 0);

        const sessionData = {
            userId: userData.id,
            ipAddress: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
            userAgent: req.get('User-Agent'),
            accessKey: accessKeyHash,
            accessToken: accessTokenFinal,
            lastActivity: moment()
        };

        const newSession = await userSessionModel.create(sessionData);

        const response = {
            accessToken: newSession.accessToken,
            id: userData.id,
            roleId: userData.userRoleId,
            emailAddress: userData.emailAddress,
            firstName: userData.firstName,
            lastName: userData.lastName,
            name: (userData.firstName || '') + ' ' + (userData?.lastName || ''),
            lastLogin: newSession.createdAt,
            profilePic: userData.profilePic
        };

        if (userData.branchId && userData.BranchDetails) {
            response.branchId = userData.branchId;
            response.branchName = userData.BranchDetails.branchName;
        }

        return res.cookie('accessKey', newSession.accessKey, { httpOnly: true }).json(await formatResponse.success(response));

    } catch (error) {
        if (global.config.debugger === true) {
            console.error(error.message)
        }
        res.status(400).json(await formatResponse.error())

    }
}

exports.verifyCandidateEmailMobileOtp = async (req, res, next) => {
    let responseError = {}
    try {
        const candidateData = await db.CandidateDetails.findOne({
            where: {
                [Op.or]: [
                    { email: req.query.keyUser },
                    { mobileNumber: req.query.keyUser }
                ]
            },
        })
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

        const otpStatus = await verifyCandidateOTP(candidateData?.id, req.query.otpType, req.query.otp, loginType);
        if (otpStatus.status === 'invalid') {
            if (!otpStatus.mobileOtp) {
                responseError.mobileOTP = 'Invalid OTP';
            }

            if (!otpStatus.emailOtp) {
                responseError.emailOTP = 'Invalid OTP';
            }
            if (otpStatus?.expiredAt) {
                responseError.emailOTP = 'OTP expired';
                responseError.mobileOTP = 'OTP expired';
            }

            return res.status(400).json(await formatResponse.error(responseError));
        }

        if (req.query.otpType === "register") {
            return res.status(200).json({ status: 'success', msg: "OTP Verified" });
        }

        const verifiedAt = moment().format('YYYY-MM-DD HH:mm:ss')
        await db.CandidateDetails.update(
            { emailVerifiedAt: verifiedAt, mobileVerifiedAt: verifiedAt },
            { where: { id: candidateData.id } }
        )
        const secret = candidateData.id + '!@#$%0o%988';
        const accessKey = candidateData.id + '-' + uuidv4({}, null, 0);
        const accessKeyHash = crypto.createHmac('sha256', secret).update(accessKey).digest('hex');
        const accessToken = uuidv5(accessKeyHash, uuidv4({}, null, 0), null, 0);
        const accessTokenHash = crypto.createHmac('sha256', secret).update(accessToken).digest('hex');
        const accessTokenFinal = uuidv1({}, null, 0) + '-' + accessTokenHash + '-' + crypto.randomBytes(20).toString('hex') + '-' + uuidv4({}, null, 0);

        const sessionData = {
            userId: candidateData.id,
            ipAddress: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
            userAgent: req.get('User-Agent'),
            accessKey: accessKeyHash,
            accessToken: accessTokenFinal,
            lastActivity: moment()
        };

        const newSession = await userSessionModel.create(sessionData);

        const response = {
            accessToken: newSession.accessToken,
            id: candidateData.id,
            emailAddress: candidateData.email,
            mobileNumber: candidateData.mobileNumber,
            name: candidateData.name,
            lastLogin: newSession.createdAt,
            profilePic: global.config.serverHost + '/api/user/images/profile-pic.png'
        };

        return res.cookie('accessKey', newSession.accessKey, { httpOnly: true }).json(await formatResponse.success(response));

    } catch (error) {
        if (global.config.debugger === true) {
            console.error(error.message)
        }
        res.status(400).json(await formatResponse.error())

    }
}