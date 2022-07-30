const fs = require('fs');

function createTextFile(filePath, contents) {
    fs.writeFile(filePath, contents, err => {
        if (err) {
            console.error(err);
        }
        // file written successfully
    });
}

module.exports = {
    createTextFile,
}
