const { v1: uuidv1, v4: uuidv4, v5: uuidv5 } = require('uuid');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const moment = require("moment");
const { formatResponse } = require("../helpers/utility.helper");
const { Op, col } = require("sequelize");
const { sendUserOTP } = require("../helpers/otp.helper");
const db = require('../models');
const { getPagination, getPagingData } = require('../helpers/pagination.helper');
// const client = require('../config/redisConnect');
const Users = db.Users;
const UserSessions = db.UserSessions;

exports.userLogin = async (req, res) => {
    try {
        let responseError = {};
        const userData = await Users.findOne({
            where: {
                [Op.or]: [
                    { emailAddress: req.body.keyUser },
                    { mobileNumber: req.body.keyUser }
                ]
            }
        });


        if (!userData.isActive) {
            responseError.keyUser = 'Your account is blocked';
            return res.status(400).json(await formatResponse.error(responseError));
        }
        const match = await bcrypt.compare(req.body.keyPassword, userData.keyPassword);
        if (!match) {
            responseError.keyPassword = 'Password did not match your account';
            return res.status(400).json(await formatResponse.error(responseError));
        }

        let emailAndMobileVerify = true;
        let message = 'OTP has been sent to registered mobile number';
        if (userData.emailVerifiedAt === null || userData.mobileVerifiedAt === null) {
            emailAndMobileVerify = false;
            await sendUserOTP(userData.id, userData.mobileNumber, userData.emailAddress, userData.fullName, 'LoginEmailMobileVerifyOTP');
            message = 'OTP has been sent to registered mobile number and Email ID';
            const response = {
                uniqueId: userData.uniqueId,
                emailAndMobileVerify,
                message: message
            };
            return res.json(await formatResponse.success(response));
        } else {
            await UserSessions.update(
                { logoutAt: moment() },
                {
                    where: {
                        userId: userData.id,
                        deviceType: 'WEB',
                        logoutAt: { [Op.eq]: null },
                    },
                }
            )
            // await sendUserOTP(userData.id, userData.countryId, userData.mobileNumber, userData.emailAddress, userData.fullName, 'loginOTP', true, 'Your SLH login verification OTP is:');
            // message = 'OTP has been sent to registered mobile number';
            const secret = userData.uniqueId + '!@#$%0o%988';
            const accessKey = userData.uniqueId + '-' + uuidv4({}, null, 0);
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
                lastActivity: moment(),
                deviceType: 'WEB'
            };

            const newSession = await UserSessions.create(sessionData);
            const country = await countryModel.findOne({
                where: { id: userData?.countryId },
            });
            const response = {
                accessToken: newSession.accessToken,
                uniqueId: userData.uniqueId,
                emailAddress: userData.emailAddress,
                firstName: userData.firstName,
                lastName: userData.lastName,
                name: (userData?.firstName || '') + ' ' + (userData?.lastName || ''),
                lastLogin: newSession.createdAt,
                emailAndMobileVerify: true,
                profilePic: global.config.serverHost + '/api/user/images/profile-pic.png'
            };

            // await client.set(newSession.accessToken, JSON.stringify(newSession));
            return res.cookie('accessKey', newSession.accessKey, { httpOnly: true }).json(await formatResponse.success(response));
        }
        // const response = {
        //     uniqueId: userData.uniqueId,
        //     emailAndMobileVerify,
        //     message : message
        // };
        // return res.json(await formatResponse.success(response));
    } catch (e) {
        console.log(e);
        return res.status(400).json(await formatResponse.error());
    }
}

exports.userLogout = async (req, res) => {
    try {
        await UserSessions.update({ logoutAt: moment() }, { where: { userId: req.userId } })
        // await client.del(req.bearerToken)
        //if (sessionExpired) 
        return res.status(200).json(await formatResponse.success('logout'))

    } catch (e) {
        console.log(e)
        return res.status(400).json(await formatResponse.error())
    }
}

