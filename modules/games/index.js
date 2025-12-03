const { render } = require('../../core/layout-engine');
    const GAMES = [{n:'俄罗斯方块',i:'fa-solid fa-shapes'},{n:'贪吃蛇',i:'fa-solid fa-staff-snake'}];
    module.exports = { meta: { id: 'games', name: '游戏厅' }, routes: [{ path: '/', method: 'get', handler: (req, res) => {
        const content = `<link rel="stylesheet" href="/modules/games/games.css"><div class="glass-card" style="margin-bottom:20px;"><h1>游戏大厅</h1></div><div class="game-grid">${GAMES.map(g=>`<div class="game-card"><div style="font-size:3rem;margin-bottom:10px;"><i class="${g.i}"></i></div><h3>${g.n}</h3></div>`).join('')}</div>`;
        res.send(render({ title: '游戏厅', currentModule: 'games', content }));
    }}]};