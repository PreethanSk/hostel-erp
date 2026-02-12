'use strict';
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Complaints = sequelize.define(
        "COMPLAINTS",
        {
            id: { type: DataTypes.BIGINT, allowNull: false, autoIncrement: true, primaryKey: true, },
            branchRefId: { type: DataTypes.BIGINT, allowNull: false },
            roomRefId: { type: DataTypes.BIGINT, allowNull: false },
            cotRefId: { type: DataTypes.BIGINT, allowNull: true },
            issueTypeRefId: { type: DataTypes.BIGINT, allowNull: true },
            issueSubCategoryRefId: { type: DataTypes.BIGINT, allowNull: true },
            complaintDescription: { type: DataTypes.STRING, allowNull: true },
            photosUrl: { type: DataTypes.STRING, allowNull: true },
            createdBy: { type: DataTypes.STRING, allowNull: true },
            reportedBy: { type: DataTypes.STRING, allowNull: true },
            raisedByCandidateId: { type: DataTypes.BIGINT, allowNull: true },
            raisedByManagerId: { type: DataTypes.BIGINT, allowNull: true },
            raisedDateTime: { type: DataTypes.STRING, allowNull: true },
            closedDateTime: { type: DataTypes.STRING, allowNull: true },
            holdDateTime: { type: DataTypes.STRING, allowNull: true },
            resolvedDateTime: { type: DataTypes.STRING, allowNull: true },
            lastUpdatedDateTime: { type: DataTypes.STRING, allowNull: true },
            lastUpdatedBy: { type: DataTypes.STRING, allowNull: true },
            doYouWantTo: { type: DataTypes.STRING, allowNull: true },
            assignedToUserId: { type: DataTypes.BIGINT, allowNull: true },
            assignedName: { type: DataTypes.STRING, allowNull: true },
            assignedBy: { type: DataTypes.STRING, allowNull: true },
            assignedDateTime: { type: DataTypes.STRING, allowNull: true },
            serviceProviderId: { type: DataTypes.BIGINT, allowNull: true },
            serviceCategoryId: { type: DataTypes.BIGINT, allowNull: true },
            escortedBy: { type: DataTypes.STRING, allowNull: true },
            remarks: { type: DataTypes.STRING, allowNull: true },
            resolvedPhotoUrl: {type: DataTypes.STRING, allowNull: true},
            complaintStatus: { type: DataTypes.ENUM('Open', 'InProgress', 'Hold', 'Closed', 'Reject'), allowNull: true, defaultValue: 'Open' },
            isActive: { type: DataTypes.BOOLEAN, allowNull: true },
        },
        {
            sequelize,
            tableName: 'COMPLAINTS',
            timestamps: true,
        },
        {
            indexes: [
                { name: 'idx_complaints_complaintStatus', fields: ['complaintStatus'] },
                { name: 'idx_complaints_updatedAt', fields: ['updatedAt'] },
            ]
        }
    );
    return Complaints
};

//resolvedPhotoUrl