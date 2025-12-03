const config = require('../app-config');

function render(options) {
    const { title, content, currentModule, extraHead = '', extraScripts = '' } = options;
    const { colors, glass } = config.theme;
    
    // --- 核心升级：支持菜单分组标题渲染 ---
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
                <header class="mobile-header">
                    <div style="display:flex;align-items:center;gap:10px;font-weight:800;font-size:1.2rem;">
                        <i class="fa-solid fa-bolt" style="color:var(--primary)"></i> ${config.site.title}
                    </div>
                    <button class="menu-toggle"><i class="fa-solid fa-bars"></i></button>
                </header>

                <div class="content-wrapper fade-in">
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
