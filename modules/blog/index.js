const { render } = require('../../core/layout-engine');
    module.exports = { meta: { id: 'blog', name: '博客' }, routes: [{ path: '/', method: 'get', handler: (req, res) => {
        res.send(render({ title: '博客', currentModule: 'blog', content: `<div class="glass-card"><h2>最新文章</h2><div style="padding:20px;background:rgba(255,255,255,0.03);border-radius:12px;margin-bottom:20px;"><h3 style="margin-bottom:5px;">系统升级公告</h3><p style="color:var(--text-muted)">全模块功能已就绪。</p></div></div>` }));
    }}]};