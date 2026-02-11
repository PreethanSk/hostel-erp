'use strict';
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Rooms = sequelize.define(
    "ROOMS",
    {
      id: { type: DataTypes.BIGINT, allowNull: false, autoIncrement: true, primaryKey: true, },
      branchId: { type: DataTypes.BIGINT, allowNull: false },
      roomTypeId: { type: DataTypes.BIGINT, allowNull: true },
      sharingTypeId: { type: DataTypes.BIGINT, allowNull: true },
      bathroomTypeId: { type: DataTypes.BIGINT, allowNull: true },
      roomSize: { type: DataTypes.STRING, allowNull: true },
      roomNumber: { type: DataTypes.STRING, allowNull: true },
      floorNumber: { type: DataTypes.STRING, allowNull: true },
      numberOfCots: { type: DataTypes.STRING, allowNull: true },
      oneDayStay: { type: DataTypes.BOOLEAN, allowNull: true },
      admissionFee: { type: DataTypes.STRING, allowNull: true },
      advanceAmount: { type: DataTypes.STRING, allowNull: true },
      lateFeeAmount: { type: DataTypes.STRING, allowNull: true },
      isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      notes: { type: DataTypes.TEXT, allowNull: true, },
    },
    {
      sequelize,
      tableName: 'ROOMS',
      timestamps: true,
      indexes: [
        { name: "idx_room_id", fields: ["id"] },
        { name: "idx_branch_id", fields: ["branchId"] },
      ]
    }
  );
  Rooms.associate = (models) => {
    Rooms.belongsTo(models.BranchDetails, { foreignKey: 'branchId', as: 'Branch' });
    Rooms.hasMany(models.Cots, { foreignKey: 'roomId', as: 'Cots' });
    Rooms.hasMany(models.Complaints, { foreignKey: 'roomId', as: 'Complaints' });
  };

  return Rooms;
};