module.exports = {
    site: {
        title: "ZIPSTORE",
        subtitle: "探索 · 创造 · 分享",
        description: "集技术博客、资源分享与生活记录于一体的个人数字空间",
        author: "Jacky",
        favicon: "/favicon.ico.png",
        footerText: "© 2025 JackyRoom 2.0. Built with Microkernel Arch."
    },
    theme: {
        colors: {
            primary: "#6366f1", secondary: "#ec4899", accent: "#06b6d4",
            background: "#0f172a", text: "#f8fafc", textMuted: "#94a3b8"
        },
        glass: { opacity: "0.75", blur: "20px", border: "rgba(255, 255, 255, 0.1)" }
    },
    
    // --- 完善后的分类菜单结构 ---
    menu: [
        // 第一组：核心内容
        { type: 'header', label: '探索 (Explore)' },
        { id: 'home', label: '首页', path: '/', icon: 'fa-solid fa-rocket' },
        { id: 'blog', label: '技术博客', path: '/blog', icon: 'fa-solid fa-code' },
        { id: 'moments', label: '生活动态', path: '/moments', icon: 'fa-solid fa-camera-retro' },
        { id: 'gallery', label: '光影画廊', path: '/gallery', icon: 'fa-solid fa-images' },
        
        // 第二组：资源仓库
        { type: 'header', label: '资源库 (Vault)' },
        { id: 'design-assets', label: '设计素材', path: '/design-assets', icon: 'fa-brands fa-unity' },
        { id: 'software', label: '软件工具', path: '/software', icon: 'fa-solid fa-plug' },
        { id: 'books', label: '书籍阅读', path: '/books', icon: 'fa-solid fa-book' },
        { id: 'website', label: '网站目录', path: '/website', icon: 'fa-solid fa-globe' },
        { id: 'game-resources', label: '游戏资源', path: '/game-resources', icon: 'fa-solid fa-ghost' },
        
        // 第三组：娱乐功能
        { type: 'header', label: '娱乐 & 互动 (Fun)' },
        { id: 'games', label: '游戏大厅', path: '/games', icon: 'fa-solid fa-gamepad' },
        { id: 'chat', label: '公共聊天', path: '/chat', icon: 'fa-solid fa-comments' },
        
        // 第四组：系统管理
        { type: 'header', label: '系统 (System)' },
        { id: 'profile', label: '个人中心', path: '/profile', icon: 'fa-solid fa-user-astronaut' },
        { id: 'admin', label: '后台管理', path: '/admin', icon: 'fa-solid fa-gear' }
    ],
    
    dev: { port: 3000 }
};
