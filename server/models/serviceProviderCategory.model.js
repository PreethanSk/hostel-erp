'use strict';
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define(
        "SERVICE_PROVIDER_CATEGORY",
        {
            id: {
                type: DataTypes.BIGINT,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
                comment: "Category name e.g. Catering, Transport, Maintenance"
            },
            description: {
                type: DataTypes.STRING,
                allowNull: true,
                comment: "Optional detailed description of the category"
            },
            isActive: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true
            },
        },
        {
            sequelize,
            tableName: 'SERVICE_PROVIDER_CATEGORY',
            timestamps: true, // createdAt & updatedAt
        }
    );
};
