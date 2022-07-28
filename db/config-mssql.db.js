const sql = require('mssql');
const configVars = require('./config-vars.db');

const config = {
    ...configVars,
    options: {
        encrypt: true,
        enableArithAbort: true,
        trustServerCertificate: true,
    }
};

const client = new sql.ConnectionPool(config);
const connection = client.connect();

client.on('error', err => {
    console.error('Database error in: config.js');
    console.error(err)
});

module.exports = {
    client,
    connection
};
