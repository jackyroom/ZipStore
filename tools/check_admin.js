const db = require('../core/db-access');
const path = require('path');

async function checkAdminSetup() {
    console.log('🔍 检查后台管理系统状态...\n');

    try {
        // 1. 检查数据库连接
        console.log('1. 检查数据库连接...');
        await db.get("SELECT 1");
        console.log('   ✅ 数据库连接正常\n');

        // 2. 检查表是否存在
        console.log('2. 检查数据表...');
        const tables = ['users', 'categories', 'resources', 'assets'];
        for (const table of tables) {
            try {
                const result = await db.get(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`, [table]);
                if (result) {
                    const count = await db.get(`SELECT COUNT(*) as count FROM ${table}`);
                    console.log(`   ✅ ${table} 表存在 (${count.count} 条记录)`);
                } else {
                    console.log(`   ❌ ${table} 表不存在`);
                }
            } catch (e) {
                console.log(`   ❌ ${table} 表检查失败: ${e.message}`);
            }
        }
        console.log('');

        // 3. 检查admin用户
        console.log('3. 检查admin用户...');
        const admin = await db.get("SELECT * FROM users WHERE username = 'admin'");
        if (admin) {
            console.log(`   ✅ Admin用户存在 (ID: ${admin.id}, Role: ${admin.role || '未设置'})`);
        } else {
            console.log('   ❌ Admin用户不存在');
        }
        console.log('');

        // 4. 检查分类数据
        console.log('4. 检查分类数据...');
        const categories = await db.query("SELECT * FROM categories");
        console.log(`   ✅ 找到 ${categories.length} 个分类`);
        categories.forEach(cat => {
            console.log(`      - ${cat.name} (${cat.slug})`);
        });
        console.log('');

        // 5. 检查模块文件
        console.log('5. 检查模块文件...');
        const fs = require('fs');
        const adminIndex = path.join(__dirname, '..', 'modules', 'admin', 'index.js');
        const adminHelpers = path.join(__dirname, '..', 'modules', 'admin', 'admin-helpers.js');
        const uploadMiddleware = path.join(__dirname, '..', 'core', 'upload-middleware.js');
        
        if (fs.existsSync(adminIndex)) {
            console.log('   ✅ admin/index.js 存在');
        } else {
            console.log('   ❌ admin/index.js 不存在');
        }
        
        if (fs.existsSync(adminHelpers)) {
            console.log('   ✅ admin-helpers.js 存在');
        } else {
            console.log('   ❌ admin-helpers.js 不存在');
        }
        
        if (fs.existsSync(uploadMiddleware)) {
            console.log('   ✅ upload-middleware.js 存在');
        } else {
            console.log('   ❌ upload-middleware.js 不存在');
        }
        console.log('');

        // 6. 检查依赖
        console.log('6. 检查依赖包...');
        try {
            require('multer');
            console.log('   ✅ multer 已安装');
        } catch (e) {
            console.log('   ❌ multer 未安装，请运行: npm install multer');
        }
        
        try {
            require('uuid');
            console.log('   ✅ uuid 已安装');
        } catch (e) {
            console.log('   ❌ uuid 未安装，请运行: npm install uuid');
        }
        console.log('');

        console.log('✅ 检查完成！');
        console.log('\n如果所有检查都通过，请重启服务器后访问: http://localhost:3000/admin');

    } catch (error) {
        console.error('❌ 检查失败:', error.message);
        console.error(error.stack);
    }
}

if (require.main === module) {
    checkAdminSetup().then(() => {
        process.exit(0);
    }).catch(err => {
        console.error(err);
        process.exit(1);
    });
}

module.exports = { checkAdminSetup };

