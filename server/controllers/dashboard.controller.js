const { formatResponse } = require("../helpers/utility.helper");
const db = require("../models");

exports.getDashboardPayments = async (req, res) => {
  try {
    const { from, to, branchId } = req.query;

    // Define defaults
    const now = new Date();
    const defaultFrom = new Date();
    defaultFrom.setMonth(now.getMonth() - 1);

    const fromDate = from || defaultFrom.toISOString().slice(0, 10);
    const toDate = to || now.toISOString().slice(0, 10);

    // Build branch filter if branchId is passed
    let branchFilter = '';
    if (branchId) {
      const ids = branchId.split(',').map(id => `'${id.trim()}'`).join(',');
      branchFilter = `AND b.id IN (${ids})`;
    }

    // SQL query - using same grouping logic as detail query to ensure consistency
    // Group by admission first (like detail query), then sum the grouped results
    const query = `
    SELECT 
      COUNT(DISTINCT grouped.admissionId) AS totalCandidates,
      COALESCE(SUM(grouped.paidAmount), 0) AS totalPaid,
      (
        COALESCE(SUM(grouped.paidAmount), 0) +
        COALESCE(SUM(grouped.dueToPaid), 0) +
        COALESCE(SUM(grouped.refundAmount), 0)
      ) AS totalPayments,
      COALESCE(SUM(grouped.advancePaid), 0) AS totalAdvance,
      COALESCE(SUM(grouped.dueToPaid), 0) AS totalPending,
      COALESCE(SUM(grouped.refundAmount), 0) AS totalRefund
    FROM (
      SELECT 
        ca.id AS admissionId,
        COALESCE(SUM(CAST(cpd.paidAmount AS DECIMAL(15,2))), 0) AS paidAmount,
        MAX(CAST(ca.advancePaid AS DECIMAL(15,2))) AS advancePaid,
        COALESCE(SUM(CAST(cpd.dueToPaid AS DECIMAL(15,2))), 0) AS dueToPaid,
        MAX(CAST(ca.refundAmount AS DECIMAL(15,2))) AS refundAmount
      FROM CANDIDATE_ADMISSION ca
      LEFT JOIN CANDIDATE_DETAILS cd ON cd.id = ca.candidateRefId
      LEFT JOIN CANDIDATE_PAYMENT_DETAILS cpd ON ca.id = cpd.admissionRefId
      LEFT JOIN BRANCH_DETAILS b ON ca.branchRefId = b.id
      WHERE ca.admissionStatus IN ('Approved', 'Cancelled')
        AND cpd.updatedAt BETWEEN :from AND :to
        ${branchFilter}
      GROUP BY ca.id
    ) AS grouped
  `;

    const [results] = await db.sequelize.query(query, {
      replacements: {
        from: `${fromDate} 00:00:00`,
        to: `${toDate} 23:59:59`,
      },
      type: db.sequelize.QueryTypes.SELECT,
    });

    const data = {
      totalCandidates: parseInt(results.totalCandidates) || 0,
      totalPaid: parseFloat(results.totalPaid) || 0,
      totalPayments: parseFloat(results.totalPayments) || 0,
      totalAdvance: parseFloat(results.totalAdvance) || 0,
      totalPending: parseFloat(results.totalPending) || 0,
      totalRefund: parseFloat(results.totalRefund) || 0,
    };

    return res.status(200).json(await formatResponse.success(data));
  } catch (error) {
    console.error('Error in getDashboardPayments:', error);
    return res.status(500).json(await formatResponse.error('Something went wrong while fetching dashboard data.'));
  }
};

