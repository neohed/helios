const {listTables, listTableColumns} = require("./db/queries.db");

async function doStuff() {
    const tables = await listTables()

    Promise.all(
        tables.map(
            ({tableName}) => listTableColumns(tableName)
        )
    ).then((values => {
        console.log(values)
        //TODO
        // 1 Map SQL Types to PostgreSQL types
        // 2 write files
    }))

    //TODO
    //1 Enumerate keys and indexes
    //2 Map to PG
    //3 Write files
}

doStuff()
