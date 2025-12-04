const { render } = require('../../core/layout-engine');

// 1. 模拟当前登录用户
const CURRENT_USER = {
    id: 'u_jacky',
    name: 'Jacky',
    avatar: '/favicon.ico', 
    bio: 'Full Stack Developer | 摄影爱好者 | 探索无限可能',
    cover: 'https://images.unsplash.com/photo-1477346611705-65d1883cee1e?w=1600&q=80', // 更宽的封面图
    stats: {
        following: 124,
        followers: 856,
        posts: 42
    }
};

// 2. 模拟动态数据 (保持不变，略)
const MOMENTS_DATA = [
    {
        id: 1,
        author: { id: 'u_jacky', name: 'Jacky', avatar: '/favicon.ico' },
        time: '10分钟前',
        content: '终于完成了 ZipStore 2.0 的核心架构设计！微内核 + 模块化加载，性能提升显著。🚀 #开发日常 #全栈',
        media: [
            { type: 'image', url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80' },
            { type: 'image', url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80' }
        ],
        type: 'post',
        status: 'published',
        visibility: 'public',
        likes: 12,
        comments: 3
    },
    {
        id: 2,
        author: { id: 'u_alice', name: 'Alice_Design', avatar: 'https://ui-avatars.com/api/?name=Alice&background=random' },
        time: '2小时前',
        content: '分享一组昨晚拍的赛博朋克风格夜景。霓虹灯下的城市总是充满了故事。🌃',
        media: [
            { type: 'image', url: 'https://images.unsplash.com/photo-1565626424178-c699f6609022?w=600&q=80' },
            { type: 'image', url: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=600&q=80' },
            { type: 'image', url: 'https://images.unsplash.com/photo-1534234828563-0dd4c34345df?w=600&q=80' },
            { type: 'image', url: 'https://images.unsplash.com/photo-1560420025-9b6c58527d71?w=600&q=80' }
        ],
        type: 'post',
        status: 'published',
        visibility: 'public',
        likes: 45,
        comments: 8
    },
    {
        id: 3,
        author: { id: 'u_bob', name: 'Bob_Gamer', avatar: 'https://ui-avatars.com/api/?name=Bob&background=random' },
        time: '5小时前',
        content: '这个游戏的操作手感太棒了，推荐给大家！👇',
        media: [
            { type: 'video', url: 'https://www.w3schools.com/html/mov_bbb.mp4', poster: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&q=80' }
        ],
        link: {
            title: 'Hollow Knight - Steam Store',
            desc: 'Forging your own path in Hollow Knight! An epic action adventure through a vast ruined kingdom.',
            url: 'https://store.steampowered.com',
            icon: 'fa-brands fa-steam'
        },
        type: 'post',
        status: 'published',
        visibility: 'public',
        likes: 8,
        comments: 1
    },
    {
        id: 4,
        author: { id: 'u_jacky', name: 'Jacky', avatar: '/favicon.ico' },
        time: '昨天',
        content: '[草稿] 2024年度总结计划...',
        media: [],
        type: 'post',
        status: 'draft', 
        visibility: 'private',
        likes: 0,
        comments: 0
    }
];

const TOPICS = ['#开发日常', '#赛博朋克', '#独立游戏', '#摄影', '#阅读打卡'];

function renderMomentsPage() {
    return `
    <div class="moments-module-container">
        
        <!-- 1. 顶部全宽封面 (Header Cover) -->
        <div class="moments-header-cover">
            <div class="cover-bg" style="background-image: url('${CURRENT_USER.cover}')"></div>
            <div class="cover-overlay"></div>
            
            <div class="cover-user-container">
                <div class="cover-avatar-wrap">
                    <img src="${CURRENT_USER.avatar}" class="cover-avatar">
                    <div class="avatar-status"></div>
                </div>
                <div class="cover-info">
                    <div class="ci-top">
                        <h1 class="cover-name">${CURRENT_USER.name}</h1>
                        <span class="cover-id">@${CURRENT_USER.id}</span>
                    </div>
                    <p class="cover-bio">${CURRENT_USER.bio}</p>
                    <div class="cover-stats">
                        <div class="cs-item"><strong>${CURRENT_USER.stats.following}</strong> 关注</div>
                        <div class="cs-item"><strong>${CURRENT_USER.stats.followers}</strong> 粉丝</div>
                        <div class="cs-item"><strong>${CURRENT_USER.stats.posts}</strong> 动态</div>
                    </div>
                </div>
                <button class="edit-profile-btn">
                    <i class="fa-solid fa-pen-to-square"></i> 编辑资料
                </button>
            </div>
        </div>

        <!-- 2. 下方内容布局 -->
        <div class="moments-layout">
            
            <!-- 左侧：动态流 (占据主要空间) -->
            <main class="moments-main-col">
                
                <!-- 发布器 -->
                <div class="composer-card glass-panel">
                    <div class="composer-inner">
                        <textarea id="postContent" placeholder="分享你的新鲜事... (支持Markdown语法)"></textarea>
                        <div class="composer-preview-area" id="mediaPreview"></div>
                        <div class="composer-bottom">
                            <div class="tool-group">
                                <button class="tool-btn" title="图片" onclick="MomentsApp.addMedia('image')"><i class="fa-regular fa-image"></i></button>
                                <button class="tool-btn" title="视频" onclick="MomentsApp.addMedia('video')"><i class="fa-solid fa-film"></i></button>
                                <button class="tool-btn" title="话题" onclick="MomentsApp.addTopic()"><i class="fa-solid fa-hashtag"></i></button>
                                <button class="tool-btn" title="表情" onclick="alert('表情')"><i class="fa-regular fa-face-smile"></i></button>
                            </div>
                            <div class="action-group">
                                <select id="postVisibility" class="visibility-select">
                                    <option value="public">🌏 公开</option>
                                    <option value="private">🔒 私密</option>
                                </select>
                                <button class="btn-send" onclick="MomentsApp.publish()">发布</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 动态筛选头 -->
                <div class="feed-filter-header">
                    <div class="ff-left">
                        <span class="active">全部</span>
                        <span>原创</span>
                        <span>媒体</span>
                    </div>
                    <div class="ff-right">
                        <i class="fa-solid fa-magnifying-glass"></i>
                    </div>
                </div>

                <!-- 动态列表 -->
                <div class="feed-stream" id="feedStream">
                    <!-- JS 渲染 -->
                </div>
                
                <div class="feed-loading">
                    <span>已经到底啦</span>
                </div>
            </main>

            <!-- 右侧：功能导航与推荐 (Sidebar) -->
            <aside class="moments-right-col">
                
                <!-- 核心导航 (整合了原来的用户信息卡片功能) -->
                <nav class="sidebar-nav glass-panel">
                    <div class="sn-title">浏览频道</div>
                    <div class="sn-item active" onclick="MomentsApp.switchTab('square', this)">
                        <span class="sn-icon clr-blue"><i class="fa-solid fa-compass"></i></span>
                        <span class="sn-text">广场动态</span>
                    </div>
                    <div class="sn-item" onclick="MomentsApp.switchTab('following', this)">
                        <span class="sn-icon clr-pink"><i class="fa-solid fa-heart"></i></span>
                        <span class="sn-text">我的关注</span>
                    </div>
                    <div class="sn-item" onclick="MomentsApp.switchTab('mine', this)">
                        <span class="sn-icon clr-green"><i class="fa-solid fa-user"></i></span>
                        <span class="sn-text">个人空间</span>
                    </div>
                    <div class="sn-item" onclick="MomentsApp.switchTab('drafts', this)">
                        <span class="sn-icon clr-gray"><i class="fa-solid fa-layer-group"></i></span>
                        <span class="sn-text">草稿箱</span>
                        <span class="sn-badge" id="draftCount">0</span>
                    </div>
                </nav>

                <!-- 话题推荐 -->
                <div class="sidebar-topics glass-panel">
                    <div class="st-header">
                        <span>正在讨论</span>
                        <a href="#" class="st-more">更多</a>
                    </div>
                    <div class="st-list">
                        ${TOPICS.map((t, i) => `
                            <div class="st-item">
                                <span class="st-icon">#</span>
                                <span class="st-name">${t.replace('#','')}</span>
                                <span class="st-hot">NEW</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- 简单的版权/底部 -->
                <div class="sidebar-footer">
                    © 2025 JackyRoom Moments
                </div>

            </aside>
        </div>

        <script>
            const RAW_DATA = ${JSON.stringify(MOMENTS_DATA)};
            const CURRENT_USER_ID = '${CURRENT_USER.id}';

            const MomentsApp = {
                currentTab: 'square',

                init: function() {
                    this.renderFeed();
                    this.updateDraftCount();
                },

                switchTab: function(tab, el) {
                    this.currentTab = tab;
                    document.querySelectorAll('.sn-item').forEach(i => i.classList.remove('active'));
                    el.classList.add('active');
                    this.renderFeed();
                },

                getFilteredData: function() {
                    switch(this.currentTab) {
                        case 'square': return RAW_DATA.filter(d => d.status === 'published' && d.visibility === 'public');
                        case 'following': return RAW_DATA.filter(d => d.author.id !== CURRENT_USER_ID && d.status === 'published');
                        case 'mine': return RAW_DATA.filter(d => d.author.id === CURRENT_USER_ID && d.status === 'published');
                        case 'drafts': return RAW_DATA.filter(d => d.author.id === CURRENT_USER_ID && d.status === 'draft');
                        default: return [];
                    }
                },

                renderFeed: function() {
                    const data = this.getFilteredData();
                    const container = document.getElementById('feedStream');
                    
                    if (data.length === 0) {
                        container.innerHTML = '<div class="empty-state"><i class="fa-regular fa-folder-open"></i><p>这里空空如也</p></div>';
                        return;
                    }

                    container.innerHTML = data.map(item => this.createCardHtml(item)).join('');
                },

                createCardHtml: function(item) {
                    let mediaHtml = '';
                    if (item.media && item.media.length > 0) {
                        const gridClass = item.media.length === 1 ? 'grid-1' : (item.media.length === 2 || item.media.length === 4 ? 'grid-2' : 'grid-3');
                        const itemsHtml = item.media.map(m => {
                            if (m.type === 'video') {
                                return \`<div class="media-item video-wrap"><video src="\${m.url}" controls poster="\${m.poster}"></video></div>\`;
                            } else {
                                return \`<div class="media-item img-wrap" style="background-image: url('\${m.url}')" onclick="MomentsApp.previewImage('\${m.url}')"></div>\`;
                            }
                        }).join('');
                        mediaHtml = \`<div class="m-media-grid \${gridClass}">\${itemsHtml}</div>\`;
                    }

                    let linkHtml = '';
                    if (item.link) {
                        linkHtml = \`<a href="\${item.link.url}" target="_blank" class="m-link-card"><div class="link-icon"><i class="\${item.link.icon}"></i></div><div class="link-info"><div class="link-title">\${item.link.title}</div><div class="link-desc">\${item.link.desc}</div></div></a>\`;
                    }

                    const contentHtml = item.content.replace(/#([^\\s]+)/g, '<span class="hashtag">#$1</span>');

                    return \`
                    <article class="moment-card glass-panel fade-in">
                        <div class="mc-left">
                            <img src="\${item.author.avatar}" class="mc-avatar">
                        </div>
                        <div class="mc-right">
                            <div class="mc-header">
                                <div class="mc-name-row">
                                    <span class="mc-name">\${item.author.name}</span>
                                    <span class="mc-time">\${item.time}</span>
                                </div>
                                <button class="mc-opt-btn"><i class="fa-solid fa-ellipsis"></i></button>
                            </div>
                            <div class="mc-body">
                                <div class="mc-text">\${contentHtml}</div>
                                \${mediaHtml}
                                \${linkHtml}
                            </div>
                            <div class="mc-footer">
                                <div class="action-item"><i class="fa-regular fa-heart"></i> \${item.likes || ''}</div>
                                <div class="action-item"><i class="fa-regular fa-comment"></i> \${item.comments || ''}</div>
                                <div class="action-item"><i class="fa-solid fa-share-nodes"></i></div>
                            </div>
                        </div>
                    </article>
                    \`;
                },

                addMedia: function(type) {
                    const preview = document.getElementById('mediaPreview');
                    const icon = type === 'image' ? 'fa-image' : 'fa-video';
                    preview.innerHTML += \`<div class="preview-item"><i class="fa-solid \${icon}"></i></div>\`;
                },

                addTopic: function() {
                    const textarea = document.getElementById('postContent');
                    textarea.value += ' #话题 ';
                    textarea.focus();
                },

                publish: function() {
                    const content = document.getElementById('postContent').value;
                    if (!content.trim()) { alert('请输入内容'); return; }

                    const newItem = {
                        id: Date.now(),
                        author: { id: CURRENT_USER_ID, name: CURRENT_USER.name, avatar: CURRENT_USER.avatar },
                        time: '刚刚',
                        content: content,
                        media: [], 
                        type: 'post',
                        status: 'published',
                        visibility: document.getElementById('postVisibility').value,
                        likes: 0, comments: 0
                    };

                    RAW_DATA.unshift(newItem);
                    document.getElementById('postContent').value = '';
                    document.getElementById('mediaPreview').innerHTML = '';
                    this.switchTab('mine', document.querySelectorAll('.sn-item')[2]); 
                },

                updateDraftCount: function() {
                    const count = RAW_DATA.filter(d => d.author.id === CURRENT_USER_ID && d.status === 'draft').length;
                    const el = document.getElementById('draftCount');
                    if(count > 0) { el.innerText = count; el.style.display = 'block'; }
                },
                
                previewImage: function(url) {
                    const win = window.open("", "_blank");
                    win.document.write('<img src="' + url + '" style="max-width:100%">');
                }
            };

            MomentsApp.init();
        </script>
    </div>
    `;
}

module.exports = {
    meta: {
        id: 'moments',
        name: '生活动态',
        icon: 'camera-retro'
    },
    routes: [
        {
            method: 'GET',
            path: '/',
            handler: (req, res) => {
                const content = renderMomentsPage();
                res.send(render({ 
                    title: '生活动态 - JackyRoom', 
                    content: content, 
                    currentModule: 'moments',
                    extraHead: '<link rel="stylesheet" href="/modules/moments/moments.css">'
                }));
            }
        }
    ]
};