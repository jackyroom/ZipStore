const { render } = require('../../core/layout-engine');
const fs = require('fs');
const path = require('path');

module.exports = {
    meta: {
        id: 'plugins',
        name: '插件中心'
    },
    routes: [
        {
            method: 'get',
            path: '/',
            handler: (req, res) => {
                // 页面主要 HTML 结构
                const content = `
                    <div class="plugin-layout">
                        <!-- 左侧侧边栏 -->
                        <div class="plugin-sidebar">
                            <div class="ps-header">
                                <h2>插件中心</h2>
                            </div>
                            
                            <div class="ps-search">
                                <i class="fa-solid fa-magnifying-glass"></i>
                                <input type="text" placeholder="搜索插件..." id="pluginSearchInput" onkeyup="pluginApp.search(this.value)">
                            </div>

                            <div class="ps-nav">
                                <div class="ps-nav-item active" onclick="pluginApp.filterCategory('all', this)">
                                    <i class="fa-solid fa-border-all"></i> 全部
                                </div>
                                <div class="ps-nav-item" onclick="pluginApp.filterCategory('installed', this)">
                                    <i class="fa-solid fa-circle-check"></i> 已安装
                                </div>
                                <div class="ps-nav-item" onclick="pluginApp.filterCategory('pending', this)" id="nav-pending" style="display:none">
                                    <i class="fa-solid fa-hourglass-half"></i> 待审核
                                </div>
                                <div style="height:1px; background:rgba(255,255,255,0.1); margin:8px 16px;"></div>
                                <div class="ps-nav-item" onclick="pluginApp.filterCategory('production', this)">
                                    <i class="fa-solid fa-bolt"></i> 生产效率
                                </div>
                                <div class="ps-nav-item" onclick="pluginApp.filterCategory('compression', this)">
                                    <i class="fa-solid fa-file-zipper"></i> 转档压缩
                                </div>
                                <div class="ps-nav-item" onclick="pluginApp.filterCategory('document-writing', this)">
                                    <i class="fa-solid fa-file-lines"></i> 文档编写
                                </div>
                                <div class="ps-nav-item" onclick="pluginApp.filterCategory('coding', this)">
                                    <i class="fa-solid fa-code"></i> 代码编写
                                </div>
                                <div class="ps-nav-item" onclick="pluginApp.filterCategory('editor', this)">
                                    <i class="fa-regular fa-image"></i> 图片编辑
                                </div>
                                <div class="ps-nav-item" onclick="pluginApp.filterCategory('video', this)">
                                    <i class="fa-solid fa-video"></i> 视频相关
                                </div>
                                <div class="ps-nav-item" onclick="pluginApp.filterCategory('downloader', this)">
                                    <i class="fa-solid fa-download"></i> 下载器
                                </div>
                                <div class="ps-nav-item" onclick="pluginApp.filterCategory('format', this)">
                                    <i class="fa-solid fa-file-code"></i> 格式扩展
                                </div>
                                <div class="ps-nav-item" onclick="pluginApp.filterCategory('ai-tools', this)">
                                    <i class="fa-solid fa-robot"></i> AI 工具
                                </div>
                                <div class="ps-nav-item" onclick="pluginApp.filterCategory('checker', this)">
                                    <i class="fa-solid fa-stethoscope"></i> 检查器
                                </div>
                                <div class="ps-nav-item" onclick="pluginApp.filterCategory('other', this)">
                                    <i class="fa-solid fa-ellipsis"></i> 其他
                                </div>
                            </div>

                            <div class="ps-footer">
                                <div class="ps-nav-item" onclick="pluginApp.showUpdates()">
                                    <i class="fa-solid fa-rotate"></i> 待更新
                                    <span class="badge" id="updateCount" style="display:none">0</span>
                                </div>
                                <div class="ps-nav-item" onclick="document.getElementById('zipInput').click()">
                                    <i class="fa-solid fa-file-import"></i> 导入插件 (.zip)
                                    <input type="file" id="zipInput" accept=".zip" style="display:none" onchange="pluginApp.importFromZip(this)">
                                </div>
                            </div>
                        </div>

                        <!-- 右侧内容区 -->
                        <div class="plugin-content">
                            <!-- 插件列表 -->
                            <div class="plugin-list" id="pluginList">
                                <!-- 动态生成 -->
                            </div>
                        </div>

                        <!-- 插件详细信息模态框 (New) -->
                        <div id="plugin-details-modal" class="modal-backdrop" style="display:none;">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <h3 id="details-title">插件详情</h3>
                                    <button class="close-btn" onclick="pluginApp.closeDetails()">×</button>
                                </div>
                                <div class="modal-body" id="details-body" style="padding:0;">
                                    <!-- 动态注入 Split Layout -->
                                </div>
                            </div>
                        </div>

                        <!-- 插件运行模态框 (Existing) -->
                        <div id="plugin-runner-modal" class="modal-backdrop" style="display:none;">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <h3 id="runner-title">插件运行</h3>
                                    <button class="close-btn" onclick="pluginApp.closeRunner()">×</button>
                                </div>
                                <div class="modal-body" id="runner-body">
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 引入 JSZip 用于解压 -->
                    <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
                    <!-- 引入本模块专用的客户端逻辑 -->
                    <script src="/modules/plugins/plugin-center.js"></script>
                `;

                // 使用布局引擎渲染
                res.send(render({
                    title: '插件中心',
                    content: content,
                    currentModule: 'plugins',
                    extraHead: '<link rel="stylesheet" href="/modules/plugins/plugins.css">'
                }));
            }
        },
        {
            method: 'get',
            path: '/list',
            handler: (req, res) => {
                try {
                    const pluginsDir = path.join(__dirname, 'plugins');
                    const entries = fs.readdirSync(pluginsDir, { withFileTypes: true });
                    const catalog = [];
                    const implMap = {};

                    entries.forEach(entry => {
                        if (!entry.isDirectory()) return;
                        const id = entry.name;
                        const pluginPath = path.join(pluginsDir, id);
                        const manifestPath = path.join(pluginPath, 'manifest.json');

                        let manifest = null;
                        if (fs.existsSync(manifestPath)) {
                            try {
                                manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
                            } catch (e) {
                                console.warn(`[plugins] manifest parse failed for ${id}:`, e);
                            }
                        }

                        const safe = (v, d) => (v === undefined || v === null ? d : v);
                        const toPascal = (str) => str.replace(/(^|[-_])(\\w)/g, (_, __, c) => c.toUpperCase());

                        const fallbackCatalog = {
                            id,
                            name: manifest?.name || id,
                            desc: manifest?.desc || '',
                            version: manifest?.version || '1.0.0',
                            author: manifest?.author || 'User',
                            downloads: manifest?.downloads || '0',
                            category: manifest?.category || 'other',
                            iconType: manifest?.iconType || 'text',
                            iconVal: manifest?.iconVal || '📦',
                            installed: safe(manifest?.installed, true),
                            status: manifest?.status || 'published',
                            changelog: manifest?.changelog || []
                        };

                        const js = manifest?.js || `/modules/plugins/plugins/${id}/${id}.js`;
                        const css = manifest?.css || `/modules/plugins/plugins/${id}/${id}.css`;
                        const renderName = manifest?.render || toPascal(id.replace(/[^a-zA-Z0-9]/g, ''));

                        catalog.push(fallbackCatalog);
                        implMap[id] = { js, css, render: renderName };
                    });

                    res.json({ catalog, implMap });
                } catch (err) {
                    console.error('[plugins] list error', err);
                    res.status(500).json({ catalog: [], implMap: {} });
                }
            }
        }
    ]
};