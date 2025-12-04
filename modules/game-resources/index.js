const { render } = require('../../core/layout-engine');

// 1. 模拟游戏资源数据
const GAMES_DATA = [
    {
        id: 101,
        title: "艾尔登法环 (Elden Ring)",
        cover: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&q=80", 
        bg: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&q=80",
        genre: "动作RPG",
        platform: "PC / PS5 / Xbox",
        size: "48.5 GB",
        date: "2022-02-25",
        rating: 9.5,
        desc: "《艾尔登法环》是一款黑暗幻想风格的动作角色扮演游戏。走进辽阔的场景与地下迷宫探索未知，挑战困难重重的险境，享受克服困境时的成就感吧。",
        video: "https://www.w3schools.com/html/mov_bbb.mp4", 
        screenshots: [
            "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400&q=80",
            "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=400&q=80",
            "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400&q=80"
        ],
        requirements: {
            min: "i5-8400 / GTX 1060 3GB / 12GB RAM",
            rec: "i7-8700K / GTX 1070 8GB / 16GB RAM"
        },
        downloads: [
            { name: "v1.10 官方中文版 [夸克网盘]", link: "#" },
            { name: "v1.08 豪华版+修改器 [百度云]", link: "#" }
        ]
    },
    {
        id: 102,
        title: "赛博朋克 2077: 往日之影",
        cover: "https://images.unsplash.com/photo-1592155931584-901ac15763e3?w=600&q=80",
        bg: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=1200&q=80",
        genre: "射击/RPG",
        platform: "PC / Console",
        size: "70 GB",
        date: "2023-09-26",
        rating: 9.0,
        desc: "《往日之影》是《赛博朋克 2077》的全新谍战悬疑风格资料片。化身赛博朋克雇佣兵 V，深入狗镇，去执行营救新美国总统的高危任务。",
        video: "", 
        screenshots: [
            "https://images.unsplash.com/photo-1626379953822-baec19c3accd?w=400&q=80"
        ],
        requirements: {
            min: "i7-6700 / GTX 1060 6GB / 12GB RAM",
            rec: "i7-12700 / RTX 3060 / 16GB RAM"
        },
        downloads: [
            { name: "v2.1 全DLC整合版", link: "#" }
        ]
    },
    {
        id: 103,
        title: "星露谷物语 (Stardew Valley)",
        cover: "https://images.unsplash.com/photo-1592597028657-46a7980b7e63?w=600&q=80",
        bg: "https://images.unsplash.com/photo-1464254786740-b97e5420c299?w=1200&q=80",
        genre: "模拟经营",
        platform: "PC / Mobile",
        size: "500 MB",
        date: "2016-02-26",
        rating: 9.8,
        desc: "你继承了爷爷在星露谷的旧农场。带着一些旧工具和几枚硬币，你开始了新生活。你能学会靠土地生活，把这片杂草丛生的田地变成一个繁荣的家园吗？",
        video: "",
        screenshots: [],
        requirements: {
            min: "2 Ghz / 256 MB Video Memory / 2 GB RAM",
            rec: "任意主流配置"
        },
        downloads: [
            { name: "v1.6.3 汉化版", link: "#" },
            { name: "MOD整合包 (美化+功能)", link: "#" }
        ]
    },
    {
        id: 104,
        title: "空洞骑士 (Hollow Knight)",
        cover: "https://images.unsplash.com/photo-1542751110-97427bbecf20?w=600&q=80",
        bg: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&q=80",
        genre: "动作冒险",
        platform: "PC / Switch",
        size: "9 GB",
        date: "2017-02-24",
        rating: 9.6,
        desc: "在《空洞骑士》中打造属于自己的冒险之旅！穿越一个庞大却废弃的属于昆虫与英雄的王国，开启史诗般的冒险。",
        video: "",
        screenshots: [],
        requirements: {
            min: "Intel Core 2 Duo E5200 / GeForce 9800GTX+ / 4GB RAM",
            rec: "Intel Core i5 / GeForce GTX 560 / 8GB RAM"
        },
        downloads: [
            { name: "丝之歌 (Coming Soon)", link: "#" },
            { name: "v1.5.78 最终版", link: "#" }
        ]
    },
    {
        id: 105,
        title: "文明 VI (Civilization VI)",
        cover: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&q=80",
        bg: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&q=80",
        genre: "策略",
        platform: "PC",
        size: "12 GB",
        date: "2016-10-21",
        rating: 8.8,
        desc: "建立起一个帝国，并接受时间的考验。玩家将创建及带领自己的文明从石器时代迈向信息时代，并成为世界的领导者。",
        requirements: {
            min: "i3 2.5 Ghz / AMD 5570 / 4GB RAM",
            rec: "i5 2.5 Ghz / GTX 770 / 8GB RAM"
        },
        downloads: [
            { name: "典藏版全DLC整合", link: "#" }
        ]
    }
];

