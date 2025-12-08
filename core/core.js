// 立即执行：在 DOM 解析时就开始处理，不等待 DOMContentLoaded
(function() {
    // 立即检查并应用折叠状态（在页面渲染前）
    if (window.innerWidth > 768) {
        const applyCollapsedState = () => {
            const sidebar = document.getElementById('appSidebar') || document.querySelector('.sidebar');
            if (sidebar) {
                sidebar.classList.add('collapsed');
                // 移除内联样式，使用 CSS 类来控制（更优雅）
                const inlineStyle = document.getElementById('sidebar-collapsed-inline');
                if (inlineStyle) {
                    setTimeout(() => inlineStyle.remove(), 0);
                }
            }
        };
        
        // 如果标记了需要折叠，立即应用
        if (window.__sidebarShouldBeCollapsed) {
            // 如果 DOM 已经可用，立即执行
            if (document.body) {
                applyCollapsedState();
            } else {
                // 否则等待 DOM 可用
                const observer = new MutationObserver(() => {
                    if (document.body) {
                        applyCollapsedState();
                        observer.disconnect();
                    }
                });
                observer.observe(document.documentElement, { childList: true });
            }
        }
    }
})();

document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.querySelector('.menu-toggle');
    const sidebar = document.getElementById('appSidebar') || document.querySelector('.sidebar');
    const body = document.body;

    // Mobile Overlay (if needed)
    let overlay = document.querySelector('.sidebar-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        overlay.style.cssText = "position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:150;display:none;backdrop-filter:blur(4px);";
        body.appendChild(overlay);
    }

    // 确保折叠状态已应用（仅桌面端，作为备用）
    if (sidebar && window.innerWidth > 768) {
        const savedState = localStorage.getItem('sidebar-collapsed');
        if (savedState === 'true' && !sidebar.classList.contains('collapsed')) {
            sidebar.classList.add('collapsed');
        }
    }

    if (toggle && sidebar) {
        toggle.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                // Mobile: toggle open/close
                sidebar.classList.toggle('open');
                overlay.style.display = sidebar.classList.contains('open') ? 'block' : 'none';
            } else {
                // Desktop: toggle collapse/expand
                sidebar.classList.toggle('collapsed');
                // 保存折叠状态
                localStorage.setItem('sidebar-collapsed', sidebar.classList.contains('collapsed'));
            }
        });

        overlay.addEventListener('click', () => {
            sidebar.classList.remove('open');
            overlay.style.display = 'none';
        });
    }

    // 页面切换时的平滑过渡
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            // 如果是外部链接，不处理
            if (item.target === '_blank' || (item.href.startsWith('http') && !item.href.includes(window.location.host))) {
                return;
            }
            
            // 确保折叠状态在页面切换时保持
            if (window.innerWidth > 768 && sidebar && sidebar.classList.contains('collapsed')) {
                // 在页面跳转前，确保状态已保存
                localStorage.setItem('sidebar-collapsed', 'true');
            }
            
            // 添加淡出效果
            body.classList.add('page-transitioning');
            
            // 如果浏览器支持，使用更快的导航
            // 否则让默认行为继续（页面会重新加载）
        });
    });

    // 页面加载完成时移除过渡类（如果存在）
    window.addEventListener('load', () => {
        body.classList.remove('page-transitioning');
    });

    // 为折叠状态下的菜单项添加tooltip功能
    let tooltipElement = null;
    let tooltipsInitialized = false;
    
    function initTooltips() {
        if (!sidebar || window.innerWidth <= 768) {
            // 清理tooltip
            if (tooltipElement) {
                tooltipElement.remove();
                tooltipElement = null;
            }
            tooltipsInitialized = false;
            return;
        }

        // 如果已经初始化过，跳过
        if (tooltipsInitialized) return;

        const navItems = document.querySelectorAll('.nav-item');
        
        // 创建共享的tooltip元素（只创建一次）
        if (!tooltipElement) {
            tooltipElement = document.createElement('div');
            tooltipElement.className = 'nav-tooltip';
            document.body.appendChild(tooltipElement);
        }

        navItems.forEach(item => {
            const tooltipText = item.getAttribute('data-tooltip');
            if (!tooltipText) return;

            // 检查是否已经绑定过事件（通过data属性）
            if (item.dataset.tooltipBound) return;
            item.dataset.tooltipBound = 'true';

            // 鼠标进入时显示tooltip
            item.addEventListener('mouseenter', function(e) {
                if (!sidebar.classList.contains('collapsed')) return;
                
                const rect = item.getBoundingClientRect();
                tooltipElement.textContent = tooltipText;
                tooltipElement.style.display = 'block';
                tooltipElement.style.left = (rect.right + 12) + 'px';
                tooltipElement.style.top = (rect.top + rect.height / 2) + 'px';
                setTimeout(() => tooltipElement.classList.add('show'), 10);
            });

            // 鼠标离开时隐藏tooltip
            item.addEventListener('mouseleave', function() {
                tooltipElement.classList.remove('show');
                setTimeout(() => {
                    if (!tooltipElement.classList.contains('show')) {
                        tooltipElement.style.display = 'none';
                    }
                }, 200);
            });
        });

        tooltipsInitialized = true;
    }

    // 初始化tooltip
    initTooltips();

    // 监听侧边栏折叠状态变化
    if (sidebar) {
        const observer = new MutationObserver(() => {
            // 当折叠状态改变时，重置初始化标记
            tooltipsInitialized = false;
            initTooltips();
        });
        observer.observe(sidebar, { attributes: true, attributeFilter: ['class'] });
    }
});
