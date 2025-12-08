document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    const body = document.body;

    // Mobile Overlay (if needed)
    let overlay = document.querySelector('.sidebar-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        overlay.style.cssText = "position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:150;display:none;backdrop-filter:blur(4px);";
        body.appendChild(overlay);
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
                // Optional: Save preference
                // localStorage.setItem('sidebar-collapsed', sidebar.classList.contains('collapsed'));
            }
        });

        overlay.addEventListener('click', () => {
            sidebar.classList.remove('open');
            overlay.style.display = 'none';
        });
    }
});
