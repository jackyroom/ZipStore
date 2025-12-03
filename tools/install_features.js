/**
 * JackyRoom 2.0 业务模块安装包
 * ------------------------------------------------
 * 安装: Blog, Gallery, Moments, Resources, Games, Chat
 */
const fs = require('fs');
const path = require('path');

console.log("\x1b[36m%s\x1b[0m", "📦 正在安装业务功能模块...");

const files = {
    // 资源通用引擎
    'modules/resources/index.js': `const { render } = require('../../core/layout-engine');
    const MAP = { 'unreal': {t:'虚幻素材',i:'fa-brands fa-unity'}, 'software': {t:'软件库',i:'fa-solid fa-plug'}, 'books': {t:'书籍阅读',i:'fa-solid fa-book'}, 'games': {t:'游戏资源',i:'fa-solid fa-ghost'} };
    module.exports = { meta: { id: 'resources', name: '资源' }, routes: [{ path: '/:cat', method: 'get', handler: (req, res) => {
        const cat = req.params.cat; const info = MAP[cat] || {t:'资源',i:'fa-solid fa-cube'};
        const items = [1,2,3,4].map(i => ({title: \`\${info.t} - 资源示例 \${i}\`, cover: \`https://placehold.co/600x400/1e293b/06b6d4?text=\${cat}+\${i}\`, tag: cat.toUpperCase()}));
        const content = \`<div class="resource-header glass-card"><div class="header-left"><i class="\${info.i}" style="font-size:2rem;color:var(--primary);"></i><div><h1 style="margin:0;">\${info.t}</h1><span style="color:var(--text-muted);">共 \${items.length} 个资源</span></div></div></div><div class="resource-grid">\${items.map(i=>\`<div class="resource-card glass-card"><div class="card-img" style="background-image:url('\${i.cover}')"><span class="category-badge">\${i.tag}</span></div><div class="card-body"><h3>\${i.title}</h3><p style="font-size:0.8rem;color:var(--text-muted);margin:10px 0;">高品质资源示例。</p><button class="btn-block" style="border:none;background:rgba(255,255,255,0.1);color:#fff;padding:8px;border-radius:6px;cursor:pointer;">查看详情</button></div></div>\`).join('')}</div><link rel="stylesheet" href="/css/modules.css">\`;
        res.send(render({ title: info.t, currentModule: 'resources', content }));
    }}]};`,

    // 画廊
    'modules/gallery/index.js': `const { render } = require('../../core/layout-engine');
    const ITEMS = [1,2,3,4,5,6].map(i => ({src:\`https://placehold.co/600x\${500+(i%3)*100}/1e293b/ec4899?text=Art\${i}\`, title:\`作品 \${i}\`}));
    module.exports = { meta: { id: 'gallery', name: '画廊' }, routes: [{ path: '/', method: 'get', handler: (req, res) => {
        res.send(render({ title: '画廊', currentModule: 'gallery', content: \`<div class="glass-card" style="margin-bottom:20px;"><h1>光影画廊</h1></div><div class="gallery-container">\${ITEMS.map(i=>\`<div class="gallery-item"><img src="\${i.src}"><div class="gallery-overlay">\${i.title}</div></div>\`).join('')}</div><link rel="stylesheet" href="/css/modules.css">\`, extraScripts: \`<script src="/js/app-interactions.js"></script>\` }));
    }}]};`,

    // 动态
    'modules/moments/index.js': `const { render } = require('../../core/layout-engine');
    module.exports = { meta: { id: 'moments', name: '动态' }, routes: [{ path: '/', method: 'get', handler: (req, res) => {
        res.send(render({ title: '动态', currentModule: 'moments', content: \`<div class="timeline-feed"><div class="moment-card"><div class="user-avatar" style="background-image:url('https://placehold.co/100x100')"></div><div class="moment-content"><div class="moment-header"><span style="font-weight:bold;color:var(--secondary)">Jacky</span><span>刚刚</span></div><div class="moment-text">2.0 版本上线！</div><div class="moment-grid"><img src="https://placehold.co/300"><img src="https://placehold.co/301"></div><div style="margin-top:15px;"><button class="btn-icon" onclick="toggleLike(this)"><i class="fa-regular fa-heart"></i> 赞</button></div></div></div></div><link rel="stylesheet" href="/css/modules.css">\`, extraScripts: \`<script src="/js/app-interactions.js"></script>\` }));
    }}]};`,

    // 博客
    'modules/blog/index.js': `const { render } = require('../../core/layout-engine');
    module.exports = { meta: { id: 'blog', name: '博客' }, routes: [{ path: '/', method: 'get', handler: (req, res) => {
        res.send(render({ title: '博客', currentModule: 'blog', content: \`<div class="glass-card"><h2>最新文章</h2><div style="padding:20px;background:rgba(255,255,255,0.03);border-radius:12px;margin-bottom:20px;"><h3 style="margin-bottom:5px;">系统升级公告</h3><p style="color:var(--text-muted)">全模块功能已就绪。</p></div></div>\` }));
    }}]};`,

    // 游戏厅
    'modules/games/index.js': `const { render } = require('../../core/layout-engine');
    const GAMES = [{n:'俄罗斯方块',i:'fa-solid fa-shapes'},{n:'贪吃蛇',i:'fa-solid fa-staff-snake'}];
    module.exports = { meta: { id: 'games', name: '游戏厅' }, routes: [{ path: '/', method: 'get', handler: (req, res) => {
        const content = \`<div class="glass-card" style="margin-bottom:20px;"><h1>游戏大厅</h1></div><div class="game-grid">\${GAMES.map(g=>\`<div class="game-card"><div style="font-size:3rem;margin-bottom:10px;"><i class="\${g.i}"></i></div><h3>\${g.n}</h3></div>\`).join('')}</div><link rel="stylesheet" href="/css/modules.css">\`;
        res.send(render({ title: '游戏厅', currentModule: 'games', content }));
    }}]};`,

    // 聊天室
    'modules/chat/index.js': `const { render } = require('../../core/layout-engine');
    module.exports = { meta: { id: 'chat', name: '聊天室' }, routes: [{ path: '/', method: 'get', handler: (req, res) => {
        const content = \`<div class="glass-card"><h1>公共聊天室</h1><div class="chat-window"><div class="chat-msgs" style="padding:20px;"><div class="chat-msg" style="background:rgba(255,255,255,0.1);padding:10px;border-radius:10px;">欢迎！</div></div><div style="padding:15px;background:rgba(0,0,0,0.3);"><input type="text" style="width:100%;padding:10px;border-radius:20px;border:none;" placeholder="发送消息..."></div></div></div><link rel="stylesheet" href="/css/modules.css">\`;
        res.send(render({ title: '聊天室', currentModule: 'chat', content }));
    }}]};`,

    // 样式与交互
    'public/css/modules.css': `.gallery-container { column-count: 4; gap: 20px; } .gallery-item { break-inside: avoid; margin-bottom: 20px; border-radius: 16px; overflow: hidden; position: relative; transition: 0.3s; cursor: zoom-in; } .gallery-item img { width: 100%; display: block; } .gallery-overlay { position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(to top, rgba(0,0,0,0.8), transparent); padding: 20px; opacity: 0; transition: 0.3s; } .gallery-item:hover .gallery-overlay { opacity: 1; }
    .timeline-feed { max-width: 800px; margin: 0 auto; } .moment-card { margin-bottom: 30px; display: flex; gap: 15px; } .user-avatar { width: 45px; height: 45px; border-radius: 50%; background-size: cover; border: 2px solid var(--primary); flex-shrink: 0; } .moment-content { flex: 1; background: rgba(30,41,59,0.4); border: 1px solid var(--glass-border); padding: 20px; border-radius: 16px; }
    .resource-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 25px; } .resource-card { display: flex; flex-direction: column; overflow: hidden; padding: 0 !important; } .card-img { height: 160px; background-size: cover; position: relative; } .card-body { padding: 20px; flex: 1; display: flex; flex-direction: column; }
    .game-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; } .game-card { text-align: center; border: 1px solid var(--glass-border); padding: 20px; border-radius: 16px; background: rgba(255,255,255,0.02); transition: 0.3s; cursor: pointer; } .game-card:hover { background: var(--primary); transform: scale(1.05); }
    .btn-block { width:100%; margin-top:auto; } .category-badge { position:absolute; top:10px; right:10px; background:rgba(0,0,0,0.6); padding:2px 8px; border-radius:4px; font-weight:bold; }
    @media (max-width: 768px) { .gallery-container { column-count: 2; } }`,

    'public/js/app-interactions.js': `function toggleLike(btn) { const i = btn.querySelector('i'); if(i.classList.contains('fa-regular')){ i.classList.replace('fa-regular','fa-solid'); i.style.color='#ec4899'; } else { i.classList.replace('fa-solid','fa-regular'); i.style.color='inherit'; } }`
};