exports.getUserGridList = async (req, res) => {
    try {
        const { page, size } = req.query
        const { limit, offset } = getPagination(page, size)
        const result = await Users.findAndCountAll({
            attributes: {
                include: [
                    [col("MasterUserRoles.roleName"), "roleName"],
                    [col("BranchDetails.branchName"), "branchName"]
                ],
            },
            include: [
                {
                    model: db.MasterUserRoles,
                    as: "MasterUserRoles",
                    attributes: []
                },
                {
                    model: db.BranchDetails,
                    as: "BranchDetails",
                    attributes: []
                },
            ],
            limit,
            offset,
            order: [['createdAt', 'DESC']]
        });
        return res.status(200).json(await formatResponse.success(getPagingData(result, page, limit)));
    } catch (error) {
        console.log(error);
        res.status(400).json(await formatResponse.error(error));
    }
};

exports.userRegister = async (req, res, next) => {
    try {
        const body = {
            id: req.body.id || 0,
            userRoleId: req.body.userRoleId,
            branchId: req.body.branchId,
            isActive: req.body.isActive || false,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            emailAddress: req.body.emailAddress,
            mobileNumber: req.body.mobileNumber,
            emailVerifiedAt: moment(),
            mobileVerifiedAt: moment(),
            activatedAt: moment()
        };

        let insertResponse = null;
        if (body?.id) {
            insertResponse = await Users.update(body, {
                where: { id: body?.id },
            });
        } else {
            insertResponse = await Users.create(body);
        }
        if (insertResponse) {
            return res
                .status(body?.id ? 200 : 201)
                .json(
                    await formatResponse.success(
                        body?.id ? "Updated Successfully" : "Inserted Successfully"
                    )
                );
        } else {
            return res.status(400).json(await formatResponse.error(insertResponse));
        }
    } catch (error) {
        console.log(error);
        return res.status(400).json(await formatResponse.error(error));
    }
};


