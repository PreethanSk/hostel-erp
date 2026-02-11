const { col, Op } = require("sequelize");
const moment = require("moment")
const { getPagination, getPagingData } = require("../helpers/pagination.helper");
const { formatResponse } = require("../helpers/utility.helper");
const db = require("../models");


// group by candidate
exports.getPaymentScheduleGridList = async (req, res) => {
    try {
        const { page, size, status, candidateId, fromDate, toDate } = req.query;
        const { limit, offset } = getPagination(page, size);

        const whereClause = {};
        if (candidateId) whereClause.candidateRefId = candidateId;
        if (status) whereClause.status = status;
        if (fromDate && toDate) {
            whereClause.scheduledDate = {
                [db.Sequelize.Op.between]: [fromDate + ' 00:00:00', toDate + ' 23:59:59']
            };
        }

        const result = await db.CandidatePaymentSchedule.findAndCountAll({
            attributes: {
                include: [
                    [col("Candidate.name"), "candidateName"],
                    [col("Admission.Room.roomNumber"), "roomNumber"],
                    [col("Admission.BranchDetails.branchName"), "branchName"]
                ],
            },
            include: [
                {
                    model: db.CandidateAdmission,
                    as: "Admission",
                    include: [
                        {
                            model: db.Rooms,
                            as: "Room",
                            attributes: ["roomNumber"]
                        },
                        {
                            model: db.BranchDetails,
                            as: "BranchDetails",
                            attributes: ["branchName"]
                        }
                    ],
                    attributes: []
                },
                {
                    model: db.CandidateDetails,
                    as: "Candidate",
                    attributes: [],
                }
            ],
            where: whereClause,
            limit, offset,
            order: [["scheduledDate", "DESC"]],  // Or "updatedAt"
        });

        return res.status(200).json(await formatResponse.success(getPagingData(result, page, limit)));
    } catch (error) {
        console.log(error);
        res.status(400).json(await formatResponse.error(error));
    }
};

exports.getPaymentScheduleDetailById = async (req, res) => {
    try {
        const { scheduleId, candidateId } = req.query;
        const whereClause = {}
        if (scheduleId) whereClause.id = scheduleId;
        if (candidateId) whereClause.candidateRefId = candidateId;

        const result = await db.CandidatePaymentSchedule.findAll({
            attributes: {
                include: [
                    [col("CandidateDetails.name"), "candidateName"],
                    [col("Rooms.roomNumber"), "roomNumber"],
                    [col("BranchDetails.branchName"), "branchName"],
                    [col("CandidateDetails.mobileNumber"), "candidateMobileNumber"],
                    [col("CandidateDetails.email"), "candidateEmail"],
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
                    model: db.CandidateDetails,
                    as: "CandidateDetails",
                    attributes: [],
                }
            ],
            where: whereClause,
            order: [["scheduledDate", "DESC"]],
        });

        return res.status(200).json(await formatResponse.success(result));
    } catch (error) {
        console.log(error);
        res.status(400).json(await formatResponse.error(error));
    }
};

