const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const db = require('./db-access');

// 上传目录配置
const UPLOAD_DIR = path.join(__dirname, '..', 'public', 'uploads');

// 确保上传目录存在
function ensureUploadDir() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const yearDir = path.join(UPLOAD_DIR, String(year));
    const monthDir = path.join(yearDir, month);
    
    if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    if (!fs.existsSync(yearDir)) fs.mkdirSync(yearDir, { recursive: true });
    if (!fs.existsSync(monthDir)) fs.mkdirSync(monthDir, { recursive: true });
    
    return monthDir;
}

// 文件存储配置
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dest = ensureUploadDir();
        cb(null, dest);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const filename = `${uuidv4()}-${Date.now()}${ext}`;
        cb(null, filename);
    }
});

// 文件类型验证
const fileFilter = (req, file, cb) => {
    const allowedTypes = {
        'image/jpeg': ['.jpg', '.jpeg'],
        'image/png': ['.png'],
        'image/gif': ['.gif'],
        'image/webp': ['.webp'],
        'application/zip': ['.zip'],
        'application/x-zip-compressed': ['.zip'],
        'application/pdf': ['.pdf'],
        'application/x-rar-compressed': ['.rar'],
        'application/x-7z-compressed': ['.7z'],
        // 3D模型文件格式
        'model/gltf-binary': ['.glb'],
        'model/gltf+json': ['.gltf'],
        'application/octet-stream': ['.fbx', '.obj', '.dae', '.3ds', '.blend', '.max', '.ma', '.mb'],
        'text/plain': ['.obj', '.mtl']
    };

    const ext = path.extname(file.originalname).toLowerCase();
    const mimeType = file.mimetype;
    
    // 3D模型文件扩展名列表
    const modelExtensions = ['.glb', '.gltf', '.fbx', '.obj', '.dae', '.3ds', '.blend', '.max', '.ma', '.mb', '.mtl', '.stl', '.ply'];

    // 检查是否是允许的MIME类型
    if (allowedTypes[mimeType] && allowedTypes[mimeType].includes(ext)) {
        cb(null, true);
    } 
    // 如果是3D模型文件扩展名，也允许（因为某些浏览器可能无法正确识别MIME类型）
    else if (modelExtensions.includes(ext)) {
        cb(null, true);
    }
    else {
        cb(new Error(`不支持的文件类型: ${mimeType || '未知'}。支持的类型: 图片(jpg/png/gif/webp)、压缩包(zip/rar/7z)、PDF、3D模型(GLB/GLTF/FBX/OBJ/DAE/3DS/BLEND/MAX/MA/MB/STL/PLY)`), false);
    }
};

// 创建multer实例
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 500 * 1024 * 1024 // 500MB
    }
});

// 上传后处理：保存到数据库并更新用户空间
async function saveAssetToDB(file, userId, resourceId = null, isCover = false) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const relativePath = `/uploads/${year}/${month}/${file.filename}`;
    
    // 判断文件类型
    const ext = path.extname(file.originalname).toLowerCase();
    const modelExtensions = ['.glb', '.gltf', '.fbx', '.obj', '.dae', '.3ds', '.blend', '.max', '.ma', '.mb', '.stl', '.ply'];
    
    let fileType = 'other';
    if (file.mimetype.startsWith('image/')) {
        fileType = 'image';
    } else if (file.mimetype.includes('zip') || file.mimetype.includes('rar') || file.mimetype.includes('7z')) {
        fileType = 'archive';
    } else if (file.mimetype.includes('pdf')) {
        fileType = 'pdf';
    } else if (modelExtensions.includes(ext) || file.mimetype.includes('model/') || file.mimetype.includes('gltf')) {
        fileType = 'model';
    }

    try {
        // 插入assets表
        const result = await db.run(
            `INSERT INTO assets (user_id, resource_id, file_path, original_name, file_type, mime_type, size, is_cover) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, resourceId, relativePath, file.originalname, fileType, file.mimetype, file.size, isCover ? 1 : 0]
        );

        // 更新用户空间使用量
        if (userId) {
            await db.run(
                `UPDATE users SET storage_used = storage_used + ? WHERE id = ?`,
                [file.size, userId]
            );
        }

        return {
            id: result.id,
            path: relativePath,
            size: file.size,
            originalName: file.originalname
        };
    } catch (error) {
        // 如果数据库保存失败，删除已上传的文件
        const filePath = path.join(file.destination, file.filename);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        throw error;
    }
}

// 删除文件及其数据库记录
async function deleteAsset(assetId) {
    try {
        // 获取文件信息
        const asset = await db.get('SELECT * FROM assets WHERE id = ?', [assetId]);
        if (!asset) return;

        // 删除物理文件
        const filePath = path.join(__dirname, '..', 'public', asset.file_path);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // 更新用户空间使用量
        if (asset.user_id) {
            await db.run(
                `UPDATE users SET storage_used = storage_used - ? WHERE id = ? AND storage_used >= ?`,
                [asset.size, asset.user_id, asset.size]
            );
        }

        // 删除数据库记录
        await db.run('DELETE FROM assets WHERE id = ?', [assetId]);
    } catch (error) {
        console.error('删除文件失败:', error);
        throw error;
    }
}

module.exports = {
    upload,
    saveAssetToDB,
    deleteAsset,
    // 单文件上传中间件
    single: (fieldName) => upload.single(fieldName),
    // 多文件上传中间件
    multiple: (fieldName, maxCount = 10) => upload.array(fieldName, maxCount),
    // 多字段上传中间件
    fields: (fields) => upload.fields(fields)
};

