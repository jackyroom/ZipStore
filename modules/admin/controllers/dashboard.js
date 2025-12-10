const { renderAdminPage, getDashboardStats, formatFileSize } = require('../admin-helpers');
const db = require('../../../core/db-access');

module.exports = [
    {
        path: '/',
        method: 'get',
        handler: async (req, res) => {
            try {
                const stats = await getDashboardStats();
                const recentResources = await db.query(`
                    SELECT r.*, c.name as category_name, u.username as author_name
                    FROM resources r
                    LEFT JOIN categories c ON r.category_id = c.id
                    LEFT JOIN users u ON r.author_id = u.id
                    ORDER BY r.created_at DESC
                    LIMIT 10
                `);

                const content = `
                <div style="margin-bottom: 30px;">
                    <h2 style="color:white; margin-bottom:10px;">Hey there! 🤩</h2>
                    <p style="color:var(--text-secondary);">这里是您的站点今日概况。</p>
                </div>

                <!-- 统计卡片 -->
                <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap:24px; margin-bottom:32px;">
                    <div class="stat-card">
                        <div class="stat-icon-box" style="background: rgba(59, 130, 246, 0.15); color: var(--primary-accent);">
                            <i class="fa-solid fa-cube"></i>
                        </div>
                        <div>
                            <div class="stat-label">总资源数</div>
                            <div class="stat-value">${stats.totalResources}</div>
                            <div class="stat-trend up"><i class="fa-solid fa-arrow-trend-up"></i> +${stats.todayResources} 今日新增</div>
                        </div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-icon-box" style="background: rgba(139, 92, 246, 0.15); color: var(--secondary-accent);">
                            <i class="fa-solid fa-users"></i>
                        </div>
                        <div>
                            <div class="stat-label">注册用户</div>
                            <div class="stat-value">${stats.totalUsers}</div>
                            <div class="stat-trend up"><i class="fa-solid fa-arrow-trend-up"></i> 活跃增长中</div>
                        </div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-icon-box" style="background: rgba(16, 185, 129, 0.15); color: var(--success);">
                            <i class="fa-solid fa-hard-drive"></i>
                        </div>
                        <div>
                            <div class="stat-label">存储占用</div>
                            <div class="stat-value">${formatFileSize(stats.totalStorage)}</div>
                            <div class="stat-trend down"><i class="fa-solid fa-server"></i> 系统运行正常</div>
                        </div>
                    </div>
                </div>

                <!-- 图表区域 -->
                <div style="display:grid; grid-template-columns: 2fr 1fr; gap:24px; margin-bottom:32px;">
                    <div class="glass-card" style="display:flex; flex-direction:column; gap:12px;">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <h3>访问趋势 Analytics</h3>
                            <select style="width:auto; padding:6px 12px; font-size:0.8rem; background:rgba(255,255,255,0.05); border:none;">
                                <option>2024</option>
                            </select>
                        </div>
                        <div style="position:relative; height:320px;">
                            <canvas id="trafficChart" style="position:absolute; inset:0;"></canvas>
                        </div>
                    </div>
                    <div class="glass-card" style="display:flex; flex-direction:column; gap:12px;">
                        <h3>Activity</h3>
                        <div style="position:relative; height:280px;">
                            <canvas id="storageChart" style="position:absolute; inset:0;"></canvas>
                        </div>
                        <div style="margin-top:4px; display:flex; justify-content:space-around; text-align:center;">
                            ${stats.categoryStats.slice(0, 2).map((cat, i) => `
                                <div>
                                    <div style="color:${i === 0 ? '#3b82f6' : '#8b5cf6'}; font-size:0.8rem;">● ${cat.name}</div>
                                    <div style="font-weight:bold; margin-top:5px;">${Math.round(cat.count / stats.totalResources * 100)}%</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <div style="display:grid; grid-template-columns: 2fr 1fr; gap:24px;">
                    <!-- 最近资源 -->
                    <div class="glass-card">
                        <h3>最近上传资源</h3>
                        <div style="overflow-x:auto;">
                            <table class="admin-table">
                                <thead>
                                    <tr>
                                        <th>资源名称</th>
                                        <th>分类</th>
                                        <th>作者</th>
                                        <th>状态</th>
                                        <th>操作</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${recentResources.length > 0 ? recentResources.map(r => `
                                        <tr>
                                            <td>
                                                <div style="font-weight:500; color:white;">${r.title}</div>
                                                <div style="font-size:0.8rem; color:var(--text-secondary);">ID: #${r.id}</div>
                                            </td>
                                            <td><span class="tag-badge">${r.category_name || '未分类'}</span></td>
                                            <td>
                                                <div style="display:flex; align-items:center; gap:8px;">
                                                    <div style="width:24px; height:24px; background:var(--card-hover); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:0.7rem;">
                                                        <i class="fa-solid fa-user"></i>
                                                    </div>
                                                    ${r.author_name || '未知'}
                                                </div>
                                            </td>
                                            <td><span class="status-badge ${r.status}">${r.status}</span></td>
                                            <td>
                                                <a href="/admin/resources/${r.id}/edit" class="action-btn view"><i class="fa-solid fa-pen"></i></a>
                                            </td>
                                        </tr>
                                    `).join('') : '<tr><td colspan="5" style="text-align:center; color:var(--text-secondary);">暂无数据</td></tr>'}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- 空间占用排行 -->
                    <div class="glass-card">
                        <h3>Top Creators</h3>
                        <div style="display:flex; flex-direction:column; gap:16px;">
                            ${stats.topUsers.length > 0 ? stats.topUsers.map((u, idx) => `
                                <div style="display:flex; align-items:center; gap:12px;">
                                    <div style="width:40px; height:40px; background:var(--card-hover); border-radius:12px; display:flex; align-items:center; justify-content:center; font-weight:bold; color:var(--text-secondary);">
                                        ${idx + 1}
                                    </div>
                                    <div style="flex:1;">
                                        <div style="font-weight:500; color:white;">${u.username}</div>
                                        <div style="font-size:0.8rem; color:var(--text-secondary);">${u.file_count || 0} Files</div>
                                    </div>
                                    <div style="text-align:right;">
                                        <div style="color:white; font-weight:600;">${u.formatted_size}</div>
                                        <div style="font-size:0.75rem; color:var(--text-secondary);">Used</div>
                                    </div>
                                </div>
                            `).join('') : '<div style="text-align:center; color:var(--text-secondary);">暂无数据</div>'}
                        </div>
                    </div>
                </div>

                <script>
                    document.addEventListener('DOMContentLoaded', function() {
                        // Traffic Chart
                        const ctxTraffic = document.getElementById('trafficChart').getContext('2d');
                        new Chart(ctxTraffic, {
                            type: 'bar',
                            data: {
                                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
                                datasets: [{
                                    label: 'Income',
                                    data: [35, 28, 45, 30, 50, 45, 30, 45],
                                    backgroundColor: '#3b82f6',
                                    borderRadius: 4,
                                    barPercentage: 0.3
                                }, {
                                    label: 'Outcome',
                                    data: [25, 35, 25, 40, 25, 35, 45, 25],
                                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                                    borderRadius: 4,
                                    barPercentage: 0.3
                                }]
                            },
                            options: {
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: { legend: { display: false } },
                                scales: {
                                    y: { 
                                        grid: { color: '#2f3336', borderDash: [5, 5] }, 
                                        ticks: { color: '#a1a1aa' },
                                        beginAtZero: true
                                    },
                                    x: { 
                                        grid: { display: false },
                                        ticks: { color: '#a1a1aa' }
                                    }
                                }
                            }
                        });

                        // Storage Chart
                        const ctxStorage = document.getElementById('storageChart').getContext('2d');
                        const catData = ${JSON.stringify(stats.categoryStats)};
                        new Chart(ctxStorage, {
                            type: 'doughnut',
                            data: {
                                labels: catData.map(c => c.name),
                                datasets: [{
                                    data: catData.map(c => c.count),
                                    backgroundColor: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'],
                                    borderWidth: 0,
                                    cutout: '75%'
                                }]
                            },
                            options: {
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: { 
                                    legend: { display: false },
                                    tooltip: {
                                        backgroundColor: '#1f2937',
                                        padding: 12,
                                        cornerRadius: 8
                                    }
                                }
                            }
                        });
                    });
                </script>
            `;
                res.send(renderAdminPage('/admin', content));
            } catch (error) {
                console.error('Admin dashboard error:', error);
                res.status(500).send('Dashboard Error');
            }
        }
    }
];
