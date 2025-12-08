/**
 * 智能图片压缩插件
 */
(function () {
    'use strict';

    const ImageCompressor = {
        render: function (container) {
            container.innerHTML = `
                <div class="plugin-runtime-grid">
                    <!-- Left Sidebar for Settings -->
                    <div class="pr-sidebar">
                        <div class="pr-sidebar-header">
                            <h4>智能图片压缩</h4>
                            <p>压缩图片体积，保持画质清晰</p>
                        </div>
                        
                        <div class="pr-controls">
                            <!-- File Input -->
                            <div class="pr-control-group">
                                <label class="pr-label">
                                    <i class="fa-solid fa-image"></i> 选择图片
                                </label>
                                <input type="file" id="pic-file" accept="image/*" class="pr-input">
                                <div class="pr-hint">支持 JPG, PNG, WebP</div>
                            </div>
                            
                            <!-- Quality Slider -->
                            <div class="pr-control-group">
                                <label class="pr-label">
                                    <i class="fa-solid fa-compress"></i> 压缩质量 
                                    <span style="margin-left:auto; color:var(--primary)"><span id="pic-q-val">80</span>%</span>
                                </label>
                                <div class="slider-container">
                                    <input type="range" id="pic-quality" min="1" max="100" value="80" class="plugin-slider">
                                </div>
                            </div>

                            <!-- Scale Slider -->
                            <div class="pr-control-group">
                                <label class="pr-label">
                                    <i class="fa-solid fa-expand"></i> 缩放比例
                                    <span style="margin-left:auto; color:var(--primary)"><span id="pic-s-val">100</span>%</span>
                                </label>
                                <div class="slider-container">
                                    <input type="range" id="pic-scale" min="10" max="100" value="100" class="plugin-slider">
                                </div>
                            </div>
                        </div>

                        <div class="pr-footer">
                            <button id="pic-download" class="plugin-ui-btn-primary" disabled>
                                <i class="fa-solid fa-download"></i> 下载处理后的图片
                            </button>
                        </div>
                    </div>

                    <!-- Right Main Content for Preview -->
                    <div class="pr-main">
                        <div id="pic-preview-wrapper" class="pr-preview-area" style="display:none;">
                            <div class="image-preview-container">
                                <img id="pic-preview" class="preview-image">
                            </div>
                            <!-- Floating Overlay Info -->
                            <div class="preview-overlay">
                                <div class="preview-info" id="pic-info"></div>
                            </div>
                        </div>
                        
                        <div id="pic-placeholder" class="pr-empty-state">
                            <i class="fa-solid fa-image"></i>
                            <p>请在左侧选择图片</p>
                        </div>
                    </div>
                </div>
            `;
            this.bindEvents();
        },

        bindEvents: function () {
            const input = document.getElementById('pic-file');
            const qualityRange = document.getElementById('pic-quality');
            const scaleRange = document.getElementById('pic-scale');
            const preview = document.getElementById('pic-preview');
            const previewWrapper = document.getElementById('pic-preview-wrapper');
            const placeholder = document.getElementById('pic-placeholder');
            const info = document.getElementById('pic-info');
            const btn = document.getElementById('pic-download');

            let originalImage = null;
            let originalSize = 0;

            // Updated value display logic
            qualityRange.oninput = () => {
                document.getElementById('pic-q-val').textContent = qualityRange.value;
                processImage();
            };

            scaleRange.oninput = () => {
                document.getElementById('pic-s-val').textContent = scaleRange.value;
                processImage();
            };

            const processImage = () => {
                if (!originalImage) return;

                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const scale = parseInt(scaleRange.value) / 100;
                const quality = parseInt(qualityRange.value) / 100;

                canvas.width = originalImage.width * scale;
                canvas.height = originalImage.height * scale;
                ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);

                const dataUrl = canvas.toDataURL('image/jpeg', quality);
                preview.src = dataUrl;

                // Show preview, hide placeholder
                previewWrapper.style.display = 'flex'; // Flex for centering
                placeholder.style.display = 'none';

                // Calculate size
                const head = 'data:image/jpeg;base64,';
                const compressedSize = Math.round((dataUrl.length - head.length) * 3 / 4);
                const compressionRatio = ((1 - compressedSize / originalSize) * 100).toFixed(1);

                // Updated Info HTML
                info.innerHTML = `
                    <div class="info-row" style="display:flex; justify-content:space-between; gap:20px; margin-bottom:4px">
                        <span class="info-label" style="color:#94a3b8">原始大小</span>
                        <span class="info-value" style="color:#e2e8f0">${(originalSize / 1024).toFixed(2)} KB</span>
                    </div>
                    <div class="info-row" style="display:flex; justify-content:space-between; gap:20px; margin-bottom:4px">
                        <span class="info-label" style="color:#94a3b8">压缩后</span>
                        <span class="info-value" style="color:#10b981; font-weight:bold">${(compressedSize / 1024).toFixed(2)} KB</span>
                    </div>
                    <div class="info-row" style="display:flex; justify-content:space-between; gap:20px;">
                        <span class="info-label" style="color:#94a3b8">压缩率</span>
                        <span class="info-value" style="color:#3b82f6">-${compressionRatio}%</span>
                    </div>
                `;

                btn.disabled = false;
                btn.onclick = () => {
                    const link = document.createElement('a');
                    link.download = `compressed-${Date.now()}.jpg`;
                    link.href = dataUrl;
                    link.click();
                };
            };

            input.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    originalSize = file.size;
                    const reader = new FileReader();
                    reader.onload = (evt) => {
                        originalImage = new Image();
                        originalImage.onload = () => {
                            processImage();
                        };
                        originalImage.src = evt.target.result;
                    };
                    reader.readAsDataURL(file);
                }
            };
        }
    };

    // 导出到全局
    window.ImageCompressor = ImageCompressor;
})();

