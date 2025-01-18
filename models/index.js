const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');
const electron = require('electron');
const isDev = require('electron-is-dev');

// Determine database path
let dbPath;
if (process.type === 'renderer') {
  dbPath = path.join(electron.remote.app.getPath('userData'), 'database.sqlite');
} else {
  dbPath = path.join(electron.app.getPath('userData'), 'database.sqlite');
}

// Ensure database directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Create Sequelize instance
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: isDev ? console.log : false,
  define: {
    timestamps: true,
    underscored: true
  }
});

// Import models
const User = require('./User')(sequelize);
const Job = require('./Job')(sequelize);
const Application = require('./Application')(sequelize);

// Define relationships
User.hasMany(Job, { foreignKey: 'recruiter_id', as: 'jobs' });
Job.belongsTo(User, { foreignKey: 'recruiter_id', as: 'recruiter' });

User.hasMany(Application, { foreignKey: 'candidate_id', as: 'applications' });
Application.belongsTo(User, { foreignKey: 'candidate_id', as: 'candidate' });

Job.hasMany(Application, { foreignKey: 'job_id', as: 'applications' });
Application.belongsTo(Job, { foreignKey: 'job_id', as: 'job' });

// Initialize database
sequelize.authenticate()
  .then(() => {
    console.log('Database connection has been established successfully.');
    return sequelize.sync();
  })
  .then(() => {
    console.log('Database synchronized successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
    process.exit(1);
  });

module.exports = {
  sequelize,
  User,
  Job,
  Application
}; 