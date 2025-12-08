/**
 * Plugin Center Core Logic
 * Handles catalog display, filtering, and ZIP plugin imports.
 */

const PLUGIN_CATALOG = [
    {
        id: 'pinterest-finder',
        name: 'Pinterest 以图找图',
        desc: '迅速找到更多类似风格的灵感。',
        version: '1.2.0',
        author: 'Eagle Team',
        downloads: '251.4K',
        category: 'production',
        iconType: 'img',
        iconVal: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Pinterest-logo.png', // Demo icon
        installed: false
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
        installed: false
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
        installed: true
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
        installed: true
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
        installed: true
    }
];

// 2. 插件实现映射表 (映射到独立的插件文件)
const PluginImplMap = {
    'batch-renamer': {
        js: '/modules/plugins/plugins/batch-renamer.js',
        css: '/modules/plugins/plugins/batch-renamer.css',
        render: 'BatchRenamer'
    },
    'image-compressor': {
        js: '/modules/plugins/plugins/image-compressor.js',
        css: '/modules/plugins/plugins/image-compressor.css',
        render: 'ImageCompressor'
    },
    'theme-switcher': {
        js: '/modules/plugins/plugins/theme-switcher.js',
        css: '/modules/plugins/plugins/theme-switcher.css',
        render: 'ThemeSwitcher'
    }
};

// 动态加载插件资源
function loadPluginResources(pluginId, callback) {
    const pluginConfig = PluginImplMap[pluginId];
    if (!pluginConfig) {
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
        // 如果已加载，直接执行回调
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
    catalog: PLUGIN_CATALOG,
    installedPlugins: [],

    init: function () {
        this.loadInstalledPlugins();
        this.renderList();
    },

    // 从 LocalStorage 加载已安装信息
    loadInstalledPlugins: function () {
        const stored = localStorage.getItem('my_plugins');
        if (stored) {
            this.installedPlugins = JSON.parse(stored);
        } else {
            this.installedPlugins = [];
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
        // Update UI
        document.querySelectorAll('.ps-nav-item').forEach(i => i.classList.remove('active'));
        el.classList.add('active');

        this.currentCategory = cat;
        if (cat === 'all') {
            this.renderList(this.catalog);
        } else {
            const filtered = this.catalog.filter(p => p.category === cat);
            this.renderList(filtered);
        }
    },

    // 渲染列表
    renderList: function (list = this.catalog) {
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

            // Button rendering
            let btnHtml = '';
            if (p.installed) {
                btnHtml = `<button class="btn-dark" onclick="pluginApp.run('${p.id}')">运行</button>`;
            } else {
                btnHtml = `<button class="btn-blue" onclick="pluginApp.install('${p.id}')">⬇ 安装</button>`;
            }

            const item = document.createElement('div');
            item.className = 'plugin-list-item';
            item.innerHTML = `
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
                    ${btnHtml}
                </div>
            `;
            container.appendChild(item);
        });
    },

    // 安装插件
    install: function (id) {
        const p = this.catalog.find(x => x.id === id);
        if (p) {
            if (confirm(`确认安装 "${p.name}"?`)) {
                p.installed = true;
                // 保存到已安装列表
                if (!this.installedPlugins.find(ip => ip.id === id)) {
                    this.installedPlugins.push(p);
                    localStorage.setItem('my_plugins', JSON.stringify(this.installedPlugins));
                }
                this.renderList(); // Re-render to show "Run" button
            }
        }
    },

    // 运行插件
    run: function (id) {
        const p = this.catalog.find(x => x.id === id);
        if (!p) return;

        const modal = document.getElementById('plugin-runner-modal');
        const title = document.getElementById('runner-title');
        const body = document.getElementById('runner-body');

        if (!modal || !title || !body) {
            console.error('插件运行模态框元素未找到');
            return;
        }

        title.innerText = p.name;
        body.innerHTML = '<div class="plugin-loading"><i class="fa-solid fa-spinner fa-spin"></i> 加载插件中...</div>';
        modal.style.display = 'flex';

        // 动态加载插件资源
        loadPluginResources(id, (PluginClass) => {
            if (PluginClass && PluginClass.render) {
                body.innerHTML = '';
                PluginClass.render(body);
            } else {
                body.innerHTML = `<div class="plugin-error"><i class="fa-solid fa-exclamation-triangle"></i> 错误：无法加载插件 "${p.name}"，请检查插件文件是否存在。</div>`;
            }
        });
    },

    closeRunner: function () {
        const modal = document.getElementById('plugin-runner-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    },

    showUpdates: function () {
        alert("暂无更新");
    },

    // IMPORTER: Handle ZIP files
    importFromZip: function (input) {
        const file = input.files[0];
        if (!file) return;

        if (typeof JSZip === 'undefined') {
            alert('错误：JSZip 库未加载，请刷新页面重试');
            return;
        }

        console.log("Loading ZIP:", file.name);

        JSZip.loadAsync(file).then(function (zip) {
            // 1. Check for manifest/plugin.json
            const manifestFile = zip.file("plugin.json") || zip.file("manifest.json");
            if (!manifestFile) {
                alert("错误：ZIP包中未找到 plugin.json 或 manifest.json");
                return;
            }

            manifestFile.async("string").then(function (content) {
                const manifest = JSON.parse(content);
                console.log("Manifest:", manifest);

                // 2. Add to catalog
                const newPlugin = {
                    id: manifest.id || ('custom-' + Date.now()),
                    name: manifest.name || file.name,
                    desc: manifest.description || 'Imported Plugin',
                    version: manifest.version || '1.0.0',
                    author: manifest.author || 'Imported',
                    downloads: '-',
                    category: manifest.category || 'other',
                    iconType: manifest.iconType || 'text',
                    iconVal: manifest.icon || '📦',
                    installed: true
                };

                PluginApp.catalog.unshift(newPlugin); // Add to top
                PluginApp.installedPlugins.push(newPlugin);
                localStorage.setItem('my_plugins', JSON.stringify(PluginApp.installedPlugins));
                PluginApp.renderList();
                alert(`插件 "${newPlugin.name}" 导入成功！`);

                // 3. Handle Code Injection (Basic)
                const mainJs = zip.file("index.js") || zip.file("main.js");
                if (mainJs) {
                    mainJs.async("string").then(code => {
                        console.log("Injecting Custom Plugin Code...");
                        try {
                            const script = document.createElement('script');
                            script.textContent = code;
                            document.body.appendChild(script);
                        } catch (e) {
                            console.error("Plugin Init Error:", e);
                        }
                    });
                }
            });
        }, function (e) {
            alert("Error reading " + file.name + ": " + e.message);
        });
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.pluginApp = PluginApp; // Global exposure
    PluginApp.init();
});

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