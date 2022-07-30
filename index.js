const {listTables, listTableColumns, listTableConstraints, keyConstraints} = require("./db/queries.db");
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
            const {tableName} = tableColumns[0];
            const tableConstraints = allTableConstraints[tableName] ?? {};
            console.log(`CREATE TABLE ${tableName} (`);

            tableColumns.forEach(({
                                      tableName,
                                      columnName,
                                      dataType,
                                      maxLength,
                                      precision,
                                      scale,
                                      isNullable,
                                      isIdentity
                                  }, i) => {
                const pgType = mssql_postgresql[dataType.toUpperCase()]({maxLength, precision, scale, isIdentity});
                const columnConstraints = tableConstraints[columnName.toLowerCase()] ?? {};
                const {constraintType} = columnConstraints;

                let sqlLine;
                if (constraintType === keyConstraints.primaryKey) {
                    sqlLine = `${columnName}\t${dataType} PRIMARY KEY${
                        isIdentity
                            ? ' DEFAULT nextval(\'serial\')'
                            : ''}`
                } else {
                    sqlLine = `${columnName}\t${pgType}${isNullable ? '' : ' NOT NULL'}`
                }

                sqlLine += (i === tableColumns.length - 1) ? '' : ',';
                console.log(sqlLine)
            })

            console.log(');\n\n')
        })

        process.exit(1)
    }))

    //TODO
    //1 Update code to create other "keyConstraints"
    //2 Add foreign key constraints
    //3 Write files
    //4 Determine dependency resolution order
    //5 Output data insert statements
}

doStuff()
