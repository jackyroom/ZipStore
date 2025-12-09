const { render } = require('../../core/layout-engine');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn, spawnSync } = require('child_process');

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
                                <div class="ps-nav-item" onclick="pluginApp.filterCategory('plugin-scripts', this)">
                                    <i class="fa-solid fa-terminal"></i> 插件脚本
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
        },
        ...createVideoRoutes()
    ]
};

// ---------- Video download backend helpers ----------

const binDir = path.join(__dirname, 'plugins', 'bin');
const ytDlpPath = path.join(binDir, os.platform() === 'win32' ? 'yt-dlp.exe' : 'yt-dlp');
const ffmpegPath = path.join(binDir, os.platform() === 'win32' ? 'ffmpeg.exe' : 'ffmpeg');
const historyFile = path.join(__dirname, 'plugins', 'video-downloader', 'history.json');

function resolveLocalBin(candidates) {
    for (const p of candidates) {
        if (p && fs.existsSync(p)) return p;
    }
    return null;
}

function resolveYtDlp() {
    // 优先插件目录
    const local = resolveLocalBin([ytDlpPath]);
    if (local) return local;

    // 其次 PATH
    const probe = spawnSync('yt-dlp', ['--version'], { stdio: 'ignore' });
    if (probe.status === 0) return 'yt-dlp';

    return null; // 不再自动下载，按用户要求离线
}

function resolveFfmpeg() {
    const local = resolveLocalBin([ffmpegPath]);
    if (local) return local;
    const probe = spawnSync('ffmpeg', ['-version'], { stdio: 'ignore' });
    if (probe.status === 0) return 'ffmpeg';
    return null;
}

function buildFormatSelector(quality, ffmpegAvailable, preferCodec) {
    // 若指定了具体 format id，则直接使用；否则统一使用“带音频的最佳可用单流”
    if (quality && quality !== 'best') return quality;
    if (preferCodec) {
        // 优先匹配指定编码的视频流，再退回通用 best
        return `bestvideo[vcodec*=${preferCodec}][acodec!=none]/bestvideo[vcodec*=${preferCodec}]+bestaudio/best[acodec!=none]/best`;
    }
    return 'best[acodec!=none]/best';
}

function ensureHistoryFile() {
    try {
        const dir = path.dirname(historyFile);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        if (!fs.existsSync(historyFile)) fs.writeFileSync(historyFile, '[]', 'utf-8');
    } catch (e) {
        console.error('[video-download] ensure history file failed', e);
    }
}

function readHistory(keyword = '') {
    ensureHistoryFile();
    try {
        const raw = fs.readFileSync(historyFile, 'utf-8');
        const arr = JSON.parse(raw || '[]');
        if (!keyword) return arr;
        const q = keyword.toLowerCase();
        return arr.filter(
            (i) =>
                (i.url || '').toLowerCase().includes(q) ||
                (i.title || '').toLowerCase().includes(q) ||
                (i.entryTitle || '').toLowerCase().includes(q)
        );
    } catch (e) {
        console.error('[video-download] read history failed', e);
        return [];
    }
}

function appendHistory(record) {
    ensureHistoryFile();
    try {
        const raw = fs.readFileSync(historyFile, 'utf-8');
        const arr = JSON.parse(raw || '[]');
        arr.unshift(record);
        const sliced = arr.slice(0, 300); // 只保留最近 300 条
        fs.writeFileSync(historyFile, JSON.stringify(sliced, null, 2), 'utf-8');
    } catch (e) {
        console.error('[video-download] append history failed', e);
    }
}

