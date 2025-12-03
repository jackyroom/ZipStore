const { render } = require('../../core/layout-engine');
    module.exports = { meta: { id: 'chat', name: '聊天室' }, routes: [{ path: '/', method: 'get', handler: (req, res) => {
        const content = `<link rel="stylesheet" href="/modules/chat/chat.css"><div class="glass-card"><h1>公共聊天室</h1><div class="chat-window"><div class="chat-msgs"><div class="chat-msg">欢迎！</div></div><div class="chat-input-area"><input type="text" placeholder="发送消息..."><button>发送</button></div></div></div>`;
        res.send(render({ title: '聊天室', currentModule: 'chat', content }));
    }}]};