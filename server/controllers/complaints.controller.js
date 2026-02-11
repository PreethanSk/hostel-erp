const { col, fn } = require("sequelize");
const { getPagination, getPagingData } = require("../helpers/pagination.helper");
const { formatResponse } = require("../helpers/utility.helper");
const moment = require("moment");
const db = require("../models");


exports.getComplaintsGridList = async (req, res) => {
    try {
        const { page, size, status, branchId, candidateId, fromDate, toDate, userId, serviceProviderId } = req.query;

        const { limit, offset } = getPagination(page, size);

        const whereClause = {};

        // If user is a service provider, only show complaints assigned to them
        if (req.serviceProviderId) {
            whereClause.serviceProviderId = req.serviceProviderId;
        } else if (serviceProviderId) {
            // Only allow query parameter if user is not a service provider (admin)
            whereClause.serviceProviderId = serviceProviderId;
        }

        if (candidateId) {
            whereClause.raisedByCandidateId = candidateId;
        }

        if (branchId?.split(',')?.filter(Boolean)?.length) {
            whereClause.branchRefId = {
                [db.Sequelize.Op.in]: branchId.split(',').filter(Boolean)
            };
        }
        if (userId) {
            whereClause.assignedToUserId = userId;
        }
        if (status) whereClause.complaintStatus = status;
        if (fromDate && toDate) {
            whereClause.updatedAt = {
                [db.Sequelize.Op.between]: [fromDate + ' 00:00:00', toDate + ' 23:59:59']
            };
        }

        const result = await db.Complaints.findAndCountAll({
            attributes: {
                include: [
                    "complaintDescription",
                    [col("MasterIssueCategories.issueType"), "issueType"],
                    [col("MasterIssuesSubCategories.subCategoryName"), "subCategoryName"],
                    [col("Rooms.roomNumber"), "roomNumber"],
                    [col("BranchDetails.branchName"), "branchName"],
                    [col("CandidateDetails.name"), "candidateName"],
                ],
            },
            include: [
                {
                    model: db.BranchDetails,
                    as: "BranchDetails",
                    attributes: [],
                },
                {
                    model: db.Rooms,
                    as: "Rooms",
                    attributes: [],
                },
                {
                    model: db.MasterIssueCategories,
                    as: "MasterIssueCategories",
                    attributes: [],
                },
                {
                    model: db.MasterIssuesSubCategories,
                    as: "MasterIssuesSubCategories",
                    attributes: [],
                },
                {
                    model: db.CandidateDetails,
                    as: "CandidateDetails",
                    attributes: [],
                },
            ],
            where: whereClause,
            limit, offset,
            order: [["updatedAt", "DESC"]],
        });

        return res.status(200).json(await formatResponse.success(getPagingData(result, page, limit)));
    } catch (error) {
        console.log(error);
        res.status(400).json(await formatResponse.error(error));
    }
};

