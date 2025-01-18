const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Application = sequelize.define('Application', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    job_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Jobs',
        key: 'id'
      }
    },
    candidate_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM(
        'new',
        'screening',
        'interview',
        'offer',
        'rejected',
        'withdrawn'
      ),
      defaultValue: 'new'
    },
    cover_letter: {
      type: DataTypes.TEXT,
      validate: {
        len: [0, 5000]
      }
    },
    resume: {
      type: DataTypes.STRING, // URL to resume file
      validate: {
        isUrl: true
      }
    },
    answers: {
      type: DataTypes.JSON,
      defaultValue: {},
      validate: {
        isAnswersValid(value) {
          if (typeof value !== 'object') {
            throw new Error('Answers must be an object');
          }
        }
      }
    },
    stage: {
      type: DataTypes.ENUM(
        'applied',
        'screening',
        'technical',
        'cultural',
        'offer',
        'hired',
        'rejected'
      ),
      defaultValue: 'applied'
    },
    current_salary: {
      type: DataTypes.JSON,
      defaultValue: {
        amount: 0,
        currency: 'USD'
      }
    },
    expected_salary: {
      type: DataTypes.JSON,
      defaultValue: {
        amount: 0,
        currency: 'USD'
      }
    },
    notice_period: {
      type: DataTypes.STRING
    },
    availability: {
      type: DataTypes.DATE
    },
    source: {
      type: DataTypes.STRING
    },
    rating: {
      type: DataTypes.INTEGER,
      validate: {
        min: 0,
        max: 5
      }
    },
    notes: {
      type: DataTypes.JSON,
      defaultValue: [],
      validate: {
        isNotesValid(value) {
          if (!Array.isArray(value)) {
            throw new Error('Notes must be an array');
          }
          value.forEach(note => {
            if (!note.content || !note.created_by || !note.created_at) {
              throw new Error('Each note must have content, created_by, and created_at');
            }
          });
        }
      }
    },
    interviews: {
      type: DataTypes.JSON,
      defaultValue: [],
      validate: {
        isInterviewsValid(value) {
          if (!Array.isArray(value)) {
            throw new Error('Interviews must be an array');
          }
          value.forEach(interview => {
            if (!interview.date || !interview.type || !interview.status) {
              throw new Error('Each interview must have date, type, and status');
            }
          });
        }
      }
    },
    feedback: {
      type: DataTypes.JSON,
      defaultValue: [],
      validate: {
        isFeedbackValid(value) {
          if (!Array.isArray(value)) {
            throw new Error('Feedback must be an array');
          }
          value.forEach(feedback => {
            if (!feedback.content || !feedback.rating || !feedback.created_by) {
              throw new Error('Each feedback must have content, rating, and created_by');
            }
          });
        }
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
        fields: ['job_id']
      },
      {
        fields: ['candidate_id']
      },
      {
        fields: ['status']
      },
      {
        fields: ['stage']
      }
    ],
    hooks: {
      beforeValidate: (application) => {
        // Ensure arrays and objects are initialized
        application.answers = application.answers || {};
        application.notes = application.notes || [];
        application.interviews = application.interviews || [];
        application.feedback = application.feedback || [];
        application.metadata = application.metadata || {};
      },
      afterCreate: async (application, options) => {
        // Increment application count on the job
        const Job = sequelize.models.Job;
        await Job.increment('application_count', {
          where: { id: application.job_id },
          transaction: options.transaction
        });
      }
    }
  });

  // Instance methods
  Application.prototype.addNote = async function(note) {
    const notes = [...(this.notes || []), {
      ...note,
      created_at: new Date()
    }];
    return this.update({ notes });
  };

  Application.prototype.scheduleInterview = async function(interview) {
    const interviews = [...(this.interviews || []), {
      ...interview,
      status: 'scheduled',
      created_at: new Date()
    }];
    return this.update({ interviews });
  };

  Application.prototype.addFeedback = async function(feedback) {
    const feedbackList = [...(this.feedback || []), {
      ...feedback,
      created_at: new Date()
    }];
    return this.update({ feedback: feedbackList });
  };

  // Class methods
  Application.findByJob = async function(jobId) {
    return await this.findAll({
      where: { job_id: jobId },
      order: [['created_at', 'DESC']]
    });
  };

  Application.findByCandidate = async function(candidateId) {
    return await this.findAll({
      where: { candidate_id: candidateId },
      order: [['created_at', 'DESC']]
    });
  };

  Application.findByStage = async function(stage) {
    return await this.findAll({
      where: { stage },
      order: [['created_at', 'DESC']]
    });
  };

  return Application;
}; 