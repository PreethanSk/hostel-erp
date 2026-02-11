'use strict';
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define(
        "MASTER_USER_ROLE",
        {
            id: { type: DataTypes.BIGINT, allowNull: false, autoIncrement: true, primaryKey: true, },
            roleName: { type: DataTypes.STRING(50), allowNull: true, unique: true },
            isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
            notes: { type: DataTypes.TEXT, allowNull: true, }
        },
        {
            sequelize,
            tableName: 'MASTER_USER_ROLE',
            timestamps: true,
        }
    );
};