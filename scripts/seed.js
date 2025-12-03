const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '../data/jackyroom.db');
const db = new sqlite3.Database(DB_PATH);

console.log("🌱 正在填充初始数据...");

const sampleData = [
    // 博客文章
    {
        category: 'blog',
        title: 'JackyRoom 2.0 架构升级说明',
        content: '经过多天的重构，我们终于迎来了微内核架构。现在的系统支持插件化开发，数据与逻辑分离，性能提升了 200%。\n\n未来我们将支持更多有趣的功能模块！',
        cover: '',
        meta: '{}'
    },
    {
        category: 'blog',
        title: 'Node.js 全栈开发初体验',
        content: '使用 Express 和 SQLite 搭建个人站是一个非常有趣的过程。它让我理解了后端路由、数据库查询以及前端渲染的完整流程。',
        cover: '',
        meta: '{}'
    },
    // 画廊图片
    {
        category: 'gallery',
        title: '赛博朋克 2077',
        content: '夜之城的霓虹灯光。',
        cover: 'https://placehold.co/600x800/1e293b/6366f1?text=Cyberpunk',
        meta: '{}'
    },
    {
        category: 'gallery',
        title: '自然风光',
        content: '大自然的鬼斧神工。',
        cover: 'https://placehold.co/800x600/10b981/ffffff?text=Nature',
        meta: '{}'
    },
    // 软件资源
    {
        category: 'software',
        title: 'VSCode 效率插件包',
        content: '一键安装所有前端必备插件，包含 ESLint, Prettier 等。',
        cover: 'https://placehold.co/600x400/0f172a/06b6d4?text=VSCode',
        meta: '{"version":"1.0.0", "size":"50MB"}'
    }
];

db.serialize(() => {
    // 1. 清空旧数据 (可选，这里为了演示先清空)
    db.run("DELETE FROM items");

    // 2. 插入新数据
    const stmt = db.prepare("INSERT INTO items (category, title, content, cover, meta_data) VALUES (?, ?, ?, ?, ?)");
    
    sampleData.forEach(item => {
        stmt.run(item.category, item.title, item.content, item.cover, item.meta);
        console.log(`   + 插入: [${item.category}] ${item.title}`);
    });

    stmt.finalize();
    console.log("✅ 数据填充完成！");
});

db.close();