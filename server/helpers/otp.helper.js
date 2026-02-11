const db = require("../models");
const { sendSmsOTP, verifySmsOTP } = require("./sms.helper");
const { sendEmailOTP } = require("./email.helper");
const moment = require("moment");
const { Op } = require("sequelize");
require("dotenv").config();

module.exports.sendUserOTP = async (userId = null, mobileNumber = '', emailAddress = '', candidateId = null, refType = '', message = '', loginType = '') => {
    try {
        console.log(userId, mobileNumber, emailAddress, candidateId, refType, message, loginType)

        const otp = generateOTP();
        const [userOtp, createdOtp] = await db.UserOtp.findOrCreate({
            where: { userId: userId, candidateId: candidateId, isVerified: false, },
            defaults: {
                mobileOtp: loginType === 'Mobile' ? 123456 : '',
                emailOtp: loginType === 'Email' ? otp : '',
                expiredAt: moment().add(Number(process.env.SMS_OTP_EXPIRY || '10'), 'minutes'),
                otpRefType: refType,
                mobileNumber: mobileNumber,
                emailId: emailAddress,
                otpRequest: JSON.stringify({ email: emailAddress, mobile: mobileNumber }),
                reSendCount: 0,
            }
        });

        if (!createdOtp) {
            if (loginType === 'Mobile') {
                await userOtp.update({
                    mobileNumber: mobileNumber,
                    emailOtp: loginType === 'Email' ? otp : '',
                    expiredAt: moment().add(Number(process.env.SMS_OTP_EXPIRY || '10'), 'minutes'),
                    reSendCount: userOtp.reSendCount + 1,
                });
            } else {
                await userOtp.update({
                    emailId: emailAddress,
                    mobileOtp: loginType === 'Mobile' ? 123456 : '',
                    emailOtp: loginType === 'Email' ? otp : '',
                    expiredAt: moment().add(Number(process.env.SMS_OTP_EXPIRY || '10'), 'minutes'),
                    reSendCount: userOtp.reSendCount + 1,
                });
            }
        }

        (async () => {
            try {
                if (loginType === 'Mobile' && mobileNumber) {
                    const otpResponse = true //await sendSmsOTP('91' + mobileNumber);
                    console.log("OTP response:::", otpResponse)
                    await userOtp.update({
                        mobileOtp: 123456 || otpResponse?.message || '',
                        otpRequestResponse: JSON.stringify({ status: 'sent', at: new Date() }),
                    });
                } else if (loginType === 'Email' && emailAddress) {
                    // await sendEmailOTP({ email: emailAddress }, otp, message);
                    await userOtp.update({
                        otpRequestResponse: JSON.stringify({ status: 'sent', at: new Date() }),
                    });
                }

                // Optional: update the OTP record with send status (async)
            } catch (sendErr) {
                console.error('OTP sending failed:', sendErr.message);
                await userOtp.update({
                    otpRequestResponse: JSON.stringify({ status: 'failed', error: sendErr.message }),
                });
            }
        })();
        return { success: true, msg: 'OTP queued for sending' };

        let emailMessage = message;
        let otpMessage = message;

        if (refType === 'login') {
            emailMessage = 'Your HostelHost register email verification OTP is given below.';
            otpMessage = 'Your HostelHost mobile number verification code is:';
        }
        if (refType === 'register') {
            emailMessage = 'Thank you for register HostelHost. Your email verification OTP is given below.';
            otpMessage = 'Your HostelHost mobile number verification code is:';
        }

        const mobileWithCode = '91' + mobileNumber.toString();
        let smsResponse = null;
        let emailResponse = null;
        // if (loginType === 'Mobile') {
        //     smsResponse = await sendSmsOTP(mobileWithCode, otp);
        // } else {
        //     emailResponse = await sendEmailOTP({ email: emailAddress }, otp, emailMessage);
        // }

        console.log(emailResponse)
        const otpRequest = { email: emailAddress, mobile: mobileNumber, };
        const otpRequestResponse = { sms: smsResponse, email: emailResponse };

        let reSendCount = 0;
        if (!createdOtp) {
            reSendCount = userOtp.reSendCount + 1;
        }
        return await userOtp.update({
            otpRequest: JSON.stringify(otpRequest),
            otpRequestResponse: JSON.stringify(otpRequestResponse),
            reSendCount: reSendCount,
            expiredAt: moment().add(Number(process.env.SMS_OTP_EXPIRY || '10'), 'minutes'),
            otpRefType: refType,
            mobileNumber: mobileNumber,
            emailId: emailAddress,
        });
    } catch (error) {
        if (global.config.debugger === true) {
            console.error(error.message)
        }
        return error.message;
    }
}