function createVideoHandler() {
    return async (req, res) => {
        const url = (req.query.url || '').trim();
        const quality = (req.query.quality || 'best').trim();
        const subtitles = (req.query.subtitles || 'none').trim();
        const embedSub = req.query.embedSub === 'true';
        const audioOnly = req.query.audioOnly === 'true' || quality === 'audio';
        const playlistItem = (req.query.item || '').trim();
        const preferCodec = (req.query.preferCodec || '').trim();
        const title = (req.query.title || '').trim();
        const entryTitle = (req.query.entryTitle || '').trim();

        if (!url) {
            return res.status(400).json({ error: '缺少 url 参数' });
        }

        const ffmpegBin = resolveFfmpeg();
        const ffmpegAvailable = !!ffmpegBin;

        let ytDlp;
        try {
            ytDlp = resolveYtDlp();
            if (!ytDlp) {
                return res.status(500).json({ error: '未找到 yt-dlp，请将可执行文件放置于 modules/plugins/plugins/bin/' });
            }
        } catch (e) {
            console.error('[video-download] yt-dlp 获取失败', e);
            return res.status(500).json({ error: '自动安装 yt-dlp 失败，请检查网络或手动安装' });
        }

        const tmpDir = os.tmpdir();
        const ext = audioOnly ? 'mp3' : 'mp4';
        const filename = `vd-${Date.now()}-${Math.random().toString(16).slice(2)}.${ext}`;
        const outPath = path.join(tmpDir, filename);

        const args = ['-o', outPath];

        if (audioOnly) {
            args.push('-f', 'bestaudio/best', '--extract-audio', '--audio-format', 'mp3');
        } else {
            const fmt = buildFormatSelector(quality, ffmpegAvailable, preferCodec);
            args.push('-f', fmt);
            if (ffmpegAvailable) {
                args.push('--merge-output-format', 'mp4');
                args.push('--ffmpeg-location', ffmpegBin);
            }
        }

        if (!audioOnly && subtitles !== 'none') {
            args.push('--write-subs', '--sub-langs', 'all', '--convert-subs', subtitles);
            if (embedSub) args.push('--embed-subs');
        }

        if (playlistItem) {
            args.push('--yes-playlist', '--playlist-items', playlistItem);
        } else {
            args.push('--no-playlist');
        }

        args.push(url);

        const proc = spawn(ytDlp, args, { stdio: 'inherit' });

        proc.on('error', (err) => {
            console.error('[video-download] spawn error', err);
            res.status(500).json({ error: '执行 yt-dlp 失败，请确认可执行权限' });
        });

        proc.on('close', (code) => {
            if (code !== 0) {
                console.error('[video-download] yt-dlp exit code', code);
                return res.status(500).json({ error: `yt-dlp 执行失败，退出码 ${code}` });
            }
            try {
                const dir = path.dirname(outPath);
                const base = path.basename(outPath);
                const files = fs.readdirSync(dir).filter((f) => f.startsWith(base));

                let targetFile = null;
                const merged = outPath;
                if (fs.existsSync(merged)) {
                    targetFile = merged;
                } else if (files.length > 0) {
                    // 优先 mp4/mkv，选择体积最大的
                    files.sort((a, b) => {
                        const pa = path.join(dir, a);
                        const pb = path.join(dir, b);
                        const sa = fs.statSync(pa).size;
                        const sb = fs.statSync(pb).size;
                        return sb - sa;
                    });
                    targetFile = path.join(dir, files[0]);
                }

                if (!targetFile || !fs.existsSync(targetFile)) {
                    return res.status(500).json({ error: '未找到下载产物，可能缺少 ffmpeg 或格式不受支持' });
                }

                // 记录历史（非阻塞）
                appendHistory({
                    id: Date.now().toString(16),
                    url,
                    title,
                    entryTitle,
                    quality,
                    preferCodec,
                    subtitles,
                    embedSub,
                    audioOnly,
                    playlistItem,
                    size: fs.statSync(targetFile).size,
                    ts: Date.now()
                });

                const filenameOut = path.basename(targetFile);
                res.setHeader('Content-Disposition', `attachment; filename="${filenameOut}"`);
                res.setHeader('Content-Type', audioOnly ? 'audio/mpeg' : 'video/mp4');
                const stream = fs.createReadStream(targetFile);
                stream.pipe(res);
                stream.on('close', () => {
                    // 清理同前缀文件
                    files.forEach((f) => {
                        const fp = path.join(dir, f);
                        if (fs.existsSync(fp)) fs.unlink(fp, () => {});
                    });
                    if (fs.existsSync(merged)) fs.unlink(merged, () => {});
                });
                stream.on('error', (err) => {
                    console.error('[video-download] stream error', err);
                    files.forEach((f) => {
                        const fp = path.join(dir, f);
                        if (fs.existsSync(fp)) fs.unlink(fp, () => {});
                    });
                    if (fs.existsSync(merged)) fs.unlink(merged, () => {});
                });
            } catch (err) {
                console.error('[video-download] post-process error', err);
                return res.status(500).json({ error: '处理下载结果失败，可能缺少 ffmpeg' });
            }
        });
    };
}

