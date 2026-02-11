'use strict';
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define(
        "MASTER_COUNTRY",
        {
            id: { type: DataTypes.BIGINT, allowNull: false, autoIncrement: true, primaryKey: true, },
            name: { type: DataTypes.STRING, allowNull: true },
            sortname: { type: DataTypes.STRING, allowNull: true },
            phoneCode: { type: DataTypes.BIGINT, allowNull: true, },
            isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
        },
        {
            sequelize,
            tableName: 'MASTER_COUNTRY',
            timestamps: true,
            indexes: [
                {
                    fields: ["id", "name"]
                }
            ]
        }
    );
};