function generateOTP(length = 6) {
    return 123456
    return Math.floor(Math.pow(10, length - 1) + Math.random() * 9 * Math.pow(10, length - 1)).toString();
}

module.exports.verifyAdminOTP = async (userId, otpRefType, otp = null, loginType) => {
    let response = {
        status: 'invalid',
        mobileOtp: false,
        emailOtp: false,
        expiredAt: false,
    }
    try {
        const otpData = await db.UserOtp.findOne({
            where: {
                userId: userId,
                otpRefType: otpRefType,
                isVerified: false,
                [Op.or]: {
                    userId: userId,
                    // mobileOtp: otp,
                    // emailOtp: otp,
                },
            },
        })



        if (!otpData) {
            return response
        }

        // if (moment.utc().toDate() > otpData.expiredAt) {
        if (moment().isAfter(moment(otpData.expiredAt))) {
            response.expiredAt = true
            return response;
        }


        if (loginType === 'Mobile') {
            if (otpData.mobileOtp?.length > 6) {
                const mobileOtp = await verifySmsOTP(otpData.mobileOtp, otp)
                if (mobileOtp?.type === 'success') {
                    response.mobileOtp = true
                }
            } else if (otpData.mobileOtp === otp) {
                response.mobileOtp = true
            }
        } else {
            if (otpData.emailOtp === otp) {
                response.emailOtp = true
            }
        }


        if (otp) {
            if (response.mobileOtp || response.emailOtp) {
                response.status = 'verified'
            }
        }

        if (response.status === 'verified') {
            const verifiedAt = moment().format('YYYY-MM-DD HH:mm:ss')
            await otpData.update({ isVerified: true, verifiedAt: verifiedAt, otpVerifyResponse: JSON.stringify(response) })
        }

        return response
    } catch (error) {
        console.log(error.message);
        return response;
    }

}
module.exports.verifyCandidateOTP = async (candidateId = null, otpRefType, otp = null, loginType) => {
    let response = { status: 'invalid', mobileOtp: false, emailOtp: false, }
    try {
        const otpData = await db.UserOtp.findOne({
            where: {
                candidateId: candidateId,
                otpRefType: otpRefType,
                isVerified: false,
                [Op.or]: [
                    { candidateId: candidateId },
                    // { emailOtp: otp },
                ],
            },
        })
        if (!otpData) {
            return response
        }

        if (moment().isAfter(moment(otpData.expiredAt))) {
            response.expiredAt = true
            return response;
        }

        if (loginType === 'Mobile') {
            if (otpData.mobileOtp?.length > 6) {
                const mobileOtp = await verifySmsOTP(otpData.mobileOtp, otp)
                if (mobileOtp?.type === 'success') {
                    response.mobileOtp = true
                }
            } else if (otpData.mobileOtp === otp) {
                response.mobileOtp = true
            }
        } else {
            if (otpData.emailOtp === otp) {
                response.emailOtp = true
            }
        }

        if (otp) {
            if (response.mobileOtp || response.emailOtp) {
                response.status = 'verified'
            }
        }

        if (response.status === 'verified') {
            const verifiedAt = moment().format('YYYY-MM-DD HH:mm:ss')
            await otpData.update({ isVerified: true, verifiedAt: verifiedAt, otpVerifyResponse: JSON.stringify(response) })
        }

        return response
    } catch (error) {
        console.log(error);
        return response;
    }

}

