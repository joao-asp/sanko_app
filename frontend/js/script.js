let map;

// --- SISTEMA DO MAPA E SALVAMENTO LOCAL ---
function initMap() {
    if(map) return;
    
    map = L.map('real-map').setView([-22.892, -47.120], 14);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { attribution: '&copy; SANKO' }).addTo(map);
    
    const createIcon = (l, c, textCol = 'white') => L.divIcon({ 
        className: 'custom-pin', 
        html: `<div class="pin-icon" style="background:${c}; border: 3px solid var(--tinta-preta);"><i style="color:${textCol}">${l}</i></div><div class="pin-pulse"></div>`, 
        iconSize: [36,36], 
        iconAnchor: [18,36],
        popupAnchor: [0, -40]
    });
    
    const markerEscola = L.marker([-22.890, -47.122], {icon: createIcon('E', 'var(--alerta-vermelho)')}).addTo(map);
    const popupContent = `
        <div class="map-popup-neo">
            <h4>Escola Rita de Cássia</h4>
            <p>Erguida pelas mãos da comunidade. O marco zero da nossa resistência contra o esquecimento.</p>
            <button class="neo-btn btn-black w-100 mt-10" style="padding: 10px; font-size: 14px;" onclick="iniciarJogoPeloMapa()">JOGAR ESTA HISTÓRIA</button>
        </div>
    `;
    markerEscola.bindPopup(popupContent);

    carregarMemoriasSalvas();
}

function addUserConquista() {
    const title = document.getElementById('form-title').value.trim();
    const desc = document.getElementById('form-desc').value.trim();

    if(!title || !desc) {
        showToast("Preencha o título e a história!", "error");
        return;
    }

    const center = map.getCenter();
    const lat = center.lat + (Math.random() - 0.5) * 0.008;
    const lng = center.lng + (Math.random() - 0.5) * 0.008;

    const novaMemoria = { id: Date.now(), title, desc, lat, lng };

    let salvas = JSON.parse(localStorage.getItem('sanko_memorias')) || [];
    salvas.push(novaMemoria);
    localStorage.setItem('sanko_memorias', JSON.stringify(salvas));

    adicionarPinDeMemoria(novaMemoria);

    document.getElementById('form-title').value = '';
    document.getElementById('form-desc').value = '';
    showToast("Memória cravada no mapa!", "success");
}

function carregarMemoriasSalvas() {
    let salvas = JSON.parse(localStorage.getItem('sanko_memorias')) || [];
    salvas.forEach(memoria => adicionarPinDeMemoria(memoria));
}

function adicionarPinDeMemoria(memoria) {
    const createIconMemoria = () => L.divIcon({ 
        className: 'custom-pin', 
        html: `<div class="pin-icon" style="background:var(--destaque-amarelo); border: 3px solid var(--tinta-preta);"><i style="color:var(--tinta-preta);">!</i></div><div class="pin-pulse" style="background: rgba(255,213,0,0.5);"></div>`, 
        iconSize: [36,36], 
        iconAnchor: [18,36]
    });

    const marker = L.marker([memoria.lat, memoria.lng], {icon: createIconMemoria()}).addTo(map);

    marker.on('click', () => {
        abrirModalMemoria(memoria.title, memoria.desc);
    });
}

// --- CONTROLE DO MODAL DE MEMÓRIAS (CARROSSEL) ---
function abrirModalMemoria(titulo, desc) {
    document.getElementById('modal-title').innerText = titulo;
    document.getElementById('modal-text').innerText = desc;
    document.getElementById('modal-meta').innerText = "Relato da Comunidade";
    document.getElementById('conquista-modal').classList.add('active');
}

function closeMapModal() {
    document.getElementById('conquista-modal').classList.remove('active');
}

let currentSlide = 0;
function moveCarousel(direction) {
    const track = document.getElementById('carousel-track');
    const slides = document.querySelectorAll('.carousel-slide');
    if(!track || slides.length === 0) return;
    
    currentSlide += direction;
    if(currentSlide < 0) currentSlide = slides.length - 1;
    if(currentSlide >= slides.length) currentSlide = 0;
    
    track.style.transform = `translateX(-${currentSlide * 33.333}%)`;
}

function iniciarJogoPeloMapa() {
    map.closePopup();
    const btnMestre = document.querySelector('.nav-tabs .tab-btn');
    if(btnMestre) {
        btnMestre.click();
    } else {
        switchTab('modo-jogo');
    }
    showToast("Campanha Carregada: Escola Rita de Cássia", "success");
}

