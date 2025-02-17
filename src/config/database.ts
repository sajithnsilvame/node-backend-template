import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME as string, 
  process.env.DB_USER as string, 
  process.env.DB_PASSWORD as string, 
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),  // <- Ensure port is used
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 5, // Maximum number of connections in pool
      min: 0, // Minimum number of connections in pool
      acquire: 30000, // The maximum time Sequelize will try to get connection before throwing an error
      idle: 10000 // The maximum time a connection can be idle before being released
    }
  }
);

export default sequelize;
