/**
 * Plugin Center Core Logic
 * Handles catalog display, filtering, ZIP imports, and Details View.
 */

const PLUGIN_CATALOG = [
    {
        id: 'code-editor',
        name: '代码在线编辑',
        desc: 'HTML/CSS/JS 在线编辑与实时预览，支持代码保存与多视图切换。',
        version: '1.0.0',
        author: 'ZipStore Team',
        downloads: '0',
        category: 'coding',
        iconType: 'text',
        iconVal: '💻',
        installed: true,
        status: 'published',
        changelog: [
            { ver: '1.0.0', date: '2025-03-22', note: '仿 CodePen 风格在线编辑器发布。' }
        ]
    },
    {
        id: 'zip-memo',
        name: 'Zip 备忘录',
        desc: '类似于手机备忘录，支持Markdown、Todo、多媒体插入的可爱风格笔记应用。',
        version: '1.0.0',
        author: 'ZipStore Team',
        downloads: '0',
        category: 'document-writing',
        iconType: 'text',
        iconVal: '📝',
        installed: true,
        status: 'published',
        changelog: [
            { ver: '1.0.0', date: '2025-12-09', note: '初始版本发布。' }
        ]
    },
    {
        id: 'image-cropper',
        name: '批量图片裁切',
        desc: '支持多图批量裁切、缩放及自定义比例导出。',
        version: '1.0.0',
        author: 'ZipStore Team',
        downloads: '0',
        category: 'editor',
        iconType: 'text',
        iconVal: '✂️',
        installed: true,
        status: 'published',
        changelog: [
            { ver: '1.0.0', date: '2025-03-15', note: '初始版本发布。' }
        ]
    },
    {
        id: 'pomodoro-timer',
        name: '番茄专注时钟',
        desc: '极简风格的专注计时器，支持倒计时与时间模式，内置白噪音。',
        version: '1.0.0',
        author: 'ZipStore Team',
        downloads: '0',
        category: 'production',
        iconType: 'text',
        iconVal: '⏰',
        installed: true,
        status: 'published',
        changelog: [
            { ver: '1.0.0', date: '2025-03-20', note: '初始版本发布。' }
        ]
    },
    {
        id: 'pinterest-finder',
        name: 'Pinterest 以图找图',
        desc: '迅速找到更多类似风格的灵感。',
        version: '1.2.0',
        author: 'Eagle Team',
        downloads: '251.4K',
        category: 'production',
        iconType: 'img',
        iconVal: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Pinterest-logo.png',
        installed: false,
        status: 'published',
        changelog: [
            { ver: '1.2.0', date: '2025-01-15', note: '修复了部分图片无法识别的问题。' },
            { ver: '1.1.0', date: '2024-11-20', note: '新增批量搜索功能。' }
        ]
    },
    {
        id: 'jxl-format',
        name: 'JXL 格式扩展',
        desc: '让应用完整支持 JPEG XL (.jxl) 图像格式。',
        version: '1.0.0',
        author: 'Community',
        downloads: '5.6K',
        category: 'format',
        iconType: 'text',
        iconVal: '📷',
        installed: false,
        status: 'published',
        changelog: [
            { ver: '1.0.0', date: '2024-12-01', note: '初始版本发布。' }
        ]
    },
    {
        id: 'batch-renamer',
        name: '批量文件重命名',
        desc: '快速修改大量本地文件的名称。支持正则表达式替换。',
        version: '2.1.0',
        author: 'ZipStore',
        downloads: '14.2K',
        category: 'production',
        iconType: 'text',
        iconVal: '📝',
        installed: true,
        status: 'published',
        changelog: [
            { ver: '2.1.0', date: '2025-02-10', note: '支持正则预览。' },
            { ver: '2.0.0', date: '2025-01-05', note: '重构界面，提升性能。' }
        ]
    },
    {
        id: 'image-compressor',
        name: '智能图片压缩',
        desc: '本地压缩 PNG/JPG 图片，自定义质量。',
        version: '1.5.0',
        author: 'ZipStore',
        downloads: '21.8K',
        category: 'compression',
        iconType: 'text',
        iconVal: '📉',
        installed: true,
        status: 'published',
        changelog: [
            { ver: '1.5.0', date: '2025-03-01', note: '新增 WebP 转换支持。' }
        ]
    },
    {
        id: 'theme-switcher',
        name: '网站主题大师',
        desc: '自定义网站的主色调、背景色和字体大小。',
        version: '0.9.5',
        author: 'User',
        downloads: '41.4K',
        category: 'other',
        iconType: 'text',
        iconVal: '🎨',
        installed: true,
        status: 'published',
        changelog: [
            { ver: '0.9.5', date: '2025-02-15', note: '修复黑暗模式下的显示 bug。' }
        ]
    },
    {
        id: 'video-downloader',
        name: '视频下载',
        desc: '输入链接，一键选择分辨率、音频与字幕并下载（需后端支持 yt-dlp）。',
        version: '1.0.0',
        author: 'ZipStore',
        downloads: '0',
        category: 'plugin-scripts',
        iconType: 'text',
        iconVal: '⬇️',
        installed: true,
        status: 'published',
        changelog: [
            { ver: '1.0.0', date: '2025-12-09', note: '新增多站点视频下载脚本入口。' }
        ]
    }
];

