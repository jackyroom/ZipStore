/**
 * 插件中心核心逻辑
 * 管理插件的安装、存储、运行以及具体插件的业务逻辑
 */

// 1. 插件仓库数据 (模拟在线数据)
const PLUGIN_CATALOG = [
    {
        id: 'batch-renamer',
        name: '📁 批量文件重命名',
        version: '1.0.2',
        description: '快速修改大量本地文件的名称。支持正则表达式替换、前缀后缀添加。完全离线处理。',
        icon: '📝',
        type: 'tool'
    },
    {
        id: 'image-compressor',
        name: '🖼️ 智能图片压缩',
        version: '2.1.0',
        description: '在浏览器本地压缩 PNG/JPG 图片。自定义压缩质量和尺寸，无需上传服务器，保护隐私。',
        icon: '📉',
        type: 'tool'
    },
    {
        id: 'theme-switcher',
        name: '🎨 网站主题大师',
        version: '0.9.5',
        description: '自定义网站的主色调、背景色和字体大小。支持夜间模式切换。',
        icon: '🌈',
        type: 'style'
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
    installedPlugins: [],

    init: function() {
        this.loadInstalledPlugins();
        this.updateStorageInfo();
        this.renderStore();
        this.renderLibrary();
        this.checkUrlParams();
    },

    // 从 LocalStorage 加载已安装信息
    loadInstalledPlugins: function() {
        const stored = localStorage.getItem('my_plugins');
        if (stored) {
            this.installedPlugins = JSON.parse(stored);
        } else {
            // 默认无安装
            this.installedPlugins = [];
        }
    },

    // 切换标签页
    switchTab: function(tabName) {
        document.querySelectorAll('.plugin-view').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
        
        document.getElementById(`view-${tabName}`).classList.add('active');
        // 简单处理按钮激活态，实际应根据index查找
        const btns = document.querySelectorAll('.tab-btn');
        if(tabName === 'store') btns[0].classList.add('active');
        else btns[1].classList.add('active');
    },

    // 渲染商店
    renderStore: function() {
        const grid = document.getElementById('store-grid');
        grid.innerHTML = '';
        
        PLUGIN_CATALOG.forEach(plugin => {
            // 检查是否安装
            const isInstalled = this.installedPlugins.find(p => p.id === plugin.id);
            // 检查是否有更新
            const hasUpdate = isInstalled && isInstalled.version !== plugin.version;

            let btnHtml = '';
            if (!isInstalled) {
                btnHtml = `<button class="btn-install" onclick="pluginApp.install('${plugin.id}')">安装</button>`;
            } else if (hasUpdate) {
                btnHtml = `<button class="btn-update" onclick="pluginApp.install('${plugin.id}')">更新 (v${plugin.version})</button>`;
            } else {
                btnHtml = `<button class="btn-open" disabled style="background:#ccc; cursor:default">已安装最新版</button>`;
            }

            const card = document.createElement('div');
            card.className = 'plugin-card';
            card.innerHTML = `
                <div class="card-icon">${plugin.icon}</div>
                <div class="card-title">${plugin.name}</div>
                <div class="card-version">v${plugin.version}</div>
                <div class="card-desc">${plugin.description}</div>
                <div class="card-actions">${btnHtml}</div>
            `;
            grid.appendChild(card);
        });
    },

    // 渲染已安装
    renderLibrary: function() {
        const grid = document.getElementById('library-grid');
        const emptyMsg = document.getElementById('empty-library-msg');
        grid.innerHTML = '';

        if (this.installedPlugins.length === 0) {
            emptyMsg.style.display = 'block';
            return;
        }
        emptyMsg.style.display = 'none';

        this.installedPlugins.forEach(plugin => {
            const card = document.createElement('div');
            card.className = 'plugin-card';
            card.innerHTML = `
                <div class="card-icon">${plugin.icon}</div>
                <div class="card-title">${plugin.name}</div>
                <div class="card-version">当前版本: v${plugin.version}</div>
                <div class="card-desc">插件已就绪，点击运行即可使用本地功能。</div>
                <div class="card-actions">
                    <button class="btn-open" onclick="pluginApp.run('${plugin.id}')">🚀 运行</button>
                    <button class="btn-uninstall" onclick="pluginApp.uninstall('${plugin.id}')">卸载</button>
                </div>
            `;
            grid.appendChild(card);
        });
    },

    // 安装/更新插件
    install: function(id) {
        const pluginData = PLUGIN_CATALOG.find(p => p.id === id);
        if (!pluginData) return;

        // 检查是否已存在（即更新）
        const idx = this.installedPlugins.findIndex(p => p.id === id);
        if (idx >= 0) {
            this.installedPlugins[idx] = pluginData; // 更新元数据
            alert(`插件 ${pluginData.name} 已更新到 v${pluginData.version}`);
        } else {
            this.installedPlugins.push(pluginData);
            alert(`插件 ${pluginData.name} 安装成功！`);
        }

        this.save();
        this.renderStore();
        this.renderLibrary();
    },

    // 卸载插件
    uninstall: function(id) {
        if(!confirm('确定要卸载此插件吗？配置可能会丢失。')) return;
        this.installedPlugins = this.installedPlugins.filter(p => p.id !== id);
        this.save();
        this.renderStore();
        this.renderLibrary();
    },

    // 保存到 LocalStorage
    save: function() {
        localStorage.setItem('my_plugins', JSON.stringify(this.installedPlugins));
        this.updateStorageInfo();
    },

    // 运行插件 (打开模态框)
    run: function(id) {
        const plugin = this.installedPlugins.find(p => p.id === id);
        if (!plugin) return;

        const modal = document.getElementById('plugin-runner-modal');
        const title = document.getElementById('runner-title');
        const body = document.getElementById('runner-body');

        title.innerText = plugin.name;
        body.innerHTML = '<div class="plugin-loading"><i class="fa-solid fa-spinner fa-spin"></i> 加载插件中...</div>';

        modal.style.display = 'flex';

        // 动态加载插件资源
        loadPluginResources(id, (PluginClass) => {
            if (PluginClass && PluginClass.render) {
                body.innerHTML = '';
                PluginClass.render(body);
            } else {
                body.innerHTML = '<div class="plugin-error"><i class="fa-solid fa-exclamation-triangle"></i> 错误：无法加载插件，请检查插件文件是否存在。</div>';
            }
        });
    },

    closeRunner: function() {
        document.getElementById('plugin-runner-modal').style.display = 'none';
    },

    // 加载自定义插件 (模拟)
    loadCustomPlugin: function() {
        const code = prompt("请输入自定义插件的JSON配置 (模拟):");
        if(code) {
            alert("自定义插件功能需进一步开发JS沙箱环境，当前仅演示标准插件。");
        }
    },

    updateStorageInfo: function() {
        // 简单估算 LocalStorage 使用量
        let total = 0;
        for(let x in localStorage) {
            if(localStorage.hasOwnProperty(x)) total += (localStorage[x].length * 2);
        }
        document.getElementById('storageInfo').innerText = `Local Storage: ${(total/1024).toFixed(2)} KB`;
    },
    
    checkUrlParams: function() {
        // 如果想支持直接链接打开某个插件，可以在这里解析 URL query
    }
};

// 启动应用
document.addEventListener('DOMContentLoaded', () => {
    pluginApp = PluginApp; // 暴露到全局以便 HTML onclick 调用
    pluginApp.init();
});

// 检查并应用之前保存的主题 (Theme Switcher 插件的持久化效果)
(function applySavedTheme(){
    try {
        const settings = JSON.parse(localStorage.getItem('user_theme_settings'));
        if(settings) {
            for(let key in settings) {
                document.documentElement.style.setProperty(key, settings[key]);
                if(key === '--bg-color') document.body.style.backgroundColor = settings[key];
            }
        }
    } catch(e){}
})();