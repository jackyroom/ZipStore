const db = require('../core/db-access');

async function checkHomeCategories() {
    try {
        const categories = await db.query(`
            SELECT id, module_id, name, slug, sort_order 
            FROM categories 
            WHERE module_id = 'home' 
            ORDER BY sort_order
        `);
        
        console.log('\n首页分类 (module_id=home):');
        console.log('='.repeat(60));
        
        if (categories.length === 0) {
            console.log('  ⚠️  没有找到分类！');
            console.log('\n提示：请运行 node tools/update_categories_module.js 更新分类数据');
        } else {
            categories.forEach(cat => {
                console.log(`  ${cat.id}. ${cat.name} (${cat.slug}) - 排序: ${cat.sort_order}`);
            });
            console.log(`\n✅ 共找到 ${categories.length} 个首页分类`);
        }
        
        process.exit(0);
    } catch (error) {
        console.error('错误:', error.message);
        process.exit(1);
    }
}

checkHomeCategories();

