const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 100]
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        notEmpty: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [6, 100]
      }
    },
    role: {
      type: DataTypes.ENUM('admin', 'recruiter', 'candidate'),
      allowNull: false,
      defaultValue: 'candidate'
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'suspended'),
      defaultValue: 'active'
    },
    avatar: {
      type: DataTypes.STRING,
      validate: {
        isUrl: true
      }
    },
    phone: {
      type: DataTypes.STRING,
      validate: {
        is: /^\+?[\d\s-()]{10,}$/
      }
    },
    location: {
      type: DataTypes.STRING
    },
    title: {
      type: DataTypes.STRING
    },
    company: {
      type: DataTypes.STRING
    },
    skills: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    experience: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    education: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    resume: {
      type: DataTypes.STRING
    },
    notes: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    preferences: {
      type: DataTypes.JSON,
      defaultValue: {}
    },
    lastLogin: {
      type: DataTypes.DATE
    },
    resetPasswordToken: {
      type: DataTypes.STRING
    },
    resetPasswordExpires: {
      type: DataTypes.DATE
    }
  }, {
    timestamps: true,
    paranoid: true, // Soft deletes
    hooks: {
      beforeSave: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    },
    defaultScope: {
      attributes: { exclude: ['password', 'resetPasswordToken', 'resetPasswordExpires'] }
    },
    scopes: {
      withPassword: {
        attributes: { include: ['password'] }
      }
    }
  });

  // Instance methods
  User.prototype.validatePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
  };

  User.prototype.toJSON = function() {
    const values = { ...this.get() };
    delete values.password;
    delete values.resetPasswordToken;
    delete values.resetPasswordExpires;
    return values;
  };

  // Class methods
  User.findByEmail = async function(email) {
    return await this.scope('withPassword').findOne({ where: { email } });
  };

  User.findActiveRecruiters = async function() {
    return await this.findAll({
      where: {
        role: 'recruiter',
        status: 'active'
      }
    });
  };

  User.findActiveCandidates = async function() {
    return await this.findAll({
      where: {
        role: 'candidate',
        status: 'active'
      }
    });
  };

  return User;
}; 