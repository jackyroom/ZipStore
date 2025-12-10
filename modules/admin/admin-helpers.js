const db = require('../../core/db-access');

// 获取当前用户（简化版，实际应从session获取）
async function getCurrentUser(req) {
    // 默认使用admin用户，实际项目中应从req.session或req.user获取
    const user = await db.get("SELECT * FROM users WHERE username = 'admin' LIMIT 1");
    return user || { id: 1, username: 'admin', role: 'admin' };
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// 获取统计数据
async function getDashboardStats() {
    const today = new Date().toISOString().split('T')[0];

    const [
        totalResources,
        todayResources,
        totalUsers,
        totalStorage,
        topUsers,
        categoryStats
    ] = await Promise.all([
        db.get("SELECT COUNT(*) as count FROM resources"),
        db.get("SELECT COUNT(*) as count FROM resources WHERE DATE(created_at) = ?", [today]),
        db.get("SELECT COUNT(*) as count FROM users"),
        db.get("SELECT SUM(size) as total FROM assets"),
        db.query(`
            SELECT u.id, u.username, u.avatar, SUM(a.size) as total_size, COUNT(a.id) as file_count
            FROM users u
            LEFT JOIN assets a ON u.id = a.user_id
            GROUP BY u.id
            ORDER BY total_size DESC
            LIMIT 10
        `),
        db.query(`
            SELECT c.name, c.slug, COUNT(r.id) as count
            FROM categories c
            LEFT JOIN resources r ON c.id = r.category_id
            GROUP BY c.id
            ORDER BY count DESC
        `)
    ]);

    return {
        totalResources: totalResources?.count || 0,
        todayResources: todayResources?.count || 0,
        totalUsers: totalUsers?.count || 0,
        totalStorage: totalStorage?.total || 0,
        topUsers: topUsers.map(u => ({
            ...u,
            total_size: u.total_size || 0,
            formatted_size: formatFileSize(u.total_size || 0)
        })),
        categoryStats
    };
}

// 渲染Admin统一布局页面
function renderAdminPage(currentPath, content) {
    const config = require('../../app-config');
    const user = { username: 'Admin', avatar: null }; // 实际应从session获取

    const sidebarLinks = [
        { path: '/admin', icon: 'fa-solid fa-gauge-high', label: '仪表盘' },
        { path: '/admin/resources', icon: 'fa-solid fa-layer-group', label: '资源管理' },
        { path: '/admin/categories', icon: 'fa-solid fa-tags', label: '分类管理' },
        { path: '/admin/users', icon: 'fa-solid fa-users-gear', label: '用户权限' },
        { path: '/admin/settings', icon: 'fa-solid fa-gear', label: '系统设置' },
    ];

    const sidebarHtml = `
        <div class="admin-sidebar">
            <div class="sidebar-header">
                <div class="logo-area">
                    <i class="fa-solid fa-cube logo-icon"></i>
                    <span class="logo-text">ZipStore<span class="logo-dot">.</span></span>
                </div>
            </div>
            
            <nav class="sidebar-nav">
                <div class="nav-section-label">MANAGE</div>
                ${sidebarLinks.map(link => `
                    <a href="${link.path}" class="nav-item ${currentPath === link.path ? 'active' : ''}">
                        <i class="${link.icon}"></i>
                        <span>${link.label}</span>
                    </a>
                `).join('')}
                
                <div class="nav-section-label" style="margin-top:20px;">SYSTEM</div>
                <a href="/" class="nav-item">
                    <i class="fa-solid fa-arrow-right-from-bracket"></i>
                    <span>返回前台</span>
                </a>
            </nav>

            <div class="sidebar-footer">
                <div class="user-info">
                    <div class="user-avatar">
                        <i class="fa-solid fa-user"></i>
                    </div>
                    <div class="user-details">
                        <div class="user-name">${user.username}</div>
                        <div class="user-role">Administrator</div>
                    </div>
                </div>
            </div>
        </div>
    `;

    const layoutHtml = `
        <!DOCTYPE html>
        <html lang="zh-CN">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>ZipStore Admin</title>
            <link rel="stylesheet" href="/css/style.css">
            <link rel="stylesheet" href="/modules/admin/admin.css">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
            <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        </head>
        <body class="admin-body">
            <div class="admin-container">
                ${sidebarHtml}
                <main class="admin-main">
                    <header class="top-bar">
                        <div class="search-bar">
                            <i class="fa-solid fa-magnifying-glass"></i>
                            <input type="text" placeholder="全局搜索...">
                        </div>
                        <div class="top-actions">
                            <button class="icon-btn"><i class="fa-regular fa-bell"></i></button>
                            <button class="icon-btn"><i class="fa-solid fa-gear"></i></button>
                        </div>
                    </header>
                    <div class="content-wrapper">
                        ${content}
                    </div>
                </main>
            </div>
        </body>
        </html>
    `;

    return layoutHtml;
}

module.exports = {
    getCurrentUser,
    formatFileSize,
    getDashboardStats,
    renderAdminPage
};

