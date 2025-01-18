const nodemailer = require('nodemailer');

// Create a test account for development
let transporter;

async function initializeTransporter() {
  if (process.env.NODE_ENV === 'development') {
    // Create test account for development
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  } else {
    // Configure production email service
    transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }
}

// Initialize transporter when module is loaded
initializeTransporter().catch(console.error);

async function sendEmail({ to, subject, text, html }) {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"NE Nexus" <no-reply@nenexus.com>',
      to,
      subject,
      text,
      html,
    });

    if (process.env.NODE_ENV === 'development') {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }

    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

// Email templates
const templates = {
  resetPassword: (token) => ({
    subject: 'Password Reset Request',
    text: `You requested a password reset. Please use the following token: ${token}`,
    html: `
      <h1>Password Reset Request</h1>
      <p>You requested a password reset. Please use the following token:</p>
      <h2>${token}</h2>
      <p>If you didn't request this, please ignore this email.</p>
    `,
  }),
  
  welcomeEmail: (name) => ({
    subject: 'Welcome to NE Nexus',
    text: `Welcome ${name} to NE Nexus! We're excited to have you on board.`,
    html: `
      <h1>Welcome to NE Nexus!</h1>
      <p>Hi ${name},</p>
      <p>We're excited to have you on board. Start exploring job opportunities or post your first job listing today!</p>
    `,
  }),

  applicationReceived: (jobTitle, companyName) => ({
    subject: 'Application Received',
    text: `Your application for ${jobTitle} at ${companyName} has been received.`,
    html: `
      <h1>Application Received</h1>
      <p>Your application for <strong>${jobTitle}</strong> at <strong>${companyName}</strong> has been received.</p>
      <p>We'll notify you of any updates to your application status.</p>
    `,
  }),
};

module.exports = {
  sendEmail,
  templates,
}; 