module.exports.sendServiceProviderOTP = async (serviceProviderId = null, mobileNumber = '', refType = '', message = '') => {
    try {
        console.log(serviceProviderId, mobileNumber, refType, message)

        const mobileOTP = 123456 //generateOTP();
        const whereCondition = serviceProviderId
            ? { serviceProviderId: serviceProviderId, isVerified: false }
            : { mobileNumber: mobileNumber, isVerified: false };

        const [serviceProviderOtp, createdOtp] = await db.ServiceProviderOtp.findOrCreate({
            where: whereCondition,
            defaults: {
                mobileOtp: mobileOTP,
                serviceProviderId: serviceProviderId,
                expiredAt: moment().add(Number(process.env.SMS_OTP_EXPIRY || '10'), 'minutes'),
                otpRefType: refType,
                mobileNumber: mobileNumber,
                otpRequest: JSON.stringify({ mobile: mobileNumber }),
                reSendCount: 0,
            }
        });

        if (!createdOtp) {
            await serviceProviderOtp.update({
                mobileOtp: mobileOTP,
                mobileNumber: mobileNumber,
                expiredAt: moment().add(Number(process.env.SMS_OTP_EXPIRY || '10'), 'minutes'),
                reSendCount: serviceProviderOtp.reSendCount + 1,
            });
        }
        (async () => {
            try {
                const otpResponse = true //await sendSmsOTP('91' + mobileNumber);
                await serviceProviderOtp.update({
                    mobileOtp: 123456 || otpResponse?.message || '',
                    otpRequestResponse: JSON.stringify({ status: 'sent', at: new Date() }),
                });
                // Optional: update the OTP record with send status (async)
            } catch (sendErr) {
                console.error('OTP sending failed:', sendErr.message);
                await serviceProviderOtp.update({
                    otpRequestResponse: JSON.stringify({ status: 'failed', error: sendErr.message }),
                });
            }
        })();
        return { success: true, msg: 'OTP queued for sending' };

    } catch (error) {
        if (global.config.debugger === true) {
            console.error(error.message)
        }
        return error.message;
    }
}

module.exports.verifyServiceProviderOTP = async (serviceProviderId = null, mobileNumber = null, otpRefType, otp = null) => {
    let response = { status: 'invalid', mobileOtp: false, expiredAt: false, }
    try {
        const whereCondition = serviceProviderId
            ? { serviceProviderId: serviceProviderId, otpRefType: otpRefType, isVerified: false, mobileOtp: otp }
            : { mobileNumber: mobileNumber, otpRefType: otpRefType, isVerified: false, mobileOtp: otp };

        const otpData = await db.ServiceProviderOtp.findOne({
            where: {
                serviceProviderId: serviceProviderId,
                otpRefType: otpRefType,
                isVerified: false,
                [Op.or]: {
                    serviceProviderId: serviceProviderId,
                },
            },
        })
        if (!otpData) {
            return response
        }

        if (moment().isAfter(moment(otpData.expiredAt))) {
            response.expiredAt = true
            return response;
        }

        if (otpData.mobileOtp?.length > 6) {
            const mobileOtp = await verifySmsOTP(otpData.mobileOtp, otp)
            if (mobileOtp?.type === 'success') {
                response.mobileOtp = true
            }
        } else if (otpData.mobileOtp === otp) {
            response.mobileOtp = true
        }

        if (otp) {
            if (response.mobileOtp) {
                response.status = 'verified'
            }
        }

        if (response.status === 'verified') {
            const verifiedAt = moment().format('YYYY-MM-DD HH:mm:ss')
            await otpData.update({ isVerified: true, verifiedAt: verifiedAt, otpVerifyResponse: JSON.stringify(response) })
        }

        return response
    } catch (error) {
        console.log(error);
        return response;
    }
}