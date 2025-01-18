const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Job = sequelize.define('Job', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 200]
      }
    },
    company: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('full-time', 'part-time', 'contract', 'internship', 'remote'),
      allowNull: false,
      defaultValue: 'full-time'
    },
    experience: {
      type: DataTypes.ENUM('entry', 'mid', 'senior', 'executive'),
      defaultValue: 'mid'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [10, 10000]
      }
    },
    requirements: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    responsibilities: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    salary: {
      type: DataTypes.JSON,
      defaultValue: {
        min: 0,
        max: 0,
        currency: 'USD',
        isPublic: false
      },
      validate: {
        isSalaryValid(value) {
          if (value.min < 0 || value.max < 0) {
            throw new Error('Salary cannot be negative');
          }
          if (value.max < value.min) {
            throw new Error('Maximum salary cannot be less than minimum salary');
          }
        }
      }
    },
    benefits: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    skills: {
      type: DataTypes.JSON,
      defaultValue: [],
      validate: {
        isSkillsValid(value) {
          if (!Array.isArray(value)) {
            throw new Error('Skills must be an array');
          }
          if (value.some(skill => typeof skill !== 'string')) {
            throw new Error('Skills must be strings');
          }
        }
      }
    },
    status: {
      type: DataTypes.ENUM('draft', 'published', 'closed', 'archived'),
      defaultValue: 'draft'
    },
    application_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    views: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    closing_date: {
      type: DataTypes.DATE,
      validate: {
        isClosingDateValid(value) {
          if (value && new Date(value) < new Date()) {
            throw new Error('Closing date cannot be in the past');
          }
        }
      }
    },
    department: {
      type: DataTypes.STRING
    },
    workplace_type: {
      type: DataTypes.ENUM('on-site', 'hybrid', 'remote'),
      defaultValue: 'on-site'
    },
    recruiter_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {}
    }
  }, {
    timestamps: true,
    paranoid: true, // Soft deletes
    underscored: true,
    indexes: [
      {
        fields: ['status']
      },
      {
        fields: ['type']
      },
      {
        fields: ['experience']
      },
      {
        fields: ['recruiter_id']
      }
    ],
    hooks: {
      beforeValidate: (job) => {
        // Ensure arrays are initialized
        job.benefits = job.benefits || [];
        job.skills = job.skills || [];
        job.metadata = job.metadata || {};
      }
    }
  });

  // Instance methods
  Job.prototype.incrementViews = async function() {
    return this.increment('views');
  };

  Job.prototype.incrementApplications = async function() {
    return this.increment('application_count');
  };

  Job.prototype.isActive = function() {
    return this.status === 'published' && 
           (!this.closing_date || new Date(this.closing_date) > new Date());
  };

  // Class methods
  Job.findActiveJobs = async function() {
    return await this.findAll({
      where: {
        status: 'published',
        closing_date: {
          [sequelize.Op.or]: {
            [sequelize.Op.gt]: new Date(),
            [sequelize.Op.is]: null
          }
        }
      }
    });
  };

  Job.findByRecruiter = async function(recruiterId) {
    return await this.findAll({
      where: { recruiter_id: recruiterId },
      order: [['created_at', 'DESC']]
    });
  };

  Job.findBySkills = async function(skills) {
    return await this.findAll({
      where: {
        skills: {
          [sequelize.Op.overlap]: skills
        },
        status: 'published'
      }
    });
  };

  return Job;
}; 