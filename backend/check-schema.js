const { sequelize } = require('./models');

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to database');
    
    const desc = await sequelize.query('DESCRIBE sale_items', { 
      type: sequelize.QueryTypes.SELECT 
    });
    
    console.log('\nSale Items Table Schema:');
    console.log(JSON.stringify(desc, null, 2));
    
    process.exit(0);
  } catch(e) {
    console.error('Error:', e.message);
    console.error(e);
    process.exit(1);
  }
})();