exports.getDashboardBookings = async (req, res) => {
  try {
    const { from, to, branchId } = req.query;
    let whereClause = "";
    let replacements = {};
    let fromDate = from;
    let toDate = to;
    let branchFilter = "";
    if (branchId) {
      const ids = branchId
        .split(",")
        .map((id) => `'${id}'`)
        .join(",");
      branchFilter = ` AND ca.branchRefId IN (${ids})`;
    }
    if (!from && !to) {
      // Default to past one month
      const now = new Date();
      const lastMonth = new Date();
      lastMonth.setMonth(now.getMonth() - 1);
      fromDate = lastMonth.toISOString().slice(0, 10);
      toDate = now.toISOString().slice(0, 10);
    }
    if (fromDate && toDate) {
      whereClause = `WHERE ca.updatedAt BETWEEN :from AND :to${branchFilter}`;
      replacements = { from: `${fromDate} 00:00:00`, to: `${toDate} 23:59:59` };
    } else if (fromDate) {
      whereClause = `WHERE ca.updatedAt >= :from${branchFilter}`;
      replacements = { from: `${fromDate} 00:00:00` };
    } else if (toDate) {
      whereClause = `WHERE ca.updatedAt <= :to${branchFilter}`;
      replacements = { to: `${toDate} 23:59:59` };
    } else if (branchFilter) {
      whereClause = `WHERE 1=1${branchFilter}`;
    }

    const [results] = await db.sequelize.query(
      `
      SELECT
        COUNT(*) AS totalBooking,
        SUM(CASE WHEN (ca.admissionStatus = 'Cancelled' or ca.admissionStatus = 'Rejected') THEN 1 ELSE 0 END) AS cancelled,
        SUM(CASE WHEN ca.paymentStatus = 'Paid' THEN 1 ELSE 0 END) AS confirmBooking
      FROM CANDIDATE_ADMISSION ca
      ${whereClause}
    `,
      { replacements }
    );
    // Find bookings whose cot is still marked as vacant in branch details (data mismatch)
    const [vacantRows] = await db.sequelize.query(
      `
      SELECT 
        ca.cotRefId AS cotId,
        b.cotVacant
      FROM CANDIDATE_ADMISSION ca
      LEFT JOIN BRANCH_DETAILS b ON ca.branchRefId = b.id
      ${whereClause}
    `,
      { replacements }
    );

    const vacantCount = vacantRows.filter((row) => {
      if (!row.cotId || !row.cotVacant) return false;
      const vacantIds = row.cotVacant
        .split(",")
        .map((id) => id.trim())
        .filter((id) => id !== "")
        .map((id) => Number(id));
      return vacantIds.includes(Number(row.cotId));
    }).length;

    const result = {
      totalBooking: results[0].totalBooking || 0,
      cancelled: results[0].cancelled || 0,
      confirmBooking: results[0].confirmBooking || 0,
      pendingBooking:
        (results[0].totalBooking || 0) -
        (results[0].cancelled || 0) -
        (results[0].confirmBooking || 0),
      vacantCount,
    };
    return res.status(200).json(await formatResponse.success(result));
  } catch (error) {
    console.log(error);
    res.status(400).json(await formatResponse.error(error));
  }
};
exports.getDashboardCots = async (req, res) => {
  try {
    const { from, to, branchId } = req.query;
    let whereClause = "";
    let replacements = {};
    let fromDate = from;
    let toDate = to;
    let branchFilter = "";
    if (branchId) {
      const ids = branchId.split(",").map((id) => `'${id}'`).join(",");
      branchFilter = ` AND id IN (${ids})`;
    }
    if (!from && !to) {
      // Default to past one month
      const now = new Date();
      const lastMonth = new Date();
      lastMonth.setMonth(now.getMonth() - 1);
      fromDate = lastMonth.toISOString().slice(0, 10);
      toDate = now.toISOString().slice(0, 10);
    }
    if (fromDate && toDate) {
      whereClause = `AND updatedAt BETWEEN :from AND :to${branchFilter}`;
      replacements = { from: `${fromDate} 00:00:00`, to: `${toDate} 23:59:59` };
    } else if (fromDate) {
      whereClause = `AND updatedAt >= :from${branchFilter}`;
      replacements = { from: `${fromDate} 00:00:00` };
    } else if (toDate) {
      whereClause = `AND updatedAt <= :to${branchFilter}`;
      replacements = { to: `${toDate} 23:59:59` };
    } else if (branchFilter) {
      whereClause = `AND 1=1${branchFilter}`;
    }

    const [results] = await db.sequelize.query(
      `
            SELECT
              SUM(LENGTH(REPLACE(totalCots, ' ', '')) - LENGTH(REPLACE(REPLACE(totalCots, ' ', ''), ',', '')) + 1) AS total,
              SUM(LENGTH(REPLACE(cotOccupied, ' ', '')) - LENGTH(REPLACE(REPLACE(cotOccupied, ' ', ''), ',', '')) + 1) AS occupied,
              SUM(LENGTH(REPLACE(cotVacant, ' ', '')) - LENGTH(REPLACE(REPLACE(cotVacant, ' ', ''), ',', '')) + 1) AS available
            FROM BRANCH_DETAILS
            WHERE (totalCots IS NOT NULL OR cotOccupied IS NOT NULL OR cotVacant IS NOT NULL)
            ${whereClause}
          `,
      { replacements }
    );

    const result = {
      total: results[0].total || 0,
      occupied: results[0].occupied || 0,
      available: results[0].available || 0,
      booked: Math.max(0, (results[0].total || 0) - (results[0].occupied || 0) - (results[0].available || 0)),
    };
    return res.status(200).json(await formatResponse.success(result));
  } catch (error) {
    console.log(error);
    res.status(400).json(await formatResponse.error(error));
  }
}

