const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_PATH = path.join(DATA_DIR, 'jackyroom.db');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
const db = new sqlite3.Database(DB_PATH, (err) => { if(!err) initTables(); });

function initTables() {
    // 1. 原有内容表 (保持不变)
    db.run(`CREATE TABLE IF NOT EXISTS items (id INTEGER PRIMARY KEY, type TEXT, title TEXT, content TEXT, cover TEXT, meta TEXT, views INT DEFAULT 0, likes INT DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);

    // 2. 新增：用户表
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        email TEXT,
        password TEXT,
        avatar TEXT DEFAULT '/favicon.ico',
        phone TEXT,
        bio TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // 3. 新增：下载/购买记录表
    db.run(`CREATE TABLE IF NOT EXISTS records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        item_id INTEGER,
        item_title TEXT,
        type TEXT DEFAULT 'download',
        cost REAL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // 初始化默认管理员账号 (如果不存在)
    db.get("SELECT id FROM users WHERE username = 'admin'", (err, row) => {
        if (!row) {
            db.run(`INSERT INTO users (username, email, password, bio, phone) VALUES (?, ?, ?, ?, ?)`, 
                ['admin', 'admin@jackyroom.com', '123456', '超级管理员，全栈开发者。', '13800138000']);
        }
    });
}

module.exports = {
    query: (sql, params=[]) => new Promise((resolve, reject) => db.all(sql, params, (err, rows) => err?reject(err):resolve(rows))),
    run: (sql, params=[]) => new Promise((resolve, reject) => db.run(sql, params, function(err){ err?reject(err):resolve({id:this.lastID, changes:this.changes}); })),
    // 新增：获取单条数据的方法
    get: (sql, params=[]) => new Promise((resolve, reject) => db.get(sql, params, (err, row) => err?reject(err):resolve(row)))
};