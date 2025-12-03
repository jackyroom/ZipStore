const { render } = require('../../core/layout-engine');
    const ITEMS = [1,2,3,4,5,6].map(i => ({src:`https://placehold.co/600x${500+(i%3)*100}/1e293b/ec4899?text=Art${i}`, title:`作品 ${i}`}));
    module.exports = { meta: { id: 'gallery', name: '画廊' }, routes: [{ path: '/', method: 'get', handler: (req, res) => {
        res.send(render({ title: '画廊', currentModule: 'gallery', content: `<link rel="stylesheet" href="/modules/gallery/gallery.css"><div class="glass-card" style="margin-bottom:20px;"><h1>光影画廊</h1></div><div class="gallery-container">${ITEMS.map(i=>`<div class="gallery-item"><img src="${i.src}"><div class="gallery-overlay">${i.title}</div></div>`).join('')}</div>`, extraScripts: `<script src="/js/app-interactions.js"></script>` }));
    }}]};