exports.getDashboardComplaints = async (req, res) => {
  try {
    const { from, to, branchId } = req.query;
    let whereClause = "";
    let replacements = {};
    let fromDate = from;
    let toDate = to;
    let branchFilter = "";
    if (branchId) {
      const ids = branchId
        .split(",")
        .map((id) => `'${id}'`)
        .join(",");
      branchFilter = ` AND branchRefId IN (${ids})`;
    }
    if (!from && !to) {
      // Default to past one month
      const now = new Date();
      const lastMonth = new Date();
      lastMonth.setMonth(now.getMonth() - 1);
      fromDate = lastMonth.toISOString().slice(0, 10);
      toDate = now.toISOString().slice(0, 10);
    }
    if (fromDate && toDate) {
      whereClause = `WHERE updatedAt BETWEEN :from AND :to${branchFilter}`;
      replacements = { from: `${fromDate} 00:00:00`, to: `${toDate} 23:59:59` };
    } else if (fromDate) {
      whereClause = `WHERE updatedAt >= :from${branchFilter}`;
      replacements = { from: `${fromDate} 00:00:00` };
    } else if (toDate) {
      whereClause = `WHERE updatedAt <= :to${branchFilter}`;
      replacements = { to: `${toDate} 23:59:59` };
    } else if (branchFilter) {
      whereClause = `WHERE 1=1${branchFilter}`;
    }

    const [counts] = await db.sequelize.query(
      `
            SELECT complaintStatus, COUNT(*) as count
            FROM COMPLAINTS
            ${whereClause}
            GROUP BY complaintStatus
          `,
      { replacements }
    );

    const result = { Open: 0, InProgress: 0, Hold: 0, Closed: 0 };
    counts.forEach((item) => {
      result[item.complaintStatus] = parseInt(item.count, 10);
    });
    return res.status(200).json(await formatResponse.success(result));
  } catch (error) {
    console.log(error);
    res.status(400).json(await formatResponse.error(error));
  }
};

