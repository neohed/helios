const {
    client,
    connection
} = require('./config-mssql.db');
require('dotenv').config();

const providerKey = process.env.DB_PROVIDER;
const providerFacade = {};

//TODO Partially implemented. This needs to be a factory that optionally imports based on providerKey.

// Proxy methods to original API.
if (providerKey === 'mssql') {
    providerFacade.createConnection = connection;
    providerFacade.createClient = client
}

// Adapter - map methods to different API.
if (providerKey === 'pg') {
    providerFacade.createConnection = connection;
    providerFacade.createClient = {
        request: function () {
            return {
                params: [],
                input: function (key, value) {
                    this.params.push({
                        key,
                        value
                    });

                    return this
                },
                query: function (sqlString) {
                    let query = sqlString;

                    // parameters here is an array of the values in the correct order
                    // query is the sqlString formatted with @varNames replaced with $1, $2, etc...
                    const parameters = this.params.reduce((paramArray, {key, value}, index) => {
                        query = query.replace('@' + key, '$' + (index + 1));
                        paramArray.push(value);
                        return paramArray
                    }, []);

                    return client.query(query, parameters)
                }
            }
        }
    }
}

module.exports = {
    databaseConnection: providerFacade.createConnection,
    databaseClient: providerFacade.createClient,
};
