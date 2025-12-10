const { render } = require('../../core/layout-engine');
const db = require('../../core/db-access');

// 1. 从数据库获取网站导航数据
async function getWebsiteData() {
    try {
        const categories = await db.query(`
            SELECT wc.*, 
                   (SELECT COUNT(*) FROM website_sites WHERE category_id = wc.id) as site_count
            FROM website_categories wc
            ORDER BY wc.sort_order ASC, wc.id ASC
        `);
        
        const result = [];
        for (const cat of categories) {
            const sites = await db.query(
                "SELECT * FROM website_sites WHERE category_id = ? ORDER BY sort_order ASC, id ASC",
                [cat.id]
            );
            result.push({
                id: `cat-${cat.id}`,
                name: cat.name,
                icon: cat.icon || 'fa-solid fa-folder',
                sites: sites.map(s => ({
                    name: s.name,
                    url: s.url,
                    desc: s.desc || ''
                }))
            });
        }
        
        return result;
    } catch (error) {
        console.error('获取网站目录数据失败:', error);
        return [];
    }
}

// 2. 页面渲染逻辑
async function renderWebsitePage() {
    const WEBSITE_DATA = await getWebsiteData();
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
            handler: async (req, res) => {
                const content = await renderWebsitePage();
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