/**
 * 通用数据管理器：处理搜索、排序和数据存储
 * 可在其他模块（如相册、资源库）复用
 */
class DataManager {
    constructor(data = []) {
        this.originalData = data;
        this.currentData = data;
    }

    setData(data) {
        this.originalData = data;
        this.currentData = data;
    }

    search(query, fields = ['title', 'content']) {
        if (!query) {
            this.currentData = [...this.originalData];
            return this.currentData;
        }
        const lowerQuery = query.toLowerCase();
        this.currentData = this.originalData.filter(item => 
            fields.some(field => item[field] && item[field].toString().toLowerCase().includes(lowerQuery))
        );
        return this.currentData;
    }

    sort(type, key = 'created_at') {
        const sorted = [...this.currentData];
        if (type === 'newest') {
            sorted.sort((a, b) => new Date(b[key]) - new Date(a[key]));
        } else if (type === 'oldest') {
            sorted.sort((a, b) => new Date(a[key]) - new Date(b[key]));
        } else if (type === 'alpha') {
            sorted.sort((a, b) => a.title.localeCompare(b.title));
        }
        this.currentData = sorted;
        return this.currentData;
    }
}

/**
 * 通用评论管理器
 * 可在其他模块复用
 */
class CommentManager {
    constructor(containerId, contextType) {
        this.container = document.getElementById(containerId);
        this.contextType = contextType;
        this.contextId = null;
    }

    async load(contextId) {
        this.contextId = contextId;
        try {
            const res = await fetch(`/blog/api/comments?type=${this.contextType}&id=${contextId}`);
            const comments = await res.json();
            this.render(comments);
        } catch (e) {
            console.error("Error loading comments:", e);
        }
    }

    render(comments) {
        let html = `
            <div class="comments-section">
                <h3>评论 (${comments.length})</h3>
                <div class="comment-form">
                    <input type="text" id="comment-user" placeholder="昵称 (可选)" class="form-input input-sm">
                    <textarea id="comment-content" placeholder="写下你的想法..." class="form-input"></textarea>
                    <button onclick="BlogApp.submitComment()" class="btn btn-sm btn-primary">发送</button>
                </div>
                <div class="comments-list">
        `;
        
        if (comments.length === 0) {
            html += '<div class="no-comments">暂无评论，抢占沙发！</div>';
        } else {
            comments.forEach(c => {
                html += `
                    <div class="comment-item">
                        <div class="comment-meta">
                            <span class="comment-user">${c.user_name}</span>
                            <span class="comment-time">${new Date(c.created_at).toLocaleString()}</span>
                        </div>
                        <div class="comment-body">${c.content}</div>
                    </div>
                `;
            });
        }
        html += '</div></div>';
        this.container.innerHTML = html;
    }
}