function switchTab(tabId, btn) {
    document.querySelectorAll('.page-view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    if(btn) btn.classList.add('active');
    if(tabId === 'mapa-comemorativo') { if(!map) initMap(); setTimeout(() => map.invalidateSize(), 100); }
}

function toggleMenu() { document.getElementById('mobileMenu').classList.toggle('active'); document.getElementById('menuOverlay').classList.toggle('active'); }
function closeMenu() { document.getElementById('mobileMenu').classList.remove('active'); document.getElementById('menuOverlay').classList.remove('active'); }
function switchTabAndClose(tabId, btn) { switchTab(tabId, btn); closeMenu(); }

function showToast(msg, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.innerText = msg;
    container.appendChild(toast);
    setTimeout(() => { if(toast.parentNode) toast.parentNode.removeChild(toast); }, 4000);
}

function showNotification(message, duration = 4000) {
    const notification = document.getElementById('game-notification');
    const content = document.getElementById('game-notification-content');
    content.innerHTML = message;
    notification.classList.add('show');
    setTimeout(() => {
        notification.classList.remove('show');
    }, duration);
}

let storedFase = localStorage.getItem('sanko_fase_max');
let faseMaxConcluida = storedFase !== null ? parseInt(storedFase) : -1;
let currentFC = parseInt(localStorage.getItem('sanko_fc')) || 0;
let faseAtual = 0;

function adjustFC(amount) {
    currentFC += amount;
    if(currentFC < 0) currentFC = 0;
    localStorage.setItem('sanko_fc', currentFC);
    
    const fcDisplay = document.getElementById('rpg-fc-display');
    if(fcDisplay) fcDisplay.innerText = currentFC;
    
    if(amount > 0) showToast(`+${amount} Força Comunitária!`, 'success');
    else showToast(`${amount} Força Comunitária!`, 'error');
}

function atualizarBarraProgresso(faseAtualizada) {
    const totalFases = 6;
    const porcentagem = (faseAtualizada / totalFases) * 100;

    const fill = document.getElementById("progress-fill");
    if(fill) fill.style.width = porcentagem + "%";

    const label = document.getElementById("current-phase-label");
    if(label) label.innerText = `Fase ${faseAtualizada} de ${totalFases}`;

    const percent = document.getElementById("progress-percent");
    if(percent) percent.innerText = `${Math.round(porcentagem)}%`;
}

function atualizarBotoesNavegacao() {
    const btnPrev = document.getElementById('btn-prev-phase');
    const btnNext = document.getElementById('btn-next-phase');

    if (!btnPrev || !btnNext) return;

    btnPrev.disabled = (faseAtual <= 0);

    let ultimaFaseAlcancada;
    if (faseMaxConcluida === -1) {
        ultimaFaseAlcancada = 0;
    } else {
        ultimaFaseAlcancada = Math.min(faseMaxConcluida + 1, 6);
    }

    btnNext.disabled = (faseAtual >= ultimaFaseAlcancada);
}

function voltarFase() {
    if (faseAtual > 0) {
        setPhase(faseAtual - 1);
    }
}

function avancarFase() {
    let ultimaFaseAlcancada;
    if (faseMaxConcluida === -1) {
        ultimaFaseAlcancada = 0;
    } else {
        ultimaFaseAlcancada = Math.min(faseMaxConcluida + 1, 6);
    }

    if (faseAtual < ultimaFaseAlcancada) {
        setPhase(faseAtual + 1);
    }
}

function setPhase(num, btn) {
    if (btn && btn.disabled) return; 
    
    faseAtual = num;

    document.querySelectorAll('.neo-tab').forEach(b => b.classList.remove('active')); 
    if(btn) btn.classList.add('active');
    else {
        let fallbackBtn = document.getElementById('btn-fase-' + num);
        if(fallbackBtn) fallbackBtn.classList.add('active');
    }
    
    document.querySelectorAll('.story-phase').forEach(p => p.classList.remove('active'));
    let phaseDiv = document.getElementById('phase-' + num);
    if(phaseDiv) phaseDiv.classList.add('active');

    atualizarBarraProgresso(num);
    atualizarBotoesNavegacao();
}

function concluirRodada(faseAtualDaRodada, pontos = 300) {
    if(pontos > 0) adjustFC(pontos);
    
    let nextFase = faseAtualDaRodada + 1;
    if (faseAtualDaRodada > faseMaxConcluida) {
        faseMaxConcluida = faseAtualDaRodada;
        localStorage.setItem('sanko_fase_max', faseMaxConcluida);
    }
    
    let nextPhaseBtn = document.getElementById('btn-fase-' + nextFase);
    if(nextPhaseBtn) nextPhaseBtn.disabled = false;

    if(faseAtualDaRodada > 0) {
        showNotification(`✅ RODADA ${faseAtualDaRodada} CONCLUÍDA!<br>A comunidade superou esta etapa e ganhou +${pontos} de Força Comunitária!`);
    } else {
        showNotification(`✅ CAMPANHA INICIADA!<br>Vamos construir a história juntos.`);
    }
    
    if (nextFase <= 6) {
        setPhase(nextFase);
    }
    atualizarBotoesNavegacao();
}

function syncTimers(source) {
    if(source === 'main') {
        const m = document.getElementById('timer-min').value;
        const s = document.getElementById('timer-sec').value;
        if(document.getElementById('modal-timer-min')) document.getElementById('modal-timer-min').value = m;
        if(document.getElementById('modal-timer-sec')) document.getElementById('modal-timer-sec').value = s;
    } else {
        const m = document.getElementById('modal-timer-min').value;
        const s = document.getElementById('modal-timer-sec').value;
        if(document.getElementById('timer-min')) document.getElementById('timer-min').value = m;
        if(document.getElementById('timer-sec')) document.getElementById('timer-sec').value = s;
    }
}

let tInt = null, isRun = false, totalSecs = 0;

function toggleTimer() {
    const btnMain = document.getElementById('timer-btn');
    const btnModal = document.getElementById('modal-timer-btn');
    const containerInputs = document.getElementById('timer-inputs-container');
    const containerInputsModal = document.getElementById('modal-timer-inputs-container');
    const displayMain = document.getElementById('master-timer-display');
    const displayModal = document.getElementById('modal-timer-display');

    if(isRun) { 
        clearInterval(tInt); 
        isRun = false; 
        btnMain.innerText = "RETOMAR"; 
        if(btnModal) btnModal.innerText = "RETOMAR";
        
        containerInputs.style.display = 'flex';
        if(containerInputsModal) containerInputsModal.style.display = 'flex';
        displayMain.style.display = 'none';
        if(displayModal) displayModal.style.display = 'none';
        
        let mStr = String(Math.floor(totalSecs / 60)).padStart(2, '0');
        let sStr = String(totalSecs % 60).padStart(2, '0');
        
        document.getElementById('timer-min').value = mStr;
        document.getElementById('timer-sec').value = sStr;
        if(document.getElementById('modal-timer-min')) document.getElementById('modal-timer-min').value = mStr;
        if(document.getElementById('modal-timer-sec')) document.getElementById('modal-timer-sec').value = sStr;
    } else {
        totalSecs = (parseInt(document.getElementById('timer-min').value) || 0) * 60 + (parseInt(document.getElementById('timer-sec').value) || 0);
        if(totalSecs <= 0) { showToast("Defina um tempo maior que zero.", "error"); return; }
        
        isRun = true; 
        btnMain.innerText = "PAUSAR";
        if(btnModal) btnModal.innerText = "PAUSAR";
        
        containerInputs.style.display = 'none';
        if(containerInputsModal) containerInputsModal.style.display = 'none';
        displayMain.style.display = 'block';
        if(displayModal) displayModal.style.display = 'block';
        
        updateTimerDisplay();
        tInt = setInterval(() => {
            if(totalSecs > 0) { 
                totalSecs--; 
                updateTimerDisplay(); 
            } else { 
                clearInterval(tInt); 
                isRun = false; 
                btnMain.innerText = "INICIAR"; 
                if(btnModal) btnModal.innerText = "INICIAR";
                showToast("O TEMPO ACABOU!", "error"); 
            }
        }, 1000);
    }
}

function resetTimer() { 
    clearInterval(tInt); 
    isRun = false; 
    document.getElementById('timer-btn').innerText = "INICIAR"; 
    if(document.getElementById('modal-timer-btn')) document.getElementById('modal-timer-btn').innerText = "INICIAR";
    
    document.getElementById('timer-inputs-container').style.display = 'flex';
    if(document.getElementById('modal-timer-inputs-container')) document.getElementById('modal-timer-inputs-container').style.display = 'flex';
    document.getElementById('master-timer-display').style.display = 'none';
    if(document.getElementById('modal-timer-display')) document.getElementById('modal-timer-display').style.display = 'none';
    
    document.getElementById('timer-min').value = "02";
    document.getElementById('timer-sec').value = "00";
    if(document.getElementById('modal-timer-min')) document.getElementById('modal-timer-min').value = "02";
    if(document.getElementById('modal-timer-sec')) document.getElementById('modal-timer-sec').value = "00";
    
    document.getElementById('master-timer-display').innerText = "02:00";
    if(document.getElementById('modal-timer-display')) document.getElementById('modal-timer-display').innerText = "02:00";
}

function updateTimerDisplay() {
    let m = String(Math.floor(totalSecs / 60)).padStart(2, '0');
    let s = String(totalSecs % 60).padStart(2, '0');
    let timeStr = `${m}:${s}`;
    
    document.getElementById('master-timer-display').innerText = timeStr;
    if(document.getElementById('modal-timer-display')) document.getElementById('modal-timer-display').innerText = timeStr;
}

let activeGameType = null;
let availableGames = ['quiz', 'naval', 'quem-sou-eu', 'codigo', 'memoria'];

let bancoQuemSouEu = [ "Padre da Teologia da Libertação", "Prefeito de Campinas", "Carolina Maria de Jesus", "Ailton Krenak", "Diretora da Escola" ];
let bancoCodigos = [ "MUTIRAO", "OFICIO", "RESISTENCIA", "ASSOCIACOES", "EDUCACAO" ];
bancoQuemSouEu.sort(() => Math.random() - 0.5);
bancoCodigos.sort(() => Math.random() - 0.5);

function drawMinigameCard() {
    if(availableGames.length === 0) { 
        showToast("⚠️ TODOS OS MINIGAMES JÁ FORAM JOGADOS NESTA SESSÃO!", "error");
        return;
    }
    const randomIndex = Math.floor(Math.random() * availableGames.length);
    const chosenGame = availableGames.splice(randomIndex, 1)[0];
    setupAndOpenGame(chosenGame);
}

function setupAndOpenGame(type) {
    activeGameType = type;
    document.querySelectorAll('.game-interface').forEach(g => g.classList.remove('active'));
    
    const gameEl = document.getElementById('game-' + type);
    if(gameEl) gameEl.classList.add('active');
    
    document.getElementById('minigame-modal-overlay').classList.add('active');

    if(type === 'naval') {
        buildNavalGrid();
    } else if (type === 'quem-sou-eu') {
        document.getElementById('qse-target').innerText = bancoQuemSouEu.pop() || "Trabalhador Voluntário";
    } else if (type === 'codigo') {
        document.getElementById('codigo-resposta').innerText = bancoCodigos.pop() || "FAZENDINHA";
    } else if (type === 'memoria') {
        document.getElementById('memoria-escolha').style.display = 'flex';
        document.getElementById('memoria-arena').style.display = 'none';
        document.getElementById('memoria-fisico-arena').style.display = 'none';
    }
}

function iniciarMemoria(modo) {
    document.getElementById('memoria-escolha').style.display = 'none';
    if (modo === 'digital') {
        document.getElementById('memoria-arena').style.display = 'block';
        initMemoryGame();
    } else {
        document.getElementById('memoria-fisico-arena').style.display = 'block';
    }
}

function cancelarMinigame() {
    activeGameType = null;
    document.getElementById('minigame-modal-overlay').classList.remove('active');
    resetTimer();
}

function surrenderChallenge() {
    adjustFC(-50);
    cancelarMinigame();
}

function addPoints(amount) {
    adjustFC(amount);
    cancelarMinigame();
}

let navTargetObj = {c: 0, r: 0};
function buildNavalGrid() {
    const grid = document.getElementById('naval-grid-container');
    grid.innerHTML = '';
    const cols = ['A','B','C','D','E','F'];
    navTargetObj = { c: Math.floor(Math.random() * 6), r: Math.floor(Math.random() * 5) + 1 };

    for(let row = 1; row <= 5; row++) {
        for(let c = 0; c < cols.length; c++) {
            let div = document.createElement('div');
            div.className = 'naval-cell neo-btn btn-white';
            div.innerText = cols[c] + row;
            div.onclick = function() { 
                if(c === navTargetObj.c && row === navTargetObj.r) {
                    this.classList.add('hit');
                    this.style.background = 'var(--cor-acerto-verde)';
                    this.style.color = 'white';
                    showToast("Encontraram o ofício!", "success");
                    document.getElementById('btn-naval').classList.add('visible');
                } else {
                    this.classList.add('miss');
                    this.style.background = 'var(--alerta-vermelho)';
                    this.style.color = 'white';
                }
            };
            grid.appendChild(div);
        }
    }
    document.getElementById('btn-naval').classList.remove('visible');
}

let masterMemoryPairs = [
    {id: 1, name: "Zumbi dos Palmares", desc: "Líder quilombola"},
    {id: 2, name: "Dandara", desc: "Guerreira negra"},
    {id: 3, name: "Carolina Maria", desc: "Escritora favelada"},
    {id: 4, name: "Ailton Krenak", desc: "Líder indígena"}
];
let memoryCards = [], flippedCards = [], matchedPairs = 0;

function initMemoryGame() {
    memoryCards = [];
    let shuffledMaster = [...masterMemoryPairs].sort(() => Math.random() - 0.5);
    shuffledMaster.forEach(p => {
        memoryCards.push({ id: p.id, text: p.name });
        memoryCards.push({ id: p.id, text: p.desc });
    });
    memoryCards.sort(() => Math.random() - 0.5);
    const grid = document.getElementById('memory-grid');
    grid.innerHTML = '';
    matchedPairs = 0; flippedCards = [];
    document.getElementById('btn-memoria').classList.remove('visible');
    
    memoryCards.forEach((card) => {
        const cardEl = document.createElement('div');
        cardEl.className = 'memory-card neo-card'; cardEl.dataset.id = card.id;
        cardEl.innerHTML = `<div class="memory-card-inner"><div class="memory-card-front bg-black text-yellow">SANKO</div><div class="memory-card-back bg-white">${card.text}</div></div>`;
        cardEl.onclick = () => flipMemoryCard(cardEl);
        grid.appendChild(cardEl);
    });
}

function flipMemoryCard(cardEl) {
    if (flippedCards.length >= 2 || cardEl.classList.contains('flipped') || cardEl.classList.contains('matched')) return;
    cardEl.classList.add('flipped'); flippedCards.push(cardEl);
    
    if (flippedCards.length === 2) {
        const [card1, card2] = flippedCards;
        if (card1.dataset.id === card2.dataset.id) {
            card1.classList.add('matched'); card2.classList.add('matched'); 
            matchedPairs++; 
            flippedCards = [];
            if(matchedPairs === masterMemoryPairs.length) {
                document.getElementById('btn-memoria').classList.add('visible');
            }
        } else { 
            setTimeout(() => { 
                card1.classList.remove('flipped'); 
                card2.classList.remove('flipped'); 
                flippedCards = []; 
            }, 3000); 
        }
    }
}

async function carregarFases() {
    try {
        const resposta = await fetch('fases.json');
        const fases = await resposta.json();
        const container = document.getElementById('fases-container');
        
        container.innerHTML = ''; 
        
        fases.forEach((fase, index) => {
            const div = document.createElement('div');
            div.id = `phase-${fase.id}`;
            div.className = `story-phase neo-card p-20 mt-15 ${index === 0 ? 'active' : ''}`;
            
            div.innerHTML = `
                <div class="phase-year">${fase.ano}</div>
                <div class="phase-title">${fase.titulo}</div>
                <div class="gm-speech">📢 <i>${fase.narrativa}</i></div>
                <button id="btn-concluir-${fase.id}" class="neo-btn btn-yellow w-100 mt-20" style="padding: 18px; font-size: 24px;" onclick="${fase.botao_acao}">${fase.botao_texto}</button>
            `;
            container.appendChild(div);
        });
        
        const initialFcDisplay = document.getElementById('rpg-fc-display');
        if(initialFcDisplay) initialFcDisplay.innerText = currentFC;

        for (let i = 1; i <= 6; i++) {
            let btn = document.getElementById('btn-fase-' + i);
            if (btn) {
                if (i <= faseMaxConcluida + 1) btn.disabled = false;
                else btn.disabled = true;
            }
        }
        
        let faseAtiva = Math.max(0, Math.min(faseMaxConcluida + 1, 6));
        setPhase(faseAtiva);

    } catch (erro) {
        console.error("Erro ao carregar fases.json.", erro);
    }
}
carregarFases();