require('dotenv').config();

const common = {
  username: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT) || 5432,
  dialect: 'postgres',
};

module.exports = {
   ...common,
};