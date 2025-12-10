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

    // 2. 用户表 (升级)
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        email TEXT,
        password TEXT,
        avatar TEXT DEFAULT '/favicon.ico',
        phone TEXT,
        bio TEXT,
        role TEXT DEFAULT 'user',
        storage_used INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // 升级现有users表，添加新字段（如果不存在）
    db.run(`ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'`, (err) => { /* 忽略已存在错误 */ });
    db.run(`ALTER TABLE users ADD COLUMN storage_used INTEGER DEFAULT 0`, (err) => { /* 忽略已存在错误 */ });

    // 3. 下载/购买记录表
    db.run(`CREATE TABLE IF NOT EXISTS records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        item_id INTEGER,
        item_title TEXT,
        type TEXT DEFAULT 'download',
        cost REAL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // 4. 分类表（添加module_id字段）
    db.run(`CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        module_id TEXT,
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        icon TEXT,
        description TEXT,
        meta_schema TEXT,
        sort_order INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    
    // 升级现有categories表，添加module_id字段（如果不存在）
    db.run(`ALTER TABLE categories ADD COLUMN module_id TEXT`, (err) => { /* 忽略已存在错误 */ });

    // 5. 网站目录分类表
    db.run(`CREATE TABLE IF NOT EXISTS website_categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        icon TEXT,
        sort_order INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // 6. 网站目录站点表
    db.run(`CREATE TABLE IF NOT EXISTS website_sites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        url TEXT NOT NULL,
        desc TEXT,
        sort_order INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES website_categories(id)
    )`);

    // 7. 文件资产表
    db.run(`CREATE TABLE IF NOT EXISTS assets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        resource_id INTEGER,
        file_path TEXT NOT NULL,
        original_name TEXT,
        file_type TEXT,
        mime_type TEXT,
        size INTEGER NOT NULL,
        is_cover BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (resource_id) REFERENCES resources(id)
    )`);

    // 8. 资源主表
    db.run(`CREATE TABLE IF NOT EXISTS resources (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_id INTEGER NOT NULL,
        author_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        content_body TEXT,
        cover_asset_id INTEGER,
        attributes TEXT,
        tags TEXT,
        status TEXT DEFAULT 'published',
        views INTEGER DEFAULT 0,
        likes INTEGER DEFAULT 0,
        downloads INTEGER DEFAULT 0,
        rating REAL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id),
        FOREIGN KEY (author_id) REFERENCES users(id),
        FOREIGN KEY (cover_asset_id) REFERENCES assets(id)
    )`);

    // 初始化默认管理员账号 (如果不存在)
    db.get("SELECT id FROM users WHERE username = 'admin'", (err, row) => {
        if (!row) {
            db.run(`INSERT INTO users (username, email, password, bio, phone, role) VALUES (?, ?, ?, ?, ?, ?)`, 
                ['admin', 'admin@jackyroom.com', '123456', '超级管理员，全栈开发者。', '13800138000', 'admin']);
        } else {
            // 确保现有admin用户有admin角色
            db.run(`UPDATE users SET role = 'admin' WHERE username = 'admin' AND (role IS NULL OR role = 'user')`);
        }
    });

    // 初始化默认分类数据
    initDefaultCategories();
}

function initDefaultCategories() {
    // 模块-分类映射关系
    const defaultCategories = [
        // 首页模块的分类（增强meta_schema）
        { module_id: 'home', name: '概念原画', slug: 'concept-art', icon: 'fa-solid fa-palette', description: '概念设计与原画作品', meta_schema: JSON.stringify({ 
            fields: [
                { name: 'resolution', label: '分辨率', type: 'text', placeholder: '例如：4K, 2K', required: false },
                { name: 'style', label: '画风', type: 'text', placeholder: '例如：Cyberpunk, Sci-Fi', required: false },
                { name: 'software', label: '制作软件', type: 'text', placeholder: '例如：Photoshop, Procreate', required: false }
            ]
        }) },
        { module_id: 'home', name: '3D模型', slug: '3d-models', icon: 'fa-solid fa-cube', description: '3D模型资源', meta_schema: JSON.stringify({ 
            fields: [
                { name: 'poly_count', label: '面数', type: 'text', placeholder: '例如：24,500', required: false },
                { name: 'vertices', label: '顶点数', type: 'text', placeholder: '例如：12,400', required: false },
                { name: 'format', label: '文件格式', type: 'text', placeholder: '例如：GLB, FBX', required: false },
                { name: 'engine', label: '引擎版本', type: 'text', placeholder: '例如：UE5, Unity', required: false },
                { name: 'software', label: '制作软件', type: 'text', placeholder: '例如：Blender, Maya', required: false },
                { name: 'fileSize', label: '文件大小', type: 'text', placeholder: '例如：15 MB', required: false }
            ]
        }) },
        { module_id: 'home', name: '场景地编', slug: 'level-design', icon: 'fa-solid fa-mountain', description: '场景设计与地编资源', meta_schema: JSON.stringify({ 
            fields: [
                { name: 'engine', label: '引擎版本', type: 'text', placeholder: '例如：UE5, Unity', required: false },
                { name: 'size', label: '文件大小', type: 'text', placeholder: '例如：500 MB', required: false },
                { name: 'format', label: '文件格式', type: 'text', placeholder: '例如：UASSET, UNITYPACKAGE', required: false }
            ]
        }) },
        
        // 设计素材模块的分类（增强meta_schema，包含字段类型和占位符）
        { module_id: 'design-assets', name: '3D模型', slug: 'design-3d', icon: 'fa-solid fa-cube', description: '3D模型资源', meta_schema: JSON.stringify({ 
            fields: [
                { name: 'type', label: '资源类型', type: 'text', placeholder: '例如：3d', required: true },
                { name: 'software', label: '适用软件', type: 'text', placeholder: '例如：Unreal, Unity, Blender（多个用逗号分隔）', required: true },
                { name: 'format', label: '文件格式', type: 'text', placeholder: '例如：FBX, UASSET', required: true },
                { name: 'size', label: '文件大小', type: 'text', placeholder: '例如：2.4 GB', required: false },
                { name: 'points', label: '积分价格', type: 'number', placeholder: '例如：1200（0表示免费）', required: false },
                { name: 'rating', label: '评分', type: 'number', placeholder: '例如：4.8（1-5分）', required: false }
            ]
        }) },
        { module_id: 'design-assets', name: '材质纹理', slug: 'design-material', icon: 'fa-solid fa-texture', description: '材质与纹理资源', meta_schema: JSON.stringify({ 
            fields: [
                { name: 'type', label: '资源类型', type: 'text', placeholder: '例如：material', required: true },
                { name: 'software', label: '适用软件', type: 'text', placeholder: '例如：Substance Designer, Universal', required: true },
                { name: 'format', label: '文件格式', type: 'text', placeholder: '例如：SBSAR, PNG', required: true },
                { name: 'size', label: '文件大小', type: 'text', placeholder: '例如：800 MB', required: false },
                { name: 'points', label: '积分价格', type: 'number', placeholder: '例如：0（免费）', required: false },
                { name: 'rating', label: '评分', type: 'number', placeholder: '例如：4.6（1-5分）', required: false }
            ]
        }) },
        { module_id: 'design-assets', name: '工具插件', slug: 'design-plugin', icon: 'fa-solid fa-puzzle-piece', description: '工具插件资源', meta_schema: JSON.stringify({ 
            fields: [
                { name: 'type', label: '资源类型', type: 'text', placeholder: '例如：plugin', required: true },
                { name: 'software', label: '适用软件', type: 'text', placeholder: '例如：Blender, Maya', required: true },
                { name: 'format', label: '文件格式', type: 'text', placeholder: '例如：Python Script', required: true },
                { name: 'size', label: '文件大小', type: 'text', placeholder: '例如：25 MB', required: false },
                { name: 'points', label: '积分价格', type: 'number', placeholder: '例如：800', required: false },
                { name: 'rating', label: '评分', type: 'number', placeholder: '例如：4.9（1-5分）', required: false }
            ]
        }) },
        { module_id: 'design-assets', name: '视觉特效', slug: 'design-vfx', icon: 'fa-solid fa-magic', description: '视觉特效资源', meta_schema: JSON.stringify({ 
            fields: [
                { name: 'type', label: '资源类型', type: 'text', placeholder: '例如：vfx', required: true },
                { name: 'software', label: '适用软件', type: 'text', placeholder: '例如：After Effects, Nuke', required: true },
                { name: 'format', label: '文件格式', type: 'text', placeholder: '例如：AEP, MOV', required: true },
                { name: 'size', label: '文件大小', type: 'text', placeholder: '例如：500 MB', required: false },
                { name: 'points', label: '积分价格', type: 'number', placeholder: '例如：1500', required: false },
                { name: 'rating', label: '评分', type: 'number', placeholder: '例如：4.7（1-5分）', required: false }
            ]
        }) },
        { module_id: 'design-assets', name: '音频音效', slug: 'design-audio', icon: 'fa-solid fa-music', description: '音频音效资源', meta_schema: JSON.stringify({ 
            fields: [
                { name: 'type', label: '资源类型', type: 'text', placeholder: '例如：audio', required: true },
                { name: 'software', label: '适用软件', type: 'text', placeholder: '例如：Universal', required: true },
                { name: 'format', label: '文件格式', type: 'text', placeholder: '例如：WAV, MP3', required: true },
                { name: 'size', label: '文件大小', type: 'text', placeholder: '例如：400 MB', required: false },
                { name: 'points', label: '积分价格', type: 'number', placeholder: '例如：300', required: false },
                { name: 'rating', label: '评分', type: 'number', placeholder: '例如：4.5（1-5分）', required: false }
            ]
        }) },
        { module_id: 'design-assets', name: '界面UI', slug: 'design-ui', icon: 'fa-solid fa-window-maximize', description: '界面UI资源', meta_schema: JSON.stringify({ 
            fields: [
                { name: 'type', label: '资源类型', type: 'text', placeholder: '例如：ui', required: true },
                { name: 'software', label: '适用软件', type: 'text', placeholder: '例如：Figma, Sketch', required: true },
                { name: 'format', label: '文件格式', type: 'text', placeholder: '例如：Figma, PNG', required: true },
                { name: 'size', label: '文件大小', type: 'text', placeholder: '例如：50 MB', required: false },
                { name: 'points', label: '积分价格', type: 'number', placeholder: '例如：600', required: false },
                { name: 'rating', label: '评分', type: 'number', placeholder: '例如：4.8（1-5分）', required: false }
            ]
        }) },
        { module_id: 'design-assets', name: '2D素材', slug: 'design-2d', icon: 'fa-solid fa-image', description: '2D素材资源', meta_schema: JSON.stringify({ 
            fields: [
                { name: 'type', label: '资源类型', type: 'text', placeholder: '例如：2d', required: true },
                { name: 'software', label: '适用软件', type: 'text', placeholder: '例如：Godot, Unity', required: true },
                { name: 'format', label: '文件格式', type: 'text', placeholder: '例如：PNG, SVG', required: true },
                { name: 'size', label: '文件大小', type: 'text', placeholder: '例如：5 MB', required: false },
                { name: 'points', label: '积分价格', type: 'number', placeholder: '例如：200', required: false },
                { name: 'rating', label: '评分', type: 'number', placeholder: '例如：4.7（1-5分）', required: false }
            ]
        }) },
        
        // 软件工具模块的分类（增强meta_schema，包含历史版本和下载链接）
        { module_id: 'software', name: '开发工具', slug: 'software-dev', icon: 'fa-solid fa-code', description: '开发工具软件', meta_schema: JSON.stringify({ 
            fields: [
                { name: 'version', label: '版本号', type: 'text', placeholder: '例如：2024.2', required: true },
                { name: 'platform', label: '支持平台', type: 'text', placeholder: '例如：Windows / macOS / Linux', required: true },
                { name: 'license', label: '授权类型', type: 'text', placeholder: '例如：商业、开源、免费', required: true },
                { name: 'size', label: '文件大小', type: 'text', placeholder: '例如：2.1 GB', required: true },
                { name: 'tutorial', label: '安装教程', type: 'textarea', placeholder: '安装步骤说明（支持换行）', required: false },
                { name: 'download_link', label: '下载链接', type: 'text', placeholder: '例如：https://example.com/download.zip 或 /admin/api/download/资源ID', required: false },
                { name: 'history_versions', label: '历史版本', type: 'json_array', placeholder: 'JSON数组格式，例如：[{"ver":"2024.2","date":"2024-03-01","size":"2.1 GB","link":"#"}]', required: false }
            ]
        }) },
        { module_id: 'software', name: '设计工具', slug: 'software-design', icon: 'fa-solid fa-paint-brush', description: '设计工具软件', meta_schema: JSON.stringify({ 
            fields: [
                { name: 'version', label: '版本号', type: 'text', placeholder: '例如：2024.1', required: true },
                { name: 'platform', label: '支持平台', type: 'text', placeholder: '例如：Windows / macOS', required: true },
                { name: 'license', label: '授权类型', type: 'text', placeholder: '例如：商业、免费', required: true },
                { name: 'size', label: '文件大小', type: 'text', placeholder: '例如：8.5 GB', required: true },
                { name: 'tutorial', label: '安装教程', type: 'textarea', placeholder: '安装步骤说明（支持换行）', required: false },
                { name: 'download_link', label: '下载链接', type: 'text', placeholder: '例如：https://example.com/download.zip', required: false },
                { name: 'history_versions', label: '历史版本', type: 'json_array', placeholder: 'JSON数组格式', required: false }
            ]
        }) },
        { module_id: 'software', name: '3D建模', slug: 'software-3d', icon: 'fa-solid fa-cube', description: '3D建模软件', meta_schema: JSON.stringify({ 
            fields: [
                { name: 'version', label: '版本号', type: 'text', placeholder: '例如：3.6.5', required: true },
                { name: 'platform', label: '支持平台', type: 'text', placeholder: '例如：全平台', required: true },
                { name: 'license', label: '授权类型', type: 'text', placeholder: '例如：开源', required: true },
                { name: 'size', label: '文件大小', type: 'text', placeholder: '例如：350 MB', required: true },
                { name: 'tutorial', label: '安装教程', type: 'textarea', placeholder: '安装步骤说明（支持换行）', required: false },
                { name: 'download_link', label: '下载链接', type: 'text', placeholder: '例如：https://example.com/download.zip', required: false },
                { name: 'history_versions', label: '历史版本', type: 'json_array', placeholder: 'JSON数组格式', required: false }
            ]
        }) },
        { module_id: 'software', name: '直播录制', slug: 'software-stream', icon: 'fa-solid fa-video', description: '直播录制软件', meta_schema: JSON.stringify({ 
            fields: [
                { name: 'version', label: '版本号', type: 'text', placeholder: '例如：30.1.2', required: true },
                { name: 'platform', label: '支持平台', type: 'text', placeholder: '例如：Windows / macOS / Linux', required: true },
                { name: 'license', label: '授权类型', type: 'text', placeholder: '例如：开源', required: true },
                { name: 'size', label: '文件大小', type: 'text', placeholder: '例如：120 MB', required: true },
                { name: 'tutorial', label: '安装教程', type: 'textarea', placeholder: '安装步骤说明（支持换行）', required: false },
                { name: 'download_link', label: '下载链接', type: 'text', placeholder: '例如：https://example.com/download.zip', required: false },
                { name: 'history_versions', label: '历史版本', type: 'json_array', placeholder: 'JSON数组格式', required: false }
            ]
        }) },
        
        // 技术博客（.category-list）
        { module_id: 'blog', name: '全部文章', slug: 'blog-all', icon: 'fa-solid fa-list', description: '全部博文', meta_schema: JSON.stringify({ fields: [] }) },
        { module_id: 'blog', name: '前端开发', slug: 'blog-frontend', icon: 'fa-solid fa-code', description: '前端开发', meta_schema: JSON.stringify({ fields: [] }) },
        { module_id: 'blog', name: '后端开发', slug: 'blog-backend', icon: 'fa-solid fa-server', description: '后端开发', meta_schema: JSON.stringify({ fields: [] }) },
        { module_id: 'blog', name: 'AI与数据', slug: 'blog-ai', icon: 'fa-solid fa-robot', description: 'AI 与数据', meta_schema: JSON.stringify({ fields: [] }) },
        { module_id: 'blog', name: '云原生', slug: 'blog-cloud', icon: 'fa-solid fa-cloud', description: '云原生', meta_schema: JSON.stringify({ fields: [] }) },
        { module_id: 'blog', name: '工具技巧', slug: 'blog-tools', icon: 'fa-solid fa-wrench', description: '工具与技巧', meta_schema: JSON.stringify({ fields: [] }) },

        // 光影画廊（.tag-pill）
        { module_id: 'gallery', name: '推荐', slug: 'gallery-recommend', icon: 'fa-solid fa-star', description: '推荐作品', meta_schema: JSON.stringify({ fields: [] }) },
        { module_id: 'gallery', name: '热门', slug: 'gallery-hot', icon: 'fa-solid fa-fire', description: '热门作品', meta_schema: JSON.stringify({ fields: [] }) },
        { module_id: 'gallery', name: '插画', slug: 'gallery-illustration', icon: 'fa-solid fa-pen-nib', description: '插画', meta_schema: JSON.stringify({ fields: [] }) },
        { module_id: 'gallery', name: '3D建模', slug: 'gallery-3d', icon: 'fa-solid fa-cube', description: '3D建模', meta_schema: JSON.stringify({ fields: [] }) },
        { module_id: 'gallery', name: '摄影', slug: 'gallery-photo', icon: 'fa-solid fa-camera', description: '摄影', meta_schema: JSON.stringify({ fields: [] }) },
        { module_id: 'gallery', name: 'UI设计', slug: 'gallery-ui', icon: 'fa-solid fa-border-all', description: 'UI设计', meta_schema: JSON.stringify({ fields: [] }) },
        { module_id: 'gallery', name: '游戏原画', slug: 'gallery-gameart', icon: 'fa-solid fa-gamepad', description: '游戏原画', meta_schema: JSON.stringify({ fields: [] }) },
        { module_id: 'gallery', name: '动漫', slug: 'gallery-anime', icon: 'fa-solid fa-wand-magic-sparkles', description: '动漫', meta_schema: JSON.stringify({ fields: [] }) },
        { module_id: 'gallery', name: '赛事电竞', slug: 'gallery-esports', icon: 'fa-solid fa-bolt', description: '赛事电竞', meta_schema: JSON.stringify({ fields: [] }) },
        { module_id: 'gallery', name: '极简', slug: 'gallery-minimal', icon: 'fa-solid fa-circle', description: '极简风格', meta_schema: JSON.stringify({ fields: [] }) },

        // 书籍阅读（.book-nav-item）
        { module_id: 'books', name: '全部书籍', slug: 'books-all', icon: 'fa-solid fa-book', description: '全部书籍', meta_schema: JSON.stringify({ fields: [] }) },
        { module_id: 'books', name: '技术开发', slug: 'books-tech', icon: 'fa-solid fa-laptop-code', description: '技术开发', meta_schema: JSON.stringify({ fields: [] }) },
        { module_id: 'books', name: '科幻小说', slug: 'books-sci-fi', icon: 'fa-solid fa-rocket', description: '科幻小说', meta_schema: JSON.stringify({ fields: [] }) },
        { module_id: 'books', name: '设计美学', slug: 'books-design', icon: 'fa-solid fa-pencil-ruler', description: '设计美学', meta_schema: JSON.stringify({ fields: [] }) },
        { module_id: 'books', name: '经典文学', slug: 'books-classic', icon: 'fa-solid fa-feather', description: '经典文学', meta_schema: JSON.stringify({ fields: [] }) },

        // 游戏资源（.game-nav-item）
        { module_id: 'game-resources', name: '全部游戏', slug: 'gameres-all', icon: 'fa-solid fa-gamepad', description: '全部游戏资源', meta_schema: JSON.stringify({ fields: [] }) },
        { module_id: 'game-resources', name: '动作RPG', slug: 'gameres-action-rpg', icon: 'fa-solid fa-dragon', description: '动作RPG', meta_schema: JSON.stringify({ fields: [] }) },
        { module_id: 'game-resources', name: '射击FPS', slug: 'gameres-fps', icon: 'fa-solid fa-bullseye', description: '射击FPS', meta_schema: JSON.stringify({ fields: [] }) },
        { module_id: 'game-resources', name: '策略SLG', slug: 'gameres-slg', icon: 'fa-solid fa-chess', description: '策略SLG', meta_schema: JSON.stringify({ fields: [] }) },
        { module_id: 'game-resources', name: '模拟经营', slug: 'gameres-sim', icon: 'fa-solid fa-coins', description: '模拟经营', meta_schema: JSON.stringify({ fields: [] }) },

        // 游戏大厅（.nav-inner）
        { module_id: 'games', name: '全部游戏', slug: 'games-all', icon: 'fa-solid fa-gamepad', description: '全部游戏', meta_schema: JSON.stringify({ fields: [] }) },
        { module_id: 'games', name: 'FC/NES', slug: 'games-fc', icon: 'fa-solid fa-ghost', description: 'FC/NES（红白机）', meta_schema: JSON.stringify({ fields: [] }) },
        { module_id: 'games', name: 'SNES', slug: 'games-snes', icon: 'fa-solid fa-rocket', description: 'SNES（超任）', meta_schema: JSON.stringify({ fields: [] }) },
        { module_id: 'games', name: 'GBA', slug: 'games-gba', icon: 'fa-solid fa-tablet-screen-button', description: 'GBA（掌机）', meta_schema: JSON.stringify({ fields: [] }) },
        { module_id: 'games', name: 'NDS', slug: 'games-nds', icon: 'fa-solid fa-clone', description: 'NDS', meta_schema: JSON.stringify({ fields: [] }) },
        { module_id: 'games', name: 'PlayStation', slug: 'games-ps', icon: 'fa-brands fa-playstation', description: 'PlayStation', meta_schema: JSON.stringify({ fields: [] }) },
        { module_id: 'games', name: '街机 Arcade', slug: 'games-arcade', icon: 'fa-solid fa-dice', description: '街机 Arcade', meta_schema: JSON.stringify({ fields: [] }) }
    ];

    defaultCategories.forEach((cat, index) => {
        db.get("SELECT id FROM categories WHERE slug = ?", [cat.slug], (err, row) => {
            if (!row) {
                db.run(`INSERT INTO categories (module_id, name, slug, icon, description, meta_schema, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [cat.module_id, cat.name, cat.slug, cat.icon, cat.description, cat.meta_schema, index]);
            } else {
                // 更新现有分类的module_id和meta_schema
                db.run(`UPDATE categories SET module_id = ?, meta_schema = ? WHERE slug = ?`, 
                    [cat.module_id, cat.meta_schema, cat.slug]);
            }
        });
    });
    
    // 修复旧分类：将slug为'design-assets'和'software'的分类更新module_id
    db.run(`UPDATE categories SET module_id = 'design-assets' WHERE slug = 'design-assets' AND module_id IS NULL`);
    db.run(`UPDATE categories SET module_id = 'software' WHERE slug = 'software' AND module_id IS NULL`);
    
    // 初始化网站目录默认数据
    initWebsiteData();
}

