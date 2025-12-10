const db = require('../core/db-access');
const path = require('path');

// 模拟数据（从原模块中提取）
const MOCK_HOME_DATA = [
    { 
        id: 1, 
        title: "赛博废墟: 侦察兵", 
        author: "Neo_Design", 
        type: "concept", 
        views: 12500, 
        likes: 3200, 
        cover: "https://images.unsplash.com/photo-1563089145-599997674d42?w=600&q=80",
        desc: "2077年边境废墟的侦察兵概念设计。",
        tags: ["Cyberpunk", "Sci-Fi"]
    },
    { 
        id: 3, 
        title: "机甲维护中心", 
        author: "HardSurfaceGuy", 
        type: "model", 
        views: 22000, 
        likes: 4500, 
        cover: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&q=80",
        desc: "硬表面建模练习，高模烘焙到低模。",
        tags: ["3D", "Hard Surface", "Robot"],
        attributes: { format: "GLB", poly_count: "24,500", vertices: "12,400", fileSize: "15 MB", software: "Blender" }
    },
    { 
        id: 7, 
        title: "宇航员头盔", 
        author: "SpaceArt", 
        type: "model", 
        views: 15000, 
        likes: 2100, 
        cover: "https://images.unsplash.com/photo-1541873676-a18131494184?w=600&q=80",
        desc: "基于 NASA 参考图制作的写实头盔。",
        tags: ["Space", "Realistic", "Prop"],
        attributes: { format: "GLB", poly_count: "45,200", vertices: "23,100", fileSize: "8 MB", software: "Maya" }
    },
    { 
        id: 2, 
        title: "神秘山谷渲染", 
        author: "EnvironmentPro", 
        type: "env", 
        views: 8900, 
        likes: 920, 
        cover: "https://images.unsplash.com/photo-1511884642898-4c92249f20b6?w=600&q=80",
        desc: "UE5 实时渲染练习。",
        tags: ["Unreal Engine 5", "Landscape"]
    }
];

const MOCK_DESIGN_ASSETS = [
    {
        id: 1,
        title: "赛博朋克贫民窟组件包",
        author: "FutureAssets",
        points: 1200,
        type: "3d",
        software: ["Unreal", "Blender"],
        format: "FBX, UASSET",
        size: "2.4 GB",
        desc: "高质量的模块化建筑套件，包含300+个独立部件。",
        rating: 4.8
    },
    {
        id: 2,
        title: "写实材质球合集 Vol.1",
        author: "TexturePro",
        points: 0,
        type: "material",
        software: ["Substance Designer", "Universal"],
        format: "SBSAR, PNG",
        size: "800 MB",
        desc: "PBR 流程材质，包含混凝土、金属、木纹等常用材质。",
        rating: 4.6
    }
];

const MOCK_SOFTWARE = [
    {
        id: 1,
        title: "Adobe Creative Suite 2024",
        author: "Adobe Inc.",
        thumb: "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=600&q=80",
        platform: "Windows / macOS",
        version: "2024.1",
        size: "8.5 GB",
        downloads: 4500,
        views: 12000,
        category: "设计工具",
        license: "商业",
        description: "Adobe Creative Cloud 是一套包含平面设计、视频编辑、网页开发、摄影应用的软件套装。2024版本引入了更多 AI 生成功能 (Firefly)，大幅提升创作效率。",
        tutorial: `1. 断开网络连接。\n2. 运行 Set-up.exe 进行安装。\n3. 安装完成后，不要打开软件。\n4. 将 'Crack' 文件夹中的 patch 文件复制到安装目录。\n5. 以管理员身份运行 patch 文件并点击 'Apply'。\n6. 恢复网络，享受全功能版本。`,
        history_versions: [
            { ver: "2024.1", date: "2024-02-10", size: "8.5 GB", link: "#" },
            { ver: "2023.5", date: "2023-11-15", size: "8.2 GB", link: "#" }
        ]
    },
    {
        id: 2,
        title: "JetBrains IDE 全家桶",
        author: "JetBrains",
        thumb: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&q=80",
        platform: "Windows / macOS / Linux",
        version: "2024.2",
        size: "2.1 GB",
        downloads: 3200,
        views: 8900,
        category: "开发工具",
        license: "商业",
        description: "包含 IntelliJ IDEA, PyCharm, WebStorm 等顶尖开发工具。智能代码补全、强大的重构功能，是专业开发者的首选。",
        tutorial: `1. 安装所需的 IDE 产品。\n2. 打开 'ja-netfilter' 文件夹。\n3. 配置 vmoptions 文件路径。\n4. 输入提供的激活码即可永久激活。`,
        history_versions: [
            { ver: "2024.2", date: "2024-03-01", size: "2.1 GB", link: "#" }
        ]
    }
];

