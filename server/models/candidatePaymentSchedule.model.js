"use strict";
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const CandidatePaymentSchedule = sequelize.define(
        "CANDIDATE_PAYMENT_SCHEDULE",
        {
            id: { type: DataTypes.BIGINT, allowNull: false, autoIncrement: true, primaryKey: true },
            admissionRefId: { type: DataTypes.BIGINT, allowNull: false },
            candidateRefId: { type: DataTypes.BIGINT, allowNull: false },
            scheduledDate: { type: DataTypes.DATEONLY, allowNull: false },
            amountDue: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
            amountPaid: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
            status: {
                type: DataTypes.ENUM("pending", "paid", "partial", "overdue"),
                defaultValue: "pending"
            },
            paymentDate: { type: DataTypes.DATEONLY, allowNull: true },
            isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
        },
        {
            sequelize,
            tableName: "CANDIDATE_PAYMENT_SCHEDULE",
            timestamps: true,
        }
    );

    CandidatePaymentSchedule.associate = (models) => {
        CandidatePaymentSchedule.belongsTo(models.CandidateAdmission, {
            foreignKey: "admissionRefId",
            as: "Admission"
        });
        CandidatePaymentSchedule.belongsTo(models.CandidateDetails, {
            foreignKey: "candidateRefId",
            as: "Candidate"
        });
    };

    return CandidatePaymentSchedule;
};
