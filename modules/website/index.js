const { render } = require('../../core/layout-engine');

// 网站目录资源数据
const WEBSITE_RESOURCES = [
    {
        id: 1,
        title: "GitHub",
        description: "全球最大的代码托管平台",
        url: "https://github.com",
        thumb: "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=600&q=80",
        category: "开发工具",
        tags: ["代码托管", "开源", "协作"],
        visits: 15000,
        rating: 5
    },
    {
        id: 2,
        title: "Stack Overflow",
        description: "程序员问答社区",
        url: "https://stackoverflow.com",
        thumb: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80",
        category: "学习资源",
        tags: ["问答", "技术", "社区"],
        visits: 12000,
        rating: 5
    },
    {
        id: 3,
        title: "MDN Web Docs",
        description: "Web 开发技术文档",
        url: "https://developer.mozilla.org",
        thumb: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&q=80",
        category: "学习资源",
        tags: ["文档", "前端", "教程"],
        visits: 9800,
        rating: 5
    },
    {
        id: 4,
        title: "Dribbble",
        description: "设计师作品展示平台",
        url: "https://dribbble.com",
        thumb: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&q=80",
        category: "设计资源",
        tags: ["设计", "灵感", "作品集"],
        visits: 8500,
        rating: 4
    },
    {
        id: 5,
        title: "Unsplash",
        description: "免费高质量图片素材库",
        url: "https://unsplash.com",
        thumb: "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=600&q=80",
        category: "素材资源",
        tags: ["图片", "免费", "高清"],
        visits: 11000,
        rating: 5
    },
    {
        id: 6,
        title: "Can I Use",
        description: "浏览器兼容性查询工具",
        url: "https://caniuse.com",
        thumb: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=600&q=80",
        category: "开发工具",
        tags: ["兼容性", "工具", "查询"],
        visits: 7200,
        rating: 4
    }
];

// 渲染函数
function renderWebsitePage() {
    return `
    <div class="website-module-container">
        <!-- Header -->
        <div class="website-header">
            <div class="header-icon">🌐</div>
            <div class="header-content">
                <h1 class="header-title">网站目录</h1>
                <p class="header-desc">精选优质网站资源，涵盖开发、设计、学习等各个领域</p>
            </div>
            <div class="header-count">
                <span class="count-num">${WEBSITE_RESOURCES.length}</span>
                <span class="count-label">个网站</span>
            </div>
        </div>

        <!-- 分类标签 -->
        <div class="website-categories">
            <div class="category-tag active">全部</div>
            <div class="category-tag">开发工具</div>
            <div class="category-tag">学习资源</div>
            <div class="category-tag">设计资源</div>
            <div class="category-tag">素材资源</div>
        </div>

        <!-- 搜索栏 -->
        <div class="website-search">
            <div class="search-container">
                <i class="search-icon">🔍</i>
                <input type="text" class="search-input" placeholder="搜索网站名称、描述、标签...">
            </div>
        </div>

        <!-- 网站列表 -->
        <div class="website-list">
            ${renderWebsiteCards(WEBSITE_RESOURCES)}
        </div>

        <script>
            // 分类切换
            document.querySelectorAll('.category-tag').forEach(tag => {
                tag.addEventListener('click', function() {
                    document.querySelectorAll('.category-tag').forEach(t => t.classList.remove('active'));
                    this.classList.add('active');
                });
            });
        </script>
    </div>
    `;
}

// 渲染网站卡片
function renderWebsiteCards(items) {
    return items.map(item => `
        <div class="website-card">
            <div class="card-preview">
                <img src="${item.thumb}" alt="${item.title}" loading="lazy">
                <div class="preview-overlay">
                    <a href="${item.url}" target="_blank" class="visit-btn">
                        🔗 访问网站
                    </a>
                </div>
            </div>
            <div class="card-content">
                <div class="card-header">
                    <h3 class="card-title">${item.title}</h3>
                    <div class="card-rating">
                        ${'⭐'.repeat(item.rating)}
                    </div>
                </div>
                <p class="card-desc">${item.description}</p>
                <div class="card-tags">
                    ${item.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                <div class="card-footer">
                    <span class="card-category">${item.category}</span>
                    <div class="card-stats">
                        <span>👁 ${formatNumber(item.visits)}</span>
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
        id: 'website',
        name: '网站目录',
    },
    routes: [
        {
            method: 'GET',
            path: '/',
            handler: (req, res) => {
                const content = renderWebsitePage();
                res.send(render({ 
                    title: '网站目录 - JackyRoom', 
                    content: content, 
                    currentModule: 'website',
                    extraHead: '<link rel="stylesheet" href="/modules/website/website.css">'
                }));
            }
        }
    ]
};

