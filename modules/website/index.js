const { render } = require('../../core/layout-engine');

// 1. 网站导航数据配置
const WEBSITE_DATA = [
    {
        id: 'design',
        name: '设计灵感',
        icon: 'fa-solid fa-palette',
        sites: [
            { name: 'Pinterest', url: 'https://www.pinterest.com/', desc: '全球最大的创意灵感图片分享社区' },
            { name: 'Behance', url: 'https://www.behance.net/', desc: 'Adobe旗下的设计师作品展示平台' },
            { name: 'Dribbble', url: 'https://dribbble.com/', desc: 'UI设计师的灵感加油站' },
            { name: 'ArtStation', url: 'https://www.artstation.com/', desc: '专业的CG艺术家作品展示平台' },
            { name: 'Huaban', url: 'https://huaban.com/', desc: '花瓣网，设计师寻找灵感的天堂' },
            { name: 'Mobbin', url: 'https://mobbin.com/', desc: '最新移动端App UI设计模式集合' }
        ]
    },
    {
        id: 'dev',
        name: '开发资源',
        icon: 'fa-solid fa-code',
        sites: [
            { name: 'GitHub', url: 'https://github.com/', desc: '全球最大的代码托管与开源社区' },
            { name: 'Stack Overflow', url: 'https://stackoverflow.com/', desc: '全球程序员问答社区' },
            { name: 'MDN Web Docs', url: 'https://developer.mozilla.org/', desc: 'Web开发技术的权威文档' },
            { name: 'DevDocs', url: 'https://devdocs.io/', desc: '快速、离线、整合的API文档浏览器' },
            { name: 'Can I Use', url: 'https://caniuse.com/', desc: '前端浏览器兼容性查询工具' },
            { name: 'NPM', url: 'https://www.npmjs.com/', desc: 'Node.js 包管理器官网' }
        ]
    },
    {
        id: 'tools',
        name: '在线工具',
        icon: 'fa-solid fa-toolbox',
        sites: [
            { name: 'TinyPNG', url: 'https://tinypng.com/', desc: '智能压缩WebP、PNG和JPEG图片' },
            { name: 'Carbon', url: 'https://carbon.now.sh/', desc: '生成漂亮的代码图片分享工具' },
            { name: 'Excalidraw', url: 'https://excalidraw.com/', desc: '虚拟手绘风格的在线白板' },
            { name: 'Remove.bg', url: 'https://www.remove.bg/', desc: 'AI自动去除图片背景' },
            { name: 'Convertio', url: 'https://convertio.co/', desc: '强大的在线文件格式转换工具' },
            { name: 'Regex101', url: 'https://regex101.com/', desc: '在线正则表达式测试与调试' }
        ]
    },
    {
        id: 'assets',
        name: '素材资源',
        icon: 'fa-solid fa-cube',
        sites: [
            { name: 'Unsplash', url: 'https://unsplash.com/', desc: '高质量免费无版权图片素材' },
            { name: 'Pexels', url: 'https://www.pexels.com/', desc: '免费素材图片和视频分享' },
            { name: 'Flaticon', url: 'https://www.flaticon.com/', desc: '最大的免费矢量图标数据库' },
            { name: 'Sketchfab', url: 'https://sketchfab.com/', desc: '发布和寻找3D模型的平台' },
            { name: 'Poly Haven', url: 'https://polyhaven.com/', desc: '免费的高质量3D纹理、模型和HDRI' }
        ]
    },
    {
        id: 'ai',
        name: 'AI 工具',
        icon: 'fa-solid fa-robot',
        sites: [
            { name: 'ChatGPT', url: 'https://chat.openai.com/', desc: 'OpenAI 推出的革命性对话AI' },
            { name: 'Midjourney', url: 'https://www.midjourney.com/', desc: 'AI 艺术图片生成工具' },
            { name: 'Notion AI', url: 'https://www.notion.so/', desc: '集成在笔记软件中的智能写作助手' },
            { name: 'Runway', url: 'https://runwayml.com/', desc: 'AI 视频编辑与生成工具' }
        ]
    },
    {
        id: 'learning',
        name: '学习教育',
        icon: 'fa-solid fa-graduation-cap',
        sites: [
            { name: 'Coursera', url: 'https://www.coursera.org/', desc: '世界顶级大学的在线课程' },
            { name: 'Udemy', url: 'https://www.udemy.com/', desc: '全球最大的在线学习平台' },
            { name: 'Bilibili', url: 'https://www.bilibili.com/', desc: '国内知名的视频弹幕网站，学习资源丰富' },
            { name: 'TED', url: 'https://www.ted.com/', desc: '传播有价值思想的演讲视频' }
        ]
    }
];

