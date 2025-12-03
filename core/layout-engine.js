const config = require('../app-config');

// 将十六进制颜色转换为 rgba 格式
function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function render(options) {
    const { title, content, currentModule, extraHead = '', extraScripts = '' } = options;
    const { colors, glass } = config.theme;
    
    // --- 侧边栏菜单渲染逻辑 ---
    const navHtml = config.menu.map(item => {
        // 如果是标题类型
        if (item.type === 'header') {
            return `<div class="nav-header">${item.label}</div>`;
        }
        // 如果是普通菜单
        return `<a href="${item.path}" class="nav-item ${currentModule === item.id ? 'active' : ''}">
            <i class="${item.icon}" style="width:24px;text-align:center;"></i>
            <span>${item.label}</span>
        </a>`;
    }).join('');

    // --- 顶部导航栏 HTML (新增) ---
    const topBarHtml = `
    <header class="top-bar glass-card">
        <!-- 移动端菜单按钮 -->
        <button class="menu-toggle mobile-only"><i class="fa-solid fa-bars"></i></button>
        
        <!-- 左侧：全局搜索栏 -->
        <div class="top-bar-left">
            <div class="search-box">
                <i class="fa-solid fa-magnifying-glass search-icon"></i>
                <input type="text" placeholder="搜索资源、文章..." />
            </div>
        </div>

        <!-- 右侧：功能区 -->
        <div class="top-bar-right">
            <!-- 通知按钮 -->
            <div class="action-btn notification-wrapper" title="通知">
                <i class="fa-regular fa-bell"></i>
                <span class="badge-dot"></span>
            </div>
            
            <!-- 用户头像/登录区域 -->
            <a href="/auth/login" class="user-profile-widget" title="用户中心">
                <div class="avatar-ring">
                    <!-- 使用默认头像或配置中的头像 -->
                    <img src="${config.site.favicon || '/favicon.ico'}" alt="User" onerror="this.src='https://ui-avatars.com/api/?name=Guest&background=random'"/>
                </div>
                <div class="user-info desktop-only">
                    <span class="name">游客用户</span>
                    <span class="role">点击登录</span>
                </div>
                <i class="fa-solid fa-chevron-down desktop-only" style="font-size: 0.8em; opacity: 0.5;"></i>
            </a>
        </div>
    </header>
    `;

    return `
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <title>${title} | ${config.site.title}</title>
        <meta name="theme-color" content="${colors.background}">
        
        <!-- 字体与图标 -->
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800&display=swap" rel="stylesheet">
        
        <!-- 样式表 -->
        <link rel="stylesheet" href="/css/core.css">
        <link rel="stylesheet" href="/css/modules.css">
        
        <style>
            :root {
                --primary: ${colors.primary};
                --secondary: ${colors.secondary};
                --accent: ${colors.accent};
                --bg-color: ${colors.background};
                --text-main: ${colors.text};
                --text-muted: ${colors.textMuted};
                --glass-bg: rgba(30, 41, 59, ${glass.opacity});
                --glass-blur: ${glass.blur};
                --glass-border: ${glass.border};
                
                /* 生成带透明度的颜色变量，用于悬停和背景 */
                --primary-15: ${hexToRgba(colors.primary, 0.15)};
                --primary-10: ${hexToRgba(colors.primary, 0.1)};
                --primary-30: ${hexToRgba(colors.primary, 0.3)};
                --secondary-15: ${hexToRgba(colors.secondary, 0.15)};
                --accent-15: ${hexToRgba(colors.accent, 0.15)};
                --bg-60: ${hexToRgba(colors.background, 0.6)};
                --bg-80: ${hexToRgba(colors.background, 0.8)};
                --text-muted-60: ${hexToRgba(colors.textMuted, 0.6)};
                --text-muted-50: ${hexToRgba(colors.textMuted, 0.5)};
            }
        </style>
        ${extraHead}
    </head>
    <body>
        <div class="app-container">
            <!-- 侧边栏 -->
            <aside class="sidebar">
                <div class="brand">
                    <div class="logo-icon"><i class="fa-solid fa-bolt"></i></div>
                    <h1>${config.site.title}</h1>
                </div>
                
                <nav class="nav-menu custom-scroll">
                    ${navHtml}
                </nav>
                
                <div class="sidebar-footer">
                    <p>${config.site.footerText}</p>
                </div>
            </aside>

            <!-- 主内容 -->
            <main class="main-content">
                <!-- 注入顶部导航栏 -->
                ${topBarHtml}

                <!-- 内容显示区 -->
                <div class="content-wrapper custom-scroll fade-in">
                    ${content}
                </div>
            </main>
        </div>

        <!-- 脚本 -->
        <script src="/js/core.js"></script>
        <script src="/js/app-interactions.js"></script>
        ${extraScripts}
    </body>
    </html>
    `;
}

module.exports = { render };