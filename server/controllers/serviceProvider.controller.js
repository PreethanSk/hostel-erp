const { QueryTypes } = require("sequelize");
const { v1: uuidv1, v4: uuidv4, v5: uuidv5 } = require('uuid');
const crypto = require('crypto');
const moment = require("moment");
const { formatResponse } = require("../helpers/utility.helper");
const { sendServiceProviderOTP, verifyServiceProviderOTP } = require("../helpers/otp.helper");
const db = require("../models");

exports.getServiceProviderCategory = async (req, res) => {
    try {
        const response = await db.ServiceProviderCategory.findAll();
        return res.status(200).json(await formatResponse.success(response));
    } catch (error) {
        console.log(error);
        return res.status(400).json(await formatResponse.error(error));
    }
};

exports.insertUpdateServiceProviderCategory = async (req, res) => {
    try {
        const body = {
            id: req.body.id || 0,
            name: req.body.name?.trim(),
            description: req.body.description || null,
            isActive: req.body.isActive !== undefined ? req.body.isActive : true,
        };


        const existing = await db.ServiceProviderCategory.findOne({
            where: {
                name: db.Sequelize.where(
                    db.Sequelize.fn('LOWER', db.Sequelize.col('name')),
                    req.body.name.toLowerCase()
                ),
                ...(body.id ? { id: { [db.Sequelize.Op.ne]: body.id } } : {}),
            },
        });

        if (existing) {
            return res.status(400).json(await formatResponse.error("Name already exists"));
        }

        let insertResponse = null;
        let categoryId = null;
        if (body?.id) {
            insertResponse = await db.ServiceProviderCategory.update(body, { where: { id: body?.id } });
            categoryId = body.id;
        } else {
            insertResponse = await db.ServiceProviderCategory.create(body);
            categoryId = insertResponse.id;
        }
        if (insertResponse) {
            return res.status(body?.id ? 200 : 201).json(
                await formatResponse.success({
                    message: body?.id ? "Updated Successfully" : "Inserted Successfully",
                    categoryId: categoryId,
                })
            );
        } else {
            return res.status(400).json(await formatResponse.error("Insert/Update failed"));
        }
    } catch (error) {
        console.log(error);
        return res.status(400).json(await formatResponse.error(error));
    }
};

