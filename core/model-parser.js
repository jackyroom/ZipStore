const fs = require('fs');
const path = require('path');

// 简单的模型信息提取（主要用于GLB/GLTF格式）
async function parseModelInfo(filePath) {
    try {
        const ext = path.extname(filePath).toLowerCase();
        const stats = fs.statSync(filePath);
        const fileSize = stats.size;

        // 对于GLB格式，尝试读取基本信息
        if (ext === '.glb') {
            return await parseGLB(filePath, fileSize);
        }
        
        // 对于GLTF格式，尝试读取JSON信息
        if (ext === '.gltf') {
            return await parseGLTF(filePath, fileSize);
        }

        // 对于其他格式，返回基本信息
        return {
            format: ext.substring(1).toUpperCase(),
            fileSize: formatFileSize(fileSize),
            faces: null, // 需要手动填写
            vertices: null // 需要手动填写
        };
    } catch (error) {
        console.error('解析模型文件失败:', error);
        return null;
    }
}

// 解析GLB文件（二进制格式）
async function parseGLB(filePath, fileSize) {
    try {
        const buffer = fs.readFileSync(filePath);
        
        // GLB文件格式：12字节头部 + chunks
        // 头部：magic (4) + version (4) + length (4)
        if (buffer.length < 12) {
            return null;
        }

        const magic = buffer.readUInt32LE(0);
        if (magic !== 0x46546C67) { // "glTF"
            return null;
        }

        // 读取JSON chunk（通常在第一个chunk）
        let jsonChunk = null;
        let offset = 12;
        
        while (offset < buffer.length) {
            if (offset + 8 > buffer.length) break;
            
            const chunkLength = buffer.readUInt32LE(offset);
            const chunkType = buffer.readUInt32LE(offset + 4);
            offset += 8;

            // 0x4E4F534A = "JSON"
            if (chunkType === 0x4E4F534A) {
                const jsonData = buffer.slice(offset, offset + chunkLength);
                try {
                    jsonChunk = JSON.parse(jsonData.toString('utf8'));
                    break;
                } catch (e) {
                    // JSON解析失败，继续
                }
            }
            offset += chunkLength;
        }

        if (jsonChunk) {
            // 计算面数和顶点数
            let totalFaces = 0;
            let totalVertices = 0;

            if (jsonChunk.meshes) {
                jsonChunk.meshes.forEach(mesh => {
                    if (mesh.primitives) {
                        mesh.primitives.forEach(primitive => {
                            if (primitive.indices !== undefined) {
                                const accessor = jsonChunk.accessors[primitive.indices];
                                if (accessor && accessor.count) {
                                    // 假设是三角形，面数 = 索引数 / 3
                                    totalFaces += Math.floor(accessor.count / 3);
                                }
                            }
                            if (primitive.attributes && primitive.attributes.POSITION !== undefined) {
                                const accessor = jsonChunk.accessors[primitive.attributes.POSITION];
                                if (accessor && accessor.count) {
                                    totalVertices += accessor.count;
                                }
                            }
                        });
                    }
                });
            }

            return {
                format: 'GLB',
                fileSize: formatFileSize(fileSize),
                faces: totalFaces > 0 ? formatNumber(totalFaces) : null,
                vertices: totalVertices > 0 ? formatNumber(totalVertices) : null
            };
        }

        return {
            format: 'GLB',
            fileSize: formatFileSize(fileSize),
            faces: null,
            vertices: null
        };
    } catch (error) {
        console.error('解析GLB失败:', error);
        return {
            format: 'GLB',
            fileSize: formatFileSize(fileSize),
            faces: null,
            vertices: null
        };
    }
}

// 解析GLTF文件（JSON格式）
async function parseGLTF(filePath, fileSize) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const json = JSON.parse(content);

        let totalFaces = 0;
        let totalVertices = 0;

        if (json.meshes) {
            json.meshes.forEach(mesh => {
                if (mesh.primitives) {
                    mesh.primitives.forEach(primitive => {
                        if (primitive.indices !== undefined) {
                            const accessor = json.accessors[primitive.indices];
                            if (accessor && accessor.count) {
                                totalFaces += Math.floor(accessor.count / 3);
                            }
                        }
                        if (primitive.attributes && primitive.attributes.POSITION !== undefined) {
                            const accessor = json.accessors[primitive.attributes.POSITION];
                            if (accessor && accessor.count) {
                                totalVertices += accessor.count;
                            }
                        }
                    });
                }
            });
        }

        return {
            format: 'GLTF',
            fileSize: formatFileSize(fileSize),
            faces: totalFaces > 0 ? formatNumber(totalFaces) : null,
            vertices: totalVertices > 0 ? formatNumber(totalVertices) : null
        };
    } catch (error) {
        console.error('解析GLTF失败:', error);
        return {
            format: 'GLTF',
            fileSize: formatFileSize(fileSize),
            faces: null,
            vertices: null
        };
    }
}

// 格式化数字（添加千位分隔符）
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

module.exports = { parseModelInfo };


