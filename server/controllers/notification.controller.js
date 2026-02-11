const { col, Op } = require("sequelize");
const { formatResponse } = require("../helpers/utility.helper");
const db = require("../models");
const {
  getPagingData,
  getPagination,
} = require("../helpers/pagination.helper");


exports.insertUpdateApprovedNotification = async (req, res) => {
  try {
    const body = {
      id: req.body.id || 0, 
      candidateRefId: req.body.candidateRefId,
      admissionRefId: req.body.admissionRefId,
    };

    if (!body.candidateRefId || !body.admissionRefId) {
      return res
        .status(400)
        .json(
          await formatResponse.error(
            "candidateRefId and admissionRefId are required"
          )
        );
    }

    let notificationId = null;
    const notificationModel = db.approvedNotification


    if (body?.id) {
      const [numberOfAffectedRows] = await notificationModel.update(
        { 
          candidateRefId: body.candidateRefId, 
          admissionRefId: body.admissionRefId 
        },
        { where: { id: body.id } }
      );
      if (numberOfAffectedRows > 0) {
        notificationId = body.id;
      } 
    } else {
      const createdNotification = await notificationModel.create({
        candidateRefId: body.candidateRefId,
        admissionRefId: body.admissionRefId,
      });
      notificationId = createdNotification.id;
    }

    if (notificationId) {
      return res.status(body?.id && notificationId ? 200 : 201).json(
        await formatResponse.success({
          message: body?.id && notificationId ? "Notification Updated Successfully" : "Notification Inserted Successfully",
          notificationId: notificationId, 
        })
      );
    } else {
      return res
        .status(400)
        .json(await formatResponse.error("Insert/Update notification failed"));
    }
  } catch (error) {
     console.log(error);
    return res.status(400).json(await formatResponse.error(error));
  }
};

exports.getApprovedNotification = async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res
        .status(400)
        .json(await formatResponse.error("ID is required"));
    }

    const notificationModel = db.approvedNotification; 

    const notification = await notificationModel.findOne({
      where: { candidateRefId: id },
    });

    if (notification) {
      return res
        .status(200)
        .json(await formatResponse.success("You are approved"));
    } else {
      return res
        .status(400) 
        .json(await formatResponse.error("You are not approved"));
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json(await formatResponse.error(error));
  }
};


