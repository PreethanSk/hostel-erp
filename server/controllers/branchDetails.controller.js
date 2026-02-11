const { col, Op } = require("sequelize");
const { formatResponse } = require("../helpers/utility.helper");
const db = require("../models");
const {
  getPagingData,
  getPagination,
} = require("../helpers/pagination.helper");

exports.getBranchDetailBySearch = async (req, res) => {
  try {
    const { search } = req.query;
    if (!search) {
      return res
        .status(400)
        .json(await formatResponse.error("Search parameter is required"));
    }

    const searchCondition = search
      ? {
        [Op.or]: [
          { "$BranchDetails.branchName$": { [Op.like]: `%${search}%` } },
          { "$CandidateDetails.name$": { [Op.like]: `%${search}%` } },
        ],
      }
      : {};

    const result = await db.CandidateAdmission.findAll({
      where: {
        isActive: true,
        candidateRefId: {
          [Op.and]: [
            { [Op.ne]: null },
            { [Op.ne]: 0 },
          ],
        },
        ...searchCondition
      },
      attributes: ["id", "candidateRefId", "dateOfAdmission", "dateOfNotice"],
      include: [
        {
          model: db.BranchDetails,
          as: "BranchDetails",
          attributes: ["id", "branchName", "city", "state", "country"],
        },
        {
          model: db.CandidateDetails,
          as: "CandidateDetails",
          attributes: [
            "id",
            "name",
            "mobileNumber",
            "email",
            "gender",
            "city",
            "state",
            "blackListed"
          ],
        },
      ],
      order: [["updatedAt", "DESC"]],
    });

    return res.status(200).json(await formatResponse.success(result));
  } catch (error) {
    console.log(error);
    return res.status(400).json(await formatResponse.error(error));
  }
};

exports.getBranchGridList = async (req, res) => {
  try {
    const { page, size } = req.query;
    const { limit, offset } = getPagination(page, size);
    const result = await db.BranchDetails.findAndCountAll({ limit, offset, order: [["updatedAt", "DESC"]], });
    return res
      .status(200)
      .json(await formatResponse.success(getPagingData(result, page, limit)));
  } catch (error) {
    console.log(error);
    res.status(400).json(await formatResponse.error(error));
  }
};

exports.getBranchRoomCotAvailabilityById = async (req, res) => {
  try {
    const { branchId } = req.query;
    if (!branchId) {
      return res.status(200).json(await formatResponse.success([]));
    }
    const branchDetails = await db.BranchDetails.findByPk(branchId, {
      include: [
        {
          model: db.BranchPhotos,
          as: "BranchPhotos",
          attributes: ["photoUrl"],
        },
      ],
    });
    const roomDetails = await db.Rooms.findAll({
      where: { branchId: branchId },
      attributes: {
        include: [
          [col("MasterRoomTypes.type"), "roomTypeName"],
          [col("MasterSharingTypes.type"), "sharingTypeName"],
        ],
      },
      include: [
        {
          model: db.Cots,
          as: "Cots",
          attributes: { exclude: [] },
        },
        {
          model: db.MasterRoomTypes,
          as: "MasterRoomTypes",
          attributes: [],
        },
        {
          model: db.MasterSharingTypes,
          as: "MasterSharingTypes",
          attributes: [],
        },
      ],
    });
    const result = { branchDetails, roomDetails };
    return res.status(200).json(await formatResponse.success(result));
  } catch (error) {
    res.status(400).json(await formatResponse.error(error));
  }
};

exports.getBranchDetailsById = async (req, res) => {
  try {
    const result = await db.BranchDetails.findByPk(req.query.id);
    return res.status(200).json(await formatResponse.success(result));
  } catch (error) {
    res.status(400).json(await formatResponse.error(error));
  }
};

exports.getBranchPhotos = async (req, res) => {
  try {
    const response = await db.BranchPhotos.findAll({
      where: { branchId: req.query.branchId },
      attributes: {
        include: [[col("BranchDetails.branchName"), "branchName"]],
      },
      include: [
        {
          model: db.BranchDetails,
          as: "BranchDetails",
          attributes: [],
        },
      ],
    });

    return res.status(200).json(await formatResponse.success(response));
  } catch (error) {
    console.log(error);
    return res.status(400).json(await formatResponse.error(error));
  }
};

