'use strict';
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const CandidateDocumentDetails = sequelize.define(
        "CANDIDATE_DOCUMENTS",
        {
            id: { type: DataTypes.BIGINT, allowNull: false, autoIncrement: true, primaryKey: true, },
            admissionRefId: { type: DataTypes.BIGINT, allowNull: false },
            candidateRefId: { type: DataTypes.BIGINT, allowNull: false },
            documentName: { type: DataTypes.STRING, allowNull: true },
            documentNumber: { type: DataTypes.STRING, allowNull: true },
            documentUrl: { type: DataTypes.STRING, allowNull: true },
            isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
        },
        {
            sequelize,
            tableName: 'CANDIDATE_DOCUMENTS',
            timestamps: true,
        }
    );
    CandidateDocumentDetails.associate = function (models) {
        CandidateDocumentDetails.belongsTo(models.CandidateDetails, { foreignKey: 'candidateRefId', as: 'CandidateDetails' });
    };

    return CandidateDocumentDetails;
};