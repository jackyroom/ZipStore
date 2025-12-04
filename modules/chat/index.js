const path = require('path');
const { render } = require('../../core/layout-engine');

// --- 模拟数据: 在线用户 ---
const MOCK_USERS = {
    online: [
        { name: "Jacky (Admin)", avatar: "/favicon.ico.png", role: "admin", status: "online", playing: "Visual Studio Code" },
        { name: "DesignBot", avatar: "https://ui-avatars.com/api/?name=Bot&background=random", role: "bot", status: "dnd", playing: "Serving requests" },
        { name: "Alice", avatar: "https://ui-avatars.com/api/?name=Alice&background=random", role: "user", status: "online" },
        { name: "Bob_Gamer", avatar: "https://ui-avatars.com/api/?name=Bob&background=random", role: "user", status: "idle", playing: "Overwatch 2" },
    ],
    offline: [
        { name: "Dave", avatar: "https://ui-avatars.com/api/?name=Dave&background=random", role: "user", status: "offline" },
        { name: "Eve", avatar: "https://ui-avatars.com/api/?name=Eve&background=random", role: "user", status: "offline" }
    ]
};

// --- 模拟数据: 初始消息 ---
const MOCK_MESSAGES = [
    { 
        id: 1, user: MOCK_USERS.online[0], time: "10:00", type: "text", 
        content: "欢迎来到公共聊天室！这里模仿了 KOOK/Discord 的布局风格。" 
    },
    { 
        id: 2, user: MOCK_USERS.online[1], time: "10:01", type: "image", 
        content: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop",
        meta: "concept_art.jpg"
    },
    { 
        id: 3, user: MOCK_USERS.online[2], time: "10:05", type: "file", 
        content: "project_specs_v2.pdf", size: "2.4 MB"
    },
    { 
        id: 4, user: MOCK_USERS.online[0], time: "10:10", type: "voice", 
        content: "0:15", played: false
    },
    { 
        id: 5, user: MOCK_USERS.online[3], time: "10:12", type: "text", 
        content: "有人要以前打游戏吗？语音频道见！" 
    }
];

// --- 渲染辅助函数 ---
function renderUserList(users, title) {
    if (!users || users.length === 0) return '';
    return `
        <div class="user-group-title">${title} — ${users.length}</div>
        ${users.map(u => `
            <div class="user-item">
                <div class="avatar-wrapper">
                    <img src="${u.avatar}" alt="${u.name}">
                    <span class="status-indicator ${u.status}"></span>
                </div>
                <div class="user-details">
                    <div class="user-name ${u.role === 'admin' ? 'text-admin' : ''}">${u.name}</div>
                    ${u.playing ? `<div class="user-activity">正在玩: ${u.playing}</div>` : ''}
                </div>
            </div>
        `).join('')}
    `;
}

function renderMessage(msg) {
    let contentHtml = '';
    
    switch(msg.type) {
        case 'image':
            contentHtml = `
                <div class="msg-image-container" onclick="previewImage('${msg.content}')">
                    <img src="${msg.content}" alt="Image">
                </div>`;
            break;
        case 'file':
            contentHtml = `
                <div class="msg-file-card">
                    <div class="file-icon"><i class="fa-solid fa-file-lines"></i></div>
                    <div class="file-info">
                        <div class="file-name">${msg.content}</div>
                        <div class="file-size">${msg.size}</div>
                    </div>
                    <a href="#" class="file-download"><i class="fa-solid fa-download"></i></a>
                </div>`;
            break;
        case 'voice':
            contentHtml = `
                <div class="msg-voice-bar">
                    <button class="play-btn"><i class="fa-solid fa-play"></i></button>
                    <div class="voice-wave">
                        <span></span><span></span><span></span><span></span><span></span>
                    </div>
                    <span class="voice-time">${msg.content}</span>
                </div>`;
            break;
        default:
            contentHtml = `<div class="msg-text">${msg.content}</div>`;
    }

    return `
        <div class="message-row fade-in">
            <div class="message-avatar">
                <img src="${msg.user.avatar}" alt="${msg.user.name}">
            </div>
            <div class="message-content-wrapper">
                <div class="message-header">
                    <span class="message-author ${msg.user.role === 'admin' ? 'text-primary' : ''}">${msg.user.name}</span>
                    <span class="message-time">${msg.time}</span>
                </div>
                ${contentHtml}
            </div>
        </div>
    `;
}