function createVideoRoutes() {
    const handler = createVideoHandler();
    const formatHandler = createFormatHandler();
    const historyHandler = createHistoryHandler();
    return [
        { method: 'get', path: '/api/video/download', handler },
        { method: 'get', path: '/plugins/api/video/download', handler },
        { method: 'get', path: '/api/video/formats', handler: formatHandler },
        { method: 'get', path: '/plugins/api/video/formats', handler: formatHandler },
        { method: 'get', path: '/api/video/history', handler: historyHandler },
        { method: 'get', path: '/plugins/api/video/history', handler: historyHandler }
    ];
}

function createFormatHandler() {
    return async (req, res) => {
        const url = (req.query.url || '').trim();
        if (!url) {
            return res.status(400).json({ error: '缺少 url 参数' });
        }
        const ytDlp = resolveYtDlp();
        if (!ytDlp) {
            return res.status(500).json({ error: '未找到 yt-dlp，可执行文件需放置于 modules/plugins/plugins/bin/' });
        }

        try {
            const payload = await listFormats(url, ytDlp);
            res.json(payload);
        } catch (e) {
            console.error('[video-download] list formats error', e);
            res.status(500).json({ error: e.message || '获取格式失败' });
        }
    };
}

function createHistoryHandler() {
    return (req, res) => {
        try {
            const keyword = (req.query.keyword || '').trim();
            const list = readHistory(keyword);
            res.json({ items: list });
        } catch (e) {
            console.error('[video-download] history query failed', e);
            res.status(500).json({ error: '读取历史失败' });
        }
    };
}

function listFormats(url, ytDlp) {
    return new Promise((resolve, reject) => {
        // 使用 -J 输出纯 JSON，避免文本表格导致 JSON 解析失败
        const proc = spawn(ytDlp, ['-J', url]);
        let out = '';
        let err = '';
        proc.stdout.on('data', (d) => (out += d));
        proc.stderr.on('data', (d) => (err += d));
        proc.on('error', reject);
        proc.on('close', (code) => {
            if (code !== 0) {
                return reject(new Error(err || `yt-dlp exit ${code}`));
            }
            try {
                const json = JSON.parse(out);
                const formats = extractFormats(json);
                const entries = extractEntries(json);
                const baseFormats = formats.length ? formats : extractFormats(entries[0]);
                resolve({
                    title: json.title || '',
                    uploader: json.uploader || json.channel || '',
                    duration: json.duration,
                    isPlaylist: Array.isArray(json?.entries) && json.entries.length > 0,
                    formats: baseFormats,
                    entries: entries.map((e) => ({
                        index: e.index,
                        id: e.id,
                        title: e.title,
                        duration: e.duration,
                        webpage_url: e.webpage_url,
                        formats: extractFormats(e)
                    }))
                });
            } catch (e) {
                reject(e);
            }
        });
    });
}

function extractFormats(json = {}) {
    const list = Array.isArray(json.formats) ? json.formats : [];
    return list.map((f) => ({
        id: f.format_id,
        ext: f.ext,
        resolution: f.resolution || (f.width && f.height ? `${f.width}x${f.height}` : ''),
        fps: f.fps,
        vcodec: f.vcodec,
        acodec: f.acodec,
        filesize: f.filesize || f.filesize_approx,
        note: f.format_note || ''
    }));
}

function extractEntries(json = {}) {
    if (Array.isArray(json.entries) && json.entries.length) {
        return json.entries.map((e, idx) => ({
            index: idx + 1,
            id: e.id || e.cid || e.aid || `${idx + 1}`,
            title: e.title || e.episode || json.title || `P${idx + 1}`,
            duration: e.duration,
            webpage_url: e.webpage_url || e.url || json.webpage_url,
            formats: extractFormats(e)
        }));
    }
    return [
        {
            index: 1,
            id: json.id || '1',
            title: json.title || '',
            duration: json.duration,
            webpage_url: json.webpage_url,
            formats: extractFormats(json)
        }
    ];
}