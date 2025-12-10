const db = require('../../core/db-access');
const path = require('path');
const fs = require('fs');

// 下载资源并更新下载量
async function downloadResource(resourceId, res) {
    try {
        // 获取资源信息
        const resource = await db.get(`
            SELECT r.*, a.file_path, a.original_name, a.mime_type
            FROM resources r
            LEFT JOIN assets a ON r.id = a.resource_id
            WHERE r.id = ? AND r.status = 'published'
            ORDER BY a.is_cover DESC
            LIMIT 1
        `, [resourceId]);

        if (!resource) {
            return res.status(404).send('资源不存在');
        }

        // 更新下载量
        await db.run("UPDATE resources SET downloads = downloads + 1 WHERE id = ?", [resourceId]);

        // 如果有文件，提供下载
        if (resource.file_path) {
            const filePath = path.join(__dirname, '..', '..', 'public', resource.file_path);
            if (fs.existsSync(filePath)) {
                const filename = resource.original_name || path.basename(resource.file_path);
                res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
                res.setHeader('Content-Type', resource.mime_type || 'application/octet-stream');
                return res.sendFile(path.resolve(filePath));
            }
        }

        // 如果没有文件，返回资源信息
        res.json({
            success: true,
            message: '下载量已更新',
            resource: {
                id: resource.id,
                title: resource.title,
                downloads: (resource.downloads || 0) + 1
            }
        });
    } catch (error) {
        console.error('下载失败:', error);
        res.status(500).json({ error: error.message });
    }
}

module.exports = { downloadResource };