exports.getRoomByBranchId = async (req, res) => {
  try {
    const branchDetails = await db.BranchDetails.findOne({
      where: { id: req.query.branchId },
    });

    const cotVacantIds = branchDetails?.cotVacant
      ? branchDetails.cotVacant.split(",").map(id => Number(id))
      : [];
    const cotMaintenanceIds = branchDetails?.cotMaintenance
      ? branchDetails.cotMaintenance.split(",").map(id => Number(id))
      : [];

      console.log("@@@",cotMaintenanceIds)

    const response = await db.Rooms.findAll({
      where: { branchId: req.query.branchId },
      attributes: {
        include: [
          "id",
          "roomNumber",
          "roomTypeId",
          [col("MasterRoomTypes.type"), "roomTypeName"],
          [col("MasterSharingTypes.type"), "sharingTypeName"],
        ],
      },
      include: [
        {
          model: db.Cots,
          as: "Cots",
          attributes: {
            include: [],
          },
          where: req.query.type === 'admin' ? undefined : cotVacantIds.length ? { id: cotVacantIds } : undefined,
          include: [
            {
              model: db.MasterCotTypes,
              as: "CotType",
              attributes: ["type"],
            },
          ],
        },
        {
          model: db.MasterRoomTypes,
          as: "MasterRoomTypes",
          attributes: [],
        },
        {
          model: db.MasterSharingTypes,
          as: "MasterSharingTypes",
          attributes: [],
        },
      ],
    });
    const finalData = response?.map(room => {
      room = room.toJSON();

      room.Cots = room.Cots.map(cot => ({
        ...cot,
        cotStatus: cotVacantIds.includes(cot.id) ? "Vacant" : cotMaintenanceIds.includes(cot.id) ? "Maintenance" : "Occupied",
      }));

      return room;
    });
    return res.status(200).json(await formatResponse.success(finalData));
  } catch (error) {
    console.log(error);
    res.status(400).json(await formatResponse.error(error));
  }
};

exports.getCotsByRoomId = async (req, res) => {
  try {
    const response = await db.Cots.findAll({
      where: { roomId: req.query.roomId },
      attributes: {
        include: [[col("MasterCotTypes.type"), "cotsType"]],
      },
      include: [
        {
          model: db.MasterCotTypes,
          as: "MasterCotTypes",
          attributes: [],
        },
      ],
    });
    return res.status(200).json(await formatResponse.success(response));
  } catch (error) {
    console.log(error);
    res.status(400).json(await formatResponse.error(error));
  }
};

exports.getCotsByCotId = async (req, res) => {
  try {
    const response = await db.Cots.findOne({
      where: { id: req.query.id },
      attributes: {
        include: [
          [col("MasterCotTypes.type"), "cotsType"],
          [col("Rooms.roomNumber"), "roomNumber"],
          [col("Rooms.oneDayStay"), "oneDayStay"],
          [col("Rooms.roomSize"), "roomSize"],
          [col("Rooms.roomNumber"), "roomNumber"],
          [col("Rooms.floorNumber"), "floorNumber"],
          [col("Rooms.numberOfCots"), "numberOfCots"],
          [col("Rooms.admissionFee"), "admissionFee"],
          [col("Rooms.advanceAmount"), "advanceAmount"],
          [col("Rooms.lateFeeAmount"), "lateFeeAmount"],
          [col("Rooms->MasterRoomTypes.type"), "roomTypeName"],
          // [col("Rooms->BranchDetails.admissionFee"), "admissionFee"],
          // [col("Rooms->BranchDetails.advanceAmount"), "advanceAmount"],
          // [col("Rooms->BranchDetails.lateFeeAmount"), "lateFeeAmount"],
        ],
      },
      include: [
        {
          model: db.MasterCotTypes,
          as: "MasterCotTypes",
          attributes: [],
        },
        {
          model: db.Rooms,
          as: "Rooms",
          attributes: [],
          include: [
            {
              model: db.MasterRoomTypes,
              as: "MasterRoomTypes",
              attributes: [],
            },
            {
              model: db.BranchDetails,
              as: "BranchDetails",
              attributes: [],
            },
          ],
        },
      ],
    });
    return res.status(200).json(await formatResponse.success(response));
  } catch (error) {
    console.log(error);
    res.status(400).json(await formatResponse.error(error));
  }
};

