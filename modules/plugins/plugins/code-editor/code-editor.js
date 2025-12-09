/**
 * Code Editor Plugin
 * Allows online editing of HTML/CSS/JS with real-time preview.
 * Resembles CodePen design.
 */

const CodeEditor = {
    state: {
        html: '<!-- HTML -->\n<div class="container">\n  <h1>Code Editor</h1>\n  <p>Start editing to see magic happen!</p>\n</div>',
        css: '/* CSS */\nbody {\n  font-family: "Segoe UI", sans-serif;\n  background: #f4f4f4;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  height: 100vh;\n  margin: 0;\n}\n\n.container {\n  text-align: center;\n  background: white;\n  padding: 2rem;\n  border-radius: 8px;\n  box-shadow: 0 4px 6px rgba(0,0,0,0.1);\n}\n\nh1 {\n  color: #ff3c41;\n}',
        js: '// JavaScript\nconst title = document.querySelector("h1");\ntitle.addEventListener("click", () => {\n  title.style.color = "#0ebeff";\n  alert("Hello World!");\n});',
        layout: 'top', // top, left
        timer: null
    },

    container: null,
    editors: {
        html: null,
        css: null,
        js: null
    },

    render: function (container) {
        this.container = container;
        container.innerHTML = this.getTemplate();

        // 动态加载 CodeMirror 资源
        this.loadCodeMirror(() => {
            this.initEditors();
            this.bindEvents();
            this.loadLastSession();
            this.updatePreview();
        });
    },

    loadCodeMirror: function (callback) {
        // 检查是否已加载
        if (typeof CodeMirror !== 'undefined') {
            callback();
            return;
        }

        // 加载 CSS
        const cssFiles = [
            'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/codemirror.min.css',
            'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/theme/material-darker.min.css'
        ];

        let cssLoaded = 0;
        cssFiles.forEach(href => {
            if (!document.querySelector(`link[href="${href}"]`)) {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = href;
                link.onload = () => {
                    cssLoaded++;
                    if (cssLoaded === cssFiles.length && typeof CodeMirror !== 'undefined') {
                        callback();
                    }
                };
                document.head.appendChild(link);
            } else {
                cssLoaded++;
            }
        });

        // 加载 JS 文件（按顺序加载）
        const jsFiles = [
            'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/codemirror.min.js',
            'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/mode/xml/xml.min.js',
            'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/mode/css/css.min.js',
            'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/mode/javascript/javascript.min.js',
            'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/mode/htmlmixed/htmlmixed.min.js'
        ];

        let currentIndex = 0;
        const loadNext = () => {
            if (currentIndex >= jsFiles.length) {
                // 所有脚本加载完成，等待 CodeMirror 可用
                this.waitForCodeMirror(callback);
                return;
            }

            const src = jsFiles[currentIndex];
            if (document.querySelector(`script[src="${src}"]`)) {
                currentIndex++;
                loadNext();
                return;
            }

            const script = document.createElement('script');
            script.src = src;
            script.onload = () => {
                currentIndex++;
                loadNext();
            };
            script.onerror = () => {
                console.error(`Failed to load CodeMirror script: ${src}`);
                // 继续加载下一个，如果全部失败则使用降级方案
                currentIndex++;
                if (currentIndex >= jsFiles.length) {
                    this.waitForCodeMirror(callback);
                } else {
                    loadNext();
                }
            };
            document.head.appendChild(script);
        };

        loadNext();
    },

    waitForCodeMirror: function (callback) {
        if (typeof CodeMirror !== 'undefined') {
            callback();
        } else {
            // 如果 CodeMirror 还没加载，等待一下
            let attempts = 0;
            const checkInterval = setInterval(() => {
                if (typeof CodeMirror !== 'undefined') {
                    clearInterval(checkInterval);
                    callback();
                } else if (attempts++ > 50) {
                    clearInterval(checkInterval);
                    console.error('CodeMirror failed to load, using fallback');
                    // 降级到普通 textarea
                    this.initFallbackEditors();
                    callback();
                }
            }, 100);
        }
    },

    initEditors: function () {
        if (typeof CodeMirror === 'undefined') {
            this.initFallbackEditors();
            return;
        }

        // 初始化 HTML 编辑器
        this.editors.html = CodeMirror(document.getElementById('ce-input-html'), {
            value: this.state.html,
            mode: 'htmlmixed',
            theme: 'material-darker',
            lineNumbers: true,
            indentUnit: 2,
            indentWithTabs: false,
            tabSize: 2,
            lineWrapping: true,
            autofocus: false,
            extraKeys: {
                'Tab': 'indentMore',
                'Shift-Tab': 'indentLess'
            }
        });

        // 初始化 CSS 编辑器
        this.editors.css = CodeMirror(document.getElementById('ce-input-css'), {
            value: this.state.css,
            mode: 'css',
            theme: 'material-darker',
            lineNumbers: true,
            indentUnit: 2,
            indentWithTabs: false,
            tabSize: 2,
            lineWrapping: true,
            extraKeys: {
                'Tab': 'indentMore',
                'Shift-Tab': 'indentLess'
            }
        });

        // 初始化 JavaScript 编辑器
        this.editors.js = CodeMirror(document.getElementById('ce-input-js'), {
            value: this.state.js,
            mode: 'javascript',
            theme: 'material-darker',
            lineNumbers: true,
            indentUnit: 2,
            indentWithTabs: false,
            tabSize: 2,
            lineWrapping: true,
            extraKeys: {
                'Tab': 'indentMore',
                'Shift-Tab': 'indentLess'
            }
        });

        // 监听内容变化
        this.editors.html.on('change', () => this.debounceUpdate());
        this.editors.css.on('change', () => this.debounceUpdate());
        this.editors.js.on('change', () => this.debounceUpdate());

        // 当布局改变时，刷新编辑器尺寸
        const resizeObserver = new ResizeObserver(() => {
            setTimeout(() => {
                if (this.editors.html) this.editors.html.refresh();
                if (this.editors.css) this.editors.css.refresh();
                if (this.editors.js) this.editors.js.refresh();
            }, 100);
        });
        resizeObserver.observe(this.container);
    },

    initFallbackEditors: function () {
        // 降级方案：如果 CodeMirror 未加载，使用普通 textarea
        const htmlEl = document.getElementById('ce-input-html');
        const cssEl = document.getElementById('ce-input-css');
        const jsEl = document.getElementById('ce-input-js');

        if (htmlEl && !htmlEl.querySelector('textarea')) {
            const htmlTextarea = document.createElement('textarea');
            htmlTextarea.className = 'ce-code-area';
            htmlTextarea.spellcheck = false;
            htmlTextarea.value = this.state.html;
            htmlEl.innerHTML = '';
            htmlEl.appendChild(htmlTextarea);
        }

        if (cssEl && !cssEl.querySelector('textarea')) {
            const cssTextarea = document.createElement('textarea');
            cssTextarea.className = 'ce-code-area';
            cssTextarea.spellcheck = false;
            cssTextarea.value = this.state.css;
            cssEl.innerHTML = '';
            cssEl.appendChild(cssTextarea);
        }

        if (jsEl && !jsEl.querySelector('textarea')) {
            const jsTextarea = document.createElement('textarea');
            jsTextarea.className = 'ce-code-area';
            jsTextarea.spellcheck = false;
            jsTextarea.value = this.state.js;
            jsEl.innerHTML = '';
            jsEl.appendChild(jsTextarea);
        }
    },

    getTemplate: function () {
        return `
            <div class="code-editor-container" id="ce-main-container">
                <!-- Toolbar -->
                <div class="ce-toolbar">
                    <div class="ce-title">
                        <i class="fa-solid fa-code"></i> Code Playground
                    </div>
                    <div class="ce-actions">
                        <div class="ce-view-switch">
                            <button class="ce-view-btn active" title="Top View">
                                <i class="fa-solid fa-table-columns" style="transform: rotate(90deg)"></i>
                            </button>
                            <button class="ce-view-btn" title="Side (Left) View">
                                <i class="fa-solid fa-table-columns"></i>
                            </button>
                            <button class="ce-view-btn" title="Side (Right) View">
                                <i class="fa-solid fa-table-columns" style="transform: rotate(180deg)"></i>
                            </button>
                        </div>
                        <button class="ce-btn">
                            <i class="fa-solid fa-bookmark"></i> Bookmarks
                        </button>
                        <button class="ce-btn ce-btn-primary">
                            <i class="fa-solid fa-cloud-arrow-up"></i> Save
                        </button>
                    </div>
                </div>

                <!-- Workspace -->
                <div class="ce-workspace">
                    <!-- Editors -->
                    <div class="ce-editors">
                        <div class="ce-editor-pane">
                            <div class="ce-pane-header ce-html-header">
                                <span><i class="fa-brands fa-html5"></i> HTML</span>
                                <i class="fa-solid fa-gear" style="cursor:pointer; opacity:0.5"></i>
                            </div>
                            <div id="ce-input-html"></div>
                        </div>
                        <div class="ce-editor-pane">
                            <div class="ce-pane-header ce-css-header">
                                <span><i class="fa-brands fa-css3-alt"></i> CSS</span>
                                <i class="fa-solid fa-gear" style="cursor:pointer; opacity:0.5"></i>
                            </div>
                            <div id="ce-input-css"></div>
                        </div>
                        <div class="ce-editor-pane">
                            <div class="ce-pane-header ce-js-header">
                                <span><i class="fa-brands fa-js"></i> JS</span>
                                <i class="fa-solid fa-gear" style="cursor:pointer; opacity:0.5"></i>
                            </div>
                            <div id="ce-input-js"></div>
                        </div>
                    </div>

                    <!-- Preview -->
                    <div class="ce-preview">
                        <div class="ce-preview-header">Preview</div>
                        <iframe id="ce-preview-frame"></iframe>
                    </div>
                </div>
            </div>
        `;
    },

    bindEvents: function () {
        // View Switching Events
        // We use querySelectorAll's index to map to 'top', 'left', 'right'
        const viewBtns = document.querySelectorAll('#ce-main-container .ce-view-btn');
        if (viewBtns.length >= 3) {
            viewBtns[0].addEventListener('click', () => {
                this.setLayout('top');
                this.refreshEditors();
            });
            viewBtns[1].addEventListener('click', () => {
                this.setLayout('left');
                this.refreshEditors();
            });
            viewBtns[2].addEventListener('click', () => {
                this.setLayout('right');
                this.refreshEditors();
            });
        }

        // Toolbar actions
        const actionBtns = document.querySelectorAll('#ce-main-container .ce-actions .ce-btn');
        if (actionBtns.length >= 2) {
            // 0 is Bookmarks, 1 is Save
            actionBtns[0].addEventListener('click', () => this.openBookmarks());
            actionBtns[1].addEventListener('click', () => this.saveBookmark());
        }
    },

    refreshEditors: function () {
        // 刷新编辑器尺寸以适应布局变化
        setTimeout(() => {
            if (this.editors.html) this.editors.html.refresh();
            if (this.editors.css) this.editors.css.refresh();
            if (this.editors.js) this.editors.js.refresh();
        }, 100);
    },

    debounceUpdate: function () {
        if (this.state.timer) clearTimeout(this.state.timer);
        this.state.timer = setTimeout(() => {
            this.updatePreview();
        }, 800);
    },

    updatePreview: function () {
        const html = document.getElementById('ce-input-html').value;
        const css = document.getElementById('ce-input-css').value;
        const js = document.getElementById('ce-input-js').value;

        // Save current state
        this.state.html = html;
        this.state.css = css;
        this.state.js = js;
        localStorage.setItem('ce_last_session', JSON.stringify({ html, css, js }));

        const frame = document.getElementById('ce-preview-frame');
        const doc = frame.contentDocument || frame.contentWindow.document;

        const source = `
            <!DOCTYPE html>
            <html>
                <head>
                    <style>
                        /* Injected Scrollbar Styling */
                        ::-webkit-scrollbar { width: 8px; height: 8px; }
                        ::-webkit-scrollbar-track { background: transparent; }
                        ::-webkit-scrollbar-thumb { background: #ccc; border-radius: 4px; }
                        ::-webkit-scrollbar-thumb:hover { background: #999; }
                        
                        /* User CSS */
                        ${css}
                    </style>
                </head>
                <body>
                    ${html}
                    <script>
                        try {
                            ${js}
                        } catch(e) {
                            console.error(e);
                        }
                    <\/script>
                </body>
            </html>
        `;

        doc.open();
        doc.write(source);
        doc.close();
    },

    saveBookmark: function () {
        const name = prompt("Enter a name for this bookmark:", "My Awesome Snippet");
        if (!name) return;

        const bookmark = {
            id: Date.now(),
            name: name,
            html: this.state.html,
            css: this.state.css,
            js: this.state.js,
            date: new Date().toLocaleDateString()
        };

        const bookmarks = JSON.parse(localStorage.getItem('ce_bookmarks') || '[]');
        bookmarks.unshift(bookmark);
        localStorage.setItem('ce_bookmarks', JSON.stringify(bookmarks));

        alert("Saved to Bookmarks!");
    },

    openBookmarks: function () {
        const bookmarks = JSON.parse(localStorage.getItem('ce_bookmarks') || '[]');

        // Use a simple modal or overlay
        // Existing plugin center doesn't seem to expose a generic modal builder, so we'll build a simple overlay

        let listHtml = '';
        if (bookmarks.length === 0) {
            listHtml = '<div style="padding:20px; text-align:center; color:#888;">No bookmarks yet. Save your work!</div>';
        } else {
            listHtml = bookmarks.map(b => `
                <div class="ce-bookmark-item">
                    <div>
                        <div style="font-weight:bold; color:#fff;">${this.escapeHtml(b.name)}</div>
                        <div style="font-size:12px; color:#888;">${b.date}</div>
                    </div>
                    <div class="ce-bm-actions">
                        <i class="fa-solid fa-folder-open" onclick="CodeEditor.loadBookmark(${b.id})" title="Open"></i>
                        <i class="fa-solid fa-trash" onclick="CodeEditor.deleteBookmark(${b.id})" title="Delete"></i>
                    </div>
                </div>
            `).join('');
        }

        // Create overlay if not exists
        let overlay = document.getElementById('ce-bm-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'ce-bm-overlay';
            overlay.style.cssText = 'position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:100; display:flex; justify-content:center; align-items:center;';
            this.container.appendChild(overlay);
        }

        overlay.innerHTML = `
            <div style="background:#1e1f26; width:400px; border-radius:8px; box-shadow:0 10px 25px rgba(0,0,0,0.5); border:1px solid #333;">
                <div style="padding:15px; border-bottom:1px solid #2c2d33; display:flex; justify-content:space-between; align-items:center;">
                    <span style="color:#fff; font-weight:bold;">My Bookmarks</span>
                    <i class="fa-solid fa-xmark" style="cursor:pointer; color:#888;" onclick="document.getElementById('ce-bm-overlay').remove()"></i>
                </div>
                <div class="ce-bookmarks-list" style="padding:15px; max-height:400px; overflow-y:auto;">
                    ${listHtml}
                </div>
            </div>
        `;
    },

    loadBookmark: function (id) {
        const bookmarks = JSON.parse(localStorage.getItem('ce_bookmarks') || '[]');
        const b = bookmarks.find(x => x.id === id);
        if (b) {
            if (confirm("Load this bookmark? Unsaved changes will be lost.")) {
                document.getElementById('ce-input-html').value = b.html;
                document.getElementById('ce-input-css').value = b.css;
                document.getElementById('ce-input-js').value = b.js;
                this.updatePreview();
                document.getElementById('ce-bm-overlay').remove();
            }
        }
    },

    deleteBookmark: function (id) {
        if (!confirm("Delete this bookmark?")) return;

        let bookmarks = JSON.parse(localStorage.getItem('ce_bookmarks') || '[]');
        bookmarks = bookmarks.filter(x => x.id !== id);
        localStorage.setItem('ce_bookmarks', JSON.stringify(bookmarks));

        this.openBookmarks(); // Refresh
    },

    loadLastSession: function () {
        const last = JSON.parse(localStorage.getItem('ce_last_session'));
        if (last) {
            this.state.html = last.html || this.state.html;
            this.state.css = last.css || this.state.css;
            this.state.js = last.js || this.state.js;

            document.getElementById('ce-input-html').value = this.state.html;
            document.getElementById('ce-input-css').value = this.state.css;
            document.getElementById('ce-input-js').value = this.state.js;
            this.updatePreview();
        }

        // 加载保存的布局偏好
        const savedLayout = localStorage.getItem('ce_layout_preference');
        if (savedLayout && ['top', 'left', 'right'].includes(savedLayout)) {
            this.setLayout(savedLayout);
        } else {
            // 确保默认布局的按钮状态正确
            this.setLayout('top');
        }
    },

    setLayout: function (layout) {
        // 更新状态
        this.state.layout = layout;

        // 获取主容器
        const container = document.getElementById('ce-main-container');
        if (!container) return;

        // 移除所有布局类
        container.classList.remove('ce-layout-left', 'ce-layout-right');

        // 根据布局类型添加相应的类
        if (layout === 'left') {
            container.classList.add('ce-layout-left');
        } else if (layout === 'right') {
            container.classList.add('ce-layout-right');
        }
        // 'top' 布局不需要添加类，使用默认样式

        // 更新按钮的 active 状态
        const viewBtns = document.querySelectorAll('#ce-main-container .ce-view-btn');
        viewBtns.forEach((btn, index) => {
            btn.classList.remove('active');
            if ((layout === 'top' && index === 0) ||
                (layout === 'left' && index === 1) ||
                (layout === 'right' && index === 2)) {
                btn.classList.add('active');
            }
        });

        // 保存布局偏好到 localStorage
        localStorage.setItem('ce_layout_preference', layout);
    },

    escapeHtml: function (text) {
        if (!text) return '';
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
};

window.CodeEditor = CodeEditor;
