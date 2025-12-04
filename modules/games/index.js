const path = require('path');
const { render } = require('../../core/layout-engine');

// 1. 模拟游戏数据
// 注意：实际开发中 ROM URL 应该指向 public 文件夹或远程 CDN
// 为了演示，这里使用 EmulatorJS 官方提供的一些公共演示 ROM 或占位符
const GAMES_LIST = [
    {
        id: 'nes-mario',
        title: '超级马里奥兄弟 (Demo)',
        platform: 'NES',
        core: 'nes',
        genre: '动作',
        cover: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&q=80',
        // 使用公共可用的 Demo ROM 链接，或者提示用户上传
        rom: 'https://cdn.jsdelivr.net/gh/mathiasbynens/small@master/nes/small.nes', 
        desc: '经典的红白机游戏体验'
    },
    {
        id: 'gba-sonic',
        title: '索尼克 Advance (演示)',
        platform: 'GBA',
        core: 'gba',
        genre: '冒险',
        cover: 'https://images.unsplash.com/photo-1531122111969-75579014c024?w=600&q=80',
        rom: '', // 空链接会触发“请上传 ROM”提示
        desc: '速度与激情的掌机经典'
    },
    {
        id: 'snes-zelda',
        title: '塞尔达传说',
        platform: 'SNES',
        core: 'snes',
        genre: 'RPG',
        cover: 'https://images.unsplash.com/photo-1612404730960-5c7157472611?w=600&q=80',
        rom: '',
        desc: '海拉鲁大陆的冒险'
    },
    {
        id: 'arcade-metal',
        title: '合金弹头',
        platform: 'MAME',
        core: 'mame2003',
        genre: '射击',
        cover: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=600&q=80',
        rom: '',
        desc: '硬派街机射击游戏'
    }
];

const CATEGORIES = [
    { id: 'all', name: '全部游戏' },
    { id: 'nes', name: 'FC/NES (红白机)' },
    { id: 'snes', name: 'SNES (超任)' },
    { id: 'gba', name: 'GBA (掌机)' },
    { id: 'nds', name: 'NDS' },
    { id: 'psx', name: 'PlayStation' },
    { id: 'arcade', name: '街机 Arcade' }
];

