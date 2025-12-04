const { render } = require('../../core/layout-engine');

// 虚幻引擎资源数据
const UNREAL_RESOURCES = [
    {
        id: 1,
        title: "UE5 超写实丛林资产包",
        author: "ForestLab",
        thumb: "https://images.unsplash.com/photo-1448375240586-dfd8f3793371?w=600&q=80",
        version: "UE 5.3",
        format: "UASSET",
        size: "2.4 GB",
        downloads: 1205,
        views: 3400,
        category: "环境场景"
    },
    {
        id: 2,
        title: "次世代角色模型包",
        author: "CharacterStudio",
        thumb: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&q=80",
        version: "UE 5.2",
        format: "FBX / UASSET",
        size: "850 MB",
        downloads: 890,
        views: 2100,
        category: "角色模型"
    },
    {
        id: 3,
        title: "PBR 材质库合集",
        author: "MaterialPro",
        thumb: "https://images.unsplash.com/photo-1524055988636-436cfa46e59e?w=600&q=80",
        version: "UE 5.1+",
        format: "UASSET",
        size: "1.2 GB",
        downloads: 3200,
        views: 5600,
        category: "材质纹理"
    },
    {
        id: 4,
        title: "蓝图系统模板",
        author: "BlueprintMaster",
        thumb: "https://images.unsplash.com/photo-1515630278258-407f66498911?w=600&q=80",
        version: "UE 5.3",
        format: "UASSET",
        size: "45 MB",
        downloads: 2100,
        views: 4500,
        category: "蓝图系统"
    },
    {
        id: 5,
        title: "VFX 粒子特效包",
        author: "VFX_Guy",
        thumb: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=600&q=80",
        version: "UE 5.2+",
        format: "UASSET",
        size: "120 MB",
        downloads: 540,
        views: 1200,
        category: "特效"
    },
    {
        id: 6,
        title: "建筑模型资产包",
        author: "CityBuilder",
        thumb: "https://images.unsplash.com/photo-1515630278258-407f66498911?w=600&q=80",
        version: "UE 5.1+",
        format: "FBX / UASSET",
        size: "3.5 GB",
        downloads: 1500,
        views: 3100,
        category: "建筑模型"
    }
];

// 渲染函数
function renderUnrealPage() {
    return `
    <div class="unreal-module-container">
        <!-- Hero 区域 -->
        <div class="unreal-hero">
            <div class="hero-content">
                <div class="hero-icon">🎮</div>
                <h1 class="hero-title">虚幻引擎资源库</h1>
                <p class="hero-subtitle">精选 UE5/UE4 高质量资产、材质、蓝图与特效资源</p>
                <div class="hero-stats">
                    <div class="stat-item">
                        <span class="stat-value">${UNREAL_RESOURCES.length}</span>
                        <span class="stat-label">资源总数</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${UNREAL_RESOURCES.reduce((sum, r) => sum + r.downloads, 0).toLocaleString()}</span>
                        <span class="stat-label">总下载量</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- 筛选工具栏 -->
        <div class="unreal-toolbar">
            <div class="toolbar-left">
                <div class="search-box">
                    <i class="search-icon">🔍</i>
                    <input type="text" class="search-input" placeholder="搜索 UE 资源...">
                </div>
            </div>
            <div class="toolbar-right">
                <select class="filter-select">
                    <option>所有版本</option>
                    <option>UE 5.3</option>
                    <option>UE 5.2</option>
                    <option>UE 5.1</option>
                    <option>UE 4.27</option>
                </select>
                <select class="filter-select">
                    <option>所有分类</option>
                    <option>环境场景</option>
                    <option>角色模型</option>
                    <option>材质纹理</option>
                    <option>蓝图系统</option>
                    <option>特效</option>
                </select>
                <div class="sort-tabs">
                    <span class="sort-tab active">热门</span>
                    <span class="sort-tab">最新</span>
                    <span class="sort-tab">下载量</span>
                </div>
            </div>
        </div>

        <!-- 资源网格 -->
        <div class="unreal-grid">
            ${renderUnrealCards(UNREAL_RESOURCES)}
        </div>

        <script>
            // 交互逻辑
            document.querySelectorAll('.sort-tab').forEach(tab => {
                tab.addEventListener('click', function() {
                    document.querySelectorAll('.sort-tab').forEach(t => t.classList.remove('active'));
                    this.classList.add('active');
                });
            });
        </script>
    </div>
    `;
}

// 渲染卡片
function renderUnrealCards(items) {
    return items.map(item => `
        <div class="unreal-card">
            <div class="card-image-wrapper">
                <img class="card-image" src="${item.thumb}" loading="lazy" alt="${item.title}">
                <div class="version-badge">${item.version}</div>
                <div class="category-badge">${item.category}</div>
                <div class="card-overlay">
                    <button class="download-btn" onclick="alert('开始下载: ${item.title}')">
                        ⬇ 下载
                    </button>
                </div>
            </div>
            <div class="card-info">
                <h3 class="card-title">${item.title}</h3>
                <div class="card-meta">
                    <span class="author">👤 ${item.author}</span>
                    <span class="format">📦 ${item.format}</span>
                </div>
                <div class="card-footer">
                    <span class="size">💾 ${item.size}</span>
                    <div class="stats">
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
        id: 'unreal',
        name: '虚幻素材',
    },
    routes: [
        {
            method: 'GET',
            path: '/',
            handler: (req, res) => {
                const content = renderUnrealPage();
                res.send(render({ 
                    title: '虚幻素材 - JackyRoom', 
                    content: content, 
                    currentModule: 'unreal',
                    extraHead: '<link rel="stylesheet" href="/modules/unreal/unreal.css">'
                }));
            }
        }
    ]
};

