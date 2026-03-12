const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Admin = require('./models/Admin');

dotenv.config();

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/eduattend';
    
    console.log('🔄 Connecting to MongoDB...');
    console.log(`📍 URI: ${mongoUri}`);
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'kandasagar2006@gmail.com' });
    if (existingAdmin) {
      console.log('⚠️ Admin already exists with this email');
      console.log('Deleting existing admin...');
      await Admin.deleteOne({ email: 'kandasagar2006@gmail.com' });
      console.log('✅ Deleted existing admin');
    }

    // Create new admin
    const admin = new Admin({
      name: 'sagar kanda',
      email: 'kandasagar2006@gmail.com',
      password: 'password123',
      phone: '8897536435',
      institution: 'srkr',
    });

    await admin.save();
    console.log('✅ Sample admin created successfully');
    console.log('📧 Email: kandasagar2006@gmail.com');
    console.log('🔐 Password: password123');
    console.log('📱 Name: sagar kanda');
    console.log('🏢 Institution: srkr');
    console.log('📞 Phone: 8897536435');

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error seeding data:', error.message);
    console.error(error);
    process.exit(1);
  }
};

seedData();
