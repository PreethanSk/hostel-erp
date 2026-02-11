const { col } = require("sequelize");
const {
  getPagination,
  getPagingData,
} = require("../helpers/pagination.helper");
const { formatResponse } = require("../helpers/utility.helper");
const db = require("../models");

exports.getVacateGridList = async (req, res) => {
  try {
    const { page, size, branchId, status, fromDate, toDate } = req.query;
    const { limit, offset } = getPagination(page, size);
    const whereClause = {};
    if (branchId?.split(',')?.filter(Boolean)?.length) {
      whereClause.branchRefId = {
        [db.Sequelize.Op.in]: branchId.split(',').filter(Boolean)
      };
    }
    if (status) whereClause.vacateStatus = status;

    if (fromDate && toDate) {
      whereClause.updatedAt = {
        [db.Sequelize.Op.between]: [fromDate + ' 00:00:00', toDate + ' 23:59:59']
      };
    }

    const result = await db.Vacate.findAndCountAll({
      attributes: {
        include: [
          [col("VacateCandidateDetails.name"), "candidateName"],
          [col("VacateCandidateDetails.mobileNumber"), "candidateMobileNumber"],
          [col("VacateBranchDetails.branchName"), "branchName"],
          [col("VacateCandidateAdmission.dateOfAdmission"), "dateOfAdmission"],
          [col("VacateCandidateAdmission.dateOfNotice"), "dateOfNotice"],
          [col("VacateCandidateAdmission->RoomDetails.roomNumber"), "roomNumber",],
          [col("VacateCandidateAdmission->CotDetails.cotNumber"), "cotNumber"],
        ],
      },
      include: [
        {
          model: db.BranchDetails,
          as: "VacateBranchDetails",
          attributes: [],
        },
        {
          model: db.CandidateDetails,
          as: "VacateCandidateDetails",
          attributes: [],
        },
        {
          model: db.CandidateAdmission,
          as: "VacateCandidateAdmission",
          attributes: [],
          include: [
            {
              model: db.Cots,
              as: "CotDetails",
              attributes: [],
            },
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

    return res.status(200)
      .json(await formatResponse.success(getPagingData(result, page, limit)));
  } catch (error) {
    console.log(error);
    res.status(400).json(await formatResponse.error(error));
  }
};

exports.getVacateById = async (req, res) => {
  try {
    const { id, admissionId } = req.query;
    const whereClause = {};
    if (admissionId) whereClause.admissionRefId = admissionId;
    if (id) whereClause.id = id;
    const response = await db.Vacate.findOne({ where: whereClause });
    return res.status(200).json(await formatResponse.success(response));
  } catch (error) {
    console.log(error);
    res.status(400).json(await formatResponse.error(error));
  }
};

exports.getVacateByCandidateId = async (req, res) => {
  try {
    const { candidateId } = req.query;
    if (!candidateId) {
      return res.status(400).json(await formatResponse.error("Candidate ID is required"));
    }
    
    const response = await db.Vacate.findOne({ 
      where: { candidateRefId: candidateId },
      include: [
        {
          model: db.CandidateDetails,
          as: "VacateCandidateDetails",
          attributes: ["name"],
        }
      ]
    });
    
    return res.status(200).json(await formatResponse.success(response));
  } catch (error) {
    console.log(error);
    res.status(400).json(await formatResponse.error(error));
  }
};

exports.getVacateByBranch = async (req, res) => {
  try {
    const { branchId } = req.query;
    if (!branchId) {
      return res
        .status(400)
        .json(await formatResponse.error("branchId is required"));
    }
    const result = await db.Vacate.findAll({
      where: { branchRefId: branchId },
      include: [
        {
          model: db.CandidateDetails,
          as: "VacateCandidateDetails",
          attributes: ["name", "mobileNumber"],
        },
        {
          model: db.CandidateAdmission,
          as: "VacateCandidateAdmission",
          attributes: ["dateOfAdmission", "dateOfNotice"],
        },
      ],
      order: [["updatedAt", "DESC"]],
    });
    return res.status(200).json(await formatResponse.success(result));
  } catch (error) {
    console.log(error);
    res.status(400).json(await formatResponse.error(error));
  }
};

exports.getVacateBranchDropdown = async (req, res) => {
  try {
    const branches = await db.BranchDetails.findAll({
      attributes: ["id", "branchName"],
      order: [["branchName", "ASC"]],
    });
    return res.status(200).json(await formatResponse.success(branches));
  } catch (error) {
    console.log(error);
    res.status(400).json(await formatResponse.error(error));
  }
};

exports.insertUpdateVacate = async (req, res) => {
  try {
    const body = req.body;
    let insertedId = body?.id;
    if (body.vacateStatus === "Approved") {
      const candidateDetails = await db.CandidateAdmission.findByPk(
        body.admissionRefId
      );
      if (candidateDetails) {
        candidateDetails.vacate = true;
        await candidateDetails.save();

        const cotRefId = String(candidateDetails.cotRefId);
        const branch = await db.BranchDetails.findByPk(body.branchRefId);

        if (branch) {
          let cotOccupied = branch.cotOccupied ? branch.cotOccupied.split(",") : [];
          let cotVacant = branch.cotVacant ? branch.cotVacant.split(",") : [];
          cotOccupied = cotOccupied.filter((id) => id !== cotRefId);

          if (!cotVacant.includes(cotRefId)) {
            cotVacant.push(cotRefId);
          }
          branch.cotOccupied = cotOccupied.join(",");
          branch.cotVacant = cotVacant.join(",");
          await branch.save();
        }
      }
    }
    if (body?.id) {
      await db.Vacate.update(body, { where: { id: body?.id } });
    } else {
      const result = await db.Vacate.create(body);
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

exports.deleteVacate = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json(await formatResponse.error("Vacate id is required"));
    }
    
   
    const vacateEntry = await db.Vacate.findByPk(id);
    if (!vacateEntry) {
      return res.status(404).json(await formatResponse.error("Vacate entry not found"));
    }

   
    if (vacateEntry.vacateStatus === "Approved") {
      const candidateDetails = await db.CandidateAdmission.findByPk(vacateEntry.admissionRefId);
      if (candidateDetails) {
        candidateDetails.vacate = false;
        await candidateDetails.save();

        const cotRefId = String(candidateDetails.cotRefId);
        const branch = await db.BranchDetails.findByPk(vacateEntry.branchRefId);

        if (branch) {
          let cotOccupied = branch.cotOccupied ? branch.cotOccupied.split(",") : [];
          let cotVacant = branch.cotVacant ? branch.cotVacant.split(",") : [];
          
          // Remove from vacant and add to occupied
          cotVacant = cotVacant.filter((id) => id !== cotRefId);
          if (!cotOccupied.includes(cotRefId)) {
            cotOccupied.push(cotRefId);
          }
          
          branch.cotOccupied = cotOccupied.join(",");
          branch.cotVacant = cotVacant.join(",");
          await branch.save();
        }
      }
    }

    // Delete the vacate entry
    const deleted = await db.Vacate.destroy({ where: { id } });
    if (deleted) {
      return res.status(200).json(await formatResponse.success("Vacate entry deleted successfully"));
    } else {
      return res.status(404).json(await formatResponse.error("Vacate entry not found"));
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json(await formatResponse.error(error));
  }
};


exports.bulkUploadVacate = async (req, res) => {
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
        let candidateRefId = null;
        let branchRefId = null;
        let admissionRefId = null;

        
        if (!row.candidateRefId) {
          missingFields.push("candidateRefId");
        } else {
          candidateRefId = parseInt(row.candidateRefId);
          if (isNaN(candidateRefId)) {
            errors.push({
              row: rowNum,
              error: `Invalid candidateRefId: "${row.candidateRefId}". Must be a valid number.`,
              data: row,
            });
            errorCount++;
            continue;
          }
        }

        
        if (!row.branchRefId) {
          missingFields.push("branchRefId");
        } else {
          branchRefId = parseInt(row.branchRefId);
          if (isNaN(branchRefId)) {
            errors.push({
              row: rowNum,
              error: `Invalid branchRefId: "${row.branchRefId}". Must be a valid number.`,
              data: row,
            });
            errorCount++;
            continue;
          }
        }

        
        if (!row.admissionRefId) {
          missingFields.push("admissionRefId");
        } else {
          admissionRefId = parseInt(row.admissionRefId);
          if (isNaN(admissionRefId)) {
            errors.push({
              row: rowNum,
              error: `Invalid admissionRefId: "${row.admissionRefId}". Must be a valid number.`,
              data: row,
            });
            errorCount++;
            continue;
          }
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

        
        const candidate = await db.CandidateDetails.findByPk(candidateRefId);
        if (!candidate) {
          errors.push({
            row: rowNum,
            error: `Candidate with ID ${candidateRefId} does not exist`,
            data: row,
          });
          errorCount++;
          continue;
        }

        
        const branch = await db.BranchDetails.findByPk(branchRefId);
        if (!branch) {
          errors.push({
            row: rowNum,
            error: `Branch with ID ${branchRefId} does not exist`,
            data: row,
          });
          errorCount++;
          continue;
        }

        
        const admission = await db.CandidateAdmission.findByPk(admissionRefId);
        if (!admission) {
          errors.push({
            row: rowNum,
            error: `Admission with ID ${admissionRefId} does not exist`,
            data: row,
          });
          errorCount++;
          continue;
        }

        
        if (admission.candidateRefId !== candidateRefId) {
          errors.push({
            row: rowNum,
            error: `Admission ID ${admissionRefId} does not belong to candidate ID ${candidateRefId}`,
            data: row,
          });
          errorCount++;
          continue;
        }

        if (admission.branchRefId !== branchRefId) {
          errors.push({
            row: rowNum,
            error: `Admission ID ${admissionRefId} does not belong to branch ID ${branchRefId}`,
            data: row,
          });
          errorCount++;
          continue;
        }

      
        const payableAdvancePaid = parseFloat(row.payableAdvancePaid?.toString()?.trim() || '0') || 0;
        const payableAdmissionFee = parseFloat(row.payableAdmissionFee?.toString()?.trim() || '0') || 0;
        const payableMonthlyRent = parseFloat(row.payableMonthlyRent?.toString()?.trim() || '0') || 0;
        const payablePenalty = parseFloat(row.payablePenalty?.toString()?.trim() || '0') || 0;
        const payableDuePending = parseFloat(row.payableDuePending?.toString()?.trim() || '0') || 0;
        
        const netAmountPayable = (payableAdvancePaid + payableAdmissionFee + payableMonthlyRent + payablePenalty + payableDuePending).toString();

        const vacateData = {
          id: row.id || 0,
          candidateRefId: candidateRefId,
          branchRefId: branchRefId,
          admissionRefId: admissionRefId,
          vacateType: row.vacateType?.toString()?.trim() || null,
          vacateStatus: row.vacateStatus?.toString()?.trim() || "Pending",
          damageRemarks: row.damageRemarks?.toString()?.trim() || null,
          payableAdvancePaid: row.payableAdvancePaid?.toString()?.trim() || null,
          payableAdmissionFee: row.payableAdmissionFee?.toString()?.trim() || null,
          payableMonthlyRent: row.payableMonthlyRent?.toString()?.trim() || null,
          payablePenalty: row.payablePenalty?.toString()?.trim() || null,
          payableDuePending: row.payableDuePending?.toString()?.trim() || null,
          netAmountPayable: netAmountPayable,
          dateOfNoticeGiven: row.dateOfNoticeGiven?.toString()?.trim() || null,
          proposedVacatingDate: row.proposedVacatingDate?.toString()?.trim() || null,
          actualVacatingDate: row.actualVacatingDate?.toString()?.trim() || null,
          isActive: row.isActive !== undefined ? row.isActive : false,
        };

        
        const validStatuses = ["Pending", "Approved", "Rejected", "Cancelled"];
        if (vacateData.vacateStatus && !validStatuses.includes(vacateData.vacateStatus)) {
          errors.push({
            row: rowNum,
            error: `Invalid vacateStatus: ${vacateData.vacateStatus}. Valid values are: ${validStatuses.join(", ")}`,
            data: row,
          });
          errorCount++;
          continue;
        }

        
        let existingVacateById = null;
        if (vacateData.id && vacateData.id > 0) {
          existingVacateById = await db.Vacate.findByPk(vacateData.id);
          if (!existingVacateById) {
            errors.push({
              row: rowNum,
              error: `Vacate with ID ${vacateData.id} does not exist`,
              data: row,
            });
            errorCount++;
            continue;
          }
        }

        if (existingVacateById) {
          
          if (vacateData.vacateStatus === "Approved" && existingVacateById.vacateStatus !== "Approved") {
            admission.vacate = true;
            await admission.save();

            const cotRefId = String(admission.cotRefId);
            if (cotRefId && cotRefId !== "null" && cotRefId !== "undefined") {
              let cotOccupied = branch.cotOccupied ? branch.cotOccupied.split(",") : [];
              let cotVacant = branch.cotVacant ? branch.cotVacant.split(",") : [];
              cotOccupied = cotOccupied.filter((id) => id !== cotRefId);

              if (!cotVacant.includes(cotRefId)) {
                cotVacant.push(cotRefId);
              }
              branch.cotOccupied = cotOccupied.join(",");
              branch.cotVacant = cotVacant.join(",");
              await branch.save();
            }
          } else if (vacateData.vacateStatus !== "Approved" && existingVacateById.vacateStatus === "Approved") {
            
            admission.vacate = false;
            await admission.save();

            const cotRefId = String(admission.cotRefId);
            if (cotRefId && cotRefId !== "null" && cotRefId !== "undefined") {
              let cotOccupied = branch.cotOccupied ? branch.cotOccupied.split(",") : [];
              let cotVacant = branch.cotVacant ? branch.cotVacant.split(",") : [];
              cotVacant = cotVacant.filter((id) => id !== cotRefId);

              if (!cotOccupied.includes(cotRefId)) {
                cotOccupied.push(cotRefId);
              }
              branch.cotOccupied = cotOccupied.join(",");
              branch.cotVacant = cotVacant.join(",");
              await branch.save();
            }
          }

          await db.Vacate.update(vacateData, {
            where: { id: existingVacateById.id },
          });
          updateCount++;
          processedData.push({
            row: rowNum,
            id: existingVacateById.id,
            action: "updated",
          });
        } else {
          
          const result = await db.Vacate.create(vacateData);
          insertCount++;
          
          if (vacateData.vacateStatus === "Approved") {
            admission.vacate = true;
            await admission.save();

            const cotRefId = String(admission.cotRefId);
            if (cotRefId && cotRefId !== "null" && cotRefId !== "undefined") {
              let cotOccupied = branch.cotOccupied ? branch.cotOccupied.split(",") : [];
              let cotVacant = branch.cotVacant ? branch.cotVacant.split(",") : [];
              cotOccupied = cotOccupied.filter((id) => id !== cotRefId);

              if (!cotVacant.includes(cotRefId)) {
                cotVacant.push(cotRefId);
              }
              branch.cotOccupied = cotOccupied.join(",");
              branch.cotVacant = cotVacant.join(",");
              await branch.save();
            }
          }

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