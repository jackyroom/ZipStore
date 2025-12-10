const { upload, saveAssetToDB } = require('../../../core/upload-middleware');
const { getCurrentUser } = require('../admin-helpers');
const path = require('path');

module.exports = [
    {
        path: '/api/upload',
        method: 'post',
        handler: async (req, res) => {
            try {
                const uploadSingle = upload.single('file');
                uploadSingle(req, res, async (err) => {
                    if (err) {
                        return res.status(400).json({ error: err.message });
                    }
                    if (!req.file) {
                        return res.status(400).json({ error: '未选择文件' });
                    }

                    const user = await getCurrentUser(req);
                    const asset = await saveAssetToDB(req.file, user.id, null, req.body.isCover === 'true');

                    // 如果是模型文件，尝试解析模型信息
                    let modelInfo = null;
                    if (req.body.isModel === 'true' || req.file.mimetype.includes('model') ||
                        ['.glb', '.gltf', '.fbx', '.obj'].some(ext => req.file.originalname.toLowerCase().endsWith(ext))) {
                        try {
                            const { parseModelInfo } = require('../../../core/model-parser');
                            const filePath = path.join(__dirname, '..', '..', '..', 'public', asset.path);
                            modelInfo = await parseModelInfo(filePath);
                        } catch (parseError) {
                            console.warn('解析模型信息失败:', parseError);
                        }
                    }

                    res.json({
                        success: true,
                        asset: {
                            id: asset.id,
                            path: asset.path,
                            size: asset.size,
                            originalName: asset.originalName
                        },
                        modelInfo: modelInfo // 返回解析的模型信息（如果有）
                    });
                });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        }
    }
];
