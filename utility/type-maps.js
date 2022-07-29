const mssql_postgresql = {
    BIGINT: ({isIdentity}) => {
        if (isIdentity) {
            return 'BIGSERIAL'
        } else {
            return 'BIGINT'
        }
    },
    BIT: () => 'BOOLEAN',
    CHAR: ({maxLength}) => `CHAR(${maxLength})`,
    DATE: () => 'DATE',
    DATETIME: () => 'TIMESTAMP(3)',
    DATETIME2: ({scale}) => `TIMESTAMP(${scale})`,
    DECIMAL: ({precision, scale}) => `DECIMAL(${precision}, ${scale})`,
    FLOAT: ({precision}) => `FLOAT(${precision})`,
    INT: ({isIdentity}) => {
        if (isIdentity) {
            return 'SERIAL'
        } else {
            return 'INT'
        }
    },
    MONEY: () => 'MONEY',
    NUMERIC: ({precision, scale}) => `NUMERIC(${precision}, ${scale})`,
    REAL: () => 'REAL',
    SMALLINT: () => 'TINYINT',
    TIME: ({precision}) => `TIME(${precision})`,
    UNIQUEIDENTIFIER: () => 'UUID',
    VARBINARY: () => 'BYTEA',
    VARCHAR: ({maxLength}) => {
        if (maxLength === -1) { // varchar(MAX)
            return 'TEXT'
        } else {
            return `VARCHAR(${maxLength})`
        }
    },
    XML: () => 'XML',
}

module.exports = {
    mssql_postgresql,
}
