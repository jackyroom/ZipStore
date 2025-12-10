const path = require('path');
const { render } = require('../../core/layout-engine');
const db = require('../../core/db-access');

// 1. 配置信息
const HERO_DATA = {
    title: "数字艺术的无尽边疆",
    subtitle: "连接全球顶尖概念设计师、3D 艺术家与特效专家",
    bg: "https://images.unsplash.com/photo-1533134486753-c833f0ed4866?w=1600&q=80"
};

// 格式化数字
function formatNumber(num) {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
}

// 从数据库获取资源数据
async function getWorksData() {
    try {
        const resources = await db.query(`
            SELECT r.*, c.slug as category_slug, c.name as category_name, 
                   u.username as author, u.avatar as author_avatar,
                   a.file_path as cover_path
            FROM resources r
            LEFT JOIN categories c ON r.category_id = c.id
            LEFT JOIN users u ON r.author_id = u.id
            LEFT JOIN assets a ON r.cover_asset_id = a.id
            WHERE r.status = 'published'
            ORDER BY r.created_at DESC
            LIMIT 50
        `);

        // 转换为前端需要的格式
        const works = await Promise.all(resources.map(async (r) => {
            const attrs = r.attributes ? JSON.parse(r.attributes) : {};
            const tags = r.tags ? r.tags.split(',').map(t => t.trim()) : [];
            
            // 映射分类slug到type
            const typeMap = {
                'concept-art': 'concept',
                '3d-models': 'model',
                'level-design': 'env',
                'design-assets': 'concept',
                'game-resources': 'vfx'
            };
            const type = typeMap[r.category_slug] || r.category_slug || 'all';

            const work = {
                id: r.id,
                title: r.title,
                author: r.author || 'Unknown',
                avatar: r.author_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${r.author || 'User'}`,
                type: type,
                views: formatNumber(r.views || 0),
                likes: formatNumber(r.likes || 0),
                cover: r.cover_path || 'https://images.unsplash.com/photo-1533134486753-c833f0ed4866?w=600&q=80',
                desc: r.description || '',
                tags: tags
            };

            // 如果是3D模型，添加modelConfig并查找模型文件
            if (type === 'model' && attrs.format) {
                // 查找关联的模型文件（file_type为'model'的assets）
                const modelAssets = await db.query(`
                    SELECT file_path, original_name, size
                    FROM assets 
                    WHERE resource_id = ? AND file_type = 'model' AND is_cover = 0
                    ORDER BY created_at DESC
                    LIMIT 1
                `, [r.id]);
                
                // 如果没有找到模型文件，尝试查找所有非封面文件
                let modelPath = null;
                let modelFileSize = null;
                if (modelAssets.length > 0) {
                    modelPath = modelAssets[0].file_path;
                    modelFileSize = modelAssets[0].size;
                } else {
                    const allAssets = await db.query(`
                        SELECT file_path, original_name, file_type, size
                        FROM assets 
                        WHERE resource_id = ? AND is_cover = 0
                        ORDER BY created_at DESC
                    `, [r.id]);
                    // 查找模型格式的文件（通过扩展名判断）
                    const modelExts = ['.glb', '.gltf', '.fbx', '.obj', '.dae', '.3ds', '.blend', '.max', '.ma', '.mb', '.stl', '.ply'];
                    const modelAsset = allAssets.find(a => {
                        const ext = a.file_path ? a.file_path.toLowerCase().substring(a.file_path.lastIndexOf('.')) : '';
                        return modelExts.includes(ext);
                    });
                    if (modelAsset) {
                        modelPath = modelAsset.file_path;
                        modelFileSize = modelAsset.size;
                    }
                }
                
                // 格式化文件大小（如果从assets表获取）
                let formattedSize = 'N/A';
                if (modelFileSize) {
                    const bytes = modelFileSize;
                    if (bytes === 0) {
                        formattedSize = '0 B';
                    } else {
                        const k = 1024;
                        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
                        const i = Math.floor(Math.log(bytes) / Math.log(k));
                        formattedSize = Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
                    }
                }
                
                // 尝试多种可能的字段名
                const verticesValue = attrs.vertices || attrs.vertex_count || attrs.vertex || attrs.vertexCount || null;
                
                work.modelConfig = {
                    src: modelPath || (attrs.download_link || ''),
                    format: attrs.format || 'Unknown',
                    faces: attrs.poly_count || attrs.faces || 'N/A',
                    vertices: verticesValue || 'N/A',
                    fileSize: attrs.fileSize || attrs.size || formattedSize,
                    software: attrs.software || attrs.engine || 'Unknown'
                };
            }

            // 添加media数组
            work.media = [{ type: 'image', src: work.cover }];

            return work;
        }));
        
        return works;
    } catch (error) {
        console.error('获取资源数据失败:', error);
        return [];
    }
}

// 获取分类列表（从数据库读取首页模块的所有分类）
async function getCategories() {
    try {
        // 查询module_id为'home'的所有分类
        const categories = await db.query(`
            SELECT slug, name FROM categories 
            WHERE module_id = 'home'
            ORDER BY sort_order ASC
        `);
        
        // 映射分类slug到前端type（用于筛选）
        const categoryMap = {
            'concept-art': { id: 'concept', name: '概念原画' },
            '3d-models': { id: 'model', name: '3D模型' },
            'level-design': { id: 'env', name: '场景地编' }
        };

        const result = [{ id: 'all', name: '综合推荐' }];
        categories.forEach(cat => {
            const mapped = categoryMap[cat.slug];
            if (mapped) {
                result.push({ id: mapped.id, name: mapped.name });
            } else {
                // 如果没有映射，使用slug作为id，name作为显示名称
                result.push({ id: cat.slug, name: cat.name });
            }
        });
        
        return result;
    } catch (error) {
        console.error('获取分类失败:', error);
        return [
            { id: 'all', name: '综合推荐' },
            { id: 'concept', name: '概念原画' },
            { id: 'model', name: '3D模型' },
            { id: 'env', name: '场景地编' }
        ];
    }
}

// 2. 模拟作品库（保留作为fallback）
const WORKS_DATA_FALLBACK = [
    { 
        id: 1, 
        title: "赛博废墟: 侦察兵", 
        author: "Neo_Design", 
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Neo", 
        type: "concept", 
        views: "12.5k", 
        likes: "3.2k", 
        cover: "https://images.unsplash.com/photo-1563089145-599997674d42?w=600&q=80",
        media: [
            { type: 'image', src: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=1600&q=80' },
            { type: 'image', src: 'https://images.unsplash.com/photo-1542256844-64f70cc2884b?w=1600&q=80' },
        ],
        desc: "2077年边境废墟的侦察兵概念设计。",
        tags: ["Cyberpunk", "Sci-Fi"]
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
        modelConfig: {
            src: "https://modelviewer.dev/shared-assets/models/RobotExpressive.glb",
            format: "GLB",
            faces: "24,500",
            vertices: "12,400",
            fileSize: "15 MB",
            software: "Blender"
        },
        media: [
            { type: 'image', src: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=1600&q=80' },
        ],
        desc: "硬表面建模练习，高模烘焙到低模。",
        tags: ["3D", "Hard Surface", "Robot"]
    },
    { 
        id: 7, 
        title: "宇航员头盔", 
        author: "SpaceArt", 
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Astro", 
        type: "model", 
        views: "15k", 
        likes: "2.1k", 
        cover: "https://images.unsplash.com/photo-1541873676-a18131494184?w=600&q=80",
        modelConfig: {
            src: "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
            format: "GLB",
            faces: "45,200",
            vertices: "23,100",
            fileSize: "8 MB",
            software: "Maya"
        },
        media: [
            { type: 'image', src: 'https://images.unsplash.com/photo-1541873676-a18131494184?w=1600&q=80' }
        ],
        desc: "基于 NASA 参考图制作的写实头盔。",
        tags: ["Space", "Realistic", "Prop"]
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
            { type: 'video', src: 'https://media.w3.org/2010/05/sintel/trailer.mp4', poster: 'https://images.unsplash.com/photo-1511884642898-4c92249f20b6?w=1600&q=80' }
        ],
        desc: "UE5 实时渲染练习。",
        tags: ["Unreal Engine 5", "Landscape"]
    },
];

async function renderHomePage() {
    const WORKS_DATA = await getWorksData();
    const CATEGORIES = await getCategories();
    
    return `
    <div class="home-module-container">
        <script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.3.0/model-viewer.min.js"></script>

        <div class="home-hero">
            <img class="hero-bg" src="${HERO_DATA.bg}" alt="Hero Background">
            <div class="hero-content">
                <h1 class="hero-title">${HERO_DATA.title}</h1>
                <p class="hero-subtitle">${HERO_DATA.subtitle}</p>
                <button class="hero-cta" onclick="alert('注册功能开发中')">加入社区</button>
            </div>
        </div>

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

        <div class="works-grid" id="worksGrid">
            ${renderWorksGrid(WORKS_DATA)}
        </div>

        <div class="home-modal" id="detailModal">
            <button class="modal-close-btn" onclick="HomeApp.closeModal()">×</button>
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
            <div class="modal-content-flow" id="mContentFlow"></div>
            <div class="modal-info-bar" style="text-align:center; max-width:800px; margin:0 auto 40px;">
                <p class="modal-desc" id="mDesc" style="font-size:16px; color:#ccc; line-height:1.8;">Description</p>
            </div>
            <div class="modal-footer-tags" id="mTags"></div>
        </div>

        <div class="home-3d-modal" id="preview3DModal">
            <div class="viewer-top-bar">
                <div class="viewer-controls-left">
                    <div class="viewer-title" id="v3dTitle">Model Preview</div>
                    <div class="view-mode-group">
                        <button class="mode-btn active" onclick="HomeApp.toggleViewMode('render', this)">
                            <i class="fa-solid fa-cube"></i> 渲染
                        </button>
                        <button class="mode-btn" onclick="HomeApp.toggleViewMode('wireframe', this)">
                            <i class="fa-solid fa-border-none"></i> 线框
                        </button>
                        </div>
                </div>
                <button class="viewer-close-btn" onclick="HomeApp.close3DPreview()">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>

            <div id="modelViewerContainer"></div>

            <div class="model-stats-panel">
                <div class="stat-row">
                    <span class="stat-label">Format</span>
                    <span class="file-badge" id="v3dFormat">GLB</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Triangles</span>
                    <span class="stat-value" id="v3dFaces">0</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Vertices</span>
                    <span class="stat-value" id="v3dVertices">0</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">File Size</span>
                    <span class="stat-value" id="v3dSize">0 MB</span>
                </div>
            </div>
        </div>

        <script>
            const ALL_WORKS = ${JSON.stringify(WORKS_DATA || [])};

            const HomeApp = {
                // 缓存当前查看的 ID
                current3DId: null,

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
                    const hasVideo = w.media && w.media.some(m => m.type === 'video');
                    
                    let previewBtn = '';
                    if (w.type === 'model' && w.modelConfig) {
                        previewBtn = \`
                        <div class="card-3d-btn" 
                             title="3D 实时预览" 
                             onclick="event.stopPropagation(); HomeApp.open3DPreview('\${dataStr}')">
                            <i class="fa-solid fa-cube"></i>
                        </div>\`;
                    }
                    
                    return \`
                    <div class="work-card" onclick="HomeApp.openModal('\${dataStr}')">
                        <div class="card-image-wrapper">
                            <img class="card-image" src="\${w.cover}" loading="lazy" alt="\${w.title}">
                            \${hasVideo ? '<div class="media-type-icon">▶</div>' : ''}
                            \${previewBtn}
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
                    
                    document.getElementById('mTitle').innerText = data.title;
                    document.getElementById('mAuthor').innerText = data.author;
                    document.getElementById('mType').innerText = data.type.toUpperCase();
                    document.getElementById('mLikes').innerText = data.likes;
                    document.getElementById('mAvatar').src = data.avatar;
                    document.getElementById('mDesc').innerText = data.desc || "暂无描述";

                    const flowContainer = document.getElementById('mContentFlow');
                    flowContainer.innerHTML = ''; 

                    if (data.media && data.media.length > 0) {
                        data.media.forEach(item => {
                            let el;
                            if (item.type === 'video') {
                                const wrapper = document.createElement('div');
                                wrapper.className = 'modal-media-item video-wrapper';
                                wrapper.innerHTML = \`
                                    <video controls autoplay muted loop poster="\${item.poster || ''}">
                                        <source src="\${item.src}" type="video/mp4">
                                    </video>\`;
                                flowContainer.appendChild(wrapper);
                            } else {
                                el = document.createElement('img');
                                el.className = 'modal-media-item';
                                el.src = item.src;
                                el.loading = "lazy";
                                flowContainer.appendChild(el);
                            }
                            const spacer = document.createElement('div');
                            spacer.className = 'modal-spacer';
                            flowContainer.appendChild(spacer);
                        });
                    } else {
                        const el = document.createElement('img');
                        el.className = 'modal-media-item';
                        el.src = data.cover;
                        flowContainer.appendChild(el);
                    }

                    const tagsContainer = document.getElementById('mTags');
                    tagsContainer.innerHTML = data.tags.map(t => \`<span class="footer-tag">#\${t}</span>\`).join('');

                    modal.classList.add('active');
                    document.body.style.overflow = 'hidden';
                },

                closeModal: function() {
                    const modal = document.getElementById('detailModal');
                    modal.classList.remove('active');
                    document.body.style.overflow = '';
                    setTimeout(() => {
                        const videos = modal.querySelectorAll('video');
                        videos.forEach(v => v.pause());
                    }, 200);
                },

                // --- 3D 预览核心逻辑 (修复版) ---
                
                open3DPreview: function(dataStr) {
                    const data = JSON.parse(decodeURIComponent(dataStr));
                    if (!data.modelConfig) {
                        console.warn('3D预览：缺少modelConfig', data);
                        return;
                    }

                    const modal = document.getElementById('preview3DModal');
                    const container = document.getElementById('modelViewerContainer');
                    
                    // 1. 填充信息（确保所有值都有默认值）
                    const verticesValue = data.modelConfig.vertices;
                    
                    document.getElementById('v3dTitle').innerText = data.title || '未命名模型';
                    document.getElementById('v3dFormat').innerText = data.modelConfig.format || 'Unknown';
                    document.getElementById('v3dFaces').innerText = data.modelConfig.faces || data.modelConfig.poly_count || 'N/A';
                    
                    // 确保顶点数正确显示
                    const verticesDisplay = verticesValue && verticesValue !== 'N/A' && verticesValue !== 'null' && verticesValue !== 'undefined' 
                        ? String(verticesValue) 
                        : 'N/A';
                    document.getElementById('v3dVertices').innerText = verticesDisplay;
                    
                    document.getElementById('v3dSize').innerText = data.modelConfig.fileSize || data.modelConfig.size || 'N/A';

                    // 2. 关键修复：每次都重新生成 HTML，确保 WebGL 上下文全新
                    // 动态创建 model-viewer 标签
                    container.innerHTML = \`
                        <model-viewer 
                            id="activeModelViewer"
                            src="\${data.modelConfig.src}" 
                            poster="\${data.cover}"
                            camera-controls 
                            auto-rotate
                            shadow-intensity="1"
                            camera-orbit="45deg 55deg 2.5m" 
                            min-camera-orbit="auto auto auto" 
                            max-camera-orbit="auto auto auto"
                            loading="eager"
                            alt="3D Model">
                            <div slot="progress-bar" class="slot-progress-bar"></div>
                        </model-viewer>
                    \`;

                    // 重置按钮状态
                    this.resetModeButtons();

                    modal.classList.add('active');
                    document.body.style.overflow = 'hidden';
                },

                close3DPreview: function() {
                    const modal = document.getElementById('preview3DModal');
                    const container = document.getElementById('modelViewerContainer');
                    
                    modal.classList.remove('active');
                    document.body.style.overflow = '';
                    
                    // 关键修复：彻底清空容器，销毁 viewer 实例，防止内存泄漏和上下文丢失
                    setTimeout(() => {
                        container.innerHTML = '';
                    }, 300);
                },

                // --- 视图模式切换 (线框模式实现) ---
                toggleViewMode: function(mode, btn) {
                    const viewer = document.getElementById('activeModelViewer');
                    if (!viewer) return;

                    // 按钮样式更新
                    const group = btn.parentElement;
                    group.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');

                    // 获取 Three.js 场景对象的 Hack 方法 (model-viewer 标准 API)
                    const symbol = Object.getOwnPropertySymbols(viewer).find(s => s.description === 'model-viewer-scene');
                    if (!symbol) {
                        console.warn("Cannot access Three.js scene");
                        return;
                    }
                    
                    const scene = viewer[symbol].scene;

                    if (mode === 'wireframe') {
                        // 遍历场景中所有 Mesh 并开启线框
                        scene.traverse((node) => {
                            if (node.isMesh && node.material) {
                                // 缓存原始材质设置，方便还原 (简化版：直接修改)
                                if (!node.userData.originalMat) {
                                    node.userData.originalMat = { 
                                        wireframe: node.material.wireframe,
                                        // 可以在这里保存更多属性用于还原
                                    };
                                }
                                node.material.wireframe = true;
                            }
                        });
                    } else if (mode === 'render') {
                        // 还原渲染模式
                        scene.traverse((node) => {
                            if (node.isMesh && node.material) {
                                node.material.wireframe = false;
                            }
                        });
                    }
                    
                    // 触发重绘 (有些版本需要手动触发，改变 shadow-intensity 是个 hack 触发方式，或者直接调用 render)
                    // viewer[symbol].queueRender() 是内部方法，改变属性更安全
                    const currentShadow = viewer.getAttribute('shadow-intensity');
                    viewer.setAttribute('shadow-intensity', currentShadow === '1' ? '0.99' : '1');
                },
                
                resetModeButtons: function() {
                     const group = document.querySelector('.view-mode-group');
                     if(group) {
                         const btns = group.querySelectorAll('.mode-btn');
                         btns.forEach(b => b.classList.remove('active'));
                         if(btns[0]) btns[0].classList.add('active');
                     }
                }
            };
        </script>
    </div>
    `;
}

// 辅助函数：SSR 生成网格（与 HomeApp.getCardHtml 保持一致以避免闪烁）
function renderWorksGrid(works) {
    return works.map(w => {
        const dataStr = encodeURIComponent(JSON.stringify(w));
        const hasVideo = w.media && w.media.some(m => m.type === 'video');
        
        let previewBtn = '';
        if (w.type === 'model' && w.modelConfig) {
            previewBtn = `
            <div class="card-3d-btn" 
                 title="3D 实时预览" 
                 onclick="event.stopPropagation(); HomeApp.open3DPreview('${dataStr}')">
                <i class="fa-solid fa-cube"></i>
            </div>`;
        }

        return `
        <div class="work-card" onclick="HomeApp.openModal('${dataStr}')">
            <div class="card-image-wrapper">
                <img class="card-image" src="${w.cover}" loading="lazy" alt="${w.title}">
                ${hasVideo ? '<div class="media-type-icon">▶</div>' : ''}
                ${previewBtn}
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
            handler: async (req, res) => {
                // 更新浏览量（异步，不阻塞响应）
                const content = await renderHomePage();
                res.send(render({ 
                    title: '首页 - JackyRoom', 
                    content: content, 
                    currentModule: 'home',
                    extraHead: '<link rel="stylesheet" href="/modules/home/home.css">'
                }));
            }
        },
        {
            method: 'GET',
            path: '/view/:id',
            handler: async (req, res) => {
                const resourceId = req.params.id;
                
                // 更新浏览量
                await db.run("UPDATE resources SET views = views + 1 WHERE id = ?", [resourceId]);
                
                const resource = await db.get(`
                    SELECT r.*, c.name as category_name, c.slug as category_slug,
                           u.username as author, u.avatar as author_avatar,
                           a.file_path as cover_path
                    FROM resources r
                    LEFT JOIN categories c ON r.category_id = c.id
                    LEFT JOIN users u ON r.author_id = u.id
                    LEFT JOIN assets a ON r.cover_asset_id = a.id
                    WHERE r.id = ? AND r.status = 'published'
                `, [resourceId]);

                if (!resource) {
                    return res.status(404).send('资源不存在');
                }

                const attrs = resource.attributes ? JSON.parse(resource.attributes) : {};
                const tags = resource.tags ? resource.tags.split(',').map(t => t.trim()) : [];

                const content = `
                    <link rel="stylesheet" href="/modules/home/home.css">
                    <div class="glass-card" style="max-width: 1200px; margin: 0 auto;">
                        <div style="margin-bottom: 20px;">
                            <a href="/" style="color: var(--text-muted); text-decoration: none;">
                                <i class="fa-solid fa-arrow-left"></i> 返回首页
                            </a>
                        </div>
                        <h1 style="margin-bottom: 10px;">${resource.title}</h1>
                        <div style="color: var(--text-muted); margin-bottom: 20px;">
                            作者: ${resource.author || 'Unknown'} • 
                            分类: ${resource.category_name || '未分类'} • 
                            浏览: ${resource.views || 0} • 
                            点赞: ${resource.likes || 0}
                        </div>
                        ${resource.cover_path ? `<img src="${resource.cover_path}" style="width:100%; border-radius:12px; margin-bottom:20px;">` : ''}
                        ${resource.description ? `<p style="line-height:1.8; margin-bottom:20px;">${resource.description}</p>` : ''}
                        ${resource.content_body ? `<div style="line-height:1.8; margin-bottom:20px;">${resource.content_body}</div>` : ''}
                        ${tags.length > 0 ? `<div style="margin-top:20px;">
                            ${tags.map(t => `<span style="display:inline-block; padding:4px 12px; background:var(--primary-15); color:var(--primary); border-radius:4px; margin-right:8px; margin-bottom:8px;">#${t}</span>`).join('')}
                        </div>` : ''}
                    </div>
                `;
                res.send(render({ 
                    title: resource.title + ' - JackyRoom', 
                    content: content, 
                    currentModule: 'home'
                }));
            }
        }
    ]
};