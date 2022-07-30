const {createTablesScript} = require('./analyzeTables');

async function scriptDatabase() {
    const batchNo = (+new Date()).toString();

    await createTablesScript(batchNo)

    //process.exit(1)
}

scriptDatabase()
