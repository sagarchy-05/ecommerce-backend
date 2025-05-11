const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_URL, {
  dialect: 'postgres',
  logging: false,
});

sequelize
  .authenticate()
  .then(() => console.log('🟢 Connected to Supabase Postgres!'))
  .catch((err) => console.error('🔴 Unable to connect to the database:', err));

module.exports = sequelize;
