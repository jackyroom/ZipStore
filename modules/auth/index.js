const path = require('path');
const { render } = require('../../core/layout-engine');

module.exports = {
    meta: {
        id: 'auth',
        name: '用户认证',
    },
    routes: [
        {
            method: 'GET',
            path: '/login',
            handler: (req, res) => {
                const html = `
                    <div style="display: flex; justify-content: center; align-items: center; height: 100%; min-height: 60vh;">
                        <div class="glass-card fade-in" style="width: 100%; max-width: 420px; padding: 40px; position: relative; overflow: hidden;">
                            
                            <!-- 装饰背景圆 -->
                            <div style="position: absolute; top: -50px; right: -50px; width: 100px; height: 100px; background: var(--primary); filter: blur(50px); opacity: 0.4; border-radius: 50%;"></div>
                            <div style="position: absolute; bottom: -50px; left: -50px; width: 100px; height: 100px; background: var(--secondary); filter: blur(50px); opacity: 0.4; border-radius: 50%;"></div>

                            <div style="text-align: center; margin-bottom: 30px;">
                                <div style="width: 60px; height: 60px; background: linear-gradient(135deg, var(--primary), var(--secondary)); border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 15px; box-shadow: 0 10px 20px rgba(0,0,0,0.2);">
                                    <i class="fa-solid fa-user-astronaut" style="font-size: 30px; color: white;"></i>
                                </div>
                                <h2 style="font-size: 1.8rem; font-weight: 800; margin-bottom: 5px;">欢迎回来</h2>
                                <p style="color: var(--text-muted);">登录 JackyRoom 访问您的专属空间</p>
                            </div>

                            <form>
                                <div style="margin-bottom: 20px;">
                                    <label style="display: block; color: var(--text-muted); font-size: 0.85rem; margin-bottom: 8px; font-weight: 600;">账号 / 邮箱</label>
                                    <div style="position: relative;">
                                        <i class="fa-regular fa-envelope" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-muted);"></i>
                                        <input type="text" placeholder="name@example.com" style="width: 100%; padding: 12px 12px 12px 40px; background: rgba(0,0,0,0.3); border: 1px solid var(--glass-border); border-radius: 10px; color: white; outline: none; transition: border-color 0.3s;">
                                    </div>
                                </div>

                                <div style="margin-bottom: 25px;">
                                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                        <label style="color: var(--text-muted); font-size: 0.85rem; font-weight: 600;">密码</label>
                                        <a href="#" style="font-size: 0.8rem; color: var(--accent);">忘记密码?</a>
                                    </div>
                                    <div style="position: relative;">
                                        <i class="fa-solid fa-lock" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-muted);"></i>
                                        <input type="password" placeholder="••••••••" style="width: 100%; padding: 12px 12px 12px 40px; background: rgba(0,0,0,0.3); border: 1px solid var(--glass-border); border-radius: 10px; color: white; outline: none;">
                                    </div>
                                </div>

                                <button type="button" style="width: 100%; padding: 14px; background: linear-gradient(to right, var(--primary), var(--secondary)); border: none; border-radius: 10px; color: white; font-weight: bold; font-size: 1rem; cursor: pointer; transition: opacity 0.2s; box-shadow: 0 5px 15px var(--primary-30);">
                                    立即登录 <i class="fa-solid fa-arrow-right" style="margin-left: 8px;"></i>
                                </button>
                            </form>

                            <div style="margin-top: 30px; text-align: center; border-top: 1px solid var(--glass-border); padding-top: 20px;">
                                <p style="font-size: 0.9rem; color: var(--text-muted);">
                                    还没有账号？ <a href="#" style="color: var(--accent); font-weight: 600;">创建新账户</a>
                                </p>
                            </div>
                        </div>
                    </div>
                `;
                res.send(render({ title: '登录', content: html, currentModule: 'auth' }));
            }
        }
    ],
    onInit: (app) => {
        console.log('   🔐 Auth Module Loaded');
    }
};