function initWebsiteData() {
    const defaultWebsiteCategories = [
        { name: '设计灵感', icon: 'fa-solid fa-palette', sites: [
            { name: 'Pinterest', url: 'https://www.pinterest.com/', desc: '全球最大的创意灵感图片分享社区' },
            { name: 'Behance', url: 'https://www.behance.net/', desc: 'Adobe旗下的设计师作品展示平台' },
            { name: 'Dribbble', url: 'https://dribbble.com/', desc: 'UI设计师的灵感加油站' },
            { name: 'ArtStation', url: 'https://www.artstation.com/', desc: '专业的CG艺术家作品展示平台' },
            { name: 'Huaban', url: 'https://huaban.com/', desc: '花瓣网，设计师寻找灵感的天堂' },
            { name: 'Mobbin', url: 'https://mobbin.com/', desc: '最新移动端App UI设计模式集合' }
        ]},
        { name: '开发资源', icon: 'fa-solid fa-code', sites: [
            { name: 'GitHub', url: 'https://github.com/', desc: '全球最大的代码托管与开源社区' },
            { name: 'Stack Overflow', url: 'https://stackoverflow.com/', desc: '全球程序员问答社区' },
            { name: 'MDN Web Docs', url: 'https://developer.mozilla.org/', desc: 'Web开发技术的权威文档' },
            { name: 'DevDocs', url: 'https://devdocs.io/', desc: '快速、离线、整合的API文档浏览器' },
            { name: 'Can I Use', url: 'https://caniuse.com/', desc: '前端浏览器兼容性查询工具' },
            { name: 'NPM', url: 'https://www.npmjs.com/', desc: 'Node.js 包管理器官网' }
        ]},
        { name: '在线工具', icon: 'fa-solid fa-toolbox', sites: [
            { name: 'TinyPNG', url: 'https://tinypng.com/', desc: '智能压缩WebP、PNG和JPEG图片' },
            { name: 'Carbon', url: 'https://carbon.now.sh/', desc: '生成漂亮的代码图片分享工具' },
            { name: 'Excalidraw', url: 'https://excalidraw.com/', desc: '虚拟手绘风格的在线白板' },
            { name: 'Remove.bg', url: 'https://www.remove.bg/', desc: 'AI自动去除图片背景' },
            { name: 'Convertio', url: 'https://convertio.co/', desc: '强大的在线文件格式转换工具' },
            { name: 'Regex101', url: 'https://regex101.com/', desc: '在线正则表达式测试与调试' }
        ]},
        { name: '素材资源', icon: 'fa-solid fa-cube', sites: [
            { name: 'Unsplash', url: 'https://unsplash.com/', desc: '高质量免费无版权图片素材' },
            { name: 'Pexels', url: 'https://www.pexels.com/', desc: '免费素材图片和视频分享' },
            { name: 'Flaticon', url: 'https://www.flaticon.com/', desc: '最大的免费矢量图标数据库' },
            { name: 'Sketchfab', url: 'https://sketchfab.com/', desc: '发布和寻找3D模型的平台' },
            { name: 'Poly Haven', url: 'https://polyhaven.com/', desc: '免费的高质量3D纹理、模型和HDRI' }
        ]},
        { name: 'AI 工具', icon: 'fa-solid fa-robot', sites: [
            { name: 'ChatGPT', url: 'https://chat.openai.com/', desc: 'OpenAI 推出的革命性对话AI' },
            { name: 'Midjourney', url: 'https://www.midjourney.com/', desc: 'AI 艺术图片生成工具' },
            { name: 'Notion AI', url: 'https://www.notion.so/', desc: '集成在笔记软件中的智能写作助手' },
            { name: 'Runway', url: 'https://runwayml.com/', desc: 'AI 视频编辑与生成工具' }
        ]},
        { name: '学习教育', icon: 'fa-solid fa-graduation-cap', sites: [
            { name: 'Coursera', url: 'https://www.coursera.org/', desc: '世界顶级大学的在线课程' },
            { name: 'Udemy', url: 'https://www.udemy.com/', desc: '全球最大的在线学习平台' },
            { name: 'Bilibili', url: 'https://www.bilibili.com/', desc: '国内知名的视频弹幕网站，学习资源丰富' },
            { name: 'TED', url: 'https://www.ted.com/', desc: '传播有价值思想的演讲视频' }
        ]}
    ];

    defaultWebsiteCategories.forEach((cat, catIndex) => {
        db.get("SELECT id FROM website_categories WHERE name = ?", [cat.name], (err, row) => {
            if (!row) {
                db.run(`INSERT INTO website_categories (name, icon, sort_order) VALUES (?, ?, ?)`,
                    [cat.name, cat.icon, catIndex], function(err) {
                        if (!err && cat.sites) {
                            const categoryId = this.lastID;
                            cat.sites.forEach((site, siteIndex) => {
                                db.run(`INSERT INTO website_sites (category_id, name, url, desc, sort_order) VALUES (?, ?, ?, ?, ?)`,
                                    [categoryId, site.name, site.url, site.desc, siteIndex]);
                            });
                        }
                    });
            }
        });
    });
}

module.exports = {
    query: (sql, params=[]) => new Promise((resolve, reject) => db.all(sql, params, (err, rows) => err?reject(err):resolve(rows))),
    run: (sql, params=[]) => new Promise((resolve, reject) => db.run(sql, params, function(err){ err?reject(err):resolve({id:this.lastID, changes:this.changes}); })),
    // 新增：获取单条数据的方法
    get: (sql, params=[]) => new Promise((resolve, reject) => db.get(sql, params, (err, row) => err?reject(err):resolve(row)))
};