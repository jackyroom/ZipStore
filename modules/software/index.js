const { render } = require('../../core/layout-engine');

// 1. 扩展软件工具资源数据 (增加详情、教程、版本列表)
const SOFTWARE_RESOURCES = [
    {
        id: 1,
        title: "Adobe Creative Suite 2024",
        author: "Adobe Inc.",
        thumb: "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=600&q=80",
        platform: "Windows / macOS",
        version: "2024.1",
        size: "8.5 GB",
        downloads: 4500,
        views: 12000,
        category: "设计工具",
        license: "商业",
        description: "Adobe Creative Cloud 是一套包含平面设计、视频编辑、网页开发、摄影应用的软件套装。2024版本引入了更多 AI 生成功能 (Firefly)，大幅提升创作效率。",
        tutorial: `1. 断开网络连接。\n2. 运行 Set-up.exe 进行安装。\n3. 安装完成后，不要打开软件。\n4. 将 'Crack' 文件夹中的 patch 文件复制到安装目录。\n5. 以管理员身份运行 patch 文件并点击 'Apply'。\n6. 恢复网络，享受全功能版本。`,
        history_versions: [
            { ver: "2024.1", date: "2024-02-10", size: "8.5 GB", link: "#" },
            { ver: "2023.5", date: "2023-11-15", size: "8.2 GB", link: "#" },
            { ver: "2022.0", date: "2022-10-01", size: "7.8 GB", link: "#" }
        ]
    },
    {
        id: 2,
        title: "JetBrains IDE 全家桶",
        author: "JetBrains",
        thumb: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&q=80",
        platform: "Windows / macOS / Linux",
        version: "2024.2",
        size: "2.1 GB",
        downloads: 3200,
        views: 8900,
        category: "开发工具",
        license: "商业",
        description: "包含 IntelliJ IDEA, PyCharm, WebStorm 等顶尖开发工具。智能代码补全、强大的重构功能，是专业开发者的首选。",
        tutorial: `1. 安装所需的 IDE 产品。\n2. 打开 'ja-netfilter' 文件夹。\n3. 配置 vmoptions 文件路径。\n4. 输入提供的激活码即可永久激活。`,
        history_versions: [
            { ver: "2024.2", date: "2024-03-01", size: "2.1 GB", link: "#" },
            { ver: "2023.3", date: "2023-12-20", size: "2.0 GB", link: "#" }
        ]
    },
    {
        id: 3,
        title: "Blender 3.6 LTS",
        author: "Blender Foundation",
        thumb: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=600&q=80",
        platform: "全平台",
        version: "3.6.5",
        size: "350 MB",
        downloads: 8900,
        views: 25000,
        category: "3D建模",
        license: "开源",
        description: "Blender 是一款免费开源三维图形图像软件，提供从建模、动画、材质、渲染、到音频处理、视频剪辑等一系列动画短片制作解决方案。",
        tutorial: `本软件为开源免费软件，无需破解。\n直接运行安装包安装即可使用所有功能。`,
        history_versions: [
            { ver: "3.6.5 LTS", date: "2023-10-05", size: "350 MB", link: "#" },
            { ver: "4.0.0", date: "2023-11-14", size: "380 MB", link: "#" }
        ]
    },
    // ... 为了演示，其他数据结构保持一致，此处省略重复 ...
    {
        id: 4,
        title: "OBS Studio 专业版",
        author: "OBS Project",
        thumb: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&q=80",
        platform: "Windows / macOS / Linux",
        version: "30.1.2",
        size: "120 MB",
        downloads: 5600,
        views: 15000,
        category: "直播录制",
        license: "开源",
        description: "用于视频录制和直播的免费开源软件。功能强大，支持多场景切换、滤镜、音频混合等。",
        tutorial: "开源软件，直接安装使用。",
        history_versions: [
            { ver: "30.1.2", date: "2024-01-15", size: "120 MB", link: "#" }
        ]
    },
    {
        id: 5,
        title: "Figma 桌面客户端",
        author: "Figma Inc.",
        thumb: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&q=80",
        platform: "Windows / macOS",
        version: "2024.1",
        size: "180 MB",
        downloads: 2800,
        views: 7200,
        category: "UI设计",
        license: "免费",
        description: "Figma 是基于浏览器的协作式界面设计工具。此版本为桌面封装版，支持离线字体和本地Tab管理。",
        tutorial: "免费软件，登录账号即可使用。",
        history_versions: [
            { ver: "2024.1", date: "2024-02-20", size: "180 MB", link: "#" }
        ]
    },
    {
        id: 6,
        title: "Visual Studio Code",
        author: "Microsoft",
        thumb: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&q=80",
        platform: "全平台",
        version: "1.86",
        size: "90 MB",
        downloads: 12000,
        views: 35000,
        category: "开发工具",
        license: "免费",
        description: "轻量级但功能强大的源代码编辑器，支持几乎所有主流编程语言，拥有丰富的插件生态。",
        tutorial: "免费开源，直接安装。",
        history_versions: [
            { ver: "1.86", date: "2024-02-01", size: "90 MB", link: "#" }
        ]
    }
];

