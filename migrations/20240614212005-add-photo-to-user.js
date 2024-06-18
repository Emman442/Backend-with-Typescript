"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Users", "profile_photo", {
      type: Sequelize.STRING,
      allowNull: true, // Adjust based on whether the field should be mandatory or not
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Users", "profile_photo");
  },
};
