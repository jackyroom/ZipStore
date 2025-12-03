const { render } = require('../../core/layout-engine');
    module.exports = { meta: { id: 'chat', name: '聊天室' }, routes: [{ path: '/', method: 'get', handler: (req, res) => {
        const content = `<div class="glass-card"><h1>公共聊天室</h1><div class="chat-window"><div class="chat-msgs" style="padding:20px;"><div class="chat-msg" style="background:rgba(255,255,255,0.1);padding:10px;border-radius:10px;">欢迎！</div></div><div style="padding:15px;background:rgba(0,0,0,0.3);"><input type="text" style="width:100%;padding:10px;border-radius:20px;border:none;" placeholder="发送消息..."></div></div></div><link rel="stylesheet" href="/css/modules.css">`;
        res.send(render({ title: '聊天室', currentModule: 'chat', content }));
    }}]};