const { renderAdminPage } = require('../admin-helpers');
const db = require('../../../core/db-access');

module.exports = [
    {
        path: '/categories',
        method: 'get',
        handler: async (req, res) => {
            const categories = await db.query("SELECT * FROM categories ORDER BY module_id ASC, sort_order ASC, id ASC");
            const config = require('../../../app-config');
            const modules = config.menu.filter(m => m.id && !['admin', 'user', 'plugins', 'chat', 'games'].includes(m.id));

            const content = `
                <div class="glass-card" style="margin: 0 auto;">
                    <div style="margin-bottom:24px; border-bottom:1px solid var(--border-color); padding-bottom:16px; display:flex; justify-content:space-between; align-items:center;">
                        <h2>分类管理</h2>
                        <button onclick="document.getElementById('addCategoryModal').style.display='flex'" class="btn-primary">
                            <i class="fa-solid fa-plus"></i> 添加分类
                        </button>
                    </div>

                    ${(() => {
                    const grouped = {};
                    categories.forEach(cat => {
                        const moduleId = cat.module_id || '未分配';
                        if (!grouped[moduleId]) grouped[moduleId] = [];
                        grouped[moduleId].push(cat);
                    });

                    let html = '';
                    Object.keys(grouped).sort().forEach(moduleId => {
                        const module = modules.find(m => m.id === moduleId);
                        const moduleLabel = module ? module.label : moduleId;
                        const moduleCats = grouped[moduleId];

                        html += `
                                <div style="margin-bottom: 32px;">
                                    <h3 style="margin-bottom: 16px; display: flex; align-items: center; gap: 10px;">
                                        <span style="width:4px; height:20px; background:var(--primary-accent); border-radius:2px;"></span>
                                        <span>${moduleLabel}</span>
                                        <span style="font-size: 0.9rem; color: var(--text-secondary); font-weight: normal;">(${moduleCats.length})</span>
                                    </h3>
                                    <table class="admin-table">
                                        <thead>
                                            <tr>
                                                <th>名称</th>
                                                <th>标识 (Slug)</th>
                                                <th>图标</th>
                                                <th>描述</th>
                                                <th>排序</th>
                                                <th>操作</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${moduleCats.map(cat => `
                                                <tr>
                                                    <td>
                                                        <div style="font-weight:500; color:white;">${cat.name}</div>
                                                    </td>
                                                    <td><code style="background:rgba(255,255,255,0.05); color:var(--text-secondary); padding:2px 6px; border-radius:4px;">${cat.slug}</code></td>
                                                    <td><i class="${cat.icon || 'fa-solid fa-tag'}"></i></td>
                                                    <td>${cat.description || '-'}</td>
                                                    <td>${cat.sort_order}</td>
                                                    <td>
                                                        <a href="/admin/categories/${cat.id}/edit" class="action-btn view"><i class="fa-solid fa-pen"></i></a>
                                                        <a href="/admin/categories/${cat.id}/delete" class="action-btn" style="color:var(--danger)" onclick="return confirm('确定删除？')"><i class="fa-solid fa-trash"></i></a>
                                                    </td>
                                                </tr>
                                            `).join('')}
                                        </tbody>
                                    </table>
                                </div>
                            `;
                    });
                    return html;
                })()}
                </div>

                <!-- 添加分类模态框 -->
                <div id="addCategoryModal" class="modal-overlay" style="display:none;">
                    <div class="modal-content" style="max-width:500px;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
                            <h3>添加分类</h3>
                            <button onclick="document.getElementById('addCategoryModal').style.display='none'" style="background:none; border:none; color:var(--text-secondary); font-size:24px; cursor:pointer;">×</button>
                        </div>
                        <form action="/admin/categories/create" method="POST" class="admin-form">
                            <label>所属页面</label>
                            <select name="module_id" required>
                                <option value="">-- 请选择页面 --</option>
                                ${modules.map(m => `<option value="${m.id}">${m.label}</option>`).join('')}
                            </select>
                            
                            <label>分类名称</label>
                            <input type="text" name="name" required placeholder="例如：概念原画">
                            
                            <label>URL标识 (slug)</label>
                            <input type="text" name="slug" required placeholder="例如：concept-art">
                            
                            <label>图标类名 (FontAwesome)</label>
                            <div style="display:flex; gap:10px; align-items:center;">
                                <input type="text" name="icon" placeholder="例如：fa-solid fa-palette" style="flex:1;">
                                <a href="https://fontawesome.com/search?o=r&m=free" target="_blank" class="btn-secondary" style="padding:13px;"><i class="fa-solid fa-search"></i></a>
                            </div>
                            
                            <label>描述</label>
                            <textarea name="description" placeholder="分类描述" style="min-height:80px;"></textarea>
                            
                            <label>排序</label>
                            <input type="number" name="sort_order" value="0">
                            
                            <div style="margin-top:24px; text-align:right;">
                                <button type="submit" class="btn-primary">创建分类</button>
                            </div>
                        </form>
                    </div>
                </div>
            `;
            res.send(renderAdminPage('/admin/categories', content));
        }
    },

    {
        path: '/categories/create',
        method: 'post',
        handler: async (req, res) => {
            try {
                const { module_id, name, slug, icon, description, sort_order } = req.body;
                await db.run(
                    "INSERT INTO categories (module_id, name, slug, icon, description, sort_order) VALUES (?, ?, ?, ?, ?, ?)",
                    [module_id, name, slug, icon || null, description || null, parseInt(sort_order) || 0]
                );
                res.redirect('/admin/categories');
            } catch (error) {
                res.send(`<h1 style="color:white">Create Failed: ${error.message}</h1>`);
            }
        }
    },

    {
        path: '/categories/:id/delete',
        method: 'get',
        handler: async (req, res) => {
            try {
                await db.run("DELETE FROM categories WHERE id = ?", [req.params.id]);
                res.redirect('/admin/categories');
            } catch (error) {
                res.send(`<h1 style="color:white">Delete Failed: ${error.message}</h1>`);
            }
        }
    },

    {
        path: '/api/categories/:moduleId',
        method: 'get',
        handler: async (req, res) => {
            try {
                const moduleId = req.params.moduleId;
                const categories = await db.query(
                    "SELECT * FROM categories WHERE module_id = ? ORDER BY sort_order ASC",
                    [moduleId]
                );
                res.json({ success: true, categories });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        }
    }
];
