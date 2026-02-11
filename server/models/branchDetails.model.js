'use strict';
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const BranchDetails = sequelize.define(
        "BRANCH_DETAILS",
        {
            id: { type: DataTypes.BIGINT, allowNull: false, autoIncrement: true, primaryKey: true, },
            branchName: { type: DataTypes.STRING, allowNull: true },
            branchCode: { type: DataTypes.STRING, allowNull: true },
            contactPerson: { type: DataTypes.STRING, allowNull: true },
            branchAddress: { type: DataTypes.STRING, allowNull: true },
            numberOfRooms: { type: DataTypes.INTEGER, allowNull: true },
            numberOfCots: { type: DataTypes.INTEGER, allowNull: true },
            totalCots: { type: DataTypes.TEXT, allowNull: true },
            cotVacant: { type: DataTypes.TEXT, allowNull: true },
            cotOccupied: { type: DataTypes.TEXT, allowNull: true },
            cotMaintenance: { type: DataTypes.TEXT, allowNull: true },
            // admissionFee: { type: DataTypes.STRING, allowNull: true },
            // advanceAmount: { type: DataTypes.STRING, allowNull: true },
            // lateFeeAmount: { type: DataTypes.STRING, allowNull: true },
            isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
            mobileNumber: { type: DataTypes.STRING, allowNull: true },
            city: { type: DataTypes.STRING, allowNull: true },
            pincode: { type: DataTypes.STRING, allowNull: true },
            state: { type: DataTypes.STRING, allowNull: true },
            country: { type: DataTypes.STRING, allowNull: true },
            notes: { type: DataTypes.TEXT, allowNull: true, },
        },
        {
            sequelize,
            tableName: 'BRANCH_DETAILS',
            timestamps: true,
            indexes: [
                { name: "idx_branch_id", fields: ["id"] },
                { name: "idx_branch_name", fields: ["branchName"] },
                { name: "idx_city_pincode", fields: ["city", "pincode"] },
                { name: "idx_created_at", fields: ["createdAt"] }
            ]
        }
    );
    BranchDetails.associate = (models) => {
        BranchDetails.hasMany(models.Rooms, {
            foreignKey: 'branchId',
            as: 'Rooms'
        });
    };

    return BranchDetails;
};