function renderGamePage() {
    return `
    <div class="game-res-container">
        <!-- 工具栏 -->
        <div class="game-toolbar">
            <div class="game-filter-bar">
                <div class="game-nav-item active" data-cat="all">全部游戏</div>
                <div class="game-nav-item" data-cat="动作RPG">动作 RPG</div>
                <div class="game-nav-item" data-cat="射击">射击 FPS</div>
                <div class="game-nav-item" data-cat="策略">策略 SLG</div>
                <div class="game-nav-item" data-cat="模拟经营">模拟经营</div>
            </div>
            
            <!-- 右侧：搜索与排序 -->
            <div class="game-search-group">
                <div class="game-search-box">
                    <i class="fa-solid fa-gamepad"></i>
                    <input type="text" placeholder="搜索游戏..." onkeyup="GameResApp.search(this.value)">
                </div>
                <select class="game-sort-select" onchange="GameResApp.sort(this.value)">
                    <option value="default">默认排序</option>
                    <option value="newest">最新发布</option>
                    <option value="rating">评分最高</option>
                    <option value="size">大小排序</option>
                </select>
            </div>
        </div>

        <!-- 游戏网格 -->
        <div class="game-grid" id="gameGrid">
            ${renderGameCards(GAMES_DATA)}
        </div>

        <!-- 详情模态框 -->
        <div class="game-modal-overlay" id="gameDetailModal">
            <div class="game-modal">
                <button class="modal-close-btn" onclick="GameResApp.closeModal()"><i class="fa-solid fa-xmark"></i></button>
                
                <!-- 头部背景与媒体 (去除功能按钮，仅作背景展示) -->
                <div class="game-modal-media" id="gmBg">
                    <div class="media-overlay-gradient"></div>
                </div>

                <!-- 内容区 -->
                <div class="game-modal-content">
                    <div class="game-info-header">
                        <div class="game-poster-wrap">
                            <img id="gmCover" src="" alt="Cover">
                        </div>
                        <div class="game-title-block">
                            <div class="game-tags" id="gmTags">
                                <span class="g-tag">RPG</span>
                            </div>
                            <h1 id="gmTitle">Elden Ring</h1>
                            <div class="game-meta-row">
                                <span><i class="fa-solid fa-calendar-days"></i> <span id="gmDate">2022</span></span>
                                <span><i class="fa-solid fa-desktop"></i> <span id="gmPlatform">PC</span></span>
                                <span><i class="fa-solid fa-hard-drive"></i> <span id="gmSize">50GB</span></span>
                                <span class="rating-score"><i class="fa-solid fa-star"></i> <span id="gmRating">9.5</span></span>
                            </div>
                        </div>
                        <div class="game-action-block">
                            <button class="btn-download-main" onclick="GameResApp.scrollToDl()">
                                <i class="fa-solid fa-download"></i> 立即下载
                            </button>
                        </div>
                    </div>

                    <div class="game-details-grid">
                        <div class="detail-left">
                            <div class="detail-section">
                                <h3>🎮 游戏介绍</h3>
                                <p id="gmDesc">Description...</p>
                            </div>
                            <div class="detail-section">
                                <h3>⚙️ 配置需求</h3>
                                <div class="req-box">
                                    <div class="req-row">
                                        <span class="req-label">最低配置:</span>
                                        <span class="req-val" id="gmReqMin">...</span>
                                    </div>
                                    <div class="req-row">
                                        <span class="req-label">推荐配置:</span>
                                        <span class="req-val" id="gmReqRec">...</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="detail-right">
                             <div class="dl-panel" id="dlPanel">
                                <h3>📥 下载资源</h3>
                                <div class="dl-list" id="gmDownloads">
                                    <!-- JS填充 -->
                                </div>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <script>
            const GAME_DB = ${JSON.stringify(GAMES_DATA)};
            
            const GameResApp = {
                currentData: [...GAME_DB], // 保存当前筛选后的数据以便排序

                init: function() {
                    // 分类切换
                    document.querySelectorAll('.game-nav-item').forEach(btn => {
                        btn.addEventListener('click', () => {
                            document.querySelectorAll('.game-nav-item').forEach(b => b.classList.remove('active'));
                            btn.classList.add('active');
                            const cat = btn.getAttribute('data-cat');
                            this.filter(cat);
                        });
                    });

                    // 遮罩关闭
                    document.getElementById('gameDetailModal').addEventListener('click', (e) => {
                        if(e.target.id === 'gameDetailModal') this.closeModal();
                    });
                },

                filter: function(category) {
                    if (category === 'all') {
                        this.currentData = [...GAME_DB];
                    } else {
                        this.currentData = GAME_DB.filter(g => g.genre.includes(category) || category.includes(g.genre));
                    }
                    this.renderGrid(this.currentData);
                },

                search: function(val) {
                    const items = GAME_DB.filter(g => g.title.toLowerCase().includes(val.toLowerCase()));
                    this.currentData = items;
                    this.renderGrid(items);
                },

                sort: function(type) {
                    let sorted = [...this.currentData];
                    if (type === 'newest') {
                        sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
                    } else if (type === 'rating') {
                        sorted.sort((a, b) => b.rating - a.rating);
                    } else if (type === 'size') {
                        // 简单的大小比较逻辑，实际应用需统一单位
                        sorted.sort((a, b) => parseFloat(b.size) - parseFloat(a.size));
                    } else {
                        sorted = [...this.currentData]; // default
                    }
                    this.renderGrid(sorted);
                },

                renderGrid: function(items) {
                    const grid = document.getElementById('gameGrid');
                    grid.innerHTML = items.length ? items.map(this.renderCard).join('') : '<div class="empty-tip">暂无此类游戏</div>';
                },

                renderCard: function(game) {
                    // 使用 bg (横图) 优先，如果没有则回退到 cover
                    const posterImg = game.bg || game.cover;
                    return \`
                    <div class="game-card" onclick="GameResApp.openModal(\${game.id})">
                        <div class="card-poster">
                            <img src="\${posterImg}" loading="lazy">
                            <div class="card-hover-overlay">
                                <i class="fa-solid fa-eye"></i>
                            </div>
                        </div>
                        <div class="card-content">
                            <div class="card-tags">
                                <span class="c-tag">\${game.genre.split('/')[0]}</span>
                            </div>
                            <h3 class="card-title">\${game.title}</h3>
                            <div class="card-bottom">
                                <span class="c-size">\${game.size}</span>
                                <span class="c-rating">★ \${game.rating}</span>
                            </div>
                        </div>
                    </div>
                    \`;
                },

                openModal: function(id) {
                    const game = GAME_DB.find(g => g.id == id);
                    if(!game) return;

                    // 填充数据
                    const bgUrl = game.bg || game.cover;
                    document.getElementById('gmBg').style.backgroundImage = \`url('\${bgUrl}')\`;
                    document.getElementById('gmCover').src = game.cover;
                    document.getElementById('gmTitle').innerText = game.title;
                    document.getElementById('gmTags').innerHTML = \`<span class="g-tag">\${game.genre}</span>\`;
                    
                    document.getElementById('gmDate').innerText = game.date;
                    document.getElementById('gmPlatform').innerText = game.platform;
                    document.getElementById('gmSize').innerText = game.size;
                    document.getElementById('gmRating').innerText = game.rating;
                    document.getElementById('gmDesc').innerText = game.desc;
                    
                    // 配置
                    if(game.requirements) {
                        document.getElementById('gmReqMin').innerText = game.requirements.min || '未知';
                        document.getElementById('gmReqRec').innerText = game.requirements.rec || '未知';
                    }

                    // 下载链接
                    const dlHtml = game.downloads.map(d => \`
                        <div class="dl-item">
                            <div class="dl-name">\${d.name}</div>
                            <a href="\${d.link}" class="btn-dl-link" onclick="alert('打开下载链接')">下载</a>
                        </div>
                    \`).join('');
                    document.getElementById('gmDownloads').innerHTML = dlHtml || '<div class="dl-item">暂无资源</div>';

                    // 移除了 screenshots 的渲染

                    document.getElementById('gameDetailModal').classList.add('active');
                },

                closeModal: function() {
                    document.getElementById('gameDetailModal').classList.remove('active');
                },

                scrollToDl: function() {
                    document.getElementById('dlPanel').scrollIntoView({behavior: 'smooth'});
                }
            };

            GameResApp.init();
        </script>
    </div>
    `;
}

