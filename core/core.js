document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.querySelector('.menu-toggle'); const sidebar = document.querySelector('.sidebar');
    if(toggle) {
        const overlay = document.createElement('div'); overlay.style.cssText="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:90;display:none;backdrop-filter:blur(4px);"; document.body.appendChild(overlay);
        const action = () => { sidebar.classList.toggle('open'); overlay.style.display = sidebar.classList.contains('open')?'block':'none'; };
        toggle.addEventListener('click', action); overlay.addEventListener('click', action);
    }
});