function renderGamesPage() {
    return `
    <div class="games-module-container">
        <script>
            window.EJS_player = null;
            window.EJS_core = null;
            window.EJS_pathtodata = "https://cdn.jsdelivr.net/gh/ethanaobrien/emulatorjs@main/data/";
        </script>
        <script src="https://cdn.jsdelivr.net/gh/ethanaobrien/emulatorjs@main/data/loader.js"></script>

        <div class="games-hero">
            <div class="hero-content">
                <div class="hero-text">
                    <h1>Retro Game Museum</h1>
                    <p>重温经典，无需下载。支持 NES, SNES, GBA, PSP 等多种机种。<br>拖拽本地 ROM 文件即可立即运行。</p>
                </div>
                
                <div class="local-play-zone" id="dropZone">
                    <input type="file" id="romInput" style="display:none" accept=".nes,.sfc,.smc,.gba,.nds,.iso,.zip,.7z">
                    <div class="zone-icon"><i class="fa-solid fa-gamepad"></i></div>
                    <div class="zone-text">
                        <strong>拖拽 ROM 文件到这里</strong>
                        <span>或点击选择本地文件 (.nes, .gba, .zip等)</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="games-nav">
            <div class="nav-inner">
                ${CATEGORIES.map((cat, idx) => `
                    <button class="game-filter-btn ${idx === 0 ? 'active' : ''}" 
                            data-filter="${cat.id}"
                            onclick="GamesApp.filterGames('${cat.id}', this)">
                        ${cat.name}
                    </button>
                `).join('')}
            </div>
        </div>

        <div class="games-grid" id="gamesGrid">
            ${renderGameCards(GAMES_LIST)}
        </div>

        <div class="emulator-modal" id="emulatorModal">
            <div class="emu-header">
                <span class="emu-title" id="emuGameTitle">正在运行...</span>
                <button class="emu-close-btn" onclick="GamesApp.stopGame()">退出游戏 (ESC)</button>
            </div>
            <div class="emu-container" id="emulatorWrapper">
                <div id="game"></div>
            </div>
            <div class="keyboard-hint">
                🎮 控制: 方向键移动 | Z/X (A/B键) | Enter (Start) | Shift (Select) | 存档请使用模拟器菜单
            </div>
        </div>

        <script>
            const ALL_GAMES = ${JSON.stringify(GAMES_LIST)};

            const GamesApp = {
                currentFilter: 'all',

                init: function() {
                    this.setupDragDrop();
                },

                filterGames: function(type, btn) {
                    document.querySelectorAll('.game-filter-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    this.currentFilter = type;

                    const grid = document.getElementById('gamesGrid');
                    const filtered = (type === 'all') 
                        ? ALL_GAMES 
                        : ALL_GAMES.filter(g => g.platform.toLowerCase() === type || g.core.includes(type));
                    
                    grid.innerHTML = this.renderCards(filtered);
                },

                renderCards: function(games) {
                    if(games.length === 0) return '<div style="grid-column:1/-1;text-align:center;padding:40px;color:#666">暂无该分类游戏，请尝试拖拽本地文件运行</div>';
                    return games.map(g => {
                        const dataStr = encodeURIComponent(JSON.stringify(g));
                        return \`
                        <div class="game-card" onclick="GamesApp.playPreset('\${dataStr}')">
                            <div style="position:relative; overflow:hidden;">
                                <img class="game-cover" src="\${g.cover}" loading="lazy" alt="\${g.title}">
                                <div class="platform-badge">\${g.platform}</div>
                                <div class="play-overlay">
                                    <div class="play-btn-circle"><i class="fa-solid fa-play"></i></div>
                                </div>
                            </div>
                            <div class="game-info">
                                <div class="game-title">\${g.title}</div>
                                <div class="game-meta">
                                    <span>\${g.genre}</span>
                                    <span><i class="fa-solid fa-gamepad"></i> 立即玩</span>
                                </div>
                            </div>
                        </div>
                        \`;
                    }).join('');
                },

                // 运行预设游戏
                playPreset: function(dataStr) {
                    const game = JSON.parse(decodeURIComponent(dataStr));
                    if (!game.rom) {
                        alert('这是一个演示卡片。请将您自己的 ' + game.platform + ' ROM 文件拖入上方虚线框来运行此游戏。');
                        return;
                    }
                    this.launchEmulator({
                        gameUrl: game.rom,
                        core: game.core,
                        name: game.title
                    });
                },

                // 核心：启动模拟器
                launchEmulator: function(config) {
                    const modal = document.getElementById('emulatorModal');
                    const wrapper = document.getElementById('emulatorWrapper');
                    const titleEl = document.getElementById('emuGameTitle');
                    
                    titleEl.innerText = config.name || 'Game Running';
                    modal.classList.add('active');
                    document.body.style.overflow = 'hidden'; // 锁定滚动

                    // 清理旧容器并重建 div，确保干净的启动
                    wrapper.innerHTML = '<div id="game"></div>';

                    // 配置 EmulatorJS
                    window.EJS_player = "#game";
                    window.EJS_core = config.core; 
                    window.EJS_gameName = config.name;
                    window.EJS_color = "#8b5cf6"; // 主题色
                    window.EJS_startOnLoaded = true;
                    window.EJS_pathtodata = "https://cdn.jsdelivr.net/gh/ethanaobrien/emulatorjs@main/data/";
                    
                    if (config.gameUrl) {
                        window.EJS_gameUrl = config.gameUrl;
                    } else if (config.gameData) {
                        // 处理本地文件 Blob/ArrayBuffer
                        // EmulatorJS 并不直接接受 Blob 对象作为参数，通常需要 URL
                        // 这里我们创建一个临时的 Blob URL
                        window.EJS_gameUrl = URL.createObjectURL(new Blob([config.gameData]));
                    }

                    // 异步加载脚本并启动
                    // 注意：由于 loader.js 已经在 head 加载，我们调用它的启动函数
                    // EmulatorJS 的 loader 比较特殊，通常重新创建一个 script 标签来触发加载
                    const script = document.createElement('script');
                    script.src = "https://cdn.jsdelivr.net/gh/ethanaobrien/emulatorjs@main/data/loader.js";
                    wrapper.appendChild(script);
                },

                stopGame: function() {
                    const modal = document.getElementById('emulatorModal');
                    const wrapper = document.getElementById('emulatorWrapper');
                    
                    modal.classList.remove('active');
                    document.body.style.overflow = '';
                    wrapper.innerHTML = ''; // 销毁模拟器实例
                    
                    // 清理可能的 Blob URL
                    if (window.EJS_gameUrl && window.EJS_gameUrl.startsWith('blob:')) {
                        URL.revokeObjectURL(window.EJS_gameUrl);
                    }
                },

                // --- 处理本地文件拖拽 ---
                setupDragDrop: function() {
                    const zone = document.getElementById('dropZone');
                    const input = document.getElementById('romInput');

                    zone.onclick = () => input.click();

                    input.onchange = (e) => {
                        if (e.target.files.length) this.handleFile(e.target.files[0]);
                    };

                    zone.ondragover = (e) => {
                        e.preventDefault();
                        zone.classList.add('drag-over');
                    };
                    zone.ondragleave = () => zone.classList.remove('drag-over');
                    zone.ondrop = (e) => {
                        e.preventDefault();
                        zone.classList.remove('drag-over');
                        if (e.dataTransfer.files.length) this.handleFile(e.dataTransfer.files[0]);
                    };
                },

                handleFile: function(file) {
                    const name = file.name.toLowerCase();
                    let core = 'nes'; // 默认

                    // 简单的后缀名判断核心
                    if (name.endsWith('.gba')) core = 'gba';
                    else if (name.endsWith('.sfc') || name.endsWith('.smc')) core = 'snes';
                    else if (name.endsWith('.nds')) core = 'nds';
                    else if (name.endsWith('.n64') || name.endsWith('.z64')) core = 'n64';
                    else if (name.endsWith('.gb') || name.endsWith('.gbc')) core = 'gb';
                    else if (name.endsWith('.md') || name.endsWith('.bin')) core = 'segaMD';
                    else if (name.endsWith('.zip')) {
                        alert('检测到 ZIP 文件。如果是街机游戏，通常需要特定的 MAME 核心。如果是主机游戏，请尝试解压后上传。我们将尝试作为 NES 运行。');
                    }

                    const reader = new FileReader();
                    reader.onload = (e) => {
                        this.launchEmulator({
                            gameData: e.target.result,
                            core: core,
                            name: file.name
                        });
                    };
                    reader.readAsArrayBuffer(file);
                }
            };
            
            // 初始化
            document.addEventListener('DOMContentLoaded', () => GamesApp.init());

            // 监听 ESC 键退出
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && document.getElementById('emulatorModal').classList.contains('active')) {
                    GamesApp.stopGame();
                }
            });
        </script>
    </div>
    `;
}

