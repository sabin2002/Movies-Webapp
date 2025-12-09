// db.js
// This file is only for connecting Node.js (backend) to MySQL database

// I am importing mysql2 package so I can talk to MySQL
const mysql = require('mysql2');

// Here I create a connection "pool".
// Pool means Node.js can reuse connections instead of opening new one every time.
const myDbPool = mysql.createPool({
  host: 'localhost',        // where MySQL is running (localhost = my own PC)
  user: 'root',             // my MySQL username
  password: '',             // my MySQL password (empty string because I didn't set one)
  database: 'movie_app'     // the database name I created in phpMyAdmin
});

// I use .promise() so I can use async/await syntax in server.js.
// Without .promise() I would have to use callback style.
const db = myDbPool.promise();

// I export this "db" object so I can use it in server.js with require('./db')
module.exports = db;

/*
 NOTE:
 If I want to test the connection only (without export), I could do something like:

 myDbPool.query("SELECT * FROM movies", function (err, results) {
   if (err) {
     console.log("Error in DB test:", err);
   } else {
     console.log("DB test ok. Rows:", results);
   }
 });

 But for main project I only export the promise version above.
*/