exports.getServiceProvider = async (req, res) => {
    try {
        const { search, categoryId, type, page, limit } = req.query;
        let offset = 0;  // Default offset
        let pagination = {};  // Default pagination settings

        // Only apply pagination if `page` and `limit` are provided
        if (page && limit) {
            offset = (page - 1) * limit;
            pagination = { limit: parseInt(limit), offset };
        }

        // Base query to get the total count of service providers (for pagination)
        let countQuery = `
            SELECT COUNT(distinct sp.id) AS totalCount
            FROM SERVICE_PROVIDERS sp
            LEFT JOIN SERVICE_PROVIDER_CATEGORY spc
              ON FIND_IN_SET(spc.id, sp.categories)
            WHERE 1 = 1
        `;

        // Add search filter to count query
        if (search) {
            countQuery += ` AND (sp.name LIKE :search 
                                  OR sp.email LIKE :search 
                                  OR sp.contactPerson LIKE :search 
                                  OR sp.companyName LIKE :search)`;
        }

        // Add category filter to count query
        if (categoryId) {
            countQuery += ` AND FIND_IN_SET(:categoryId, sp.categories)`;
        }

        if (type) {
            countQuery += ` AND sp.type = :type`;
        }

        // Get the total count of matching providers
        const totalCountResult = await db.sequelize.query(countQuery, {
            replacements: {
                search: `%${search || ""}%`,
                categoryId: categoryId || null,
                type: type || null,
            },
            type: QueryTypes.SELECT
        });

        const totalCount = totalCountResult[0].totalCount;

        // Base query to get paged data
        let sql = `
            SELECT sp.id,
                   sp.name,
                   sp.mobile,
                   sp.email,
                   sp.categories,
                   sp.type,
                   sp.companyName,
                   sp.address,
                   sp.gstNumber,
                   sp.contactPerson,
                   sp.rating,
                   sp.isActive,
                   sp.createdAt,
                   sp.updatedAt,
                   GROUP_CONCAT(spc.name) AS categoryNames
            FROM SERVICE_PROVIDERS sp
            LEFT JOIN SERVICE_PROVIDER_CATEGORY spc
              ON FIND_IN_SET(spc.id, sp.categories)
            WHERE 1 = 1
        `;

        // Add search filter to data query
        if (search) {
            sql += ` AND (sp.name LIKE :search 
                        OR sp.email LIKE :search 
                        OR sp.contactPerson LIKE :search 
                        OR sp.companyName LIKE :search)`;
        }

        // Add category filter to data query
        if (categoryId) {
            sql += ` AND FIND_IN_SET(:categoryId, sp.categories)`;
        }

        if (type) {
            sql += ` AND sp.type = :type`;
        }

        // Add pagination to data query only if pagination is applied
        sql += ` GROUP BY sp.id ORDER BY sp.id DESC`;

        if (pagination.limit) {
            sql += ` LIMIT :limit OFFSET :offset`;
        }

        // Get the paged results
        const providers = await db.sequelize.query(sql, {
            replacements: {
                search: `%${search || ""}%`,
                categoryId: categoryId || null,
                limit: pagination.limit || undefined,
                offset: pagination.offset || undefined,
                type: type || null,
            },
            type: QueryTypes.SELECT
        });

        // Calculate total pages if pagination is applied
        const totalPages = pagination.limit ? Math.ceil(totalCount / pagination.limit) : 1;
        const result = {
            data: providers,
            total: totalCount,
            totalPages: totalPages,
            currentPage: page || 1, // Default to 1 if no pagination
            perPage: pagination.limit || totalCount // If no limit, show total count
        }
        // Return response with pagination metadata if pagination is applied, or just the data
        return res.status(200).json(await formatResponse.success(result));
    } catch (error) {
        console.error(error);
        return res.status(400).json(await formatResponse.error(error));
    }
};

exports.insertUpdateServiceProvider = async (req, res) => {
    try {
        const body = {
            id: req.body.id || 0,
            name: req.body.name?.trim(),
            mobile: req.body.mobile,
            email: req.body.email || null,
            categories: req.body.categories || null,
            type: req.body.type || "External",
            companyName: req.body.companyName || null,
            address: req.body.address || null,
            gstNumber: req.body.gstNumber || null,
            contactPerson: req.body.contactPerson || null,
            rating: req.body.rating || null,
            isActive: req.body.isActive !== undefined ? req.body.isActive : true,
        };

        let insertResponse = null;
        let providerId = null;
        if (body?.id) {
            insertResponse = await db.ServiceProvider.update(body, { where: { id: body?.id } });
            providerId = body.id;
        } else {
            insertResponse = await db.ServiceProvider.create(body);
            providerId = insertResponse.id;
        }
        if (insertResponse) {
            return res.status(body?.id ? 200 : 201).json(
                await formatResponse.success({
                    message: body?.id ? "Updated Successfully" : "Inserted Successfully",
                    providerId: providerId,
                })
            );
        } else {
            return res.status(400).json(await formatResponse.error("Insert/Update failed"));
        }
    } catch (error) {
        console.log(error);
        return res.status(400).json(await formatResponse.error(error));
    }
};

