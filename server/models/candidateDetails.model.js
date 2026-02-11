"use strict";
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const CandidateDetails = sequelize.define(
    "CANDIDATE_DETAILS",
    {
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      candidateId: { type: DataTypes.STRING, allowNull: true },
      name: { type: DataTypes.STRING, allowNull: true },
      dob: { type: DataTypes.STRING, allowNull: true },
      mobileNumber: { type: DataTypes.STRING, allowNull: true },
      mobileCountryCode: { type: DataTypes.STRING, allowNull: true },
      email: { type: DataTypes.STRING, allowNull: true },
      address: { type: DataTypes.STRING, allowNull: true },
      place: { type: DataTypes.STRING, allowNull: true },
      city: { type: DataTypes.STRING, allowNull: true },
      pincode: { type: DataTypes.STRING, allowNull: true },
      state: { type: DataTypes.STRING, allowNull: true },
      country: { type: DataTypes.STRING, allowNull: true },
      blackListedDate: { type: DataTypes.DATE, allowNull: true },
      blackListed: { type: DataTypes.STRING, allowNull: true },
      blackListedReason: { type: DataTypes.STRING, allowNull: true },
      blackListedBy: { type: DataTypes.STRING, allowNull: true },
      informToParents: { type: DataTypes.BOOLEAN, allowNull: true },
      informToLocalGuardian: { type: DataTypes.BOOLEAN, allowNull: true },
      profilePicture: { type: DataTypes.STRING, allowNull: true },
      emailVerifiedAt: { type: DataTypes.DATE, allowNull: true },
      mobileVerifiedAt: { type: DataTypes.DATE, allowNull: true },
      gender: { type: DataTypes.STRING, allowNull: true },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      sequelize,
      tableName: "CANDIDATE_DETAILS",
      timestamps: true,
      indexes: [
        { name: "idx_candidate_id", fields: ["candidateId"] },
        { name: "idx_mobile_number", fields: ["mobileNumber"] },
        { name: "idx_email", fields: ["email"] },
        { name: "idx_blacklisted", fields: ["blackListed", "blackListedDate"] },
        { name: "idx_city_pincode", fields: ["city", "pincode"] },
        { name: "idx_created_at", fields: ["createdAt"] }
      ],
    }
  );
  CandidateDetails.associate = (models) => {
    CandidateDetails.hasMany(models.Complaints, { foreignKey: 'raisedByCandidateId', as: 'Complaints' });
  };
  return CandidateDetails;
};