exports.getDashboardPaymentsDetail = async (req, res) => {
  try {
    const { from, to, branchId } = req.query;

    // Default date range: past 1 month
    const now = new Date();
    const defaultFrom = new Date();
    defaultFrom.setMonth(now.getMonth() - 1);

    const fromDate = from || defaultFrom.toISOString().slice(0, 10);
    const toDate = to || now.toISOString().slice(0, 10);

    // Branch filter (if provided)
    let branchFilter = '';
    if (branchId) {
      const ids = branchId.split(',').map((id) => `'${id.trim()}'`).join(',');
      branchFilter = `AND b.id IN (${ids})`;
    }

    const query = `
      SELECT 
        cd.id AS candidateId,
        cd.name AS candidateName,
        cd.mobileNumber,
        b.id AS branchId,
        b.branchName,
        r.id AS roomId,
        r.roomNumber,
        c.id AS cotId,
        c.cotNumber,
        cpd.updatedAt,
        cpd.dueDate,
        cpd.advancePending,
        cpd.monthlyRentPending,
        cpd.lateFeePending,
        cpd.tokenAmountPending,
        cpd.advancePaid,
        cpd.monthlyRentPaid,
        cpd.lateFeePaid,
        cpd.tokenAmountPaid,
        COALESCE(SUM(CAST(cpd.paidAmount AS DECIMAL(15,2))), 0) AS totalPayment,
        COALESCE(SUM(CAST(cpd.dueToPaid AS DECIMAL(15,2))), 0) AS pendingPayment,
        COALESCE(SUM(CAST(ca.advancePaid AS DECIMAL(15,2))), 0) AS advance,
        COALESCE(SUM(CAST(ca.refundAmount AS DECIMAL(15,2))), 0) AS refund
      FROM CANDIDATE_ADMISSION ca
      LEFT JOIN CANDIDATE_DETAILS cd ON ca.candidateRefId = cd.id
      LEFT JOIN CANDIDATE_PAYMENT_DETAILS cpd ON ca.id = cpd.admissionRefId
      LEFT JOIN BRANCH_DETAILS b ON ca.branchRefId = b.id
      LEFT JOIN ROOMS r ON ca.roomRefId = r.id
      LEFT JOIN COTS c ON ca.cotRefId = c.id
      WHERE ca.admissionStatus IN ('Approved', 'Cancelled')
        AND cpd.updatedAt BETWEEN :from AND :to
        ${branchFilter}
      GROUP BY 
        cd.id, cd.name, cd.mobileNumber, 
        b.id, b.branchName, 
        r.id, r.roomNumber, 
        c.id, c.cotNumber, cpd.updatedAt, cpd.dueDate, 
        cpd.advancePending, cpd.monthlyRentPending, cpd.lateFeePending, cpd.tokenAmountPending,
        cpd.advancePaid, cpd.monthlyRentPaid, cpd.lateFeePaid, cpd.tokenAmountPaid
      ORDER BY cd.id DESC
    `;

    const rows = await db.sequelize.query(query, {
      replacements: {
        from: `${fromDate} 00:00:00`,
        to: `${toDate} 23:59:59`,
      },
      type: db.sequelize.QueryTypes.SELECT,
    });

    // Categorize data
    const totalPayments = rows?.filter((item) =>
      parseFloat(item.totalPayment || '0') > 0 ||
      parseFloat(item.pendingPayment || '0') > 0 ||
      parseFloat(item.advance || '0') > 0 ||
      parseFloat(item.refund || '0') > 0
    );

    const paid = rows?.filter((item) => parseFloat(item.totalPayment || '0') > 0);
    const advance = rows?.filter((item) => parseFloat(item.advance || '0') > 0);
    const pending = rows?.filter((item) => parseFloat(item.pendingPayment || '0') > 0);
    const refund = rows?.filter((item) => parseFloat(item.refund || '0') > 0);

    return res.status(200).json(
      await formatResponse.success({
        totalPayments,
        paid,
        advance,
        pending,
        refund,
      })
    );
  } catch (error) {
    console.error('Error in getDashboardPaymentsDetail:', error);
    res.status(500).json(await formatResponse.error('Failed to fetch dashboard payment details.'));
  }
};