exports.getPaymentGridList = async (req, res) => {
    try {
        const { page, size, branchId, fromDate, toDate } = req.query;
        const { limit, offset } = getPagination(page, size);

        const whereClause = {};
        const scheduleWhere = {};
        if (fromDate && toDate) {
            scheduleWhere.scheduledDate = {
                [db.Sequelize.Op.between]: [fromDate, toDate],
            };
        }

        const result = await db.CandidatePaymentDetails.findAndCountAll({
            attributes: [
                'id',
                'candidateRefId',
                'admissionRefId',
                'paidAmount',
                'dueToPaid',
                'dueDate',
                'createdAt',
                'updatedAt',
            ],
            include: [
                {
                    model: db.CandidateDetails,
                    as: "CandidateDetails",
                    attributes: ['name', 'candidateId']
                },
                {
                    model: db.CandidateAdmission,
                    as: "CandidateAdmission",
                    required: true,
                    where: branchId ? { branchRefId: branchId } : {},
                    include: [
                        {
                            model: db.BranchDetails,
                            as: "BranchDetails",
                            attributes: ['id', 'branchName']
                        },
                        {
                            model: db.CandidatePaymentSchedule,
                            as: "PaymentSchedules",
                            attributes: [],
                            required: !!(fromDate && toDate),
                            where: scheduleWhere,
                        }
                    ]
                }
            ],
            where: whereClause,
            limit, offset,
            order: [["updatedAt", "DESC"]],
            // Return nested objects so we can map to a flat response shape
            nest: true
        });

        // Transform the result to match the required flat format expected by the grid
        const transformedResult = {
            count: result.count,
            rows: result.rows.map(row => ({
                id: row.id,
                candidateRefId: row.candidateRefId,
                candidateId: row.CandidateDetails?.candidateId,
                admissionId: row.admissionRefId,
                paidAmount: row.paidAmount,
                dueToPaid: row.dueToPaid,
                dueDate: row.dueDate,
                createdAt: row.createdAt,
                updatedAt: row.updatedAt,
                candidateName: row.CandidateDetails?.name,
                branchId: row.CandidateAdmission?.BranchDetails?.id,
                branchName: row.CandidateAdmission?.BranchDetails?.branchName
            })),
        };

        return res.status(200).json(await formatResponse.success(getPagingData(transformedResult, page, limit)));
    } catch (error) {
        console.log(error);
        res.status(400).json(await formatResponse.error(error));
    }
};

// exports.insertUpdatePaymentSchedule = async (req, res) => {
//     try {
//         let insertedId = req?.body?.id || 0;
//         if (!insertedId) {
//             // If no ID is provided, it's an insert
//             const result = await db.CandidatePaymentSchedule.create(req?.body);
//             insertedId = result?.id;
//         } else {
//             delete req?.body?.id;
//             await db.CandidatePaymentSchedule.update(req?.body, { where: { id: insertedId } });
//         }
//         return res.status(insertedId ? 200 : 201).json(await formatResponse.success({
//             message: "Payment schedule updated successfully", insertedId: insertedId,
//         }));
//     } catch (error) {
//         console.log(error);
//         return res.status(400).json(await formatResponse.error(error));
//     }
// };

