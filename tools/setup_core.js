/**
 * JackyRoom 2.0 核心地基构建器
 * ------------------------------------------------
 * 仅负责生成运行网站所需的最小化核心环境：
 * 1. 配置文件 (package.json, app-config.js)
 * 2. 核心引擎 (Layout, Loader, DB)
 * 3. 基础页面 (Home)
 */

const fs = require('fs');
const path = require('path');

console.log("\x1b[36m%s\x1b[0m", "🏗️ 正在构建核心地基...");

const files = {
    // --- 1. 项目配置 (关键修复：添加 dev 脚本) ---
    'package.json': JSON.stringify({
        "name": "jackyroom-v2-core",
        "version": "2.0.0",
        "private": true,
        "main": "server.js",
        "scripts": { 
            "start": "node server.js", 
            "dev": "nodemon server.js" 
        },
        "dependencies": { "express": "^4.18.2", "sqlite3": "^5.1.6", "moment": "^2.29.4" },
        "devDependencies": { "nodemon": "^3.0.1" }
    }, null, 2),

    'app-config.js': `module.exports = {
    site: {
        title: "JackyRoom",
        subtitle: "探索 · 创造 · 分享",
        description: "个人数字空间",
        author: "Jacky",
        favicon: "/favicon.ico.png",
        footerText: "© 2025 JackyRoom."
    },
    theme: {
        colors: {
            primary: "#6366f1", secondary: "#ec4899", accent: "#06b6d4",
            background: "#0f172a", text: "#f8fafc", textMuted: "#94a3b8"
        },
        glass: { opacity: "0.75", blur: "20px", border: "rgba(255, 255, 255, 0.1)" }
    },
    menu: [
        { id: 'home', label: '首页', path: '/', icon: 'fa-solid fa-rocket' },
        // 其他菜单项由 install_features.js 补充或手动添加
    ],
    dev: { port: 3000 }
};`,

    'server.js': `const express = require('express');
const path = require('path');
const config = require('./app-config');
const { loadModules } = require('./core/module-loader');
const app = express();
const PORT = process.env.PORT || config.dev.port || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'public')));

// 挂载模块
loadModules(app);

app.use((req, res) => res.status(404).send(\`<body style="background:#0f172a;color:#fff;display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;flex-direction:column"><h1 style="font-size:4rem;margin:0;color:#6366f1">404</h1><p>页面未找到</p><a href="/" style="color:#fff;margin-top:20px;text-decoration:underline">回首页</a></body>\`));

app.listen(PORT, () => {
    console.log(\`\\n🚀 Server Running: http://localhost:\${PORT}\\n\`);
});`,

    // --- 2. 核心引擎 ---
    'core/db-access.js': `const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_PATH = path.join(DATA_DIR, 'jackyroom.db');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
const db = new sqlite3.Database(DB_PATH, (err) => { if(!err) initTables(); });
function initTables() {
    db.run(\`CREATE TABLE IF NOT EXISTS items (id INTEGER PRIMARY KEY, type TEXT, title TEXT, content TEXT, cover TEXT, meta TEXT, views INT DEFAULT 0, likes INT DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)\`);
}
module.exports = {
    query: (sql, params=[]) => new Promise((resolve, reject) => db.all(sql, params, (err, rows) => err?reject(err):resolve(rows))),
    run: (sql, params=[]) => new Promise((resolve, reject) => db.run(sql, params, function(err){ err?reject(err):resolve({id:this.lastID}); }))
};`,

    'core/module-loader.js': `const fs = require('fs');
const path = require('path');
const express = require('express');
function loadModules(app) {
    const modulesPath = path.join(__dirname, '..', 'modules');
    if (!fs.existsSync(modulesPath)) { fs.mkdirSync(modulesPath); return; }
    console.log('📦 Loading Modules...');
    fs.readdirSync(modulesPath).forEach(folder => {
        const entry = path.join(modulesPath, folder, 'index.js');
        if (fs.existsSync(entry)) {
            try {
                const mod = require(entry);
                if (mod.routes) {
                    const router = express.Router();
                    mod.routes.forEach(r => {
                        const method = (r.method || 'get').toLowerCase();
                        if(router[method]) router[method](r.path, r.handler);
                    });
                    const prefix = mod.meta.id === 'home' ? '/' : \`/\${mod.meta.id}\`;
                    app.use(prefix, router);
                    console.log(\`   ✅ \${mod.meta.name}\`);
                }
                if (mod.onInit) mod.onInit(app);
            } catch (e) { console.error(\`   ❌ \${folder}: \`, e.message); }
        }
    });
}
module.exports = { loadModules };`,

    'core/layout-engine.js': `const config = require('../app-config');
function render(options) {
    const { title, content, currentModule, extraHead='', extraScripts='' } = options;
    const { colors, glass } = config.theme;
    // 渲染菜单，如果有 install_features.js 注入的新菜单项也会显示
    const navHtml = config.menu.map(item => \`<a href="\${item.path}" class="nav-item \${currentModule===item.id?'active':''}"><i class="\${item.icon}"></i><span>\${item.label}</span></a>\`).join('');
    return \`<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>\${title} | \${config.site.title}</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet"><link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&display=swap" rel="stylesheet"><link rel="stylesheet" href="/css/core.css"><link rel="stylesheet" href="/css/modules.css">
    <style>:root{--primary:\${colors.primary};--bg-color:\${colors.background};--text-main:\${colors.text};--text-muted:\${colors.textMuted};--glass-bg:rgba(30,41,59,\${glass.opacity});--glass-blur:\${glass.blur};--glass-border:\${glass.border};}</style>\${extraHead}</head>
    <body><div class="app-container"><aside class="sidebar glass-panel"><div class="brand"><i class="fa-solid fa-rocket" style="color:var(--primary)"></i><h1>\${config.site.title}</h1></div><nav class="nav-menu custom-scroll">\${navHtml}</nav><div class="sidebar-footer">Designed by \${config.site.author}</div></aside>
    <main class="main-content"><header class="mobile-header glass-panel"><span class="mobile-title">\${config.site.title}</span><button class="menu-toggle"><i class="fa-solid fa-bars"></i></button></header><div class="content-wrapper fade-in">\${content}</div></main></div><script src="/js/core.js"></script><script src="/js/app-interactions.js"></script>\${extraScripts}</body></html>\`;
}
module.exports = { render };`,

    // --- 3. 基础静态资源 ---
    'public/css/core.css': `* { box-sizing: border-box; margin: 0; padding: 0; } body { font-family: 'Inter', sans-serif; background: var(--bg-color); background-image: radial-gradient(circle at 10% 20%, rgba(99,102,241,0.15), transparent 40%), radial-gradient(circle at 90% 80%, rgba(236,72,153,0.15), transparent 40%); color: var(--text-main); height: 100vh; overflow: hidden; } a { text-decoration: none; color: inherit; transition: 0.2s; }
    .app-container { display: flex; height: 100%; } .sidebar { width: 260px; border-right: 1px solid var(--glass-border); display: flex; flex-direction: column; z-index: 100; transition: 0.3s; } .nav-menu { flex: 1; padding: 15px; }
    .nav-item { display: flex; align-items: center; gap: 12px; padding: 12px; margin-bottom: 5px; border-radius: 12px; color: var(--text-muted); font-weight: 500; } .nav-item:hover, .nav-item.active { background: rgba(255,255,255,0.05); color: var(--text-main); } .nav-item.active { border-left: 3px solid var(--primary); background: linear-gradient(90deg, rgba(99,102,241,0.15), transparent); }
    .main-content { flex: 1; display: flex; flex-direction: column; position: relative; overflow-y: auto; } .content-wrapper { padding: 40px; max-width: 1400px; margin: 0 auto; width: 100%; flex: 1; }
    .glass-panel { background: var(--glass-bg); backdrop-filter: blur(var(--glass-blur)); } .glass-card { background: rgba(30,41,59,0.5); border: 1px solid var(--glass-border); border-radius: 20px; padding: 25px; transition: 0.3s; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); } .glass-card:hover { transform: translateY(-5px); border-color: var(--primary); }
    .mobile-header { display: none; } @keyframes fadeIn { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} } .fade-in { animation: fadeIn 0.6s forwards; }
    @media (max-width: 768px) { .sidebar { position: fixed; transform: translateX(-100%); background: #0f172a; height: 100%; } .sidebar.show { transform: translateX(0); box-shadow: 50px 0 100px rgba(0,0,0,0.5); } .mobile-header { display: flex; justify-content: space-between; padding: 15px; border-bottom: 1px solid var(--glass-border); } .content-wrapper { padding: 20px; } }`,

    'public/js/core.js': `document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.querySelector('.menu-toggle'); const sidebar = document.querySelector('.sidebar');
    if(toggle) {
        const overlay = document.createElement('div'); overlay.style.cssText="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:90;display:none;backdrop-filter:blur(4px);"; document.body.appendChild(overlay);
        const action = () => { sidebar.classList.toggle('show'); overlay.style.display = sidebar.classList.contains('show')?'block':'none'; };
        toggle.addEventListener('click', action); overlay.addEventListener('click', action);
    }
});`,

    // --- 4. 首页模块 ---
    'modules/home/index.js': `const { render } = require('../../core/layout-engine'); const config = require('../../app-config');
    module.exports = { meta: { id: 'home', name: '首页' }, routes: [{ path: '/', method: 'get', handler: (req, res) => {
        // 读取配置中的菜单生成首页卡片
        const cards = config.menu.filter(m=>m.id!=='home').map(m=>\`<a href="\${m.path}" class="glass-card" style="text-align:center;"><div style="font-size:2rem;color:var(--primary);margin-bottom:10px;"><i class="\${m.icon}"></i></div><div style="font-weight:bold;">\${m.label}</div></a>\`).join('');
        res.send(render({ title: '首页', currentModule: 'home', content: \`<div style="text-align:center;padding:80px 0;"><h1 style="font-size:3.5rem;margin-bottom:20px;background:linear-gradient(to right,#fff,#94a3b8);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">\${config.site.title}</h1><p style="color:var(--text-muted);font-size:1.2rem;">\${config.site.subtitle}</p><div style="margin-top:40px;display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:20px;max-width:1000px;margin-left:auto;margin-right:auto;">\${cards}</div></div>\` }));
    }}]};`
};

for (const [f, c] of Object.entries(files)) {
    const p = path.join(__dirname, '..', f);
    if (!fs.existsSync(path.dirname(p))) fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, c);
}
console.log("✅ 核心地基构建完成。");