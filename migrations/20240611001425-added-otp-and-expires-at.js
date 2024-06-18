'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn("Users", "otp", {
        type: Sequelize.STRING,
        allowNull: true, // or false depending on your requirements
      }),
      queryInterface.addColumn("Users", "otpExpires", {
        type: Sequelize.DATE,
        allowNull: true, // or false depending on your requirements
      }),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.removeColumn("Users", "otp"),
      queryInterface.removeColumn("Users", "otpExpires"),
    ]);
  },
};
