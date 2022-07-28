const getRecordset = ({recordset}) => recordset;
const getTopOne = queryResult => getRecordset(queryResult)[0];

module.exports = {
    getRecordset,
    getTopOne,
}
