const db = require('../core/db-access');

async function updateCategoriesModule() {
    console.log('开始更新分类的module_id...\n');

    try {
        // 更新旧分类的module_id
        await db.run(`UPDATE categories SET module_id = 'design-assets' WHERE slug = 'design-assets' AND (module_id IS NULL OR module_id = '')`);
        await db.run(`UPDATE categories SET module_id = 'software' WHERE slug = 'software' AND (module_id IS NULL OR module_id = '')`);
        
        // 显示更新结果
        const categories = await db.query("SELECT module_id, name, slug FROM categories ORDER BY module_id, sort_order");
        console.log('分类列表（按模块分组）:');
        
        let currentModule = null;
        categories.forEach(cat => {
            if (cat.module_id !== currentModule) {
                currentModule = cat.module_id;
                console.log(`\n【${cat.module_id || '未分配'}】`);
            }
            console.log(`  - ${cat.name} (${cat.slug})`);
        });
        
        console.log(`\n✅ 共 ${categories.length} 个分类`);
        console.log('更新完成！');
        
    } catch (error) {
        console.error('更新失败:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    updateCategoriesModule().then(() => {
        process.exit(0);
    }).catch(err => {
        console.error(err);
        process.exit(1);
    });
}

module.exports = { updateCategoriesModule };


