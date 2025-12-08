const path = require('path');
const { render } = require('../../core/layout-engine');

// 1. 模拟资源数据
const ASSETS = [
    {
        id: 1,
        title: "赛博朋克贫民窟组件包",
        author: "FutureAssets",
        points: 1200,
        type: "3d",
        software: ["Unreal", "Blender"],
        format: "FBX, UASSET",
        size: "2.4 GB",
        thumb: "https://images.unsplash.com/photo-1605806616949-1e87b487bc2a?w=600&q=80",
        desc: "高质量的模块化建筑套件，包含300+个独立部件。",
        rating: 4.8
    },
    {
        id: 2,
        title: "写实材质球合集 Vol.1",
        author: "TexturePro",
        points: 0, // 免费
        type: "material",
        software: ["Substance Designer", "Universal"],
        format: "SBSAR, PNG",
        size: "800 MB",
        thumb: "https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?w=600&q=80",
        desc: "PBR 流程材质，包含混凝土、金属、木纹等常用材质。",
        rating: 4.6
    },
    {
        id: 3,
        title: "Unity 动作 RPG 模板",
        author: "GameKit",
        points: 2500,
        type: "code",
        software: ["Unity"],
        format: "UNITYPACKAGE",
        size: "150 MB",
        thumb: "https://images.unsplash.com/photo-1552058544-f2b08422138a?w=600&q=80",
        desc: "完整的 ARPG 游戏框架，包含角色控制、战斗系统和库存系统。",
        rating: 5.0
    },
    {
        id: 4,
        title: "自动拓扑插件 (AutoRemesher)",
        author: "ToolMaster",
        points: 800,
        type: "plugin",
        software: ["Blender", "Maya"],
        format: "Python Script",
        size: "25 MB",
        thumb: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=80",
        desc: "基于 AI 的快速自动拓扑工具，适用于硬表面建模。",
        rating: 4.9
    },
    {
        id: 5,
        title: "科幻武器音效库",
        author: "AudioLab",
        points: 300,
        type: "audio",
        software: ["Universal"],
        format: "WAV",
        size: "400 MB",
        thumb: "https://images.unsplash.com/photo-1516280440614-6697288d5d38?w=600&q=80",
        desc: "包含激光、充能、爆炸等多种科幻风格音效。",
        rating: 4.5
    },
    {
        id: 6,
        title: "低多边形骑士角色",
        author: "PolyArt",
        points: 500,
        type: "3d",
        software: ["Unity", "Godot"],
        format: "FBX, OBJ",
        size: "12 MB",
        thumb: "https://images.unsplash.com/photo-1595590424283-b8f17842773f?w=600&q=80",
        desc: "已绑定的低模角色，包含行走、攻击、死亡动画。",
        rating: 4.2
    },
    {
        id: 7,
        title: "次世代跑车模型",
        author: "VehicleSim",
        points: 1800,
        type: "3d",
        software: ["3ds Max", "Unreal"],
        format: "MAX, UASSET",
        size: "1.1 GB",
        thumb: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&q=80",
        desc: "高精度车内饰，支持光线追踪渲染。",
        rating: 4.9
    },
    {
        id: 8,
        title: "2D 像素风地牢图块",
        author: "PixelArtist",
        points: 200,
        type: "2d",
        software: ["Godot", "Unity"],
        format: "PNG",
        size: "5 MB",
        thumb: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&q=80",
        desc: "经典的 16x16 像素地牢场景素材。",
        rating: 4.7
    }
];

// 软件平台配置
const SOFTWARE_LIST = [
    { id: 'unreal', name: 'Unreal Engine', icon: 'U' },
    { id: 'unity', name: 'Unity', icon: 'Unity' },
    { id: 'blender', name: 'Blender', icon: 'Bl' },
    { id: 'maya', name: 'Maya', icon: 'Ma' },
    { id: '3dsmax', name: '3ds Max', icon: '3ds' },
    { id: 'substance', name: 'Substance', icon: 'Sb' }
];

// 分类配置
const CATEGORIES = [
    { id: 'all', name: '全部资源' },
    { id: '3d', name: '3D 模型' },
    { id: 'material', name: '材质与纹理' },
    { id: 'plugin', name: '工具插件' }, // 改名
    { id: 'vfx', name: '视觉特效' },
    { id: 'audio', name: '音频音效' },
    { id: 'ui', name: '界面 UI' },
    { id: '2d', name: '2D 素材' }
];