// 2. 插件实现映射表 (映射到独立的插件文件)
const PluginImplMap = {
    'code-editor': {
        js: '/modules/plugins/plugins/code-editor/code-editor.js',
        css: '/modules/plugins/plugins/code-editor/code-editor.css',
        render: 'CodeEditor'
    },
    'zip-memo': {
        js: '/modules/plugins/plugins/zip-memo/zip-memo.js',
        css: '/modules/plugins/plugins/zip-memo/zip-memo.css',
        render: 'ZipMemo'
    },
    'batch-renamer': {
        js: '/modules/plugins/plugins/batch-renamer/batch-renamer.js',
        css: '/modules/plugins/plugins/batch-renamer/batch-renamer.css',
        render: 'BatchRenamer'
    },
    'image-compressor': {
        js: '/modules/plugins/plugins/image-compressor/image-compressor.js',
        css: '/modules/plugins/plugins/image-compressor/image-compressor.css',
        render: 'ImageCompressor'
    },
    'image-cropper': {
        js: '/modules/plugins/plugins/image-cropper/image-cropper.js',
        css: '/modules/plugins/plugins/image-cropper/image-cropper.css',
        render: 'ImageCropper'
    },
    'pomodoro-timer': {
        js: '/modules/plugins/plugins/pomodoro-timer/pomodoro-timer.js',
        css: '/modules/plugins/plugins/pomodoro-timer/pomodoro-timer.css',
        render: 'PomodoroTimer'
    },
    'theme-switcher': {
        js: '/modules/plugins/plugins/theme-switcher/theme-switcher.js',
        css: '/modules/plugins/plugins/theme-switcher/theme-switcher.css',
        render: 'ThemeSwitcher'
    },
    'video-downloader': {
        js: '/modules/plugins/plugins/video-downloader/video-downloader.js',
        css: '/modules/plugins/plugins/video-downloader/video-downloader.css',
        render: 'VideoDownloader'
    }
};

// 动态插件实现映射（来自服务器）
let DynamicPluginImplMap = {};

// 动态加载插件资源
function loadPluginResources(pluginId, callback) {
    const pluginConfig = PluginImplMap[pluginId] || DynamicPluginImplMap[pluginId];
    if (!pluginConfig) {
        // 对于 unknown 插件 (如导入的)，尝试通用加载或报错
        console.warn(`No standard config for ${pluginId}, checking custom injection...`);
        callback(null);
        return;
    }

    // 加载 CSS
    if (!document.querySelector(`link[href="${pluginConfig.css}"]`)) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = pluginConfig.css;
        document.head.appendChild(link);
    }

    // 加载 JS
    const scriptId = `plugin-${pluginId}-script`;
    if (document.getElementById(scriptId)) {
        if (window[pluginConfig.render]) {
            callback(window[pluginConfig.render]);
        }
        return;
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = pluginConfig.js;
    script.onload = () => {
        if (window[pluginConfig.render]) {
            callback(window[pluginConfig.render]);
        } else {
            console.error(`插件 ${pluginId} 未正确导出 ${pluginConfig.render}`);
            callback(null);
        }
    };
    script.onerror = () => {
        console.error(`加载插件 ${pluginId} 失败`);
        callback(null);
    };
    document.body.appendChild(script);
}