exports.generateServiceProviderOtp = async (req, res, next) => {
    try {
        let responseError = {};
        const serviceProviderData = await db.ServiceProvider.findOne({
            where: {
                mobile: req.query.keyUser
            }
        });

        const isMobile = /^\d{6,15}$/.test(req.query.keyUser);
        if (!isMobile) {
            responseError.message = 'Invalid mobile number format';
            return res.status(400).json(await formatResponse.error(responseError));
        }

        let MobileNumber = '';
        if (req.query.otpType === "register") {
            MobileNumber = req.query.keyUser;
            if (serviceProviderData) {
                responseError.message = 'Service provider already registered';
                return res.status(400).json(await formatResponse.error(responseError));
            }
        } else if (req.query.otpType === "login") {
            MobileNumber = serviceProviderData?.mobile;
            if (!serviceProviderData) {
                responseError.message = 'Service provider not registered';
                return res.status(400).json(await formatResponse.error(responseError));
            }
            if (!serviceProviderData?.isActive) {
                responseError.message = 'Service provider deactivated';
                return res.status(400).json(await formatResponse.error(responseError));
            }
        }

        const response = await sendServiceProviderOTP(serviceProviderData?.id, MobileNumber, req.query.otpType, `Your verification OTP is sent to registered mobile number:`);
        if (response) {
            return res.status(200).json({ status: 'success', msg: "OTP Generated" });
        } else {
            return res.status(400).json({ status: 'error', msg: response });
        }
    } catch (error) {
        if (global.config.debugger === true) {
            console.error(error.message);
        }
        return res.status(400).json({ status: 'failure', msg: error.message });
    }
};

exports.verifyServiceProviderOtp = async (req, res, next) => {
    let responseError = {};
    try {
        const serviceProviderData = await db.ServiceProvider.findOne({
            where: {
                mobile: req.query.keyUser
            },
        });

        if (req.query.otpType === "login" && !serviceProviderData) {
            responseError.message = 'Service provider not found';
            return res.status(400).json(await formatResponse.error(responseError));
        }
        const otpStatus = await verifyServiceProviderOTP(serviceProviderData?.id || null, req.query.keyUser, req.query.otpType, req.query.otp);
        if (otpStatus.status === 'invalid') {
            if (!otpStatus.mobileOtp) {
                responseError.mobileOTP = 'Invalid OTP';
            }
            if (otpStatus?.expiredAt) {
                responseError.mobileOTP = 'OTP expired';
            }
            return res.status(400).json(await formatResponse.error(responseError));
        }

        if (req.query.otpType === "register") {
            return res.status(200).json({ status: 'success', msg: "OTP Verified" });
        }


        const secret = serviceProviderData?.id + '!@#$%0o%988';
        const accessKey = serviceProviderData?.id + '-' + uuidv4({}, null, 0);
        const accessKeyHash = crypto.createHmac('sha256', secret).update(accessKey).digest('hex');
        const accessToken = uuidv5(accessKeyHash, uuidv4({}, null, 0), null, 0);
        const accessTokenHash = crypto.createHmac('sha256', secret).update(accessToken).digest('hex');
        const accessTokenFinal = uuidv1({}, null, 0) + '-' + accessTokenHash + '-' + crypto.randomBytes(20).toString('hex') + '-' + uuidv4({}, null, 0);

        const sessionData = {
            serviceProviderId: serviceProviderData?.id,
            ipAddress: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
            userAgent: req.get('User-Agent'),
            accessKey: accessKeyHash,
            accessToken: accessTokenFinal,
            lastActivity: moment()
        };

        const newSession = await db.UserSessions.create(sessionData);

        const response = {
            accessToken: newSession.accessToken,
            status: 'success',
            msg: "OTP Verified",
            serviceProviderId: serviceProviderData.id,
            name: serviceProviderData.name,
            mobile: serviceProviderData.mobile,
            profilePic: global.config.serverHost + '/api/user/images/profile-pic.png'
        };

        return res.cookie('accessKey', newSession.accessKey, { httpOnly: true }).json(await formatResponse.success(response));

    } catch (error) {
        if (global.config.debugger === true) {
            console.error(error.message);
        }
        return res.status(400).json(await formatResponse.error(error));
    }
};