exports.getComplaintsDetailById = async (req, res) => {
    try {
        const { complaintId, branchId, candidateId, serviceProviderId } = req.query;

        if (!complaintId) {
            return res.status(400).json(await formatResponse.error("complaintId is required"));
        }

        const whereClause = {
            id: complaintId
        };

        if (branchId) whereClause.branchRefId = branchId;
        if (candidateId) whereClause.raisedByCandidateId = candidateId;
        
        // If user is a service provider, only show complaints assigned to them
        if (req.serviceProviderId) {
            whereClause.serviceProviderId = req.serviceProviderId;
        } else if (serviceProviderId) {
            // Only allow query parameter if user is not a service provider (admin)
            whereClause.serviceProviderId = serviceProviderId;
        }

        const result = await db.Complaints.findAll({
            attributes: {
                include: [
                    [col("MasterIssueCategories.issueType"), "issueType"],
                    [col("MasterIssuesSubCategories.subCategoryName"), "subCategoryName"],
                    [col("Rooms.roomNumber"), "roomNumber"],
                    [col("BranchDetails.branchName"), "branchName"],
                    [col("CandidateDetails.name"), "candidateName"],
                    [col("CandidateDetails.mobileNumber"), "candidateMobileNumber"],
                    [col("ComplaintsUsers.mobileNumber"), "managerMobileNumber"],
                    [col("ComplaintsCots.cotNumber"), "cotNumber"],
                    [fn('CONCAT', col('ComplaintsUsers.firstName'), ' ', col('ComplaintsUsers.lastName')), 'managerName'],
                    [col("serviceProviderComplaints.type"), "serviceProviderType"],
                    [col("serviceProviderComplaints.contactPerson"), "serviceProviderName"],
                    [col("serviceCategoryComplaints.name"), "serviceCategoryName"],
                ],
            },
            include: [
                {
                    model: db.BranchDetails,
                    as: "BranchDetails",
                    attributes: [],
                },
                {
                    model: db.Rooms,
                    as: "Rooms",
                    attributes: [],
                },
                {
                    model: db.MasterIssueCategories,
                    as: "MasterIssueCategories",
                    attributes: [],
                },
                {
                    model: db.MasterIssuesSubCategories,
                    as: "MasterIssuesSubCategories",
                    attributes: [],
                },
                {
                    model: db.CandidateDetails,
                    as: "CandidateDetails",
                    attributes: [],
                },
                {
                    model: db.Users,
                    as: "ComplaintsUsers",
                    attributes: [],
                },
                {
                    model: db.Cots,
                    as: "ComplaintsCots",
                    attributes: [],
                },
                {
                    model: db.ServiceProvider,
                    as: "serviceProviderComplaints",
                    attributes: [],
                },
                {
                    model: db.ServiceProviderCategory,
                    as: "serviceCategoryComplaints",
                    attributes: [],
                },
            ],
            where: whereClause,
            order: [["updatedAt", "DESC"]],
        });

        return res.status(200).json(await formatResponse.success(result));
    } catch (error) {
        console.log(error);
        res.status(400).json(await formatResponse.error(error));
    }
};

exports.insertUpdateComplaints = async (req, res) => {
    try {
        let insertedId = req?.body?.id || 0;
        if (!insertedId) {
            const result = await db.Complaints.create(req?.body);
            insertedId = result?.id;
        } else {
            delete req?.body?.id;
            await db.Complaints.update(req?.body, { where: { id: insertedId } });
        }
        return res.status(insertedId ? 200 : 201).json(await formatResponse.success({
            message: "Complaints updated successfully", insertedId: insertedId,
        }));
    } catch (error) {
        console.log(error);
        return res.status(400).json(await formatResponse.error(error));
    }
}

