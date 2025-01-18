require('dotenv').config();

module.exports = {
  // Server configuration
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',

  // Database configuration
  database: {
    development: {
      storage: './data/database.sqlite',
      dialect: 'sqlite',
      logging: console.log
    },
    test: {
      storage: ':memory:',
      dialect: 'sqlite',
      logging: false
    },
    production: {
      storage: process.env.DB_STORAGE || './data/database.sqlite',
      dialect: 'sqlite',
      logging: false
    }
  },

  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },

  // Email configuration
  email: {
    smtp: {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    },
    from: process.env.SMTP_FROM || 'no-reply@nenexus.com'
  },

  // File upload configuration
  upload: {
    maxSize: process.env.MAX_FILE_SIZE || 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'application/pdf'],
    directory: process.env.UPLOAD_DIR || './uploads'
  },

  // Security configuration
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 10,
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: parseInt(process.env.RATE_LIMIT) || 100
    },
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      credentials: true
    }
  },

  // Application specific configuration
  app: {
    jobsPerPage: parseInt(process.env.JOBS_PER_PAGE) || 10,
    maxSkillsPerJob: parseInt(process.env.MAX_SKILLS_PER_JOB) || 20,
    maxActiveJobsPerRecruiter: parseInt(process.env.MAX_ACTIVE_JOBS) || 50,
    allowedJobTypes: ['full-time', 'part-time', 'contract', 'internship', 'remote'],
    allowedExperienceLevels: ['entry', 'mid', 'senior', 'executive'],
    currencies: ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD'],
    defaultCurrency: 'USD'
  }
}; 