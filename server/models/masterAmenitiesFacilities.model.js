'use strict';
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define(
        "MASTER_AMENITIES_FACILITIES",
        {
            id: { type: DataTypes.BIGINT, allowNull: false, autoIncrement: true, primaryKey: true, },
            subCategoryId: { type: DataTypes.BIGINT, allowNull: true },
            facilityName: { type: DataTypes.STRING, allowNull: true, unique: true },
            isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
            notes: { type: DataTypes.TEXT, allowNull: true, }
        },
        {
            sequelize,
            tableName: 'MASTER_AMENITIES_FACILITIES',
            timestamps: true,
        }
    );
};