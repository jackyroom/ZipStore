const { render } = require('../../core/layout-engine');
const db = require('../../core/db-access');
const path = require('path');

// 辅助函数：模拟获取当前用户ID (实际项目中应从 req.session 或 req.user 获取)
async function getCurrentUser() {
    // 默认获取 id=1 的用户 (admin)
    // 如果没有用户，尝试创建一个 mock 用户
    let user = await db.get("SELECT * FROM users WHERE id = 1");
    if (!user) {
        // 如果数据库被清空，重新获取刚刚初始化的 admin
        user = await db.get("SELECT * FROM users WHERE username = 'admin'");
    }
    return user;
}

// 辅助组件：渲染记录列表
function renderRecords(records) {
    if (!records || records.length === 0) {
        return `<div style="text-align:center; padding: 40px; color: var(--text-muted);">
            <i class="ri-inbox-archive-line" style="font-size: 3rem; opacity: 0.5;"></i>
            <p>暂无记录</p>
        </div>`;
    }
    return `<ul class="records-list">
        ${records.map(r => `
            <li class="record-item">
                <div style="display:flex; align-items:center;">
                    <div class="record-icon">
                        <i class="${r.type === 'purchase' ? 'ri-shopping-cart-fill' : 'ri-download-cloud-2-line'}"></i>
                    </div>
                    <div class="record-info">
                        <h4>${r.item_title}</h4>
                        <span>ID: #${r.item_id}</span>
                    </div>
                </div>
                <div class="record-meta">
                    <span class="record-cost">${r.cost > 0 ? '¥' + r.cost : 'FREE'}</span>
                    <span class="record-date">${r.created_at}</span>
                </div>
            </li>
        `).join('')}
    </ul>`;
}

