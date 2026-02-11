'use strict';
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define(
        "MASTER_PAGE_LIST",
        {
            id: { type: DataTypes.BIGINT, allowNull: false, autoIncrement: true, primaryKey: true, },
            pageName: { type: DataTypes.STRING, allowNull: true },
            pageURL: { type: DataTypes.STRING, allowNull: true },
            isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
            notes: { type: DataTypes.TEXT, allowNull: true, }
        },
        {
            sequelize,
            tableName: 'MASTER_PAGE_LIST',
            timestamps: true,
        }
    );
};