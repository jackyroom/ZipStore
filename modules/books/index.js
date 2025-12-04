const { render } = require('../../core/layout-engine');

// 1. 模拟书籍数据
const BOOKS_DATA = [
    {
        id: 1,
        title: "深入浅出 Node.js",
        author: "朴灵",
        cover: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&q=80",
        category: "技术开发",
        format: "PDF",
        size: "15.2 MB",
        pages: 350,
        rating: 4.8,
        readCount: 12400,
        desc: "本书从不同的视角介绍了 Node.js，包括模块机制、异步 I/O、异步编程、内存控制、Buffer、网络编程等内容，是 Node.js 进阶必读经典。",
        toc: [
            "第1章 Node.js 简介",
            "第2章 模块机制",
            "第3章 异步 I/O",
            "第4章 异步编程",
            "第5章 内存控制",
            "第6章 理解 Buffer"
        ]
    },
    {
        id: 2,
        title: "三体全集",
        author: "刘慈欣",
        cover: "https://images.unsplash.com/photo-1614726365723-49cfae96b3d5?w=600&q=80",
        category: "科幻小说",
        format: "EPUB",
        size: "4.5 MB",
        pages: 890,
        rating: 5.0,
        readCount: 56000,
        desc: "文化大革命如火如荼进行的同时，军方探寻外星文明的绝秘计划“红岸工程”取得了突破性进展。但无人料到，地球文明向宇宙发出的第一声啼鸣，彻底改变了人类的命运。",
        toc: [
            "第一部：地球往事",
            "第二部：黑暗森林",
            "第三部：死神永生"
        ]
    },
    {
        id: 3,
        title: "设计心理学",
        author: "Don Norman",
        cover: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600&q=80",
        category: "设计美学",
        format: "PDF",
        size: "22 MB",
        pages: 280,
        rating: 4.6,
        readCount: 8900,
        desc: "设计不仅仅是美观，更重要的是好用。诺曼博士用风趣的语言阐述了以人为本的设计原则，揭示了生活中那些“反人类”设计的成因。",
        toc: [
            "日用品心理学",
            "理解与概念模型",
            "知道该做什么",
            "以人为本的设计"
        ]
    },
    {
        id: 4,
        title: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&q=80",
        category: "经典文学",
        format: "TXT",
        size: "800 KB",
        pages: 180,
        rating: 4.4,
        readCount: 15000,
        desc: "A story of the fabulously wealthy Jay Gatsby and his new love for the beautiful Daisy Buchanan, of lavish parties on Long Island at a time when The New York Times noted 'gin was the national drink and sex the national obsession.'",
        toc: [
            "Chapter 1",
            "Chapter 2",
            "Chapter 3",
            "Chapter 4"
        ]
    },
    {
        id: 5,
        title: "JavaScript 高级程序设计",
        author: "Matt Frisbie",
        cover: "https://images.unsplash.com/photo-1517842645767-c639042777db?w=600&q=80",
        category: "技术开发",
        format: "PDF",
        size: "35 MB",
        pages: 800,
        rating: 4.9,
        readCount: 22000,
        desc: "前端开发者的“红宝书”，全面深入地探讨了 JavaScript 语言的核心概念，包括 ECMAScript 最新特性、DOM 操作、BOM 等。",
        toc: [
            "什么是 JavaScript",
            "HTML 中的 JavaScript",
            "语言基础",
            "变量、作用域与内存"
        ]
    },
    {
        id: 6,
        title: "Cyberpunk 2077: The Lore",
        author: "CD Projekt Red",
        cover: "https://images.unsplash.com/photo-1620641788427-7e1742095195?w=600&q=80",
        category: "游戏设定",
        format: "PDF",
        size: "120 MB",
        pages: 150,
        rating: 4.7,
        readCount: 6500,
        desc: "The complete guide to the world of Cyberpunk 2077. Explore the history, districts, gangs, and technology of Night City.",
        toc: [
            "History of Night City",
            "Technology & Cyberware",
            "Gangs of Night City",
            "Corporations"
        ]
    }
];

