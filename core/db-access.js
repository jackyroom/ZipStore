const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_PATH = path.join(DATA_DIR, 'jackyroom.db');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
const db = new sqlite3.Database(DB_PATH, (err) => { if(!err) initTables(); });
function initTables() {
    db.run(`CREATE TABLE IF NOT EXISTS items (id INTEGER PRIMARY KEY, type TEXT, title TEXT, content TEXT, cover TEXT, meta TEXT, views INT DEFAULT 0, likes INT DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);
}
module.exports = {
    query: (sql, params=[]) => new Promise((resolve, reject) => db.all(sql, params, (err, rows) => err?reject(err):resolve(rows))),
    run: (sql, params=[]) => new Promise((resolve, reject) => db.run(sql, params, function(err){ err?reject(err):resolve({id:this.lastID}); }))
};