exports.getComplaintsByStatus = async (req, res) => {
    try {
        const { serviceProviderId } = req.query;

        // If user is a service provider, use their ID from session
        // Otherwise, require serviceProviderId in query (for admin access)
        let whereClause = {};
        if (req.serviceProviderId) {
            // Service provider can only see their own complaints
            whereClause.serviceProviderId = req.serviceProviderId;
        } else {
            // Admin must provide serviceProviderId in query
            if (!serviceProviderId) {
                return res.status(400).json(await formatResponse.error("serviceProviderId is required"));
            }
            whereClause.serviceProviderId = serviceProviderId;
        }

        // Fetch all complaints with all required joins
        const complaints = await db.Complaints.findAll({
            attributes: [
                "id",
                "createdAt",
                "complaintStatus",
                "complaintDescription",
                "photosUrl",
                "resolvedPhotoUrl",
                "createdBy",
                "assignedBy",
                "assignedDateTime",
                "closedDateTime",
                [db.Sequelize.col("CandidateDetails.id"), "creatorId"],
                [db.Sequelize.col("CandidateDetails.name"), "creatorName"],
                [db.Sequelize.col("BranchDetails.id"), "branchId"],
                [db.Sequelize.col("BranchDetails.branchName"), "branchName"],
                [db.Sequelize.col("Rooms.id"), "roomId"],
                [db.Sequelize.col("Rooms.roomNumber"), "roomNumber"],
                [db.Sequelize.col("ComplaintsCots.id"), "cotId"],
                [db.Sequelize.col("ComplaintsCots.cotNumber"), "cotNumber"],
                [db.Sequelize.col("MasterIssueCategories.id"), "issueTypeId"],
                [db.Sequelize.col("MasterIssueCategories.issueType"), "issueTypeName"],
                [db.Sequelize.col("MasterIssuesSubCategories.id"), "issueSubCategoryId"],
                [db.Sequelize.col("MasterIssuesSubCategories.subCategoryName"), "issueSubCategoryName"],
                [db.Sequelize.col("ComplaintsUsers.id"), "assignedToId"],
                [
                    db.Sequelize.fn(
                        "CONCAT",
                        db.Sequelize.col("ComplaintsUsers.firstName"),
                        " ",
                        db.Sequelize.col("ComplaintsUsers.lastName")
                    ),
                    "assignedToName",
                ],
            ],
            include: [
                { model: db.CandidateDetails, as: "CandidateDetails", attributes: [] },
                { model: db.BranchDetails, as: "BranchDetails", attributes: [] },
                { model: db.Rooms, as: "Rooms", attributes: [] },
                { model: db.Cots, as: "ComplaintsCots", attributes: [] },
                {
                    model: db.MasterIssueCategories,
                    as: "MasterIssueCategories",
                    attributes: [],
                },
                {
                    model: db.MasterIssuesSubCategories,
                    as: "MasterIssuesSubCategories",
                    attributes: [],
                },
                { model: db.Users, as: "ComplaintsUsers", attributes: [] },
            ],
            where: whereClause,
            order: [["updatedAt", "DESC"]],
        });

        // Group by complaintStatus
        const grouped = {
            Open: [],
            InProgress: [],
            Hold: [],
            Closed: [],
            Reject: [],
        };
        complaints.forEach((c) => {
            const status = c.complaintStatus || "Open";
            const issueImageUrl = ["Open", "InProgress"].includes(status) ? c.photosUrl : null;
            const resolvedImageUrl = ["Closed", "Resolved"].includes(status) ? c.resolvedPhotoUrl : null;
            const obj = {
                id: c.id,
                creator: c.get("creatorName") || c.createdBy || "",
                creatorId: c.get("creatorId") || "",
                branchId: c.get("branchId"),
                branchName: c.get("branchName"),
                roomId: c.get("roomId"),
                roomNumber: c.get("roomNumber"),
                cotId: c.get("cotId"),
                cotNumber: c.get("cotNumber"),
                complaintDate: c.createdAt,
                issueTypeId: c.get("issueTypeId"),
                issueTypeName: c.get("issueTypeName"),
                issueSubCategoryId: c.get("issueSubCategoryId"),
                issueSubCategoryName: c.get("issueSubCategoryName"),
                description: c.complaintDescription,
                imageUrl: c.photosUrl,
                issueImageUrl,
                resolvedImageUrl,
                createdBy: c.createdBy,
                assignedBy: c.assignedBy || "",
                assignedByName: c.assignedBy || "",
                assignedToId: c.get("assignedToId"),
                assignedToName: c.get("assignedToName"),
                pickedOn: c.assignedDateTime,
                assignedDateTime: c.assignedDateTime,
                closedOn: c.closedDateTime,
                status: c.complaintStatus,
            };
            if (grouped[status]) grouped[status].push(obj);
            else grouped["Open"].push(obj); // fallback
        });
        return res.status(200).json(await formatResponse.success(grouped));

        // const result = await db.Complaints.findAll({
        //     attributes: [
        //         'complaintStatus',
        //         [fn('COUNT', col('id')), 'count']
        //     ],
        //     where: whereClause,
        //     group: ['complaintStatus'],
        //     raw: true
        // });

        // // Initialize all statuses with 0 count
        // const statusCounts = {
        //     Open: 0,
        //     InProgress: 0,
        //     Hold: 0,
        //     Closed: 0,
        //     Reject: 0
        // };

        // Update counts from query results
        // result.forEach(item => {
        //     if (item.complaintStatus && statusCounts.hasOwnProperty(item.complaintStatus)) {
        //         statusCounts[item.complaintStatus] = parseInt(item.count) || 0;
        //     }
        // });

        // return res.status(200).json(await formatResponse.success(statusCounts));
    } catch (error) {
        console.log(error);
        return res.status(400).json(await formatResponse.error(error));
    }
};

