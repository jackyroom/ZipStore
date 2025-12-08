const { render } = require('../../core/layout-engine');

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
                    <div class="plugin-container">
                        <div class="plugin-header">
                            <h2><span class="icon">🧩</span> 插件中心 (Plugin Center)</h2>
                            <p class="subtitle">扩展您的系统能力，所有处理均在本地完成，数据安全无忧。</p>
                        </div>

                        <!-- 顶部导航与操作栏 -->
                        <div class="plugin-toolbar">
                            <div class="plugin-tabs">
                                <button class="tab-btn active" onclick="pluginApp.switchTab('store')">插件商店 (Store)</button>
                                <button class="tab-btn" onclick="pluginApp.switchTab('library')">已安装 (Library)</button>
                            </div>
                            <div class="plugin-actions">
                                <button class="btn-secondary" onclick="pluginApp.loadCustomPlugin()">📂 加载自定义插件</button>
                                <span class="storage-info" id="storageInfo">Local Storage: 0KB</span>
                            </div>
                        </div>

                        <!-- 插件商店视图 -->
                        <div id="view-store" class="plugin-view active">
                            <div class="plugin-grid" id="store-grid">
                                <!-- 动态加载商店内容 -->
                                <div class="loading-spinner">加载插件目录...</div>
                            </div>
                        </div>

                        <!-- 已安装视图 -->
                        <div id="view-library" class="plugin-view">
                            <div class="plugin-grid" id="library-grid">
                                <!-- 动态加载已安装插件 -->
                            </div>
                            <div id="empty-library-msg" style="display:none; text-align:center; color:#888; margin-top:50px;">
                                您还没有安装任何插件，去商店看看吧！
                            </div>
                        </div>

                        <!-- 插件运行模态框 -->
                        <div id="plugin-runner-modal" class="modal-backdrop" style="display:none;">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <h3 id="runner-title">插件运行</h3>
                                    <button class="close-btn" onclick="pluginApp.closeRunner()">×</button>
                                </div>
                                <div class="modal-body" id="runner-body">
                                    <!-- 插件UI将渲染在这里 -->
                                </div>
                            </div>
                        </div>
                    </div>

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
        }
    ]
};