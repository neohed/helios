const {listTables, listTableColumns, listTableConstraints, keyConstraints} = require("./db/queries.db");
const {mssql_postgresql} = require('./utility/type-maps');
const {createTextFile} = require('./utility/files');
const path = require("path");

async function createTablesScript(batchNo) {
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

        const scriptLines = [];

        allTablesColumns.forEach(tableColumns => {
            const {tableName} = tableColumns[0];
            const tableConstraints = allTableConstraints[tableName] ?? {};
            scriptLines.push(`CREATE TABLE ${tableName} (`);

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
                    sqlLine = `\t${columnName}\t${dataType} PRIMARY KEY${
                        isIdentity
                            ? ' DEFAULT nextval(\'serial\')'
                            : ''}`
                } else {
                    sqlLine = `\t${columnName}\t${pgType}${isNullable ? '' : ' NOT NULL'}`
                }

                sqlLine += (i === tableColumns.length - 1) ? '' : ',';
                scriptLines.push(sqlLine)
            })

            scriptLines.push(');\n')
        })

        createTextFile(
            path.join(__dirname, `scripts/${batchNo}-01-tables.sql`),
            scriptLines.join('\n')
        )
    }))

    //TODO
    //1 Update code to create other "keyConstraints"
    //2 Add foreign key constraints
    //4 Determine dependency resolution order
    //5 Output data insert statements
}

module.exports = {
    createTablesScript,
}
