'use strict';
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define(
        "MASTER_CITY",
        {
            id: { type: DataTypes.BIGINT, allowNull: false, autoIncrement: true, primaryKey: true, },
            name: { type: DataTypes.STRING, allowNull: true },
            state_id: { type: DataTypes.BIGINT, allowNull: true },
            isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
        },
        {
            sequelize,
            tableName: 'MASTER_CITY',
            timestamps: true,
            indexes: [
                {
                    fields: ["id", "name", "state_id"]
                }
            ]
        }
    );
};