exports.generateCandidatePaymentSchedules = async (req, res) => {
    try {
        console.log("Generating candidate payment schedules...");
        // Current date (start of day to avoid partial‑day issues)
        const currentDate = moment().startOf("day");
        const today = currentDate.clone();
        const dayOfMonth = today.date();
        // Allow manual "catch-up" runs via query param ?force=true
        const isForceRun = req?.query?.force === "true";
        // Run monthly schedule generation only on the 1st of each month
        const isStartOfMonth = dayOfMonth === 1 || isForceRun;
        // Run late-fee check once per month (day after grace period of 7 days)
        const isLateFeeRunDay = dayOfMonth === 8 || isForceRun;

        // Step 1: Fetch all admitted candidates
        const admissionsList = await db.CandidateAdmission.findAll({
            where: {
                isActive: true,
                admissionStatus: "Approved",
                [Op.or]: [{ vacate: false }, { vacate: null }],
            },
            include: [
                {
                    model: db.CandidateDetails,
                    as: "CandidateDetails",
                    attributes: ["id", "name"],
                },
                {
                    model: db.Rooms,
                    as: "Room",
                    attributes: ["id", "roomNumber"],
                },
            ],
        });

        const totalRecords = [];

        // Step 2: For each admitted candidate, generate their payment schedule
        for (const admission of admissionsList) {
            const {
                id,
                candidateRefId,
                dateOfAdmission,
                noDayStayType,
                monthlyRent,
                ebCharges,
                miscellaneousCharges,
            } = admission;

            const rent = Number(monthlyRent || 0);
            if (!dateOfAdmission || rent <= 0) continue;

            // Step 3: Fetch the last paid record from the payment details
            const lastPayment = await db.CandidatePaymentDetails.findOne({
                where: { admissionRefId: id },
                order: [["updatedAt", "DESC"]],
            });

            const scheduleRecords = [];
            let totalAmounts = 0;
            let totalEbChargePending = 0;
            let totalMiscellaneousPending = 0;

            const admissionDate = moment(dateOfAdmission, "YYYY-MM-DD").startOf("day");

            // ***** MONTHLY STAY LOGIC *****
            if (noDayStayType === "Month") {
                let remainingAmountForSchedule = 0;

                // 1) Generate monthly schedules only on the 1st of each month
                if (isStartOfMonth) {
                    let startDate;
                    console.log("lastPayment", lastPayment && lastPayment?.dueDate);
                    if (lastPayment && lastPayment?.dueDate) {
                        // Anchor to the start of the due month so all schedules fall on 1st
                        startDate = moment(lastPayment?.dueDate, "YYYY-MM-DD").startOf("month");
                    } else {
                        // First full‑month rent starts from the next month after admission (1st of month)
                        startDate = admissionDate.clone().startOf("month");
                    }

                    // Number of whole calendar months between start month and current month.
                    // Example: startDate = 2025-12-01, currentDate = 2026-01-02 => 1 month.
                    let monthsToGenerate = currentDate
                        .clone()
                        .startOf("month")
                        .diff(startDate.clone().startOf("month"), "months");
                    console.log("currentDate:::", startDate, currentDate, monthsToGenerate);
                    if (monthsToGenerate < 0) monthsToGenerate = 0;
                    console.log("monthsToGenerate", dateOfAdmission, startDate, monthsToGenerate);
                    for (let i = 0; i < monthsToGenerate; i++) {
                        const scheduledDate = startDate.add(1, "month").format("YYYY-MM-DD");

                        // amountDue will be overwritten later with total remaining amount
                        scheduleRecords.push({
                            admissionRefId: id,
                            candidateRefId,
                            scheduledDate,
                            amountDue: rent,
                            status: "pending",
                            isActive: true,
                        });

                        totalAmounts += rent;
                        totalEbChargePending += Number(ebCharges || 0);
                        totalMiscellaneousPending += Number(miscellaneousCharges || 0);
                    }

                    // Update latest payment record with aggregated dues for generated months
                    if (lastPayment && monthsToGenerate > 0) {
                        const extraRentDue = Number(totalAmounts || 0);
                        const extraEbDue = Number(totalEbChargePending || 0);
                        const extraMiscDue = Number(totalMiscellaneousPending || 0);
                        const extraDue = extraRentDue + extraEbDue + extraMiscDue;

                        const previousPending =
                            Number(lastPayment.totalPendingAmount || 0);
                        const newTotalPending = previousPending + extraDue;

                        const previousMonthlyRentPending =
                            Number(lastPayment.monthlyRentPending || 0);
                        const newMonthlyRentPending =
                            previousMonthlyRentPending + extraRentDue;

                        lastPayment.dueDate = currentDate.format("YYYY-MM-DD");
                        lastPayment.dueToPaid = newTotalPending;
                        lastPayment.totalPendingAmount = newTotalPending;
                        lastPayment.monthlyRentPending = newMonthlyRentPending;
                        lastPayment.ebChargePending =
                            Number(lastPayment.ebChargePending || 0) + extraEbDue;
                        lastPayment.miscellaneousPending =
                            Number(lastPayment.miscellaneousPending || 0) + extraMiscDue;

                        await lastPayment.save();

                        remainingAmountForSchedule = newTotalPending;
                    } else if (monthsToGenerate > 0) {
                        // No previous payment record: remaining = all newly generated dues
                        remainingAmountForSchedule =
                            Number(totalAmounts || 0) +
                            Number(totalEbChargePending || 0) +
                            Number(totalMiscellaneousPending || 0);
                    }

                    // Set amountDue on each generated schedule row to total remaining amount
                    if (scheduleRecords.length > 0 && remainingAmountForSchedule > 0) {
                        const scheduleAmount = remainingAmountForSchedule;
                        scheduleRecords.forEach((record) => {
                            record.amountDue = scheduleAmount;
                        });
                    }
                }

                // 2) Apply late fee if monthly rent is not paid before 7th (run on 8th)
                if (isLateFeeRunDay && lastPayment) {
                    const monthlyPending = Number(lastPayment.monthlyRentPending || 0);
                    const totalPending = Number(lastPayment.totalPendingAmount || 0);

                    // If there is any pending amount, add a flat late fee of 100
                    if (monthlyPending > 0 || totalPending > 0) {
                        const lateFee = 100;
                        lastPayment.lateFeePending =
                            Number(lastPayment.lateFeePending || 0) + lateFee;
                        lastPayment.totalPendingAmount =
                            Number(lastPayment.totalPendingAmount || 0) + lateFee;
                        lastPayment.dueToPaid =
                            Number(lastPayment.dueToPaid || 0) + lateFee;

                        await lastPayment.save();
                    }
                }

                // ***** DAILY STAY LOGIC *****
            } else if (noDayStayType === "Days") {
                let remainingAmountForSchedule = 0;

                // Start from last due date if present, otherwise from admission date
                let startDate =
                    lastPayment && lastPayment.dueDate
                        ? moment(lastPayment.dueDate, "YYYY-MM-DD").startOf("day")
                        : admissionDate.clone();

                let daysToGenerate = currentDate.diff(startDate, "days");
                if (daysToGenerate < 0) daysToGenerate = 0;

                for (let i = 0; i < daysToGenerate; i++) {
                    const scheduledDate = startDate.add(1, "day").format("YYYY-MM-DD");

                    // amountDue will be overwritten later with total remaining amount
                    scheduleRecords.push({
                        admissionRefId: id,
                        candidateRefId,
                        scheduledDate,
                        // For daily stay, assume monthlyRent already represents per‑day tariff
                        amountDue: rent,
                        status: "pending",
                        isActive: true,
                    });

                    totalAmounts += rent;
                }

                if (lastPayment && daysToGenerate > 0) {
                    const extraRentDue = Number(totalAmounts || 0);
                    const previousPending =
                        Number(lastPayment.totalPendingAmount || 0);
                    const newTotalPending = previousPending + extraRentDue;

                    const previousMonthlyRentPending =
                        Number(lastPayment.monthlyRentPending || 0);
                    const newMonthlyRentPending =
                        previousMonthlyRentPending + extraRentDue;

                    lastPayment.dueDate = currentDate.format("YYYY-MM-DD");
                    lastPayment.dueToPaid = newTotalPending;
                    lastPayment.totalPendingAmount = newTotalPending;
                    lastPayment.monthlyRentPending = newMonthlyRentPending;
                    // For daily stay, assume EB/Misc are part of daily tariff or handled elsewhere

                    await lastPayment.save();

                    remainingAmountForSchedule = newTotalPending;
                } else if (daysToGenerate > 0) {
                    // No previous payment record: remaining = all newly generated dues
                    remainingAmountForSchedule = Number(totalAmounts || 0);
                }

                if (scheduleRecords.length > 0 && remainingAmountForSchedule > 0) {
                    const scheduleAmount = remainingAmountForSchedule;
                    scheduleRecords.forEach((record) => {
                        record.amountDue = scheduleAmount;
                    });
                }
            }

            // Step 5: Collect all generated schedule records (we'll insert after the loop)
            if (scheduleRecords.length > 0) {
                totalRecords.push(...scheduleRecords);
                console.log(
                    `Admission ${id} (${noDayStayType}) -> ${scheduleRecords.length} schedules`,
                );
            }
        }

        console.log("Total schedules to create:", totalRecords.length);

        // Persist all schedules in a single bulk insert
        if (totalRecords.length > 0) {
            await db.CandidatePaymentSchedule.bulkCreate(totalRecords);
        }

        // Step 6: Return success response
        return res
            .status(200)
            .json(
                await formatResponse.success({
                    message:
                        "Payment schedules generated successfully for all admitted candidates.",
                    data: totalRecords.length,
                }),
            );
    } catch (error) {
        console.error("Error generating payment schedules:", error);
        return res.status(400).json(await formatResponse.error(error));
    }
};
