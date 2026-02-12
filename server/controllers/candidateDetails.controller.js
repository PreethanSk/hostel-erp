const { v1: uuidv1, v4: uuidv4, v5: uuidv5 } = require("uuid");
const crypto = require("crypto");
const moment = require("moment");
const { formatResponse } = require("../helpers/utility.helper");
const db = require("../models");
const { Op, col, where } = require("sequelize");
const { getPagingData, getPagination, } = require("../helpers/pagination.helper");
const emailHelper = require("../helpers/email.helper");

exports.getCandidateDetails = async (req, res) => {
  try {
    const { candidateId, id } = req.query;

    if (!candidateId && !id) {
      return res.status(400).json(
        await formatResponse.error("Either candidateId or id is required")
      );
    }

    const whereCondition = {};
    if (candidateId) {
      if (!isNaN(candidateId)) {
        whereCondition.id = candidateId;
      } else {
        whereCondition.candidateId = candidateId;
      }
    } else if (id) {
      whereCondition.id = id;
    }

    const response = await db.CandidateDetails.findOne({
      where: whereCondition,
    });

    if (!response) {
      return res.status(404).json(
        await formatResponse.error("Candidate not found")
      );
    }

    return res.status(200).json(await formatResponse.success(response));
  } catch (error) {
    console.log(error);
    return res.status(400).json(await formatResponse.error(error));
  }
};

exports.getCandidateDetailBySearch = async (req, res) => {
  try {
    const { search } = req.query;
    if (!search) {
      return res
        .status(400)
        .json(await formatResponse.error("Search parameter is required"));
    }

    const whereCondition = {
      [Op.or]: [
        { candidateId: isNaN(search) ? "" : search },
        { name: { [Op.like]: `%${search}%` } },
        { email: search },
        { mobileNumber: search },
      ].filter(Boolean),
    };

    const response = await db.CandidateDetails.findAll({
      where: whereCondition,
    });
    return res.status(200).json(await formatResponse.success(response));
  } catch (error) {
    console.log(error);
    return res.status(400).json(await formatResponse.error(error));
  }
};

exports.getCandidateDocuments = async (req, res) => {
  try {
    const response = await db.CandidateDocumentDetails.findAll({
      where: { candidateRefId: req.query.candidateId },
    });

    return res.status(200).json(await formatResponse.success(response));
  } catch (error) {
    console.log(error);
    return res.status(400).json(await formatResponse.error(error));
  }
};

exports.getCandidateContactPersonDetails = async (req, res) => {
  try {
    const response = await db.CandidateContactPersonDetails.findOne({
      where: { candidateRefId: req.query.candidateId },
    });
    return res.status(200).json(await formatResponse.success(response));
  } catch (error) {
    console.log(error);
    return res.status(400).json(await formatResponse.error(error));
  }
};

exports.getCandidatePurposeOfStay = async (req, res) => {
  try {
    const response = await db.CandidatePurposeOfStay.findOne({
      where: { candidateRefId: req.query.candidateId },
    });
    return res.status(200).json(await formatResponse.success(response));
  } catch (error) {
    console.log(error);
    return res.status(400).json(await formatResponse.error(error));
  }
};

exports.getCandidateOtherDetails = async (req, res) => {
  try {
    const response = await db.CandidateOtherDetails.findOne({
      where: { candidateRefId: req.query.candidateId },
    });
    return res.status(200).json(await formatResponse.success(response));
  } catch (error) {
    console.log(error);
    return res.status(400).json(await formatResponse.error(error));
  }
};
exports.getCandidatePaymentDetails = async (req, res) => {
  try {
    const response = await db.CandidatePaymentDetails.findOne({
      where: { candidateRefId: req.query.candidateId },
    });
    return res.status(200).json(await formatResponse.success(response));
  } catch (error) {
    console.log(error);
    return res.status(400).json(await formatResponse.error(error));
  }
};

exports.getCandidateAdmission = async (req, res) => {
  try {
    const response = await db.CandidateAdmission.findOne({
      where: { id: req.query.id },
    });
    return res.status(200).json(await formatResponse.success(response));
  } catch (error) {
    console.log(error);
    res.status(400).json(await formatResponse.error(error));
  }
};

exports.getCandidateAdmissionById = async (req, res) => {
  try {
    const id = req.query.id || req.query.Id;
    const { candidateId, branchId, admissionId, cotId } = req.query;

    const whereClause = {};
    if (candidateId) whereClause.candidateRefId = candidateId;
    if (branchId) whereClause.branchRefId = branchId;
    if (admissionId) whereClause.id = admissionId;
    if (cotId) whereClause.cotRefId = cotId;
    if (id) whereClause.id = id;

    const response = await db.CandidateAdmission.findOne({
      attributes: {
        include: [
          [col("RoomDetails.roomNumber"), "roomNumber"],
          [col("RoomDetails.roomTypeId"), "roomTypeId"],
          [col("RoomDetails->MasterRoomTypes.type"), "roomTypeName"],
          [col("CotDetails.cotNumber"), "cotNumber"],
          [col("CotDetails->CotType.type"), "cotTypeName"],
          [col("AdmissionBranchDetails.branchName"), "branchName"],
          [col("CandidateAdmissionName.name"), "candidateName"],
          [col("CandidateAdmissionName.mobileNumber"), "candidateMobileNumber"],
          [col("CandidateAdmissionName.email"), "candidateEmail"],
          [col("CandidateAdmissionName.candidateId"), "candidateId"],
        ],
      },
      include: [
        {
          model: db.Cots,
          as: "CotDetails",
          attributes: [],
          include: [
            {
              model: db.MasterCotTypes,
              as: "CotType",
              attributes: [],
            },
          ],
        },
        {
          model: db.Rooms,
          as: "RoomDetails",
          attributes: [],
          include: [
            {
              model: db.MasterRoomTypes,
              as: "MasterRoomTypes",
              attributes: [],
            },
          ],
        },
        {
          model: db.BranchDetails,
          as: "AdmissionBranchDetails",
          attributes: [],
        },
        {
          model: db.CandidateDetails,
          as: "CandidateAdmissionName",
          attributes: [],
        },
      ],
      where: whereClause,
      order: [["updatedAt", "DESC"]],
    });
    // If only one result, return the object directly
    const result = (Array.isArray(response) && response.length === 2) ? response[0] : response;
    const plain = result?.get({ plain: true });
    return res.status(200).json(await formatResponse.success({
      ...plain,
      ebCharges: plain?.ebCharges || 0,
      miscellaneousCharges: plain?.miscellaneousCharges || 0,
      tokenAmount: plain?.tokenAmount || 0,
      cancellationFee: plain?.cancellationFee || 0,
      refundAmount: plain?.refundAmount || 0,
      advancePaid: plain?.advancePaid || 0,
      monthlyRent: plain?.monthlyRent || 0,
      admissionFee: plain?.admissionFee || 0,
      lateFeeAmount: plain?.lateFeeAmount || 0,
      discountOffer: plain?.discountOffer || 0,
      paymentStatus: plain?.paymentStatus || '',
    }));
  } catch (error) {
    console.log(error);
    res.status(400).json(await formatResponse.error(error));
  }
};

exports.getCandidateFeedbackById = async (req, res) => {
  try {
    const { candidateId, branchId, admissionId, feedbackId } = req.query;

    const whereClause = {};
    if (candidateId) whereClause.candidateRefId = candidateId;
    if (branchId) whereClause.branchRefId = branchId;
    if (admissionId) whereClause.admissionRefId = admissionId;
    if (feedbackId) whereClause.id = feedbackId;

    const response = await db.Feedback.findAll({
      attributes: {
        include: [
          // [col("RoomDetails.roomNumber"), "roomNumber"],
          // [col("RoomDetails.roomTypeId"), "roomTypeId"],
          // [col("RoomDetails->MasterRoomTypes.type"), "roomTypeName"],
          // [col("CotDetails.cotNumber"), "cotNumber"],
          // [col("CotDetails->CotType.type"), "cotTypeName"],
          // [col("AdmissionBranchDetails.branchName"), "branchName"],
          // [col("CandidateAdmissionName.name"), "candidateName"],
          // [col("CandidateAdmissionName.mobileNumber"), "candidateMobileNumber"],
        ],
      },
      include: [
        // {
        //   model: db.Cots,
        //   as: "CotDetails",
        //   attributes: [],
        //   include: [
        //     {
        //       model: db.MasterCotTypes,
        //       as: "CotType",
        //       attributes: []
        //     }
        //   ]
        // },
        // {
        //   model: db.Rooms,
        //   as: "RoomDetails",
        //   attributes: [],
        //   include: [
        //     {
        //       model: db.MasterRoomTypes,
        //       as: "MasterRoomTypes",
        //       attributes: []
        //     }
        //   ]
        // },
        // {
        //   model: db.BranchDetails,
        //   as: "AdmissionBranchDetails",
        //   attributes: [],
        // },
        // {
        //   model: db.CandidateDetails,
        //   as: "CandidateAdmissionName",
        //   attributes: [],
        // },
      ],
      where: whereClause,
    });
    return res.status(200).json(await formatResponse.success(response));
  } catch (error) {
    console.log(error);
    res.status(400).json(await formatResponse.error(error));
  }
};

