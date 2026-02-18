const { Sequelize } = require('sequelize');

// Create Sequelize instance with MySQL connection
const sequelize = new Sequelize(
    process.env.DB_NAME || 'jewellery_shop',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        define: {
            timestamps: true,
            underscored: false,
            freezeTableName: true
        }
    }
);

// Test database connection
const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ MySQL Database Connected Successfully');
        
        // Sync all models with database (creates tables if they don't exist)
        // Use { alter: true } in development to update tables, { force: false } in production
        await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
        console.log('✅ Database Models Synchronized');
    } catch (error) {
        console.error('❌ Unable to connect to MySQL database:', error.message);
        process.exit(1);
    }
};

module.exports = { sequelize, connectDB };
