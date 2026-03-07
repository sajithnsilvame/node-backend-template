require('dotenv').config();

function getDbConfig(prefix) {
  return {
    username: process.env[`${prefix}_DB_USER`],
    password: process.env[`${prefix}_DB_PASSWORD`],
    database: process.env[`${prefix}_DB_NAME`],
    host: process.env[`${prefix}_DB_HOST`] || 'localhost',
    port: process.env[`${prefix}_DB_PORT`] || 3306,
    dialect: 'mysql',
  };
}

module.exports = {
  development: getDbConfig('DEV'),
  test: getDbConfig('TEST'),
  production: getDbConfig('PROD'),
};
