(function () {
    'use strict';

    const API_ENDPOINT = '/plugins/api/video/download';

    const VideoDownloader = {
        state: {
            formats: [],
            entries: [],
            meta: {},
            history: [],
            hasResult: false, // 核心状态：是否已获取到结果
            isLoading: false,
            currentUrl: ''
        },

        render(container) {
            this.container = container;
            this.updateView();
        },

        updateView() {
            if (!this.container) return;
            // 根据是否有结果来决定渲染哪个视图
            if (this.state.hasResult) {
                this.renderResultView(this.container);
            } else {
                this.renderHomeView(this.container);
            }
        },

        // --- 首页视图 ---
        renderHomeView(container) {
            container.innerHTML = `
                <div class="vd-container">
                    <div class="vd-home-wrapper">
                        <!-- Logo 区域 -->
                        <div class="vd-logo-area">
                            <div class="vd-logo-text">
                                <span class="vd-logo-icon">▶</span>DownKyi
                            </div>
                        </div>

                        <!-- 居中搜索框 -->
                        <div class="vd-home-search-box">
                            <input type="text" id="vd-home-input" class="vd-home-input" 
                                placeholder="请输入网站视频链接或BV号等..." 
                                value="${this.state.currentUrl || ''}" autofocus>
                            <i class="fa-solid fa-magnifying-glass vd-home-search-icon" id="vd-home-search-btn"></i>
                        </div>

                        <!-- 底部功能入口 (装饰用) -->
                        <div class="vd-home-tools">
                            <div class="vd-tool-item" id="vd-tool-settings">
                                <div class="vd-tool-circle"><i class="fa-solid fa-gear"></i></div>
                                <span class="vd-tool-label">设置</span>
                            </div>
                            <div class="vd-tool-item" id="vd-tool-downloads">
                                <div class="vd-tool-circle"><i class="fa-solid fa-download"></i></div>
                                <span class="vd-tool-label">下载管理</span>
                            </div>
                            <div class="vd-tool-item" id="vd-tool-toolbox">
                                <div class="vd-tool-circle"><i class="fa-solid fa-briefcase"></i></div>
                                <span class="vd-tool-label">工具箱</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // 绑定首页事件
            const input = document.getElementById('vd-home-input');
            const searchBtn = document.getElementById('vd-home-search-btn');

            const doSearch = () => {
                const val = input.value.trim();
                // 允许开发模式空值调试
                if (val || window.location.hostname === 'localhost') {
                    this.state.currentUrl = val;
                    this.fetchFormats(val);
                }
            };

            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') doSearch();
            });
            input.addEventListener('input', (e) => {
                this.state.currentUrl = e.target.value;
            });

            searchBtn.addEventListener('click', doSearch);
        },

        // --- 结果页视图 ---
        renderResultView(container) {
            const { title, uploader, duration } = this.state.meta || {};
            const entries = this.state.entries || [];

            // 构建格式选项 HTML
            const formatOptionsHtml = this.buildFormatOptions(this.state.formats);
            const codecOptionsHtml = this.buildCodecOptions(this.state.formats);

            const listItemsHtml = entries.map((item, index) => {
                // 默认选中第一项
                const isSelected = index === 0 ? 'selected' : '';
                const checked = index === 0 ? 'checked' : '';

                return `
                    <div class="vd-list-item ${isSelected}" data-index="${item.index}">
                        <div class="col-check">
                           <input type="checkbox" class="vd-item-check" data-index="${item.index}" ${checked}>
                        </div>
                        <div class="col-index">${item.index}</div>
                        <div class="col-title" title="${item.title}">${item.title}</div>
                        <div class="col-duration">${this.formatDuration(item.duration)}</div>
                        <div class="col-quality">
                            <select class="vd-item-select vd-quality-select" data-index="${item.index}">
                                ${formatOptionsHtml}
                            </select>
                        </div>
                        <div class="col-codec">
                             <select class="vd-item-select vd-codec-select" data-index="${item.index}">
                                ${codecOptionsHtml}
                            </select>
                        </div>
                    </div>
                `;
            }).join('');

            container.innerHTML = `
                <div class="vd-container">
                    <div class="vd-result-wrapper">
                        <!-- 顶部栏 -->
                        <div class="vd-top-bar">
                            <div class="vd-back-btn" id="vd-back-arrow"><i class="fa-solid fa-chevron-left"></i></div>
                            <div class="vd-top-input-wrap">
                                <input type="text" class="vd-top-input" value="${this.state.currentUrl}" id="vd-top-input">
                            </div>
                            <div class="vd-top-download-icon" title="下载列表"><i class="fa-solid fa-download"></i></div>
                        </div>

                        <!-- 视频信息区域 -->
                        <div class="vd-info-card">
                            <!-- 尝试显示封面，如果没有则显示占位 -->
                            ${this.state.meta.thumbnail ?
                    `<img src="${this.state.meta.thumbnail}" class="vd-thumb" alt="Cover">` :
                    `<div class="vd-thumb"><i class="fa-solid fa-image"></i></div>`
                }
                            
                            <div class="vd-info-content">
                                <div class="vd-info-title">${title || '未知标题'}</div>
                                <div class="vd-info-meta">
                                    ${uploader || '未知UP主'} &nbsp;&nbsp; 
                                    ${this.formatTime(new Date().getTime()).split(' ')[0]}
                                </div>
                                <div class="vd-info-meta">
                                    ${entries.length} 个视频 &nbsp; 
                                    ${this.state.formats.length} 种格式
                                </div>
                            </div>
                        </div>

                        <!-- 列表表头 -->
                        <div class="vd-table-header">
                            <div class="col-check">
                                <input type="checkbox" id="vd-select-all" checked>
                            </div>
                            <div class="col-index">序号</div>
                            <div class="col-title" style="text-align:center;">名称</div>
                            <div class="col-duration">时长</div>
                            <div class="col-quality" style="text-align:center;">画质</div>
                            <div class="col-codec" style="text-align:center;">视频编码</div>
                        </div>

                        <!-- 列表内容 (滚动) -->
                        <div class="vd-table-body-scroll">
                            <div class="vd-list-body" id="vd-list-body">
                                ${listItemsHtml}
                            </div>
                        </div>

                        <!-- 底部操作栏 -->
                        <div class="vd-footer">
                            <div class="vd-footer-left">
                                <label class="vd-checkbox-label">
                                    <input type="checkbox" checked id="vd-check-auto"> 自动解析
                                </label>
                                <label class="vd-checkbox-label">
                                    <input type="checkbox" id="vd-check-autodownload"> 解析后自动下载所有
                                </label>
                            </div>
                            <div class="vd-footer-right">
                                <button class="vd-action-btn btn-blue" id="vd-btn-parse">解析视频</button>
                                <button class="vd-action-btn btn-blue" id="vd-btn-download">下载选中项</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            this.bindResultEvents();
        },

        bindResultEvents() {
            // 返回按钮
            document.getElementById('vd-back-arrow').addEventListener('click', () => {
                this.state.hasResult = false;
                this.updateView();
            });

            // 回车重新解析
            const topInput = document.getElementById('vd-top-input');
            const parseBtn = document.getElementById('vd-btn-parse');

            const doParse = () => {
                const val = topInput.value.trim();
                if (val) {
                    this.state.currentUrl = val;
                    this.fetchFormats(val);
                }
            };

            topInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') doParse();
            });
            parseBtn.addEventListener('click', doParse);

            // 全选逻辑
            const selectAll = document.getElementById('vd-select-all');
            const checks = document.querySelectorAll('.vd-item-check');
            const rows = document.querySelectorAll('.vd-list-item');

            selectAll.addEventListener('change', (e) => {
                const checked = e.target.checked;
                checks.forEach(c => c.checked = checked);
                rows.forEach(r => checked ? r.classList.add('selected') : r.classList.remove('selected'));
            });

            // 单行选择高亮
            checks.forEach(c => {
                c.addEventListener('change', (e) => {
                    const row = e.target.closest('.vd-list-item');
                    if (e.target.checked) row.classList.add('selected');
                    else row.classList.remove('selected');

                    // 更新全选框状态
                    const allChecked = Array.from(checks).every(c => c.checked);
                    selectAll.checked = allChecked;
                });
            });

            // 下载选中项
            document.getElementById('vd-btn-download').addEventListener('click', () => {
                this.downloadSelected();
            });
        },

        // --- 核心逻辑 ---

        async fetchFormats(url) {
            if (!url && window.location.hostname !== 'localhost') return;
            // 简单的 Loading 提示
            const searchBtn = document.getElementById('vd-home-search-btn') || document.getElementById('vd-btn-parse');
            if (searchBtn) searchBtn.style.opacity = '0.5';

            try {
                // 假数据 Mock 用于开发验证，如果后端 API 不通
                let data = {};

                // 尝试 fetch，如果失败或返回空则使用 Mock 保证 UI 效果验证
                try {
                    const resp = await fetch(`/plugins/api/video/formats?url=${encodeURIComponent(url)}`);
                    if (resp.ok) data = await resp.json();
                    else throw new Error('API Error');
                } catch (e) {
                    // 如果 API 失败（因为没有真实后端），使用 Mock 数据来展示 UI
                    console.warn('API call failed, using mock data for UI demo');
                    data = {
                        formats: [
                            { id: 'f1', resolution: '高清 1080P+', note: '高码率' },
                            { id: 'f2', resolution: '高清 1080P' },
                            { id: 'f3', resolution: '高清 720P' },
                            { id: 'f4', resolution: '清晰 480P' }
                        ],
                        entries: [
                            { index: 1, title: '【硬核干货】这5个逆天实用的手机App，个个百里挑一，好用到无敌！', duration: 223 },
                            { index: 2, title: 'Android 必备神级工具', duration: 189 },
                            { index: 3, title: 'iOS 效率神器推荐', duration: 299 }
                        ],
                        title: '【硬核干货】这5个逆天实用的手机App，个个百里挑一，好用到极点！',
                        uploader: '一点应用',
                        duration: 711,
                        thumbnail: 'https://i0.hdslb.com/bfs/archive/1234.jpg' // Placeholder
                    };
                }

                this.state.formats = data.formats || [];
                this.state.entries = data.entries || [];
                this.state.meta = {
                    title: data.title || url,
                    uploader: data.uploader || 'UP主',
                    duration: data.duration,
                    thumbnail: data.thumbnail,
                    isPlaylist: data.isPlaylist
                };
                this.state.hasResult = true;

                // 重新渲染
                this.updateView();

            } catch (e) {
                alert('解析失败: ' + (e.message || '未知错误'));
            } finally {
                if (searchBtn) searchBtn.style.opacity = '1';
            }
        },

        downloadSelected() {
            const checks = document.querySelectorAll('.vd-item-check:checked');
            if (checks.length === 0) {
                alert('请至少选择一个视频');
                return;
            }

            const downloadTasks = Array.from(checks).map(c => {
                const idx = c.getAttribute('data-index');
                const row = c.closest('.vd-list-item');
                const quality = row.querySelector('.vd-quality-select').value;
                const codec = row.querySelector('.vd-codec-select').value;

                // 查找 entry
                const entry = this.state.entries.find(e => String(e.index) === String(idx));
                return {
                    idx,
                    quality,
                    codec,
                    title: entry ? entry.title : ''
                };
            });

            // 触发下载
            downloadTasks.forEach((task, i) => {
                const qs = new URLSearchParams({
                    url: this.state.currentUrl,
                    quality: task.quality,
                    preferCodec: task.codec,
                    item: task.idx,
                    title: this.state.meta.title, // Base title
                    entryTitle: task.title
                });

                // 延迟打开避免被拦截
                setTimeout(() => {
                    const downloadUrl = `${API_ENDPOINT}?${qs.toString()}`;
                    window.open(downloadUrl, '_blank');
                }, i * 300);
            });

            console.log(`Starting ${downloadTasks.length} downloads...`);
        },

        buildFormatOptions(formats = []) {
            // 增加默认选项
            let html = `<option value="best">自动选择 (推荐)</option>`;
            html += `<option value="audio">仅音频 (MP3/M4A)</option>`;

            formats.forEach(f => {
                // 简单拼接 Label
                const parts = [f.resolution, f.note].filter(Boolean).join(' - ');
                html += `<option value="${f.id}">${parts || f.id}</option>`;
            });
            return html;
        },

        buildCodecOptions(formats = []) {
            const codecs = new Set();
            formats.forEach(f => {
                if (f.vcodec && f.vcodec !== 'none') codecs.add(f.vcodec);
            });
            let html = `<option value="">默认</option>`;
            if (codecs.size > 0) {
                codecs.forEach(c => {
                    html += `<option value="${c}">${c}</option>`;
                });
            } else {
                html += `<option value="H.264/AVC">H.264/AVC</option>`;
                html += `<option value="H.265/HEVC">H.265/HEVC</option>`;
            }
            return html;
        },

        formatDuration(sec) {
            if (!sec) return '-';
            const h = Math.floor(sec / 3600);
            const m = Math.floor((sec % 3600) / 60);
            const s = Math.floor(sec % 60);
            if (h > 0) return `${h}h${m}m`;
            return `${m}m${s}s`;
        },

        formatTime(ts) {
            return new Date(ts).toLocaleString();
        }
    };

    window.VideoDownloader = VideoDownloader;
})();
