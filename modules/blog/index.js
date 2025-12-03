const path = require('path');
const { render } = require('../../core/layout-engine');

// --- 模拟数据 (保持不变) ---
const MOCK_AUTHOR = {
    name: "Jacky",
    bio: "全栈开发者 / 游戏爱好者 / 咖啡因驱动",
    avatar: "/favicon.ico.png",
    stats: { posts: 42, categories: 8, tags: 15 }
};

const MOCK_CATEGORIES = [
    { name: "前端开发", count: 12, icon: "fa-brands fa-js" },
    { name: "后端架构", count: 8, icon: "fa-solid fa-server" },
    { name: "游戏设计", count: 5, icon: "fa-solid fa-gamepad" },
    { name: "随笔杂谈", count: 17, icon: "fa-solid fa-mug-hot" }
];

const MOCK_TAGS = ["React", "Node.js", "Unreal Engine", "CSS3", "WebGL", "微服务", "生活", "读书"];

const MOCK_POSTS = [
    {
        id: 1,
        title: "使用 Node.js 构建微内核架构",
        summary: "探索如何通过简单的文件系统路由和模块加载器，构建一个可扩展的 Express 应用架构。",
        content: "<p>在现代 Web 开发中，保持代码的模块化至关重要...</p><h3>1. 核心概念</h3><p>微内核架构允许我们将核心逻辑与业务逻辑分离...</p>",
        date: "2025-12-01",
        category: "后端架构",
        tags: ["Node.js", "Express", "架构"],
        views: 1250,
        comments: 34,
        words: 2400,
        cover: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    },
    {
        id: 2,
        title: "Glassmorphism: 玻璃拟态设计指南",
        summary: "深入解析 CSS Backdrop-filter 属性，打造极具现代感的半透明界面效果。",
        content: "<p>玻璃拟态（Glassmorphism）是近年来流行的 UI 设计趋势...</p>",
        date: "2025-11-28",
        category: "前端开发",
        tags: ["CSS3", "UI设计"],
        views: 890,
        comments: 12,
        words: 1500,
        cover: "linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)"
    }
];

// --- 组件渲染函数 ---

