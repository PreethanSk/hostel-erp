'use strict';
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define(
        'Users',
        {
            id: { type: DataTypes.BIGINT, allowNull: false, autoIncrement: true, primaryKey: true },
            userRoleId: { type: DataTypes.BIGINT, allowNull: true, },
            branchId: { type: DataTypes.BIGINT, allowNull: true, },
            uniqueId: { type: DataTypes.STRING(100), allowNull: true, unique: true },
            firstName: { type: DataTypes.STRING(150), allowNull: true },
            middleName: { type: DataTypes.STRING(150), allowNull: true },
            lastName: { type: DataTypes.STRING(150), allowNull: true },
            profilePic: { type: DataTypes.STRING(250), allowNull: true },
            emailAddress: { type: DataTypes.STRING(250), allowNull: true, unique: true },
            mobileNumber: { type: DataTypes.STRING(20), allowNull: true, unique: true },
            keyPassword: { type: DataTypes.STRING(255), allowNull: true },
            emailVerifiedAt: { type: DataTypes.DATE, allowNull: true },
            mobileVerifiedAt: { type: DataTypes.DATE, allowNull: true },
            isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
            activatedAt: { type: DataTypes.DATE, allowNull: true },
            fullName: {
                type: DataTypes.VIRTUAL,
                get() {
                    let name = this.firstName;
                    if (!this.lastName) {
                        name += ' ' + this.lastName || ''
                    }
                    return name;
                }
            }
        },
        {
            sequelize,
            tableName: 'Users',
            timestamps: true,
            indexes: [
                {
                    name: "PRIMARY",
                    unique: true,
                    using: "BTREE",
                    fields: [
                        { name: "id" },
                    ]
                },
            ]
        }
    );
};
