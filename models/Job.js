const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Job extends Model {}

Job.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  company: {
    type: DataTypes.STRING,
    allowNull: false
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('full-time', 'part-time', 'contract', 'internship'),
    defaultValue: 'full-time'
  },
  experience: {
    type: DataTypes.ENUM('entry', 'mid', 'senior', 'executive'),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  requirements: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  salary: {
    type: DataTypes.JSON, // Store as { min: number, max: number, currency: string }
    allowNull: true
  },
  benefits: {
    type: DataTypes.JSON, // Array of benefits
    defaultValue: []
  },
  skills: {
    type: DataTypes.JSON, // Array of required skills
    defaultValue: []
  },
  status: {
    type: DataTypes.ENUM('draft', 'published', 'closed'),
    defaultValue: 'draft'
  },
  applicationCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  recruiterId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'Job',
  timestamps: true,
  indexes: [
    {
      fields: ['status']
    },
    {
      fields: ['recruiterId']
    },
    {
      fields: ['type']
    },
    {
      fields: ['experience']
    }
  ]
});

module.exports = Job; 