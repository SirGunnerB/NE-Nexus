const { Sequelize } = require('sequelize');
const path = require('path');

// Create a database file in the project directory
const dbPath = path.join(__dirname, '..', 'data', 'database.sqlite');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: false,
  define: {
    timestamps: true,
    underscored: true
  }
});

module.exports = sequelize; 