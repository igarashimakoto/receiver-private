const mysql = require('mysql');

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'receiver',
});

db.getConnection((err, connection) => {
    if (err) {
        console.error('database connection error:', err.message);
    } else {
        console.log('database connection succesful');
        connection.release();
    }
});

module.exports = db;