// 3. PluginApp 主控逻辑
const PluginApp = {
    currentCategory: 'all',
    catalog: [], // Merged catalog (static + dynamic)
    installedPlugins: [],
    dynamicImplMap: {},

    // 初始化
    init: async function () {
        await this.loadCatalog();
        this.renderList();
        this.checkPendingStatus();
    },

    // 加载数据 (Static + LocalStorage Pending + LocalStorage Installed status)
    loadCatalog: async function () {
        // Deep copy static catalog
        let combined = JSON.parse(JSON.stringify(PLUGIN_CATALOG));

        // 尝试获取服务器端自动发现的插件目录
        try {
            const resp = await fetch('/modules/plugins/list');
            if (resp.ok) {
                const data = await resp.json();
                if (Array.isArray(data.catalog)) {
                    // 将动态目录合并到前面，避免重复
                    data.catalog.forEach(item => {
                        if (!combined.find(x => x.id === item.id)) combined.unshift(item);
                    });
                }
                if (data.implMap) {
                    DynamicPluginImplMap = data.implMap;
                    this.dynamicImplMap = data.implMap;
                }
            }
        } catch (e) {
            console.warn('动态插件目录获取失败，继续使用静态目录', e);
        }

        // Load Pending Plugins
        const pending = JSON.parse(localStorage.getItem('plugin_pending_list') || '[]');
        pending.forEach(p => {
            // Avoid duplicates if already in static (unlikely for new imports)
            if (!combined.find(x => x.id === p.id)) {
                combined.unshift(p);
            }
        });

        // Load Installed Status Sync
        const installedIds = JSON.parse(localStorage.getItem('my_installed_ids') || '[]');

        // Sync 'installed' state
        combined.forEach(p => {
            if (installedIds.includes(p.id)) {
                p.installed = true;
            } else if (p.status !== 'pending') {
                // Ensure default compiled status is respected unless user uninstalled?
                // For simplicity: Trust localStorage 'my_installed_ids' as source of truth for dynamic actions,
                // but default static catalog `installed: true` items need to be initially accounted for if never run before.
                // Logic: If Not in 'my_installed_ids' AND Not in 'uninstalled_ids', assume default.
                // Simplified: We will just trust the `installed` flag in data for defaults, updating it if found in LS.
                // BUT better approach: Initialize `my_installed_ids` with the defaults once.
            }
        });

        // One-time init for defaults
        if (!localStorage.getItem('plugin_init_done')) {
            const defaults = combined.filter(p => p.installed).map(p => p.id);
            localStorage.setItem('my_installed_ids', JSON.stringify(defaults));
            localStorage.setItem('plugin_init_done', 'true');
        }

        // Re-read installed status from LS truth
        const finalInstalledIds = JSON.parse(localStorage.getItem('my_installed_ids') || '[]');
        combined.forEach(p => {
            p.installed = finalInstalledIds.includes(p.id);
        });

        this.catalog = combined;
        this.installedPlugins = combined.filter(p => p.installed);
    },

    checkPendingStatus: function () {
        const pendingCount = this.catalog.filter(p => p.status === 'pending').length;
        if (pendingCount > 0) {
            document.getElementById('nav-pending').style.display = 'flex';
            const badge = document.getElementById('updateCount'); // Reuse badge for notification
            // badge.style.display = 'inline-block';
            // badge.innerText = pendingCount;
        } else {
            document.getElementById('nav-pending').style.display = 'none';
        }
    },

    // 搜索过滤
    search: function (keyword) {
        const term = keyword.toLowerCase();
        const filtered = this.catalog.filter(p =>
            p.name.toLowerCase().includes(term) ||
            p.desc.toLowerCase().includes(term)
        );
        this.renderList(filtered);
    },

    // 分类过滤
    filterCategory: function (cat, el) {
        document.querySelectorAll('.ps-nav-item').forEach(i => i.classList.remove('active'));
        el.classList.add('active');
        this.currentCategory = cat;

        let filtered = [];
        if (cat === 'all') {
            filtered = this.catalog.filter(p => p.status === 'published');
        } else if (cat === 'installed') {
            filtered = this.catalog.filter(p => p.installed);
        } else if (cat === 'pending') {
            filtered = this.catalog.filter(p => p.status === 'pending');
        } else {
            filtered = this.catalog.filter(p => p.category === cat && p.status === 'published');
        }
        this.renderList(filtered);
    },

    // 渲染列表
    renderList: function (list = null) {
        if (!list) {
            // Default filter logic if no list provided (refresh)
            const cat = this.currentCategory;
            if (cat === 'all') list = this.catalog.filter(p => p.status === 'published');
            else if (cat === 'installed') list = this.catalog.filter(p => p.installed);
            else if (cat === 'pending') list = this.catalog.filter(p => p.status === 'pending');
            else list = this.catalog.filter(p => p.category === cat && p.status === 'published');
        }

        const container = document.getElementById('pluginList');
        if (!container) return;

        container.innerHTML = '';

        if (list.length === 0) {
            container.innerHTML = '<div style="text-align:center; color:#64748b; margin-top:50px;">没有找到相关插件</div>';
            return;
        }

        list.forEach(p => {
            // Icon rendering
            let iconHtml = '';
            if (p.iconType === 'img') {
                iconHtml = `<img src="${p.iconVal}" alt="icon" onerror="this.parentElement.innerHTML='📦'">`;
            } else {
                iconHtml = p.iconVal;
            }

            // Status Badge
            let tagsHtml = '';
            if (p.status === 'pending') {
                tagsHtml += '<span class="status-badge status-pending">待审核</span>';
            } else if (p.installed) {
                tagsHtml += '<span class="status-badge status-installed">已安装</span>';
            }

            // Action Button logic
            let actionBtn = '';
            if (p.status === 'pending') {
                actionBtn = `<button class="btn-dark" onclick="event.stopPropagation(); pluginApp.openDetails('${p.id}')">审核</button>`;
            } else if (p.installed) {
                actionBtn = `<button class="btn-dark" onclick="event.stopPropagation(); pluginApp.run('${p.id}')">运行</button>`;
            } else {
                actionBtn = `<button class="btn-blue" onclick="event.stopPropagation(); pluginApp.openDetails('${p.id}')">详情</button>`;
            }

            const item = document.createElement('div');
            item.className = 'plugin-list-item';
            item.onclick = () => this.openDetails(p.id); // Click whole item to open details
            item.style.cursor = 'pointer';
            item.style.position = 'relative';

            item.innerHTML = `
                ${tagsHtml}
                <div class="pli-icon">${iconHtml}</div>
                <div class="pli-info">
                    <div class="pli-header">
                        <span class="pli-name">${p.name}</span>
                        ${p.category === 'format' ? '<span class="pli-tag">格式</span>' : ''}
                    </div>
                    <div class="pli-desc">${p.desc}</div>
                </div>
                <div class="pli-meta">
                    <span><i class="fa-regular fa-user"></i> ${p.author}</span>
                    <span><i class="fa-solid fa-download"></i> ${p.downloads}</span>
                </div>
                <div class="pli-action">
                    ${actionBtn}
                </div>
            `;
            container.appendChild(item);
        });
    },

    // --- DETAILS MODAL ---

    openDetails: function (id) {
        const p = this.catalog.find(x => x.id === id);
        if (!p) return;

        const modal = document.getElementById('plugin-details-modal');
        const body = document.getElementById('details-body');
        const title = document.getElementById('details-title');

        title.innerText = p.name;

        let iconHtml = p.iconType === 'img'
            ? `<img src="${p.iconVal}" onerror="this.parentElement.innerText='📦'">`
            : p.iconVal;

        // Action Button in Sidebar
        let mainAction = '';
        if (p.status === 'pending') {
            mainAction = `
                <button class="btn-blue" onclick="pluginApp.approve('${p.id}')">✅ 通过审核</button>
                <button class="btn-uninstall" onclick="pluginApp.reject('${p.id}')">❌ 拒绝</button>
            `;
        } else if (p.installed) {
            mainAction = `
                <button class="btn-dark" onclick="pluginApp.run('${p.id}')">🚀 运行插件</button>
                <button class="btn-uninstall" onclick="pluginApp.uninstall('${p.id}')">🗑️ 卸载</button>
            `;
        } else {
            mainAction = `<button class="btn-blue" onclick="pluginApp.install('${p.id}')">⬇ 立即安装</button>`;
        }

        // Generate Changelog HTML
        let changelogHtml = '<p style="color:#64748b">暂无更新记录</p>';
        if (p.changelog && p.changelog.length > 0) {
            changelogHtml = p.changelog.map(log => `
                <div class="version-item">
                    <div class="version-header">
                        <span class="v-num">${log.ver}</span>
                        <span class="v-date">${log.date}</span>
                    </div>
                    <div class="v-changes">${log.note}</div>
                </div>
            `).join('');
        }

        // Split Layout HTML
        body.innerHTML = `
            <div class="plugin-detail-layout">
                <div class="pd-sidebar">
                    <div class="pd-icon-container">${iconHtml}</div>
                    <div class="pd-title-block">
                        <h2>${p.name}</h2>
                        <p>${p.desc}</p>
                    </div>
                    <div class="pd-actions">
                        ${mainAction}
                    </div>
                    <div class="pd-meta">
                        <div class="pd-meta-item">
                            <span class="pd-meta-label">版本</span>
                            <span class="pd-meta-value">${p.version}</span>
                        </div>
                        <div class="pd-meta-item">
                            <span class="pd-meta-label">作者</span>
                            <span class="pd-meta-value">${p.author}</span>
                        </div>
                        <div class="pd-meta-item">
                            <span class="pd-meta-label">类别</span>
                            <span class="pd-meta-value">${p.category}</span>
                        </div>
                        <div class="pd-meta-item">
                            <span class="pd-meta-label">大小</span>
                            <span class="pd-meta-value">2.4 MB</span>
                        </div>
                    </div>
                </div>
                <div class="pd-main">
                    <div class="pd-tabs">
                        <div class="pd-tab active" onclick="pluginApp.switchTab(0, this)">插件介绍</div>
                        <div class="pd-tab" onclick="pluginApp.switchTab(1, this)">版本记录</div>
                    </div>
                    <div class="pd-content-scroll">
                        <div id="tab-content-0" class="pd-section">
                            <h3>功能详情</h3>
                            <div class="pd-text">
                                <p>${p.desc}</p>
                                <p>这里可以展示更详细的插件说明...</p>
                                <ul>
                                    <li>高效 - 极速处理核心任务</li>
                                    <li>安全 - 本地处理，保护隐私</li>
                                    <li>易用 - 简洁直观的操作界面</li>
                                </ul>
                                <div class="pd-screenshot" style="height:200px; background:#1e293b; display:flex; align-items:center; justify-content:center; color:#475569;">
                                    插件预览截图占位符
                                </div>
                            </div>
                        </div>
                        <div id="tab-content-1" class="pd-section" style="display:none;">
                            <h3>更新日志</h3>
                            ${changelogHtml}
                        </div>
                    </div>
                </div>
            </div>
        `;

        modal.style.display = 'flex';
    },

    closeDetails: function () {
        document.getElementById('plugin-details-modal').style.display = 'none';
        this.renderList(); // Refresh list to reflect unexpected state changes
    },

    switchTab: function (index, el) {
        document.querySelectorAll('.pd-tab').forEach(t => t.classList.remove('active'));
        el.classList.add('active');

        document.getElementById('tab-content-0').style.display = index === 0 ? 'block' : 'none';
        document.getElementById('tab-content-1').style.display = index === 1 ? 'block' : 'none';
    },

    // --- ACTIONS ---

    install: function (id) {
        const p = this.catalog.find(x => x.id === id);
        if (p) {
            // Update Data
            p.installed = true;

            // Persist
            const currentIds = JSON.parse(localStorage.getItem('my_installed_ids') || '[]');
            if (!currentIds.includes(id)) {
                currentIds.push(id);
                localStorage.setItem('my_installed_ids', JSON.stringify(currentIds));
            }

            // If it was in this session's uninstalled list (if we had one), remove it
            // Update UI in Details Modal instantly
            this.openDetails(id);
            // Also update background list
            this.renderList();
        }
    },

    uninstall: function (id) {
        if (!confirm('确定要卸载此插件吗？')) return;

        const p = this.catalog.find(x => x.id === id);
        if (p) {
            p.installed = false;

            // Persist
            const currentIds = JSON.parse(localStorage.getItem('my_installed_ids') || '[]');
            const newIds = currentIds.filter(x => x !== id);
            localStorage.setItem('my_installed_ids', JSON.stringify(newIds));

            this.openDetails(id);
            this.renderList();
        }
    },

    // Admin Actions
    approve: function (id) {
        const p = this.catalog.find(x => x.id === id);
        if (p && p.status === 'pending') {
            p.status = 'published';

            // Update persisted pending list (remove it) and add to a hypothetical 'local_published' list if we wanted full persistence
            // For now, we just update the pending list to remove it, but we need to keep the plugin in specific local storage for 'custom plugins'

            // 1. Remove from Pending
            let pending = JSON.parse(localStorage.getItem('plugin_pending_list') || '[]');
            pending = pending.filter(x => x.id !== id);
            localStorage.setItem('plugin_pending_list', JSON.stringify(pending));

            // 2. Add to Custom Published (so it stays after refresh)
            // Note: In a real app we would POST to server. Here we just keep it in memory/localstorage as 'published'
            // To simplify, let's just update the in-memory catalog object since it's already merged.
            // But if we reload, it will disappear if we don't save it somewhere else.
            // Let's reuse 'pending' list as 'custom_plugins' but with status field.

            // Actually, let's just modify the item in the 'plugin_pending_list' (which we should rename to 'custom_plugins') to have status 'published'
            // For backward compatibility with steps, let's keep 'plugin_pending_list' but maybe write back with status='published'

            // Hack for demo: Update the pending list item to be published, but keep in storage
            // Reload logic handles this: loadCatalog loads all from 'plugin_pending_list'. 
            // So if we save it back there with status='published', it will load as published.

            p.status = 'published';

            let allCustom = JSON.parse(localStorage.getItem('plugin_pending_list') || '[]');
            const idx = allCustom.findIndex(x => x.id === id);
            if (idx >= 0) {
                allCustom[idx].status = 'published';
                localStorage.setItem('plugin_pending_list', JSON.stringify(allCustom));
            }

            alert('插件审核通过！已发布到市场。');
            this.closeDetails();
            this.checkPendingStatus();
            this.filterCategory('all', document.querySelector('.ps-nav-item')); // Go to all
        }
    },

    reject: function (id) {
        if (!confirm('拒绝并删除此插件？')) return;

        // Remove from memory
        this.catalog = this.catalog.filter(x => x.id !== id);

        // Remove from storage
        let pending = JSON.parse(localStorage.getItem('plugin_pending_list') || '[]');
        pending = pending.filter(x => x.id !== id);
        localStorage.setItem('plugin_pending_list', JSON.stringify(pending));

        this.closeDetails();
        this.checkPendingStatus();
        this.renderList();
    },

    // 运行插件
    run: function (id) {
        const p = this.catalog.find(x => x.id === id);
        if (!p) return;

        const modal = document.getElementById('plugin-runner-modal');
        const title = document.getElementById('runner-title');
        const body = document.getElementById('runner-body');

        if (!modal || !title || !body) return;

        title.innerText = p.name;
        // Reset fullscreen state logic (optional, or keep if user prefers persistence)
        modal.querySelector('.modal-content').classList.remove('fullscreen-mode');

        // Ensure fullscreen button exists
        let fsBtn = document.getElementById('runner-fs-btn');
        if (!fsBtn) {
            // Inject dynamically if not present in static HTML (assuming static HTML has a header container)
            // Or better, we assume the HTML structure allows us to append.
            // Let's rely on modifying the index.html or injecting it if missing.
            // For this specific environment, we will inject it into the header actions if we can find them.
            // But looking at previous files, I don't see the runner markup.
            // I will assume standard structure or inject into the header title area for now.
            const header = modal.querySelector('.modal-header');
            if (header) {
                // Check if actions container exists
                let actions = header.querySelector('.modal-actions');
                if (!actions) {
                    actions = document.createElement('div');
                    actions.className = 'modal-actions';
                    actions.style.display = 'flex';
                    actions.style.gap = '10px';
                    // Move close button into actions if it exists separately
                    const closeBtn = header.querySelector('.close-btn');
                    if (closeBtn) actions.appendChild(closeBtn);
                    header.appendChild(actions);
                }

                // Add fullscreen button
                fsBtn = document.createElement('button');
                fsBtn.id = 'runner-fs-btn';
                fsBtn.className = 'close-btn'; // reuse style
                fsBtn.innerHTML = '<i class="fa-solid fa-expand"></i>';
                fsBtn.onclick = () => pluginApp.toggleFullscreen();
                // Insert before close button
                actions.insertBefore(fsBtn, actions.firstChild);
            }
        }

        body.innerHTML = '<div class="plugin-loading"><i class="fa-solid fa-spinner fa-spin"></i> 加载插件中...</div>';
        modal.style.display = 'flex';

        // 动态加载插件资源
        loadPluginResources(id, (PluginClass) => {
            if (PluginClass && PluginClass.render) {
                body.innerHTML = '';
                PluginClass.render(body);
            } else {
                body.innerHTML = `<div class="plugin-error"><i class="fa-solid fa-exclamation-triangle"></i> 错误：无法加载插件 "${p.name}"，请检查资源文件。</div>`;
            }
        });
    },

    closeRunner: function () {
        document.getElementById('plugin-runner-modal').style.display = 'none';
        document.querySelector('#plugin-runner-modal .modal-content').classList.remove('fullscreen-mode');
    },

    toggleFullscreen: function () {
        const content = document.querySelector('#plugin-runner-modal .modal-content');
        content.classList.toggle('fullscreen-mode');
        const isFs = content.classList.contains('fullscreen-mode');
        const btn = document.getElementById('runner-fs-btn');
        if (btn) btn.innerHTML = isFs ? '<i class="fa-solid fa-compress"></i>' : '<i class="fa-solid fa-expand"></i>';
    },

    showUpdates: function () {
        alert("所有插件已是最新版本");
    },

    // IMPORTER: Handle ZIP files
    importFromZip: function (input) {
        const file = input.files[0];
        if (!file) return;

        if (typeof JSZip === 'undefined') {
            alert('错误：JSZip 库未加载，请刷新页面重试');
            return;
        }

        JSZip.loadAsync(file).then(function (zip) {
            // 1. Check for manifest/plugin.json
            const manifestFile = zip.file("plugin.json") || zip.file("manifest.json");
            if (!manifestFile) {
                alert("错误：ZIP包中未找到 plugin.json 或 manifest.json");
                return;
            }

            manifestFile.async("string").then(function (content) {
                const manifest = JSON.parse(content);

                // 2. Add to catalog as PENDING
                const newPlugin = {
                    id: manifest.id || ('custom-' + Date.now()),
                    name: manifest.name || file.name,
                    desc: manifest.description || 'Imported Plugin',
                    version: manifest.version || '1.0.0',
                    author: manifest.author || 'User Upload',
                    downloads: '0',
                    category: manifest.category || 'other',
                    iconType: manifest.iconType || 'text',
                    iconVal: manifest.icon || '📦',
                    installed: false,
                    status: 'pending', // WAIT FOR REVIEW
                    changelog: []
                };

                // Save to 'plugin_pending_list'
                const pending = JSON.parse(localStorage.getItem('plugin_pending_list') || '[]');
                pending.unshift(newPlugin);
                localStorage.setItem('plugin_pending_list', JSON.stringify(pending));

                // Reload
                PluginApp.loadCatalog();
                PluginApp.checkPendingStatus();

                alert(`插件 "${newPlugin.name}" 上传成功！\n请等待管理员审核 (可在“待审核”分类中查看)`);

                // Refresh view
                if (PluginApp.currentCategory === 'pending') {
                    PluginApp.renderList();
                } else {
                    document.getElementById('nav-pending').click(); // Auto switch to pending
                }
            });
        }, function (e) {
            alert("Error reading " + file.name + ": " + e.message);
        });

        // Reset input
        input.value = '';
    }
};

// Initialize
(function initPluginCenter() {
    window.pluginApp = PluginApp; // Global exposure
    
    // 参考其他模块的初始化方式（如 website/index.js）
    document.addEventListener('DOMContentLoaded', () => {
        PluginApp.init();
    });
    // 同时也尝试直接运行，防止DOMContentLoaded已过
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        PluginApp.init();
    }
})();

// 检查并应用之前保存的主题 (Theme Switcher 插件的持久化效果)
(function applySavedTheme() {
    try {
        const settings = JSON.parse(localStorage.getItem('user_theme_settings'));
        if (settings) {
            for (let key in settings) {
                document.documentElement.style.setProperty(key, settings[key]);
                if (key === '--bg-color') document.body.style.backgroundColor = settings[key];
            }
        }
    } catch (e) { }
})();