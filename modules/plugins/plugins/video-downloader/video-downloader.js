(function () {
    'use strict';

    const API_ENDPOINT = '/plugins/api/video/download'; // 后端已实现直链下载

    const VideoDownloader = {
        state: {
            formats: [],
            entries: [],
            meta: {},
            history: [],
            historyLoading: false
        },

        render(container) {
            container.innerHTML = `
                <div class="vd-container">
                    <div class="vd-card">
                        <div class="vd-badge"><i class="fa-solid fa-terminal"></i> 插件脚本 · 视频下载</div>
                        <div class="vd-title">多站点视频下载</div>
                        <div class="vd-desc">支持 bilibili / YouTube / 抖音 / 快手 等，后端需集成 yt-dlp。输入视频链接，解析分 P/列表，选择清晰度、编码后批量下载。</div>

                        <div class="vd-form">
                            <div class="vd-field">
                                <label>视频链接</label>
                                <input id="vd-url" class="vd-input" type="text" placeholder="https://www.bilibili.com/... 或 https://www.youtube.com/watch?v=..." />
                            </div>

                            <div class="vd-row">
                                <div class="vd-field" style="flex:1; min-width:220px;">
                                    <label>清晰度/格式（单视频快速下载）</label>
                                    <div style="display:flex; gap:8px; align-items:center;">
                                        <select id="vd-quality" class="vd-select" style="flex:1;">
                                            <option value="best">自动选择（带音频，推荐）</option>
                                            <option value="audio">仅音频</option>
                                        </select>
                                        <button id="vd-fetch-formats" class="vd-btn vd-secondary" style="white-space:nowrap;">获取可用清晰度</button>
                                    </div>
                                    <small id="vd-format-hint" class="vd-result" style="display:block; margin-top:6px; text-align:left;"></small>
                                </div>
                                <div class="vd-field" style="flex:1; min-width:180px;">
                                    <label>字幕</label>
                                    <select id="vd-subtitles" class="vd-select">
                                        <option value="none">不下载字幕</option>
                                        <option value="srt">SRT</option>
                                        <option value="vtt">VTT</option>
                                    </select>
                                </div>
                            </div>

                            <div class="vd-row">
                                <label class="vd-checkbox">
                                    <input id="vd-embed-sub" type="checkbox" />
                                    内嵌字幕（若格式支持）
                                </label>
                                <label class="vd-checkbox">
                                    <input id="vd-audio-only" type="checkbox" />
                                    仅提取音频 (mp3/m4a)
                                </label>
                            </div>

                            <div class="vd-actions">
                                <button id="vd-start" class="vd-btn"><i class="fa-solid fa-download"></i> 开始下载</button>
                                <button id="vd-reset" class="vd-btn vd-secondary"><i class="fa-solid fa-rotate-left"></i> 重置</button>
                                <span id="vd-status" class="vd-result"></span>
                            </div>
                        </div>

                        <div id="vd-meta" class="vd-meta"></div>

                        <div class="vd-table-card">
                            <div class="vd-table-head">
                                <div class="vd-table-title">分 P / 播放列表</div>
                                <div class="vd-table-actions">
                                    <label class="vd-checkbox">
                                        <input id="vd-select-all" type="checkbox" />
                                        全选
                                    </label>
                                    <span id="vd-entry-count" class="vd-entry-count">等待解析...</span>
                                </div>
                            </div>
                            <div class="vd-table-scroll">
                                <table class="vd-table">
                                    <thead>
                                        <tr>
                                            <th style="width:54px;">序号</th>
                                            <th>名称</th>
                                            <th style="width:110px;">时长</th>
                                            <th style="width:190px;">画质</th>
                                            <th style="width:140px;">视频编码</th>
                                            <th style="width:90px;">操作</th>
                                        </tr>
                                    </thead>
                                    <tbody id="vd-table-body">
                                        <tr><td colspan="6" class="vd-empty">请输入链接后自动解析，支持批量下载</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div class="vd-table-card">
                            <div class="vd-table-head">
                                <div class="vd-table-title">下载记录 / 历史搜索</div>
                                <div class="vd-table-actions" style="gap:8px; flex-wrap:wrap;">
                                    <input id="vd-history-input" class="vd-input vd-mini-input" placeholder="按链接或标题搜索历史..." style="width:220px;" />
                                    <button id="vd-history-search-btn" class="vd-btn vd-secondary vd-ghost">搜索</button>
                                    <button id="vd-history-refresh" class="vd-btn vd-secondary vd-ghost">刷新</button>
                                </div>
                            </div>
                            <div class="vd-table-scroll history-scroll">
                                <div id="vd-history-loading" class="vd-loading">加载中...</div>
                                <table class="vd-table">
                                    <thead>
                                        <tr>
                                            <th style="width:48px;">序号</th>
                                            <th>视频标题</th>
                                            <th style="width:140px;">分 P / 质量</th>
                                            <th style="width:140px;">编码/字幕</th>
                                            <th style="width:120px;">时间</th>
                                            <th style="width:120px;">链接</th>
                                        </tr>
                                    </thead>
                                    <tbody id="vd-history-body">
                                        <tr><td colspan="6" class="vd-empty">暂无历史记录</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div class="vd-warning">
                            提示：需在后端实现 <code>${API_ENDPOINT}</code>，调用 <code>yt-dlp</code> 完成实际下载；若需要高码率/大会员专属清晰度，请在浏览器登录后使用 cookies（可通过浏览器导出 cookies 提供给 yt-dlp）。 
                        </div>
                    </div>
                </div>
            `;

            this.bindEvents();
        },

        bindEvents() {
            const startBtn = document.getElementById('vd-start');
            const resetBtn = document.getElementById('vd-reset');
            startBtn.addEventListener('click', () => this.handleSubmit());
            resetBtn.addEventListener('click', () => this.reset());

            const fetchBtn = document.getElementById('vd-fetch-formats');
            if (fetchBtn) fetchBtn.addEventListener('click', () => this.fetchFormats(false));

            const urlInput = document.getElementById('vd-url');
            if (urlInput) {
                let timer = null;
                urlInput.addEventListener('input', () => {
                    if (timer) clearTimeout(timer);
                    const v = (urlInput.value || '').trim();
                    if (!v) return;
                    timer = setTimeout(() => this.fetchFormats(true), 800);
                });
                urlInput.addEventListener('blur', () => {
                    const v = (urlInput.value || '').trim();
                    if (!v) return;
                    this.fetchFormats(true);
                });
            }

            const historySearchBtn = document.getElementById('vd-history-search-btn');
            const historyRefreshBtn = document.getElementById('vd-history-refresh');
            const historyInput = document.getElementById('vd-history-input');
            if (historySearchBtn) historySearchBtn.addEventListener('click', () => this.fetchHistory(historyInput.value));
            if (historyRefreshBtn) historyRefreshBtn.addEventListener('click', () => this.fetchHistory(historyInput.value));
            if (historyInput) {
                historyInput.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') this.fetchHistory(historyInput.value);
                });
            }

            // 初次渲染后拉取历史
            this.fetchHistory();
        },

        reset() {
            document.getElementById('vd-url').value = '';
            this.resetQualityOptions();
            document.getElementById('vd-subtitles').value = 'none';
            document.getElementById('vd-embed-sub').checked = false;
            document.getElementById('vd-audio-only').checked = false;
            this.setStatus('');
            const hint = document.getElementById('vd-format-hint');
            if (hint) hint.textContent = '';
            this.state = { formats: [], entries: [], meta: {} };
            this.renderMeta();
            this.renderEntries();
        },

        resetQualityOptions() {
            const select = document.getElementById('vd-quality');
            if (!select) return;
            select.innerHTML = `
                <option value="best">自动选择（带音频，推荐）</option>
                <option value="audio">仅音频</option>
            `;
        },

        setStatus(msg, type = '') {
            const el = document.getElementById('vd-status');
            if (!el) return;
            el.className = 'vd-result';
            if (type === 'success') el.classList.add('vd-success');
            if (type === 'error') el.classList.add('vd-error');
            el.innerHTML = msg || '';
        },

        async fetchFormats(isAuto = false) {
            const url = (document.getElementById('vd-url').value || '').trim();
            const hint = document.getElementById('vd-format-hint');
            if (!url) {
                if (!isAuto) this.setStatus('请输入视频链接', 'error');
                return;
            }
            const btn = document.getElementById('vd-fetch-formats');
            if (btn) btn.disabled = true;
            if (!isAuto) {
                this.setStatus('<i class="fa-solid fa-spinner fa-spin"></i> 正在获取清晰度、分 P 信息...', '');
                if (hint) hint.textContent = '';
            }

            try {
                const resp = await fetch(`/plugins/api/video/formats?url=${encodeURIComponent(url)}`);
                const data = await resp.json();
                if (!resp.ok) throw new Error(data.error || '获取格式失败');
                const formats = data.formats || [];
                this.state = {
                    formats,
                    entries: data.entries || [],
                    meta: {
                        title: data.title || '',
                        uploader: data.uploader || '',
                        duration: data.duration,
                        isPlaylist: data.isPlaylist
                    }
                };
                this.fillQualitySelect(formats);
                this.renderMeta();
                this.renderEntries();
                if (!isAuto) {
                    this.setStatus(`已加载可用清晰度 ${formats.length} 条，分 P 数 ${this.state.entries.length || 1}。`, 'success');
                }
                if (hint) hint.textContent = formats.length ? '如下载失败，可尝试切换其他清晰度或编码。' : '未获取到清晰度信息，可能是链接或站点限制。';
            } catch (e) {
                if (!isAuto) {
                    this.setStatus(e.message || '获取格式失败', 'error');
                    if (hint) hint.textContent = '';
                }
            } finally {
                if (btn) btn.disabled = false;
            }
        },

        fillQualitySelect(formats) {
            this.resetQualityOptions();
            const select = document.getElementById('vd-quality');
            if (!select) return;
            formats.forEach((f) => {
                const labelParts = [];
                if (f.resolution) labelParts.push(f.resolution);
                if (f.fps) labelParts.push(`${f.fps}fps`);
                if (f.vcodec) labelParts.push(f.vcodec);
                if (f.acodec && f.acodec !== 'none') labelParts.push('含音频');
                const label = `${f.id} | ${labelParts.join(' / ') || '未知'}` + (f.note ? ` | ${f.note}` : '');
                const opt = document.createElement('option');
                opt.value = f.id;
                opt.textContent = label;
                select.appendChild(opt);
            });
        },

        renderMeta() {
            const wrap = document.getElementById('vd-meta');
            if (!wrap) return;
            const { title = '', uploader = '', duration } = this.state.meta || {};
            if (!title) {
                wrap.innerHTML = `<div class="vd-meta-empty">等待解析视频信息</div>`;
                return;
            }
            wrap.innerHTML = `
                <div class="vd-meta-title">${title}</div>
                <div class="vd-meta-sub">
                    ${uploader ? `<span>UP：${uploader}</span>` : ''}
                    ${duration ? `<span>时长：${this.formatDuration(duration)}</span>` : ''}
                    <span>分 P：${this.state.entries.length || 1}</span>
                </div>
            `;
        },

        renderEntries() {
            const tbody = document.getElementById('vd-table-body');
            const counter = document.getElementById('vd-entry-count');
            const selectAll = document.getElementById('vd-select-all');
            if (!tbody) return;
            const entries = Array.isArray(this.state.entries) ? this.state.entries : [];
            if (counter) counter.textContent = entries.length ? `共 ${entries.length} 个条目，可勾选批量下载` : '未解析到分 P / 列表';
            if (!entries.length) {
                tbody.innerHTML = `<tr><td colspan="6" class="vd-empty">未解析到分 P；直接使用上方“开始下载”即可</td></tr>`;
                if (selectAll) selectAll.checked = false;
                return;
            }

            const formatOptions = this.buildFormatOptions(this.state.formats);
            const codecOptions = this.buildCodecOptions(this.state.formats);

            tbody.innerHTML = entries
                .map((item) => {
                    const idx = item.index;
                    return `
                        <tr data-index="${idx}">
                            <td><label class="vd-checkbox"><input class="vd-row-select" data-index="${idx}" type="checkbox" /> P${idx}</label></td>
                            <td class="vd-title-cell">${item.title || '未命名'}</td>
                            <td>${item.duration ? this.formatDuration(item.duration) : '-'}</td>
                            <td>
                                <select id="vd-quality-${idx}" class="vd-select vd-mini">
                                    ${formatOptions}
                                </select>
                            </td>
                            <td>
                                <select id="vd-codec-${idx}" class="vd-select vd-mini">
                                    ${codecOptions}
                                </select>
                            </td>
                            <td><button class="vd-btn vd-ghost" data-index="${idx}" data-action="single-download">下载</button></td>
                        </tr>
                    `;
                })
                .join('');

            const rowCheckbox = Array.from(tbody.querySelectorAll('.vd-row-select'));
            rowCheckbox.forEach((cb) => cb.addEventListener('change', () => this.syncSelectAll()));
            if (selectAll) {
                selectAll.checked = false;
                selectAll.onclick = (e) => this.toggleSelectAll(e.target.checked);
            }

            tbody.querySelectorAll('button[data-action="single-download"]').forEach((btn) => {
                btn.addEventListener('click', () => {
                    const idx = btn.getAttribute('data-index');
                    this.triggerDownload([idx]);
                });
            });
        },

        setHistoryLoading(flag) {
            this.state.historyLoading = flag;
            const overlay = document.getElementById('vd-history-loading');
            if (overlay) overlay.style.display = flag ? 'flex' : 'none';
        },

        renderHistory() {
            const tbody = document.getElementById('vd-history-body');
            if (!tbody) return;
            const list = Array.isArray(this.state.history) ? this.state.history : [];
            if (!list.length) {
                tbody.innerHTML = `<tr><td colspan="6" class="vd-empty">暂无历史记录</td></tr>`;
                return;
            }
            tbody.innerHTML = list
                .map((item, idx) => {
                    const ts = item.ts ? this.formatTime(item.ts) : '';
                    const title = item.entryTitle || item.title || '未知标题';
                    const quality = item.quality || 'best';
                    const codec = item.preferCodec || '自动';
                    const subs = item.subtitles && item.subtitles !== 'none' ? item.subtitles : '无字幕';
                    return `
                        <tr>
                            <td>${idx + 1}</td>
                            <td class="vd-title-cell" title="${title}">${title}</td>
                            <td>${item.playlistItem ? `P${item.playlistItem}` : '单视频'} / ${quality}</td>
                            <td>${codec} / ${subs}</td>
                            <td>${ts}</td>
                            <td><a href="${item.url}" target="_blank" rel="noreferrer">打开链接</a></td>
                        </tr>
                    `;
                })
                .join('');
        },

        async fetchHistory(keyword = '') {
            this.setHistoryLoading(true);
            try {
                const resp = await fetch(`/plugins/api/video/history?keyword=${encodeURIComponent(keyword || '')}`);
                const data = await resp.json();
                if (!resp.ok) throw new Error(data.error || '读取历史失败');
                this.state.history = data.items || [];
                this.renderHistory();
            } catch (e) {
                this.setStatus(e.message || '读取历史失败', 'error');
            } finally {
                this.setHistoryLoading(false);
            }
        },

        buildFormatOptions(formats = []) {
            const base = [
                `<option value="best">自动选择（带音频）</option>`,
                `<option value="audio">仅音频</option>`
            ];
            const rest = formats
                .map((f) => {
                    const parts = [];
                    if (f.resolution) parts.push(f.resolution);
                    if (f.fps) parts.push(`${f.fps}fps`);
                    if (f.vcodec) parts.push(f.vcodec);
                    if (f.acodec && f.acodec !== 'none') parts.push('含音频');
                    const label = `${f.id} | ${parts.join(' / ') || '未知'}` + (f.note ? ` | ${f.note}` : '');
                    return `<option value="${f.id}">${label}</option>`;
                })
                .join('');
            return base.join('') + rest;
        },

        buildCodecOptions(formats = []) {
            const codecs = new Set();
            formats.forEach((f) => {
                if (f.vcodec) codecs.add(f.vcodec);
            });
            const list = Array.from(codecs);
            if (!list.length) return `<option value="">自动</option>`;
            return ['<option value="">自动</option>', ...list.map((c) => `<option value="${c}">${c}</option>`)].join('');
        },

        toggleSelectAll(checked) {
            document.querySelectorAll('.vd-row-select').forEach((cb) => {
                cb.checked = checked;
            });
        },

        syncSelectAll() {
            const selectAll = document.getElementById('vd-select-all');
            if (!selectAll) return;
            const all = Array.from(document.querySelectorAll('.vd-row-select'));
            if (!all.length) {
                selectAll.checked = false;
                return;
            }
            selectAll.checked = all.every((c) => c.checked);
        },

        formatDuration(sec) {
            if (!sec && sec !== 0) return '';
            const total = Math.max(0, Math.floor(sec));
            const h = Math.floor(total / 3600);
            const m = Math.floor((total % 3600) / 60);
            const s = total % 60;
            const mm = h ? String(m).padStart(2, '0') : String(m);
            const ss = String(s).padStart(2, '0');
            return h ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
        },

        formatTime(ts) {
            const d = new Date(ts);
            if (Number.isNaN(d.getTime())) return '';
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            const hh = String(d.getHours()).padStart(2, '0');
            const mm = String(d.getMinutes()).padStart(2, '0');
            return `${y}-${m}-${day} ${hh}:${mm}`;
        },

        async handleSubmit() {
            const url = (document.getElementById('vd-url').value || '').trim();
            if (!url) {
                this.setStatus('请输入视频链接', 'error');
                return;
            }

            const subtitles = document.getElementById('vd-subtitles').value;
            const embedSub = document.getElementById('vd-embed-sub').checked;
            const audioOnly = document.getElementById('vd-audio-only').checked;

            const entries = this.state.entries || [];
            const checked = Array.from(document.querySelectorAll('.vd-row-select:checked')).map((c) => c.getAttribute('data-index'));

            if (!entries.length) {
                const quality = document.getElementById('vd-quality').value || 'best';
                this.triggerDownload([''], { url, subtitles, embedSub, audioOnly, quality });
                return;
            }

            if (!checked.length) {
                entries.forEach((item) => checked.push(String(item.index)));
            }

            this.triggerDownload(checked, { url, subtitles, embedSub, audioOnly });
        },

        triggerDownload(indexList, options = {}) {
            const url = (document.getElementById('vd-url').value || '').trim();
            const subtitles = options.subtitles ?? (document.getElementById('vd-subtitles').value || 'none');
            const embedSub = options.embedSub ?? document.getElementById('vd-embed-sub').checked;
            const audioOnly = options.audioOnly ?? document.getElementById('vd-audio-only').checked;
            const statusList = [];
            const baseTitle = this.state?.meta?.title || '';
            const entries = Array.isArray(this.state.entries) ? this.state.entries : [];

            indexList.forEach((idx, i) => {
                const qId = idx ? `vd-quality-${idx}` : 'vd-quality';
                const cId = idx ? `vd-codec-${idx}` : '';
                const qualitySelect = document.getElementById(qId);
                const codecSelect = cId ? document.getElementById(cId) : null;
                let quality = options.quality || (qualitySelect ? qualitySelect.value : 'best');
                if (!quality) quality = 'best';
                const codec = codecSelect ? codecSelect.value : '';
                const entryTitle = idx ? (entries.find((e) => String(e.index) === String(idx))?.title || '') : '';

                const qs = new URLSearchParams({
                    url,
                    quality,
                    subtitles,
                    embedSub,
                    audioOnly,
                    item: idx || ''
                });
                if (codec) qs.append('preferCodec', codec);
                if (baseTitle) qs.append('title', baseTitle);
                if (entryTitle) qs.append('entryTitle', entryTitle);

                const downloadUrl = `${API_ENDPOINT}?${qs.toString()}`;
                try {
                    setTimeout(() => window.open(downloadUrl, '_blank'), i * 150);
                } catch (e) {
                    console.warn('自动打开下载窗口被拦截，需要手动点击');
                }
                statusList.push(idx ? `P${idx}` : '当前视频');
            });

            const link = `<a href="${API_ENDPOINT}?url=${encodeURIComponent(url)}" target="_blank" rel="noreferrer">若未自动弹窗，请手动点击下载</a>`;
            this.setStatus(`已生成 ${statusList.length} 个下载请求：${statusList.join('、')}。${link}`, 'success');
        }
    };

    window.VideoDownloader = VideoDownloader;
})();

