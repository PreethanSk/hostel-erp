'use strict';
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define(
        "SERVICE_PROVIDERS",
        {
            id: {
                type: DataTypes.BIGINT,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false
            },
            mobile: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    len: [10, 15] // mobile length check
                }
            },
            email: {
                type: DataTypes.STRING,
                allowNull: true,
                validate: { isEmail: true }
            },
            categories: {
                type: DataTypes.STRING,
                allowNull: true
            },
            type: {
                type: DataTypes.ENUM("Internal", "External"),
                allowNull: false,
                defaultValue: "External"
            },
            companyName: {
                type: DataTypes.STRING,
                allowNull: true
            },
            address: {
                type: DataTypes.STRING,
                allowNull: true
            },
            gstNumber: {
                type: DataTypes.STRING,
                allowNull: true,
                comment: "GST number for registered service providers"
            },
            contactPerson: {
                type: DataTypes.STRING,
                allowNull: true
            },
            rating: {
                type: DataTypes.DECIMAL(3, 2),
                allowNull: true,
                comment: "Average rating out of 5"
            },
            isActive: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true
            },
        },
        {
            sequelize,
            tableName: 'SERVICE_PROVIDERS',
            timestamps: true, // createdAt & updatedAt
        }
    );
};
