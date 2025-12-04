const path = require('path');
const { render } = require('../../core/layout-engine');

// 1. 配置信息
const HERO_DATA = {
    title: "数字艺术的无尽边疆",
    subtitle: "连接全球顶尖概念设计师、3D 艺术家与特效专家",
    // 使用更暗黑、更符合游戏/影视风格的背景图
    bg: "https://images.unsplash.com/photo-1533134486753-c833f0ed4866?w=1600&q=80"
};

const CATEGORIES = [
    { id: 'all', name: '综合推荐' },
    { id: 'concept', name: '概念原画' },
    { id: 'model', name: '3D模型' },
    { id: 'env', name: '场景地编' },
    { id: 'vfx', name: '视觉特效' },
    { id: 'ui', name: '游戏UI' }
];

// 2. 模拟作品库 (增强版数据结构)
// media 数组支持混合 image 和 video
const WORKS_DATA = [
    { 
        id: 1, 
        title: "赛博废墟: 侦察兵", 
        author: "Neo_Design", 
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Neo", 
        type: "concept", 
        views: "12.5k", 
        likes: "3.2k", 
        cover: "https://images.unsplash.com/photo-1563089145-599997674d42?w=600&q=80",
        // 详情页的多图展示
        media: [
            { type: 'image', src: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=1600&q=80' }, // 主图
            { type: 'image', src: 'https://images.unsplash.com/photo-1542256844-64f70cc2884b?w=1600&q=80' }, // 细节图
            { type: 'image', src: 'https://images.unsplash.com/photo-1535378437268-13d143aa5dce?w=1600&q=80' }, // 线稿
        ],
        desc: "2077年边境废墟的侦察兵概念设计。使用了 Photoshop 和 Blender 辅助透视。",
        tags: ["Cyberpunk", "Sci-Fi", "Character Design", "2D"]
    },
    { 
        id: 2, 
        title: "神秘山谷渲染", 
        author: "EnvironmentPro", 
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Env", 
        type: "env", 
        views: "8.9k", 
        likes: "920", 
        cover: "https://images.unsplash.com/photo-1511884642898-4c92249f20b6?w=600&q=80",
        media: [
            // 模拟视频内容 (使用 Unsplash 占位，实际应当是 mp4)
            { type: 'video', src: 'https://media.w3.org/2010/05/sintel/trailer.mp4', poster: 'https://images.unsplash.com/photo-1511884642898-4c92249f20b6?w=1600&q=80' },
            { type: 'image', src: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&q=80' },
        ],
        desc: "UE5 实时渲染练习，使用了 Nanite 和 Lumen 技术。",
        tags: ["Unreal Engine 5", "Landscape", "Realtime"]
    },
    { 
        id: 3, 
        title: "机甲维护中心", 
        author: "HardSurfaceGuy", 
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mech", 
        type: "model", 
        views: "22k", 
        likes: "4.5k", 
        cover: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&q=80",
        media: [
            { type: 'image', src: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=1600&q=80' },
            { type: 'image', src: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1600&q=80' },
        ],
        desc: "硬表面建模练习，高模烘焙到低模。",
        tags: ["3D", "Hard Surface", "Robot"]
    },
    { 
        id: 4, 
        title: "粒子特效演示", 
        author: "VFX_Wizard", 
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=VFX", 
        type: "vfx", 
        views: "5.6k", 
        likes: "330", 
        cover: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=600&q=80",
        media: [
            { type: 'video', src: 'https://media.w3.org/2010/05/sintel/trailer.mp4', poster: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=1600&q=80' }
        ],
        desc: "Unity Shader Graph 和粒子系统制作的魔法特效。",
        tags: ["VFX", "Unity", "Magic"]
    },
    { 
        id: 5, 
        title: "现代应用界面", 
        author: "UI_Ninja", 
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=UI", 
        type: "ui", 
        views: "4.1k", 
        likes: "210", 
        cover: "https://images.unsplash.com/photo-1614728853970-c8f4756282f5?w=600&q=80",
        media: [
            { type: 'image', src: 'https://images.unsplash.com/photo-1614728853970-c8f4756282f5?w=1600&q=80' },
            { type: 'image', src: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1600&q=80' }
        ],
        desc: "金融科技类 App 的界面设计探索。",
        tags: ["UI/UX", "App Design", "Figma"]
    },
    { 
        id: 6, 
        title: "幻想生物图鉴", 
        author: "CreatureLab", 
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Monster", 
        type: "concept", 
        views: "2.2k", 
        likes: "150", 
        cover: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&q=80",
        media: [
            { type: 'image', src: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&q=80' }
        ],
        desc: "每周速涂练习。",
        tags: ["Creature", "Fantasy", "Sketch"]
    },
];

function renderHomePage() {
    return `
    <div class="home-module-container">
        <!-- Hero Banner -->
        <div class="home-hero">
            <img class="hero-bg" src="${HERO_DATA.bg}" alt="Hero Background">
            <div class="hero-content">
                <h1 class="hero-title">${HERO_DATA.title}</h1>
                <p class="hero-subtitle">${HERO_DATA.subtitle}</p>
                <button class="hero-cta" onclick="alert('注册功能开发中')">加入社区</button>
            </div>
        </div>

        <!-- 导航栏 -->
        <div class="home-nav-container">
            <div class="nav-inner">
                <div class="category-tabs" id="categoryTabs">
                    ${CATEGORIES.map((cat, index) => `
                        <div class="category-tab ${index === 0 ? 'active' : ''}" 
                             data-type="${cat.id}"
                             onclick="HomeApp.filterWorks('${cat.id}', this)">
                             ${cat.name}
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>

        <!-- 作品网格 -->
        <div class="works-grid" id="worksGrid">
            ${renderWorksGrid(WORKS_DATA)}
        </div>

        <!-- 详情全屏页 (ArtStation Style) -->
        <div class="home-modal" id="detailModal">
            <button class="modal-close-btn" onclick="HomeApp.closeModal()">×</button>
            
            <!-- 顶部信息区 -->
            <div class="modal-header-bar">
                <div class="modal-header-left">
                    <img class="modal-author-avatar" id="mAvatar" src="" alt="">
                    <div class="modal-work-info">
                        <h1 id="mTitle">Title</h1>
                        <p>By <span class="highlight" id="mAuthor">Author</span> • <span id="mType">Category</span></p>
                    </div>
                </div>
                <div class="modal-header-right">
                    <button class="modal-action-btn primary"><span>👍</span> 点赞 <span id="mLikes">0</span></button>
                    <button class="modal-action-btn"><span>➕</span> 关注</button>
                </div>
            </div>

            <!-- 垂直内容流 (图片/视频堆叠) -->
            <div class="modal-content-flow" id="mContentFlow">
                <!-- 动态生成 -->
            </div>

            <!-- 底部信息 -->
            <div class="modal-info-bar" style="text-align:center; max-width:800px; margin:0 auto 40px;">
                <p class="modal-desc" id="mDesc" style="font-size:16px; color:#ccc; line-height:1.8;">Description</p>
            </div>

            <div class="modal-footer-tags" id="mTags">
                <!-- Tags -->
            </div>
        </div>

        <script>
            const ALL_WORKS = ${JSON.stringify(WORKS_DATA)};

            const HomeApp = {
                filterWorks: function(type, tabElement) {
                    document.querySelectorAll('.category-tab').forEach(el => el.classList.remove('active'));
                    tabElement.classList.add('active');

                    const grid = document.getElementById('worksGrid');
                    const filtered = (type === 'all') 
                        ? ALL_WORKS 
                        : ALL_WORKS.filter(w => w.type === type);

                    grid.innerHTML = filtered.map(w => this.getCardHtml(w)).join('');
                },

                getCardHtml: function(w) {
                    const dataStr = encodeURIComponent(JSON.stringify(w));
                    // 检查是否包含视频
                    const hasVideo = w.media && w.media.some(m => m.type === 'video');
                    
                    return \`
                    <div class="work-card" onclick="HomeApp.openModal('\${dataStr}')">
                        <div class="card-image-wrapper">
                            <img class="card-image" src="\${w.cover}" loading="lazy" alt="\${w.title}">
                            \${hasVideo ? '<div class="media-type-icon">▶</div>' : ''}
                            <div class="card-tags-overlay">
                                \${w.tags.slice(0,3).map(t => '<span class="mini-tag">'+t+'</span>').join('')}
                            </div>
                        </div>
                        <div class="card-info">
                            <div class="card-title">\${w.title}</div>
                            <div class="card-meta">
                                <span class="author-name">\${w.author}</span>
                                <div class="stats-block">
                                    <span>👍 \${w.likes}</span>
                                    <span>👁 \${w.views}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    \`;
                },

                openModal: function(dataStr) {
                    const data = JSON.parse(decodeURIComponent(dataStr));
                    const modal = document.getElementById('detailModal');
                    
                    // 1. 填充头部信息
                    document.getElementById('mTitle').innerText = data.title;
                    document.getElementById('mAuthor').innerText = data.author;
                    document.getElementById('mType').innerText = data.type.toUpperCase();
                    document.getElementById('mLikes').innerText = data.likes;
                    document.getElementById('mAvatar').src = data.avatar;
                    document.getElementById('mDesc').innerText = data.desc || "暂无描述";

                    // 2. 渲染媒体流 (图片 + 视频)
                    const flowContainer = document.getElementById('mContentFlow');
                    flowContainer.innerHTML = ''; // 清空旧内容

                    if (data.media && data.media.length > 0) {
                        data.media.forEach(item => {
                            let el;
                            if (item.type === 'video') {
                                const wrapper = document.createElement('div');
                                wrapper.className = 'modal-media-item video-wrapper';
                                wrapper.innerHTML = \`
                                    <video controls autoplay muted loop poster="\${item.poster || ''}">
                                        <source src="\${item.src}" type="video/mp4">
                                        您的浏览器不支持视频播放。
                                    </video>
                                \`;
                                flowContainer.appendChild(wrapper);
                            } else {
                                el = document.createElement('img');
                                el.className = 'modal-media-item';
                                el.src = item.src;
                                el.loading = "lazy";
                                flowContainer.appendChild(el);
                            }
                            // 添加间距
                            const spacer = document.createElement('div');
                            spacer.className = 'modal-spacer';
                            flowContainer.appendChild(spacer);
                        });
                    } else {
                        // 回退显示 Cover
                        const el = document.createElement('img');
                        el.className = 'modal-media-item';
                        el.src = data.cover;
                        flowContainer.appendChild(el);
                    }

                    // 3. 渲染底部标签
                    const tagsContainer = document.getElementById('mTags');
                    tagsContainer.innerHTML = data.tags.map(t => \`<span class="footer-tag">#\${t}</span>\`).join('');

                    modal.classList.add('active');
                    document.body.style.overflow = 'hidden'; // 禁止背景滚动
                },

                closeModal: function() {
                    const modal = document.getElementById('detailModal');
                    modal.classList.remove('active');
                    document.body.style.overflow = '';
                    
                    // 停止所有视频播放
                    setTimeout(() => {
                        const videos = modal.querySelectorAll('video');
                        videos.forEach(v => v.pause());
                    }, 200);
                }
            };
        </script>
    </div>
    `;
}

function renderWorksGrid(works) {
    // 这里复用 HomeApp 里的逻辑生成初始 HTML，避免首屏空白
    // 为了简单，这里直接硬编码一个初始循环
    return works.map(w => {
        const dataStr = encodeURIComponent(JSON.stringify(w));
        const hasVideo = w.media && w.media.some(m => m.type === 'video');
        return `
        <div class="work-card" onclick="HomeApp.openModal('${dataStr}')">
            <div class="card-image-wrapper">
                <img class="card-image" src="${w.cover}" loading="lazy" alt="${w.title}">
                ${hasVideo ? '<div class="media-type-icon">▶</div>' : ''}
                <div class="card-tags-overlay">
                    ${w.tags.slice(0,3).map(t => `<span class="mini-tag">${t}</span>`).join('')}
                </div>
            </div>
            <div class="card-info">
                <div class="card-title">${w.title}</div>
                <div class="card-meta">
                    <span class="author-name">${w.author}</span>
                    <div class="stats-block">
                        <span>👍 ${w.likes}</span>
                        <span>👁 ${w.views}</span>
                    </div>
                </div>
            </div>
        </div>
        `;
    }).join('');
}

module.exports = {
    meta: {
        id: 'home',
        name: '首页',
    },
    routes: [
        {
            method: 'GET',
            path: '/',
            handler: (req, res) => {
                const content = renderHomePage();
                res.send(render({ 
                    title: '首页 - JackyRoom', 
                    content: content, 
                    currentModule: 'home',
                    extraHead: '<link rel="stylesheet" href="/modules/home/home.css">'
                }));
            }
        }
    ]
};