function renderSidebar() {
    return `
        <div class="blog-sidebar-wrapper">
            <!-- 作者卡片 -->
            <div class="glass-card author-card">
                <div class="author-cover"></div>
                <div class="author-content">
                    <div class="author-avatar">
                        <img src="${MOCK_AUTHOR.avatar}" alt="${MOCK_AUTHOR.name}" onerror="this.src='https://ui-avatars.com/api/?name=Jacky&background=random'">
                    </div>
                    <h3 class="author-name">${MOCK_AUTHOR.name}</h3>
                    <p class="author-bio">${MOCK_AUTHOR.bio}</p>
                    
                    <div class="author-stats">
                        <div class="stat-item"><strong>${MOCK_AUTHOR.stats.posts}</strong><span>文章</span></div>
                        <div class="stat-item"><strong>${MOCK_AUTHOR.stats.categories}</strong><span>分类</span></div>
                        <div class="stat-item"><strong>${MOCK_AUTHOR.stats.tags}</strong><span>标签</span></div>
                    </div>
                    
                    <button class="btn-primary full-width" onclick="location.href='/blog/editor'">
                        <i class="fa-solid fa-pen-nib"></i> 写文章
                    </button>
                </div>
            </div>

            <!-- 分类列表 -->
            <div class="glass-card category-widget">
                <h4 class="widget-title"><i class="fa-solid fa-folder-open"></i> 分类目录</h4>
                <ul class="category-list">
                    ${MOCK_CATEGORIES.map(c => `
                        <li>
                            <a href="#">
                                <span class="cat-name"><i class="${c.icon}"></i> ${c.name}</span>
                                <span class="cat-count">${c.count}</span>
                            </a>
                        </li>
                    `).join('')}
                </ul>
            </div>

            <!-- 标签云 -->
            <div class="glass-card tags-widget">
                <h4 class="widget-title"><i class="fa-solid fa-tags"></i> 热门标签</h4>
                <div class="tags-cloud">
                    ${MOCK_TAGS.map(t => `<a href="#" class="tag-chip">#${t}</a>`).join('')}
                </div>
            </div>
        </div>
    `;
}

function renderPostCard(post) {
    return `
        <article class="glass-card blog-post-card fade-in">
            <div class="post-cover" style="background: ${post.cover}">
                <span class="post-category">${post.category}</span>
            </div>
            <div class="post-info">
                <div class="post-meta">
                    <span><i class="fa-regular fa-calendar"></i> ${post.date}</span>
                    <span><i class="fa-regular fa-eye"></i> ${post.views}</span>
                    <span><i class="fa-regular fa-comments"></i> ${post.comments}</span>
                </div>
                <h2 class="post-title"><a href="/blog/post/${post.id}">${post.title}</a></h2>
                <p class="post-summary">${post.summary}</p>
                <div class="post-footer">
                    <div class="post-tags">
                        ${post.tags.map(t => `<span>#${t}</span>`).join('')}
                    </div>
                    <a href="/blog/post/${post.id}" class="read-more">阅读全文 <i class="fa-solid fa-arrow-right"></i></a>
                </div>
            </div>
        </article>
    `;
}

module.exports = {
    meta: {
        id: 'blog',
        name: '技术博客',
    },
    routes: [
        // 1. 博客首页
        {
            method: 'GET',
            path: '/',
            handler: (req, res) => {
                const html = `
                    <div class="blog-container">
                        <div class="blog-main">
                            ${MOCK_POSTS.map(renderPostCard).join('')}
                            <div class="pagination glass-card">
                                <a href="#" class="active">1</a><a href="#">2</a><span>...</span><a href="#">Next</a>
                            </div>
                        </div>
                        <div class="blog-sidebar">
                            ${renderSidebar()}
                        </div>
                    </div>
                `;
                // 注入独立的 CSS 文件
                res.send(render({ 
                    title: '博客首页', 
                    content: html, 
                    currentModule: 'blog',
                    extraHead: '<link rel="stylesheet" href="/modules/blog/blog.css">'
                }));
            }
        },
        // 2. 博客详情页
        {
            method: 'GET',
            path: '/post/:id',
            handler: (req, res) => {
                const post = MOCK_POSTS.find(p => p.id == req.params.id) || MOCK_POSTS[0];
                const html = `
                    <div class="blog-container">
                        <div class="blog-main">
                            <div class="glass-card post-detail fade-in">
                                <div class="detail-header" style="background: ${post.cover}">
                                    <div class="header-overlay"></div>
                                    <div class="header-content">
                                        <span class="detail-category">${post.category}</span>
                                        <h1 class="detail-title">${post.title}</h1>
                                        <div class="detail-meta">
                                            <span><i class="fa-solid fa-user"></i> ${MOCK_AUTHOR.name}</span>
                                            <span><i class="fa-solid fa-calendar-days"></i> ${post.date}</span>
                                            <span><i class="fa-solid fa-file-word"></i> ${post.words} 字</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="detail-body markdown-body">
                                    ${post.content}
                                    <div class="detail-actions">
                                        <button class="btn-action"><i class="fa-regular fa-thumbs-up"></i> 点赞 (${post.views})</button>
                                        <button class="btn-action"><i class="fa-solid fa-share-nodes"></i> 分享</button>
                                    </div>
                                </div>
                            </div>
                            <div class="glass-card comments-section" style="margin-top: 20px; padding: 25px;">
                                <h3 class="section-title"><i class="fa-solid fa-comments"></i> 评论 (${post.comments})</h3>
                                <div class="comment-editor">
                                    <div class="avatar-ring" style="width:40px;height:40px;"><img src="/favicon.ico.png"></div>
                                    <div class="editor-box">
                                        <textarea placeholder="写下你的评论..."></textarea>
                                        <div class="editor-footer"><button class="btn-primary btn-sm">发布评论</button></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="blog-sidebar">${renderSidebar()}</div>
                    </div>
                `;
                res.send(render({ 
                    title: post.title, 
                    content: html, 
                    currentModule: 'blog',
                    extraHead: '<link rel="stylesheet" href="/modules/blog/blog.css">'
                }));
            }
        },
        // 3. 博客编辑器
        {
            method: 'GET',
            path: '/editor',
            handler: (req, res) => {
                const html = `
                    <div class="editor-wrapper fade-in">
                        <!-- 顶部操作栏 -->
                        <div class="editor-header glass-card">
                            <div class="left">
                                <a href="/blog" class="back-btn"><i class="fa-solid fa-arrow-left"></i> 返回列表</a>
                                <span class="status-text"><i class="fa-regular fa-clock"></i> 草稿自动保存于 刚刚</span>
                            </div>
                            <div class="right">
                                <button class="btn-ghost">预览</button>
                                <button class="btn-primary">发布文章</button>
                            </div>
                        </div>

                        <div class="editor-body">
                            <!-- 左侧：主要编辑区 -->
                            <div class="editor-main glass-card">
                                <!-- 封面图上传占位 -->
                                <div class="editor-cover-upload">
                                    <i class="fa-regular fa-image"></i> 添加封面大图 (建议尺寸 1920x1080)
                                </div>
                                
                                <!-- 标题输入 -->
                                <input type="text" class="editor-title-input" placeholder="请输入文章标题..." value="">
                                
                                <!-- 工具栏 -->
                                <div class="editor-toolbar">
                                    <button title="粗体"><i class="fa-solid fa-bold"></i></button>
                                    <button title="斜体"><i class="fa-solid fa-italic"></i></button>
                                    <button title="标题"><i class="fa-solid fa-heading"></i></button>
                                    <div class="divider"></div>
                                    <button title="引用"><i class="fa-solid fa-quote-left"></i></button>
                                    <button title="代码块"><i class="fa-solid fa-code"></i></button>
                                    <button title="链接"><i class="fa-solid fa-link"></i></button>
                                    <button title="图片"><i class="fa-regular fa-image"></i></button>
                                    <div class="divider"></div>
                                    <button title="列表"><i class="fa-solid fa-list-ul"></i></button>
                                </div>

                                <!-- 正文输入 -->
                                <textarea class="editor-content-input" placeholder="开始你的创作... (支持 Markdown 语法)"></textarea>
                                
                                <!-- 底部统计 -->
                                <div class="editor-footer-stat">
                                    <span>字数: 0</span>
                                    <span>预计阅读: 0 分钟</span>
                                </div>
                            </div>

                            <!-- 右侧：文章设置 -->
                            <div class="editor-settings">
                                <div class="glass-card settings-card">
                                    <h4 class="settings-title">发布设置</h4>
                                    
                                    <div class="form-group">
                                        <label>分类专栏</label>
                                        <select class="glass-select">
                                            <option value="" disabled selected>选择分类</option>
                                            ${MOCK_CATEGORIES.map(c => `<option value="${c.name}">${c.name}</option>`).join('')}
                                        </select>
                                    </div>

                                    <div class="form-group">
                                        <label>标签 (Tags)</label>
                                        <div class="tag-input-wrapper">
                                            <span class="tag-badge">Web <i class="fa-solid fa-xmark"></i></span>
                                            <input type="text" placeholder="+ Enter 添加" class="tag-input-field">
                                        </div>
                                        <div class="recommend-tags">
                                            <span>推荐:</span> <span>React</span><span>Vue</span><span>架构</span>
                                        </div>
                                    </div>

                                    <div class="form-group">
                                        <label>摘要 (Excerpt)</label>
                                        <textarea class="glass-textarea" rows="3" placeholder="简短描述文章内容，利于SEO..."></textarea>
                                    </div>
                                    
                                    <div class="form-group">
                                        <label>发布选项</label>
                                        <div class="toggle-row">
                                            <span>公开可见</span>
                                            <label class="switch">
                                              <input type="checkbox" checked>
                                              <span class="slider round"></span>
                                            </label>
                                        </div>
                                        <div class="toggle-row">
                                            <span>允许评论</span>
                                            <label class="switch">
                                              <input type="checkbox" checked>
                                              <span class="slider round"></span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                res.send(render({ 
                    title: '写文章', 
                    content: html, 
                    currentModule: 'blog',
                    extraHead: '<link rel="stylesheet" href="/modules/blog/blog.css">'
                }));
            }
        }
    ],
    onInit: (app) => {
        console.log('   📝 Blog Module Loaded');
    }
};