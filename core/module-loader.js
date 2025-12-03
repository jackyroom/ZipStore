const fs = require('fs');
const path = require('path');
const express = require('express');
function loadModules(app) {
    const modulesPath = path.join(__dirname, '..', 'modules');
    if (!fs.existsSync(modulesPath)) { fs.mkdirSync(modulesPath); return; }
    console.log('📦 Loading Modules...');
    fs.readdirSync(modulesPath).forEach(folder => {
        const entry = path.join(modulesPath, folder, 'index.js');
        if (fs.existsSync(entry)) {
            try {
                const mod = require(entry);
                if (mod.routes) {
                    const router = express.Router();
                    mod.routes.forEach(r => {
                        const method = (r.method || 'get').toLowerCase();
                        if(router[method]) router[method](r.path, r.handler);
                    });
                    const prefix = mod.meta.id === 'home' ? '/' : `/${mod.meta.id}`;
                    app.use(prefix, router);
                    console.log(`   ✅ ${mod.meta.name}`);
                }
                if (mod.onInit) mod.onInit(app);
            } catch (e) { console.error(`   ❌ ${folder}: `, e.message); }
        }
    });
}
module.exports = { loadModules };