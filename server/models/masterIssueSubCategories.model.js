'use strict';
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const MasterIssuesSubCategories = sequelize.define(
        "MASTER_ISSUES_SUB_CATEGORIES",
        {
            id: { type: DataTypes.BIGINT, allowNull: false, autoIncrement: true, primaryKey: true, },
            issueId: { type: DataTypes.BIGINT, allowNull: true },
            subCategoryName: { type: DataTypes.STRING, allowNull: true },
            isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
            notes: { type: DataTypes.TEXT, allowNull: true, }
        },
        {
            sequelize,
            tableName: 'MASTER_ISSUES_SUB_CATEGORIES',
            timestamps: true,
            indexes: [
                { unique: true, name: 'uq_issue_subcat', fields: ['issueId', 'subCategoryName'] },
            ],
        }
    );
    MasterIssuesSubCategories.associate = (models) => {
        MasterIssuesSubCategories.hasMany(models.Complaints, { foreignKey: 'issueSubCategoryRefId', as: 'Complaints' });
    };
    return MasterIssuesSubCategories
};