function renderPage() {
    return `
    <div class="design-assets-module-container">
        <!-- 顶部栏 -->
        <header class="design-assets-header">
            <div class="res-brand">
                <i class="res-brand-icon">❖</i>
                <span>资源工坊</span>
            </div>
            <nav class="res-nav">
                <span class="res-nav-item active">探索</span>
                <span class="res-nav-item">3D资产</span>
                <span class="res-nav-item">插件脚本</span>
                <span class="res-nav-item">社区</span>
            </nav>
            <div class="res-user-stats">
                <span>🪙</span> 1,250
            </div>
        </header>

        <div class="res-layout">
            <!-- 侧边栏 -->
            <aside class="res-sidebar">
                <!-- 软件筛选 (图表式) -->
                <div class="filter-group">
                    <div class="filter-header">
                        <span class="filter-title">适用软件</span>
                    </div>
                    <div class="software-grid">
                        ${SOFTWARE_LIST.map(sw => `
                            <div class="software-item" onclick="ResApp.filterSoftware('${sw.id}', this)">
                                <div class="sw-icon">${sw.icon}</div>
                                <div class="sw-name">${sw.name}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- 分类筛选 (列表式) -->
                <div class="filter-group">
                    <div class="filter-header">
                        <span class="filter-title">资源分类</span>
                    </div>
                    <div class="filter-list">
                        ${CATEGORIES.map((cat, idx) => `
                            <div class="filter-row ${idx === 0 ? 'active' : ''}" onclick="ResApp.filterCategory('${cat.id}', this)">
                                <div class="checkbox-mock"></div>
                                <span>${cat.name}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </aside>

            <!-- 内容区 -->
            <main class="res-content">
                <div class="content-toolbar">
                    <div class="module-search-box">
                        <i class="fa-solid fa-magnifying-glass search-icon"></i>
                        <input type="text" class="search-input" placeholder="搜索模型、插件、音频...">
                        <button class="search-btn">搜索</button>
                    </div>
                    
                    <div class="module-sort-box">
                        <i class="fa-solid fa-arrow-down-short-wide sort-icon"></i>
                        <select class="sort-select">
                            <option>综合排序</option>
                            <option>最新上架</option>
                            <option>下载最多</option>
                            <option>评分最高</option>
                        </select>
                        <i class="fa-solid fa-chevron-down arrow-icon"></i>
                    </div>
                </div>

                <div class="res-grid" id="resGrid">
                    ${renderCards(ASSETS)}
                </div>
            </main>
        </div>

        <!-- 详情模态框 -->
        <div class="res-modal-overlay" id="detailModal">
            <div class="res-modal">
                <button class="modal-close" onclick="ResApp.closeModal()">×</button>
                
                <div class="modal-gallery">
                    <img id="mImage" src="" alt="">
                </div>
                
                <div class="modal-details">
                    <div class="modal-tag" id="mType">CATEGORY</div>
                    <h2 class="modal-title" id="mTitle">Title</h2>
                    <div class="modal-author">By <span id="mAuthor" style="color:white; font-weight:bold;">Author</span></div>
                    
                    <div class="modal-price-box">
                        <span class="modal-price" id="mPrice">0</span>
                        <button class="btn-primary">立即获取</button>
                    </div>
                    
                    <p class="modal-desc" id="mDesc">Description...</p>
                    
                    <div class="tech-grid">
                        <div class="tech-item">
                            <span class="tech-label">支持软件</span>
                            <span class="tech-val" id="mSoft">Unreal</span>
                        </div>
                        <div class="tech-item">
                            <span class="tech-label">文件格式</span>
                            <span class="tech-val" id="mFormat">FBX</span>
                        </div>
                        <div class="tech-item">
                            <span class="tech-label">文件大小</span>
                            <span class="tech-val" id="mSize">100MB</span>
                        </div>
                         <div class="tech-item">
                            <span class="tech-label">用户评分</span>
                            <span class="tech-val" id="mRating">4.8</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <script>
            const DATA = ${JSON.stringify(ASSETS)};
            
            const ResApp = {
                // 模拟过滤
                filterCategory: function(id, el) {
                    // UI toggle
                    document.querySelectorAll('.filter-row').forEach(r => r.classList.remove('active'));
                    el.classList.add('active');
                    
                    const filtered = id === 'all' ? DATA : DATA.filter(d => d.type === id);
                    this.updateGrid(filtered);
                },

                filterSoftware: function(swId, el) {
                    // 简单的单选高亮逻辑
                    document.querySelectorAll('.software-item').forEach(i => i.classList.remove('active'));
                    el.classList.add('active');
                    
                    const filtered = DATA.filter(d => d.software.map(s=>s.toLowerCase()).some(s=>s.includes(swId)));
                    this.updateGrid(filtered);
                },

                updateGrid: function(items) {
                    document.getElementById('resGrid').innerHTML = items.map(this.getCardHtml).join('');
                },

                getCardHtml: function(item) {
                    const dataStr = encodeURIComponent(JSON.stringify(item));
                    const pts = item.points === 0 ? '免费' : item.points;
                    const ptsClass = item.points === 0 ? 'free' : '';
                    
                    return \`
                    <div class="res-card" onclick="ResApp.openModal('\${dataStr}')">
                        <div class="card-thumb-wrap">
                            <img class="card-thumb" src="\${item.thumb}" loading="lazy">
                            <div class="card-overlay">
                                <div class="card-top-tags">
                                    \${item.software.slice(0,2).map(s => '<span style="background:rgba(0,0,0,0.5); padding:2px 6px; border-radius:4px; font-size:10px; color:white;">'+s+'</span>').join('')}
                                </div>
                                <button class="card-quick-add" onclick="event.stopPropagation(); alert('Added')">
                                    + 购物车
                                </button>
                            </div>
                        </div>
                        <div class="card-info">
                            <div class="card-title">\${item.title}</div>
                            <div class="card-author">\${item.author}</div>
                            <div class="card-meta">
                                <div class="card-rating">★ \${item.rating}</div>
                                <div class="card-points \${ptsClass}">\${typeof pts === 'number' ? '🪙' : ''} \${pts}</div>
                            </div>
                        </div>
                    </div>
                    \`;
                },

                openModal: function(dataStr) {
                    const item = JSON.parse(decodeURIComponent(dataStr));
                    document.getElementById('mImage').src = item.thumb;
                    document.getElementById('mTitle').innerText = item.title;
                    document.getElementById('mAuthor').innerText = item.author;
                    document.getElementById('mType').innerText = item.type.toUpperCase();
                    document.getElementById('mDesc').innerText = item.desc;
                    
                    const priceEl = document.getElementById('mPrice');
                    priceEl.innerText = item.points === 0 ? '免费' : '🪙 ' + item.points;
                    priceEl.style.color = item.points === 0 ? '#34d399' : '#fbbf24';

                    document.getElementById('mSoft').innerText = item.software.join(', ');
                    document.getElementById('mFormat').innerText = item.format;
                    document.getElementById('mSize').innerText = item.size;
                    document.getElementById('mRating').innerText = item.rating + ' / 5.0';

                    document.getElementById('detailModal').classList.add('active');
                },

                closeModal: function() {
                    document.getElementById('detailModal').classList.remove('active');
                }
            };
            
            // 初始渲染
            ResApp.updateGrid(DATA);
            
            // 遮罩点击关闭
            document.getElementById('detailModal').addEventListener('click', (e) => {
                if(e.target.id === 'detailModal') ResApp.closeModal();
            });
        </script>
    </div>
    `;
}

function renderCards(items) {
    // 后端渲染初始态，逻辑同前端 getCardHtml
    return items.map(item => {
        const dataStr = encodeURIComponent(JSON.stringify(item));
        const pts = item.points === 0 ? '免费' : item.points;
        return `
        <div class="res-card" onclick="ResApp.openModal('${dataStr}')">
            <div class="card-thumb-wrap">
                <img class="card-thumb" src="${item.thumb}" loading="lazy">
                <div class="card-overlay">
                     <div class="card-top-tags">
                        ${item.software.slice(0, 2).map(s => `<span style="background:rgba(0,0,0,0.5); padding:2px 6px; border-radius:4px; font-size:10px; color:white;">${s}</span>`).join('')}
                    </div>
                    <button class="card-quick-add" onclick="event.stopPropagation(); alert('Added')">
                        + 购物车
                    </button>
                </div>
            </div>
            <div class="card-info">
                <div class="card-title">${item.title}</div>
                <div class="card-author">${item.author}</div>
                <div class="card-meta">
                    <div class="card-rating">★ ${item.rating}</div>
                    <div class="card-points ${item.points === 0 ? 'free' : ''}">
                        ${item.points > 0 ? '🪙' : ''} ${pts}
                    </div>
                </div>
            </div>
        </div>
        `;
    }).join('');
}

module.exports = {
    meta: {
        id: 'design-assets',
        name: '设计素材',
        icon: 'cubes'
    },
    routes: [
        {
            method: 'GET',
            path: '/',
            handler: (req, res) => {
                const content = renderPage();
                res.send(render({
                    title: '设计素材 - JackyRoom',
                    content: content,
                    currentModule: 'design-assets',
                    extraHead: '<link rel="stylesheet" href="/modules/design-assets/design-assets.css">'
                }));
            }
        }
    ]
};