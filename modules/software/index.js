const { render } = require('../../core/layout-engine');

// 软件工具资源数据
const SOFTWARE_RESOURCES = [
    {
        id: 1,
        title: "Adobe Creative Suite 2024",
        author: "Adobe Inc.",
        thumb: "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=600&q=80",
        platform: "Windows / macOS",
        version: "2024.1",
        size: "8.5 GB",
        downloads: 4500,
        views: 12000,
        category: "设计工具",
        license: "商业"
    },
    {
        id: 2,
        title: "JetBrains IDE 全家桶",
        author: "JetBrains",
        thumb: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&q=80",
        platform: "Windows / macOS / Linux",
        version: "2024.2",
        size: "2.1 GB",
        downloads: 3200,
        views: 8900,
        category: "开发工具",
        license: "商业"
    },
    {
        id: 3,
        title: "Blender 3.6 LTS",
        author: "Blender Foundation",
        thumb: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=600&q=80",
        platform: "全平台",
        version: "3.6.5",
        size: "350 MB",
        downloads: 8900,
        views: 25000,
        category: "3D建模",
        license: "开源"
    },
    {
        id: 4,
        title: "OBS Studio 专业版",
        author: "OBS Project",
        thumb: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&q=80",
        platform: "Windows / macOS / Linux",
        version: "30.1.2",
        size: "120 MB",
        downloads: 5600,
        views: 15000,
        category: "直播录制",
        license: "开源"
    },
    {
        id: 5,
        title: "Figma 桌面客户端",
        author: "Figma Inc.",
        thumb: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&q=80",
        platform: "Windows / macOS",
        version: "2024.1",
        size: "180 MB",
        downloads: 2800,
        views: 7200,
        category: "UI设计",
        license: "免费"
    },
    {
        id: 6,
        title: "Visual Studio Code 扩展包",
        author: "Microsoft",
        thumb: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&q=80",
        platform: "全平台",
        version: "最新",
        size: "45 MB",
        downloads: 12000,
        views: 35000,
        category: "开发工具",
        license: "免费"
    }
];

// 渲染函数
function renderSoftwarePage() {
    return `
    <div class="software-module-container">
        <!-- Header -->
        <div class="software-header">
            <div class="header-content">
                <div class="header-icon">💻</div>
                <div class="header-text">
                    <h1 class="header-title">软件工具库</h1>
                    <p class="header-desc">精选开发、设计、创作工具与实用软件集合</p>
                </div>
            </div>
            <div class="header-badge">
                <span class="badge-count">${SOFTWARE_RESOURCES.length}</span>
                <span class="badge-label">款软件</span>
            </div>
        </div>

        <!-- 分类导航 -->
        <div class="software-nav">
            <div class="nav-item active">全部</div>
            <div class="nav-item">开发工具</div>
            <div class="nav-item">设计工具</div>
            <div class="nav-item">3D建模</div>
            <div class="nav-item">直播录制</div>
            <div class="nav-item">UI设计</div>
        </div>

        <!-- 搜索栏 -->
        <div class="software-search">
            <div class="search-wrapper">
                <i class="search-icon">🔍</i>
                <input type="text" class="search-input" placeholder="搜索软件名称、平台、版本...">
                <select class="platform-filter">
                    <option>所有平台</option>
                    <option>Windows</option>
                    <option>macOS</option>
                    <option>Linux</option>
                    <option>全平台</option>
                </select>
            </div>
        </div>

        <!-- 软件列表 -->
        <div class="software-list">
            ${renderSoftwareCards(SOFTWARE_RESOURCES)}
        </div>

        <script>
            document.querySelectorAll('.nav-item').forEach(item => {
                item.addEventListener('click', function() {
                    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
                    this.classList.add('active');
                });
            });
        </script>
    </div>
    `;
}

// 渲染软件卡片
function renderSoftwareCards(items) {
    return items.map(item => `
        <div class="software-card">
            <div class="card-left">
                <div class="card-thumb">
                    <img src="${item.thumb}" alt="${item.title}" loading="lazy">
                    <div class="license-badge ${item.license === '开源' ? 'open-source' : item.license === '免费' ? 'free' : 'commercial'}">
                        ${item.license}
                    </div>
                </div>
            </div>
            <div class="card-body">
                <div class="card-header">
                    <h3 class="card-title">${item.title}</h3>
                    <span class="card-version">v${item.version}</span>
                </div>
                <div class="card-meta">
                    <span class="meta-item">👤 ${item.author}</span>
                    <span class="meta-item">📦 ${item.category}</span>
                    <span class="meta-item">💻 ${item.platform}</span>
                </div>
                <p class="card-desc">专业级 ${item.category} 软件，支持 ${item.platform} 平台</p>
                <div class="card-footer">
                    <div class="card-stats">
                        <span>💾 ${item.size}</span>
                        <span>👁 ${formatNumber(item.views)}</span>
                        <span>⬇ ${formatNumber(item.downloads)}</span>
                    </div>
                    <button class="download-btn" onclick="alert('开始下载: ${item.title}')">
                        下载
                    </button>
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
        id: 'software',
        name: '软件工具',
    },
    routes: [
        {
            method: 'GET',
            path: '/',
            handler: (req, res) => {
                const content = renderSoftwarePage();
                res.send(render({ 
                    title: '软件工具 - JackyRoom', 
                    content: content, 
                    currentModule: 'software',
                    extraHead: '<link rel="stylesheet" href="/modules/software/software.css">'
                }));
            }
        }
    ]
};