// 博客应用主逻辑
const BlogApp = {
    dataManager: new DataManager(),
    commentManager: null,
    currentPostId: null,

    init: async function() {
        this.bindEvents();
        await this.refreshList();
    },

    bindEvents: function() {
        const searchInput = document.getElementById('blog-search');
        if(searchInput) {
            searchInput.addEventListener('input', (e) => {
                const results = this.dataManager.search(e.target.value);
                this.renderList(results);
            });
        }

        const sortSelect = document.getElementById('blog-sort');
        if(sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                const results = this.dataManager.sort(e.target.value);
                this.renderList(results);
            });
        }
    },

    refreshList: async function() {
        try {
            const res = await fetch('/blog/api/posts');
            const posts = await res.json();
            this.dataManager.setData(posts);
            this.renderList(posts);
        } catch(e) {
            console.error("Fetch error:", e);
        }
    },

    renderList: function(posts) {
        const container = document.getElementById('blog-list');
        if(!container) return;

        if (posts.length === 0) {
            container.innerHTML = '<div class="empty-state">没有找到文章</div>';
            return;
        }
        
        container.innerHTML = posts.map(post => `
            <div class="blog-card" onclick="BlogApp.viewPost(${post.id})">
                <h2>${post.title}</h2>
                <div class="blog-meta">📅 ${new Date(post.created_at).toLocaleDateString()}</div>
                <p class="blog-excerpt">${post.content.substring(0, 100)}...</p>
                <div class="blog-tags">${post.tags ? post.tags.split(',').map(t => `<span class="tag">${t}</span>`).join('') : ''}</div>
            </div>
        `).join('');
    },

    // 显示编辑器 (新建或编辑)
    showEditor: async function(id = null) {
        let post = { title: '', content: '', tags: '' };
        if (id) {
            const res = await fetch(`/blog/api/posts/${id}`);
            post = await res.json();
        }
        
        const html = `
            <h2>${id ? '编辑文章' : '新文章'}</h2>
            <div class="editor-form">
                <input type="text" id="edit-title" value="${post.title}" placeholder="文章标题" class="form-input">
                <input type="text" id="edit-tags" value="${post.tags || ''}" placeholder="标签 (逗号分隔)" class="form-input">
                
                <div class="editor-tabs">
                    <button onclick="BlogApp.togglePreview(false)" class="active">编辑</button>
                    <button onclick="BlogApp.togglePreview(true)">预览</button>
                </div>
                
                <div id="editor-area">
                    <textarea id="edit-content" class="form-input editor-textarea" placeholder="支持 Markdown 语法...">${post.content}</textarea>
                </div>
                <div id="preview-area" class="hidden markdown-body"></div>
                
                <div class="actions">
                    <button onclick="BlogApp.savePost(${id})" class="btn btn-primary">保存</button>
                    ${id ? `<button onclick="BlogApp.deletePost(${id})" class="btn btn-danger">删除</button>` : ''}
                </div>
            </div>
        `;
        this.openModal(html);
    },

    togglePreview: function(showPreview) {
        const editor = document.getElementById('editor-area');
        const preview = document.getElementById('preview-area');
        const content = document.getElementById('edit-content').value;
        const tabs = document.querySelectorAll('.editor-tabs button');

        if (showPreview) {
            editor.classList.add('hidden');
            preview.classList.remove('hidden');
            // 使用 marked.js 渲染
            preview.innerHTML = window.marked ? marked.parse(content) : content;
            tabs[0].classList.remove('active');
            tabs[1].classList.add('active');
        } else {
            editor.classList.remove('hidden');
            preview.classList.add('hidden');
            tabs[0].classList.add('active');
            tabs[1].classList.remove('active');
        }
    },

    savePost: async function(id) {
        const data = {
            title: document.getElementById('edit-title').value,
            content: document.getElementById('edit-content').value,
            tags: document.getElementById('edit-tags').value
        };

        const url = id ? `/blog/api/posts/${id}` : '/blog/api/posts';
        const method = id ? 'PUT' : 'POST';

        await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        this.closeModal();
        this.refreshList();
    },

    deletePost: async function(id) {
        if(!confirm('确定要删除这篇文章吗？')) return;
        await fetch(`/blog/api/posts/${id}`, { method: 'DELETE' });
        this.closeModal();
        this.refreshList();
    },

    viewPost: async function(id) {
        this.currentPostId = id;
        const res = await fetch(`/blog/api/posts/${id}`);
        const post = await res.json();

        const html = `
            <article class="blog-view">
                <div class="actions-top">
                     <button onclick="BlogApp.showEditor(${post.id})" class="btn btn-sm btn-secondary">编辑</button>
                </div>
                <h1>${post.title}</h1>
                <div class="blog-meta">
                    <span>${new Date(post.created_at).toLocaleString()}</span>
                    <span>${post.tags}</span>
                </div>
                <div class="markdown-body mt-4">
                    ${window.marked ? marked.parse(post.content) : post.content}
                </div>
                <hr>
                <div id="post-comments"></div>
            </article>
        `;
        this.openModal(html);
        
        // 初始化评论区
        this.commentManager = new CommentManager('post-comments', 'blog');
        this.commentManager.load(id);
    },

    submitComment: async function() {
        const user = document.getElementById('comment-user').value;
        const content = document.getElementById('comment-content').value;
        
        if (!content) return alert('请输入评论内容');

        await fetch('/blog/api/comments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'blog',
                id: this.currentPostId,
                user: user,
                content: content
            })
        });

        this.commentManager.load(this.currentPostId); // 刷新评论
    },

    // 模态框控制
    openModal: function(content) {
        const modal = document.getElementById('blog-modal');
        document.getElementById('modal-body').innerHTML = content;
        modal.classList.remove('hidden');
        modal.style.display = 'block';
    },

    closeModal: function() {
        const modal = document.getElementById('blog-modal');
        modal.classList.add('hidden');
        modal.style.display = 'none';
        this.currentPostId = null;
    }
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    BlogApp.init();
});

