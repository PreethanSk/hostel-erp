"use strict";
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const AttendanceDetails = sequelize.define(
    "ATTENDANCE_DETAILS",
    {
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      candidateId: { type: DataTypes.BIGINT, allowNull: false },
      branchId: { type: DataTypes.BIGINT, allowNull: false },
      date: { type: DataTypes.STRING, allowNull: true },
      inTime: { type: DataTypes.STRING, allowNull: true },
      outTime: { type: DataTypes.STRING, allowNull: true },
      mobileNumber: { type: DataTypes.STRING, allowNull: true },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      sequelize,
      tableName: "ATTENDANCE_DETAILS",
      timestamps: true,
    }
  );
    AttendanceDetails.associate = (models) => {
      AttendanceDetails.belongsTo(models.CandidateDetails, {
        foreignKey: "candidateId",
        as: "attendance",
      });
    };

  return AttendanceDetails;
};
