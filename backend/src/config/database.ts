import { Sequelize } from 'sequelize';

const ssl = process.env.NODE_ENV === 'production'
  ? { require: true, rejectUnauthorized: false }
  : false;

export const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      logging: false,
      dialectOptions: { ssl },
    })
  : new Sequelize({
      dialect: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'padelnet',
      username: process.env.DB_USER || 'padelnet_user',
      password: process.env.DB_PASSWORD || 'padelnet',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      dialectOptions: { ssl },
    });