module.exports = {
    meta: {
        id: 'chat',
        name: '公共聊天'
    },
    routes: [
        {
            method: 'GET',
            path: '/',
            handler: (req, res) => {
                const html = `
                    <div class="chat-layout-container">
                        <div class="chat-main-area glass-card">
                            <header class="chat-header">
                                <div class="header-left">
                                    <i class="fa-solid fa-hashtag"></i>
                                    <span class="channel-name">公共大厅</span>
                                    <span class="channel-topic">| 聊技术、聊生活、分享资源</span>
                                </div>
                                <div class="header-right">
                                    <button class="btn-icon" title="加入语音会议" onclick="toggleVoicePanel()"><i class="fa-solid fa-headset"></i></button>
                                    <button class="btn-icon" title="钉选消息"><i class="fa-solid fa-thumbtack"></i></button>
                                    <button class="btn-icon mobile-toggle-users" onclick="toggleUserList()"><i class="fa-solid fa-users"></i></button>
                                </div>
                            </header>

                            <div id="voice-panel" class="voice-status-panel hidden">
                                <div class="voice-info">
                                    <div class="voice-signal good"><i class="fa-solid fa-signal"></i> 已连接</div>
                                    <span>语音频道: 摸鱼会议室</span>
                                </div>
                                <div class="voice-controls">
                                    <button class="btn-circle active"><i class="fa-solid fa-microphone"></i></button>
                                    <button class="btn-circle"><i class="fa-solid fa-headphones"></i></button>
                                    <button class="btn-circle btn-danger" onclick="toggleVoicePanel()"><i class="fa-solid fa-phone-slash"></i></button>
                                </div>
                            </div>

                            <div class="chat-messages custom-scroll" id="message-list">
                                ${MOCK_MESSAGES.map(renderMessage).join('')}
                            </div>

                            <div class="chat-input-wrapper">
                                <div class="input-tools">
                                    <button class="tool-btn"><i class="fa-solid fa-circle-plus"></i></button>
                                </div>
                                <textarea id="chat-input" rows="1" placeholder="发送消息到 #公共大厅"></textarea>
                                <div class="input-actions">
                                    <button class="action-btn"><i class="fa-solid fa-gift"></i></button>
                                    <button class="action-btn"><i class="fa-solid fa-image"></i></button>
                                    <button class="action-btn"><i class="fa-solid fa-face-smile"></i></button>
                                </div>
                            </div>
                        </div>

                        <aside class="chat-sidebar-right glass-card custom-scroll" id="user-sidebar">
                            ${renderUserList(MOCK_USERS.online, "在线 - Online")}
                            ${renderUserList(MOCK_USERS.offline, "离线 - Offline")}
                        </aside>
                    </div>

                    <div id="image-viewer" class="image-viewer-overlay" onclick="closePreview()">
                        <img id="preview-img" src="" alt="Preview">
                    </div>
                `;

                // 注入前端脚本
                const scripts = `
                <script>
                    const msgList = document.getElementById('message-list');
                    const input = document.getElementById('chat-input');

                    // 自动滚动到底部
                    function scrollToBottom() {
                        msgList.scrollTop = msgList.scrollHeight;
                    }
                    scrollToBottom();

                    // 语音面板切换
                    function toggleVoicePanel() {
                        const panel = document.getElementById('voice-panel');
                        panel.classList.toggle('hidden');
                    }

                    // 移动端切换用户列表
                    function toggleUserList() {
                        const sidebar = document.getElementById('user-sidebar');
                        sidebar.classList.toggle('active-mobile');
                    }

                    // 图片预览
                    function previewImage(src) {
                        const viewer = document.getElementById('image-viewer');
                        const img = document.getElementById('preview-img');
                        img.src = src;
                        viewer.classList.add('active');
                    }
                    function closePreview() {
                        document.getElementById('image-viewer').classList.remove('active');
                    }

                    // 简单的发送模拟
                    input.addEventListener('keypress', function (e) {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            const text = this.value.trim();
                            if (text) {
                                const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                                const html = \`
                                    <div class="message-row fade-in">
                                        <div class="message-avatar">
                                            <img src="/favicon.ico.png" alt="Me">
                                        </div>
                                        <div class="message-content-wrapper">
                                            <div class="message-header">
                                                <span class="message-author text-primary">Me</span>
                                                <span class="message-time">\${time}</span>
                                            </div>
                                            <div class="msg-text">\${text}</div>
                                        </div>
                                    </div>\`;
                                msgList.insertAdjacentHTML('beforeend', html);
                                this.value = '';
                                scrollToBottom();
                            }
                        }
                    });
                </script>
                `;

                res.send(render({ 
                    title: '公共聊天室', 
                    content: html, 
                    currentModule: 'chat',
                    extraHead: '<link rel="stylesheet" href="/modules/chat/chat.css">',
                    extraScripts: scripts
                }));
            }
        }
    ]
};