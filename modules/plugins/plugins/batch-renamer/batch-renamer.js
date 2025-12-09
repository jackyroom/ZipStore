/**
 * 批量文件重命名插件
 */
(function () {
    'use strict';

    const BatchRenamer = {
        render: function (container) {
            // 检查 JSZip 是否可用
            if (typeof JSZip === 'undefined') {
                container.innerHTML = `
                    <div class="plugin-ui-group">
                        <div class="plugin-ui-status error">
                            <i class="fa-solid fa-exclamation-triangle"></i> 
                            JSZip 库未加载。请刷新页面或检查网络连接。
                        </div>
                    </div>
                `;
                return;
            }

            container.innerHTML = `
                <div class="plugin-runtime-grid">
                    <!-- Left Sidebar: Controls -->
                    <div class="pr-sidebar">
                        <div class="pr-sidebar-header">
                            <h4>批量文件重命名</h4>
                            <p>支持多选、文件夹、正则及自动序号</p>
                        </div>

                        <div class="pr-controls">
                            <!-- File Selection -->
                            <div class="pr-control-group">
                                <label class="pr-label">
                                    <i class="fa-solid fa-folder-open"></i> 文件来源
                                </label>
                                <div class="file-input-wrapper" style="display:flex; gap:10px;">
                                    <div style="flex:1;">
                                        <input type="file" id="pr-files" multiple class="pr-input" style="display:block;">
                                        <input type="file" id="pr-folder" webkitdirectory directory multiple class="pr-input" style="display:none;">
                                    </div>
                                    <button type="button" class="btn-dark" id="pr-switch-btn" title="切换文件/文件夹模式" style="width:40px; padding:0;">
                                        <i class="fa-solid fa-folder"></i>
                                    </button>
                                </div>
                                <div class="pr-hint" id="pr-select-hint">当前：选择多个文件</div>
                            </div>

                            <hr style="border:0; border-top:1px solid rgba(255,255,255,0.05); margin:10px 0;">

                            <!-- Mode Selector -->
                            <div class="pr-control-group">
                                <label class="pr-label">
                                    <i class="fa-solid fa-sliders"></i> 模式
                                </label>
                                <div class="mode-selector" style="display:flex; gap:15px; font-size:0.85rem; color:#cbd5e1;">
                                    <label style="cursor:pointer;"><input type="radio" name="rename-mode" value="find-replace" checked> 查找替换</label>
                                    <label style="cursor:pointer;"><input type="radio" name="rename-mode" value="prefix-suffix"> 前缀/后缀</label>
                                    <label style="cursor:pointer;"><input type="radio" name="rename-mode" value="auto-number"> 自动序号</label>
                                </div>
                            </div>

                            <!-- Find & Replace Inputs -->
                            <div id="mode-find-replace" class="rename-mode-panel">
                                <div class="pr-control-group">
                                    <label class="pr-label">查找 (支持正则)</label>
                                    <input type="text" id="pr-find" placeholder="如: IMG_ 或 \d{4}" class="pr-input">
                                </div>
                                <div class="pr-control-group">
                                    <label class="pr-label">替换为</label>
                                    <input type="text" id="pr-replace" placeholder="Photo_" class="pr-input">
                                </div>
                            </div>

                            <!-- Prefix & Suffix Inputs -->
                            <div id="mode-prefix-suffix" class="rename-mode-panel" style="display:none;">
                                <div class="pr-control-group">
                                    <label class="pr-label">前缀</label>
                                    <input type="text" id="pr-prefix" placeholder="如: image_" class="pr-input">
                                </div>
                                <div class="pr-control-group">
                                    <label class="pr-label">后缀</label>
                                    <input type="text" id="pr-suffix" placeholder="如: _backup" class="pr-input">
                                </div>
                            </div>

                            <!-- Auto Number Inputs -->
                            <div id="mode-auto-number" class="rename-mode-panel" style="display:none;">
                                <div class="pr-control-group">
                                    <label class="pr-label">前缀文本</label>
                                    <input type="text" id="pr-auto-prefix" placeholder="如: image" class="pr-input">
                                </div>
                                <div class="pr-control-group">
                                    <label class="pr-label">序号格式</label>
                                    <select id="pr-number-format" class="pr-input" style="appearance:auto; background:rgba(15,23,42,0.6);">
                                        <option value="01">01, 02... (两位)</option>
                                        <option value="001" selected>001, 002... (三位)</option>
                                        <option value="1">1, 2... (无前导零)</option>
                                    </select>
                                </div>
                                <div class="pr-control-group">
                                    <label class="pr-label">起始序号</label>
                                    <input type="number" id="pr-start-number" value="1" min="0" class="pr-input">
                                </div>
                            </div>
                        </div>

                        <div class="pr-footer">
                            <button id="pr-download" class="plugin-ui-btn-primary" disabled>
                                <i class="fa-solid fa-download"></i> 生成并下载 (.zip)
                            </button>
                            <div id="pr-status" style="margin-top:10px; font-size:0.85rem; color:var(--text-muted); text-align:center;"></div>
                        </div>
                    </div>

                    <!-- Right Main: Preview -->
                    <div class="pr-main">
                        <div id="pr-preview" class="pr-preview-area">
                            <div class="pr-empty-state">
                                <i class="fa-solid fa-file-signature"></i>
                                <p>请先选择文件进行预览</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            this.bindEvents();
        },

        bindEvents: function () {
            const fileInput = document.getElementById('pr-files');
            const folderInput = document.getElementById('pr-folder');
            const switchBtn = document.getElementById('pr-switch-btn');
            const selectHint = document.getElementById('pr-select-hint');

            const findInput = document.getElementById('pr-find');
            const replaceInput = document.getElementById('pr-replace');
            const prefixInput = document.getElementById('pr-prefix');
            const suffixInput = document.getElementById('pr-suffix');
            const autoPrefixInput = document.getElementById('pr-auto-prefix');
            const numberFormatSelect = document.getElementById('pr-number-format');
            const startNumberInput = document.getElementById('pr-start-number');

            const previewBox = document.getElementById('pr-preview');
            const downloadBtn = document.getElementById('pr-download');
            const statusDiv = document.getElementById('pr-status');

            const modeRadios = document.querySelectorAll('input[name="rename-mode"]');
            const modePanels = document.querySelectorAll('.rename-mode-panel');

            let activeInput = fileInput;
            let isFolderMode = false;

            // Switch Input Mode
            switchBtn.addEventListener('click', (e) => {
                e.preventDefault();
                isFolderMode = !isFolderMode;
                if (isFolderMode) {
                    fileInput.style.display = 'none';
                    folderInput.style.display = 'block';
                    activeInput = folderInput;
                    switchBtn.innerHTML = '<i class="fa-solid fa-file"></i>';
                    selectHint.textContent = '当前：选择文件夹 (含子目录)';
                } else {
                    fileInput.style.display = 'block';
                    folderInput.style.display = 'none';
                    activeInput = fileInput;
                    switchBtn.innerHTML = '<i class="fa-solid fa-folder"></i>';
                    selectHint.textContent = '当前：选择多个文件';
                }
                // Clear preview
                previewBox.innerHTML = `
                    <div class="pr-empty-state">
                        <i class="fa-solid fa-file-signature"></i>
                        <p>请先选择文件或文件夹...</p>
                    </div>
                `;
                downloadBtn.disabled = true;
            });

            // Switch Rename Mode
            modeRadios.forEach(radio => {
                radio.addEventListener('change', () => {
                    const mode = radio.value;
                    modePanels.forEach(panel => panel.style.display = 'none');
                    document.getElementById(`mode-${mode}`).style.display = 'block';
                    updatePreview();
                });
            });

            // Logic to generate new name
            const generateNewName = (fileName, index) => {
                const activeMode = document.querySelector('input[name="rename-mode"]:checked').value;
                // Simple extension extraction
                const lastDot = fileName.lastIndexOf('.');
                const ext = lastDot !== -1 ? fileName.substring(lastDot) : '';
                const nameWithoutExt = lastDot !== -1 ? fileName.substring(0, lastDot) : fileName;

                if (activeMode === 'find-replace') {
                    const findStr = findInput.value;
                    const replaceStr = replaceInput.value;
                    if (findStr) {
                        try {
                            const regex = new RegExp(findStr, 'g');
                            return nameWithoutExt.replace(regex, replaceStr) + ext;
                        } catch (e) {
                            return nameWithoutExt.split(findStr).join(replaceStr) + ext;
                        }
                    }
                    return fileName;
                } else if (activeMode === 'prefix-suffix') {
                    const prefix = prefixInput.value || '';
                    const suffix = suffixInput.value || '';
                    return prefix + nameWithoutExt + suffix + ext;
                } else if (activeMode === 'auto-number') {
                    const prefix = autoPrefixInput.value || '';
                    const format = numberFormatSelect.value;
                    const startNum = parseInt(startNumberInput.value) || 1;
                    const currentNum = startNum + index;

                    let numberStr = '';
                    if (format === '01') {
                        numberStr = String(currentNum).padStart(2, '0');
                    } else if (format === '001') {
                        numberStr = String(currentNum).padStart(3, '0');
                    } else {
                        numberStr = String(currentNum);
                    }
                    return prefix + numberStr + ext;
                }
                return fileName;
            };

            const updatePreview = () => {
                const files = activeInput.files;
                if (!files || files.length === 0) {
                    previewBox.innerHTML = `
                        <div class="pr-empty-state">
                            <i class="fa-solid fa-file-signature"></i>
                            <p>请先选择文件或文件夹...</p>
                        </div>
                    `;
                    downloadBtn.disabled = true;
                    return;
                }

                let html = '<div class="pr-file-list">';
                const fileArray = Array.from(files);

                // Folder Info
                const isFolder = fileArray.length > 0 && fileArray[0].webkitRelativePath;
                if (isFolder) {
                    const firstFile = fileArray[0];
                    const folderPath = firstFile.webkitRelativePath.split('/')[0];
                    html += `
                        <div style="padding:12px; border-bottom:1px solid rgba(255,255,255,0.1); color:#94a3b8; font-size:0.9rem;">
                            <i class="fa-solid fa-folder"></i> 文件夹: ${folderPath} (${fileArray.length} items)
                        </div>
                    `;
                }

                fileArray.forEach((file, index) => {
                    const newName = generateNewName(file.name, index);
                    const isChanged = file.name !== newName;
                    const relativePath = file.webkitRelativePath ? ` (${file.webkitRelativePath})` : '';

                    html += `
                        <div class="pr-file-item ${isChanged ? 'changed' : ''}">
                            <div style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:#94a3b8;" title="${file.name}">
                                ${file.name}
                            </div>
                            <div class="pr-arrow"><i class="fa-solid fa-arrow-right"></i></div>
                            <div style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:${isChanged ? '#818cf8' : 'inherit'}; font-weight:${isChanged ? 600 : 400}" title="${newName}">
                                ${newName}
                            </div>
                        </div>
                    `;
                });
                html += '</div>';
                previewBox.innerHTML = html;
                downloadBtn.disabled = false;
            };

            // Bind triggers
            [fileInput, folderInput].forEach(el => el.addEventListener('change', updatePreview));
            [findInput, replaceInput, prefixInput, suffixInput, autoPrefixInput, numberFormatSelect, startNumberInput].forEach(el => {
                el.addEventListener('input', updatePreview);
                if (el.tagName === 'SELECT') el.addEventListener('change', updatePreview); // ensure select works
            });

            downloadBtn.addEventListener('click', async () => {
                statusDiv.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 处理中...';
                statusDiv.style.color = '#94a3b8';
                downloadBtn.disabled = true;

                try {
                    const zip = new JSZip();
                    const files = Array.from(activeInput.files);

                    for (let i = 0; i < files.length; i++) {
                        const file = files[i];
                        const newName = generateNewName(file.name, i);

                        // Wait for file read
                        const fileData = await new Promise((resolve, reject) => {
                            const reader = new FileReader();
                            reader.onload = (e) => resolve(e.target.result);
                            reader.onerror = reject;
                            reader.readAsArrayBuffer(file);
                        });
                        zip.file(newName, fileData);

                        // Update UI sometimes if big
                        if (i % 10 === 0) statusDiv.innerHTML = `处理中 ${i}/${files.length}`;
                    }

                    statusDiv.innerHTML = '打包中...';
                    const zipBlob = await zip.generateAsync({
                        type: 'blob',
                        compression: 'DEFLATE'
                    });

                    // Download
                    const url = URL.createObjectURL(zipBlob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `renamed-files-${Date.now()}.zip`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);

                    statusDiv.innerHTML = `<i class="fa-solid fa-check-circle"></i> 成功 (${files.length}个文件)`;
                    statusDiv.style.color = '#10b981';

                } catch (error) {
                    console.error(error);
                    statusDiv.innerHTML = '失败: ' + error.message;
                    statusDiv.style.color = '#ef4444';
                    downloadBtn.disabled = false;
                }
            });
        }
    };

    window.BatchRenamer = BatchRenamer;
})();
