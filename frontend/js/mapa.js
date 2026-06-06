var map;
var mapSlideIdx = 0;

const mapData = {
    rita: { title: 'E.E. Profa. Rita de Cássia', meta: 'Ensino Médio', desc: 'A escola foi inaugurada após forte mobilização em 1998 com abaixo-assinados na capital.', slides: ['Maquete Prédio', 'Abaixo-assinado 1998', 'Fachada Atual'] },
    fazendinha: { title: 'Escola Mun. Pq. Fazendinha', meta: 'Educação Básica', desc: 'O primeiro polo educacional da região que superlotou com o boom de 1991.', slides: ['Foto Aérea', 'Primeira Turma', 'Prédio Hoje'] },
    associacao: { title: 'Associações & Comunidades de Base', meta: 'União', desc: 'Liderada pelo Padre Rubio, unificou as pautas de infraestrutura e educação.', slides: ['Reunião 1991', 'Festa do Padroeiro', 'Lideranças Juntas'] }
};

function initMap() {
    if (map) return;

    map = L.map('real-map').setView([-22.892, -47.120], 14);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap & CartoDB'
    }).addTo(map);

    const createIcon = (letter, bgColor) => L.divIcon({
        className: 'custom-pin',
        html: `<div class="pin-icon" style="background:${bgColor};"><i>${letter}</i></div><div class="pin-pulse"></div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 36]
    });

    L.marker([-22.890, -47.122], { icon: createIcon('E', '#e11d48') }).addTo(map).on('click', () => openMapModal('rita'));
    L.marker([-22.880, -47.135], { icon: createIcon('M', '#0284c7') }).addTo(map).on('click', () => openMapModal('fazendinha'));
    L.marker([-22.885, -47.115], { icon: createIcon('A', '#16a34a') }).addTo(map).on('click', () => openMapModal('associacao'));
}

function openMapModal(key) {
    const data = mapData[key];
    if (!data) return;

    document.getElementById('modal-title').innerText = data.title;
    document.getElementById('modal-meta').innerText = data.meta;
    document.getElementById('modal-text').innerText = data.desc;
    document.getElementById('cap-1').innerText = '📷 ' + data.slides[0];
    document.getElementById('cap-2').innerText = '📷 ' + data.slides[1];
    document.getElementById('cap-3').innerText = '📷 ' + data.slides[2];
    mapSlideIdx = 0;
    document.getElementById('carousel-track').style.transform = 'translateX(0%)';
    document.getElementById('conquista-modal').style.display = 'flex';
}

function closeMapModal() {
    document.getElementById('conquista-modal').style.display = 'none';
}

function moveCarousel(dir) {
    mapSlideIdx = (mapSlideIdx + dir + 3) % 3;
    document.getElementById('carousel-track').style.transform = `translateX(-${mapSlideIdx * 33.333}%)`;
}

async function addUserConquista() {
    const titleInput = document.getElementById('form-title');
    const descInput = document.getElementById('form-desc');
    const submitBtn = document.querySelector('.btn-submit');
    const originalLabel = submitBtn.innerText;
    const titulo = titleInput.value.trim();
    const descricao = descInput.value.trim();

    if (!titulo) return alert('Preencha o título!');
    if (!descricao) return alert('Preencha o relato histórico!');

    submitBtn.disabled = true;
    submitBtn.innerText = 'Validando...';

    try {
        const response = await fetch('http://localhost:3000/api/validate-pin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ titulo, descricao })
        });

        const data = await response.json();

        if (response.ok && data.aprovado === true) {
            const center = map.getCenter();
            const iconU = L.divIcon({
                className: 'custom-pin',
                html: `<div class="pin-icon" style="background:#ea580c;"><i>U</i></div><div class="pin-pulse"></div>`,
                iconSize: [36, 36],
                iconAnchor: [18, 36]
            });

            L.marker([center.lat, center.lng], { icon: iconU })
                .addTo(map)
                .bindPopup(`<b>${titulo}</b><br>Contribuição do Usuário.`);

            titleInput.value = '';
            descInput.value = '';
            alert('Sua conquista foi validada e adicionada ao mapa!');
            return;
        }

        alert(`Rejeitado: ${data.motivo || 'A IA não especificou o motivo.'}`);
    } catch (error) {
        alert('Erro ao conectar com o validador.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = originalLabel;
    }
}
