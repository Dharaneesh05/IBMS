const dotenv = require('dotenv');
dotenv.config();

const { sequelize, connectDB } = require('./config/db');
const User = require('./models/User');

const setupAdminUser = async () => {
    try {
        console.log('🔧 Setting up admin user...');
        
        // Connect to database
        await connectDB();

        // Check if admin already exists
        const existingAdmin = await User.findOne({ 
            where: { email: 'admin@jewellery.com' } 
        });

        if (existingAdmin) {
            console.log('✅ Admin user already exists');
            console.log('Email: admin@jewellery.com');
            process.exit(0);
        }

        // Create admin user
        const admin = await User.create({
            email: 'admin@jewellery.com',
            password: 'admin123', // Will be hashed automatically by the model hook
            role: 'admin',
            fullName: 'System Administrator',
            isActive: true
        });

        console.log('✅ Admin user created successfully!');
        console.log('==========================================');
        console.log('Email: admin@jewellery.com');
        console.log('Password: admin123');
        console.log('Role: admin');
        console.log('==========================================');
        console.log('⚠️  Please change the password after first login!');

        process.exit(0);

    } catch (error) {
        console.error('❌ Error setting up admin user:', error);
        process.exit(1);
    }
};

setupAdminUser();
