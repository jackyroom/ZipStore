/**
 * Zip Memo V7 - Notion-like Note App
 * Features: Precision Toolbar Positioning, Custom Colors
 */
const ZipMemo = {
    // State
    notes: [],
    currentView: 'list',
    activeNoteId: null,
    editorMode: 'split',
    filter: 'all',

    container: null,
    selectionTimer: null,
    draggedItem: null,
    isDragging: false,
    isCreatingNote: false,
    lastSelection: { start: 0, end: 0 },
    historyStacks: {}, // noteId -> [{content, selStart, selEnd}]
    historyIndex: {},  // noteId -> index
    isApplyingHistory: false,

    // Initialization
    render: function (container) {
        this.container = container;

        container.innerHTML = `
            <div style="display:flex; align-items:center; justify-content:center; height:100%; color:#888;">
                <div style="text-align:center;">
                    <i class="fa-solid fa-spinner fa-spin" style="font-size:24px; margin-bottom:10px; display:block;"></i>
                    <div>正在加载 Zip 备忘录...</div>
                </div>
            </div>
        `;

        this.loadNotes();

        this.waitForCSS(() => {
            this.loadLibraries(() => {
                this.renderLayout();
                this.setupGlobalListeners();
            });
        });
    },

    waitForCSS: function (callback) {
        const cssLink = document.querySelector('link[href*="zip-memo"]');
        if (cssLink && cssLink.sheet) {
            callback();
        } else if (cssLink) {
            cssLink.onload = callback;
            cssLink.onerror = callback;
            setTimeout(callback, 500);
        } else {
            let attempts = 0;
            const checkInterval = setInterval(() => {
                const link = document.querySelector('link[href*="zip-memo"]');
                if (link && link.sheet) {
                    clearInterval(checkInterval);
                    callback();
                } else if (attempts++ > 10) {
                    clearInterval(checkInterval);
                    callback();
                }
            }, 100);
        }
    },

    setupGlobalListeners: function () {
        document.addEventListener('mousedown', (e) => {
            if (!e.target.closest('.zm-floating-toolbar') &&
                !e.target.closest('.zm-content-textarea') &&
                !e.target.closest('.zm-color-picker-label') &&
                !e.target.closest('.zm-preview-content')) {
                this.hideFloatingToolbar();
            }
            if (!e.target.closest('.zm-context-menu')) {
                this.hideContextMenu();
            }
        });

        document.addEventListener('selectionchange', () => {
            if (this.currentView === 'editor' && this.editorMode === 'preview') {
                this.handlePreviewSelection();
            }
        });
    },

    loadLibraries: function (callback) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/marked/marked.min.js';
        script.onload = () => {
            if (typeof marked !== 'undefined') {
                marked.setOptions({ breaks: true, gfm: true });
            }
            callback();
        };
        script.onerror = () => {
            console.error('Failed to load marked library');
            callback();
        };
        document.head.appendChild(script);

        if (typeof marked !== 'undefined') {
            marked.setOptions({ breaks: true, gfm: true });
            callback();
        }
    },

    loadNotes: function () {
        const saved = localStorage.getItem('zm_notes_v6'); // Keep V6 store for compatibility
        this.notes = saved ? JSON.parse(saved) : [];

        // 如果没有任何笔记，创建默认笔记和示例
        if (!this.notes || this.notes.length === 0) {
            this.notes = [
                { id: 1, title: '欢迎使用 Zip 备忘录 V7 📝', content: '# 欢迎！\n这是一个全新的 **Notion 风格** 备忘录。\n\n- [x] 尝试选中文字，观察悬浮菜单位置\n- [x] 尝试自定义颜色\n\n尽情享受吧！', date: new Date().toISOString(), completed: false, pinned: true, tags: ['欢迎', '指南'] },
                this.buildMarkdownSampleNote()
            ];
            this.saveNotes();
        } else {
            // 如果历史数据缺少示例笔记，则追加
            const existsSample = this.notes.some(n => n.title === 'Markdown 语法完整示例 📚');
            if (!existsSample) {
                this.notes.unshift(this.buildMarkdownSampleNote());
                this.saveNotes();
            }
        }
    },

    buildMarkdownSampleNote: function () {
        return {
            id: Date.now(),
            title: 'Markdown 语法完整示例 📚',
            content: `# Markdown 语法完整示例

这是一篇完整的 Markdown 语法示例文档，涵盖了所有常用的 Markdown 语法元素。

## 标题

Markdown 支持六级标题：

# 一级标题
## 二级标题
### 三级标题
#### 四级标题
##### 五级标题
###### 六级标题

## 文本样式

### 强调

这是 **粗体文本**，这是 *斜体文本*，这是 ***粗斜体文本***。

也可以使用下划线：<u>下划线文本</u> 和 ~~删除线文本~~。

### 行内代码

使用反引号包裹行内代码：\`console.log('Hello World')\`

### 链接和图片

这是一个 [链接示例](https://example.com)。

![图片示例](https://via.placeholder.com/400x200 "图片标题")

## 列表

### 无序列表

- 第一项
- 第二项
  - 嵌套项 1
  - 嵌套项 2
- 第三项

### 有序列表

1. 第一项
2. 第二项
   1. 嵌套项 1
   2. 嵌套项 2
3. 第三项

### 任务列表

- [x] 已完成的任务
- [ ] 未完成的任务
- [x] 另一个已完成的任务

## 引用

> 这是一个引用块。
> 
> 可以包含多行内容。
> 
> > 这是嵌套的引用。

## 代码块

### 行内代码块

\`\`\`javascript
function greet(name) {
    console.log('Hello, ' + name + '!');
}

greet('World');
\`\`\`

### Python 代码块

\`\`\`python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

print(fibonacci(10))
\`\`\`

### HTML 代码块

\`\`\`html
<!DOCTYPE html>
<html>
<head>
    <title>示例</title>
</head>
<body>
    <h1>Hello World</h1>
</body>
</html>
\`\`\`

## 表格

| 列1 | 列2 | 列3 |
|-----|-----|-----|
| 数据1 | 数据2 | 数据3 |
| 数据4 | 数据5 | 数据6 |
| 左对齐 | 居中 | 右对齐 |

| 左对齐 | 居中 | 右对齐 |
|:-------|:----:|-------:|
| 文本 | 文本 | 文本 |

## 分隔线

---

## 自定义样式

### 文字颜色

<span style="color:#e03131">红色文字</span>
<span style="color:#10c17d">绿色文字</span>
<span style="color:#0b70d0">蓝色文字</span>

### 背景颜色

<span style="background-color:#fff9db">黄色背景</span>
<span style="background-color:#fe6262">红色背景</span>
<span style="background-color:#e3fadc">绿色背景</span>

### 组合样式

<span style="color:#e03131; background-color:#fff9db">红色文字黄色背景</span>

## 数学公式（如果支持）

行内公式：$E = mc^2$

块级公式：

$$
\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}
$$

## 脚注

这是一个脚注示例[^1]。

[^1]: 这是脚注的内容。

## 转义字符

如果需要显示 Markdown 语法字符，可以使用反斜杠转义：

\\*这不是斜体\\*
\\**这不是粗体\\**
\\\`这不是代码\\\`

## 总结

Markdown 是一种轻量级标记语言，非常适合：

1. 编写文档
2. 记录笔记
3. 撰写博客
4. 创建 README 文件

**提示**：选中上面的文字可以查看悬浮工具栏的效果！

---

*最后更新：2025年*`,
            date: new Date().toISOString(),
            completed: false,
            pinned: true,
            tags: ['Markdown', '示例', '教程']
        };
    },

    saveNotes: function () {
        localStorage.setItem('zm_notes_v6', JSON.stringify(this.notes));
    },

    // UI Layout
    renderLayout: function () {
        this.container.innerHTML = `
            <div class="zm-app-v5">
                <div class="zm-sidebar">
                    <div class="zm-brand">
                        <i class="fa-solid fa-note-sticky"></i> Zip 备忘录
                    </div>
                    
                    <div class="zm-sidebar-menu">
                        <div class="zm-menu-item active" onclick="ZipMemo.setFilter('all', this)">
                            <i class="fa-solid fa-layer-group"></i> 全部笔记
                        </div>
                        <div class="zm-menu-item" onclick="ZipMemo.setFilter('active', this)">
                            <i class="fa-regular fa-circle"></i> 进行中
                        </div>
                        <div class="zm-menu-item" onclick="ZipMemo.setFilter('completed', this)">
                            <i class="fa-regular fa-check-circle"></i> 已完成
                        </div>
                    </div>
                </div>

                <div class="zm-main-area" id="zm-main-view"></div>
                
                <div class="zm-context-menu" id="zm-context-menu" style="display:none;">
                    <button onclick="ZipMemo.handleContextAction('open')"><i class="fa-solid fa-folder-open"></i> 打开</button>
                    <button onclick="ZipMemo.handleContextAction('pin')"><i class="fa-solid fa-thumbtack"></i> 置顶/取消</button>
                    <button onclick="ZipMemo.handleContextAction('copy')"><i class="fa-solid fa-copy"></i> 复制副本</button>
                    <div class="zm-cm-divider"></div>
                    <button class="text-danger" onclick="ZipMemo.handleContextAction('delete')"><i class="fa-solid fa-trash"></i> 删除</button>
                </div>
                
                <!-- Floating Toolbar with Color Picker -->
                <div class="zm-floating-toolbar" id="zm-float-bar" style="display:none;">
                    <div class="zm-ft-group">
                        <button onclick="ZipMemo.applyFormat('bold')" title="加粗 (Bold)"><i class="fa-solid fa-bold"></i></button>
                        <button onclick="ZipMemo.applyFormat('italic')" title="斜体 (Italic)"><i class="fa-solid fa-italic"></i></button>
                        <button onclick="ZipMemo.applyFormat('underline')" title="下划线 (Underline)"><i class="fa-solid fa-underline"></i></button>
                        <button onclick="ZipMemo.applyFormat('strike')" title="删除线 (Strike)"><i class="fa-solid fa-strikethrough"></i></button>
                    </div>
                    <div class="zm-ft-divider"></div>
                    <div class="zm-ft-group">
                        <!-- Preset Colors -->
                        <button onclick="ZipMemo.applyFormat('color', '#e03131')" style="color:#e03131" title="红字">A</button>
                        <!-- Custom Color Picker -->
                        <label class="zm-color-picker-label" title="自定义颜色">
                            <i class="fa-solid fa-palette"></i>
                            <input type="color" onchange="ZipMemo.applyFormat('color', this.value)" style="visibility:hidden; width:0; height:0;">
                        </label>
                        <!-- Background Colors -->
                        <button onclick="ZipMemo.applyFormat('bg', '#fff9db')" title="黄背景"><i class="fa-solid fa-highlighter" style="color:#fcc419"></i></button>
                        <label class="zm-color-picker-label" title="自定义背景">
                           <span style="font-size:10px; font-weight:bold; background:#eee; padding:2px; border-radius:2px;">BG</span>
                           <input type="color" onchange="ZipMemo.applyFormat('bg', this.value)" style="visibility:hidden; width:0; height:0;">
                        </label>
                    </div>
                </div>
            </div>
        `;
        this.renderMain();
    },

    renderMain: function () {
        const main = document.getElementById('zm-main-view');
        if (this.currentView === 'list') {
            this.renderListView(main);
        } else {
            this.renderEditorView(main);
        }
    },

    renderListView: function (container) {
        let filtered = this.notes;
        if (this.filter === 'active') filtered = this.notes.filter(n => !n.completed);
        if (this.filter === 'completed') filtered = this.notes.filter(n => n.completed);

        const listHtml = filtered.map(note => {
            const preview = note.content.replace(/[#*`_\[\]]/g, '').substring(0, 60) + (note.content.length > 60 ? '...' : '');
            const dateStr = new Date(note.date).toLocaleString('zh-CN', { hour12: false, month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
            const tagsHtml = (note.tags || []).map(t => `<span class="zm-tag">${this.escapeHtml(t)}</span>`).join('');

            const statusBadge = note.completed
                ? `<span class="zm-status-badge done"><i class="fa-solid fa-check"></i> 已完成</span>`
                : `<span class="zm-status-badge active"><i class="fa-regular fa-clock"></i> 进行中</span>`;

            return `
                <div class="zm-note-card ${note.completed ? 'completed' : ''}" 
                     data-id="${note.id}"
                     draggable="true"
                     onclick="ZipMemo.openNote(${note.id})"
                     oncontextmenu="ZipMemo.openContextMenu(event, ${note.id})"
                     ondragstart="ZipMemo.handleDragStart(event)"
                     ondragover="ZipMemo.handleDragOver(event)"
                     ondrop="ZipMemo.handleDrop(event)"
                     ondragend="ZipMemo.handleDragEnd(event)">
                     
                    <div class="zm-nc-header">
                        <div class="zm-nc-title">${this.escapeHtml(note.title || '无标题')}</div>
                         ${note.pinned ? '<i class="fa-solid fa-thumbtack active-pin"></i>' : ''}
                    </div>

                    <div class="zm-nc-preview">${this.escapeHtml(preview)}</div>
                    
                    <div class="zm-nc-footer">
                        <div class="zm-nc-left">
                            ${statusBadge}
                            <div class="zm-nc-tags">${tagsHtml}</div>
                        </div>
                        <span class="zm-nc-date">${dateStr}</span>
                    </div>

                    <div class="zm-nc-hover-actions">
                         <i class="fa-solid fa-trash" onclick="event.stopPropagation(); ZipMemo.deleteNote(${note.id})" title="删除"></i>
                    </div>
                </div>
            `;
        }).join('');

        const newPageCard = `
            <div class="zm-note-card new-page-card" onclick="ZipMemo.createNote()">
                 <i class="fa-solid fa-plus"></i>
                 <span>New page</span>
            </div>
        `;

        container.innerHTML = `
            <div class="zm-list-header">
                <h2>我的笔记 <span class="zm-count">${filtered.length}</span></h2>
                <div class="zm-list-tools">
                    <input type="text" placeholder="搜索笔记..." oninput="ZipMemo.handleSearch(this.value)">
                </div>
            </div>
            <div class="zm-list-grid">
                ${listHtml}
                ${newPageCard}
            </div>
        `;
    },

    renderEditorView: function (container) {
        const note = this.notes.find(n => n.id === this.activeNoteId);
        if (!note) return this.backToList();

        const wordCount = (note.content || '').length;

        container.innerHTML = `
            <div class="zm-editor-layout">
                <div class="zm-editor-header">
                    <div class="zm-header-left">
                        <button class="zm-btn-ghost" onclick="ZipMemo.backToList()"><i class="fa-solid fa-chevron-left"></i> 返回</button>
                        <div class="zm-header-status" onclick="ZipMemo.toggleComplete(${note.id})">
                            ${note.completed
                ? '<span class="status-pill done"><i class="fa-solid fa-check-circle"></i> 已完成</span>'
                : '<span class="status-pill active"><i class="fa-regular fa-circle"></i> 进行中</span>'
            }
                        </div>
                    </div>
                    
                    <div class="zm-view-switcher">
                        <button class="${this.editorMode === 'split' ? 'active' : ''}" onclick="ZipMemo.setEditorMode('split')" title="分栏编辑"><i class="fa-solid fa-table-columns"></i> 分栏</button>
                        <button class="${this.editorMode === 'edit' ? 'active' : ''}" onclick="ZipMemo.setEditorMode('edit')" title="仅源码"><i class="fa-solid fa-code"></i> 源码</button>
                        <button class="${this.editorMode === 'preview' ? 'active' : ''}" onclick="ZipMemo.setEditorMode('preview')" title="阅读模式"><i class="fa-solid fa-book-open"></i> 阅读</button>
                    </div>

                    <div class="zm-header-actions">
                         <button class="zm-btn-icon ${note.pinned ? 'active' : ''}" onclick="ZipMemo.togglePin(${note.id})" title="置顶"><i class="fa-solid fa-thumbtack"></i></button>
                         <button class="zm-btn-icon text-danger" onclick="ZipMemo.deleteNote(${note.id})"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>

                <div class="zm-top-toolbar">
                     <select onchange="ZipMemo.applyFormat('header', this.value); this.value='';" class="zm-format-select">
                        <option value="">正文</option>
                        <option value="1">标题 1</option>
                        <option value="2">标题 2</option>
                        <option value="3">标题 3</option>
                     </select>
                     <div class="zm-tt-divider"></div>
                     <button onclick="ZipMemo.applyFormat('bold')"><i class="fa-solid fa-bold"></i></button>
                     <button onclick="ZipMemo.applyFormat('italic')"><i class="fa-solid fa-italic"></i></button>
                     <button onclick="ZipMemo.applyFormat('underline')"><i class="fa-solid fa-underline"></i></button>
                     <button onclick="ZipMemo.applyFormat('strike')"><i class="fa-solid fa-strikethrough"></i></button>
                     <div class="zm-tt-divider"></div>
                     <button onclick="ZipMemo.applyFormat('link')"><i class="fa-solid fa-link"></i></button>
                     <button onclick="ZipMemo.applyFormat('code')"><i class="fa-solid fa-code"></i></button>
                     <button onclick="ZipMemo.applyFormat('quote')"><i class="fa-solid fa-quote-right"></i></button>
                     <div class="zm-tt-divider"></div>
                     <button onclick="ZipMemo.applyFormat('check')"><i class="fa-regular fa-square-check"></i></button>
                     <button onclick="ZipMemo.applyFormat('image')"><i class="fa-regular fa-image"></i></button>
                </div>

                <div class="zm-editor-workspace mode-${this.editorMode}">
                    <div class="zm-editor-pane source-pane">
                         <input type="text" class="zm-title-field" value="${this.escapeHtml(note.title)}" placeholder="无标题" 
                            oninput="ZipMemo.updateNote(${note.id}, 'title', this.value)">
                         
                         <div class="zm-tags-input-area">
                            <i class="fa-solid fa-tags"></i>
                            <input type="text" value="${(note.tags || []).join(', ')}" placeholder="添加标签..." 
                                onchange="ZipMemo.updateTags(${note.id}, this.value)">
                         </div>

                         <!-- Textarea + Mirror Div for Positioning -->
                         <div style="position:relative; flex:1; display:flex;">
                             <textarea class="zm-content-textarea" id="zm-editor-area" placeholder="在此输入内容..." 
                                oninput="ZipMemo.handleInput(${note.id}, this)"
                                onselect="ZipMemo.handleSourceSelection()"
                                onmouseup="ZipMemo.handleSourceSelection()"
                                onkeyup="ZipMemo.handleSourceSelection()"
                                onscroll="ZipMemo.syncMirrorScroll(this)"
                                onkeydown="ZipMemo.handleEditorKeydown(event, ${note.id})">${this.escapeHtml(note.content)}</textarea>
                             <!-- Mirror Div -->
                             <div id="zm-mirror-div" class="zm-mirror-div"></div>
                         </div>
                            
                         <div class="zm-editor-footer">
                            <span>字数: <span id="zm-word-count">${wordCount}</span></span>
                         </div>
                    </div>
                    <div class="zm-editor-pane preview-pane">
                         <div class="zm-preview-title">${this.escapeHtml(note.title || '无标题')}</div>
                         <div class="zm-preview-tags">${(note.tags || []).map(t => `<span class="tag">${t}</span>`).join('')}</div>
                         <div class="markdown-body zm-preview-content" id="zm-preview-div">
                             ${this.parseMarkdown(note.content)}
                         </div>
                    </div>
                </div>
            </div>
        `;

        // 初始化 mirror 内容，确保定位计算正确
        const mirror = document.getElementById('zm-mirror-div');
        if (mirror) {
            mirror.textContent = note.content || '';
            mirror.scrollTop = 0;
            mirror.scrollLeft = 0;
        }

        // 初始化历史栈
        this.initHistory(note.id, note.content || '', note.content.length, note.content.length);
    },

    // --- Core Logic ---
    createNote: function () {
        if (this.isCreatingNote) return;
        this.isCreatingNote = true;

        const newNote = { id: Date.now(), title: '', content: '', date: new Date().toISOString(), completed: false, pinned: false, tags: [] };
        this.notes.push(newNote);
        this.saveNotes();
        this.isCreatingNote = false;
        this.openNote(newNote.id);
        // 初始化历史栈
        this.initHistory(newNote.id, newNote.content || '');
    },

    openNote: function (id) {
        if (this.isDragging) return;
        this.activeNoteId = id;
        this.currentView = 'editor';
        this.editorMode = 'split';
        this.renderMain();
    },

    backToList: function () {
        this.currentView = 'list';
        this.activeNoteId = null;
        this.renderMain();
    },

    setEditorMode: function (mode) {
        this.editorMode = mode;
        this.hideFloatingToolbar();
        this.renderEditorView(document.getElementById('zm-main-view'));
    },

    setFilter: function (f, el) {
        this.filter = f;
        document.querySelectorAll('.zm-menu-item').forEach(i => i.classList.remove('active'));
        el.classList.add('active');
        this.renderMain();
    },

    handleInput: function (id, el) {
        this.updateNote(id, 'content', el.value);
        const count = document.getElementById('zm-word-count');
        if (count) count.innerText = el.value.length;

        // Update mirror div content for future selections
        const mirror = document.getElementById('zm-mirror-div');
        if (mirror) mirror.textContent = el.value;

        // 推入历史
        this.pushHistory(id, el.value, el.selectionStart, el.selectionEnd);
    },

    handleEditorKeydown: function (e, id) {
        if (!(e.ctrlKey || e.metaKey)) return;
        const key = e.key.toLowerCase();

        // Update last selection before applying formats
        const textarea = document.getElementById('zm-editor-area');
        if (textarea) {
            this.lastSelection = {
                start: textarea.selectionStart,
                end: textarea.selectionEnd
            };
        }

        // Undo / Redo: 自己处理，避免因保存状态导致系统撤销链断裂
        if (key === 'z' && !e.shiftKey) { // Ctrl+Z
            e.preventDefault();
            this.undo(id);
            return;
        } else if (key === 'y' || (key === 'z' && e.shiftKey)) { // Ctrl+Y 或 Ctrl+Shift+Z
            e.preventDefault();
            this.redo(id);
            return;
        }

        switch (key) {
            case 'b': // Bold
                e.preventDefault();
                this.applyFormat('bold');
                break;
            case 'i': // Italic
                e.preventDefault();
                this.applyFormat('italic');
                break;
            case 'u': // Underline
                e.preventDefault();
                this.applyFormat('underline');
                break;
            case '`': // Code (Ctrl+`)
                e.preventDefault();
                this.applyFormat('code');
                break;
            default:
                break;
        }
    },

    syncMirrorScroll: function (textarea) {
        const mirror = document.getElementById('zm-mirror-div');
        if (mirror) mirror.scrollTop = textarea.scrollTop;
    },

    // --- History (Undo/Redo) ---
    initHistory: function (noteId, content, selStart = 0, selEnd = 0) {
        this.historyStacks[noteId] = [{ content, selStart, selEnd }];
        this.historyIndex[noteId] = 0;
    },

    pushHistory: function (noteId, content, selStart = 0, selEnd = 0) {
        if (this.isApplyingHistory) return;
        if (!this.historyStacks[noteId]) {
            this.initHistory(noteId, content, selStart, selEnd);
            return;
        }
        const stack = this.historyStacks[noteId];
        const idx = this.historyIndex[noteId];
        // 截断未来分支
        stack.splice(idx + 1);
        stack.push({ content, selStart, selEnd });
        this.historyIndex[noteId] = stack.length - 1;
    },

    undo: function (noteId) {
        const stack = this.historyStacks[noteId];
        if (!stack) return;
        const idx = this.historyIndex[noteId];
        if (idx <= 0) return;
        this.historyIndex[noteId] = idx - 1;
        this.applyHistoryState(noteId);
    },

    redo: function (noteId) {
        const stack = this.historyStacks[noteId];
        if (!stack) return;
        const idx = this.historyIndex[noteId];
        if (idx >= stack.length - 1) return;
        this.historyIndex[noteId] = idx + 1;
        this.applyHistoryState(noteId);
    },

    applyHistoryState: function (noteId) {
        const stack = this.historyStacks[noteId];
        const idx = this.historyIndex[noteId];
        if (!stack || stack[idx] === undefined) return;
        const state = stack[idx];
        const textarea = document.getElementById('zm-editor-area');
        if (!textarea) return;
        this.isApplyingHistory = true;
        textarea.value = state.content;
        this.lastSelection = { start: state.selStart, end: state.selEnd };
        textarea.selectionStart = state.selStart;
        textarea.selectionEnd = state.selEnd;
        // 更新预览和镜像
        this.updateNote(noteId, 'content', state.content);
        const mirror = document.getElementById('zm-mirror-div');
        if (mirror) mirror.textContent = state.content;
        this.isApplyingHistory = false;
    },

    updateNote: function (id, field, value) {
        const note = this.notes.find(n => n.id === id);
        if (note) {
            note[field] = value;
            note.date = new Date().toISOString();
            this.saveNotes();

            if (field === 'content') {
                const p = document.getElementById('zm-preview-div');
                if (p) p.innerHTML = this.parseMarkdown(value);
            }
            if (field === 'title') {
                const t = document.querySelector('.zm-preview-title');
                if (t) t.innerText = value || '无标题';
            }
        }
    },

    updateTags: function (id, val) {
        const note = this.notes.find(n => n.id === id);
        if (note) {
            note.tags = val.split(/[,，]/).map(t => t.trim()).filter(t => t);
            this.saveNotes();
            const pt = document.querySelector('.zm-preview-tags');
            if (pt) pt.innerHTML = note.tags.map(t => `<span class="tag">${t}</span>`).join('');
        }
    },

    toggleComplete: function (id) {
        const note = this.notes.find(n => n.id === id);
        if (note) {
            note.completed = !note.completed;
            this.saveNotes();
            if (this.currentView === 'editor') {
                this.renderEditorView(document.getElementById('zm-main-view'));
            } else {
                this.renderMain();
            }
        }
    },

    togglePin: function (id) {
        const note = this.notes.find(n => n.id === id);
        if (note) {
            note.pinned = !note.pinned;
            this.saveNotes();
            this.currentView === 'editor' ? this.renderMain() : this.renderListView(document.getElementById('zm-main-view'));
        }
    },

    deleteNote: function (id) {
        if (!confirm('确定要删除吗？')) return;
        this.notes = this.notes.filter(n => n.id !== id);
        this.saveNotes();
        if (this.currentView === 'editor') this.backToList();
        else this.renderMain();
    },

    // --- Toolbar Positioning Logic ---
    hideFloatingToolbar: function () {
        const toolbar = document.getElementById('zm-float-bar');
        if (toolbar) toolbar.style.display = 'none';
    },

    handleSourceSelection: function () {
        if (this.currentView !== 'editor' || this.editorMode === 'preview') return;
        const textarea = document.getElementById('zm-editor-area');
        if (!textarea) return;

        if (this.selectionTimer) clearTimeout(this.selectionTimer);
        this.selectionTimer = setTimeout(() => {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            this.lastSelection = { start, end };
            const toolbar = document.getElementById('zm-float-bar');

            if (start === end) {
                this.hideFloatingToolbar();
                return;
            }

            // Calculate precise position using mirror div
            const coords = this.getCaretCoordinates(textarea, start, end);

            if (coords) {
                const textareaRect = textarea.getBoundingClientRect();
                const selectionTop = textareaRect.top + coords.top - textarea.scrollTop;
                const selectionLeft = textareaRect.left + coords.left - textarea.scrollLeft;

                // Clamp to viewport to avoid going off-screen
                const viewportPadding = 12;
                const clampedLeft = Math.max(viewportPadding, Math.min(window.innerWidth - viewportPadding, selectionLeft));
                const clampedTop = Math.max(viewportPadding, selectionTop);

                toolbar.style.position = 'fixed';
                toolbar.style.left = clampedLeft + 'px';
                toolbar.style.top = (clampedTop - 50) + 'px'; // 50px above selection
                toolbar.style.transform = 'translate(-50%, 0)';
                toolbar.style.zIndex = '10002';
                toolbar.style.display = 'flex';
            }
        }, 150);
    },

    getCaretCoordinates: function (element, start, end) {
        const mirror = document.getElementById('zm-mirror-div');
        if (!mirror) return null;

        const val = element.value;
        const preText = val.substring(0, start);
        const selText = val.substring(start, end);

        mirror.innerHTML = this.escapeHtml(preText) +
            `<span id="zm-caret-span">${this.escapeHtml(selText)}</span>` +
            this.escapeHtml(val.substring(end));

        // Sync scroll to mirror to keep offset计算准确
        mirror.scrollTop = element.scrollTop;
        mirror.scrollLeft = element.scrollLeft;

        const span = document.getElementById('zm-caret-span');
        if (!span) return null;

        return {
            top: span.offsetTop - mirror.scrollTop,
            left: span.offsetLeft - mirror.scrollLeft + (span.offsetWidth / 2) // Center of selection
        };
    },

    handlePreviewSelection: function () {
        if (this.selectionTimer) clearTimeout(this.selectionTimer);
        this.selectionTimer = setTimeout(() => {
            const selection = window.getSelection();
            const text = selection.toString();
            const toolbar = document.getElementById('zm-float-bar');

            if (!text) {
                this.hideFloatingToolbar();
                return;
            }

            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            toolbar.style.display = 'flex';
            toolbar.style.left = (rect.left + rect.width / 2) + 'px';
            toolbar.style.top = (rect.top - 45) + 'px';
            toolbar.style.transform = 'translate(-50%, 0)';
        }, 200);
    },

    applyFormat: function (type, val) {
        const textarea = document.getElementById('zm-editor-area');
        if (!textarea) return;

        // 恢复上一次选区，避免点击工具栏丢失选区
        let start = textarea.selectionStart;
        let end = textarea.selectionEnd;
        if (start === end && this.lastSelection) {
            start = this.lastSelection.start;
            end = this.lastSelection.end;
        }

        const text = textarea.value;
        const selection = text.substring(start, end);

        const doReplace = (newText) => {
            textarea.value = text.substring(0, start) + newText + text.substring(end);
            const cursorPos = start + newText.length;
            textarea.selectionStart = textarea.selectionEnd = cursorPos;
            this.lastSelection = { start: cursorPos, end: cursorPos };

            this.updateNote(this.activeNoteId, 'content', textarea.value);
            this.hideFloatingToolbar();
            textarea.focus();

            const mirror = document.getElementById('zm-mirror-div');
            if (mirror) mirror.textContent = textarea.value;
        };

        switch (type) {
            case 'bold': doReplace(`**${selection || '粗体'}**`); break;
            case 'italic': doReplace(`*${selection || '斜体'}*`); break;
            case 'underline': doReplace(`<u>${selection || '下划线'}</u>`); break;
            case 'strike': doReplace(`~~${selection || '删除线'}~~`); break;
            case 'color': doReplace(`<span style="color:${val}">${selection || '文字'}</span>`); break;
            case 'bg': doReplace(`<span style="background-color:${val}">${selection || '背景'}</span>`); break;
            case 'code': doReplace(`\`${selection || '代码'}\``); break;
            case 'quote': doReplace(`\n> ${selection || '引用'}`); break;
            case 'header': doReplace(`\n${'#'.repeat(parseInt(val))} ${selection || '标题'}\n`); break;
            case 'check': doReplace(`\n- [ ] ${selection || '待办项'}`); break;
            case 'link':
                const url = prompt("链接地址:", "https://");
                if (url) doReplace(`[${selection || '链接text'}](${url})`);
                break;
            case 'image':
                const img = prompt("图片地址 (URL):");
                if (img) doReplace(`\n![图片](${img})\n`);
                break;
        }

        // 推入历史
        this.pushHistory(this.activeNoteId, textarea.value, textarea.selectionStart, textarea.selectionEnd);
    },

    // --- Helpers ---
    parseMarkdown: function (text) {
        if (typeof marked !== 'undefined') {
            return marked.parse(text || '');
        }
        return this.escapeHtml(text || '');
    },

    escapeHtml: function (text) {
        if (!text) return '';
        return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    },

    handleSearch: function (val) {
        val = val.toLowerCase();
        document.querySelectorAll('.zm-note-card:not(.new-page-card)').forEach(c => {
            c.style.display = (c.innerText.toLowerCase().includes(val)) ? 'flex' : 'none';
        });
    },

    // Context Menu Handlers (same as before)
    openContextMenu: function (e, id) {
        e.preventDefault(); e.stopPropagation();
        this.contextTargetId = id;
        const menu = document.getElementById('zm-context-menu');
        if (!menu) return;

        const modal = this.container.closest('.modal-content');
        if (modal) {
            const rect = modal.getBoundingClientRect();
            let left = e.clientX - rect.left;
            let top = e.clientY - rect.top;
            menu.style.position = 'absolute';
            menu.style.left = left + 'px';
            menu.style.top = top + 'px';
            if (!modal.contains(menu)) modal.appendChild(menu);
        } else {
            menu.style.position = 'fixed';
            menu.style.left = e.clientX + 'px';
            menu.style.top = e.clientY + 'px';
        }
        menu.style.display = 'block';
    },

    hideContextMenu: function () {
        const menu = document.getElementById('zm-context-menu');
        if (menu) menu.style.display = 'none';
    },

    handleContextAction: function (action) {
        const id = this.contextTargetId;
        if (!id) return;
        this.hideContextMenu();
        const note = this.notes.find(n => n.id === id);
        if (!note) return;

        switch (action) {
            case 'open': this.openNote(id); break;
            case 'pin': this.togglePin(id); break;
            case 'delete': this.deleteNote(id); break;
            case 'copy':
                const copy = { ...note, id: Date.now(), title: note.title + ' (副本)', date: new Date().toISOString() };
                this.notes.splice(1, 0, copy);
                this.saveNotes();
                this.renderMain();
                break;
        }
    },

    // Drag Drop (Existing implementation)
    handleDragStart: function (e) {
        const card = e.target.closest('.zm-note-card');
        if (!card || card.classList.contains('new-page-card')) { e.preventDefault(); return; }
        card.classList.add('dragging');
        e.dataTransfer.setData('text/plain', card.dataset.id);
        this.draggedItem = card;
        this.isDragging = true;
    },
    handleDragOver: function (e) {
        e.preventDefault();
        const container = document.querySelector('.zm-list-grid');
        const afterElement = this.getDragAfterElement(container, e.clientY);
        const draggable = document.querySelector('.dragging');
        if (!draggable) return;
        if (afterElement == null) {
            const newPage = container.querySelector('.new-page-card');
            newPage ? container.insertBefore(draggable, newPage) : container.appendChild(draggable);
        } else {
            container.insertBefore(draggable, afterElement);
        }
    },
    handleDragEnd: function (e) {
        const card = e.target.closest('.zm-note-card');
        if (card) card.classList.remove('dragging');
        this.saveNewOrder();
        this.isDragging = false;
    },
    handleDrop: function (e) { e.preventDefault(); },
    getDragAfterElement: function (container, y) {
        const draggableElements = [...container.querySelectorAll('.zm-note-card:not(.dragging):not(.new-page-card)')];
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    },
    saveNewOrder: function () {
        const cards = document.querySelectorAll('.zm-note-card:not(.new-page-card)');
        const newOrderIds = Array.from(cards).map(c => parseInt(c.dataset.id));
        const noteMap = new Map(this.notes.map(n => [n.id, n]));
        const sortedNotes = [];
        newOrderIds.forEach(id => { if (noteMap.has(id)) { sortedNotes.push(noteMap.get(id)); noteMap.delete(id); } });
        noteMap.forEach(note => sortedNotes.push(note));
        this.notes = sortedNotes;
        this.saveNotes();
    }
};

window.ZipMemo = ZipMemo;