exports.getAdmissionGridList = async (req, res) => {
  try {
    const { page, size, branchId, fromDate, toDate } = req.query;
    const { limit, offset } = getPagination(page, size);

    const whereClause = {};
    // whereClause.admissionStatus = { [Op.ne]: "Approved" };
    if (branchId) whereClause.branchRefId = branchId;
    if (fromDate && toDate) {
      whereClause.updatedAt = {
        [db.Sequelize.Op.between]: [
          fromDate + " 00:00:00",
          toDate + " 23:59:59",
        ],
      };
    }

    const result = await db.CandidateAdmission.findAndCountAll({
      attributes: {
        include: [
          [col("RoomDetails.roomNumber"), "roomNumber"],
          [col("RoomDetails.roomTypeId"), "roomTypeId"],
          [col("RoomDetails->MasterRoomTypes.type"), "roomTypeName"],
          [col("CotDetails.cotNumber"), "cotNumber"],
          [col("CotDetails->CotType.type"), "cotTypeName"],
          [col("AdmissionBranchDetails.branchName"), "branchName"],
          [col("CandidateAdmissionName.name"), "candidateName"],
          [col("CandidateAdmissionName.mobileNumber"), "candidateMobileNumber"],
        ],
      },
      include: [
        {
          model: db.Cots,
          as: "CotDetails",
          attributes: [],
          include: [
            {
              model: db.MasterCotTypes,
              as: "CotType",
              attributes: [],
            },
          ],
        },
        {
          model: db.Rooms,
          as: "RoomDetails",
          attributes: [],
          include: [
            {
              model: db.MasterRoomTypes,
              as: "MasterRoomTypes",
              attributes: [],
            },
          ],
        },
        {
          model: db.BranchDetails,
          as: "AdmissionBranchDetails",
          attributes: [],
        },
        {
          model: db.CandidateDetails,
          as: "CandidateAdmissionName",
          attributes: [],
        },
      ],
      where: whereClause,
      limit,
      offset,
      order: [["updatedAt", "DESC"]],
    });
    return res
      .status(200)
      .json(await formatResponse.success(getPagingData(result, page, limit)));
  } catch (error) {
    console.log(error);
    res.status(400).json(await formatResponse.error(error));
  }
};

exports.getEbChargesGridList = async (req, res) => {
  try {
    const { page, size, branchId, roomType, fromDate, toDate } = req.query;
    const { limit, offset } = getPagination(page, size);

    const whereClause = {};
    whereClause.admissionStatus = "Approved";
    if (branchId) whereClause.branchRefId = branchId;
    if (fromDate && toDate) {
      whereClause.updatedAt = {
        [db.Sequelize.Op.between]: [
          fromDate + " 00:00:00",
          toDate + " 23:59:59",
        ],
      };
    }

    if (roomType) {
      whereClause[Op.and] = [
        where(col("RoomDetails.roomTypeId"), roomType)
      ];
    }

    const result = await db.CandidateAdmission.findAndCountAll({
      attributes: {
        include: [
          [col("RoomDetails.roomNumber"), "roomNumber"],
          [col("RoomDetails.roomTypeId"), "roomTypeId"],
          [col("RoomDetails->MasterRoomTypes.type"), "roomTypeName"],
          [col("CotDetails.cotNumber"), "cotNumber"],
          [col("CotDetails->CotType.type"), "cotTypeName"],
          [col("AdmissionBranchDetails.branchName"), "branchName"],
          [col("CandidateAdmissionName.name"), "candidateName"],
          [col("CandidateAdmissionName.mobileNumber"), "candidateMobileNumber"],
        ],
      },
      include: [
        {
          model: db.Cots,
          as: "CotDetails",
          attributes: [],
          include: [
            {
              model: db.MasterCotTypes,
              as: "CotType",
              attributes: [],
            },
          ],
        },
        {
          model: db.Rooms,
          as: "RoomDetails",
          attributes: [],
          include: [
            {
              model: db.MasterRoomTypes,
              as: "MasterRoomTypes",
              attributes: [],
            },
          ],
        },
        {
          model: db.BranchDetails,
          as: "AdmissionBranchDetails",
          attributes: [],
        },
        {
          model: db.CandidateDetails,
          as: "CandidateAdmissionName",
          attributes: [],
        },
      ],
      where: whereClause,
      limit,
      offset,
      order: [["updatedAt", "DESC"]],
    });
    return res
      .status(200)
      .json(await formatResponse.success(getPagingData(result, page, limit)));
  } catch (error) {
    console.log(error);
    res.status(400).json(await formatResponse.error(error));
  }
};

exports.getApprovedAdmissionGridList = async (req, res) => {
  try {
    const { page, size, branchId, fromDate, toDate, paymentStatus } = req.query;
    const { limit, offset } = getPagination(page, size);

    const whereClause = {};
    whereClause.admissionStatus = "Approved";
    if (branchId?.split(",")?.filter(Boolean)?.length) {
      whereClause.branchRefId = {
        [db.Sequelize.Op.in]: branchId.split(",").filter(Boolean),
      };
    }
    if (fromDate && toDate) {
      whereClause.updatedAt = {
        [db.Sequelize.Op.between]: [
          fromDate + " 00:00:00",
          toDate + " 23:59:59",
        ],
      };
    }
    if (paymentStatus) {
      whereClause.paymentStatus = paymentStatus
    }

    const result = await db.CandidateAdmission.findAndCountAll({
      attributes: {
        include: [
          [col("RoomDetails.roomNumber"), "roomNumber"],
          [col("RoomDetails.roomTypeId"), "roomTypeId"],
          [col("RoomDetails->MasterRoomTypes.type"), "roomTypeName"],
          [col("CotDetails.cotNumber"), "cotNumber"],
          [col("CotDetails->CotType.type"), "cotTypeName"],
          [col("AdmissionBranchDetails.branchName"), "branchName"],
          [col("CandidateAdmissionName.name"), "candidateName"],
          [col("CandidateAdmissionName.mobileNumber"), "candidateMobileNumber"],
        ],
      },
      include: [
        {
          model: db.Cots,
          as: "CotDetails",
          attributes: [],
          include: [
            {
              model: db.MasterCotTypes,
              as: "CotType",
              attributes: [],
            },
          ],
        },
        {
          model: db.Rooms,
          as: "RoomDetails",
          attributes: [],
          include: [
            {
              model: db.MasterRoomTypes,
              as: "MasterRoomTypes",
              attributes: [],
            },
          ],
        },
        {
          model: db.BranchDetails,
          as: "AdmissionBranchDetails",
          attributes: [],
        },
        {
          model: db.CandidateDetails,
          as: "CandidateAdmissionName",
          attributes: [],
        },
      ],
      where: whereClause,
      limit,
      offset,
      order: [["updatedAt", "DESC"]],
    });
    return res
      .status(200)
      .json(await formatResponse.success(getPagingData(result, page, limit)));
  } catch (error) {
    console.log(error);
    res.status(400).json(await formatResponse.error(error));
  }
};

