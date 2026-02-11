"use strict";
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const CandidateContactPersonDetails = sequelize.define(
    "CANDIDATE_CONTACT_PERSON_INFO",
    {
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      admissionRefId: { type: DataTypes.BIGINT, allowNull: false },
      candidateRefId: { type: DataTypes.BIGINT, allowNull: false },
      relationshipType: { type: DataTypes.STRING, allowNull: true },
      name: { type: DataTypes.STRING, allowNull: true },
      mobileNumber: { type: DataTypes.STRING, allowNull: true },
      relationshipType2: { type: DataTypes.STRING, allowNull: true },
      name2: { type: DataTypes.STRING, allowNull: true },
      mobileNumber2: { type: DataTypes.STRING, allowNull: true },
      localGuardianStatus: { type: DataTypes.BOOLEAN, allowNull: true },
      guardianName: { type: DataTypes.STRING, allowNull: true },
      guardianMobileNumber: { type: DataTypes.STRING, allowNull: true },
      guardianRelationshipType: { type: DataTypes.STRING, allowNull: true },
      guardianAddress: { type: DataTypes.STRING, allowNull: true },
      guardianPlace: { type: DataTypes.STRING, allowNull: true },
      guardianCity: { type: DataTypes.STRING, allowNull: true },
      guardianPincode: { type: DataTypes.STRING, allowNull: true },
      guardianState: { type: DataTypes.STRING, allowNull: true },
      guardianCountry: { type: DataTypes.STRING, allowNull: true },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      sequelize,
      tableName: "CANDIDATE_CONTACT_PERSON_INFO",
      timestamps: true,
    }
  );
  CandidateContactPersonDetails.associate = function(models) {
    CandidateContactPersonDetails.belongsTo(models.CandidateDetails, {
      foreignKey: 'candidateRefId',
      as: 'CandidateDetails'
    });
  };

  return CandidateContactPersonDetails;
};
