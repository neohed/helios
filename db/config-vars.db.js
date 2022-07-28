require('dotenv').config();

module.exports = {
    server: process.env.SOURCE_SERVER, // You can use 'localhost\\instance' to connect to named instance
    host: process.env.SOURCE_SERVER,
    //port: Number.parseInt(process.env.DB_PORT), // 1433
    database: process.env.SOURCE_DB,
    user: process.env.SOURCE_DB_USERNAME,
    password: process.env.SOURCE_DB_PASSWORD
}
