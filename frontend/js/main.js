function switchTab(tabId, btn) {
    document.querySelectorAll('.page-view').forEach(view => view.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(button => button.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    btn.classList.add('active');

    if (tabId === 'mapa-comemorativo' && map) {
        setTimeout(() => map.invalidateSize(), 100);
    }
}

window.addEventListener('load', function () {
    initMap();
});