exports.getDashboardBookingsDetail = async (req, res) => {
  try {
    const { from, to, branchId } = req.query;
    let whereClause = "";
    let replacements = {};
    let fromDate = from;
    let toDate = to;
    let branchFilter = "";
    if (branchId) {
      const ids = branchId
        .split(",")
        .map((id) => `'${id}'`)
        .join(",");
      branchFilter = ` AND branchRefId IN (${ids})`;
    }
    if (!from && !to) {
      // Default to past one month
      const now = new Date();
      const lastMonth = new Date();
      lastMonth.setMonth(now.getMonth() - 1);
      fromDate = lastMonth.toISOString().slice(0, 10);
      toDate = now.toISOString().slice(0, 10);
    }
    if (fromDate && toDate) {
      whereClause = `WHERE ca.updatedAt BETWEEN :from AND :to${branchFilter}`;
      replacements = { from: `${fromDate} 00:00:00`, to: `${toDate} 23:59:59` };
    } else if (fromDate) {
      whereClause = `WHERE ca.updatedAt >= :from${branchFilter}`;
      replacements = { from: `${fromDate} 00:00:00` };
    } else if (toDate) {
      whereClause = `WHERE ca.updatedAt <= :to${branchFilter}`;
      replacements = { to: `${toDate} 23:59:59` };
    } else if (branchFilter) {
      whereClause = `WHERE 1=1${branchFilter}`;
    }

    // Get all bookings with all required details
    const [allBookings] = await db.sequelize.query(
      `SELECT 
        ca.id as admissionId,
        cd.id as candidateId,
        cd.name as candidateName,
        cd.mobileNumber,
        cd.email,
        b.id as branchId,
        b.branchName,
        b.cotVacant as branchCotVacant,
        r.id as roomId,
        r.roomNumber,
        c.id as cotId,
        c.cotNumber,
        ca.monthlyRent as roomRent,
        ca.admissionStatus,
        ca.paymentStatus,
        ca.updatedAt as statusUpdatedAt
      FROM CANDIDATE_ADMISSION ca
      LEFT JOIN CANDIDATE_DETAILS cd ON ca.candidateRefId = cd.id
      LEFT JOIN BRANCH_DETAILS b ON ca.branchRefId = b.id
      LEFT JOIN ROOMS r ON ca.roomRefId = r.id
      LEFT JOIN COTS c ON ca.cotRefId = c.id
      ${whereClause}
      ORDER BY ca.createdAt DESC`,
      { replacements }
    );

    // Filter for confirmed bookings: Paid AND not cancelled/rejected
    const confirmBooking = allBookings
      ?.filter((b) => 
        b.paymentStatus === "Paid" && 
        b.admissionStatus !== "Cancelled" && 
        b.admissionStatus !== "Rejected"
      )
      ?.map((b) => ({
        candidateId: b.candidateId,
        candidateName: b.candidateName,
        mobileNumber: b.mobileNumber,
        email: b.email,
        branchId: b.branchId,
        branchName: b.branchName,
        roomId: b.roomId,
        roomNumber: b.roomNumber,
        cotId: b.cotId,
        cotNumber: b.cotNumber,
        roomRent: b.roomRent,
        status: b.admissionStatus,
        paymentStatus: b.paymentStatus,
      }));

    const cancelled = allBookings
      ?.filter(
        (b) =>
          b.admissionStatus === "Cancelled" || b.admissionStatus === "Rejected"
      )
      ?.map((b) => ({
        candidateId: b.candidateId,
        candidateName: b.candidateName,
        mobileNumber: b.mobileNumber,
        email: b.email,
        branchId: b.branchId,
        branchName: b.branchName,
        roomId: b.roomId,
        roomNumber: b.roomNumber,
        cotId: b.cotId,
        cotNumber: b.cotNumber,
        roomRent: b.roomRent,
        status: b.admissionStatus,
        rejectedOrCancelledDate: b.statusUpdatedAt,
      }));
    const totalBooking = allBookings.map((b) => ({
      candidateId: b.candidateId,
      candidateName: b.candidateName,
      mobileNumber: b.mobileNumber,
      email: b.email,
      branchId: b.branchId,
      branchName: b.branchName,
      roomId: b.roomId,
      roomNumber: b.roomNumber,
      cotId: b.cotId,
      cotNumber: b.cotNumber,
      roomRent: b.roomRent,
      status: b.admissionStatus,
      paymentStatus: b.paymentStatus,
    }));

    // Bookings whose cot is still marked as vacant in branch details (data mismatch)
    const vacant = allBookings
      ?.filter((b) => {
        if (!b.cotId || !b.branchCotVacant) return false;
        const vacantIds = b.branchCotVacant
          .split(",")
          .map((id) => id.trim())
          .filter((id) => id !== "")
          .map((id) => Number(id));
        return vacantIds.includes(Number(b.cotId));
      })
      ?.map((b) => ({
        candidateId: b.candidateId,
        candidateName: b.candidateName,
        mobileNumber: b.mobileNumber,
        email: b.email,
        branchId: b.branchId,
        branchName: b.branchName,
        roomId: b.roomId,
        roomNumber: b.roomNumber,
        cotId: b.cotId,
        cotNumber: b.cotNumber,
        roomRent: b.roomRent,
        status: b.admissionStatus,
        paymentStatus: b.paymentStatus,
      }));

    const pendingBooking = allBookings
      ?.filter((b) =>
        b.admissionStatus !== "Cancelled" &&
        b.admissionStatus !== "Rejected" &&
        b.paymentStatus !== "Paid"
      )
      ?.map((b) => ({
        candidateId: b.candidateId,
        candidateName: b.candidateName,
        mobileNumber: b.mobileNumber,
        email: b.email,
        branchId: b.branchId,
        branchName: b.branchName,
        roomId: b.roomId,
        roomNumber: b.roomNumber,
        cotId: b.cotId,
        cotNumber: b.cotNumber,
        roomRent: b.roomRent,
        status: b.admissionStatus,
        paymentStatus: b.paymentStatus,
      }));

    return res.status(200).json(
      await formatResponse.success({
        confirmBooking,
        pendingBooking,
        cancelled,
        totalBooking,
        vacant,
        vacantCount: vacant?.length || 0,
      })
    );
  } catch (error) {
    console.log(error);
    res.status(400).json(await formatResponse.error(error));
  }
};
exports.getDashboardCotsDetail = async (req, res) => {
  try {
    const { from, to, branchId } = req.query;
    let whereClause = "";
    let replacements = {};
    let fromDate = from;
    let toDate = to;
    let branchFilter = '';
    if (branchId) {
      const ids = branchId.split(',').map((id) => `'${id.trim()}'`).join(',');
      branchFilter = `AND b.id IN (${ids})`;
    }

    if (!from && !to) {
      const now = new Date();
      const lastMonth = new Date();
      lastMonth.setMonth(now.getMonth() - 1);
      fromDate = lastMonth.toISOString().slice(0, 10);
      toDate = now.toISOString().slice(0, 10);
    }
    if (fromDate && toDate) {
      whereClause = "WHERE c.updatedAt BETWEEN :from AND :to";
      replacements = { from: `${fromDate} 00:00:00`, to: `${toDate} 23:59:59` };
    } else if (fromDate) {
      whereClause = "WHERE c.updatedAt >= :from";
      replacements = { from: `${fromDate} 00:00:00` };
    } else if (toDate) {
      whereClause = "WHERE c.updatedAt <= :to";
      replacements = { to: `${toDate} 23:59:59` };
    }
    const branchDetails = await db.BranchDetails.findAll();

    const [totalCots] = await db.sequelize.query(
      `SELECT 
        c.id as cotId,
        ca.candidateRefId as candidateId,
        cd.name as candidateName,
        cd.mobileNumber,
        cd.email,
        b.id as branchId,
        b.branchName,
        r.id as roomId,
        r.roomNumber,
        c.cotNumber,
        ct.type as cotTypeName,
        ca.monthlyRent as roomRent,
        c.rentAmount,
        ca.admissionStatus as status,
        ca.paymentStatus,
        ca.admissionType,
        ca.dateOfAdmission
       FROM COTS c
       LEFT JOIN ROOMS r ON c.roomId = r.id
       LEFT JOIN BRANCH_DETAILS b ON r.branchId = b.id
       LEFT JOIN MASTER_COT_TYPE ct ON c.cotTypeId = ct.id
       LEFT JOIN CANDIDATE_ADMISSION ca ON ca.cotRefId = c.id
       LEFT JOIN CANDIDATE_DETAILS cd ON ca.candidateRefId = cd.id
      WHERE 1=1 ${branchFilter}
       -- ${whereClause}
       ORDER BY b.branchName, c.cotNumber`,
      { replacements }
    );

    let occupied = [], available = [], booked = [], maintenance = [];
    totalCots?.forEach((fItem) => {
      if (fItem?.status === 'Approved' && (fItem?.paymentStatus === 'Paid' || fItem?.paymentStatus === 'Partially Paid' || fItem?.admissionType === 'Staff')) {
        occupied.push(fItem)
      } else if (fItem?.status === 'Approved') {
        booked.push(fItem)
      } else {
        const maintenanceCots = branchDetails?.find((cItem) => cItem?.id === fItem?.branchId)?.cotMaintenance?.split(",").map(Number) || []
        if (maintenanceCots?.includes(fItem?.cotId)) {
          maintenance.push(fItem)
        } else {
          available.push(fItem)
        }
      }
    })

    return res.status(200).json(
      await formatResponse.success({
        totalCots: totalCots,
        occupied: occupied,
        maintenance: maintenance,
        available: available,
        booked: booked,
      })
    );
  } catch (error) {
    console.log(error);
    res.status(400).json(await formatResponse.error(error));
  }
};

exports.getDashboardComplaintsDetail = async (req, res) => {
  try {
    const { from, to, branchId, status, serviceProviderId } = req.query;
    let whereClause = {};
    if (from && to) {
      whereClause.updatedAt = {
        [db.Sequelize.Op.between]: [`${from} 00:00:00`, `${to} 23:59:59`],
      };
    } else if (from) {
      whereClause.updatedAt = { [db.Sequelize.Op.gte]: `${from} 00:00:00` };
    } else if (to) {
      whereClause.updatedAt = { [db.Sequelize.Op.lte]: `${to} 23:59:59` };
    }
    if (branchId) whereClause.branchRefId = branchId;
    if (status) whereClause.complaintStatus = status;
    if (serviceProviderId) whereClause.serviceProviderId = serviceProviderId;

    // Fetch all complaints with all required joins
    const complaints = await db.Complaints.findAll({
      attributes: [
        "id",
        "createdAt",
        "complaintStatus",
        "complaintDescription",
        "photosUrl",
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
  } catch (error) {
    console.log(error);
    res.status(400).json(await formatResponse.error(error));
  }
};
