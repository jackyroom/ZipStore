const { renderAdminPage } = require('../admin-helpers');
const db = require('../../../core/db-access');

module.exports = [
    {
        path: '/settings',
        method: 'get',
        handler: async (req, res) => {
            await db.run("CREATE TABLE IF NOT EXISTS system_settings (key TEXT PRIMARY KEY, value TEXT)");

            const settingsRows = await db.query("SELECT * FROM system_settings");
            const settings = {};
            settingsRows.forEach(row => settings[row.key] = row.value);

            const content = `
                <div class="glass-card" style="max-width: 800px; margin: 0 auto;">
                    <div style="margin-bottom:32px;">
                        <h2>系统设置</h2>
                        <p style="color:var(--text-secondary);">配置站点基础信息与全局开关</p>
                    </div>

                    <form action="/admin/settings/save" method="POST" class="admin-form">
                        <section style="margin-bottom: 40px;">
                            <h3 style="display:flex; align-items:center; gap:10px; margin-bottom:20px; color:var(--primary-accent);">
                                <i class="fa-solid fa-globe"></i> 站点基本信息
                            </h3>
                            
                            <div style="background:rgba(0,0,0,0.2); padding:20px; border-radius:12px; border:1px solid var(--border-color);">
                                <label>网站名称</label>
                                <input type="text" name="site_name" value="${settings.site_name || 'ZipStore Resource'}" placeholder="例如：ZipStore">
                                
                                <div style="height:16px;"></div>

                                <label>网站描述 (SEO Meta)</label>
                                <textarea name="site_description" placeholder="用于搜索引擎的描述" style="min-height:80px;">${settings.site_description || ''}</textarea>
                            </div>
                        </section>
                        
                        <section style="margin-bottom: 40px;">
                            <h3 style="display:flex; align-items:center; gap:10px; margin-bottom:20px; color:var(--secondary-accent);">
                                <i class="fa-solid fa-sliders"></i> 功能与安全
                            </h3>
                            
                            <div style="background:rgba(0,0,0,0.2); padding:20px; border-radius:12px; border:1px solid var(--border-color);">
                                <div style="display:flex; justify-content:space-between; align-items:center; padding:12px 0; border-bottom:1px solid var(--border-color);">
                                    <div>
                                        <div style="font-weight:500; font-size:0.95rem;">允许新用户注册</div>
                                        <div style="font-size:0.8rem; color:var(--text-secondary);">关闭后新用户将无法注册账号</div>
                                    </div>
                                    <label class="switch">
                                        <input type="checkbox" name="allow_register" value="true" ${settings.allow_register === 'true' ? 'checked' : ''} style="width:20px; height:20px;">
                                    </label>
                                </div>

                                <div style="display:flex; justify-content:space-between; align-items:center; padding:12px 0;">
                                    <div>
                                        <div style="font-weight:500; font-size:0.95rem;">维护模式</div>
                                        <div style="font-size:0.8rem; color:var(--text-secondary);">启用后仅管理员可访问站点前台</div>
                                    </div>
                                    <label class="switch">
                                        <input type="checkbox" name="maintenance_mode" value="true" ${settings.maintenance_mode === 'true' ? 'checked' : ''} style="width:20px; height:20px;">
                                    </label>
                                </div>
                            </div>
                        </section>

                        <div style="display:flex; justify-content:flex-end;">
                            <button type="submit" class="btn-primary" style="padding:12px 40px; font-size:1rem;">
                                <i class="fa-solid fa-save"></i> 保存设置
                            </button>
                        </div>
                    </form>
                </div>
            `;
            res.send(renderAdminPage('/admin/settings', content));
        }
    },

    {
        path: '/settings/save',
        method: 'post',
        handler: async (req, res) => {
            try {
                await db.run("CREATE TABLE IF NOT EXISTS system_settings (key TEXT PRIMARY KEY, value TEXT)");

                const { site_name, site_description, allow_register, maintenance_mode } = req.body;

                const saveSetting = async (key, value) => {
                    await db.run("INSERT OR REPLACE INTO system_settings (key, value) VALUES (?, ?)", [key, value || '']);
                };

                await saveSetting('site_name', site_name);
                await saveSetting('site_description', site_description);
                await saveSetting('allow_register', allow_register ? 'true' : 'false');
                await saveSetting('maintenance_mode', maintenance_mode ? 'true' : 'false');

                res.redirect('/admin/settings');
            } catch (error) {
                res.send(`<h1 style="color:white">Save Failed: ${error.message}</h1>`);
            }
        }
    }
];
