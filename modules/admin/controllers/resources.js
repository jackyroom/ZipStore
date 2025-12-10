const { renderAdminPage, getCurrentUser } = require('../admin-helpers');
const db = require('../../../core/db-access');
const { upload } = require('../../../core/upload-middleware');

module.exports = [
    // 1. 资源列表
    {
        path: '/resources',
        method: 'get',
        handler: async (req, res) => {
            const { category, author, status, search } = req.query;
            let sql = `
                SELECT r.*, c.name as category_name, u.username as author_name
                FROM resources r
                LEFT JOIN categories c ON r.category_id = c.id
                LEFT JOIN users u ON r.author_id = u.id
                WHERE 1=1
            `;
            const params = [];

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
            const categories = await db.query("SELECT * FROM categories ORDER BY name");
            const users = await db.query("SELECT id, username FROM users");

            const content = `
                <div class="glass-card">
                    <div style="margin-bottom:24px; display:flex; justify-content:space-between; align-items:center;">
                        <h2>资源管理</h2>
                        <a href="/admin/create" class="btn-primary">
                            <i class="fa-solid fa-plus"></i> 发布新资源
                        </a>
                    </div>

                    <!-- 筛选栏 -->
                    <form method="GET" class="admin-form" style="display:flex; gap:16px; margin-bottom:24px; flex-wrap:wrap; background:transparent; padding:0; border:none;">
                        <div style="flex:1; min-width:150px;">
                            <select name="category">
                                <option value="">所有分类</option>
                                ${categories.map(c => `<option value="${c.id}" ${req.query.category == c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
                            </select>
                        </div>
                        <div style="flex:1; min-width:150px;">
                            <select name="author">
                                <option value="">所有作者</option>
                                ${users.map(u => `<option value="${u.id}" ${req.query.author == u.id ? 'selected' : ''}>${u.username}</option>`).join('')}
                            </select>
                        </div>
                        <div style="flex:1; min-width:150px;">
                            <select name="status">
                                <option value="">所有状态</option>
                                <option value="published" ${req.query.status === 'published' ? 'selected' : ''}>已发布</option>
                                <option value="draft" ${req.query.status === 'draft' ? 'selected' : ''}>草稿</option>
                                <option value="pending" ${req.query.status === 'pending' ? 'selected' : ''}>待审核</option>
                            </select>
                        </div>
                        <div style="flex:2; min-width:200px;">
                            <input type="text" name="search" placeholder="搜索标题..." value="${req.query.search || ''}">
                        </div>
                        <button type="submit" class="btn-secondary"><i class="fa-solid fa-filter"></i> 筛选</button>
                    </form>

                    <div style="overflow-x:auto;">
                        <table class="admin-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>标题</th>
                                    <th>分类</th>
                                    <th>作者</th>
                                    <th>状态</th>
                                    <th>浏览/点赞</th>
                                    <th>操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${resources.length > 0 ? resources.map(r => `
                                    <tr>
                                        <td>#${r.id}</td>
                                        <td><div style="font-weight:500; color:white;">${r.title}</div></td>
                                        <td><span class="tag-badge">${r.category_name || '未分类'}</span></td>
                                        <td>${r.author_name || '未知'}</td>
                                        <td><span class="status-badge ${r.status}">${r.status === 'published' ? '已发布' : r.status === 'draft' ? '草稿' : '待审核'}</span></td>
                                        <td>${r.views || 0} / ${r.likes || 0}</td>
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
            `;
            res.send(renderAdminPage('/admin/resources', content));
        }
    },

    // 2. 通用发布器页面
    {
        path: '/create',
        method: 'get',
        handler: async (req, res) => {
            const config = require('../../../app-config');
            const modules = config.menu.filter(m => m.id && !['admin', 'user', 'plugins', 'chat'].includes(m.id));
            const content = getCreatePageHtml(modules);
            res.send(renderAdminPage('/admin', content)); // Highlighting 'create' isn't in menu, keeping dashboard or none
        }
    },

    // 3. 资源创建 API
    {
        path: '/resources/create',
        method: 'post',
        handler: async (req, res) => {
            try {
                const user = await getCurrentUser(req);
                if (!user) {
                    return res.status(401).json({ success: false, error: '未登录，请先登录' });
                }

                const uploadNone = upload.none();
                await new Promise((resolve, reject) => {
                    uploadNone(req, res, (err) => {
                        if (err) reject(err);
                        else resolve();
                    });
                });

                const { category_id, title, description, content_body, tags, status, cover_asset_id, attributes } = req.body;

                if (!category_id || category_id.toString().trim() === '') {
                    return res.status(400).json({ success: false, error: '请选择分类' });
                }

                let attrsObj = {};
                if (attributes) {
                    try {
                        attrsObj = typeof attributes === 'string' ? JSON.parse(attributes) : attributes;
                    } catch (e) {
                        attrsObj = {};
                    }
                }

                const result = await db.run(
                    `INSERT INTO resources (category_id, author_id, title, description, content_body, tags, status, cover_asset_id, attributes) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [category_id, user.id, title, description || null, content_body || null, tags || null, status || 'published',
                        cover_asset_id || null, JSON.stringify(attrsObj)]
                );

                if (cover_asset_id) await db.run("UPDATE assets SET resource_id = ? WHERE id = ?", [result.id, cover_asset_id]);

                const model_asset_id = req.body.model_asset_id;
                if (model_asset_id) await db.run("UPDATE assets SET resource_id = ? WHERE id = ?", [result.id, model_asset_id]);

                const media_asset_ids = req.body.media_asset_ids;
                if (media_asset_ids) {
                    const ids = media_asset_ids.split(',').filter(id => id && id.trim());
                    for (const id of ids) await db.run("UPDATE assets SET resource_id = ? WHERE id = ?", [result.id, id.trim()]);
                }

                res.redirect('/admin/resources');
            } catch (error) {
                console.error('发布资源失败:', error);
                res.status(500).json({ success: false, error: error.message });
            }
        }
    },

    // 4. 编辑资源
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

            const content = getEditPageHtml(resource, modules, categories);
            res.send(renderAdminPage('/admin/resources', content));
        }
    },

    // 5. 删除资源
    {
        path: '/resources/:id/delete',
        method: 'get',
        handler: async (req, res) => {
            try {
                await db.run("DELETE FROM resources WHERE id = ?", [req.params.id]);
                res.redirect('/admin/resources');
            } catch (error) {
                res.send(`Delete failed: ${error.message}`);
            }
        }
    }
];

function getCreatePageHtml(modules) {
    return `
        <div class="glass-card" style="max-width: 900px; margin: 0 auto;">
            <div style="margin-bottom:24px; display:flex; gap:12px; align-items:center;">
                <a href="/admin/resources" class="btn-secondary"><i class="fa-solid fa-arrow-left"></i> 返回</a>
                <h2>发布新内容</h2>
            </div>
            
            <form id="createForm" class="admin-form" onsubmit="return submitResource(event)">
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px;">
                    <div>
                        <label>选择主页面 *</label>
                        <select name="module_id" id="moduleSelect" required onchange="loadModuleCategories()">
                            <option value="">-- 请选择主页面 --</option>
                            ${modules.map(m => `<option value="${m.id}">${m.label}</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <label>选择分类 *</label>
                        <select name="category_id" id="categorySelect" required onchange="updateFormFields()">
                            <option value="">-- 请先选择主页面 --</option>
                        </select>
                    </div>
                </div>

                <label>标题 *</label>
                <input type="text" name="title" required placeholder="输入资源标题">

                <label>描述</label>
                <textarea name="description" placeholder="简短描述" style="min-height:80px;"></textarea>

                <div id="dynamicFields"></div>

                <label>正文内容 (Markdown)</label>
                <textarea name="content_body" rows="10" placeholder="支持Markdown格式"></textarea>

                <label>标签 (逗号分隔)</label>
                <input type="text" name="tags" placeholder="例如：UE5, 3D, Sci-Fi">

                <label>封面图片</label>
                <div id="coverUploadArea" style="border:2px dashed var(--border-color); padding:30px; border-radius:12px; text-align:center; cursor:pointer; background:rgba(0,0,0,0.2);" onclick="document.getElementById('coverFileInput').click()">
                    <input type="file" id="coverFileInput" accept="image/*" style="display:none" onchange="uploadCover(this)">
                    <div id="coverPreview" style="display:none; margin-bottom:10px;">
                        <img id="coverImg" src="" style="max-width:200px; max-height:200px; border-radius:8px;">
                    </div>
                    <div id="coverPlaceholder">
                        <i class="fa-solid fa-image" style="font-size:32px; color:var(--text-secondary); margin-bottom:10px;"></i>
                        <div style="color:var(--text-secondary);">点击上传封面图</div>
                    </div>
                </div>
                <input type="hidden" name="cover_asset_id" id="coverAssetId">

                <label>状态</label>
                <select name="status">
                    <option value="published">已发布</option>
                    <option value="draft">草稿</option>
                    <option value="pending">待审核</option>
                </select>

                <div style="margin-top:24px; display:flex; justify-content:flex-end;">
                    <button type="submit" class="btn-primary">立即发布</button>
                </div>
            </form>
        </div>
        ${getCommonScript(null)}
    `;
}

function getEditPageHtml(resource, modules, categories) {
    const attrs = resource.attributes ? JSON.parse(resource.attributes) : {};
    return `
        <div class="glass-card" style="max-width: 900px; margin: 0 auto;">
            <div style="margin-bottom:24px; display:flex; gap:12px; align-items:center;">
                <a href="/admin/resources" class="btn-secondary"><i class="fa-solid fa-arrow-left"></i> 返回</a>
                <h2>编辑资源</h2>
            </div>
            
            <form id="editForm" class="admin-form" onsubmit="return submitResource(event)">
                <input type="hidden" name="resource_id" value="${resource.id}">
                
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px;">
                    <div>
                        <label>选择主页面 *</label>
                        <select name="module_id" id="moduleSelect" required onchange="loadModuleCategories()">
                            <option value="">-- 请选择主页面 --</option>
                            ${modules.map(m => `<option value="${m.id}" ${resource.module_id === m.id ? 'selected' : ''}>${m.label}</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <label>选择分类 *</label>
                        <select name="category_id" id="categorySelect" required onchange="updateFormFields()">
                            <option value="">-- 请选择分类 --</option>
                            ${categories.map(cat => {
        const schema = cat.meta_schema ? JSON.parse(cat.meta_schema) : {};
        return `<option value="${cat.id}" ${resource.category_id == cat.id ? 'selected' : ''} data-schema='${JSON.stringify(schema)}'>${cat.name}</option>`;
    }).join('')}
                        </select>
                    </div>
                </div>

                <label>标题 *</label>
                <input type="text" name="title" required value="${(resource.title || '').replace(/"/g, '&quot;')}" placeholder="输入资源标题">

                <label>描述</label>
                <textarea name="description" style="min-height:80px;">${(resource.description || '').replace(/</g, '&lt;')}</textarea>

                <div id="dynamicFields"></div>

                <label>正文内容</label>
                <textarea name="content_body" rows="10">${(resource.content_body || '').replace(/</g, '&lt;')}</textarea>

                <label>标签</label>
                <input type="text" name="tags" value="${(resource.tags || '').replace(/"/g, '&quot;')}" placeholder="逗号分隔">

                <label>封面图片</label>
                <div id="coverUploadArea" style="border:2px dashed var(--border-color); padding:30px; border-radius:12px; text-align:center; cursor:pointer; background:rgba(0,0,0,0.2);" onclick="document.getElementById('coverFileInput').click()">
                    <input type="file" id="coverFileInput" accept="image/*" style="display:none" onchange="uploadCover(this)">
                    <div id="coverPreview" style="${resource.cover_path ? 'display:block;' : 'display:none;'} margin-bottom:10px;">
                        <img id="coverImg" src="${resource.cover_path || ''}" style="max-width:200px; max-height:200px; border-radius:8px;">
                    </div>
                    <div id="coverPlaceholder" style="${resource.cover_path ? 'display:none;' : 'display:block;'}">
                        <i class="fa-solid fa-image" style="font-size:32px; color:var(--text-secondary); margin-bottom:10px;"></i>
                        <div style="color:var(--text-secondary);">点击更换封面</div>
                    </div>
                </div>
                <input type="hidden" name="cover_asset_id" id="coverAssetId" value="${resource.cover_asset_id || ''}">

                <label>状态</label>
                <select name="status">
                    <option value="published" ${resource.status === 'published' ? 'selected' : ''}>已发布</option>
                    <option value="draft" ${resource.status === 'draft' ? 'selected' : ''}>草稿</option>
                </select>

                <div style="margin-top:24px; display:flex; justify-content:flex-end;">
                    <button type="submit" class="btn-primary">保存修改</button>
                </div>
            </form>
        </div>
        ${getCommonScript({
        coverAssetId: resource.cover_asset_id || null,
        attributes: attrs,
        category_id: resource.category_id
    })}
    `;
}

function getCommonScript(initialData) {
    const isEdit = !!initialData;
    const initialAttrs = isEdit ? JSON.stringify(initialData.attributes) : '{}';
    const initCatId = isEdit ? initialData.category_id : 0;

    return `
    <script>
        let coverAssetId = ${isEdit ? initialData.coverAssetId || 'null' : 'null'};
        let currentAttributes = ${initialAttrs};

        document.addEventListener('DOMContentLoaded', () => {
             if(${isEdit}) {
                 updateFormFields();
             }
        });

        async function loadModuleCategories() {
            const moduleSelect = document.getElementById('moduleSelect');
            const categorySelect = document.getElementById('categorySelect');
            const moduleId = moduleSelect.value;
            
            if (!moduleId) {
                categorySelect.innerHTML = '<option value="">-- 请先选择主页面 --</option>';
                return;
            }
            
            try {
                const res = await fetch('/admin/api/categories/' + moduleId);
                const data = await res.json();
                
                if (data.success) {
                    categorySelect.innerHTML = '<option value="">-- 请选择分类 --</option>';
                    data.categories.forEach(cat => {
                        const option = document.createElement('option');
                        option.value = cat.id;
                        option.textContent = cat.name;
                        option.dataset.schema = cat.meta_schema || '{}';
                        categorySelect.appendChild(option);
                    });
                }
            } catch (error) {
                console.error(error);
            }
        }

        function updateFormFields() {
            const select = document.getElementById('categorySelect');
            const selected = select.options[select.selectedIndex];
            const fieldsDiv = document.getElementById('dynamicFields');
            fieldsDiv.innerHTML = '';
            
            if (!selected || !selected.value) return;
            
            const schema = JSON.parse(selected.dataset.schema || '{}');
            
            if (schema.fields) {
                schema.fields.forEach(field => {
                    const fieldName = typeof field === 'string' ? field : field.name;
                    const fieldLabel = typeof field === 'string' ? fieldName : (field.label || fieldName);
                    const value = currentAttributes[fieldName] || '';
                    
                    const div = document.createElement('div');
                    div.style.marginBottom = '16px';
                    div.innerHTML = \`<label>\${fieldLabel}</label><input type="text" name="attr_\${fieldName}" value="\${value}" placeholder="\${fieldLabel}">\`;
                    fieldsDiv.appendChild(div);
                });
            }
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
                    coverAssetId = data.asset.id;
                    document.getElementById('coverAssetId').value = data.asset.id;
                    document.getElementById('coverImg').src = data.asset.path;
                    document.getElementById('coverPreview').style.display = 'block';
                    document.getElementById('coverPlaceholder').style.display = 'none';
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
                alert('保存失败');
            }
        }
    </script>
    `;
}
