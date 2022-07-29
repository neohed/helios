const {listTables, listTableColumns, listTableConstraints} = require("./db/queries.db");
const {mssql_postgresql} = require('./utility/type-maps');

async function doStuff() {
    const tables = await listTables()

    Promise.all(
        tables.map(
            ({tableName}) => listTableColumns(tableName)
        )
    ).then((async allTablesColumns => {
        const allTableConstraints = (await listTableConstraints()).reduce((acc, item) => {
            const {objectName, objectType, constraintType, constraintName, columnName, indexName, indexType} = item;

            const existing = acc[objectName];
            acc[objectName] = {
                ...existing,
                objectType,
                [columnName]: {
                    constraintType,
                    constraintName,
                    columnName,
                    indexName,
                    indexType,
                }
            }

            return acc
        }, {});

        allTablesColumns.forEach(tableColumns => {
            tableColumns.forEach(({tableName, columnName, dataType, maxLength, precision, scale, isNullable, isIdentity}) => {
                const pgType = mssql_postgresql[dataType.toUpperCase()]({maxLength, precision, scale, isIdentity})
                const tableConstraints = allTableConstraints[tableName]

                //console.log({tableName, columnName, dataType, pgType})
            })
        })

        // console.log(tableConstraints)

        process.exit(1)
    }))

    //TODO
    //1 Enumerate keys and indexes
    //2 Map to PG
    //3 Write files
}

doStuff()