// 渲染函数
function renderSoftwarePage() {
    return `
    <div class="software-module-container">
        <div class="software-toolbar">
            <div class="software-nav">
                <div class="nav-item active">全部</div>
                <div class="nav-item">开发工具</div>
                <div class="nav-item">设计工具</div>
                <div class="nav-item">3D建模</div>
                <div class="nav-item">直播录制</div>
            </div>

            <div class="software-search">
                <div class="search-wrapper">
                    <i class="search-icon">🔍</i>
                    <input type="text" class="search-input" placeholder="搜索软件资源...">
                    <select class="platform-filter">
                        <option>所有平台</option>
                        <option>Windows</option>
                        <option>macOS</option>
                        <option>Linux</option>
                    </select>
                </div>
            </div>
        </div>

        <div class="software-list" id="softwareList">
            ${renderSoftwareCards(SOFTWARE_RESOURCES)}
        </div>

        <div class="soft-modal-overlay" id="softDetailModal">
            <div class="soft-modal">
                <button class="modal-close" onclick="SoftwareApp.closeModal()">×</button>
                
                <div class="soft-modal-header">
                    <div class="soft-cover-wrap">
                        <img id="sThumb" src="" alt="Cover">
                    </div>
                    <div class="soft-header-info">
                        <div class="soft-badges">
                            <span class="badge-cat" id="sCategory">Category</span>
                            <span class="badge-lic" id="sLicense">License</span>
                        </div>
                        <h2 id="sTitle">Software Title</h2>
                        <p class="soft-author">By <span id="sAuthor">Author</span></p>
                        <div class="soft-stats-row">
                            <span>👁 <span id="sViews">0</span></span>
                            <span>⬇ <span id="sDownloads">0</span></span>
                            <span>💾 <span id="sSize">0MB</span></span>
                        </div>
                    </div>
                </div>

                <div class="soft-modal-body custom-scroll">
                    <div class="soft-content-grid">
                        <div class="soft-main-col">
                            <div class="soft-section">
                                <h3>📝 软件介绍</h3>
                                <p id="sDesc" class="text-block">Description goes here...</p>
                            </div>
                            
                            <div class="soft-section">
                                <h3>🛠 安装与破解教程</h3>
                                <div class="tutorial-box">
                                    <pre id="sTutorial">Tutorial steps...</pre>
                                </div>
                            </div>
                        </div>

                        <div class="soft-side-col">
                            <div class="download-panel">
                                <h3>🚀 下载中心</h3>
                                <div class="version-list" id="sVersionList">
                                    </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <script>
            // 注入数据
            const SOFT_DATA = ${JSON.stringify(SOFTWARE_RESOURCES)};

            const SoftwareApp = {
                // 初始化
                init: function() {
                    // 导航点击逻辑
                    document.querySelectorAll('.nav-item').forEach(item => {
                        item.addEventListener('click', function() {
                            document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
                            this.classList.add('active');
                            // 这里可以添加筛选逻辑
                        });
                    });

                    // 遮罩点击关闭
                    document.getElementById('softDetailModal').addEventListener('click', (e) => {
                        if(e.target.id === 'softDetailModal') this.closeModal();
                    });
                },

                // 打开详情页
                openModal: function(id) {
                    const item = SOFT_DATA.find(d => d.id == id);
                    if(!item) return;

                    // 填充头部信息
                    document.getElementById('sThumb').src = item.thumb;
                    document.getElementById('sTitle').innerText = item.title;
                    document.getElementById('sAuthor').innerText = item.author;
                    document.getElementById('sCategory').innerText = item.category;
                    document.getElementById('sLicense').innerText = item.license;
                    document.getElementById('sViews').innerText = item.views;
                    document.getElementById('sDownloads').innerText = item.downloads;
                    document.getElementById('sSize').innerText = item.size;

                    // 填充介绍与教程
                    document.getElementById('sDesc').innerText = item.description || "暂无介绍";
                    document.getElementById('sTutorial').innerText = item.tutorial || "直接安装即可。";

                    // 渲染版本列表
                    const verList = document.getElementById('sVersionList');
                    if (item.history_versions && item.history_versions.length > 0) {
                        verList.innerHTML = item.history_versions.map(v => \`
                            <div class="version-item">
                                <div class="v-info">
                                    <span class="v-num">v\${v.ver}</span>
                                    <span class="v-date">\${v.date}</span>
                                </div>
                                <div class="v-action">
                                    <span class="v-size">\${v.size}</span>
                                    <a href="\${v.link}" class="v-btn" onclick="alert('开始下载 \${item.title} v\${v.ver}')">下载</a>
                                </div>
                            </div>
                        \`).join('');
                    } else {
                         verList.innerHTML = \`
                            <div class="version-item">
                                <div class="v-info"><span class="v-num">v\${item.version}</span></div>
                                <div class="v-action">
                                    <span class="v-size">\${item.size}</span>
                                    <a href="#" class="v-btn" onclick="alert('开始下载')">下载</a>
                                </div>
                            </div>
                        \`;
                    }

                    // 显示模态框
                    document.getElementById('softDetailModal').classList.add('active');
                },

                closeModal: function() {
                    document.getElementById('softDetailModal').classList.remove('active');
                }
            };

            SoftwareApp.init();
        </script>
    </div>
    `;
}

