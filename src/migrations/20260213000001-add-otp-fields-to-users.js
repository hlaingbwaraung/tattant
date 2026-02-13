'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('users', 'otp_code', {
            type: Sequelize.STRING,
            allowNull: true
        })
        await queryInterface.addColumn('users', 'otp_expires_at', {
            type: Sequelize.DATE,
            allowNull: true
        })
    },

    async down(queryInterface) {
        await queryInterface.removeColumn('users', 'otp_code')
        await queryInterface.removeColumn('users', 'otp_expires_at')
    }
}
