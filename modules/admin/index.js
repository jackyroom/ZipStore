const { render } = require('../../core/layout-engine');
const db = require('../../core/db-access');

// --- 样式：简单的后台专用样式 ---
const adminStyle = `
<style>
    .admin-table { width: 100%; border-collapse: collapse; margin-top: 20px; color: var(--text-main); }
    .admin-table th, .admin-table td { text-align: left; padding: 12px; border-bottom: 1px solid var(--glass-border); }
    .admin-table th { color: var(--primary); font-weight: 600; }
    .admin-form input, .admin-form textarea, .admin-form select {
        width: 100%; background: rgba(0,0,0,0.2); border: 1px solid var(--glass-border);
        padding: 12px; color: white; border-radius: 8px; margin-bottom: 15px; font-family: inherit;
    }
    .admin-form textarea { min-height: 150px; resize: vertical; }
    .admin-form label { display: block; margin-bottom: 8px; color: var(--text-muted); font-size: 0.9rem; }
    .action-btn { padding: 5px 10px; border-radius: 4px; font-size: 0.8rem; cursor: pointer; text-decoration: none; display: inline-block; }
    .btn-danger { background: rgba(239, 68, 68, 0.2); color: #fca5a5; border: 1px solid rgba(239, 68, 68, 0.3); }
    .btn-danger:hover { background: rgba(239, 68, 68, 0.4); }
</style>
`;

module.exports = {
    meta: { id: 'admin', name: '后台管理' },
    routes: [
        // 1. 后台首页：显示内容列表
        {
            path: '/',
            method: 'get',
            handler: async (req, res) => {
                const items = await db.query("SELECT * FROM items ORDER BY id DESC LIMIT 50");
                
                const content = `
                    <div class="glass-card" style="margin-bottom: 30px;">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <h1><i class="fa-solid fa-gauge-high" style="color:var(--accent);margin-right:10px;"></i>内容管理控制台</h1>
                            <a href="/admin/create" class="btn-block" style="width:auto; padding: 10px 25px; background:var(--primary); border:none;">
                                <i class="fa-solid fa-plus"></i> 发布新内容
                            </a>
                        </div>
                    </div>

                    <div class="glass-card">
                        <h3>已发布内容 (${items.length})</h3>
                        <div style="overflow-x:auto;">
                            <table class="admin-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>分类</th>
                                        <th>标题</th>
                                        <th>浏览/点赞</th>
                                        <th>操作</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${items.map(i => `
                                        <tr>
                                            <td>#${i.id}</td>
                                            <td><span class="tag-badge">${i.category}</span></td>
                                            <td>${i.title}</td>
                                            <td>${i.views} / ${i.likes}</td>
                                            <td>
                                                <a href="/${i.category === 'blog' ? 'blog/view' : 'resources/' + i.category}/${i.id}" target="_blank" class="action-btn" style="background:rgba(255,255,255,0.1)">查看</a>
                                                <a href="/admin/delete/${i.id}" class="action-btn btn-danger" onclick="return confirm('确定要删除吗？')">删除</a>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    ${adminStyle}
                `;
                res.send(render({ title: '后台管理', currentModule: 'admin', content }));
            }
        },

        // 2. 发布页：显示表单
        {
            path: '/create',
            method: 'get',
            handler: (req, res) => {
                const content = `
                    <div class="glass-card" style="max-width: 800px; margin: 0 auto;">
                        <div style="margin-bottom:20px; border-bottom:1px solid var(--glass-border); padding-bottom:10px;">
                            <a href="/admin" style="color:var(--text-muted);"><i class="fa-solid fa-arrow-left"></i> 返回列表</a>
                            <h2 style="margin-top:10px;">发布新内容</h2>
                        </div>
                        
                        <form action="/admin/save" method="POST" class="admin-form">
                            <label>内容分类</label>
                            <select name="category">
                                <option value="blog">📝 个人博客</option>
                                <option value="gallery">🖼️ 摄影/画廊</option>
                                <option value="moments">📸 动态朋友圈</option>
                                <option value="unreal">🎮 虚幻素材</option>
                                <option value="software">🔌 软件工具</option>
                                <option value="books">📚 书籍分享</option>
                            </select>

                            <label>标题 / 资源名称</label>
                            <input type="text" name="title" required placeholder="例如：Jacky 的第一篇博客">

                            <label>封面图片 URL</label>
                            <input type="text" name="cover" placeholder="https://...">
                            <small style="color:var(--text-muted); display:block; margin-top:-10px; margin-bottom:15px;">目前支持输入图片链接 (未来支持上传)</small>

                            <label>内容 / 描述 (支持换行)</label>
                            <textarea name="content" required placeholder="在这里输入详细内容..."></textarea>

                            <button type="submit" class="btn-block" style="background:var(--primary); border:none; margin-top:20px;">立即发布</button>
                        </form>
                    </div>
                    ${adminStyle}
                `;
                res.send(render({ title: '发布内容', currentModule: 'admin', content }));
            }
        },

        // 3. 处理发布请求 (API)
        {
            path: '/save',
            method: 'post',
            handler: async (req, res) => {
                try {
                    const { category, title, cover, content } = req.body;
                    // 简单的模拟元数据
                    const meta = JSON.stringify({}); 
                    
                    await db.run(
                        "INSERT INTO items (category, title, cover, content, meta_data) VALUES (?, ?, ?, ?, ?)",
                        [category, title, cover, content, meta]
                    );
                    
                    // 发布成功跳转回列表
                    res.redirect('/admin');
                } catch (e) {
                    console.error(e);
                    res.send(`<h1 style="color:white">发布失败: ${e.message}</h1>`);
                }
            }
        },

        // 4. 删除功能
        {
            path: '/delete/:id',
            method: 'get',
            handler: async (req, res) => {
                await db.run("DELETE FROM items WHERE id = ?", [req.params.id]);
                res.redirect('/admin');
            }
        }
    ]
};