// 2. 页面渲染逻辑
function renderWebsitePage() {
    // 生成侧边栏导航 HTML
    const sidebarHtml = WEBSITE_DATA.map((cat, index) => `
        <a href="#${cat.id}" class="web-nav-item ${index === 0 ? 'active' : ''}" data-target="${cat.id}">
            <i class="${cat.icon}"></i>
            <span>${cat.name}</span>
        </a>
    `).join('');

    // 生成主要内容区域 HTML
    const contentHtml = WEBSITE_DATA.map(cat => `
        <section id="${cat.id}" class="web-section">
            <div class="section-header">
                <i class="${cat.icon} section-icon"></i>
                <h2 class="section-title">${cat.name}</h2>
                <span class="section-count">${cat.sites.length}</span>
            </div>
            <div class="web-grid">
                ${cat.sites.map(site => renderSiteCard(site)).join('')}
            </div>
        </section>
    `).join('');

    return `
    <div class="website-module-container">
        <div class="website-layout">
            <!-- 左侧固定导航 -->
            <aside class="website-sidebar custom-scroll">
                <div class="sidebar-inner">
                   ${sidebarHtml}
                </div>
            </aside>

            <!-- 右侧内容区域 -->
            <main class="website-content custom-scroll" id="mainScrollContent">
                <!-- 顶部搜索栏 (放在内容区顶部) -->
                <div class="web-search-bar">
                    <i class="fa-solid fa-magnifying-glass"></i>
                    <input type="text" id="siteSearch" placeholder="搜索网站、描述..." onkeyup="WebsiteApp.search(this.value)">
                </div>

                <div class="web-sections-wrapper">
                    ${contentHtml}
                </div>
                
                <!-- 底部留白 -->
                <div style="height: 100px;"></div>
            </main>
        </div>
        
        <script>
            const WebsiteApp = {
                init: function() {
                    this.initScrollSpy();
                    this.initSmoothScroll();
                },

                // 滚动监听：更新侧边栏高亮
                initScrollSpy: function() {
                    const mainContainer = document.getElementById('mainScrollContent');
                    const sections = document.querySelectorAll('.web-section');
                    const navItems = document.querySelectorAll('.web-nav-item');
                    
                    // 配置 IntersectionObserver
                    const observerOptions = {
                        root: mainContainer,
                        rootMargin: '-10% 0px -80% 0px', // 视口顶部10%到底部80%的区域判定为“激活”
                        threshold: 0
                    };

                    const observer = new IntersectionObserver((entries) => {
                        entries.forEach(entry => {
                            if (entry.isIntersecting) {
                                const id = entry.target.getAttribute('id');
                                // 移除所有 active
                                navItems.forEach(item => item.classList.remove('active'));
                                // 给当前 active
                                const activeItem = document.querySelector(\`.web-nav-item[data-target="\${id}"]\`);
                                if (activeItem) {
                                    activeItem.classList.add('active');
                                    // 侧边栏自动滚动以保持高亮项可见
                                    activeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                                }
                            }
                        });
                    }, observerOptions);

                    sections.forEach(section => observer.observe(section));
                },

                // 点击平滑滚动
                initSmoothScroll: function() {
                    document.querySelectorAll('.web-nav-item').forEach(item => {
                        item.addEventListener('click', function(e) {
                            e.preventDefault();
                            const targetId = this.getAttribute('data-target');
                            const targetSection = document.getElementById(targetId);
                            const mainContainer = document.getElementById('mainScrollContent');
                            
                            // 计算滚动位置
                            // 需要减去搜索栏的高度和一些内边距
                            const offsetTop = targetSection.offsetTop - 80; 

                            mainContainer.scrollTo({
                                top: offsetTop,
                                behavior: 'smooth'
                            });
                        });
                    });
                },

                // 简单的前端搜索过滤
                search: function(keyword) {
                    keyword = keyword.toLowerCase();
                    const sections = document.querySelectorAll('.web-section');
                    
                    sections.forEach(section => {
                        let hasVisibleSite = false;
                        const cards = section.querySelectorAll('.web-card');
                        
                        cards.forEach(card => {
                            const text = card.innerText.toLowerCase();
                            if(text.includes(keyword)) {
                                card.style.display = 'flex';
                                hasVisibleSite = true;
                            } else {
                                card.style.display = 'none';
                            }
                        });

                        // 如果该分类下没有匹配的网站，隐藏整个分类标题
                        section.style.display = hasVisibleSite ? 'block' : 'none';
                    });
                }
            };

            // DOM 加载完成后初始化
            document.addEventListener('DOMContentLoaded', () => {
                WebsiteApp.init();
            });
            // 同时也尝试直接运行，防止DOMContentLoaded已过
            if (document.readyState === 'complete' || document.readyState === 'interactive') {
                 WebsiteApp.init();
            }
        </script>
    </div>
    `;
}

// 辅助：生成网站卡片
function renderSiteCard(site) {
    // 获取 favicon 的 API 服务
    // 备选: https://icon.horse/icon/${domain} 或 https://unavatar.io/${domain}
    const domain = new URL(site.url).hostname;
    const iconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

    return `
    <a href="${site.url}" target="_blank" class="web-card" title="${site.desc}">
        <div class="web-icon-box">
            <img src="${iconUrl}" alt="${site.name}" loading="lazy" onerror="this.src='https://ui-avatars.com/api/?name=${site.name}&background=random'">
        </div>
        <div class="web-info">
            <h3 class="web-name">${site.name}</h3>
            <p class="web-desc">${site.desc}</p>
        </div>
        <div class="web-link-icon">
            <i class="fa-solid fa-arrow-up-right-from-square"></i>
        </div>
    </a>
    `;
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