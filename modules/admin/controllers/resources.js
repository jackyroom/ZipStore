const { renderAdminPage, getCurrentUser } = require('../admin-helpers');
const db = require('../../../core/db-access');
const { upload } = require('../../../core/upload-middleware');
const { render } = require('../../../core/layout-engine');

module.exports = [
    // 1. 资源列表
    {
        path: '/resources',
        method: 'get',
        handler: async (req, res) => {
            const { module, category, author, status, search } = req.query;
            const config = require('../../../app-config');
            const modules = config.menu.filter(m => m.id && !['admin', 'user', 'plugins', 'chat'].includes(m.id));

            let sql = `
                SELECT r.*, c.name as category_name, c.module_id, u.username as author_name
                FROM resources r
                LEFT JOIN categories c ON r.category_id = c.id
                LEFT JOIN users u ON r.author_id = u.id
                WHERE 1=1
            `;
            const params = [];

            if (module) {
                sql += " AND c.module_id = ?";
                params.push(module);
            }
            if (category) {
                sql += " AND r.category_id = ?";
                params.push(category);
            }
            if (author) {
                sql += " AND r.author_id = ?";
                params.push(author);
            }
            if (status) {
                sql += " AND r.status = ?";
                params.push(status);
            }
            if (search) {
                sql += " AND (r.title LIKE ? OR r.description LIKE ?)";
                params.push(`%${search}%`, `%${search}%`);
            }

            sql += " ORDER BY r.created_at DESC LIMIT 100";

            const resources = await db.query(sql, params);
            const allCategories = await db.query("SELECT * FROM categories ORDER BY module_id ASC, sort_order ASC, id ASC");

            let categories;
            if (module) {
                categories = allCategories.filter(c => c.module_id === module);
            } else {
                categories = allCategories;
            }

            const users = await db.query("SELECT id, username FROM users");

            const content = `
                <div class="glass-card">
                    <div style="margin-bottom:24px; display:flex; justify-content:space-between; align-items:center;">
                        <h2>资源管理</h2>
                        <a href="/admin/create" class="btn-primary">
                            <i class="fa-solid fa-plus"></i> 发布新资源
                        </a>
                    </div>

                    <form id="resourceFilterForm" method="GET" class="admin-form" style="display:flex; gap:16px; margin-bottom:24px; flex-wrap:wrap; background:transparent; padding:0; border:none;">
                        <div style="flex:1; min-width:150px;">
                            <select name="module">
                                <option value="">所有页面</option>
                                ${modules.map(m => `<option value="${m.id}" ${req.query.module === m.id ? 'selected' : ''}>${m.label}</option>`).join('')}
                            </select>
                        </div>
                        <div style="flex:1; min-width:150px;">
                            <select name="category">
                                <option value="">所有分类</option>
                                ${categories.map(c => `<option value="${c.id}" ${req.query.category == c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
                            </select>
                        </div>
                        <div style="flex:1; min-width:150px;">
                            <select name="status">
                                <option value="">所有状态</option>
                                <option value="published" ${req.query.status === 'published' ? 'selected' : ''}>已发布</option>
                                <option value="draft" ${req.query.status === 'draft' ? 'selected' : ''}>草稿</option>
                            </select>
                        </div>
                        <div style="flex:2; min-width:200px;">
                            <input type="text" name="search" placeholder="搜索标题..." value="${req.query.search || ''}">
                        </div>
                    </form>

                    <div style="overflow-x:auto;">
                        <table class="admin-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>标题</th>
                                    <th>所属模块</th>
                                    <th>分类</th>
                                    <th>作者</th>
                                    <th>状态</th>
                                    <th>操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${resources.length > 0 ? resources.map(r => `
                                    <tr>
                                        <td>#${r.id}</td>
                                        <td><div style="font-weight:500; color:white;">${r.title}</div></td>
                                        <td><span class="tag-badge" style="background:#202020; color:#aaa;">${r.module_id || '-'}</span></td>
                                        <td><span class="tag-badge">${r.category_name || '未分类'}</span></td>
                                        <td>${r.author_name || '未知'}</td>
                                        <td><span class="status-badge ${r.status}">${r.status}</span></td>
                                        <td>
                                            <a href="/admin/resources/${r.id}/edit" class="action-btn view">编辑</a>
                                            <a href="/admin/resources/${r.id}/delete" class="action-btn" style="color:var(--danger)" onclick="return confirm('确定删除？')">删除</a>
                                        </td>
                                    </tr>
                                `).join('') : '<tr><td colspan="7" style="text-align:center; color:var(--text-secondary);">暂无资源</td></tr>'}
                            </tbody>
                        </table>
                    </div>
                </div>
                <script>
                    (function() {
                        const form = document.getElementById('resourceFilterForm');
                        if (!form) return;
                        const moduleSelect = form.querySelector('select[name="module"]');
                        const categorySelect = form.querySelector('select[name="category"]');
                        const allCategories = ${JSON.stringify(allCategories)};
                        
                        function renderCategoryOptions(list) {
                            categorySelect.innerHTML = '<option value="">所有分类</option>' + 
                                list.map(c => '<option value="'+c.id+'">'+c.name+'</option>').join('');
                        }
                        
                        moduleSelect.addEventListener('change', () => {
                            const moduleId = moduleSelect.value;
                            if (!moduleId) {
                                renderCategoryOptions(allCategories);
                            } else {
                                const filtered = allCategories.filter(c => c.module_id === moduleId);
                                renderCategoryOptions(filtered);
                            }
                            categorySelect.value = '';
                            form.submit();
                        });
                        
                        categorySelect.addEventListener('change', () => form.submit());
                        const searchInput = form.querySelector('input[name="search"]');
                        searchInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') form.submit(); });
                    })();
                </script>
            `;
            res.send(renderAdminPage('/admin/resources', content));
        }
    },

    // 2. 通用发布器页面 (CREATE)
    {
        path: '/create',
        method: 'get',
        handler: async (req, res) => {
            const config = require('../../../app-config');
            const modules = config.menu.filter(m => m.id && !['admin', 'user', 'plugins', 'chat', 'games'].includes(m.id));
            const content = getEditorHtml('create', null, modules, []);
            res.send(renderAdminPage('/admin', content));
        }
    },

    // 3. Preview API - Renders actual frontend view
    {
        path: '/api/preview',
        method: 'post',
        handler: async (req, res) => {
            try {
                const { module_id, category_id, title, description, content_body, tags, cover_path, attributes } = req.body;

                // Get category info to determine module
                const category = category_id ? await db.get("SELECT * FROM categories WHERE id = ?", [category_id]) : null;
                const moduleId = module_id || (category ? category.module_id : 'blog');

                // Build mock resource object
                const mockResource = {
                    id: 999,
                    title: title || '预览标题',
                    description: description || '',
                    content_body: content_body || '',
                    tags: tags || '',
                    cover_path: cover_path || '',
                    attributes: attributes ? JSON.parse(attributes) : {},
                    category_name: category ? category.name : '未分类',
                    author_name: 'Admin',
                    created_at: new Date().toISOString(),
                    views: 0,
                    likes: 0
                };

                // Render based on module type
                let html = '';

                if (moduleId === 'home') {
                    html = renderHomePreview(mockResource);
                } else if (moduleId === 'blog') {
                    html = renderBlogPreview(mockResource);
                } else if (moduleId === 'gallery') {
                    html = renderGalleryPreview(mockResource);
                } else if (moduleId === 'books') {
                    html = renderBooksPreview(mockResource);
                } else if (moduleId === 'game-resources') {
                    html = renderGameResourcesPreview(mockResource);
                } else if (moduleId === 'games') {
                    html = renderGamesPreview(mockResource);
                } else if (moduleId === 'design-assets') {
                    html = renderDesignAssetsPreview(mockResource);
                } else if (moduleId === 'moments') {
                    html = renderMomentsPreview(mockResource);
                } else if (moduleId === 'software') {
                    html = renderSoftwarePreview(mockResource);
                } else if (moduleId === 'website') {
                    html = renderWebsitePreview(mockResource);
                } else {
                    // Default generic preview
                    html = renderGenericPreview(mockResource);
                }

                // Send clean preview HTML without top-bar and sidebar
                const previewHtml = `
                <!DOCTYPE html>
                <html lang="zh-CN">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>${mockResource.title} - Preview</title>
                    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
                    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800&display=swap" rel="stylesheet">
                    <link rel="stylesheet" href="/core/core.css">
                    <link rel="stylesheet" href="/modules/${moduleId}/${moduleId}.css">
                    <style>
                        :root {
                            --primary: #8b5cf6;
                            --secondary: #ec4899;
                            --accent: #06b6d4;
                            --bg-color: #0f172a;
                            --text-main: #f8fafc;
                            --text-muted: #94a3b8;
                            --glass-bg: rgba(30, 41, 59, 0.6);
                            --glass-blur: 10px;
                            --glass-border: rgba(148, 163, 184, 0.1);
                            --primary-15: rgba(139, 92, 246, 0.15);
                            --primary-10: rgba(139, 92, 246, 0.1);
                        }
                        body {
                            margin: 0;
                            padding: 0;
                            background: var(--bg-color);
                            color: var(--text-main);
                            font-family: 'Inter', sans-serif;
                            overflow-x: hidden;
                        }
                    </style>
                </head>
                <body>
                    ${html}
                </body>
                </html>
                `;

                res.send(previewHtml);
            } catch (error) {
                console.error('Preview error:', error);
                res.status(500).send(`<div style="color:white; padding:40px;">Preview Error: ${error.message}</div>`);
            }
        }
    },

    // 4. 资源创建 API
    {
        path: '/resources/create',
        method: 'post',
        handler: async (req, res) => {
            try {
                const user = await getCurrentUser(req);
                if (!user) return res.status(401).json({ success: false, error: '未登录' });

                const uploadNone = upload.none();
                await new Promise((resolve, reject) => {
                    uploadNone(req, res, (err) => { if (err) reject(err); else resolve(); });
                });

                const { resource_id, category_id, title, description, content_body, tags, status, cover_asset_id, attributes } = req.body;

                if (!category_id) return res.status(400).json({ success: false, error: '请选择分类' });

                let attrsObj = {};
                if (attributes) {
                    try { attrsObj = typeof attributes === 'string' ? JSON.parse(attributes) : attributes; } catch (e) { }
                }

                if (resource_id) {
                    await db.run(
                        `UPDATE resources SET category_id=?, title=?, description=?, content_body=?, tags=?, status=?, cover_asset_id=?, attributes=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`,
                        [category_id, title, description, content_body, tags, status, cover_asset_id, JSON.stringify(attrsObj), resource_id]
                    );
                } else {
                    const result = await db.run(
                        `INSERT INTO resources (category_id, author_id, title, description, content_body, tags, status, cover_asset_id, attributes) 
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [category_id, user.id, title, description, content_body, tags, status || 'published', cover_asset_id, JSON.stringify(attrsObj)]
                    );
                    if (cover_asset_id) await db.run("UPDATE assets SET resource_id = ? WHERE id = ?", [result.id, cover_asset_id]);
                }

                res.redirect('/admin/resources');
            } catch (error) {
                console.error(error);
                res.status(500).send(`Error: ${error.message}`);
            }
        }
    },

    // 5. 编辑资源 (EDIT)
    {
        path: '/resources/:id/edit',
        method: 'get',
        handler: async (req, res) => {
            const resourceId = req.params.id;
            const resource = await db.get(`
                SELECT r.*, c.module_id, c.meta_schema, a.file_path as cover_path
                FROM resources r
                LEFT JOIN categories c ON r.category_id = c.id
                LEFT JOIN assets a ON r.cover_asset_id = a.id
                WHERE r.id = ?
            `, [resourceId]);

            if (!resource) return res.status(404).send('Resource not found');

            const config = require('../../../app-config');
            const modules = config.menu.filter(m => m.id && !['admin', 'user', 'plugins', 'chat'].includes(m.id));
            const categories = await db.query("SELECT * FROM categories WHERE module_id = ? ORDER BY sort_order ASC", [resource.module_id]);

            const content = getEditorHtml('edit', resource, modules, categories);
            res.send(renderAdminPage('/admin/resources', content));
        }
    },

    // 6. 删除资源
    {
        path: '/resources/:id/delete',
        method: 'get',
        handler: async (req, res) => {
            await db.run("DELETE FROM resources WHERE id = ?", [req.params.id]);
            res.redirect('/admin/resources');
        }
    }
];

