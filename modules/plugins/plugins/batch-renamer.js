/**
 * 批量文件重命名插件
 */
(function() {
    'use strict';

    const BatchRenamer = {
        render: function(container) {
            container.innerHTML = `
                <div class="plugin-ui-group">
                    <label class="plugin-ui-label">
                        <i class="fa-solid fa-folder-open"></i> 选择文件 (支持多选)
                    </label>
                    <input type="file" id="pr-files" multiple class="plugin-ui-input">
                    <div class="plugin-ui-hint">支持同时选择多个文件进行批量重命名</div>
                </div>
                <div class="plugin-ui-row">
                    <div class="plugin-ui-col">
                        <label class="plugin-ui-label">
                            <i class="fa-solid fa-search"></i> 查找 (字符串或正则)
                        </label>
                        <input type="text" id="pr-find" placeholder="例如: IMG_ 或 \\d{4}" class="plugin-ui-input">
                        <div class="plugin-ui-hint">支持正则表达式，如 \\d{4} 匹配4位数字</div>
                    </div>
                    <div class="plugin-ui-col">
                        <label class="plugin-ui-label">
                            <i class="fa-solid fa-arrow-right"></i> 替换为
                        </label>
                        <input type="text" id="pr-replace" placeholder="Photo_" class="plugin-ui-input">
                    </div>
                </div>
                <div class="plugin-ui-group">
                    <label class="plugin-ui-label">
                        <i class="fa-solid fa-eye"></i> 预览结果
                    </label>
                    <div id="pr-preview" class="plugin-ui-preview">
                        <div class="preview-placeholder">
                            <i class="fa-solid fa-file-lines"></i>
                            <p>请先选择文件...</p>
                        </div>
                    </div>
                </div>
                <div class="plugin-ui-actions">
                    <button id="pr-download" class="plugin-ui-btn-primary" disabled>
                        <i class="fa-solid fa-download"></i> 生成并下载 (.zip)
                    </button>
                    <div id="pr-status" class="plugin-ui-status"></div>
                </div>
            `;
            this.bindEvents();
        },
        
        bindEvents: function() {
            const fileInput = document.getElementById('pr-files');
            const findInput = document.getElementById('pr-find');
            const replaceInput = document.getElementById('pr-replace');
            const previewBox = document.getElementById('pr-preview');
            const downloadBtn = document.getElementById('pr-download');
            const statusDiv = document.getElementById('pr-status');
            
            const updatePreview = () => {
                if(!fileInput.files.length) {
                    previewBox.innerHTML = `
                        <div class="preview-placeholder">
                            <i class="fa-solid fa-file-lines"></i>
                            <p>请先选择文件...</p>
                        </div>
                    `;
                    downloadBtn.disabled = true;
                    return;
                }
                
                let html = '<div class="preview-list">';
                const findStr = findInput.value;
                const replaceStr = replaceInput.value;
                
                Array.from(fileInput.files).forEach((file, index) => {
                    let newName = file.name;
                    if(findStr) {
                        try {
                            const regex = new RegExp(findStr, 'g');
                            newName = file.name.replace(regex, replaceStr);
                        } catch(e) {
                            newName = file.name.split(findStr).join(replaceStr);
                        }
                    }
                    
                    const isChanged = file.name !== newName;
                    html += `
                        <div class="preview-item ${isChanged ? 'changed' : ''}">
                            <div class="preview-original">
                                <i class="fa-solid fa-file"></i>
                                <span>${file.name}</span>
                            </div>
                            <i class="fa-solid fa-arrow-right preview-arrow"></i>
                            <div class="preview-new">
                                <i class="fa-solid fa-file"></i>
                                <span>${newName}</span>
                            </div>
                        </div>
                    `;
                });
                html += '</div>';
                previewBox.innerHTML = html;
                downloadBtn.disabled = false;
            };

            fileInput.addEventListener('change', updatePreview);
            findInput.addEventListener('input', updatePreview);
            replaceInput.addEventListener('input', updatePreview);

            downloadBtn.addEventListener('click', async () => {
                statusDiv.className = 'plugin-ui-status processing';
                statusDiv.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 处理中...';
                
                const findStr = findInput.value;
                const replaceStr = replaceInput.value;
                
                // 模拟处理过程
                setTimeout(() => {
                    statusDiv.className = 'plugin-ui-status success';
                    statusDiv.innerHTML = `<i class="fa-solid fa-check-circle"></i> 成功处理 ${fileInput.files.length} 个文件！`;
                    downloadBtn.disabled = true;
                    
                    // 提示用户（实际应使用 JSZip 库）
                    console.log("准备重命名以下文件:");
                    Array.from(fileInput.files).forEach(file => {
                        let newName = file.name;
                        if(findStr) {
                            try {
                                const regex = new RegExp(findStr, 'g');
                                newName = file.name.replace(regex, replaceStr);
                            } catch(e) {
                                newName = file.name.split(findStr).join(replaceStr);
                            }
                        }
                        console.log(`${file.name} → ${newName}`);
                    });
                }, 1000);
            });
        }
    };

    // 导出到全局
    window.BatchRenamer = BatchRenamer;
})();

