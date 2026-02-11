"use strict";
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const CandidatePurposeOfStay = sequelize.define(
    "CANDIDATE_PURPOSE_OF_STAY",
    {
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      admissionRefId: { type: DataTypes.BIGINT, allowNull: false },
      candidateRefId: { type: DataTypes.BIGINT, allowNull: false },
      mentionedPurpose: { type: DataTypes.STRING, allowNull: true },
      reasonOfStay: { type: DataTypes.STRING, allowNull: true },
      organizationName: { type: DataTypes.STRING, allowNull: true },
      organizationMobileNumber: { type: DataTypes.STRING, allowNull: true },
      organizationAddress: { type: DataTypes.STRING, allowNull: true },
      organizationPlace: { type: DataTypes.STRING, allowNull: true },
      organizationCity: { type: DataTypes.STRING, allowNull: true },
      organizationPincode: { type: DataTypes.STRING, allowNull: true },
      organizationState: { type: DataTypes.STRING, allowNull: true },
      organizationCountry: { type: DataTypes.STRING, allowNull: true },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      sequelize,
      tableName: "CANDIDATE_PURPOSE_OF_STAY",
      timestamps: true,
    }
  );
  CandidatePurposeOfStay.associate = function (models) {
    CandidatePurposeOfStay.belongsTo(models.CandidateDetails, {
      foreignKey: "candidateRefId",
      as: "CandidateDetails",
    });
  };

  return CandidatePurposeOfStay;
};