function renderBooksPage() {
    return `
    <div class="books-module-container">
        <!-- 工具栏 -->
        <div class="books-toolbar">
            <div class="books-nav">
                <div class="book-nav-item active">全部书籍</div>
                <div class="book-nav-item">技术开发</div>
                <div class="book-nav-item">科幻小说</div>
                <div class="book-nav-item">设计美学</div>
                <div class="book-nav-item">经典文学</div>
            </div>

            <div class="books-search">
                <div class="search-wrapper">
                    <i class="search-icon">🔍</i>
                    <input type="text" class="search-input" placeholder="搜索书名、作者...">
                    <select class="format-filter">
                        <option>所有格式</option>
                        <option>PDF</option>
                        <option>EPUB</option>
                        <option>TXT</option>
                    </select>
                </div>
            </div>
        </div>

        <!-- 书籍列表 -->
        <div class="books-grid" id="booksList">
            ${renderBookCards(BOOKS_DATA)}
        </div>

        <!-- 详情与阅读模态框 -->
        <div class="book-modal-overlay" id="bookReaderModal">
            <div class="book-modal">
                <button class="modal-close" onclick="BookApp.closeModal()">×</button>
                
                <!-- 详情视图 -->
                <div class="book-detail-view" id="bookDetailView">
                    <div class="book-cover-section">
                        <div class="book-cover-large">
                            <img id="bCover" src="" alt="Book Cover">
                            <div class="format-tag" id="bFormat">PDF</div>
                        </div>
                        <div class="book-actions">
                            <button class="btn-read" onclick="BookApp.startReading()">
                                <i class="fa-solid fa-book-open"></i> 立即阅读
                            </button>
                            <button class="btn-download" onclick="alert('下载功能暂未开放')">
                                <i class="fa-solid fa-download"></i> 下载文件
                            </button>
                        </div>
                    </div>
                    
                    <div class="book-info-section">
                        <div class="book-header-text">
                            <h2 id="bTitle">Title</h2>
                            <p class="book-author">作者：<span id="bAuthor">Author</span></p>
                            <div class="book-meta-tags">
                                <span class="meta-tag" id="bCategory">Category</span>
                                <span class="meta-tag"><i class="fa-solid fa-file"></i> <span id="bSize">0MB</span></span>
                                <span class="meta-tag"><i class="fa-solid fa-layer-group"></i> <span id="bPages">0</span> 页</span>
                            </div>
                        </div>

                        <div class="book-desc-box">
                            <h3>📖 书籍简介</h3>
                            <p id="bDesc">Description...</p>
                        </div>

                        <div class="book-toc-preview">
                            <h3>📑 目录概览</h3>
                            <ul class="toc-list-preview" id="bTocPreview">
                                <!-- JS 填充 -->
                            </ul>
                        </div>
                    </div>
                </div>

                <!-- 阅读器视图 (默认隐藏) -->
                <div class="book-reader-view" id="bookReaderView" style="display:none;">
                    <!-- 阅读器侧边栏：目录 -->
                    <aside class="reader-sidebar">
                        <div class="reader-header">
                            <h3>目录</h3>
                        </div>
                        <ul class="reader-toc-list" id="readerTocList">
                            <!-- JS 填充 -->
                        </ul>
                    </aside>

                    <!-- 阅读器主区域 -->
                    <main class="reader-main">
                        <div class="reader-toolbar">
                            <button class="reader-btn" onclick="BookApp.exitReading()"><i class="fa-solid fa-arrow-left"></i> 返回详情</button>
                            <span class="reader-title" id="readerBookTitle">Book Title</span>
                            <div class="reader-controls">
                                <button class="reader-btn" title="缩小" onclick="alert('Zoom Out')"><i class="fa-solid fa-minus"></i></button>
                                <button class="reader-btn" title="放大" onclick="alert('Zoom In')"><i class="fa-solid fa-plus"></i></button>
                                <button class="reader-btn" title="全屏" onclick="alert('Fullscreen')"><i class="fa-solid fa-expand"></i></button>
                            </div>
                        </div>

                        <div class="reader-content-area custom-scroll">
                            <div class="simulated-page" id="simulatedPage">
                                <h2 id="pageChapterTitle">Chapter Title</h2>
                                <div class="page-text-placeholder">
                                    <p>这里是模拟的书籍阅读内容。在实际应用中，这里可以集成 PDF.js 来渲染 PDF 文件，或者解析 EPUB/TXT 文本内容。</p>
                                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                                    <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                                    <br>
                                    <p>（翻页模拟）</p>
                                    <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
                                </div>
                            </div>
                        </div>

                        <div class="reader-pagination">
                            <button class="page-btn" onclick="BookApp.prevPage()">上一页</button>
                            <span class="page-info">第 <span id="currPage">1</span> 页 / 共 <span id="totalPage">10</span> 页</span>
                            <button class="page-btn" onclick="BookApp.nextPage()">下一页</button>
                        </div>
                    </main>
                </div>

            </div>
        </div>

        <script>
            const BOOKS = ${JSON.stringify(BOOKS_DATA)};

            const BookApp = {
                currentBook: null,
                currentPage: 1,

                init: function() {
                    // 导航切换
                    document.querySelectorAll('.book-nav-item').forEach(item => {
                        item.addEventListener('click', function() {
                            document.querySelectorAll('.book-nav-item').forEach(i => i.classList.remove('active'));
                            this.classList.add('active');
                            // 这里可添加分类筛选逻辑
                        });
                    });

                    // 遮罩点击关闭
                    document.getElementById('bookReaderModal').addEventListener('click', (e) => {
                        if(e.target.id === 'bookReaderModal') this.closeModal();
                    });
                },

                openModal: function(id) {
                    const book = BOOKS.find(b => b.id == id);
                    if(!book) return;
                    this.currentBook = book;

                    // 填充详情页
                    document.getElementById('bCover').src = book.cover;
                    document.getElementById('bFormat').innerText = book.format;
                    document.getElementById('bTitle').innerText = book.title;
                    document.getElementById('bAuthor').innerText = book.author;
                    document.getElementById('bCategory').innerText = book.category;
                    document.getElementById('bSize').innerText = book.size;
                    document.getElementById('bPages').innerText = book.pages;
                    document.getElementById('bDesc').innerText = book.desc;

                    // 填充预览目录
                    const tocHtml = book.toc.map(t => \`<li><i class="fa-regular fa-file-lines"></i> \${t}</li>\`).join('');
                    document.getElementById('bTocPreview').innerHTML = tocHtml;

                    // 确保显示详情页，隐藏阅读器
                    document.getElementById('bookDetailView').style.display = 'flex';
                    document.getElementById('bookReaderView').style.display = 'none';

                    document.getElementById('bookReaderModal').classList.add('active');
                },

                closeModal: function() {
                    document.getElementById('bookReaderModal').classList.remove('active');
                    this.currentBook = null;
                },

                startReading: function() {
                    if(!this.currentBook) return;
                    
                    // 切换视图
                    document.getElementById('bookDetailView').style.display = 'none';
                    document.getElementById('bookReaderView').style.display = 'flex';
                    
                    // 初始化阅读器数据
                    document.getElementById('readerBookTitle').innerText = this.currentBook.title;
                    document.getElementById('totalPage').innerText = this.currentBook.pages;
                    this.currentPage = 1;
                    this.updatePageDisplay();

                    // 填充阅读器目录
                    const tocHtml = this.currentBook.toc.map((t, i) => 
                        \`<li class="\${i===0?'active':''}" onclick="BookApp.jumpToChapter(\${i})">\${t}</li>\`
                    ).join('');
                    document.getElementById('readerTocList').innerHTML = tocHtml;
                },

                exitReading: function() {
                    document.getElementById('bookReaderView').style.display = 'none';
                    document.getElementById('bookDetailView').style.display = 'flex';
                },

                prevPage: function() {
                    if(this.currentPage > 1) {
                        this.currentPage--;
                        this.updatePageDisplay();
                    }
                },

                nextPage: function() {
                    if(this.currentPage < this.currentBook.pages) {
                        this.currentPage++;
                        this.updatePageDisplay();
                    }
                },

                jumpToChapter: function(index) {
                    // 模拟跳转章节
                    document.querySelectorAll('#readerTocList li').forEach(li => li.classList.remove('active'));
                    document.querySelectorAll('#readerTocList li')[index].classList.add('active');
                    
                    const title = this.currentBook.toc[index];
                    document.getElementById('pageChapterTitle').innerText = title;
                    this.currentPage = (index * 20) + 1; // 模拟页码
                    this.updatePageDisplay();
                },

                updatePageDisplay: function() {
                    document.getElementById('currPage').innerText = this.currentPage;
                    // 可以在这里添加加载动画模拟
                }
            };

            BookApp.init();
        </script>
    </div>
    `;
}

// 渲染书籍卡片
function renderBookCards(items) {
    return items.map(item => `
        <div class="book-card" onclick="BookApp.openModal(${item.id})">
            <div class="book-cover-wrap">
                <img src="${item.cover}" alt="${item.title}" loading="lazy">
                <div class="book-overlay">
                    <button class="btn-quick-read">阅读</button>
                </div>
            </div>
            <div class="book-info">
                <h3 class="book-title" title="${item.title}">${item.title}</h3>
                <div class="book-meta-row">
                    <span class="author">${item.author}</span>
                    <span class="rating">★ ${item.rating}</span>
                </div>
                <div class="book-tags">
                    <span class="tag tag-cat">${item.category}</span>
                    <span class="tag tag-fmt">${item.format}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function formatNumber(num) {
    return num > 999 ? (num/1000).toFixed(1) + 'k' : num;
}

module.exports = {
    meta: {
        id: 'books',
        name: '书籍阅读',
        icon: 'book'
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