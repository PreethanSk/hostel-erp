'use strict';
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const BranchAmenitiesDetails = sequelize.define(
        "BRANCH_AMENITIES",
        {
            id: { type: DataTypes.BIGINT, allowNull: false, autoIncrement: true, primaryKey: true, },
            branchId: { type: DataTypes.BIGINT, allowNull: true },
            categoryId: { type: DataTypes.BIGINT, allowNull: true },
            subCategoryId: { type: DataTypes.STRING, allowNull: true },
            facilityId: { type: DataTypes.STRING, allowNull: true },
            isActive: { type: DataTypes.BOOLEAN, allowNull: true },
            description: { type: DataTypes.TEXT, allowNull: true },
        },
        {
            sequelize,
            tableName: 'BRANCH_AMENITIES',
            timestamps: true,
        }
    );
    
  BranchAmenitiesDetails.associate = (models) => {
    BranchAmenitiesDetails.belongsTo(models.BranchDetails, {
      foreignKey: 'branchId',
      as: 'Branch'
    });
    // BranchAmenitiesDetails.belongsTo(models.MasterAmenitiesFacilities, {
    //   foreignKey: 'facilityId',
    //   as: 'Facility'
    // });
  };

  return BranchAmenitiesDetails;

      
};