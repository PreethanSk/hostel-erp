"use strict";
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "ROLE_PAGE_ACCESS",
    {
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      roleId: { type: DataTypes.BIGINT, allowNull: false },
      pageId: { type: DataTypes.BIGINT, allowNull: true },
      accessLevel: { type: DataTypes.STRING, allowNull: true },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      sequelize,
      tableName: "ROLE_PAGE_ACCESS",
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ["roleId", "pageId"]
        }
      ]
    }
  );
};