function renderGameCards(items) {
    return items.map(game => {
        // 默认横向预览图
        const posterImg = game.bg || game.cover;
        return `
        <div class="game-card" onclick="GameResApp.openModal(${game.id})">
            <div class="card-poster">
                <img src="${posterImg}" loading="lazy">
                <div class="card-hover-overlay">
                    <i class="fa-solid fa-eye"></i>
                </div>
            </div>
            <div class="card-content">
                <div class="card-tags">
                    <span class="c-tag">${game.genre.split('/')[0]}</span>
                </div>
                <h3 class="card-title">${game.title}</h3>
                <div class="card-bottom">
                    <span class="c-size">${game.size}</span>
                    <span class="c-rating">★ ${game.rating}</span>
                </div>
            </div>
        </div>
    `}).join('');
}

module.exports = {
    meta: {
        id: 'game-resources',
        name: '游戏资源',
        icon: 'gamepad'
    },
    routes: [
        {
            method: 'GET',
            path: '/',
            handler: (req, res) => {
                res.send(render({ 
                    title: '游戏资源 - JackyRoom', 
                    content: renderGamePage(), 
                    currentModule: 'game-resources',
                    extraHead: '<link rel="stylesheet" href="/modules/game-resources/game-resources.css">'
                }));
            }
        }
    ]
};