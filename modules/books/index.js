const { render } = require('../../core/layout-engine');

// 书籍资源数据
const BOOKS_RESOURCES = [
    {
        id: 1,
        title: "深入理解计算机系统",
        author: "Randal E. Bryant",
        thumb: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&q=80",
        format: "PDF / EPUB",
        pages: 736,
        size: "45 MB",
        downloads: 3200,
        views: 8900,
        category: "计算机科学",
        language: "中文"
    },
    {
        id: 2,
        title: "设计模式：可复用面向对象软件的基础",
        author: "Gang of Four",
        thumb: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80",
        format: "PDF",
        pages: 512,
        size: "28 MB",
        downloads: 4500,
        views: 12000,
        category: "软件工程",
        language: "中文"
    },
    {
        id: 3,
        title: "算法导论（第三版）",
        author: "Thomas H. Cormen",
        thumb: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&q=80",
        format: "PDF / MOBI",
        pages: 1312,
        size: "120 MB",
        downloads: 2800,
        views: 7500,
        category: "算法",
        language: "中文"
    },
    {
        id: 4,
        title: "JavaScript 高级程序设计（第4版）",
        author: "Matt Frisbie",
        thumb: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&q=80",
        format: "PDF / EPUB",
        pages: 1088,
        size: "85 MB",
        downloads: 5600,
        views: 15000,
        category: "前端开发",
        language: "中文"
    },
    {
        id: 5,
        title: "Clean Code 代码整洁之道",
        author: "Robert C. Martin",
        thumb: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&q=80",
        format: "PDF",
        pages: 464,
        size: "32 MB",
        downloads: 3800,
        views: 9800,
        category: "编程实践",
        language: "中文"
    },
    {
        id: 6,
        title: "深度学习（花书）",
        author: "Ian Goodfellow",
        thumb: "https://images.unsplash.com/photo-1509228468512-041f0a316da7?w=600&q=80",
        format: "PDF",
        pages: 800,
        size: "95 MB",
        downloads: 2100,
        views: 6200,
        category: "人工智能",
        language: "中文"
    }
];

// 渲染函数
function renderBooksPage() {
    return `
    <div class="books-module-container">
        <!-- Banner -->
        <div class="books-banner">
            <div class="banner-content">
                <h1 class="banner-title">📚 数字图书馆</h1>
                <p class="banner-subtitle">精选技术书籍、编程指南与学习资源</p>
                <div class="banner-stats">
                    <div class="stat">
                        <span class="stat-num">${BOOKS_RESOURCES.length}</span>
                        <span class="stat-label">本图书</span>
                    </div>
                    <div class="stat">
                        <span class="stat-num">${BOOKS_RESOURCES.reduce((sum, b) => sum + b.pages, 0).toLocaleString()}</span>
                        <span class="stat-label">总页数</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- 工具栏 -->
        <div class="books-toolbar">
            <div class="toolbar-search">
                <i class="search-icon">🔍</i>
                <input type="text" class="search-input" placeholder="搜索书名、作者、分类...">
            </div>
            <div class="toolbar-filters">
                <select class="filter-select">
                    <option>所有分类</option>
                    <option>计算机科学</option>
                    <option>软件工程</option>
                    <option>算法</option>
                    <option>前端开发</option>
                    <option>编程实践</option>
                    <option>人工智能</option>
                </select>
                <select class="filter-select">
                    <option>所有格式</option>
                    <option>PDF</option>
                    <option>EPUB</option>
                    <option>MOBI</option>
                </select>
                <select class="filter-select">
                    <option>所有语言</option>
                    <option>中文</option>
                    <option>英文</option>
                </select>
            </div>
        </div>

        <!-- 书籍网格 -->
        <div class="books-grid">
            ${renderBookCards(BOOKS_RESOURCES)}
        </div>

        <script>
            // 简单的搜索功能
            const searchInput = document.querySelector('.search-input');
            searchInput.addEventListener('input', function(e) {
                // 这里可以添加实时搜索逻辑
            });
        </script>
    </div>
    `;
}

// 渲染书籍卡片
function renderBookCards(items) {
    return items.map(item => `
        <div class="book-card">
            <div class="book-cover">
                <img src="${item.thumb}" alt="${item.title}" loading="lazy">
                <div class="format-tags">
                    <span class="format-tag">${item.format.split(' / ')[0]}</span>
                </div>
                <div class="book-overlay">
                    <button class="preview-btn" onclick="alert('预览: ${item.title}')">👁 预览</button>
                    <button class="download-btn" onclick="alert('下载: ${item.title}')">⬇ 下载</button>
                </div>
            </div>
            <div class="book-info">
                <div class="book-category">${item.category}</div>
                <h3 class="book-title">${item.title}</h3>
                <div class="book-author">✍ ${item.author}</div>
                <div class="book-meta">
                    <span class="meta-item">📄 ${item.pages} 页</span>
                    <span class="meta-item">💾 ${item.size}</span>
                    <span class="meta-item">🌐 ${item.language}</span>
                </div>
                <div class="book-stats">
                    <span>👁 ${formatNumber(item.views)}</span>
                    <span>⬇ ${formatNumber(item.downloads)}</span>
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
        id: 'books',
        name: '书籍阅读',
    },
    routes: [
        {
            method: 'GET',
            path: '/',
            handler: (req, res) => {
                const content = renderBooksPage();
                res.send(render({ 
                    title: '书籍阅读 - JackyRoom', 
                    content: content, 
                    currentModule: 'books',
                    extraHead: '<link rel="stylesheet" href="/modules/books/books.css">'
                }));
            }
        }
    ]
};

