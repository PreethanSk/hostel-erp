'use strict';
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CandidateAdmission = sequelize.define(
    "CANDIDATE_ADMISSION",
    {
      id: { type: DataTypes.BIGINT, allowNull: false, autoIncrement: true, primaryKey: true, },
      candidateRefId: { type: DataTypes.BIGINT, allowNull: false },
      branchRefId: { type: DataTypes.BIGINT, allowNull: false },
      roomRefId: { type: DataTypes.BIGINT, allowNull: false },
      cotRefId: { type: DataTypes.BIGINT, allowNull: false },
      dateOfAdmission: { type: DataTypes.STRING, allowNull: true },
      dateOfNotice: { type: DataTypes.STRING, allowNull: true },
      admissionFee: { type: DataTypes.STRING, allowNull: true },
      advancePaid: { type: DataTypes.STRING, allowNull: true },
      monthlyRent: { type: DataTypes.STRING, allowNull: true },
      lateFeeAmount: { type: DataTypes.STRING, allowNull: true },
      noDayStayType: { type: DataTypes.STRING, allowNull: true },
      noDayStay: { type: DataTypes.STRING, allowNull: true },
      dues: { type: DataTypes.STRING, allowNull: true },
      admissionStatus: { type: DataTypes.STRING, allowNull: true },
      admissionStatusReason: { type: DataTypes.TEXT, allowNull: true },
      discountOffer: { type: DataTypes.INTEGER, allowNull: true },
      paymentStatus: { type: DataTypes.STRING, allowNull: true },
      admissionType: { type: DataTypes.STRING, allowNull: true },
      admittedBy: { type: DataTypes.STRING, allowNull: true },
      cancellationFee: { type: DataTypes.STRING, allowNull: true },
      refundAmount: { type: DataTypes.STRING, allowNull: true },
      cancelReason: { type: DataTypes.STRING, allowNull: true },
      vacate: { type: DataTypes.BOOLEAN, allowNull: true },
      tokenAmount: { type: DataTypes.STRING, allowNull: true },
      ebCharges: { type: DataTypes.STRING, allowNull: true },
      miscellaneousCharges: { type: DataTypes.STRING, allowNull: true },
      isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    },
    {
      sequelize,
      tableName: 'CANDIDATE_ADMISSION',
      timestamps: true,
      indexes: [
        { name: "idx_candidate_ref", fields: ["candidateRefId"] },
        { name: "idx_branch_ref", fields: ["branchRefId"] },
        { name: "idx_room_ref", fields: ["roomRefId"] },
        { name: "idx_cot_ref", fields: ["cotRefId"] },
        { name: "idx_candidate_branch_room_cot", fields: ["candidateRefId", "branchRefId", "roomRefId", "cotRefId"] },
        { name: "idx_created_at", fields: ["createdAt"] }
      ]
    }
  );
  CandidateAdmission.associate = (models) => {
    CandidateAdmission.belongsTo(models.CandidateDetails, {
      foreignKey: 'candidateRefId',
      as: 'CandidateDetails'
    });
    CandidateAdmission.belongsTo(models.BranchDetails, {
      foreignKey: 'branchRefId',
      as: 'BranchDetails'
    });
    CandidateAdmission.belongsTo(models.Rooms, {
      foreignKey: 'roomRefId',
      as: 'Room'
    });
    CandidateAdmission.belongsTo(models.Cots, {
      foreignKey: 'cotRefId',
      as: 'Cot'
    });
    // Link admission to generated payment schedules so we can filter details by schedule dates
    CandidateAdmission.hasMany(models.CandidatePaymentSchedule, {
      foreignKey: "admissionRefId",
      as: "PaymentSchedules",
    });
  };

  return CandidateAdmission;
};