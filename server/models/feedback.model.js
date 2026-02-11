'use strict';
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define(
        "FEEDBACK",
        {
            id: { type: DataTypes.BIGINT, allowNull: false, autoIncrement: true, primaryKey: true, },
            candidateRefId: { type: DataTypes.BIGINT, allowNull: false },
            branchRefId: { type: DataTypes.BIGINT, allowNull: false },
            admissionRefId: { type: DataTypes.BIGINT, allowNull: false },
            rateStay: { type: DataTypes.STRING, allowNull: true },
            rateFoodService: { type: DataTypes.STRING, allowNull: true },
            rateCleanliness: { type: DataTypes.STRING, allowNull: true },
            rateSecuritySafety: { type: DataTypes.STRING, allowNull: true },
            rateSupportStaff: { type: DataTypes.STRING, allowNull: true },
            managerCandidateBehavior: { type: DataTypes.STRING, allowNull: true },
            managerComments: { type: DataTypes.STRING, allowNull: true },
            candidateRemarks: { type: DataTypes.STRING, allowNull: true },
            isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
        },
        {
            sequelize,
            tableName: 'FEEDBACK',
            timestamps: true,
        }
    );
};