exports.getCotList = async (req, res) => {
  try {
    const response = await db.Cots.findAll({
      where: { id: req.query.cotId },
      include: [
        {
          model: db.Rooms,
          as: "Room",
          attributes: ["roomNumber"],
        },
        {
          model: db.MasterCotTypes,
          as: "CotType",
          attributes: ["type"],
        },
      ],
    });

    return res.status(200).json(await formatResponse.success(response));
  } catch (error) {
    console.log(error);
    res.status(400).json(await formatResponse.error(error));
  }
};

exports.getBranchAmenitiesDetails = async (req, res) => {
  try {
    const response = await db.BranchAmenitiesDetails.findAll({
      where: { branchId: req.query.branchId },
      attributes: {
        include: [[col("Branch.branchName"), "branchName"]],
      },
      include: [
        {
          model: db.BranchDetails,
          as: "Branch",
          attributes: [],
        },
      ],
    });

    return res.status(200).json(await formatResponse.success(response));
  } catch (error) {
    console.log(error);
    res.status(400).json(await formatResponse.error(error));
  }
};

exports.getRoomsGridList = async (req, res) => {
  try {
    const { page, size } = req.query;
    const { limit, offset } = getPagination(page, size);
    const result = await db.Rooms.findAndCountAll({
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

exports.insertUpdateBranchAnyDetails = async (req, res) => {
  try {
    const { id, ...updateFields } = req.body;
    if (!id) {
      return res
        .status(400)
        .json(await formatResponse.error("Branch ID is required"));
    }

    const body = await db.BranchDetails.findByPk(id);
    if (!body) {
      return res
        .status(404)
        .json(await formatResponse.error("Branch not found"));
    }

    // Remove fields that should not be updated (like ID)
    delete updateFields.id;

    await db.BranchDetails.update(updateFields, { where: { id } });

    return res.status(200).json(
      await formatResponse.success({
        message: "Branch details updated successfully",
        id,
        updatedFields: updateFields,
      })
    );
  } catch (error) {
    console.error(error);
    return res.status(400).json(await formatResponse.error(error));
  }
};

exports.insertUpdateBranchDetails = async (req, res) => {
  try {
    const body = {
      id: req.body.id || 0,
      branchName: req.body.branchName,
      contactPerson: req.body.contactPerson,
      branchAddress: req.body.branchAddress,
      numberOfRooms: req.body.numberOfRooms,
      numberOfCots: req.body.numberOfCots,
      // admissionFee: req.body.admissionFee,
      // advanceAmount: req.body.advanceAmount,
      // lateFeeAmount: req.body.lateFeeAmount,
      isActive: req.body.isActive || false,
      mobileNumber: req.body.mobileNumber,
      city: req.body.city,
      pincode: req.body.pincode,
      state: req.body.state,
      country: req.body.country,
      notes: req.body.notes,
    };
    let branchId = null;
    if (body?.id) {
      await db.BranchDetails.update(body, { where: { id: body?.id } });
      branchId = body.id;
    } else {
      const createdBranch = await db.BranchDetails.create(body);
      branchId = createdBranch.id;
    }
    if (branchId) {
      return res.status(body?.id ? 200 : 201).json(
        await formatResponse.success({
          message: body?.id ? "Updated Successfully" : "Inserted Successfully",
          branchId: branchId,
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

exports.insertUpdateBranchPhotos = async (req, res) => {
  try {
    const reqBody = req.body.photos;
    const insertData = reqBody.filter((item) => !item.id);
    const updateData = reqBody.filter((item) => item.id);

    if (insertData.length > 0) {
      await db.BranchPhotos.bulkCreate(insertData);
    }

    if (updateData.length > 0) {
      updateDataFilterInactive = updateData?.filter((item) => !item?.isActive);
      updateDeleteResponses = await Promise.all(
        updateDataFilterInactive.map(async (item) => {
          await db.BranchPhotos.destroy({ where: { id: item.id } });
        })
      );
      updateResponses = await Promise.all(
        updateData.map(async (item) => {
          await db.BranchPhotos.update(item, { where: { id: item.id } });
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

exports.insertUpdateBranchAmenities = async (req, res) => {
  try {
    const reqBody = req.body.amenities;
    if (!Array.isArray(reqBody) || reqBody.length === 0) {
      return res.status(200).json(await formatResponse.success("No amenities"));
    }
    const insertData = reqBody.filter((item) => !item.id);
    const updateData = reqBody.filter((item) => item.id);

    if (insertData.length > 0) {
      await db.BranchAmenitiesDetails.bulkCreate(insertData);
    }

    if (updateData.length > 0) {
      updateResponses = await Promise.all(
        updateData.map(async (item) => {
          await db.BranchAmenitiesDetails.update(item, {
            where: { id: item.id },
          });
          return { id: item.id, message: "Updated Successfully" };
        })
      );
    }

    return res.status(200).json(await formatResponse.success("Updated Successfully"));
  } catch (error) {
    console.log(error);
    return res.status(400).json(await formatResponse.error(error));
  }
};

exports.insertUpdateRooms = async (req, res) => {
  try {
    const body = {
      id: req.body.id || 0,
      branchId: req.body.branchId,
      roomTypeId: req.body.roomTypeId,
      sharingTypeId: req.body.sharingTypeId,
      bathroomTypeId: req.body.bathroomTypeId,
      roomNumber: req.body.roomNumber,
      floorNumber: req.body.floorNumber,
      roomSize: req.body.roomSize,
      numberOfCots: req.body.numberOfCots,
      oneDayStay: req.body.oneDayStay,
      admissionFee: req.body.admissionFee,
      advanceAmount: req.body.advanceAmount,
      lateFeeAmount: req.body.lateFeeAmount,
      isActive: req.body.isActive || false,
      notes: req.body.notes,
    };
    let insertResponse = null;
    let roomId = null;
    if (body?.id) {
      insertResponse = await db.Rooms.update(body, { where: { id: body.id } });
      roomId = body.id;
    } else {
      insertResponse = await db.Rooms.create(body);
      roomId = insertResponse.id;
    }
    if (insertResponse) {
      return res.status(body?.id ? 200 : 201).json(
        await formatResponse.success({
          message: body?.id ? "Updated Successfully" : "Inserted Successfully",
          roomId: roomId,
        })
      );
    } else {
      return res.status(400).json(await formatResponse.error(insertResponse));
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json(await formatResponse.error(error));
  }
};

exports.insertUpdateCots = async (req, res) => {
  try {
    const cotsData = req.body.cots;
    if (!Array.isArray(cotsData) || cotsData.length === 0) {
      return res
        .status(400)
        .json(await formatResponse.error("Invalid input data"));
    }
    const insertCots = cotsData.filter((cot) => !cot.id);
    const updateCots = cotsData.filter((cot) => cot.id);

    if (insertCots.length > 0) {
      await db.Cots.bulkCreate(insertCots);
    }

    if (updateCots.length > 0) {
      updateResponses = await Promise.all(
        updateCots.map(async (cot) => {
          await db.Cots.update(cot, { where: { id: cot.id } });
          return { id: cot.id, message: "Updated Successfully" };
        })
      );
    }

    return res
      .status(200)
      .json(await formatResponse.success("Cots Updated Successfully"));
  } catch (error) {
    console.log(error);
    return res.status(400).json(await formatResponse.error(error));
  }
};


exports.bulkUploadCots = async (req, res) => {
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
       
        if (!row.roomId) {
          errors.push({
            row: rowNum,
            error: "Room ID is required",
            data: row,
          });
          errorCount++;
          continue;
        }

        
        const room = await db.Rooms.findByPk(row.roomId);
        if (!room) {
          errors.push({
            row: rowNum,
            error: `Room with ID ${row.roomId} does not exist`,
            data: row,
          });
          errorCount++;
          continue;
        }

        
        const cotData = {
          id: row.id || 0,
          roomId: row.roomId,
          cotTypeId: row.cotTypeId || null,
          cotNumber: row.cotNumber?.toString()?.trim() || null,
          rentAmount: row.rentAmount?.toString()?.trim() || null,
          advanceAmount: row.advanceAmount?.toString()?.trim() || null,
          perDayRent: row.perDayRent?.toString()?.trim() || null,
          cotPhotos: row.cotPhotos || null,
          isActive: row.isActive !== undefined ? row.isActive : true,
        };

        
        if (cotData.cotNumber) {
          const duplicateCot = await db.Cots.findOne({
            where: {
              roomId: cotData.roomId,
              cotNumber: cotData.cotNumber,
            },
          });

          if (duplicateCot) {
           
            if (cotData.id && duplicateCot.id === cotData.id) {
            
            } else {
              
              errors.push({
                row: rowNum,
                error: `Cot number "${cotData.cotNumber}" already exists in room ID ${cotData.roomId}. Cot numbers must be unique within the same room.`,
                data: row,
              });
              errorCount++;
              continue;
            }
          }
        }

       
        let existingCot = null;
        if (cotData.id && cotData.id > 0) {
          existingCot = await db.Cots.findByPk(cotData.id);
          if (!existingCot) {
            errors.push({
              row: rowNum,
              error: `Cot with ID ${cotData.id} does not exist`,
              data: row,
            });
            errorCount++;
            continue;
          }
        }

        if (existingCot) {
          
          await db.Cots.update(cotData, {
            where: { id: existingCot.id },
          });
          updateCount++;
          processedData.push({
            row: rowNum,
            id: existingCot.id,
            action: "updated",
          });
        } else {
          
          const result = await db.Cots.create(cotData);
          insertCount++;
          processedData.push({
            row: rowNum,
            id: result.id,
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


exports.bulkUploadRooms = async (req, res) => {
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
        if (!row.branchId) {
          missingFields.push("branchId");
        }
        if (!row.roomNumber || !row.roomNumber.toString().trim()) {
          missingFields.push("roomNumber");
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

        
        const roomData = {
          id: row.id || 0,
          branchId: row.branchId,
          roomTypeId: row.roomTypeId || null,
          sharingTypeId: row.sharingTypeId || null,
          bathroomTypeId: row.bathroomTypeId || null,
          roomSize: row.roomSize?.toString()?.trim() || null,
          roomNumber: row.roomNumber?.toString()?.trim() || null,
          floorNumber: row.floorNumber?.toString()?.trim() || null,
          numberOfCots: row.numberOfCots?.toString()?.trim() || null,
          oneDayStay: row.oneDayStay !== undefined ? row.oneDayStay : null,
          admissionFee: row.admissionFee?.toString()?.trim() || null,
          advanceAmount: row.advanceAmount?.toString()?.trim() || null,
          lateFeeAmount: row.lateFeeAmount?.toString()?.trim() || null,
          isActive: row.isActive !== undefined ? row.isActive : true,
          notes: row.notes?.trim() || null,
        };

        
        if (roomData.roomTypeId) {
          const roomType = await db.MasterRoomTypes.findByPk(roomData.roomTypeId);
          if (!roomType) {
            errors.push({
              row: rowNum,
              error: `Room type with ID ${roomData.roomTypeId} does not exist`,
              data: row,
            });
            errorCount++;
            continue;
          }
        }

       
        if (roomData.sharingTypeId) {
          const sharingType = await db.MasterSharingTypes.findByPk(roomData.sharingTypeId);
          if (!sharingType) {
            errors.push({
              row: rowNum,
              error: `Sharing type with ID ${roomData.sharingTypeId} does not exist`,
              data: row,
            });
            errorCount++;
            continue;
          }
        }

       
        if (roomData.bathroomTypeId) {
          const bathroomType = await db.MasterBathroomType.findByPk(roomData.bathroomTypeId);
          if (!bathroomType) {
            errors.push({
              row: rowNum,
              error: `Bathroom type with ID ${roomData.bathroomTypeId} does not exist`,
              data: row,
            });
            errorCount++;
            continue;
          }
        }

        
        if (roomData.roomNumber) {
          const duplicateRoom = await db.Rooms.findOne({
            where: {
              branchId: roomData.branchId,
              roomNumber: roomData.roomNumber,
            },
          });

          if (duplicateRoom) {
           
            if (roomData.id && duplicateRoom.id === roomData.id) {
           
            } else {
            
              errors.push({
                row: rowNum,
                error: `Room number "${roomData.roomNumber}" already exists in branch ID ${roomData.branchId}. Room numbers must be unique within the same branch.`,
                data: row,
              });
              errorCount++;
              continue;
            }
          }
        }

       
        let existingRoom = null;
        if (roomData.id && roomData.id > 0) {
          existingRoom = await db.Rooms.findByPk(roomData.id);
          if (!existingRoom) {
            errors.push({
              row: rowNum,
              error: `Room with ID ${roomData.id} does not exist`,
              data: row,
            });
            errorCount++;
            continue;
          }
        }

        if (existingRoom) {
         
          await db.Rooms.update(roomData, {
            where: { id: existingRoom.id },
          });
          updateCount++;
          processedData.push({
            row: rowNum,
            id: existingRoom.id,
            roomNumber: existingRoom.roomNumber,
            action: "updated",
          });
        } else {
         
          const result = await db.Rooms.create(roomData);
          insertCount++;
          processedData.push({
            row: rowNum,
            id: result.id,
            roomNumber: result.roomNumber,
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