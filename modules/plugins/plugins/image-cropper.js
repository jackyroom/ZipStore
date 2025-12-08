/**
 * 图片裁切插件 (Image Cropper)
 * Features: Batch processing, Custom selection handles, Aspect Ratio, Export
 */
(function () {
    'use strict';

    const ImageCropper = {
        state: {
            files: [],
            activeIndex: 0,
            cropRect: { x: 0, y: 0, w: 0, h: 0 },
            imgParams: { w: 0, h: 0, scale: 1, offsetX: 0, offsetY: 0, naturalWidth: 0, naturalHeight: 0 },
            aspectRatio: 0, // 0 = Free
            isDragging: false,
            dragMode: null, // 'move', 'nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'
            startX: 0,
            startY: 0
        },

        render: function (container) {
            // Check for JSZip
            if (typeof JSZip === 'undefined') {
                container.innerHTML = '<div class="plugin-ui-group"><div class="plugin-ui-status error">Error: JSZip not loaded.</div></div>';
                return;
            }

            container.innerHTML = `
                <div class="plugin-runtime-grid">
                    <!-- Sidebar Controls -->
                    <div class="pr-sidebar">
                        <div class="pr-sidebar-header">
                            <h4>批量图片裁切</h4>
                            <p>调整尺寸、裁切比例并批量导出</p>
                        </div>
                        <div class="pr-controls">
                            <!-- File Input -->
                            <div class="pr-control-group">
                                <label class="pr-label"><i class="fa-solid fa-images"></i> 选择图片</label>
                                <input type="file" id="cr-files" multiple accept="image/*" class="pr-input">
                                <div class="pr-hint" id="cr-count-hint">未选择文件</div>
                            </div>
                            
                            <!-- File List -->
                            <div class="pr-control-group" style="flex:1; overflow:hidden; display:flex; flex-direction:column;">
                                <label class="pr-label">文件列表</label>
                                <div id="cr-file-list" class="cr-file-list" style="overflow-y:auto; flex:1; max-height:200px; border:1px solid rgba(255,255,255,0.1); border-radius:6px; padding:5px;"></div>
                            </div>

                            <hr style="border:0; border-top:1px solid rgba(255,255,255,0.1); margin:10px 0;">

                            <!-- Aspect Ratio -->
                            <div class="pr-control-group">
                                <label class="pr-label"><i class="fa-solid fa-crop"></i> 裁切比例</label>
                                <select id="cr-ratio" class="pr-input" style="appearance:auto; background:rgba(15,23,42,0.6);">
                                    <option value="0">自由比例 (Free)</option>
                                    <option value="1">1:1 (方形)</option>
                                    <option value="1.777777">16:9</option>
                                    <option value="1.333333">4:3</option>
                                    <option value="0.75">3:4</option>
                                    <option value="0.5625">9:16</option>
                                </select>
                            </div>

                            <!-- Manual Size -->
                            <div class="pr-control-group">
                                <label class="pr-label">裁切尺寸 (px)</label>
                                <div style="display:flex; gap:10px;">
                                    <input type="number" id="cr-width" placeholder="W" class="pr-input">
                                    <input type="number" id="cr-height" placeholder="H" class="pr-input">
                                </div>
                                <button id="cr-apply-all" class="plugin-ui-btn-secondary" style="margin-top:10px; width:100%; font-size:0.8rem; padding:8px;">
                                    <i class="fa-solid fa-clone"></i> 应用到所有图片
                                </button>
                            </div>
                        </div>

                        <div class="pr-footer">
                            <button id="cr-download" class="plugin-ui-btn-primary" disabled>
                                <i class="fa-solid fa-download"></i> 导出选定区域 (.zip)
                            </button>
                            <div id="cr-status" style="margin-top:10px; font-size:0.85rem; color:var(--text-muted); text-align:center;"></div>
                        </div>
                    </div>

                    <!-- Main Canvas Area -->
                    <div class="pr-main" style="background:#000;">
                        <div id="cr-stage" class="cropper-stage">
                            <div id="cr-empty" class="pr-empty-state">
                                <i class="fa-solid fa-crop"></i>
                                <p>请选择图片开始裁切</p>
                            </div>
                            <div id="cr-canvas-wrapper" class="cropper-canvas-wrapper" style="display:none;">
                                <img id="cr-image" class="cropper-img">
                                <div id="cr-overlay" class="crop-overlay">
                                    <div id="cr-box" class="crop-box">
                                        <div class="crop-handle handle-nw" data-dir="nw"></div>
                                        <div class="crop-handle handle-n" data-dir="n"></div>
                                        <div class="crop-handle handle-ne" data-dir="ne"></div>
                                        <div class="crop-handle handle-e" data-dir="e"></div>
                                        <div class="crop-handle handle-se" data-dir="se"></div>
                                        <div class="crop-handle handle-s" data-dir="s"></div>
                                        <div class="crop-handle handle-sw" data-dir="sw"></div>
                                        <div class="crop-handle handle-w" data-dir="w"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            this.bindEvents();
        },

        bindEvents: function () {
            const fileInput = document.getElementById('cr-files');
            const fileListParams = document.getElementById('cr-file-list');
            const ratioSelect = document.getElementById('cr-ratio');
            const widthInput = document.getElementById('cr-width');
            const heightInput = document.getElementById('cr-height');
            const applyAllBtn = document.getElementById('cr-apply-all');
            const downloadBtn = document.getElementById('cr-download');
            const statusDiv = document.getElementById('cr-status');
            const imgEl = document.getElementById('cr-image');
            const wrapper = document.getElementById('cr-canvas-wrapper');
            const emptyState = document.getElementById('cr-empty');
            const cropBox = document.getElementById('cr-box');
            const overlay = document.getElementById('cr-overlay');

            const state = this.state;
            state.files = [];

            // File selection
            fileInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    state.files = Array.from(e.target.files).map(f => ({
                        file: f,
                        name: f.name,
                        crop: null // Store crop relative: {x%, y%, w%, h%}
                    }));
                    state.activeIndex = 0;
                    renderFileList();
                    loadImage(0);
                    downloadBtn.disabled = false;
                    document.getElementById('cr-count-hint').textContent = `已选 ${state.files.length} 张图片`;
                }
            });

            // List rendering
            const renderFileList = () => {
                let html = '';
                state.files.forEach((item, idx) => {
                    html += `
                        <div class="cr-file-item ${idx === state.activeIndex ? 'active' : ''}" data-index="${idx}">
                            <i class="fa-solid fa-image cr-file-icon"></i>
                            <span class="cr-file-name">${item.name}</span>
                            ${item.crop ? '<i class="fa-solid fa-check cr-file-status"></i>' : ''}
                        </div>
                    `;
                });
                fileListParams.innerHTML = html;

                // Bind click
                fileListParams.querySelectorAll('.cr-file-item').forEach(el => {
                    el.addEventListener('click', () => {
                        const idx = parseInt(el.getAttribute('data-index'));
                        saveCurrentCrop(); // Save before switch
                        state.activeIndex = idx;
                        renderFileList();
                        loadImage(idx);
                    });
                });
            };

            // Load Image
            const loadImage = (index) => {
                const file = state.files[index].file;
                const reader = new FileReader();
                reader.onload = (e) => {
                    imgEl.src = e.target.result;
                    imgEl.onload = () => {
                        emptyState.style.display = 'none';
                        wrapper.style.display = 'block';

                        // Calculate display metrics
                        const wrapperRect = wrapper.getBoundingClientRect(); // This might be tricky if hidden
                        // Actually, we rely on the imgEl styling max-width/max-height to determine wrapper size
                        // We need the natural vs displayed size
                        state.imgParams.naturalWidth = imgEl.naturalWidth;
                        state.imgParams.naturalHeight = imgEl.naturalHeight;
                        state.imgParams.w = imgEl.width;
                        state.imgParams.h = imgEl.height;
                        state.imgParams.scale = state.imgParams.naturalWidth / state.imgParams.w;

                        // Initialize Crop Box (Center 80%)
                        if (state.files[index].crop) {
                            loadCropFromState(state.files[index].crop);
                        } else {
                            initCropBox();
                        }
                    };
                };
                reader.readAsDataURL(file);
            };

            const initCropBox = () => {
                const w = state.imgParams.w * 0.8;
                const h = state.imgParams.h * 0.8;
                const x = (state.imgParams.w - w) / 2;
                const y = (state.imgParams.h - h) / 2;
                updateCropBoxEnv(x, y, w, h);
            };

            const loadCropFromState = (cropRel) => {
                const w = cropRel.w * state.imgParams.w;
                const h = cropRel.h * state.imgParams.h;
                const x = cropRel.x * state.imgParams.w;
                const y = cropRel.y * state.imgParams.h;
                updateCropBoxEnv(x, y, w, h);
            };

            // Update UI & Internal State from pixel values (relative to displayed image)
            const updateCropBoxEnv = (x, y, w, h) => {
                // Bounds check
                if (x < 0) x = 0;
                if (y < 0) y = 0;
                if (w > state.imgParams.w) w = state.imgParams.w;
                if (h > state.imgParams.h) h = state.imgParams.h;
                if (x + w > state.imgParams.w) x = state.imgParams.w - w;
                if (y + h > state.imgParams.h) y = state.imgParams.h - h;

                state.cropRect = { x, y, w, h };

                cropBox.style.left = x + 'px';
                cropBox.style.top = y + 'px';
                cropBox.style.width = w + 'px';
                cropBox.style.height = h + 'px';

                // Update Input Fields (Real Pixels)
                const realW = Math.round(w * state.imgParams.scale);
                const realH = Math.round(h * state.imgParams.scale);
                widthInput.value = realW;
                heightInput.value = realH;
            };

            const saveCurrentCrop = () => {
                if (state.files.length === 0) return;
                state.files[state.activeIndex].crop = {
                    x: state.cropRect.x / state.imgParams.w,
                    y: state.cropRect.y / state.imgParams.h,
                    w: state.cropRect.w / state.imgParams.w,
                    h: state.cropRect.h / state.imgParams.h
                };
                renderFileList(); // Update checkmark
            };

            // Drag Logic
            overlay.addEventListener('mousedown', (e) => {
                if (e.target.classList.contains('crop-handle')) {
                    state.isDragging = true;
                    state.dragMode = e.target.getAttribute('data-dir');
                } else if (e.target.classList.contains('crop-box') || e.target.closest('.crop-box')) {
                    state.isDragging = true;
                    state.dragMode = 'move';
                }
                state.startX = e.clientX;
                state.startY = e.clientY;
                // Cache initial state rect to avoid drift
                state.initialRect = { ...state.cropRect };
            });

            document.addEventListener('mousemove', (e) => {
                if (!state.isDragging) return;
                e.preventDefault();
                const dx = e.clientX - state.startX;
                const dy = e.clientY - state.startY;

                let { x, y, w, h } = state.initialRect;
                const mode = state.dragMode;

                // Move
                if (mode === 'move') {
                    x += dx;
                    y += dy;
                }
                // Resize
                else {
                    if (mode.includes('e')) w += dx;
                    if (mode.includes('s')) h += dy;
                    if (mode.includes('w')) { x += dx; w -= dx; }
                    if (mode.includes('n')) { y += dy; h -= dy; }
                }

                // Aspect Ratio Constraint (Simple implementation)
                const ratio = parseFloat(ratioSelect.value);
                if (ratio > 0 && mode !== 'move') {
                    // Try to maintain width, adj height OR vice versa depending on direction
                    // Usually we set height based on width
                    if (mode === 'e' || mode === 'w') {
                        h = w / ratio;
                        if (mode === 'nw' || mode === 'ne') y = state.initialRect.y + (state.initialRect.h - h);
                    } else if (mode === 'n' || mode === 's') {
                        w = h * ratio;
                        if (mode === 'nw' || mode === 'sw') x = state.initialRect.x + (state.initialRect.w - w);
                    } else {
                        // Corner resize - enforce ratio
                        h = w / ratio;
                    }
                }

                updateCropBoxEnv(x, y, w, h);
            });

            document.addEventListener('mouseup', () => {
                if (state.isDragging) {
                    state.isDragging = false;
                    saveCurrentCrop();
                }
            });

            // Control Handlers
            ratioSelect.addEventListener('change', () => {
                state.aspectRatio = parseFloat(ratioSelect.value);
                if (state.aspectRatio > 0) {
                    let { w } = state.cropRect;
                    let h = w / state.aspectRatio;
                    // Fit if too tall
                    if (h > state.imgParams.h) {
                        h = state.imgParams.h;
                        w = h * state.aspectRatio;
                    }
                    updateCropBoxEnv(state.cropRect.x, state.cropRect.y, w, h);
                    saveCurrentCrop();
                }
            });

            // Manual Input
            const updateFromInput = () => {
                const rw = parseInt(widthInput.value) || 0;
                const rh = parseInt(heightInput.value) || 0;
                if (rw > 0 && rh > 0) {
                    const w = rw / state.imgParams.scale;
                    const h = rh / state.imgParams.scale;
                    updateCropBoxEnv(state.cropRect.x, state.cropRect.y, w, h);
                    saveCurrentCrop();
                }
            };
            widthInput.addEventListener('change', updateFromInput);
            heightInput.addEventListener('change', updateFromInput);

            // Apply All
            applyAllBtn.addEventListener('click', () => {
                saveCurrentCrop();
                const currentRel = state.files[state.activeIndex].crop;
                state.files.forEach(f => {
                    f.crop = { ...currentRel };
                });
                renderFileList();
                alert(`已将当前裁切设置应用到所有 ${state.files.length} 张图片`);
            });

            // Export
            downloadBtn.addEventListener('click', async () => {
                saveCurrentCrop();
                statusDiv.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 处理中...';
                downloadBtn.disabled = true;

                try {
                    const zip = new JSZip();

                    for (let item of state.files) {
                        const crop = item.crop;
                        if (!crop) continue; // Should not happen if viewed, but default fallback?

                        // Load raw image to canvas
                        const img = new Image();
                        img.src = URL.createObjectURL(item.file);
                        await new Promise(r => img.onload = r);

                        // Calc real pixel crop
                        // item.crop is relative to DISPLAY size? No, we stored it relative to display dims
                        // but width/height ratios are consistent.
                        // x_rel = x_disp / w_disp = x_real / w_real
                        const sx = crop.x * img.naturalWidth;
                        const sy = crop.y * img.naturalHeight;
                        const sWidth = crop.w * img.naturalWidth;
                        const sHeight = crop.h * img.naturalHeight;

                        const canvas = document.createElement('canvas');
                        canvas.width = sWidth;
                        canvas.height = sHeight;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, sWidth, sHeight);

                        // Blob
                        const blob = await new Promise(r => canvas.toBlob(r, item.file.type));
                        zip.file(`cropped_${item.name}`, blob);
                    }

                    statusDiv.innerHTML = '打包下载中...';
                    const content = await zip.generateAsync({ type: "blob" });
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(content);
                    link.download = `cropped_images_${Date.now()}.zip`;
                    link.click();

                    statusDiv.innerHTML = '导出成功!';
                    downloadBtn.disabled = false;

                } catch (e) {
                    console.error(e);
                    statusDiv.innerHTML = 'Error: ' + e.message;
                    downloadBtn.disabled = false;
                }
            });
        }
    };

    window.ImageCropper = ImageCropper;
})();
