const mariadb = require('mariadb');

var pool =
    mariadb.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PWD,
        database: process.env.DB_NAME,
        connectionLimit: 50,
        multipleStatements: true
    });

async function getConn() {
    let conn = await pool.getConnection();
    return conn;
}

module.exports.getConn = getConn;