exports.updateComplaintStatus = async (req, res) => {
    try {

        const {
            complaintId,
            serviceProviderId,
            complaintStatus: statusFromBody,
            taskStatus: taskStatusAlias,
            resolvedPhotoUrl,
            comment
        } = req.body;

        const complaintStatus = statusFromBody || taskStatusAlias;

        if (!complaintId) {
            return res.status(400).json(await formatResponse.error("complaintId is required"));
        }

        // If user is a service provider, use their ID from session
        // Otherwise, require serviceProviderId in body (for admin access)
        const effectiveServiceProviderId = req.serviceProviderId || serviceProviderId;
        if (!effectiveServiceProviderId) {
            return res.status(400).json(await formatResponse.error("serviceProviderId is required"));
        }

        if (!complaintStatus) {
            return res.status(400).json(await formatResponse.error("complaintStatus is required"));
        }


        const allowedStatuses = ['Open', 'InProgress', 'Hold', 'Closed', 'Reject'];
        if (!allowedStatuses.includes(complaintStatus)) {
            return res.status(400).json(await formatResponse.error("Invalid complaintStatus. Allowed values: Open, InProgress, Hold, Closed, Reject"));
        }


        const complaint = await db.Complaints.findOne({
            where: {
                id: complaintId
            }
        });

        if (!complaint) {
            return res.status(404).json(await formatResponse.error("Complaint not found"));
        }

        // Validation: Ensure only the assigned ServiceProvider can update the task
        // Exception: If task is Open and not yet assigned, any ServiceProvider can pick it
        if (complaint.serviceProviderId && complaint.serviceProviderId !== effectiveServiceProviderId) {
            return res.status(403).json(await formatResponse.error("This task is already assigned to another service provider"));
        }

        // Validation: When picking a task (Open -> InProgress), ensure it's not already assigned to someone else
        if (complaintStatus === 'InProgress' && complaint.complaintStatus === 'Open') {
            if (complaint.serviceProviderId && complaint.serviceProviderId !== effectiveServiceProviderId) {
                return res.status(403).json(await formatResponse.error("This task is already assigned to another service provider"));
            }
        }

        // Validation: When closing a task, ensure it belongs to this ServiceProvider
        if (complaintStatus === 'Closed') {
            if (!complaint.serviceProviderId || complaint.serviceProviderId !== effectiveServiceProviderId) {
                return res.status(403).json(await formatResponse.error("Only the assigned service provider can close this task"));
            }
            if (!resolvedPhotoUrl) {
                return res.status(400).json(await formatResponse.error("resolvedPhotoUrl is required when status is Closed"));
            }
        }

        const updateData = {
            complaintStatus: complaintStatus,
            lastUpdatedDateTime: moment().format('YYYY-MM-DD HH:mm:ss')
        };

        // Set serviceProviderId when picking a task (Open -> InProgress) if not already set
        if (complaintStatus === 'InProgress' && !complaint.serviceProviderId && effectiveServiceProviderId) {
            updateData.serviceProviderId = effectiveServiceProviderId;
        }

        if (resolvedPhotoUrl) {
            updateData.resolvedPhotoUrl = resolvedPhotoUrl;
        }

        if (comment) {
            updateData.remarks = comment;
        }

        // Set assignedDateTime when picking a task (changing from Open to InProgress)
        if (complaintStatus === 'InProgress' && !complaint.assignedDateTime) {
            updateData.assignedDateTime = moment().format('YYYY-MM-DD HH:mm:ss');
        }

        if (complaintStatus === 'Closed') {
            updateData.closedDateTime = moment().format('YYYY-MM-DD HH:mm:ss');
        }

        // Update with strict validation: only allow update if serviceProviderId matches or is being set
        await db.Complaints.update(updateData, {
            where: {
                id: complaintId,
                [db.Sequelize.Op.or]: [
                    { serviceProviderId: effectiveServiceProviderId },
                    // Allow picking unassigned tasks (serviceProviderId is null)
                    { serviceProviderId: null }
                ]
            }
        });

        return res.status(200).json(await formatResponse.success({
            message: "Complaint status updated successfully",
            complaintId: complaintId,
            complaintStatus: complaintStatus
        }));
    } catch (error) {
        console.log(error);
        return res.status(400).json(await formatResponse.error(error));
    }
};