for (const [f, c] of Object.entries(files)) {
    const p = path.join(__dirname, '..', f);
    if (!fs.existsSync(path.dirname(p))) fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, c);
    console.log(`✨ 安装: ${f}`);
}

// 自动更新 app-config.js 菜单（仅在首次安装时）
const configPath = path.join(__dirname, '..', 'app-config.js');
if (fs.existsSync(configPath)) {
    let configContent = fs.readFileSync(configPath, 'utf8');
    // 只在配置中完全没有 gallery 时才更新（避免覆盖用户自定义配置）
    if (!configContent.includes("id: 'gallery'") && !configContent.includes('id: "gallery"')) {
        console.log("⚙️ 正在注册菜单项...");
        const newMenu = `menu: [
        { id: 'home', label: '首页', path: '/', icon: 'fa-solid fa-house' },
        { id: 'blog', label: '博客', path: '/blog', icon: 'fa-solid fa-pen-nib' },
        { id: 'moments', label: '动态', path: '/moments', icon: 'fa-solid fa-camera-retro' },
        { id: 'gallery', label: '画廊', path: '/gallery', icon: 'fa-solid fa-images' },
        { id: 'resources', label: '虚幻素材', path: '/resources/unreal', icon: 'fa-brands fa-unity' },
        { id: 'resources', label: '软件库', path: '/resources/software', icon: 'fa-solid fa-plug' },
        { id: 'resources', label: '书籍', path: '/resources/books', icon: 'fa-solid fa-book' },
        { id: 'games', label: '游戏厅', path: '/games', icon: 'fa-solid fa-gamepad' },
        { id: 'chat', label: '聊天室', path: '/chat', icon: 'fa-solid fa-comments' }
    ],`;
        configContent = configContent.replace(/menu: \[\s*[\s\S]*?\],/, newMenu);
        fs.writeFileSync(configPath, configContent);
        console.log("✅ 菜单更新完成。");
    } else {
        console.log("ℹ️  菜单配置已存在，跳过自动更新（保留您的自定义配置）");
    }
}