// 分类映射
const CATEGORY_MAP = {
    'concept': 'concept-art',
    'model': '3d-models',
    'env': 'level-design',
    '3d': 'design-assets',
    'material': 'design-assets',
    'software': 'software'
};

async function migrateData() {
    console.log('开始数据迁移...\n');

    try {
        // 获取admin用户
        const admin = await db.get("SELECT id FROM users WHERE username = 'admin' LIMIT 1");
        if (!admin) {
            console.error('未找到admin用户，请先初始化数据库');
            process.exit(1);
        }
        const authorId = admin.id;

        // 迁移首页数据
        console.log('迁移首页数据...');
        for (const item of MOCK_HOME_DATA) {
            const categorySlug = CATEGORY_MAP[item.type] || 'concept-art';
            const category = await db.get("SELECT id FROM categories WHERE slug = ?", [categorySlug]);
            if (!category) {
                console.warn(`分类 ${categorySlug} 不存在，跳过 ${item.title}`);
                continue;
            }

            const attributes = item.attributes || {};
            const tags = item.tags ? item.tags.join(', ') : '';

            await db.run(
                `INSERT INTO resources (category_id, author_id, title, description, cover_asset_id, attributes, tags, views, likes, status)
                 VALUES (?, ?, ?, ?, NULL, ?, ?, ?, ?, 'published')`,
                [category.id, authorId, item.title, item.desc || '', JSON.stringify(attributes), tags, item.views || 0, item.likes || 0]
            );
            console.log(`  ✓ ${item.title}`);
        }

        // 迁移设计素材数据
        console.log('\n迁移设计素材数据...');
        const designCategory = await db.get("SELECT id FROM categories WHERE slug = 'design-assets'");
        if (designCategory) {
            for (const item of MOCK_DESIGN_ASSETS) {
                const attributes = {
                    points: item.points,
                    type: item.type,
                    software: item.software,
                    format: item.format,
                    size: item.size,
                    rating: item.rating
                };

                await db.run(
                    `INSERT INTO resources (category_id, author_id, title, description, attributes, status, views, likes)
                     VALUES (?, ?, ?, ?, ?, 'published', 0, 0)`,
                    [designCategory.id, authorId, item.title, item.desc || '', JSON.stringify(attributes)]
                );
                console.log(`  ✓ ${item.title}`);
            }
        }

        // 迁移软件数据
        console.log('\n迁移软件数据...');
        const softwareCategory = await db.get("SELECT id FROM categories WHERE slug = 'software'");
        if (softwareCategory) {
            for (const item of MOCK_SOFTWARE) {
                const attributes = {
                    platform: item.platform,
                    version: item.version,
                    size: item.size,
                    category: item.category,
                    license: item.license,
                    tutorial: item.tutorial,
                    history_versions: item.history_versions
                };

                await db.run(
                    `INSERT INTO resources (category_id, author_id, title, description, content_body, attributes, status, views, downloads)
                     VALUES (?, ?, ?, ?, ?, ?, 'published', ?, ?)`,
                    [softwareCategory.id, authorId, item.title, item.description, item.tutorial, JSON.stringify(attributes), item.views || 0, item.downloads || 0]
                );
                console.log(`  ✓ ${item.title}`);
            }
        }

        console.log('\n数据迁移完成！');
        console.log(`共迁移 ${MOCK_HOME_DATA.length + MOCK_DESIGN_ASSETS.length + MOCK_SOFTWARE.length} 条资源数据`);

    } catch (error) {
        console.error('迁移失败:', error);
        process.exit(1);
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    migrateData().then(() => {
        process.exit(0);
    }).catch(err => {
        console.error(err);
        process.exit(1);
    });
}

module.exports = { migrateData };