// 渲染软件卡片 (列表页)
function renderSoftwareCards(items) {
    return items.map(item => `
        <div class="software-card" onclick="SoftwareApp.openModal(${item.id})">
            <div class="card-left">
                <div class="card-thumb">
                    <img src="${item.thumb}" alt="${item.title}" loading="lazy">
                    <div class="license-badge ${item.license === '开源' ? 'open-source' : item.license === '免费' ? 'free' : 'commercial'}">
                        ${item.license}
                    </div>
                </div>
            </div>
            <div class="card-body">
                <div class="card-header">
                    <h3 class="card-title">${item.title}</h3>
                    <span class="card-version">v${item.version}</span>
                </div>
                <div class="card-meta">
                    <span class="meta-item">👤 ${item.author}</span>
                    <span class="meta-item">📦 ${item.category}</span>
                    <span class="meta-item">💻 ${item.platform}</span>
                </div>
                <p class="card-desc">点击查看详情、历史版本及安装教程...</p>
                <div class="card-footer">
                    <div class="card-stats">
                        <span>💾 ${item.size}</span>
                        <span>👁 ${formatNumber(item.views)}</span>
                        <span>⬇ ${formatNumber(item.downloads)}</span>
                    </div>
                    <button class="detail-btn">查看详情</button>
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
        id: 'software',
        name: '软件工具',
    },
    routes: [
        {
            method: 'GET',
            path: '/',
            handler: (req, res) => {
                const content = renderSoftwarePage();
                res.send(render({ 
                    title: '软件工具 - JackyRoom', 
                    content: content, 
                    currentModule: 'software',
                    extraHead: '<link rel="stylesheet" href="/modules/software/software.css">'
                }));
            }
        }
    ]
};