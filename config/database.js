const { Sequelize } = require('sequelize');
const path = require('path');
const electron = require('electron');

// Get the user data path from Electron
const userDataPath = (electron.app || electron.remote.app).getPath('userData');

// Create a database file in the user's application data directory
const dbPath = path.join(userDataPath, 'database.sqlite');

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