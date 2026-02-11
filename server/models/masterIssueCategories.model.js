'use strict';
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const MasterIssueCategories = sequelize.define(
        "MASTER_ISSUES_CATEGORIES",
        {
            id: { type: DataTypes.BIGINT, allowNull: false, autoIncrement: true, primaryKey: true, },
            issueType: { type: DataTypes.STRING, allowNull: true, unique: true },
            isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
            notes: { type: DataTypes.TEXT, allowNull: true, }
        },
        {
            sequelize,
            tableName: 'MASTER_ISSUES_CATEGORIES',
            timestamps: true,
        }
    );
    MasterIssueCategories.associate = (models) => {
        MasterIssueCategories.hasMany(models.Complaints, { foreignKey: 'issueTypeRefId', as: 'Complaints' });
    };
    return MasterIssueCategories
};