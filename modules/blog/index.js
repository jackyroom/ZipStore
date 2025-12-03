const dbAccess = require('../../core/db-access');
const layoutEngine = require('../../core/layout-engine');

// 渲染博客主页 (SPA 风格入口)
const blogHomeHandler = async (req, res) => {
    const htmlContent = `
        <link rel="stylesheet" href="/modules/blog/blog.css">
        <div class="blog-container">
            <div class="blog-header">
                <h1>我的博客</h1>
                <div class="blog-controls">
                    <input type="text" id="blog-search" placeholder="搜索文章..." class="form-input">
                    <select id="blog-sort" class="form-select">
                        <option value="newest">最新发布</option>
                        <option value="oldest">最早发布</option>
                        <option value="alpha">标题 A-Z</option>
                    </select>
                    <button onclick="BlogApp.showEditor()" class="btn btn-primary">✍️ 写文章</button>
                </div>
            </div>

            <div id="blog-list" class="blog-list">
                <!-- 文章列表将通过 JS 加载 -->
                <div class="loading">加载中...</div>
            </div>

            <!-- 文章阅读/编辑 模态框 -->
            <div id="blog-modal" class="modal hidden">
                <div class="modal-content">
                    <span class="close-btn" onclick="BlogApp.closeModal()">&times;</span>
                    <div id="modal-body"></div>
                </div>
            </div>
        </div>
        <!-- 使用 marked 库来渲染 Markdown -->
        <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
        <script src="/modules/blog/blog-client.js"></script>
    `;
    
    res.send(layoutEngine.render({ 
        title: '博客', 
        content: htmlContent, 
        currentModule: 'blog' 
    }));
};

// --- API 接口处理器 ---

// 获取所有文章
const getAllPostsHandler = async (req, res) => {
    try {
        const posts = await dbAccess.getAllPosts();
        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 获取单篇文章
const getPostByIdHandler = async (req, res) => {
    try {
        const post = await dbAccess.getPostById(req.params.id);
        res.json(post);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 创建文章
const createPostHandler = async (req, res) => {
    try {
        const { title, content, tags } = req.body;
        const id = await dbAccess.createPost(title, content, tags);
        res.json({ success: true, id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 更新文章
const updatePostHandler = async (req, res) => {
    try {
        const { title, content, tags } = req.body;
        await dbAccess.updatePost(req.params.id, title, content, tags);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 删除文章
const deletePostHandler = async (req, res) => {
    try {
        await dbAccess.deletePost(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 获取评论 (通用接口)
const getCommentsHandler = async (req, res) => {
    try {
        const { type, id } = req.query;
        const comments = await dbAccess.getComments(type, id);
        res.json(comments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 添加评论 (通用接口)
const addCommentHandler = async (req, res) => {
    try {
        const { type, id, user, content } = req.body;
        const result = await dbAccess.addComment(type, id, user, content);
        res.json({ success: true, ...result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    meta: { id: 'blog', name: '博客' },
    routes: [
        { path: '/', method: 'get', handler: blogHomeHandler },
        { path: '/api/posts', method: 'get', handler: getAllPostsHandler },
        { path: '/api/posts/:id', method: 'get', handler: getPostByIdHandler },
        { path: '/api/posts', method: 'post', handler: createPostHandler },
        { path: '/api/posts/:id', method: 'put', handler: updatePostHandler },
        { path: '/api/posts/:id', method: 'delete', handler: deletePostHandler },
        { path: '/api/comments', method: 'get', handler: getCommentsHandler },
        { path: '/api/comments', method: 'post', handler: addCommentHandler }
    ]
};