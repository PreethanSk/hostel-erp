"use strict";
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ApprovedNotification = sequelize.define(
    "APPROVED_NOTIFICATION",
    {
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      candidateRefId: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      admissionRefId: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
    },
    {
        sequelize,
      tableName: "APPROVED_NOTIFICATION",
      timestamps: true,
      
    }
  );

  ApprovedNotification.associate = (models) => {
    ApprovedNotification.belongsTo(models.CandidateDetails, {
      foreignKey: 'candidateRefId',
      as: 'CandidateDetails',
      targetKey: 'id'
    });
    ApprovedNotification.belongsTo(models.CandidateAdmission, {
      foreignKey: 'admissionRefId',
      as: 'CandidateAdmission',
      targetKey: 'id'
    });
  };

  return ApprovedNotification;
};
