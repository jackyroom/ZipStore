/**
 * 网站主题大师插件
 */
(function() {
    'use strict';

    const ThemeSwitcher = {
        render: function(container) {
            // 从 localStorage 读取保存的主题设置
            const savedTheme = JSON.parse(localStorage.getItem('user_theme_settings') || '{}');
            const primaryColor = savedTheme['--primary'] || '#6366f1';
            const bgColor = savedTheme['--bg-color'] || '#0f172a';
            const textColor = savedTheme['--text-main'] || '#f8fafc';
            
            container.innerHTML = `
                <div class="plugin-ui-group">
                    <div class="theme-info">
                        <i class="fa-solid fa-info-circle"></i>
                        <p>修改将立即生效并保存在本地浏览器中，刷新页面后依然有效。</p>
                    </div>
                </div>
                
                <div class="theme-controls">
                    <div class="theme-control-item">
                        <div class="theme-control-header">
                            <label class="plugin-ui-label">
                                <i class="fa-solid fa-palette"></i> 主色调 (Primary)
                            </label>
                            <span class="color-preview" style="background: ${primaryColor}"></span>
                        </div>
                        <input type="color" id="theme-primary" value="${primaryColor}" class="color-picker">
                        <div class="color-hex">
                            <input type="text" id="theme-primary-hex" value="${primaryColor}" class="hex-input" readonly>
                            <button class="copy-btn" data-target="theme-primary-hex">
                                <i class="fa-solid fa-copy"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="theme-control-item">
                        <div class="theme-control-header">
                            <label class="plugin-ui-label">
                                <i class="fa-solid fa-fill"></i> 背景色 (Background)
                            </label>
                            <span class="color-preview" style="background: ${bgColor}"></span>
                        </div>
                        <input type="color" id="theme-bg" value="${bgColor}" class="color-picker">
                        <div class="color-hex">
                            <input type="text" id="theme-bg-hex" value="${bgColor}" class="hex-input" readonly>
                            <button class="copy-btn" data-target="theme-bg-hex">
                                <i class="fa-solid fa-copy"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="theme-control-item">
                        <div class="theme-control-header">
                            <label class="plugin-ui-label">
                                <i class="fa-solid fa-font"></i> 文字颜色 (Text)
                            </label>
                            <span class="color-preview" style="background: ${textColor}"></span>
                        </div>
                        <input type="color" id="theme-text" value="${textColor}" class="color-picker">
                        <div class="color-hex">
                            <input type="text" id="theme-text-hex" value="${textColor}" class="hex-input" readonly>
                            <button class="copy-btn" data-target="theme-text-hex">
                                <i class="fa-solid fa-copy"></i>
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="theme-presets">
                    <label class="plugin-ui-label">
                        <i class="fa-solid fa-swatchbook"></i> 预设主题
                    </label>
                    <div class="preset-buttons">
                        <button class="preset-btn" data-preset="default">
                            <span class="preset-colors">
                                <span style="background: #6366f1"></span>
                                <span style="background: #0f172a"></span>
                                <span style="background: #f8fafc"></span>
                            </span>
                            <span>默认</span>
                        </button>
                        <button class="preset-btn" data-preset="dark-blue">
                            <span class="preset-colors">
                                <span style="background: #3b82f6"></span>
                                <span style="background: #1e293b"></span>
                                <span style="background: #e2e8f0"></span>
                            </span>
                            <span>深蓝</span>
                        </button>
                        <button class="preset-btn" data-preset="purple">
                            <span class="preset-colors">
                                <span style="background: #8b5cf6"></span>
                                <span style="background: #1e1b4b"></span>
                                <span style="background: #f3e8ff"></span>
                            </span>
                            <span>紫色</span>
                        </button>
                        <button class="preset-btn" data-preset="green">
                            <span class="preset-colors">
                                <span style="background: #10b981"></span>
                                <span style="background: #064e3b"></span>
                                <span style="background: #d1fae5"></span>
                            </span>
                            <span>绿色</span>
                        </button>
                    </div>
                </div>
                
                <div class="plugin-ui-actions">
                    <button id="theme-reset" class="plugin-ui-btn-secondary">
                        <i class="fa-solid fa-rotate-left"></i> 重置默认主题
                    </button>
                    <button id="theme-apply" class="plugin-ui-btn-primary">
                        <i class="fa-solid fa-check"></i> 应用主题
                    </button>
                </div>
            `;
            this.bindEvents();
        },
        
        bindEvents: function() {
            const primaryInput = document.getElementById('theme-primary');
            const bgInput = document.getElementById('theme-bg');
            const textInput = document.getElementById('theme-text');
            const primaryHex = document.getElementById('theme-primary-hex');
            const bgHex = document.getElementById('theme-bg-hex');
            const textHex = document.getElementById('theme-text-hex');
            const resetBtn = document.getElementById('theme-reset');
            const applyBtn = document.getElementById('theme-apply');
            
            // 更新颜色预览和十六进制值
            const updateColor = (input, hexInput, previewSelector, cssVar) => {
                const color = input.value;
                hexInput.value = color;
                document.querySelector(previewSelector).style.background = color;
                
                // 实时预览（不保存）
                document.documentElement.style.setProperty(cssVar, color);
            };
            
            primaryInput.addEventListener('input', () => {
                updateColor(primaryInput, primaryHex, '#theme-primary + .color-preview', '--primary');
            });
            
            bgInput.addEventListener('input', () => {
                updateColor(bgInput, bgHex, '#theme-bg + .color-preview', '--bg-color');
            });
            
            textInput.addEventListener('input', () => {
                updateColor(textInput, textHex, '#theme-text + .color-preview', '--text-main');
            });
            
            // 复制十六进制值
            document.querySelectorAll('.copy-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const targetId = btn.getAttribute('data-target');
                    const input = document.getElementById(targetId);
                    input.select();
                    document.execCommand('copy');
                    
                    // 显示复制成功提示
                    const originalHTML = btn.innerHTML;
                    btn.innerHTML = '<i class="fa-solid fa-check"></i>';
                    btn.style.background = 'var(--primary)';
                    setTimeout(() => {
                        btn.innerHTML = originalHTML;
                        btn.style.background = '';
                    }, 1000);
                });
            });
            
            // 预设主题
            const presets = {
                default: { primary: '#6366f1', bg: '#0f172a', text: '#f8fafc' },
                'dark-blue': { primary: '#3b82f6', bg: '#1e293b', text: '#e2e8f0' },
                purple: { primary: '#8b5cf6', bg: '#1e1b4b', text: '#f3e8ff' },
                green: { primary: '#10b981', bg: '#064e3b', text: '#d1fae5' }
            };
            
            document.querySelectorAll('.preset-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const preset = presets[btn.getAttribute('data-preset')];
                    primaryInput.value = preset.primary;
                    bgInput.value = preset.bg;
                    textInput.value = preset.text;
                    
                    updateColor(primaryInput, primaryHex, '#theme-primary + .color-preview', '--primary');
                    updateColor(bgInput, bgHex, '#theme-bg + .color-preview', '--bg-color');
                    updateColor(textInput, textHex, '#theme-text + .color-preview', '--text-main');
                });
            });
            
            // 应用主题（保存到 localStorage）
            applyBtn.addEventListener('click', () => {
                const savedTheme = {
                    '--primary': primaryInput.value,
                    '--bg-color': bgInput.value,
                    '--text-main': textInput.value
                };
                localStorage.setItem('user_theme_settings', JSON.stringify(savedTheme));
                
                // 显示成功提示
                applyBtn.innerHTML = '<i class="fa-solid fa-check"></i> 已应用';
                applyBtn.style.background = 'var(--primary)';
                setTimeout(() => {
                    applyBtn.innerHTML = '<i class="fa-solid fa-check"></i> 应用主题';
                    applyBtn.style.background = '';
                }, 2000);
            });
            
            // 重置主题
            resetBtn.addEventListener('click', () => {
                if(confirm('确定要重置为默认主题吗？')) {
                    localStorage.removeItem('user_theme_settings');
                    location.reload();
                }
            });
            
            // 加载保存的主题（如果存在）
            const savedTheme = JSON.parse(localStorage.getItem('user_theme_settings') || '{}');
            if(Object.keys(savedTheme).length > 0) {
                Object.keys(savedTheme).forEach(key => {
                    document.documentElement.style.setProperty(key, savedTheme[key]);
                });
            }
        }
    };

    // 导出到全局
    window.ThemeSwitcher = ThemeSwitcher;
})();

