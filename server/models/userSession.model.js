'use strict';
const {DataTypes} = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define(
        'UserSessions',
        {
            id             : {type: DataTypes.UUID, allowNull: false, primaryKey: true, defaultValue: DataTypes.UUIDV4},
            userId         : {type: DataTypes.BIGINT, allowNull: true},
            candidateId    : {type: DataTypes.BIGINT, allowNull: true},
            serviceProviderId: {type: DataTypes.BIGINT, allowNull: true},
            ipAddress      : {type: DataTypes.STRING(45), allowNull: true},
            accessKey      : {type: DataTypes.STRING, allowNull: true},
            accessToken    : {type: DataTypes.STRING, allowNull: false},
            lastActivity   : {type: DataTypes.DATE, allowNull: true},
            expiredAt      : {type: DataTypes.DATE, allowNull: true},
            logoutAt       : {type: DataTypes.DATE, allowNull: true},
            deviceType     : {type: DataTypes.STRING(50), allowNull: true}, //WEB, APP
        },
        {
            sequelize,
            timestamps: true,
            tableName : 'UserSessions',
        }
    );
};