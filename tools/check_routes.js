const express = require('express');
const { loadModules } = require('../core/module-loader');

const app = express();
loadModules(app);

console.log('\n📋 已注册的路由:');
console.log('='.repeat(60));

// 获取所有路由
const routes = [];
app._router.stack.forEach((middleware) => {
    if (middleware.route) {
        const methods = Object.keys(middleware.route.methods).map(m => m.toUpperCase()).join(', ');
        routes.push({ path: middleware.route.path, methods });
    } else if (middleware.name === 'router') {
        // 处理子路由
        const basePath = middleware.regexp.source.replace('\\/?', '').replace('\\/?(?=\\/|$)', '');
        middleware.handle.stack.forEach((handler) => {
            if (handler.route) {
                const methods = Object.keys(handler.route.methods).map(m => m.toUpperCase()).join(', ');
                routes.push({ path: basePath + handler.route.path, methods });
            }
        });
    }
});

routes.forEach(r => {
    console.log(`${r.methods.padEnd(10)} ${r.path}`);
});

console.log('\n✅ 检查完成\n');

