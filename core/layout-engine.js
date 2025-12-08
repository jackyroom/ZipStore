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
        <div class="top-bar-left">
            <!-- Logo区域 -->
            <div class="brand">
                <div class="logo-icon"><i class="fa-solid fa-bolt"></i></div>
                <h1 class="desktop-only">${config.site.title}</h1>
            </div>

            <!-- 侧边栏切换按钮 (Desktop & Mobile) -->
            <button class="menu-toggle" title="切换菜单">
                <i class="fa-solid fa-bars"></i>
            </button>
            
            <!-- 全局搜索栏 -->
            <div class="search-box">
                <i class="fa-solid fa-magnifying-glass search-icon"></i>
                <input type="text" placeholder="搜索类型/画风/模型等寻找灵感" />
                <button class="search-btn">找灵感</button>
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
            </a>
            <i class="fa-solid fa-chevron-down desktop-only" style="font-size: 0.8em; opacity: 0.5;"></i>
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
        <link href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css" rel="stylesheet">
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800&display=swap" rel="stylesheet">
        
        <!-- 样式表 -->
        <link rel="stylesheet" href="/core/core.css">
        
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
            <!-- 顶部导航栏 (全宽) -->
            ${topBarHtml}

            <div class="layout-body">
                <!-- 侧边栏 -->
                <aside class="sidebar">
                    <!-- Logo moved to top bar -->
                    
                    <nav class="nav-menu custom-scroll">
                        ${navHtml}
                    </nav>
                    
                    <div class="sidebar-footer">
                        <div class="simple-socials">
                            <a href="https://www.artstation.com" target="_blank" title="ArtStation" class="social-circle">
                                <i class="ri-artboard-fill"></i>
                            </a>
                            <a href="https://www.bilibili.com" target="_blank" title="Bilibili" class="social-circle">
                                <i class="ri-bilibili-fill"></i>
                            </a>
                            <a href="https://github.com/jackyroom" target="_blank" title="GitHub" class="social-circle">
                                <i class="ri-github-fill"></i>
                            </a>
                        </div>
                        <p class="copyright-text">© 2025 JackyRoom 2.0. Built with Microkernel Arch.</p>
                    </div>
                </aside>
    
                <!-- 主内容 -->
                <main class="main-content">
                    <!-- 内容显示区 -->
                    <div class="content-wrapper custom-scroll fade-in">
                        ${content}
                    </div>
                </main>
            </div>
        </div>

        <!-- 脚本 -->
        <script src="/core/core.js"></script>
        <script src="/js/app-interactions.js"></script>
        ${extraScripts}
    </body>
    </html>
    `;
}

module.exports = { render };
