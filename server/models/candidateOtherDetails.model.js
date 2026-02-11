"use strict";
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const CandidateOtherDetails = sequelize.define(
    "CANDIDATE_OTHER_DETAILS",
    {
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      admissionRefId: { type: DataTypes.BIGINT, allowNull: false },
      candidateRefId: { type: DataTypes.BIGINT, allowNull: false },
      anySpecialCareRequired: { type: DataTypes.BOOLEAN, allowNull: true },
      detailsOfSpecialCare: { type: DataTypes.STRING, allowNull: true },
      howDoTheyKnowAboutUs: { type: DataTypes.STRING, allowNull: true },
      enquiryBeforeVisiting: { type: DataTypes.BOOLEAN, allowNull: true },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      sequelize,
      tableName: "CANDIDATE_OTHER_DETAILS",
      timestamps: true,
    }
  );
  CandidateOtherDetails.associate = function (models) {
    CandidateOtherDetails.belongsTo(models.CandidateDetails, {
      foreignKey: "candidateRefId",
      as: "CandidateDetails",
    });
  };

  return CandidateOtherDetails;
};
