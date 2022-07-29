const {databaseClient, databaseConnection} = require('./config.db');
const {database} = require('./config-vars.db');
const {getRecordset, getTopOne} = require('./utility.db');

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
    select schema_name(tab.schema_id) as schemaName,
        tab.name as tableName, 
        col.column_id AS columnOrder,
        col.name as columnName, 
        t.name as dataType,    
        col.max_length AS maxLength,
        col.precision,
        col.scale,
        col.is_nullable AS isNullable,
        col.is_identity AS isIdentity
    from sys.tables as tab
        inner join sys.columns as col
            on tab.object_id = col.object_id
        left join sys.types as t
        on col.user_type_id = t.user_type_id
    WHERE tab.name = @tableName
    order by schemaName,
        tableName, 
        columnOrder
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

const objectTypes = {
    table: 'table',
    view: 'view',
}

const keyConstraints = {
    primaryKey: 'primaryKey',
    uniqueConstraint: 'uniqueConstraint',
    clusteredIndex: 'clusteredIndex',
    uniqueIndex: 'uniqueIndex',
}

const indexTypes = {
    clustered: 'clustered',
    nonClustered: 'nonClustered',
}

async function listTableConstraints() {
    const sql = `
    SELECT t.[name] as [objectName], 
        case WHEN t.[type] = 'U' THEN '${objectTypes.table}'
            WHEN t.[type] = 'V' THEN '${objectTypes.view}'
            END as [objectType],
        case WHEN c.[type] = 'PK' THEN '${keyConstraints.primaryKey}'
            WHEN c.[type] = 'UQ' THEN '${keyConstraints.uniqueConstraint}'
            WHEN i.[type] = 1 THEN '${keyConstraints.clusteredIndex}'
            WHEN i.type = 2 THEN '${keyConstraints.uniqueIndex}'
            END as constraintType,
        c.[name] as constraintName,
        lower(substring(column_names, 1, len(column_names) - 1)) as [columnName],
        i.[name] as indexName,
        case WHEN i.[type] = 1 THEN '${indexTypes.clustered}'
            WHEN i.type = 2 THEN '${indexTypes.nonClustered}'
            END as indexType
    FROM sys.objects t
        LEFT OUTER JOIN sys.indexes i
            ON t.object_id = i.object_id
        LEFT OUTER JOIN sys.key_constraints c
            ON i.object_id = c.parent_object_id 
            AND i.index_id = c.unique_index_id
       CROSS APPLY (SELECT col.[name] + ', '
                        FROM sys.index_columns ic
                            INNER JOIN sys.columns col
                                ON ic.object_id = col.object_id
                                AND ic.column_id = col.column_id
                        WHERE ic.object_id = t.object_id
                            AND ic.index_id = i.index_id
                                ORDER BY col.column_id
                                FOR XML path ('') ) D (column_names)
    WHERE is_unique = 1
      AND t.is_ms_shipped <> 1
      AND t.[name] <> 'dbo.sysdiagrams'
    ORDER BY schema_name(t.schema_id) + '.' + t.[name]
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

module.exports = {
    listTables,
    listTableColumns,
    listTableConstraints,
    objectTypes,
    keyConstraints,
    indexTypes,
}
