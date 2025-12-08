const path = require('path');
const { render } = require('../../core/layout-engine');

/**
 * 模拟的图库数据 - 后续可以替换为 sqlite 查询
 * 包含不同尺寸的图片以演示瀑布流效果
 */
const MOCK_DATA = [
    { id: 101, title: "赛博霓虹", author: "NeoArtist", views: "2.3k", likes: "842", tags: ["Cyberpunk", "City", "Night"], src: "https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800&q=80" },
    { id: 102, title: "迷雾山脉", author: "NatureLens", views: "1.1k", likes: "320", tags: ["Nature", "Landscape"], src: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80" },
    { id: 103, title: "极简几何", author: "ShapeMaster", views: "890", likes: "150", tags: ["Abstract", "3D", "Minimal"], src: "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=800&q=80" },
    { id: 104, title: "未来机甲", author: "MechFan", views: "3.4k", likes: "1.2k", tags: ["Sci-Fi", "Concept Art"], src: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&q=80" },
    { id: 105, title: "静谧工位", author: "CodeVibe", views: "4.5k", likes: "2.1k", tags: ["Workspace", "Tech"], src: "https://images.unsplash.com/photo-1493723843684-a63e689df6ae?w=800&q=80" },
    { id: 106, title: "深空探索", author: "SpaceX", views: "9k", likes: "5.6k", tags: ["Space", "Star"], src: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80" },
    { id: 107, title: "复古胶片", author: "RetroCam", views: "1.2k", likes: "410", tags: ["Film", "Street"], src: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80" },
    { id: 108, title: "抽象流体", author: "FluidArt", views: "560", likes: "98", tags: ["Art", "Colorful"], src: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&q=80" },
    { id: 109, title: "孤独宇航员", author: "AstroBoy", views: "2.8k", likes: "900", tags: ["Digital Art"], src: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800&q=80" },
    { id: 110, title: "午夜东京", author: "CityWalker", views: "3.1k", likes: "1.5k", tags: ["Japan", "Night"], src: "https://images.unsplash.com/photo-1503899036084-c55cdd92a3a8?w=800&q=80" },
];

// 模拟标签
const CATEGORIES = ["推荐", "热门", "插画", "3D建模", "摄影", "UI设计", "游戏原画", "动漫", "赛博朋克", "极简"];

// 辅助函数：渲染页面HTML
function renderGalleryPage() {
    return `
    <!-- 所有的类名都限定在 .gallery-module-container 内 -->
    <div class="gallery-module-container">
        
        <!-- 顶部搜索和过滤区 -->
        <div class="gallery-header">
            <div class="search-toolbar">
                <div class="module-search-box gallery-search">
                    <i class="fa-solid fa-magnifying-glass search-icon"></i>
                    <input type="text" class="search-input" placeholder="搜索灵感、标签、艺术家...">
                    <button class="search-btn">搜索</button>
                </div>
                
                <div class="module-sort-box gallery-sort">
                    <i class="fa-solid fa-arrow-down-short-wide sort-icon"></i>
                    <select class="sort-select">
                        <option>综合排序</option>
                        <option>最多浏览</option>
                        <option>最多喜欢</option>
                    </select>
                    <i class="fa-solid fa-chevron-down arrow-icon"></i>
                </div>
            </div>
            
            <div class="tags-nav">
                ${CATEGORIES.map((tag, idx) =>
        `<div class="tag-pill ${idx === 0 ? 'active' : ''}">${tag}</div>`
    ).join('')}
            </div>
        </div>

        <!-- 瀑布流展示区 -->
        <div class="masonry-grid" id="galleryGrid">
            ${MOCK_DATA.map(item => renderCard(item)).join('')}
            <!-- 初始多渲染一些以填满屏幕 -->
            ${MOCK_DATA.sort(() => 0.5 - Math.random()).map(item => renderCard(item)).join('')}
        </div>

        <!-- 详情灯箱 (Lightbox) -->
        <div class="gallery-lightbox" id="galleryLightbox">
            <button class="gallery-lightbox-close" onclick="GalleryApp.closeLightbox()">×</button>
            
            <div class="gallery-lightbox-container">
                <!-- 左侧：图片展示区 -->
                <div class="gallery-lightbox-media">
                    <img id="lbImage" src="" alt="">
                </div>
                
                <!-- 右侧：详情信息区 -->
                <div class="gallery-lightbox-details">
                    <div class="details-scroll-area">
                        <div class="details-header">
                            <h2 id="lbTitle" class="lb-title">Title</h2>
                            <div class="lb-author-block">
                                <div class="lb-author-avatar"></div>
                                <div class="lb-author-info">
                                    <h4 id="lbAuthor">Author Name</h4>
                                    <span>关注作者</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="lb-actions">
                            <button class="lb-btn primary">
                                <span>❤</span> 收藏
                            </button>
                            <button class="lb-btn secondary">
                                <span>⬇</span> 下载
                            </button>
                        </div>
                        
                        <div class="lb-stats">
                            <div class="stat-item">
                                <span class="stat-value" id="lbViews">0</span>
                                <span class="stat-label">浏览</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-value" id="lbLikes">0</span>
                                <span class="stat-label">喜欢</span>
                            </div>
                        </div>

                        <div>
                            <div class="lb-tags-title">相关标签</div>
                            <div class="lb-tags-container" id="lbTags">
                                <!-- Tags injected here -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 模块脚本 -->
        <script>
            const GalleryApp = {
                // 打开灯箱
                openLightbox: function(dataStr) {
                    const data = JSON.parse(decodeURIComponent(dataStr));
                    const lb = document.getElementById('galleryLightbox');
                    
                    document.getElementById('lbImage').src = data.src;
                    document.getElementById('lbTitle').innerText = data.title;
                    document.getElementById('lbAuthor').innerText = data.author;
                    document.getElementById('lbViews').innerText = data.views;
                    document.getElementById('lbLikes').innerText = data.likes || '0';
                    
                    // 渲染标签
                    const tagsHtml = (data.tags || []).map(t => '<span class=\"detail-tag\">#'+t+'</span>').join('');
                    document.getElementById('lbTags').innerHTML = tagsHtml;

                    lb.classList.add('active');
                    document.body.style.overflow = 'hidden'; // 禁止背景滚动
                },

                // 关闭灯箱
                closeLightbox: function() {
                    const lb = document.getElementById('galleryLightbox');
                    lb.classList.remove('active');
                    document.body.style.overflow = '';
                    
                    // 清空图片源防止闪烁
                    setTimeout(() => {
                        document.getElementById('lbImage').src = '';
                    }, 300);
                },

                // 标签切换
                selectTag: function(el) {
                    document.querySelectorAll('.tag-pill').forEach(p => p.classList.remove('active'));
                    el.classList.add('active');
                    // 这里可以添加真实的 AJAX 筛选逻辑
                    console.log('Filter by:', el.innerText);
                }
            };

            // 绑定灯箱点击背景关闭
            document.getElementById('galleryLightbox').addEventListener('click', function(e) {
                if (e.target === this || e.target.classList.contains('gallery-lightbox-media')) {
                    GalleryApp.closeLightbox();
                }
            });

            // 绑定标签点击
            document.querySelectorAll('.tag-pill').forEach(pill => {
                pill.addEventListener('click', function() { GalleryApp.selectTag(this); });
            });
        </script>
    </div>
    `;
}

// 辅助函数：渲染单张卡片
function renderCard(item) {
    // 将对象序列化以便传递给 onclick
    const dataStr = encodeURIComponent(JSON.stringify(item));

    return `
    <div class="pin-card" onclick="GalleryApp.openLightbox('${dataStr}')">
        <div class="pin-top-actions">
            <button class="action-btn save-btn">收藏</button>
            <button class="action-btn">🔗</button>
        </div>
        
        <img class="pin-image" src="${item.src}" loading="lazy" alt="${item.title}">
        
        <div class="pin-overlay">
            <div class="pin-info">
                <div class="pin-title">${item.title}</div>
                <div class="pin-author">
                    <div class="author-img"></div>
                    <span>${item.author}</span>
                </div>
            </div>
        </div>
    </div>
    `;
}

module.exports = {
    meta: {
        id: 'gallery',
        name: '光影画廊',
    },
    routes: [
        // 1. 页面路由
        {
            method: 'GET',
            path: '/',
            handler: (req, res) => {
                const content = renderGalleryPage();
                res.send(render({
                    title: '光影画廊',
                    content: content,
                    currentModule: 'gallery',
                    extraHead: '<link rel="stylesheet" href="/modules/gallery/gallery.css">'
                }));
            }
        },
        // 2. API 路由 (用于无限加载)
        {
            method: 'GET',
            path: '/feed',
            handler: (req, res) => {
                // 简单打乱数组来模拟新数据
                const shuffled = MOCK_DATA.sort(() => 0.5 - Math.random());
                res.json(shuffled.slice(0, 6));
            }
        }
    ]
};