module.exports = {
    meta: {
        id: 'user',
        name: '个人中心'
    },
    routes: [
        // 1. 个人中心首页 (资料概览与编辑)
        {
            method: 'get',
            path: '/',
            handler: async (req, res) => {
                const user = await getCurrentUser();
                
                if (!user) {
                    return res.send(render({ 
                        title: '未登录', 
                        content: '<h1>请先登录</h1>', 
                        currentModule: 'user' 
                    }));
                }

                // 获取最近的下载记录
                const records = await db.query(
                    "SELECT * FROM records WHERE user_id = ? ORDER BY created_at DESC LIMIT 10", 
                    [user.id]
                );
                
                const activeTab = req.query.tab || 'profile';

                const html = `
                    <div class="user-dashboard fade-in">
                        <!-- 左侧概览 -->
                        <aside>
                            <div class="glass-card profile-card">
                                <div class="profile-avatar-wrapper">
                                    <img src="${user.avatar}" class="profile-avatar" alt="${user.username}">
                                    <button class="avatar-edit-btn" onclick="alert('头像上传功能开发中...')">
                                        <i class="ri-camera-line"></i>
                                    </button>
                                </div>
                                <h2 class="profile-name">${user.username}</h2>
                                <div class="profile-role">
                                    <i class="ri-vip-crown-fill"></i> 高级会员
                                </div>
                                <p class="profile-bio">${user.bio || '这个人很懒，什么都没写...'}</p>
                                
                                <div class="profile-stats">
                                    <div class="stat-box">
                                        <h4>${records.length}</h4>
                                        <span>已下载</span>
                                    </div>
                                    <div class="stat-box">
                                        <h4>12</h4>
                                        <span>收藏</span>
                                    </div>
                                    <div class="stat-box">
                                        <h4>0</h4>
                                        <span>积分</span>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- 快速安全设置 -->
                            <div class="glass-card" style="margin-top: 20px; padding: 20px;">
                                <h4 style="margin-bottom: 15px; border-bottom: 1px solid var(--glass-border); padding-bottom: 10px;">
                                    <i class="ri-shield-check-line"></i> 安全状态
                                </h4>
                                <div style="display:flex; justify-content:space-between; margin-bottom:10px; font-size:0.9rem;">
                                    <span style="color:var(--text-muted)">邮箱绑定</span>
                                    <span style="color:#10b981"><i class="ri-checkbox-circle-fill"></i> 已绑定</span>
                                </div>
                                <div style="display:flex; justify-content:space-between; font-size:0.9rem;">
                                    <span style="color:var(--text-muted)">手机绑定</span>
                                    <span style="color:${user.phone ? '#10b981' : '#ef4444'}">
                                        ${user.phone ? '<i class="ri-checkbox-circle-fill"></i> 已绑定' : '<i class="ri-close-circle-fill"></i> 未绑定'}
                                    </span>
                                </div>
                            </div>
                        </aside>

                        <!-- 右侧详情与设置 -->
                        <main class="glass-card settings-panel">
                            <div class="panel-tabs">
                                <a href="?tab=profile" class="tab-btn ${activeTab === 'profile' ? 'active' : ''}">
                                    <i class="ri-user-smile-line"></i> 编辑资料
                                </a>
                                <a href="?tab=security" class="tab-btn ${activeTab === 'security' ? 'active' : ''}">
                                    <i class="ri-lock-password-line"></i> 账号安全
                                </a>
                                <a href="?tab=records" class="tab-btn ${activeTab === 'records' ? 'active' : ''}">
                                    <i class="ri-file-list-3-line"></i> 下载记录
                                </a>
                            </div>

                            <div class="panel-content">
                                <!-- Tab 1: 基础资料 -->
                                ${activeTab === 'profile' ? `
                                    <form action="/user/update_profile" method="POST" class="settings-form fade-in">
                                        <div class="form-group">
                                            <label>显示名称 (Nickname)</label>
                                            <input type="text" name="username" class="glass-input" value="${user.username}">
                                        </div>
                                        <div class="form-group">
                                            <label>个人简介 (Bio)</label>
                                            <textarea name="bio" rows="4" class="glass-textarea">${user.bio || ''}</textarea>
                                        </div>
                                        <div class="form-group">
                                            <label>联系电话</label>
                                            <input type="tel" name="phone" class="glass-input" value="${user.phone || ''}">
                                        </div>
                                        <div class="form-group">
                                            <label>电子邮箱</label>
                                            <input type="email" class="glass-input" value="${user.email}" readonly title="邮箱暂不可修改">
                                        </div>
                                        <button type="submit" class="btn-save">
                                            <i class="ri-save-3-line"></i> 保存更改
                                        </button>
                                    </form>
                                ` : ''}

                                <!-- Tab 2: 安全设置 -->
                                ${activeTab === 'security' ? `
                                    <form action="/user/update_password" method="POST" class="settings-form fade-in">
                                        <div class="form-group">
                                            <label>旧密码</label>
                                            <input type="password" name="old_password" class="glass-input" required>
                                        </div>
                                        <div class="form-group">
                                            <label>新密码</label>
                                            <input type="password" name="new_password" class="glass-input" required>
                                        </div>
                                        <div class="form-group">
                                            <label>确认新密码</label>
                                            <input type="password" name="confirm_password" class="glass-input" required>
                                        </div>
                                        <button type="submit" class="btn-save" style="background: linear-gradient(135deg, #ef4444, #f87171);">
                                            <i class="ri-key-2-line"></i> 修改密码
                                        </button>
                                    </form>
                                ` : ''}

                                <!-- Tab 3: 记录列表 -->
                                ${activeTab === 'records' ? `
                                    <div class="fade-in">
                                        ${renderRecords(records)}
                                        ${records.length > 0 ? '<div style="text-align:center;margin-top:20px;"><button class="btn-ghost btn-sm">查看更多历史</button></div>' : ''}
                                    </div>
                                ` : ''}
                            </div>
                        </main>
                    </div>
                `;

                res.send(render({
                    title: '个人中心',
                    content: html,
                    currentModule: 'user',
                    extraHead: '<link rel="stylesheet" href="/modules/user/user.css">'
                }));
            }
        },

        // 2. 更新个人资料 API
        {
            method: 'post',
            path: '/update_profile',
            handler: async (req, res) => {
                const user = await getCurrentUser();
                if (!user) return res.status(401).send("Unauthorized");

                const { username, bio, phone } = req.body;
                
                try {
                    await db.run(
                        "UPDATE users SET username = ?, bio = ?, phone = ? WHERE id = ?",
                        [username, bio, phone, user.id]
                    );
                    // 刷新页面并保持在 profile tab
                    res.redirect('/user?tab=profile&msg=saved');
                } catch (e) {
                    res.send(`<script>alert('更新失败: ${e.message}');history.back();</script>`);
                }
            }
        },

        // 3. 修改密码 API
        {
            method: 'post',
            path: '/update_password',
            handler: async (req, res) => {
                const user = await getCurrentUser();
                if (!user) return res.status(401).send("Unauthorized");

                const { old_password, new_password, confirm_password } = req.body;

                if (new_password !== confirm_password) {
                    return res.send(`<script>alert('两次输入的新密码不一致');history.back();</script>`);
                }

                // 简单的密码比对 (实际应使用 bcrypt)
                if (old_password !== user.password) {
                    return res.send(`<script>alert('旧密码错误');history.back();</script>`);
                }

                try {
                    await db.run("UPDATE users SET password = ? WHERE id = ?", [new_password, user.id]);
                    res.send(`<script>alert('密码修改成功，请重新登录');location.href='/user?tab=security';</script>`);
                } catch (e) {
                    res.send(`<script>alert('系统错误: ${e.message}');history.back();</script>`);
                }
            }
        },
        
        // 4. 模拟添加一条下载记录 (用于测试)
        {
            method: 'get',
            path: '/test_add_record',
            handler: async (req, res) => {
                const user = await getCurrentUser();
                if (!user) return res.send('No user');
                
                await db.run(
                    "INSERT INTO records (user_id, item_id, item_title, type, cost) VALUES (?, ?, ?, ?, ?)",
                    [user.id, Math.floor(Math.random()*100), '测试资源 - ' + new Date().toLocaleTimeString(), 'download', 0]
                );
                res.redirect('/user?tab=records');
            }
        }
    ]
};