exports.getFeedbackGridList = async (req, res) => {
  try {
    const { page, size, branchId, fromDate, toDate } = req.query;
    const { limit, offset } = getPagination(page, size);

    const whereClause = {};
    if (branchId) whereClause.branchRefId = branchId;
    if (fromDate && toDate) {
      whereClause.updatedAt = {
        [db.Sequelize.Op.between]: [
          fromDate + " 00:00:00",
          toDate + " 23:59:59",
        ],
      };
    }

    const result = await db.Feedback.findAndCountAll({
      attributes: {
        include: [
          [col("FeedbackCandidateBranchDetails.branchName"), "branchName"],
          [col("FeedbackCandidateName.name"), "candidateName"],
          [col("FeedbackCandidateName.mobileNumber"), "candidateMobileNumber"],
          [col("FeedbackCandidateName.email"), "candidateEmail"],
          [
            col("FeedbackCandidateAdmission.dateOfAdmission"),
            "dateOfAdmission",
          ],
          [col("FeedbackCandidateAdmission.dateOfNotice"), "dateOfNotice"],
          [
            col("FeedbackCandidateAdmission->RoomDetails.roomNumber"),
            "roomNumber",
          ],
        ],
      },
      include: [
        {
          model: db.BranchDetails,
          as: "FeedbackCandidateBranchDetails",
          attributes: [],
        },
        {
          model: db.CandidateDetails,
          as: "FeedbackCandidateName",
          attributes: [],
        },
        {
          model: db.CandidateAdmission,
          as: "FeedbackCandidateAdmission",
          attributes: [],
          include: [
            {
              model: db.Rooms,
              as: "RoomDetails",
              attributes: [],
            },
          ],
        },
      ],
      where: whereClause,
      limit,
      offset,
      order: [["updatedAt", "DESC"]],
    });
    return res
      .status(200)
      .json(await formatResponse.success(getPagingData(result, page, limit)));
  } catch (error) {
    console.log(error);
    res.status(400).json(await formatResponse.error(error));
  }
};

exports.getBlackListGridList = async (req, res) => {
  try {
    const { page, size } = req.query;
    const { limit, offset } = getPagination(page, size);

    const result = await db.CandidateDetails.findAndCountAll({
      where: { blackListed: "yes" },
      limit,
      offset,
      order: [["blackListedDate", "DESC"]],
    });

    return res
      .status(200)
      .json(await formatResponse.success(getPagingData(result, page, limit)));
  } catch (error) {
    console.log(error);
    res.status(400).json(await formatResponse.error(error));
  }
};

exports.getAttendanceGridList = async (req, res) => {
  try {
    const { page, size } = req.query;
    const { limit, offset } = getPagination(page, size);

    const result = await db.AttendanceDetails.findAndCountAll({
      limit,
      offset,
      order: [["updatedAt", "DESC"]],
    });

    return res
      .status(200)
      .json(await formatResponse.success(getPagingData(result, page, limit)));
  } catch (error) {
    console.log(error);
    res.status(400).json(await formatResponse.error(error));
  }
};

const generateCandidateRegNo = async (city) => {
  let cityCode = (city || "").trim().toUpperCase() || "XXX";
  if (cityCode.length === 1) {
    cityCode = cityCode + "XX";      // A → AXX
  } else if (cityCode.length === 2) {
    cityCode = cityCode + "X";       // AB → ABX
  } else {
    cityCode = cityCode.slice(0, 3); // ABCDE → ABC
  }
  const prefix = `HH${cityCode}`;

  // Fetch the last UID starting with this prefix
  const lastRecord = await db.CandidateDetails.findOne({
    where: {
      candidateId: { [Op.like]: `${prefix}%` }
    },
    order: [['candidateId', 'DESC']]
  });

  let nextNumber = 1;
  if (lastRecord?.candidateId) {
    const numPart = parseInt(lastRecord.candidateId.slice(-4)); // get last 4 digits
    nextNumber = numPart + 1;
  }

  const UID = `${prefix}${String(nextNumber).padStart(4, '0')}`;
  return UID
}

