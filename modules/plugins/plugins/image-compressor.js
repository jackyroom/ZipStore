/**
 * 智能图片压缩插件
 */
(function() {
    'use strict';

    const ImageCompressor = {
        render: function(container) {
            container.innerHTML = `
                <div class="plugin-ui-group">
                    <label class="plugin-ui-label">
                        <i class="fa-solid fa-image"></i> 选择图片
                    </label>
                    <input type="file" id="pic-file" accept="image/*" class="plugin-ui-input">
                    <div class="plugin-ui-hint">支持 JPG、PNG、WebP 格式</div>
                </div>
                
                <div class="plugin-ui-group">
                    <label class="plugin-ui-label">
                        <i class="fa-solid fa-compress"></i> 压缩质量: <span id="pic-q-val" class="value-display">80</span>%
                    </label>
                    <div class="slider-container">
                        <input type="range" id="pic-quality" min="1" max="100" value="80" class="plugin-slider">
                        <div class="slider-labels">
                            <span>低</span>
                            <span>高</span>
                        </div>
                    </div>
                </div>
                
                <div class="plugin-ui-group">
                    <label class="plugin-ui-label">
                        <i class="fa-solid fa-expand"></i> 缩放比例: <span id="pic-s-val" class="value-display">100</span>%
                    </label>
                    <div class="slider-container">
                        <input type="range" id="pic-scale" min="10" max="100" value="100" class="plugin-slider">
                        <div class="slider-labels">
                            <span>10%</span>
                            <span>100%</span>
                        </div>
                    </div>
                </div>
                
                <div class="plugin-ui-group">
                    <div class="image-preview-container">
                        <div id="pic-preview-wrapper" class="preview-wrapper" style="display:none;">
                            <img id="pic-preview" class="preview-image">
                            <div class="preview-overlay">
                                <div class="preview-info" id="pic-info"></div>
                            </div>
                        </div>
                        <div id="pic-placeholder" class="preview-placeholder">
                            <i class="fa-solid fa-image"></i>
                            <p>选择图片后将显示预览</p>
                        </div>
                    </div>
                </div>
                
                <div class="plugin-ui-actions">
                    <button id="pic-download" class="plugin-ui-btn-primary" disabled>
                        <i class="fa-solid fa-download"></i> 下载处理后的图片
                    </button>
                </div>
            `;
            this.bindEvents();
        },
        
        bindEvents: function() {
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

            // 更新滑块数值显示
            qualityRange.oninput = () => {
                document.getElementById('pic-q-val').textContent = qualityRange.value;
                processImage();
            };
            
            scaleRange.oninput = () => {
                document.getElementById('pic-s-val').textContent = scaleRange.value;
                processImage();
            };

            const processImage = () => {
                if(!originalImage) return;
                
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const scale = parseInt(scaleRange.value) / 100;
                const quality = parseInt(qualityRange.value) / 100;

                canvas.width = originalImage.width * scale;
                canvas.height = originalImage.height * scale;
                ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);

                const dataUrl = canvas.toDataURL('image/jpeg', quality);
                preview.src = dataUrl;
                previewWrapper.style.display = 'block';
                placeholder.style.display = 'none';
                
                // 计算文件大小
                const head = 'data:image/jpeg;base64,';
                const compressedSize = Math.round((dataUrl.length - head.length) * 3/4);
                const compressionRatio = ((1 - compressedSize / originalSize) * 100).toFixed(1);
                
                info.innerHTML = `
                    <div class="info-row">
                        <span class="info-label">原始尺寸:</span>
                        <span class="info-value">${originalImage.width} × ${originalImage.height}px</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">新尺寸:</span>
                        <span class="info-value">${canvas.width} × ${canvas.height}px</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">原始大小:</span>
                        <span class="info-value">${(originalSize / 1024).toFixed(2)} KB</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">压缩后:</span>
                        <span class="info-value highlight">${(compressedSize / 1024).toFixed(2)} KB</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">压缩率:</span>
                        <span class="info-value highlight">${compressionRatio}%</span>
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
                if(file) {
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

