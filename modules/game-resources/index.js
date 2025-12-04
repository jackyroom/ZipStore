const { render } = require('../../core/layout-engine');

// 游戏资源数据
const GAME_RESOURCES = [
    {
        id: 1,
        title: "独立游戏开发资源包",
        author: "IndieDev",
        thumb: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&q=80",
        type: "资源包",
        platform: "Unity / Unreal",
        size: "1.2 GB",
        downloads: 3200,
        views: 8900,
        category: "游戏素材"
    },
    {
        id: 2,
        title: "2D 像素艺术素材集",
        author: "PixelArt Studio",
        thumb: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&q=80",
        type: "像素素材",
        platform: "通用",
        size: "450 MB",
        downloads: 5600,
        views: 15000,
        category: "2D素材"
    },
    {
        id: 3,
        title: "音效库合集",
        author: "SoundDesign Pro",
        thumb: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&q=80",
        type: "音效",
        platform: "通用",
        size: "2.8 GB",
        downloads: 2800,
        views: 7200,
        category: "音频资源"
    },
    {
        id: 4,
        title: "UI 界面素材包",
        author: "UI Designer",
        thumb: "https://images.unsplash.com/photo-1614728853970-c8f4756282f5?w=600&q=80",
        type: "UI素材",
        platform: "Unity / Figma",
        size: "320 MB",
        downloads: 4500,
        views: 12000,
        category: "UI资源"
    },
    {
        id: 5,
        title: "角色动画包",
        author: "Animation Lab",
        thumb: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&q=80",
        type: "动画",
        platform: "Unity",
        size: "680 MB",
        downloads: 2100,
        views: 6200,
        category: "动画资源"
    },
    {
        id: 6,
        title: "游戏源码示例",
        author: "CodeMaster",
        thumb: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&q=80",
        type: "源码",
        platform: "Unity / C#",
        size: "125 MB",
        downloads: 3800,
        views: 9800,
        category: "代码资源"
    }
];

// 渲染函数
function renderGameResourcesPage() {
    return `
    <div class="game-resources-module-container">
        <!-- Hero Section -->
        <div class="game-hero">
            <div class="hero-bg"></div>
            <div class="hero-content">
                <div class="hero-icon">🎮</div>
                <h1 class="hero-title">游戏资源库</h1>
                <p class="hero-subtitle">游戏开发所需的各种素材、音效、代码与资源集合</p>
                <div class="hero-features">
                    <div class="feature-item">
                        <span class="feature-icon">🎨</span>
                        <span class="feature-text">游戏素材</span>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon">🔊</span>
                        <span class="feature-text">音效资源</span>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon">💻</span>
                        <span class="feature-text">游戏源码</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- 快速筛选 -->
        <div class="game-filters">
            <div class="filter-group">
                <span class="filter-label">类型:</span>
                <div class="filter-buttons">
                    <button class="filter-btn active">全部</button>
                    <button class="filter-btn">游戏素材</button>
                    <button class="filter-btn">2D素材</button>
                    <button class="filter-btn">音频资源</button>
                    <button class="filter-btn">UI资源</button>
                    <button class="filter-btn">动画资源</button>
                    <button class="filter-btn">代码资源</button>
                </div>
            </div>
            <div class="filter-group">
                <span class="filter-label">平台:</span>
                <select class="platform-select">
                    <option>所有平台</option>
                    <option>Unity</option>
                    <option>Unreal</option>
                    <option>通用</option>
                </select>
            </div>
        </div>

        <!-- 搜索栏 -->
        <div class="game-search">
            <div class="search-box">
                <i class="search-icon">🔍</i>
                <input type="text" class="search-input" placeholder="搜索游戏资源...">
            </div>
        </div>

        <!-- 资源网格 -->
        <div class="game-grid">
            ${renderGameCards(GAME_RESOURCES)}
        </div>

        <script>
            // 筛选按钮交互
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                });
            });
        </script>
    </div>
    `;
}

// 渲染游戏资源卡片
function renderGameCards(items) {
    return items.map(item => `
        <div class="game-card">
            <div class="card-image-container">
                <img src="${item.thumb}" alt="${item.title}" loading="lazy">
                <div class="type-badge">${item.type}</div>
                <div class="card-actions">
                    <button class="action-btn preview" onclick="alert('预览: ${item.title}')">👁</button>
                    <button class="action-btn download" onclick="alert('下载: ${item.title}')">⬇</button>
                </div>
            </div>
            <div class="card-body">
                <div class="card-category">${item.category}</div>
                <h3 class="card-title">${item.title}</h3>
                <div class="card-author">👤 ${item.author}</div>
                <div class="card-platform">💻 ${item.platform}</div>
                <div class="card-footer">
                    <div class="card-size">💾 ${item.size}</div>
                    <div class="card-stats">
                        <span>👁 ${formatNumber(item.views)}</span>
                        <span>⬇ ${formatNumber(item.downloads)}</span>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// 数字格式化
function formatNumber(num) {
    return num > 999 ? (num/1000).toFixed(1) + 'k' : num;
}

module.exports = {
    meta: {
        id: 'game-resources',
        name: '游戏资源',
    },
    routes: [
        {
            method: 'GET',
            path: '/',
            handler: (req, res) => {
                const content = renderGameResourcesPage();
                res.send(render({ 
                    title: '游戏资源 - JackyRoom', 
                    content: content, 
                    currentModule: 'game-resources',
                    extraHead: '<link rel="stylesheet" href="/modules/game-resources/game-resources.css">'
                }));
            }
        }
    ]
};

