'use strict';
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define(
        "SERVICE_PROVIDERS_OTP",
        {
            id: {
                type: DataTypes.BIGINT,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true
            },
            serviceProviderId: {
                type: DataTypes.BIGINT,
                allowNull: true,
              
            },
            mobileNumber: {
                type: DataTypes.STRING(50),
                allowNull: true,
                
            },
            mobileOtp: {
                type: DataTypes.STRING(10),
                allowNull: true,
               
            },
          
            otpRefType: {
                type: DataTypes.STRING(50),
                allowNull: true,
                
            },
            otpRequest: {
                type: DataTypes.TEXT,
                allowNull: true,
             
            },
            otpRequestResponse: {
                type: DataTypes.TEXT,
                allowNull: true,
              
            },
            otpVerifyResponse: {
                type: DataTypes.TEXT,
                allowNull: true,
               
            },
            reSendCount: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                
            },
            isVerified: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
               
            },
            expiredAt: {
                type: DataTypes.DATE,
                allowNull: true,
               
            },
            verifiedAt: {
                type: DataTypes.DATE,
                allowNull: true,
               
            },
        },
        {
            sequelize,
            tableName: 'SERVICE_PROVIDERS_OTP',
            timestamps: true, 
        }
    );
};

