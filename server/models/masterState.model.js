'use strict';
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define(
        "MASTER_STATE",
        {
            id: { type: DataTypes.BIGINT, allowNull: false, autoIncrement: true, primaryKey: true, },
            name: { type: DataTypes.STRING, allowNull: true },
            country_id: { type: DataTypes.BIGINT, allowNull: true },
            isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
        },
        {
            sequelize,
            tableName: 'MASTER_STATE',
            timestamps: true,
            indexes: [
                {
                    fields: ["id", "name", "country_id"]
                }
            ]
        }
    );
};