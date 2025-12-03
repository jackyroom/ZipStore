const express = require('express');
const path = require('path');
const config = require('./app-config');
const { loadModules } = require('./core/module-loader');
const app = express();
const PORT = process.env.PORT || config.dev.port || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// 挂载模块
loadModules(app);

app.use((req, res) => res.status(404).send(`<body style="background:#0f172a;color:#fff;display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;flex-direction:column"><h1 style="font-size:4rem;margin:0;color:#6366f1">404</h1><p>页面未找到</p><a href="/" style="color:#fff;margin-top:20px;text-decoration:underline">回首页</a></body>`));

app.listen(PORT, () => {
    console.log(`\n🚀 Server Running: http://localhost:${PORT}\n`);
});