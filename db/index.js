require('dotenv').config();
const { Pool } = require('pg');
const parse = require('pg-connection-string').parse;
const config = parse(process.env.DATABASE_URL);

console.log(config);


const pool = new Pool(config);

module.exports = {
    query: (text, params, callback) => {
        console.log(`From db.js, Query: ${text}`);
        return pool.query(text, params, callback);
    }
}