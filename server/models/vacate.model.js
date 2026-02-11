"use strict";
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define(
        "VACATE",
        {
            id: { type: DataTypes.BIGINT, allowNull: false, autoIncrement: true, primaryKey: true, },
            candidateRefId: { type: DataTypes.BIGINT, allowNull: false },
            branchRefId: { type: DataTypes.BIGINT, allowNull: false },
            admissionRefId: { type: DataTypes.BIGINT, allowNull: false },
            vacateType: { type: DataTypes.STRING, allowNull: true },
            vacateStatus: { type: DataTypes.STRING, allowNull: true },
            feedbackBehavior: { type: DataTypes.STRING, allowNull: true },
            feedbackBrief: { type: DataTypes.STRING, allowNull: true },
            damageRemarks: { type: DataTypes.STRING, allowNull: true },
            payableAdvancePaid: { type: DataTypes.STRING, allowNull: true },
            payableAdmissionFee: { type: DataTypes.STRING, allowNull: true },
            payableMonthlyRent: { type: DataTypes.STRING, allowNull: true },
            payablePenalty: { type: DataTypes.STRING, allowNull: true },
            payableDuePending: { type: DataTypes.STRING, allowNull: true },
            netAmountPayable: { type: DataTypes.STRING, allowNull: true },
            dateOfNoticeGiven: { type: DataTypes.STRING, allowNull: true },
            proposedVacatingDate: { type: DataTypes.STRING, allowNull: true },
            actualVacatingDate: { type: DataTypes.STRING, allowNull: true },
            isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
        },
        {
            sequelize,
            tableName: 'VACATE',
            timestamps: true,
            indexes: [
                { name: "idx_candidate_ref", fields: ["candidateRefId"] },
                { name: "idx_branch_ref", fields: ["branchRefId"] },
                { name: "idx_admission_ref", fields: ["admissionRefId"] },
                { name: "idx_created_at", fields: ["createdAt"] }
            ]
        }
    );
};
