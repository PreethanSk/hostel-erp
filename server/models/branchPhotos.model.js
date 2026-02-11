'use strict';
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const BranchPhotos = sequelize.define(
    "BRANCH_PHOTOS",
    {
      id: { type: DataTypes.BIGINT, allowNull: false, autoIncrement: true, primaryKey: true, },
      branchId: { type: DataTypes.BIGINT, allowNull: false },
      photoUrl: { type: DataTypes.STRING, allowNull: true },
      isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    },
    {
      sequelize,
      tableName: 'BRANCH_PHOTOS',
      timestamps: true,
      indexes: [
        { name: "idx_branch_id", fields: ["branchId"] },
      ]
    }
  );
  BranchPhotos.associate = function (models) {
    BranchPhotos.belongsTo(models.BranchDetails, {
      foreignKey: 'branchId',
      as: 'BranchDetails'
    });
  };

  return BranchPhotos;
};