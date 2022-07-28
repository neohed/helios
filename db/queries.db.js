const {databaseClient, databaseConnection} = require('./config.db');
const {database} = require('./config-vars.db');
const {getRecordset} = require('./utility.db');

async function listTables() {
    //  for MySql, use: TABLE_SCHEMA='dbName'
    const sql = `
    SELECT TABLE_NAME AS tableName
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_TYPE = 'BASE TABLE' 
            AND TABLE_CATALOG=@database
        AND TABLE_NAME <> 'sysdiagrams'
    `

    await databaseConnection;
    try {
        const request = databaseClient.request();
        const queryResult = await request
            .input('database', database)
            .query(sql);

        return getRecordset(queryResult)
    } catch (err) {
        console.error('SQL error', err)
    }
}

async function listTableColumns(tableName) {
    const sql = `
    select schema_name(tab.schema_id) as schema_name,
        tab.name as table_name, 
        col.column_id,
        col.name as column_name, 
        t.name as data_type,    
        col.max_length,
        col.precision
    from sys.tables as tab
        inner join sys.columns as col
            on tab.object_id = col.object_id
        left join sys.types as t
        on col.user_type_id = t.user_type_id
    WHERE tab.name = @tableName
    order by schema_name,
        table_name, 
        column_id;
    `

    await databaseConnection;
    try {
        const request = databaseClient.request();
        const queryResult = await request
            .input('tableName', tableName)
            .query(sql);

        return getRecordset(queryResult)
    } catch (err) {
        console.error('SQL error', err)
    }
}

module.exports = {
    listTables,
    listTableColumns,
}
