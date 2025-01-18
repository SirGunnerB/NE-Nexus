const bcrypt = require('bcryptjs');
const { User } = require('../models');

const seedAdminUser = async () => {
  try {
    // Check if admin user already exists
    const existingAdmin = await User.findOne({
      where: { email: 'admin@recruitment.com' }
    });

    if (!existingAdmin) {
      // Create admin user if it doesn't exist
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        name: 'Admin User',
        email: 'admin@recruitment.com',
        password: hashedPassword,
        role: 'recruiter',
        isAdmin: true,
        status: 'active',
        company: 'Recruitment Agency',
        position: 'Senior Recruiter',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('Admin user created successfully');
    } else {
      console.log('Admin user already exists');
    }
  } catch (error) {
    console.error('Error seeding admin user:', error);
  }
};

module.exports = {
  seedAdminUser
}; 