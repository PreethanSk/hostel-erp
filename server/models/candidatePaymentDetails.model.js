"use strict";
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const CandidatePaymentDetails = sequelize.define(
    "CANDIDATE_PAYMENT_DETAILS",
    {
      id: { type: DataTypes.BIGINT, allowNull: false, autoIncrement: true, primaryKey: true, },
      admissionRefId: { type: DataTypes.BIGINT, allowNull: false },
      candidateRefId: { type: DataTypes.BIGINT, allowNull: false },
      paymentOption: { type: DataTypes.STRING, allowNull: true },
      paidAmount: { type: DataTypes.STRING, allowNull: true },
      dueToPaid: { type: DataTypes.STRING, allowNull: true },

      // Admission Fee
      admissionFeePaid: { type: DataTypes.STRING, allowNull: true },
      admissionFeePending: { type: DataTypes.STRING, allowNull: true },

      // Advance
      advancePaid: { type: DataTypes.STRING, allowNull: true },
      advancePending: { type: DataTypes.STRING, allowNull: true },

      // Monthly Rent
      monthlyRentPaid: { type: DataTypes.STRING, allowNull: true },
      monthlyRentPending: { type: DataTypes.STRING, allowNull: true },

      // Late Fee
      lateFeePaid: { type: DataTypes.STRING, allowNull: true },
      lateFeePending: { type: DataTypes.STRING, allowNull: true },

      // Token Amount
      tokenAmountPaid: { type: DataTypes.STRING, allowNull: true },
      tokenAmountPending: { type: DataTypes.STRING, allowNull: true },

      // Refund
      refundPaid: { type: DataTypes.STRING, allowNull: true },
      refundPending: { type: DataTypes.STRING, allowNull: true },

      // Cancellation Fee
      cancellationFeePaid: { type: DataTypes.STRING, allowNull: true },
      cancellationFeePending: { type: DataTypes.STRING, allowNull: true },

      // EB Charges
      ebChargePaid: { type: DataTypes.STRING, allowNull: true },
      ebChargePending: { type: DataTypes.STRING, allowNull: true },

      // Additional Charges
      miscellaneousPaid: { type: DataTypes.STRING, allowNull: true },
      miscellaneousPending: { type: DataTypes.STRING, allowNull: true },

      // Total Fee
      totalPaidAmount: { type: DataTypes.STRING, allowNull: true },
      totalPendingAmount: { type: DataTypes.STRING, allowNull: true },

      dueDate: { type: DataTypes.STRING, allowNull: true },
      isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, },
    },
    {
      sequelize,
      tableName: "CANDIDATE_PAYMENT_DETAILS",
      timestamps: true,
    }
  );
  CandidatePaymentDetails.associate = function (models) {
    CandidatePaymentDetails.belongsTo(models.CandidateDetails, {
      foreignKey: "candidateRefId",
      as: "CandidateDetails",
    });
    CandidatePaymentDetails.belongsTo(models.CandidateAdmission, {
      foreignKey: "admissionRefId",
      as: "CandidateAdmission",
    });
  };

  return CandidatePaymentDetails;
};