// Preview Renderers - Using exact frontend card layouts
function renderHomePreview(resource) {
    const tags = resource.tags ? resource.tags.split(',').map(t => t.trim()) : [];
    return `
        <div class="home-module-container">
            <div class="works-grid" style="padding:40px; max-width:1400px; margin:0 auto;">
                <div class="work-card">
                    <div class="card-image-wrapper">
                        <img class="card-image" src="${resource.cover_path || 'https://images.unsplash.com/photo-1533134486753-c833f0ed4866?w=600&q=80'}" loading="lazy" alt="${resource.title}">
                        <div class="card-tags-overlay">
                            ${tags.slice(0, 3).map(t => `<span class="mini-tag">${t}</span>`).join('')}
                        </div>
                    </div>
                    <div class="card-info">
                        <div class="card-title">${resource.title}</div>
                        <div class="card-meta">
                            <span class="author-name">${resource.author_name}</span>
                            <div class="stats-block">
                                <span>👍 ${resource.likes || 0}</span>
                                <span>👁 ${resource.views || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderBlogPreview(resource) {
    const tags = resource.tags ? resource.tags.split(',').map(t => t.trim()) : [];
    const wordCount = resource.content_body ? Math.ceil(resource.content_body.length / 2) : 0;
    return `
        <div class="blog-container">
            <div class="blog-main" style="max-width:900px; margin:0 auto; padding:40px 20px;">
                <article class="glass-card blog-post-card fade-in">
                    <div class="post-cover" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
                        <span class="post-category">${resource.category_name}</span>
                    </div>
                    <div class="post-info">
                        <div class="post-meta">
                            <span><i class="fa-regular fa-calendar"></i> ${new Date(resource.created_at).toLocaleDateString()}</span>
                            <span><i class="fa-regular fa-eye"></i> ${resource.views || 0}</span>
                            <span><i class="fa-regular fa-comments"></i> 0</span>
                        </div>
                        <h2 class="post-title"><a href="#">${resource.title}</a></h2>
                        <p class="post-summary">${resource.description || resource.content_body.substring(0, 150) + '...'}</p>
                        <div class="post-footer">
                            <div class="post-tags">
                                ${tags.map(t => `<span>#${t}</span>`).join('')}
                            </div>
                            <a href="#" class="read-more">阅读全文 <i class="fa-solid fa-arrow-right"></i></a>
                        </div>
                    </div>
                </article>
            </div>
        </div>
    `;
}

function renderGalleryPreview(resource) {
    return `
        <div class="gallery-lightbox active">
            <div class="gallery-lightbox-container">
                <div class="gallery-lightbox-media">
                    <img src="${resource.cover_path || 'https://via.placeholder.com/800x600'}" alt="${resource.title}">
                </div>
                <div class="gallery-lightbox-details">
                    <div class="details-scroll-area">
                        <h2 class="lb-title">${resource.title}</h2>
                        <div class="lb-author-block">
                            <div class="lb-author-avatar"></div>
                            <div class="lb-author-info">
                                <h4>${resource.author_name}</h4>
                                <span>关注作者</span>
                            </div>
                        </div>
                        <div class="lb-actions">
                            <button class="lb-btn primary"><span>❤</span> 收藏</button>
                            <button class="lb-btn secondary"><span>⬇</span> 下载</button>
                        </div>
                        <div class="lb-stats">
                            <div class="stat-item"><span class="stat-value">${resource.views}</span><span class="stat-label">浏览</span></div>
                            <div class="stat-item"><span class="stat-value">${resource.likes}</span><span class="stat-label">喜欢</span></div>
                        </div>
                        ${resource.description ? `<p style="margin:20px 0; color:#cbd5e1;">${resource.description}</p>` : ''}
                        <div><div class="lb-tags-title">相关标签</div>
                        <div class="lb-tags-container">
                            ${resource.tags.split(',').map(t => t.trim() ? `<span class="detail-tag">#${t}</span>` : '').join('')}
                        </div></div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderBooksPreview(resource) {
    const attrs = resource.attributes || {};
    return `
        <div class="books-module-container">
            <div class="books-grid" style="padding:40px; max-width:1400px; margin:0 auto;">
                <div class="book-card">
                    <div class="book-cover-wrap">
                        <img src="${resource.cover_path || 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&q=80'}" alt="${resource.title}" loading="lazy">
                        <div class="book-overlay">
                            <button class="btn-quick-read">阅读</button>
                        </div>
                    </div>
                    <div class="book-info">
                        <h3 class="book-title" title="${resource.title}">${resource.title}</h3>
                        <div class="book-meta-row">
                            <span class="author">${attrs.author || resource.author_name}</span>
                            <span class="rating">★ ${attrs.rating || '4.5'}</span>
                        </div>
                        <div class="book-tags">
                            <span class="tag tag-cat">${resource.category_name}</span>
                            <span class="tag tag-fmt">${attrs.format || 'PDF'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderGameResourcesPreview(resource) {
    const attrs = resource.attributes || {};
    const posterImg = resource.cover_path || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&q=80';
    return `
        <div class="game-res-container">
            <div class="game-grid" style="padding:40px; max-width:1400px; margin:0 auto;">
                <div class="game-card">
                    <div class="card-poster">
                        <img src="${posterImg}" loading="lazy">
                        <div class="card-hover-overlay">
                            <i class="fa-solid fa-eye"></i>
                        </div>
                    </div>
                    <div class="card-content">
                        <div class="card-tags">
                            <span class="c-tag">${attrs.genre || resource.category_name}</span>
                        </div>
                        <h3 class="card-title">${resource.title}</h3>
                        <div class="card-bottom">
                            <span class="c-size">${attrs.size || '0 GB'}</span>
                            <span class="c-rating">★ ${attrs.rating || '0.0'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderGamesPreview(resource) {
    const attrs = resource.attributes || {};
    return `
        <div class="games-module-container">
            <div class="games-grid" style="padding:40px; max-width:1400px; margin:0 auto;">
                <div class="game-card">
                    <div style="position:relative; overflow:hidden;">
                        <img class="game-cover" src="${resource.cover_path || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&q=80'}" loading="lazy" alt="${resource.title}">
                        <div class="platform-badge">${attrs.platform || 'NES'}</div>
                        <div class="play-overlay">
                            <div class="play-btn-circle"><i class="fa-solid fa-play"></i></div>
                        </div>
                    </div>
                    <div class="game-info">
                        <div class="game-title">${resource.title}</div>
                        <div class="game-meta">
                            <span>${attrs.genre || resource.category_name}</span>
                            <span><i class="fa-solid fa-gamepad"></i> 立即玩</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderDesignAssetsPreview(resource) {
    const attrs = resource.attributes || {};
    const software = attrs.software ? (Array.isArray(attrs.software) ? attrs.software.slice(0, 2) : [attrs.software]) : ['Universal'];
    return `
        <div class="design-assets-module-container">
            <div class="res-layout">
                <main class="res-content">
                    <div class="res-grid" style="padding:40px; max-width:1400px; margin:0 auto;">
                        <div class="res-card">
                            <div class="card-thumb-wrap">
                                <img class="card-thumb" src="${resource.cover_path || 'https://images.unsplash.com/photo-1605806616949-1e87b487bc2a?w=600&q=80'}" loading="lazy">
                                <div class="card-overlay">
                                    <div class="card-top-tags">
                                        ${software.map(s => `<span style="background:rgba(0,0,0,0.5); padding:2px 6px; border-radius:4px; font-size:10px; color:white;">${s}</span>`).join('')}
                                    </div>
                                    <button class="card-quick-add">+ 购物车</button>
                                </div>
                            </div>
                            <div class="card-info">
                                <div class="card-title">${resource.title}</div>
                                <div class="card-author">${resource.author_name}</div>
                                <div class="card-meta">
                                    <div class="card-rating">★ ${attrs.rating || '4.5'}</div>
                                    <div class="card-points">${attrs.points === 0 ? '免费' : (attrs.points ? '🪙 ' + attrs.points : '🪙 1200')}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    `;
}

function renderMomentsPreview(resource) {
    return `
        <div class="moments-module-container">
            <div class="moments-layout">
                <main class="moments-main-col" style="max-width:700px; margin:0 auto; padding:40px 20px;">
                    <article class="moment-card glass-panel fade-in">
                        <div class="mc-left">
                            <img src="https://ui-avatars.com/api/?name=${resource.author_name}&background=random" class="mc-avatar">
                        </div>
                        <div class="mc-right">
                            <div class="mc-header">
                                <div class="mc-name-row">
                                    <span class="mc-name">${resource.author_name}</span>
                                    <span class="mc-time">预览中</span>
                                </div>
                                <button class="mc-opt-btn"><i class="fa-solid fa-ellipsis"></i></button>
                            </div>
                            <div class="mc-body">
                                <div class="mc-text">${resource.content_body.replace(/\n/g, '<br>').replace(/#([^\s]+)/g, '<span class="hashtag">#$1</span>')}</div>
                                ${resource.cover_path ? `<div class="m-media-grid grid-1"><div class="media-item img-wrap" style="background-image: url('${resource.cover_path}')"></div></div>` : ''}
                            </div>
                            <div class="mc-footer">
                                <div class="action-item"><i class="fa-regular fa-heart"></i> 0</div>
                                <div class="action-item"><i class="fa-regular fa-comment"></i> 0</div>
                                <div class="action-item"><i class="fa-solid fa-share-nodes"></i></div>
                            </div>
                        </div>
                    </article>
                </main>
            </div>
        </div>
    `;
}

function renderSoftwarePreview(resource) {
    const attrs = resource.attributes || {};
    return `
        <div class="software-module-container">
            <div class="software-list" style="padding:40px; max-width:1200px; margin:0 auto;">
                <div class="software-card">
                    <div class="card-left">
                        <div class="card-thumb">
                            <img src="${resource.cover_path || 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=600&q=80'}" alt="${resource.title}" loading="lazy">
                            <div class="license-badge ${attrs.license === '开源' ? 'open-source' : attrs.license === '免费' ? 'free' : 'commercial'}">
                                ${attrs.license || '商业'}
                            </div>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="card-header">
                            <h3 class="card-title">${resource.title}</h3>
                            <span class="card-version">v${attrs.version || '1.0'}</span>
                        </div>
                        <div class="card-meta">
                            <span class="meta-item">👤 ${resource.author_name}</span>
                            <span class="meta-item">📦 ${attrs.category || resource.category_name}</span>
                            <span class="meta-item">💻 ${attrs.platform || 'Windows'}</span>
                        </div>
                        <p class="card-desc">${resource.description || '点击查看详情、历史版本及安装教程...'}</p>
                        <div class="card-footer">
                            <div class="card-stats">
                                <span>💾 ${attrs.size || 'N/A'}</span>
                                <span>👁 ${resource.views || 0}</span>
                                <span>⬇ ${resource.downloads || 0}</span>
                            </div>
                            <button class="detail-btn">查看详情</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderWebsitePreview(resource) {
    // Website module displays link cards, so we'll show a simplified web-card
    const url = resource.attributes && resource.attributes.url ? resource.attributes.url : 'https://example.com';
    let domain = 'example.com';
    try {
        domain = new URL(url).hostname;
    } catch (e) { }
    const iconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

    return `
        <div class="website-module-container">
            <div class="website-layout">
                <main class="website-content" style="padding:40px; max-width:1200px; margin:0 auto;">
                    <section class="web-section">
                        <div class="section-header">
                            <i class="fa-solid fa-folder section-icon"></i>
                            <h2 class="section-title">${resource.category_name}</h2>
                        </div>
                        <div class="web-grid">
                            <a href="${url}" target="_blank" class="web-card" title="${resource.description}">
                                <div class="web-icon-box">
                                    <img src="${iconUrl}" alt="${resource.title}" loading="lazy" onerror="this.src='https://ui-avatars.com/api/?name=${resource.title}&background=random'">
                                </div>
                                <div class="web-info">
                                    <h3 class="web-name">${resource.title}</h3>
                                    <p class="web-desc">${resource.description || '暂无描述'}</p>
                                </div>
                                <div class="web-link-icon">
                                    <i class="fa-solid fa-arrow-up-right-from-square"></i>
                                </div>
                            </a>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    `;
}

function renderGenericPreview(resource) {
    return `
        <div style="max-width:900px; margin:40px auto; padding:20px;">
            <div class="glass-card" style="padding:40px;">
                <h1 style="font-size:2.5rem; margin-bottom:20px;">${resource.title}</h1>
                <div style="color:#94a3b8; margin-bottom:30px; border-bottom:1px solid #334155; padding-bottom:20px;">
                    <span><i class="fa-solid fa-user"></i> ${resource.author_name}</span> • 
                    <span><i class="fa-solid fa-calendar"></i> ${new Date(resource.created_at).toLocaleDateString()}</span>
                </div>
                ${resource.cover_path ? `<img src="${resource.cover_path}" style="width:100%; border-radius:12px; margin-bottom:30px;">` : ''}
                ${resource.description ? `<p style="font-size:1.1rem; color:#cbd5e1; margin-bottom:30px;">${resource.description}</p>` : ''}
                <div style="line-height:1.8; color:#e2e8f0;">${resource.content_body.replace(/\n/g, '<br>')}</div>
                ${resource.tags ? `<div style="margin-top:30px;">${resource.tags.split(',').map(t => `<span style="background:#334155; padding:4px 10px; border-radius:4px; margin-right:6px; font-size:0.9rem;">#${t.trim()}</span>`).join('')}</div>` : ''}
            </div>
        </div>
    `;
}

// Unified Editor Generator
function getEditorHtml(mode, resource, modules, categories) {
    const isEdit = mode === 'edit';
    const data = resource || {};
    const attrs = data.attributes ? JSON.parse(data.attributes) : {};
    const coverPath = data.cover_path || '';

    return `
        <div class="split-editor-container">
            <!-- Left: Editor Pane -->
            <div class="editor-pane">
                <div class="glass-card" style="margin-bottom:20px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
                        <h2 style="margin:0;">${isEdit ? '编辑资源' : '发布新内容'}</h2>
                         <a href="/admin/resources" class="btn-secondary" style="padding:6px 12px; font-size:12px;"><i class="fa-solid fa-arrow-left"></i> 返回</a>
                    </div>

                    <form id="resourceForm" class="admin-form" onsubmit="return submitResource(event)">
                        ${isEdit ? `<input type="hidden" name="resource_id" value="${data.id}">` : ''}
                        
                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px;">
                            <div>
                                <label>选择主页面 *</label>
                                <select name="module_id" id="moduleSelect" required onchange="loadModuleCategories()">
                                    <option value="">-- 请选择 --</option>
                                    ${modules.map(m => `<option value="${m.id}" ${data.module_id === m.id ? 'selected' : ''}>${m.label}</option>`).join('')}
                                </select>
                            </div>
                            <div>
                                <label>选择分类 *</label>
                                <select name="category_id" id="categorySelect" required onchange="updateFormFields()">
                                    <option value="">-- 请选择 --</option>
                                    ${categories.map(cat => {
        const schema = cat.meta_schema ? JSON.parse(cat.meta_schema) : {};
        return `<option value="${cat.id}" ${data.category_id == cat.id ? 'selected' : ''} data-schema='${JSON.stringify(schema)}'>${cat.name}</option>`;
    }).join('')}
                                </select>
                            </div>
                        </div>

                        <label>标题 *</label>
                        <input type="text" name="title" id="inputTitle" required value="${(data.title || '').replace(/"/g, '&quot;')}" placeholder="输入资源标题">

                        <label>描述</label>
                        <textarea name="description" id="inputDesc" placeholder="简短描述">${(data.description || '')}</textarea>

                        <div id="dynamicFields"></div>

                        <label>正文内容 (Markdown) *</label>
                        <textarea name="content_body" id="inputBody" rows="12" placeholder="支持Markdown格式">${(data.content_body || '')}</textarea>

                        <label>标签</label>
                        <input type="text" name="tags" id="inputTags" value="${(data.tags || '')}" placeholder="例如：UE5, 3D">

                        <label>封面图片</label>
                        <div id="coverUploadArea" style="border:2px dashed var(--border-color); padding:20px; border-radius:12px; text-align:center; cursor:pointer;" onclick="document.getElementById('coverFileInput').click()">
                            <input type="file" id="coverFileInput" accept="image/*" style="display:none" onchange="uploadCover(this)">
                            <div id="coverPreview" style="${coverPath ? 'display:block;' : 'display:none;'} margin-bottom:10px;">
                                <img id="coverImg" src="${coverPath}" style="max-height:150px; border-radius:8px;">
                            </div>
                            <div id="coverPlaceholder" style="${coverPath ? 'display:none;' : 'display:block;'}">
                                <i class="fa-solid fa-image" style="font-size:24px; color:var(--text-secondary);"></i>
                                <div style="color:var(--text-secondary); font-size:0.9rem;">点击上传封面</div>
                            </div>
                        </div>
                        <input type="hidden" name="cover_asset_id" id="coverAssetId" value="${data.cover_asset_id || ''}">

                        <label>状态</label>
                        <select name="status">
                            <option value="published" ${data.status === 'published' ? 'selected' : ''}>已发布</option>
                            <option value="draft" ${data.status === 'draft' ? 'selected' : ''}>草稿</option>
                        </select>

                        <div style="margin-top:24px; text-align:right;">
                            <button type="submit" class="btn-primary" style="width:100%; justify-content:center;">
                                <i class="fa-solid fa-paper-plane"></i> ${isEdit ? '保存修改' : '立即发布'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Right: Real-time Preview (iframe) -->
            <div class="preview-pane-wrapper">
                <div class="preview-header">
                    <span><i class="fa-regular fa-eye"></i> 实时预览 Real-time Preview</span>
                    <span class="tag-badge">Live View</span>
                </div>
                <iframe id="previewFrame" style="width:100%; height:100%; border:none; background:#0f172a;"></iframe>
            </div>
        </div>

        <script>
            let currentAttributes = ${JSON.stringify(attrs)};
            let currentModuleId = '${data.module_id || ''}';
            let currentCoverPath = '${coverPath}';
            let previewDebounce = null;

            document.addEventListener('DOMContentLoaded', () => {
                if(${isEdit}) {
                    updateFormFields();
                }
                bindPreviewEvents();
                updatePreview(); // Initial render
            });

            function bindPreviewEvents() {
                const inputs = ['inputTitle', 'inputDesc', 'inputBody', 'inputTags'];
                inputs.forEach(id => {
                    document.getElementById(id).addEventListener('input', debouncePreview);
                });
                document.getElementById('moduleSelect').addEventListener('change', debouncePreview);
                document.getElementById('categorySelect').addEventListener('change', debouncePreview);
            }

            function debouncePreview() {
                clearTimeout(previewDebounce);
                previewDebounce = setTimeout(updatePreview, 500);
            }

            async function updatePreview() {
                const formData = {
                    module_id: currentModuleId || document.getElementById('moduleSelect').value,
                    category_id: document.getElementById('categorySelect').value,
                    title: document.getElementById('inputTitle').value,
                    description: document.getElementById('inputDesc').value,
                    content_body: document.getElementById('inputBody').value,
                    tags: document.getElementById('inputTags').value,
                    cover_path: currentCoverPath,
                    attributes: JSON.stringify(currentAttributes)
                };

                try {
                    const res = await fetch('/admin/api/preview', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(formData)
                    });
                    const html = await res.text();
                    const iframe = document.getElementById('previewFrame');
                    iframe.srcdoc = html;
                } catch (error) {
                    console.error('Preview update failed:', error);
                }
            }

            async function loadModuleCategories() {
                const moduleSelect = document.getElementById('moduleSelect');
                const categorySelect = document.getElementById('categorySelect');
                const moduleId = moduleSelect.value;
                currentModuleId = moduleId;
                
                if (!moduleId) {
                    categorySelect.innerHTML = '<option value="">-- 请先选择主页面 --</option>';
                    return;
                }
                try {
                    const res = await fetch('/admin/api/categories/' + moduleId);
                    const data = await res.json();
                    if (data.success) {
                        categorySelect.innerHTML = '<option value="">-- 请选择 --</option>';
                        data.categories.forEach(cat => {
                            const option = document.createElement('option');
                            option.value = cat.id;
                            option.textContent = cat.name;
                            option.dataset.schema = cat.meta_schema || '{}';
                            categorySelect.appendChild(option);
                        });
                    }
                } catch (e) { console.error(e); }
            }

            function updateFormFields() {
                const select = document.getElementById('categorySelect');
                const selected = select.options[select.selectedIndex];
                const fieldsDiv = document.getElementById('dynamicFields');
                
                fieldsDiv.innerHTML = '';
                
                if (!selected || !selected.value) return;
                
                const schema = JSON.parse(selected.dataset.schema || '{}');
                
                if (schema.fields && schema.fields.length > 0) {
                    schema.fields.forEach(field => {
                        const fieldName = typeof field === 'string' ? field : field.name;
                        const fieldLabel = typeof field === 'string' ? fieldName : (field.label || fieldName);
                        const value = currentAttributes[fieldName] || '';
                        
                        const div = document.createElement('div');
                        div.style.marginBottom = '16px';
                        const inputHTML = \`<label>\${fieldLabel}</label>
                                           <input type="text" class="dyn-attr-input" name="attr_\${fieldName}" value="\${value}" placeholder="\${fieldLabel}">\`;
                        div.innerHTML = inputHTML;
                        fieldsDiv.appendChild(div);
                    });

                    document.querySelectorAll('.dyn-attr-input').forEach(input => {
                        input.addEventListener('input', e => {
                            const name = e.target.name.replace('attr_', '');
                            currentAttributes[name] = e.target.value;
                            debouncePreview();
                        });
                    });
                }
                debouncePreview();
            }

            function uploadCover(input) {
                if (!input.files[0]) return;
                const formData = new FormData();
                formData.append('file', input.files[0]);
                formData.append('isCover', 'true');

                fetch('/admin/api/upload', { method: 'POST', body: formData })
                .then(r => r.json())
                .then(data => {
                    if (data.success) {
                        document.getElementById('coverAssetId').value = data.asset.id;
                        document.getElementById('coverImg').src = data.asset.path;
                        document.getElementById('coverPreview').style.display = 'block';
                        document.getElementById('coverPlaceholder').style.display = 'none';
                        currentCoverPath = data.asset.path;
                        updatePreview();
                    }
                });
            }

            async function submitResource(e) {
                e.preventDefault();
                const form = e.target;
                const formData = new FormData(form);
                const attributes = {};
                formData.forEach((value, key) => {
                    if (key.startsWith('attr_')) {
                        attributes[key.replace('attr_', '')] = value;
                        formData.delete(key);
                    }
                });
                formData.append('attributes', JSON.stringify(attributes));

                try {
                    const res = await fetch('/admin/resources/create', { method: 'POST', body: formData });
                    if (res.redirected) window.location.href = res.url;
                } catch (error) {
                    alert('Process failed');
                }
            }
        </script>
    `;
}
