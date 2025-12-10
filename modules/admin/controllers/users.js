const { renderAdminPage, formatFileSize } = require('../admin-helpers');
const db = require('../../../core/db-access');

module.exports = [
    // 用户列表
    {
        path: '/users',
        method: 'get',
        handler: async (req, res) => {
            const users = await db.query(`
                SELECT u.*, 
                       (SELECT COUNT(*) FROM resources WHERE author_id = u.id) as resource_count,
                       (SELECT SUM(size) FROM assets WHERE user_id = u.id) as storage_used
                FROM users u
                ORDER BY u.created_at DESC
            `);

            const content = `
                <div class="glass-card">
                    <div style="margin-bottom:24px; border-bottom:1px solid var(--border-color); padding-bottom:16px; display:flex; justify-content:space-between; align-items:center;">
                        <h2>用户权限管理</h2>
                    </div>

                    <div style="overflow-x:auto;">
                        <table class="admin-table">
                            <thead>
                                <tr>
                                    <th>用户</th>
                                    <th>角色/权限</th>
                                    <th>贡献</th>
                                    <th>存储占用</th>
                                    <th>注册时间</th>
                                    <th>操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${users.map(u => `
                                    <tr>
                                        <td>
                                            <div style="display:flex; align-items:center; gap:12px;">
                                                <div style="width:36px; height:36px; background:var(--card-hover); border-radius:50%; display:flex; align-items:center; justify-content:center; color:var(--text-secondary);">
                                                    <i class="fa-solid fa-user"></i>
                                                </div>
                                                <div>
                                                    <div style="font-weight:500; color:white;">${u.username}</div>
                                                    <div style="font-size:0.8rem; color:var(--text-secondary);">ID: #${u.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span class="tag-badge" style="
                                                ${u.role === 'admin' ? 'background:rgba(239, 68, 68, 0.15); color:#f87171;' :
                    u.role === 'editor' ? 'background:rgba(245, 158, 11, 0.15); color:#fbbf24;' :
                        'background:rgba(59, 130, 246, 0.15); color:#60a5fa;'}">
                                                ${u.role ? u.role.toUpperCase() : 'USER'}
                                            </span>
                                        </td>
                                        <td>
                                            <div style="font-weight:500;">${u.resource_count} 发布</div>
                                        </td>
                                        <td>${formatFileSize(u.storage_used || 0)}</td>
                                        <td>${new Date(u.created_at).toLocaleDateString()}</td>
                                        <td>
                                            <button onclick="editUser(${u.id}, '${u.username}', '${u.role || 'user'}')" class="btn-secondary" style="padding:6px 12px; font-size:0.8rem;">
                                                <i class="fa-solid fa-user-pen"></i> 编辑
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- 编辑用户模态框 -->
                <div id="editUserModal" class="modal-overlay" style="display:none;">
                    <div class="modal-content" style="max-width:400px;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
                            <h3>编辑用户权限</h3>
                            <button onclick="document.getElementById('editUserModal').style.display='none'" style="background:none; border:none; color:var(--text-secondary); font-size:24px; cursor:pointer;">×</button>
                        </div>
                        <form action="/admin/users/update-role" method="POST" class="admin-form">
                            <input type="hidden" name="user_id" id="edit_user_id">
                            
                            <div style="text-align:center; margin-bottom:24px;">
                                <div style="width:60px; height:60px; background:var(--card-hover); border-radius:50%; margin:0 auto 12px; display:flex; align-items:center; justify-content:center; font-size:24px;">
                                    <i class="fa-solid fa-user-gear"></i>
                                </div>
                                <h4 id="edit_username_display" style="color:white; margin:0;"></h4>
                                <div style="color:var(--text-secondary); font-size:0.9rem;">更改用户角色与权限级别</div>
                            </div>
                            
                            <label>选择角色</label>
                            <select name="role" id="edit_role">
                                <option value="user">USER (普通用户)</option>
                                <option value="editor">EDITOR (内容编辑)</option>
                                <option value="admin">ADMIN (管理员)</option>
                            </select>
                            
                            <div style="margin-top:24px;">
                                <button type="submit" class="btn-primary" style="width:100%; justify-content:center;">保存更改</button>
                            </div>
                        </form>
                    </div>
                </div>

                <script>
                    function editUser(id, username, role) {
                        document.getElementById('edit_user_id').value = id;
                        document.getElementById('edit_username_display').textContent = username;
                        document.getElementById('edit_role').value = role;
                        document.getElementById('editUserModal').style.display = 'flex';
                    }
                </script>
            `;
            res.send(renderAdminPage('/admin/users', content));
        }
    },

    // 更新用户角色
    {
        path: '/users/update-role',
        method: 'post',
        handler: async (req, res) => {
            try {
                const { user_id, role } = req.body;
                await db.run("UPDATE users SET role = ? WHERE id = ?", [role, user_id]);
                res.redirect('/admin/users');
            } catch (error) {
                res.send(`<h1 style="color:white">Update Failed: ${error.message}</h1>`);
            }
        }
    }
];