exports.userSendOtp = async (req, res, next) => {
    try {
        let responseError = {};
        const userData = await Users.findOne({
            where: {
                [Op.or]: [
                    { emailAddress: req.query.keyUser },
                    { mobileNumber: req.query.keyUser }
                ]
            }
        });

         if (!userData) {
            responseError.message = 'User not registered';
            return res.status(400).json(await formatResponse.error(responseError));
        }
        if (!userData?.isActive) {
            responseError.message = 'User deactivated';
            return res.status(400).json(await formatResponse.error(responseError));
        }

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


        const response = await sendUserOTP(userData.id, userData.mobileNumber, userData.emailAddress, null, req.query.otpType, `Your verification OTP is sent to registered ${loginType}:`, loginType);
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


exports.bulkUploadUsers = async (req, res) => {
  try {
    const { data } = req.body;

    if (!data || !Array.isArray(data) || data.length === 0) {
      return res.status(400).json(
        await formatResponse.error("No data provided for bulk upload")
      );
    }

    let successCount = 0;
    let errorCount = 0;
    let updateCount = 0;
    let insertCount = 0;
    const errors = [];
    const processedData = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNum = i + 1;

      try {
        
        const missingFields = [];
        if (!row.firstName || !row.firstName.toString().trim()) {
          missingFields.push("firstName");
        }
        if (!row.lastName || !row.lastName.toString().trim()) {
          missingFields.push("lastName");
        }
        if (!row.emailAddress || !row.emailAddress.toString().trim()) {
          missingFields.push("emailAddress");
        }
        if (!row.mobileNumber || !row.mobileNumber.toString().trim()) {
          missingFields.push("mobileNumber");
        }

        if (missingFields.length > 0) {
          errors.push({
            row: rowNum,
            error: `Required field(s) missing: ${missingFields.join(", ")}`,
            data: row,
          });
          errorCount++;
          continue;
        }

        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const emailAddress = row.emailAddress.toString().trim();
        if (!emailRegex.test(emailAddress)) {
          errors.push({
            row: rowNum,
            error: `Invalid email format: ${emailAddress}`,
            data: row,
          });
          errorCount++;
          continue;
        }

        
        const mobileNumber = row.mobileNumber.toString().trim();
        if (!/^\d{6,15}$/.test(mobileNumber)) {
          errors.push({
            row: rowNum,
            error: `Invalid mobile number format: ${mobileNumber}. Mobile number should be 6-15 digits.`,
            data: row,
          });
          errorCount++;
          continue;
        }

        
        if (row.userRoleId) {
          const userRole = await db.MasterUserRoles.findByPk(row.userRoleId);
          if (!userRole) {
            errors.push({
              row: rowNum,
              error: `User role with ID ${row.userRoleId} does not exist`,
              data: row,
            });
            errorCount++;
            continue;
          }
        }

        
        if (row.branchId) {
          const branch = await db.BranchDetails.findByPk(row.branchId);
          if (!branch) {
            errors.push({
              row: rowNum,
              error: `Branch with ID ${row.branchId} does not exist`,
              data: row,
            });
            errorCount++;
            continue;
          }
        }

        
        const userData = {
          id: row.id || 0,
          userRoleId: row.userRoleId || null,
          branchId: row.branchId || null,
          firstName: row.firstName?.toString()?.trim() || null,
          middleName: row.middleName?.toString()?.trim() || null,
          lastName: row.lastName?.toString()?.trim() || null,
          emailAddress: emailAddress,
          mobileNumber: mobileNumber,
          profilePic: row.profilePic?.toString()?.trim() || null,
          isActive: row.isActive !== undefined ? row.isActive : true,
        };

        
        const duplicateEmail = await Users.findOne({
          where: { emailAddress: userData.emailAddress },
        });

        if (duplicateEmail) {
         
          if (userData.id && duplicateEmail.id === userData.id) {
           
          } else {
            
            errors.push({
              row: rowNum,
              error: `Email address "${userData.emailAddress}" already exists. Email addresses must be unique.`,
              data: row,
            });
            errorCount++;
            continue;
          }
        }

        
        const duplicateMobile = await Users.findOne({
          where: { mobileNumber: userData.mobileNumber },
        });

        if (duplicateMobile) {
         
          if (userData.id && duplicateMobile.id === userData.id) {
           
          } else {
           
            errors.push({
              row: rowNum,
              error: `Mobile number "${userData.mobileNumber}" already exists. Mobile numbers must be unique.`,
              data: row,
            });
            errorCount++;
            continue;
          }
        }

        
        let existingUser = null;
        if (userData.id && userData.id > 0) {
          existingUser = await Users.findByPk(userData.id);
          if (!existingUser) {
            errors.push({
              row: rowNum,
              error: `User with ID ${userData.id} does not exist`,
              data: row,
            });
            errorCount++;
            continue;
          }
        }

        if (existingUser) {
          
          await Users.update(userData, {
            where: { id: existingUser.id },
          });
          updateCount++;
          processedData.push({
            row: rowNum,
            id: existingUser.id,
            emailAddress: existingUser.emailAddress,
            action: "updated",
          });
        } else {
         
          const result = await Users.create(userData);
          insertCount++;
          processedData.push({
            row: rowNum,
            id: result.id,
            emailAddress: result.emailAddress,
            action: "inserted",
          });
        }

        successCount++;
      } catch (rowError) {
        console.error(`Error processing row ${rowNum}:`, rowError);
        errors.push({
          row: rowNum,
          error: rowError.message || "Unknown error",
          data: row,
        });
        errorCount++;
      }
    }

    return res.status(200).json(
      await formatResponse.success({
        message: "Bulk upload completed",
        summary: {
          total: data.length,
          success: successCount,
          error: errorCount,
          inserted: insertCount,
          updated: updateCount,
        },
        processedData: processedData,
        errors: errors.length > 0 ? errors : undefined,
      })
    );
  } catch (error) {
    console.error("Bulk upload error:", error);
    return res.status(500).json(
      await formatResponse.error(error.message || "Bulk upload failed")
    );
  }
};