//insert-update
exports.insertUpdateCandidateDetails = async (req, res) => {
  try {
    // const uniqueCustomerId = customAlphabet("1234567890", 6);
    const body = {
      id: req.body.id || 0,
      candidateId: req.body.candidateId,
      name: req.body.name,
      dob: moment(req.body.dob)?.format("YYYY-MM-DD") || null,
      gender: req.body.gender,
      mobileNumber: req.body.mobileNumber,
      mobileCountryCode: req.body.mobileCountryCode,
      email: req.body.email,
      address: req.body.address,
      place: req.body.place,
      city: req.body.city,
      pincode: req.body.pincode,
      state: req.body.state,
      country: req.body.country,
      blackListed: req.body.blackListed,
      blackListedReason: req.body.blackListedReason,
      blackListedBy: req.body.blackListedBy,
      profilePicture: req.body.profilePicture,
      isActive: req.body.isActive || false,
    };
    let insertedId = body?.id;
    if (body?.id) {
      if (body?.candidateId) {
        delete body?.candidateId
      }
      await db.CandidateDetails.update(
        { ...body },
        { where: { id: body?.id } }
      );
    } else {
      const UID = await generateCandidateRegNo(req.body.city);
      const result = await db.CandidateDetails.create({ ...body, candidateId: UID, });
      insertedId = result.id;
    }
    if (insertedId) {
      return res.status(body?.id ? 200 : 201).json(
        await formatResponse.success({
          message: body?.id ? "Updated Successfully" : "Inserted Successfully",
          insertedId: insertedId,
        })
      );
    } else {
      return res
        .status(400)
        .json(await formatResponse.error("Insert/Update failed"));
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json(await formatResponse.error(error));
  }
};

exports.insertUpdateCandidateDetailsMobile = async (req, res) => {
  try {
    const body = {
      id: req.body.id || 0,
      name: req.body.name,
      dob: moment(req.body.dob)?.format("YYYY-MM-DD") || null,
      mobileNumber: req.body.mobileNumber,
      email: req.body.email,
      gender: req.body.gender,
      mobileCountryCode: req.body.mobileCountryCode,
      isActive: req.body.isActive || false,
    };
    let insertedId = body?.id;
    if (body?.id) {
      await db.CandidateDetails.update(
        { ...body },
        { where: { id: body?.id } }
      );
    } else {
      const result = await db.CandidateDetails.create({ ...body, });
      insertedId = result.id;
    }
    if (insertedId) {
      const secret = insertedId + "!@#$%0o%988";
      const accessKey = insertedId + "-" + uuidv4({}, null, 0);
      const accessKeyHash = crypto.createHmac("sha256", secret).update(accessKey).digest("hex");
      const accessToken = uuidv5(accessKeyHash, uuidv4({}, null, 0), null, 0);
      const accessTokenHash = crypto.createHmac("sha256", secret).update(accessToken).digest("hex");
      const accessTokenFinal = uuidv1({}, null, 0) + "-" + accessTokenHash + "-" + crypto.randomBytes(20).toString("hex") + "-" + uuidv4({}, null, 0);
      const sessionData = {
        userId: insertedId,
        ipAddress: req.headers["x-forwarded-for"] || req.connection.remoteAddress,
        userAgent: req.get("User-Agent"),
        accessKey: accessKeyHash,
        accessToken: accessTokenFinal,
        lastActivity: moment(),
      };

      const newSession = await db.UserSessions.create(sessionData);

      const registerData = {
        accessToken: newSession.accessToken,
        id: insertedId,
        emailAddress: body.email,
        name: body.name || "",
      };
      return res.status(body?.id ? 200 : 201).json(await formatResponse.success({ message: body?.id ? "Updated Successfully" : "Inserted Successfully", insertedId: insertedId, data: registerData, }));
    } else {
      return res.status(400).json(await formatResponse.error("Insert/Update failed"));
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json(await formatResponse.error(error));
  }
};

exports.insertUpdateCandidateBlackListDetails = async (req, res) => {
  try {
    const body = {
      id: req.body.id,
      blackListed: req.body.blackListed,
      blackListedReason: req.body.blackListedReason,
      blackListedBy: req.body.blackListedBy,
      blackListedDate: moment().format("YYYY-MM-DD HH:mm:ss"),
    };
    if (body?.id) {
      await db.CandidateDetails.update(body, { where: { id: body?.id } });
    } else {
      return res
        .status(400)
        .json(await formatResponse.error("User id missing"));
    }
    return res
      .status(200)
      .json(await formatResponse.success("Updated successfully"));
  } catch (error) {
    console.log(error);
    return res.status(400).json(await formatResponse.error(error));
  }
};

exports.insertUpdateCandidateAnyDetails = async (req, res) => {
  try {
    const { id, ...updateFields } = req.body;

    if (!id) {
      return res
        .status(400)
        .json(await formatResponse.error("Candidate ID is required"));
    }

    const candidate = await db.CandidateDetails.findByPk(id);
    if (!candidate) {
      return res
        .status(404)
        .json(await formatResponse.error("Candidate not found"));
    }

    // Remove fields that should not be updated (like ID)
    delete updateFields.id;
    delete updateFields.candidateId;

    await db.CandidateDetails.update(updateFields, { where: { id } });

    return res.status(200).json(
      await formatResponse.success({
        message: "Candidate details updated successfully",
        id,
        updatedFields: updateFields,
      })
    );
  } catch (error) {
    console.error(error);
    return res.status(400).json(await formatResponse.error(error));
  }
};

exports.insertUpdateCandidateDocuments = async (req, res) => {
  try {
    const listData = req.body.documents;
    if (!Array.isArray(listData) || listData.length === 0) {
      return res
        .status(400)
        .json(await formatResponse.error("Invalid input data"));
    }
    const insertData = listData.filter((item) => !item.id);
    const updateData = listData.filter((item) => item.id);
    if (insertData.length > 0) {
      await db.CandidateDocumentDetails.bulkCreate(insertData);
    }

    if (updateData.length > 0) {
      const updateResponses = await Promise.all(
        updateData.map(async (item) => {
          await db.CandidateDocumentDetails.update(item, {
            where: { id: item.id },
          });
          return { id: item.id, message: "Updated Successfully" };
        })
      );
    }

    return res
      .status(200)
      .json(await formatResponse.success("Updated Successfully"));
  } catch (error) {
    console.log(error);
    return res.status(400).json(await formatResponse.error(error));
  }
};

exports.insertUpdateCandidateContactPersonDetails = async (req, res) => {
  try {
    const body = {
      id: req.body.id || 0,
      admissionRefId: req.body.admissionRefId || 0,
      candidateRefId: req.body.candidateRefId,
      name: req.body.name,
      relationshipType: req.body.relationshipType,
      mobileNumber: req.body.mobileNumber,
      name2: req.body.name2,
      relationshipType2: req.body.relationshipType2,
      mobileNumber2: req.body.mobileNumber2,
      localGuardianStatus: req.body.localGuardianStatus || false,
      guardianName: req.body.guardianName,
      guardianMobileNumber: req.body.guardianMobileNumber,
      guardianRelationshipType: req.body.guardianRelationshipType,
      guardianAddress: req.body.guardianAddress,
      guardianPlace: req.body.guardianPlace,
      guardianCity: req.body.guardianCity,
      guardianPincode: req.body.guardianPincode,
      guardianState: req.body.guardianState,
      guardianCountry: req.body.guardianCountry,
      isActive: req.body.isActive || false,
    };
    let insertedId = body?.id;
    if (body?.id) {
      await db.CandidateContactPersonDetails.update(body, {
        where: { id: body?.id },
      });
    } else {
      const result = await db.CandidateContactPersonDetails.create(body);
      insertedId = result.id;
    }
    if (insertedId) {
      return res.status(body?.id ? 200 : 201).json(
        await formatResponse.success({
          message: body?.id ? "Updated Successfully" : "Inserted Successfully",
          insertedId: insertedId,
        })
      );
    } else {
      return res
        .status(400)
        .json(await formatResponse.error("Insert/Update failed"));
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json(await formatResponse.error(error));
  }
};

exports.insertUpdateCandidatePurposeOfStay = async (req, res) => {
  try {
    const body = {
      id: req.body.id || 0,
      admissionRefId: req.body.admissionRefId || 0,
      candidateRefId: req.body.candidateRefId,
      mentionedPurpose: req.body.mentionedPurpose,
      reasonOfStay: req.body.reasonOfStay,
      organizationName: req.body.organizationName,
      organizationMobileNumber: req.body.organizationMobileNumber,
      organizationAddress: req.body.organizationAddress,
      organizationPlace: req.body.organizationPlace,
      organizationCity: req.body.organizationCity,
      organizationPincode: req.body.organizationPincode,
      organizationState: req.body.organizationState,
      organizationCountry: req.body.organizationCountry,
      isActive: req.body.isActive || false,
    };
    let insertedId = body?.id;
    if (body?.id) {
      await db.CandidatePurposeOfStay.update(body, { where: { id: body?.id } });
    } else {
      const result = await db.CandidatePurposeOfStay.create(body);
      insertedId = result.id;
    }
    if (insertedId) {
      return res.status(body?.id ? 200 : 201).json(
        await formatResponse.success({
          message: body?.id ? "Updated Successfully" : "Inserted Successfully",
          insertedId: insertedId,
        })
      );
    } else {
      return res
        .status(400)
        .json(await formatResponse.error("Insert/Update failed"));
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json(await formatResponse.error(error));
  }
};

exports.insertUpdateCandidateOtherDetails = async (req, res) => {
  try {
    const body = {
      id: req.body.id || 0,
      admissionRefId: req.body.admissionRefId || 0,
      candidateRefId: req.body.candidateRefId,
      anySpecialCareRequired: req.body.anySpecialCareRequired,
      detailsOfSpecialCare: req.body.detailsOfSpecialCare,
      howDoTheyKnowAboutUs: req.body.howDoTheyKnowAboutUs,
      enquiryBeforeVisiting: req.body.enquiryBeforeVisiting,
      isActive: req.body.isActive || false,
    };
    let insertedId = body?.id;
    if (body?.id) {
      await db.CandidateOtherDetails.update(body, { where: { id: body?.id } });
    } else {
      const result = await db.CandidateOtherDetails.create(body);
      insertedId = result?.id;
    }
    if (insertedId) {
      return res.status(body?.id ? 200 : 201).json(
        await formatResponse.success({
          message: body?.id ? "Updated Successfully" : "Inserted Successfully",
          insertedId: insertedId,
        })
      );
    } else {
      return res
        .status(400)
        .json(await formatResponse.error("Insert/Update failed"));
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json(await formatResponse.error(error));
  }
};

exports.insertUpdateCandidatePaymentAnyDetails = async (req, res) => {
  try {
    const { id, ...updateFields } = req.body;

    if (!id) {
      return res.status(400).json(await formatResponse.error("Admission id is required"));
    }

    const admission = await db.CandidatePaymentDetails.findByPk(id);
    if (!admission) {
      return res.status(404).json(await formatResponse.error("Payment details not found"));
    }

    delete updateFields.id;

    await db.CandidatePaymentDetails.update(updateFields, { where: { id } });

    return res.status(200).json(
      await formatResponse.success({
        message: "Admission details updated successfully", id, updatedFields: updateFields,
      })
    );
  } catch (error) {
    console.error(error);
    return res.status(400).json(await formatResponse.error(error));
  }
};

exports.insertUpdateCandidatePaymentDetails = async (req, res) => {
  try {
    const body = {
      id: req.body.id || 0,
      admissionRefId: req.body.admissionRefId || 0,
      candidateRefId: req.body.candidateRefId,
      paymentOption: req.body.paymentOption,
      paidAmount: req.body.paidAmount,
      admissionFeePaid: req.body.admissionFeePaid,
      admissionFeePending: req.body.admissionFeePending,
      advancePaid: req.body.advancePaid,
      advancePending: req.body.advancePending,
      monthlyRentPaid: req.body.monthlyRentPaid,
      monthlyRentPending: req.body.monthlyRentPending,
      lateFeePaid: req.body.lateFeePaid,
      lateFeePending: req.body.lateFeePending,
      tokenAmountPaid: req.body.tokenAmountPaid,
      tokenAmountPending: req.body.tokenAmountPending,
      refundPaid: req.body.refundPaid,
      refundPending: req.body.refundPending,
      cancellationFeePaid: req.body.cancellationFeePaid,
      cancellationFeePending: req.body.cancellationFeePending,
      dueToPaid: req.body.dueToPaid,
      totalPendingAmount: req.body.totalPendingAmount,
      dueDate: moment(req.body.dueDate)?.format("YYYY-MM-DD") || null,
      isActive: req.body.isActive || false,
    };
    let insertedId = body?.id;
    if (body?.id) {
      await db.CandidatePaymentDetails.update(body, {
        where: { id: body?.id },
      });
    } else {
      const result = await db.CandidatePaymentDetails.create(body);
      insertedId = result?.id;
    }
    if (insertedId) {
      return res.status(body?.id ? 200 : 201).json(
        await formatResponse.success({
          message: body?.id ? "Updated Successfully" : "Inserted Successfully",
          insertedId: insertedId,
        })
      );
    } else {
      return res
        .status(400)
        .json(await formatResponse.error("Insert/Update failed"));
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json(await formatResponse.error(error));
  }
};

// exports.insertUpdateCandidateAdmissions = async (req, res) => {
//   try {
//     const body = {
//       id: req.body.id || 0,
//       candidateRefId: req.body.candidateRefId,
//       branchRefId: req.body.branchRefId,
//       roomRefId: req.body.roomRefId,
//       cotRefId: req.body.cotRefId,
//       dateOfAdmission: moment(req.body.dateOfAdmission)?.format("YYYY-MM-DD") || null,
//       dateOfNotice: moment(req.body.dateOfNotice)?.format("YYYY-MM-DD") || null,
//       admissionFee: req.body.admissionFee,
//       advancePaid: req.body.advancePaid,
//       monthlyRent: req.body.monthlyRent,
//       lateFeeAmount: req.body.lateFeeAmount,
//       noDayStayType: req.body.noDayStayType,
//       noDayStay: req.body.noDayStay,
//       admissionStatus: req.body.admissionStatus,
//       dues: req.body.dues,
//       admittedBy: req.body.admittedBy,
//       isActive: req.body.isActive || false,
//     };
//     if (!body.branchRefId || !body.roomRefId || !body.cotRefId || !body.dateOfAdmission) {
//       return res.status(400).json(await formatResponse.error("Branch, Room, Cot all id's and Admission Date required"));
//     }
//     if (body.id === 0) {
//       // const occupiedCot = await db.BranchDetails.findOne({ where: { id: body.branchRefId, }, });
//       // if (occupiedCot) {
//       //   if (occupiedCot?.cotOccupied?.split(",")?.filter(Boolean)?.includes(body?.cotRefId + ""))
//       //     return res.status(400).json(await formatResponse.error("Cot or Room already occupied"));
//       // }

//       const branch = await db.BranchDetails.findOne({ where: { id: body.branchRefId }, });

//       if (branch) {
//         const occupiedList = branch.cotOccupied?.split(",").filter(Boolean) || [];
//         if (occupiedList.includes(body.cotRefId + "")) {
//           return res.status(400).json(await formatResponse.error("Cot or Room already occupied 1"));
//         }

//         const cotId = body.cotRefId.toString();
//         let vacantList = branch.cotVacant?.split(",").filter(Boolean) || [];
//         vacantList = vacantList.filter(id => id !== cotId);
//         occupiedList.push(cotId);

//         await branch.update({
//           cotOccupied: occupiedList.join(","),
//           cotVacant: vacantList.join(",")
//         });
//       }
//     }

//     let insertedId = body?.id;
//     if (body?.id) {
//       await db.CandidateAdmission.update(body, { where: { id: body?.id } });
//     } else {
//       const getAdmission = await db.CandidateAdmission.findOne({
//         where: {
//           branchRefId: body?.branchRefId,
//           roomRefId: body?.roomRefId,
//           cotRefId: body?.cotRefId,
//         }
//       })
//       try {
//         if (getAdmission?.admissionStatus === "Inprogress" && !getAdmission?.vacate) {
//           return res.status(400).json(await formatResponse.error("Cot or Room already occupied 2"));
//         }
//         const result = await db.CandidateAdmission.create(body);
//         insertedId = result?.id;
//       } catch (error) {
//         console.log(error)
//         return res.status(400).json(await formatResponse.error("Cot or Room already occupied 3"));
//       }
//     }
//     if (insertedId) {
//       return res.status(body?.id ? 200 : 201).json(
//         await formatResponse.success({
//           message: body?.id ? "Updated Successfully" : "Inserted Successfully",
//           insertedId: insertedId,
//         })
//       );
//     } else {
//       return res
//         .status(400)
//         .json(await formatResponse.error("Insert/Update failed"));
//     }
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json(await formatResponse.error(error));
//   }
// };


exports.insertUpdateCandidateAdmissions = async (req, res) => {
  try {
    const body = {
      id: req.body.id ? Number(req.body.id) : null,
      candidateRefId: req.body.candidateRefId,
      branchRefId: req.body.branchRefId,
      roomRefId: req.body.roomRefId,
      cotRefId: req.body.cotRefId,
      dateOfAdmission: moment(req.body.dateOfAdmission).format("YYYY-MM-DD"),
      dateOfNotice: req.body.dateOfNotice ? moment(req.body.dateOfNotice).format("YYYY-MM-DD") : null,
      admissionFee: req.body.admissionFee,
      advancePaid: req.body.advancePaid,
      monthlyRent: req.body.monthlyRent,
      lateFeeAmount: req.body.lateFeeAmount,
      noDayStayType: req.body.noDayStayType,
      noDayStay: req.body.noDayStay,
      dues: req.body.dues,
      admissionStatus: req.body.admissionStatus,
      admissionType: req.body.admissionType,
      admittedBy: req.body.admittedBy,
      isActive: req.body.isActive ?? true,
    };

    if (req.body.admissionType === 'Staff') {
      body.paymentStatus = 'Paid'
    }

    // -------------------------------------------------------------------
    // Validate Required Fields
    // -------------------------------------------------------------------
    if (!body.branchRefId || !body.roomRefId || !body.cotRefId || !body.dateOfAdmission) {
      return res.status(400).json(await formatResponse.error(
        "Branch, Room, Cot IDs and Admission Date are required"
      ));
    }

    const branch = await db.BranchDetails.findOne({
      where: { id: body.branchRefId }
    });

    if (!branch) {
      return res.status(400).json(await formatResponse.error("Branch not found"));
    }

    const cotId = String(body.cotRefId);

    let occupiedList = (branch.cotOccupied || "").split(",").filter(Boolean);
    let vacantList = (branch.cotVacant || "").split(",").filter(Boolean);

    // -------------------------------------------------------------------
    // 1️⃣ INSERT FLOW (new registration)
    // -------------------------------------------------------------------
    if (!body.id) {

      // Check if cot is occupied by an ACTIVE admission (not rejected)
      const activeAdmission = await db.CandidateAdmission.findOne({
        where: {
          branchRefId: body.branchRefId,
          roomRefId: body.roomRefId,
          cotRefId: body.cotRefId,
          admissionStatus: {
            [Op.in]: ["Inprogress", "Approved"] // Only these block
          }
        }
      });

      if (activeAdmission) {
        return res.status(400).json(await formatResponse.error("Cot or Room already occupied"));
      }

      // Update Branch cot lists
      vacantList = vacantList.filter(id => id !== cotId);
      if (!occupiedList.includes(cotId)) occupiedList.push(cotId);

      await branch.update({
        cotOccupied: occupiedList.join(","),
        cotVacant: vacantList.join(",")
      });

      // Insert Admission
      const inserted = await db.CandidateAdmission.create(body);
      return res.status(201).json(await formatResponse.success({
        message: "Inserted Successfully",
        insertedId: inserted.id
      }));
    }

    // -------------------------------------------------------------------
    // 2️⃣ UPDATE FLOW (existing admission)
    // -------------------------------------------------------------------
    const existingAdmission = await db.CandidateAdmission.findByPk(body.id);
    if (!existingAdmission) {
      return res.status(404).json(await formatResponse.error("Admission not found"));
    }

    // If the status changed to Rejected → release cot
    if (body.admissionStatus === "Rejected") {
      occupiedList = occupiedList.filter(id => id !== cotId);

      if (!vacantList.includes(cotId)) vacantList.push(cotId);

      await branch.update({
        cotOccupied: occupiedList.join(","),
        cotVacant: vacantList.join(",")
      });
    }

    // Update admission record
    await db.CandidateAdmission.update(body, { where: { id: body.id } });

    return res.status(200).json(await formatResponse.success({
      message: "Updated Successfully",
      insertedId: body.id
    }));

  } catch (error) {
    console.error(error);
    return res.status(500).json(await formatResponse.error(error.message));
  }
};

exports.getAdmissionBookingAvailability = async (req, res) => {
  try {
    const { branchId, roomId, cotId, dateOfAdmission } = req.query;
    if (!branchId || !roomId || !cotId || !dateOfAdmission) {
      return res
        .status(400)
        .json(
          await formatResponse.error(
            "Branch, Room, Cot all id's and Admission Date required"
          )
        );
    }
    const occupiedCot = await db.CandidateAdmission.findOne({
      where: {
        branchRefId: branchId,
        roomRefId: roomId,
        cotRefId: cotId,
      },
    });
    const result = {
      availableDate: dateOfAdmission,
      status: "Available",
    };
    if (!occupiedCot) {
      return res.status(200).json(await formatResponse.success(result));
    }

    const noticeDate = occupiedCot.dateOfNotice
      ? moment(occupiedCot.dateOfNotice, "YYYY-MM-DD")
      : moment()?.format("YYYY-MM-DD");
    const newAdmissionDate = moment(dateOfAdmission, "YYYY-MM-DD");

    if (newAdmissionDate.isBefore(noticeDate)) {
      result.availableDate = noticeDate
        ? moment(noticeDate, "YYYY-MM-DD")?.format("YYYY-MM-DD")
        : "";
      result.status = "Unavailable";
    }
    return res.status(200).json(await formatResponse.success(result));
  } catch (error) {
    console.log(error);
    return res.status(400).json(await formatResponse.error(error));
  }
};

// exports.insertUpdateCandidateAdmissionAnyDetails = async (req, res) => {
//   try {
//     const { id, ...updateFields } = req.body;

//     if (!id) {
//       return res.status(400).json(await formatResponse.error("Admission id is required"));
//     }

//     const admission = await db.CandidateAdmission.findByPk(id);
//     if (!admission) {
//       return res.status(404).json(await formatResponse.error("Admission not found"));
//     }

//     const branch = await db.BranchDetails.findOne({ where: { id: admission?.branchRefId }, });
//     if (req.body.admissionStatus === 'Rejected') {
//       if (branch) {
//         const cotId = admission?.cotRefId.toString();
//         // convert both lists into arrays
//         let occupiedList = branch.cotOccupied?.split(",").filter(Boolean) || [];
//         let vacantList = branch.cotVacant?.split(",").filter(Boolean) || [];

//         // --- REMOVE FROM OCCUPIED ---
//         occupiedList = occupiedList.filter(id => id !== cotId);

//         // --- ADD BACK TO VACANT IF NOT EXISTS ---
//         if (!vacantList.includes(cotId)) {
//           vacantList.push(cotId);
//         }
//         await branch.update({ cotOccupied: occupiedList.join(","), cotVacant: vacantList.join(",") });
//       }
//     }

//     if (req.body?.candidateRefId) {
//       if (branch) {
//         const occupiedList = branch.cotOccupied?.split(",").filter(Boolean) || [];
//         if (occupiedList.includes(admission.cotRefId + "")) {
//           return res.status(400).json(await formatResponse.error("Cot or Room already occupied"));
//         }

//         const cotId = admission.cotRefId.toString();
//         let vacantList = branch.cotVacant?.split(",").filter(Boolean) || [];
//         vacantList = vacantList.filter(id => id !== cotId);
//         occupiedList.push(cotId);

//         await branch.update({ cotOccupied: occupiedList.join(","), cotVacant: vacantList.join(",") });
//       }

//       const getAdmission = await db.CandidateAdmission.findOne({
//         where: {
//           candidateRefId: req.body?.candidateRefId,
//           admissionStatus: {
//             [Op.in]: ['Inprogress', 'Submitted']
//           }
//         }
//       })
//       if (getAdmission && (getAdmission?.id != req.body?.id)) {
//         return res.status(400).json(await formatResponse.error("Candidate already have previous admission, wait for the status updated."));
//       }
//     }
//     delete updateFields.id;

//     await db.CandidateAdmission.update(updateFields, { where: { id } });

//     return res.status(200).json(
//       await formatResponse.success({
//         message: "Admission details updated successfully",
//         id,
//         updatedFields: updateFields,
//       })
//     );
//   } catch (error) {
//     console.error(error);
//     return res.status(400).json(await formatResponse.error(error));
//   }
// };

exports.deleteCandidateAdmission = async (req, res) => {
  const t = await db.sequelize.transaction();

  try {
    const { admissionId } = req.query;

    if (!admissionId) {
      return res.status(400).json(await formatResponse.error("admissionId is required"));
    }

    // 1. Fetch admission
    const admission = await db.CandidateAdmission.findByPk(admissionId);

    if (!admission) {
      return res.status(404).json(await formatResponse.error("Admission not found"));
    }

    // 2. Allow delete ONLY if rejected
    if (admission.admissionStatus !== "Rejected") {
      return res.status(400).json(
        await formatResponse.error("Only rejected admissions can be deleted")
      );
    }

    // 3. Remove cot from occupied / add back to vacant
    const branch = await db.BranchDetails.findByPk(admission.branchRefId);

    if (branch) {
      const cotId = admission.cotRefId.toString();

      let occupiedList = branch.cotOccupied?.split(",").filter(Boolean) || [];
      let vacantList = branch.cotVacant?.split(",").filter(Boolean) || [];

      // remove from occupied
      occupiedList = occupiedList.filter(id => id !== cotId);

      // add back to vacant only if missing
      if (!vacantList.includes(cotId)) {
        vacantList.push(cotId);
      }

      await branch.update(
        {
          cotOccupied: occupiedList.join(","),
          cotVacant: vacantList.join(","),
        },
        { transaction: t }
      );
    }

    // 4. Delete all child tables first
    await db.CandidateContactPersonDetails.destroy({
      where: { admissionRefId: admissionId },
      transaction: t
    });

    await db.CandidateDocumentDetails.destroy({
      where: { admissionRefId: admissionId },
      transaction: t
    });

    await db.CandidateOtherDetails.destroy({
      where: { admissionRefId: admissionId },
      transaction: t
    });

    await db.CandidatePaymentDetails.destroy({
      where: { admissionRefId: admissionId },
      transaction: t
    });

    await db.CandidatePurposeOfStay.destroy({
      where: { admissionRefId: admissionId },
      transaction: t
    });

    // 5. Delete admission
    await db.CandidateAdmission.destroy({
      where: { id: admissionId },
      transaction: t
    });

    // commit
    await t.commit();

    return res.status(200).json(
      await formatResponse.success({
        message: "Admission and related records deleted successfully",
      })
    );

  } catch (err) {
    console.error(err);
    await t.rollback();
    return res.status(500).json(await formatResponse.error("Deletion failed"));
  }
};


exports.insertUpdateCandidateAdmissionAnyDetails = async (req, res) => {
  try {
    const { id, ...updateFields } = req.body;

    if (!id) {
      return res.status(400).json(await formatResponse.error("Admission id is required"));
    }

    const admission = await db.CandidateAdmission.findByPk(id);
    if (!admission) {
      return res.status(404).json(await formatResponse.error("Admission not found"));
    }

    const branch = await db.BranchDetails.findOne({
      where: { id: admission.branchRefId }
    });

    const cotId = admission.cotRefId?.toString();

    // -------------------------------------------------------------------
    // 1️⃣ HANDLE REJECTION → return cot to Vacant list
    // -------------------------------------------------------------------
    if (req.body.admissionStatus === "Rejected" && branch && cotId) {
      let occupiedList = (branch.cotOccupied || "").split(",").filter(Boolean);
      let vacantList = (branch.cotVacant || "").split(",").filter(Boolean);

      // REMOVE from occupied
      occupiedList = occupiedList.filter(id => id !== cotId);

      // ADD to vacant (if not already)
      if (!vacantList.includes(cotId)) {
        vacantList.push(cotId);
      }

      await branch.update({
        cotOccupied: occupiedList.join(","),
        cotVacant: vacantList.join(","),
      });
    }

    // -------------------------------------------------------------------
    // 2️⃣ HANDLE ADMISSION SUBMISSION / APPROVAL
    // update cot assignment
    // -------------------------------------------------------------------
    if (req.body?.candidateRefId && branch && cotId) {

      // 2A: Check if cot is assigned to ANOTHER candidate
      const cotAssigned = await db.CandidateAdmission.findOne({
        where: {
          cotRefId: cotId,
          admissionStatus: "Approved", // adjust if needed
        }
      });

      if (cotAssigned && cotAssigned.candidateRefId !== admission.candidateRefId) {
        return res
          .status(400)
          .json(await formatResponse.error("Cot or Room already occupied by another candidate"));
      }

      // 2B: Update branch cot lists
      let occupiedList = (branch.cotOccupied || "").split(",").filter(Boolean);
      let vacantList = (branch.cotVacant || "").split(",").filter(Boolean);

      // Remove from vacant
      vacantList = vacantList.filter(id => id !== cotId);

      // Add to occupied (only once)
      if (!occupiedList.includes(cotId)) {
        occupiedList.push(cotId);
      }

      await branch.update({
        cotOccupied: occupiedList.join(","),
        cotVacant: vacantList.join(","),
      });

      // -------------------------------------------------------------------
      // 2C: Prevent candidate from having multiple "Inprogress" & "Submitted"
      // -------------------------------------------------------------------
      const getAdmission = await db.CandidateAdmission.findOne({
        where: {
          candidateRefId: req.body.candidateRefId,
          admissionStatus: { [Op.in]: ["Inprogress", "Submitted"] },
        }
      });

      if (getAdmission && getAdmission.id !== id) {
        return res.status(400).json(
          await formatResponse.error(
            "Candidate already has a previous admission. Please wait for status update."
          )
        );
      }
    }

    // -------------------------------------------------------------------
    // 3️⃣ Update Admission
    // -------------------------------------------------------------------
    const previousStatus = admission.admissionStatus;
    const newStatus = req.body.admissionStatus || previousStatus;

    delete updateFields.id;

    await db.CandidateAdmission.update(updateFields, { where: { id } });

   
    if (previousStatus !== "Approved" && newStatus === "Approved") {
      try {
        const [candidate, freshAdmission, branchDetails, room, cot] = await Promise.all([
          db.CandidateDetails.findByPk(admission.candidateRefId),
          db.CandidateAdmission.findByPk(id),
          db.BranchDetails.findByPk(admission.branchRefId),
          db.Rooms.findByPk(admission.roomRefId),
          db.Cots.findByPk(admission.cotRefId),
        ]);

        if (candidate) {
          emailHelper.sendAdmissionApprovedEmail({
            candidate: candidate?.get ? candidate.get({ plain: true }) : candidate,
            branch: branchDetails?.get ? branchDetails.get({ plain: true }) : branchDetails,
            room: room?.get ? room.get({ plain: true }) : room,
            cot: cot?.get ? cot.get({ plain: true }) : cot,
            admission: freshAdmission?.get ? freshAdmission.get({ plain: true }) : freshAdmission,
          });
        }
      } catch (mailErr) {
        console.error("Failed to send admission approval email:", mailErr);
      }
    }

    return res.status(200).json(
      await formatResponse.success({
        message: "Admission details updated successfully",
        id,
        updatedFields: updateFields,
      })
    );

  } catch (error) {
    console.error(error);
    return res.status(400).json(await formatResponse.error(error));
  }
};


exports.insertUpdateCandidateFeedback = async (req, res) => {
  try {
    const body = {
      id: req.body.id || 0,
      candidateRefId: req.body.candidateRefId || 0,
      branchRefId: req.body.branchRefId || 0,
      admissionRefId: req.body.admissionRefId || 0,
      rateStay: req.body.rateStay,
      rateFoodService: req.body.rateFoodService,
      rateCleanliness: req.body.rateCleanliness,
      rateSecuritySafety: req.body.rateSecuritySafety,
      rateSupportStaff: req.body.rateSupportStaff,
      managerCandidateBehavior: req.body.managerCandidateBehavior,
      managerComments: req.body.managerComments,
      candidateRemarks: req.body.candidateRemarks,
      isActive: req.body.isActive || false,
    };
    let insertedId = body?.id;
    if (body?.id) {
      await db.Feedback.update(body, { where: { id: body?.id } });
    } else {
      const result = await db.Feedback.create(body);
      insertedId = result?.id;
    }
    if (insertedId) {
      return res.status(body?.id ? 200 : 201).json(
        await formatResponse.success({
          message: body?.id ? "Updated Successfully" : "Inserted Successfully",
          insertedId: insertedId,
        })
      );
    } else {
      return res
        .status(400)
        .json(await formatResponse.error("Insert/Update failed"));
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json(await formatResponse.error(error));
  }
};

exports.insertUpdateAttendanceDetails = async (req, res) => {
  try {
    const body = {
      id: req.body.id || 0,
      candidateId: req.body.candidateId,
      branchId: req.body.branchId,
      date: req.body.date,
      inTime: req.body.inTime,
      outTime: req.body.outTime,
      mobileNumber: req.body.mobileNumber,
      isActive: req.body.isActive || false,
    };
    let insertedId = body?.id;
    if (body?.id) {
      await db.AttendanceDetails.update(body, { where: { id: body?.id } });
    } else {
      const result = await db.AttendanceDetails.create(body);
      insertedId = result?.id;
    }
    if (insertedId) {
      return res.status(body?.id ? 200 : 201).json(
        await formatResponse.success({
          message: body?.id ? "Updated Successfully" : "Inserted Successfully",
          insertedId: insertedId,
        })
      );
    } else {
      return res
        .status(400)
        .json(await formatResponse.error("Insert/Update failed"));
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json(await formatResponse.error(error));
  }
};

exports.validateCandidateMobileNumberUniqueness = async (req, res) => {
  try {
    const { candidateRefId, mobileNumber, excludeId, fieldType } = req.body;

    if (!candidateRefId || !mobileNumber) {
      return res.status(400).json(
        await formatResponse.error("Candidate ID and mobile number are required")
      );
    }


    const duplicateChecks = [];


    const candidateCheck = await db.CandidateDetails.findOne({
      where: {
        mobileNumber: mobileNumber,
        id: { [Op.ne]: candidateRefId }
      }
    });
    if (candidateCheck) {
      duplicateChecks.push({
        field: "Candidate's own mobile number",
        table: "CANDIDATE_DETAILS",
        existingCandidateId: candidateCheck.candidateId
      });
    }


    const contactPersonCheck = await db.CandidateContactPersonDetails.findOne({
      where: {
        candidateRefId: candidateRefId,
        [Op.or]: [
          { mobileNumber: mobileNumber },
          { mobileNumber2: mobileNumber },
          { guardianMobileNumber: mobileNumber }
        ],
        ...(excludeId && fieldType === 'contact_person' ? { id: { [Op.ne]: excludeId } } : {})
      }
    });
    if (contactPersonCheck) {
      if (contactPersonCheck.mobileNumber === mobileNumber) {
        duplicateChecks.push({
          field: "Primary contact person",
          table: "CANDIDATE_CONTACT_PERSON_INFO"
        });
      }
      if (contactPersonCheck.mobileNumber2 === mobileNumber) {
        duplicateChecks.push({
          field: "Secondary contact person",
          table: "CANDIDATE_CONTACT_PERSON_INFO"
        });
      }
      if (contactPersonCheck.guardianMobileNumber === mobileNumber) {
        duplicateChecks.push({
          field: "Local guardian",
          table: "CANDIDATE_CONTACT_PERSON_INFO"
        });
      }
    }

    // 3. Check purpose of stay organization mobile number - ONLY UNIQUE WITHIN SAME CANDIDATE
    const purposeCheck = await db.CandidatePurposeOfStay.findOne({
      where: {
        candidateRefId: candidateRefId,
        organizationMobileNumber: mobileNumber,
        ...(excludeId && fieldType === 'purpose_of_stay' ? { id: { [Op.ne]: excludeId } } : {})
      }
    });
    if (purposeCheck) {
      duplicateChecks.push({
        field: "Employment/Education organization",
        table: "CANDIDATE_PURPOSE_OF_STAY"
      });
    }

    // 4. Check if this mobile number is used by another candidate in any field (for reference)
    const otherCandidateChecks = [];

    // Check other candidates' contact person details - THIS IS ALLOWED (shared contacts)
    const otherContactPersonCheck = await db.CandidateContactPersonDetails.findOne({
      where: {
        candidateRefId: { [Op.ne]: candidateRefId },
        [Op.or]: [
          { mobileNumber: mobileNumber },
          { mobileNumber2: mobileNumber },
          { guardianMobileNumber: mobileNumber }
        ]
      },
      include: [{
        model: db.CandidateDetails,
        as: 'CandidateDetails',
        attributes: ['candidateId', 'name']
      }]
    });
    if (otherContactPersonCheck) {
      otherCandidateChecks.push({
        field: "Contact Person (Shared)",
        candidateId: otherContactPersonCheck.CandidateDetails?.candidateId,
        candidateName: otherContactPersonCheck.CandidateDetails?.name
      });
    }


    // Check other candidates' purpose of stay - THIS IS ALLOWED (shared organizations)
    const otherPurposeCheck = await db.CandidatePurposeOfStay.findOne({
      where: {
        candidateRefId: { [Op.ne]: candidateRefId },
        organizationMobileNumber: mobileNumber
      },
      include: [{
        model: db.CandidateDetails,
        as: 'CandidateDetails',
        attributes: ['candidateId', 'name']
      }]
    });
    if (otherPurposeCheck) {
      otherCandidateChecks.push({
        field: "Organization (Shared)",
        candidateId: otherPurposeCheck.CandidateDetails?.candidateId,
        candidateName: otherPurposeCheck.CandidateDetails?.name
      });
    }

    const response = {
      isUnique: duplicateChecks.length === 0,
      duplicateChecks,
      otherCandidateChecks,
      message: duplicateChecks.length > 0
        ? `Mobile number already used for: ${duplicateChecks.map(d => d.field).join(', ')}`
        : "Mobile number is available"
    };

    return res.status(200).json(await formatResponse.success(response));
  } catch (error) {
    console.log(error);
    return res.status(400).json(await formatResponse.error(error));
  }
};

exports.validateCandidateEmailUniqueness = async (req, res) => {
  try {
    const { candidateRefId, email, excludeId } = req.body;

    if (!candidateRefId || !email) {
      return res.status(400).json(
        await formatResponse.error("Candidate ID and email are required")
      );
    }


    const duplicateChecks = [];

    const candidateCheck = await db.CandidateDetails.findOne({
      where: {
        email: email,
        id: { [Op.ne]: candidateRefId }
      }
    });
    if (candidateCheck) {
      duplicateChecks.push({
        field: "Another candidate's email",
        table: "CANDIDATE_DETAILS",
        existingCandidateId: candidateCheck.candidateId
      });
    }

    const response = {
      isUnique: duplicateChecks.length === 0,
      duplicateChecks,
      message: duplicateChecks.length > 0
        ? `Email already used for: ${duplicateChecks.map(d => d.field).join(', ')}`
        : "Email is available"
    };

    return res.status(200).json(await formatResponse.success(response));
  } catch (error) {
    console.log(error);
    return res.status(400).json(await formatResponse.error(error));
  }
};


exports.bulkUploadCandidateDetails = async (req, res) => {
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
        if (!row.name || !row.name.toString().trim()) {
          missingFields.push("name");
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

        
        const candidateData = {
          id: row.id || 0,
          candidateId: row.candidateId || null,
          name: row.name?.trim() || null,
          dob: row.dob ? moment(row.dob).format("YYYY-MM-DD") : null,
          gender: row.gender?.trim() || null,
          mobileNumber: row.mobileNumber?.toString()?.trim() || null,
          mobileCountryCode: row.mobileCountryCode?.toString()?.trim() || "91",
          email: row.email?.trim() || null,
          address: row.address?.trim() || null,
          place: row.place?.trim() || null,
          city: row.city?.trim() || null,
          pincode: row.pincode?.toString()?.trim() || null,
          state: row.state?.toString()?.trim() || null,
          country: row.country?.toString()?.trim() || null,
          blackListed: row.blackListed || null,
          blackListedReason: row.blackListedReason?.trim() || null,
          blackListedBy: row.blackListedBy?.trim() || null,
          profilePicture: row.profilePicture || null,
          isActive: row.isActive !== undefined ? row.isActive : true,
        };

        
        if (row.dob) {
          const dobMoment = moment(row.dob);
          if (!dobMoment.isValid()) {
            errors.push({
              row: rowNum,
              error: `Invalid date of birth format: "${row.dob}". Please use YYYY-MM-DD format.`,
              data: row,
            });
            errorCount++;
            continue;
          }
          
          if (dobMoment.isAfter(moment())) {
            errors.push({
              row: rowNum,
              error: `Date of birth cannot be in the future: "${row.dob}"`,
              data: row,
            });
            errorCount++;
            continue;
          }
        }

        
        if (candidateData.email) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(candidateData.email)) {
            errors.push({
              row: rowNum,
              error: `Invalid email format: "${candidateData.email}"`,
              data: row,
            });
            errorCount++;
            continue;
          }
        }

       
        if (candidateData.mobileNumber) {
          const mobileRegex = /^\d+$/;
          if (!mobileRegex.test(candidateData.mobileNumber)) {
            errors.push({
              row: rowNum,
              error: `Invalid mobile number format: "${candidateData.mobileNumber}". Mobile number should contain only digits.`,
              data: row,
            });
            errorCount++;
            continue;
          }
          if (candidateData.mobileNumber.length < 10 || candidateData.mobileNumber.length > 15) {
            errors.push({
              row: rowNum,
              error: `Invalid mobile number length: "${candidateData.mobileNumber}". Mobile number should be between 10 and 15 digits.`,
              data: row,
            });
            errorCount++;
            continue;
          }
        }

        
        let existingCandidate = null;
        if (candidateData.id && candidateData.id > 0) {
          existingCandidate = await db.CandidateDetails.findByPk(candidateData.id);
          if (!existingCandidate) {
            errors.push({
              row: rowNum,
              error: `Candidate with ID ${candidateData.id} does not exist`,
              data: row,
            });
            errorCount++;
            continue;
          }
        }

        
        if (candidateData.mobileNumber) {
          const duplicateByMobile = await db.CandidateDetails.findOne({
            where: { mobileNumber: candidateData.mobileNumber },
          });

          if (duplicateByMobile) {
         
            if (candidateData.id && duplicateByMobile.id === candidateData.id) {
             
            } else {
              
              errors.push({
                row: rowNum,
                error: `Mobile number "${candidateData.mobileNumber}" already exists for another candidate (ID: ${duplicateByMobile.id}, Name: ${duplicateByMobile.name || "N/A"}). Mobile numbers must be unique.`,
                data: row,
              });
              errorCount++;
              continue;
            }
          }
        }

        
        if (candidateData.email) {
          const duplicateByEmail = await db.CandidateDetails.findOne({
            where: { email: candidateData.email },
          });

          if (duplicateByEmail) {
            
            if (candidateData.id && duplicateByEmail.id === candidateData.id) {
              
            } else {
             
              errors.push({
                row: rowNum,
                error: `Email "${candidateData.email}" already exists for another candidate (ID: ${duplicateByEmail.id}, Name: ${duplicateByEmail.name || "N/A"}). Emails must be unique.`,
                data: row,
              });
              errorCount++;
              continue;
            }
          }
        }

        if (existingCandidate) {
         
          if (candidateData.candidateId) {
            delete candidateData.candidateId; 
          }
          await db.CandidateDetails.update(candidateData, {
            where: { id: existingCandidate.id },
          });
          updateCount++;
          processedData.push({
            row: rowNum,
            id: existingCandidate.id,
            candidateId: existingCandidate.candidateId,
            action: "updated",
          });
        } else {
          
          const city = candidateData.city || "XXX";
          const UID = await generateCandidateRegNo(city);
          const result = await db.CandidateDetails.create({
            ...candidateData,
            candidateId: UID,
          });
          insertCount++;
          processedData.push({
            row: rowNum,
            id: result.id,
            candidateId: result.candidateId,
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