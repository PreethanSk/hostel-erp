'use strict';
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Cots = sequelize.define(
    "COTS",
    {
      id: { type: DataTypes.BIGINT, allowNull: false, autoIncrement: true, primaryKey: true, },
      roomId: { type: DataTypes.BIGINT, allowNull: false },
      cotTypeId: { type: DataTypes.BIGINT, allowNull: true },
      cotNumber: { type: DataTypes.STRING, allowNull: true },
      rentAmount: { type: DataTypes.STRING, allowNull: true },
      advanceAmount: { type: DataTypes.STRING, allowNull: true },
      perDayRent: { type: DataTypes.STRING, allowNull: true },
      cotPhotos: { type: DataTypes.STRING, allowNull: true },
      isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    },
    {
      sequelize,
      tableName: 'COTS',
      timestamps: true,
      indexes: [
        { name: "idx_cot_id", fields: ["id"] },
        { name: "idx_room_id", fields: ["roomId"] },
      ]
    }
  );
  Cots.associate = (models) => {
    Cots.belongsTo(models.Rooms, { foreignKey: 'roomId', as: 'Room' });
    Cots.belongsTo(models.MasterCotTypes, { foreignKey: 'cotTypeId', as: 'CotType' });
  };

  return Cots;
};