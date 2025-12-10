const db = require('../core/db-access');

async function updateCategorySchema() {
    try {
        // 更新所有软件工具分类，移除category字段
        const softwareCategories = [
            {
                slug: 'software-dev',
                schema: {
                    fields: [
                        { name: 'version', label: '版本号', type: 'text', placeholder: '例如：2024.2', required: true },
                        { name: 'platform', label: '支持平台', type: 'text', placeholder: '例如：Windows / macOS / Linux', required: true },
                        { name: 'license', label: '授权类型', type: 'text', placeholder: '例如：商业、开源、免费', required: true },
                        { name: 'size', label: '文件大小', type: 'text', placeholder: '例如：2.1 GB', required: true },
                        { name: 'tutorial', label: '安装教程', type: 'textarea', placeholder: '安装步骤说明（支持换行）', required: false },
                        { name: 'download_link', label: '下载链接', type: 'text', placeholder: '例如：https://example.com/download.zip 或 /admin/api/download/资源ID', required: false },
                        { name: 'history_versions', label: '历史版本', type: 'json_array', placeholder: 'JSON数组格式，例如：[{"ver":"2024.2","date":"2024-03-01","size":"2.1 GB","link":"#"}]', required: false }
                    ]
                }
            },
            {
                slug: 'software-design',
                schema: {
                    fields: [
                        { name: 'version', label: '版本号', type: 'text', placeholder: '例如：2024.1', required: true },
                        { name: 'platform', label: '支持平台', type: 'text', placeholder: '例如：Windows / macOS', required: true },
                        { name: 'license', label: '授权类型', type: 'text', placeholder: '例如：商业、免费', required: true },
                        { name: 'size', label: '文件大小', type: 'text', placeholder: '例如：8.5 GB', required: true },
                        { name: 'tutorial', label: '安装教程', type: 'textarea', placeholder: '安装步骤说明（支持换行）', required: false },
                        { name: 'download_link', label: '下载链接', type: 'text', placeholder: '例如：https://example.com/download.zip', required: false },
                        { name: 'history_versions', label: '历史版本', type: 'json_array', placeholder: 'JSON数组格式', required: false }
                    ]
                }
            },
            {
                slug: 'software-3d',
                schema: {
                    fields: [
                        { name: 'version', label: '版本号', type: 'text', placeholder: '例如：3.6.5', required: true },
                        { name: 'platform', label: '支持平台', type: 'text', placeholder: '例如：全平台', required: true },
                        { name: 'license', label: '授权类型', type: 'text', placeholder: '例如：开源', required: true },
                        { name: 'size', label: '文件大小', type: 'text', placeholder: '例如：350 MB', required: true },
                        { name: 'tutorial', label: '安装教程', type: 'textarea', placeholder: '安装步骤说明（支持换行）', required: false },
                        { name: 'download_link', label: '下载链接', type: 'text', placeholder: '例如：https://example.com/download.zip', required: false },
                        { name: 'history_versions', label: '历史版本', type: 'json_array', placeholder: 'JSON数组格式', required: false }
                    ]
                }
            },
            {
                slug: 'software-stream',
                schema: {
                    fields: [
                        { name: 'version', label: '版本号', type: 'text', placeholder: '例如：30.1.2', required: true },
                        { name: 'platform', label: '支持平台', type: 'text', placeholder: '例如：Windows / macOS / Linux', required: true },
                        { name: 'license', label: '授权类型', type: 'text', placeholder: '例如：开源', required: true },
                        { name: 'size', label: '文件大小', type: 'text', placeholder: '例如：120 MB', required: true },
                        { name: 'tutorial', label: '安装教程', type: 'textarea', placeholder: '安装步骤说明（支持换行）', required: false },
                        { name: 'download_link', label: '下载链接', type: 'text', placeholder: '例如：https://example.com/download.zip', required: false },
                        { name: 'history_versions', label: '历史版本', type: 'json_array', placeholder: 'JSON数组格式', required: false }
                    ]
                }
            }
        ];

        for (const cat of softwareCategories) {
            await db.run(
                'UPDATE categories SET meta_schema = ? WHERE slug = ?',
                [JSON.stringify(cat.schema), cat.slug]
            );
            console.log(`已更新分类: ${cat.slug}`);
        }

        console.log('\n✅ 所有软件工具分类的meta_schema已更新（已移除category字段）');
        process.exit(0);
    } catch (error) {
        console.error('更新失败:', error);
        process.exit(1);
    }
}

updateCategorySchema();

