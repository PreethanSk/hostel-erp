'use strict';
const { DataTypes } = require('sequelize');

// npx sequelize-cli db:migrate:undo --env development
// npx sequelize-cli db:migrate --env development
// npx sequelize-cli db:migrate:undo //Rollback the Migration
module.exports = {
    up: async (queryInterface, Sequelize) => {
        // await queryInterface.removeConstraint('COMPLAINTS', 'raisedByCandidateId');
        // Add new columns to multiple tables
        // await queryInterface.addIndex('COMPLAINTS', ['complaintStatus'], {
        //     name: 'idx_complaints_complaintStatus',
        // });

        // await queryInterface.addColumn('COMPLAINTS', 'assignedName', {
        //     type: DataTypes.BIGINT, allowNull: true
        // });
        // await queryInterface.addColumn('COMPLAINTS', 'assignedDateTime', {
        //     type: DataTypes.BIGINT, allowNull: true
        // });
       

        // Remove a column from a table
        // await queryInterface.removeColumn('MASTER_AMENITIES_SUB_CATEGORIES', 'subCategoryId');

        // Change a column
        // await queryInterface.changeColumn('CANDIDATE_OTHER_DETAILS', 'enquiryBeforeVisiting', {
        //     type: Sequelize.BOOLEAN,
        //     allowNull: true,
        // });

        // Rename a column
        // await queryInterface.renameColumn('MASTER_AMENITIES_CATEGORIES', 'activeStatus', 'isActive');


        // Add unique constraints to specific columns
        // await queryInterface.addConstraint('Users', {
        //     fields: ['email'],
        //     type: 'unique',
        //     name: 'unique_email_constraint',
        // });

        // Remove a constraint (if it exists)
        // await queryInterface.removeConstraint('Orders', 'orders_user_fk');

        // Add a foreign key constraint (for example, linking orders to users)
        // await queryInterface.addConstraint('Orders', {
        //     fields: ['user_id'],
        //     type: 'foreign key',
        //     name: 'orders_user_fk',
        //     references: {
        //         table: 'Users',
        //         field: 'id',
        //     },
        //     onDelete: 'CASCADE',
        // });

        // Add indexes to improve query performance
        // await queryInterface.addIndex('Users', ['email']);
    },

    down: async (queryInterface, Sequelize) => {
        // Rollback: Remove constraints
        // await queryInterface.removeConstraint('Users', 'unique_email_constraint');

        // Rollback: Remove indexes
        // await queryInterface.removeIndex('Users', ['email']);
        
        // Rollback: Add back email columns to SERVICE_PROVIDERS_OTP table
        await queryInterface.addColumn('SERVICE_PROVIDERS_OTP', 'emailId', {
            type: DataTypes.STRING(200),
            allowNull: true,
        });
        await queryInterface.addColumn('SERVICE_PROVIDERS_OTP', 'emailOtp', {
            type: DataTypes.STRING(10),
            allowNull: true,
        });
    }
};