// 服务端渲染辅助函数（生成初始 HTML）
function renderGameCards(games) {
    return games.map(g => {
        const dataStr = encodeURIComponent(JSON.stringify(g));
        return `
        <div class="game-card" onclick="GamesApp.playPreset('${dataStr}')">
            <div style="position:relative; overflow:hidden;">
                <img class="game-cover" src="${g.cover}" loading="lazy" alt="${g.title}">
                <div class="platform-badge">${g.platform}</div>
                <div class="play-overlay">
                    <div class="play-btn-circle"><i class="fa-solid fa-play"></i></div>
                </div>
            </div>
            <div class="game-info">
                <div class="game-title">${g.title}</div>
                <div class="game-meta">
                    <span>${g.genre}</span>
                    <span><i class="fa-solid fa-gamepad"></i> 立即玩</span>
                </div>
            </div>
        </div>
        `;
    }).join('');
}

module.exports = {
    meta: {
        id: 'games',
        name: '游戏大厅',
    },
    routes: [
        {
            method: 'GET',
            path: '/',
            handler: (req, res) => {
                const content = renderGamesPage();
                res.send(render({ 
                    title: '游戏大厅 - JackyRoom', 
                    content: content, 
                    currentModule: 'games',
                    extraHead: '<link rel="stylesheet" href="/modules/games/games.css">'
                }));
            }
        }
    ]
};