let map;
function initMap() {
    if(map) return;
    map = L.map('real-map').setView([-22.892, -47.120], 14);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { attribution: '&copy; SANKO' }).addTo(map);
    const createIcon = (l, c) => L.divIcon({ className: 'custom-pin', html: `<div class="pin-icon" style="background:${c};"><i>${l}</i></div><div class="pin-pulse"></div>`, iconSize: [36,36], iconAnchor: [18,36] });
    L.marker([-22.890, -47.122], {icon: createIcon('E', 'var(--alerta-vermelho)')}).addTo(map);
}

function switchTab(tabId, btn) {
    document.querySelectorAll('.page-view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    btn.classList.add('active');
    if(tabId === 'mapa-comemorativo') { if(!map) initMap(); setTimeout(() => map.invalidateSize(), 100); }
}

// --- SISTEMA DE FASES E CONCLUSÃO DE RODADA ---
function setPhase(num, btn) {
    if (btn.disabled) return; 
    document.querySelectorAll('.btn-phase').forEach(b => b.classList.remove('active')); 
    btn.classList.add('active');
    document.querySelectorAll('.story-phase').forEach(p => p.classList.remove('active'));
    document.getElementById('phase-' + num).classList.add('active');
}

function concluirRodada(faseAtual) {
    currentFC += 300;
    document.getElementById('rpg-fc').innerText = currentFC;

    let currentBtn = document.getElementById('btn-concluir-' + faseAtual);
    if(currentBtn) currentBtn.style.display = 'none';

    alert(`✅ RODADA ${faseAtual} CONCLUÍDA!\nA comunidade superou esta etapa e ganhou +300 de Força Comunitária!`);

    let nextFase = faseAtual + 1;
    let nextPhaseBtn = document.getElementById('btn-fase-' + nextFase);
    if(nextPhaseBtn) {
        nextPhaseBtn.disabled = false;
        setPhase(nextFase, nextPhaseBtn); 
    }
}

// --- SISTEMA DE MINIGAMES ---
let currentFC = 1000;
let challengeTimerInterval = null;
let challengeTimeLeft = 120; 
let activeGameType = null;

let availableGames = ['quiz', 'naval', 'imagem-acao', 'memoria', 'mimica', 'telepatia'];

let bancoImagemAcao = [ "Revolta da Vacina", "João W. Nery", "Ailton Krenak", "Estação Cultura", "Dandara dos Palmares", "Maria da Penha", "Carlos Gomes", "Sônia Guajajara", "Teologia da Libertação" ];
let bancoMimica = [ "Erguendo a school debaixo de chuva", "Protesto parando ônibus em Campinas", "Padre no megafone durante a missa campal", "Assinando ofício burocrático com raiva" ];
let bancoTelepatia = [ "Resistência", "Escola", "Bairro", "Prefeitura", "Campinas", "Mutirão", "Educação" ];

bancoImagemAcao.sort(() => Math.random() - 0.5);
bancoMimica.sort(() => Math.random() - 0.5);
bancoTelepatia.sort(() => Math.random() - 0.5);

let masterMemoryPairs = [
    {id: 1, name: "Zumbi dos Palmares", desc: "Líder político e militar quilombola"},
    {id: 2, name: "Machado de Assis", desc: "Maior nome da literatura e fundador da ABL"},
    {id: 3, name: "Carolina Maria de Jesus", desc: "Escritora favelada autora de Quarto de Despejo"},
    {id: 4, name: "Dandara dos Palmares", desc: "Guerreira negra que lutou contra a escravidão"},
    {id: 5, name: "Luiz Gama", desc: "Advogado abolicionista"},
    {id: 6, name: "Antonieta de Barros", desc: "Primeira deputada negra do Brasil"},
    {id: 7, name: "João W. Nery", desc: "Pioneiro na luta pelos homens trans no Brasil"},
    {id: 8, name: "Ailton Krenak", desc: "Líder indígena, ambientalista e imortal da ABL"},
    {id: 9, name: "Madame Satã", desc: "Figura icônica da resistência LGBTQIAPN+"},
    {id: 10, name: "Carlos Gomes", desc: "Compositor operístico nascido em Campinas"},
    {id: 11, name: "Toninho do PT", desc: "Prefeito de Campinas assassinado"},
    {id: 12, name: "Cacique Raoni", desc: "Líder Kayapó global na defesa da Amazônia"},
    {id: 13, name: "Erika Hilton", desc: "Deputada federal trans brasileira"}
];

let navTargetObj = {c: 0, r: 0};
function buildNavalGrid() {
    const grid = document.getElementById('naval-grid-container');
    grid.innerHTML = '';
    const cols = ['A','B','C','D','E','F'];
    
    let tCol = Math.floor(Math.random() * 6);
    let tRow = Math.floor(Math.random() * 5) + 1; 
    navTargetObj = { c: tCol, r: tRow };

    for(let row = 1; row <= 5; row++) {
        for(let c = 0; c < cols.length; c++) {
            let cellName = cols[c] + row;
            let div = document.createElement('div');
            div.className = 'naval-cell';
            div.innerText = cellName;
            div.onclick = function() { playNav(this, c, row); };
            grid.appendChild(div);
        }
    }
}

function drawMinigameCard() {
    stopChallengeTimer();
    if(availableGames.length === 0) { 
        alert("⚠️ TODOS OS MINIGAMES JÁ FORAM JOGADOS NESTA SESSÃO! O baralho de desafios esgotou.");
        return;
    }
    const randomIndex = Math.floor(Math.random() * availableGames.length);
    const chosenGame = availableGames.splice(randomIndex, 1)[0];
    setupAndOpenGame(chosenGame);
}

function setupAndOpenGame(type) {
    activeGameType = type;
    document.querySelectorAll('.game-interface').forEach(g => g.classList.remove('active'));
    document.getElementById('game-' + type).classList.add('active');
    document.getElementById('minigame-modal-overlay').classList.add('active');
    toggleGameInputs(type, true);

    if(type === 'naval') {
        navAtt = 0; navAct = true;
        document.getElementById('naval-info').innerHTML="Ache o ofício em 10 tentativas. <br><span style='color:var(--alerta-vermelho);'>Vermelho = Frio.</span> <span style='color:#d97706;'>Amarelo = Tá Quente!</span>";
        buildNavalGrid();
        document.getElementById('btn-naval').classList.remove('visible');
    } else if (type === 'imagem-acao') {
        let p = bancoImagemAcao.pop() || "Revolta da Vacina";
        document.getElementById('ia-target').innerText = p;
    } else if (type === 'mimica') {
        let m = bancoMimica.pop() || "Assinando ofício burocrático com raiva";
        document.getElementById('mimica-target').innerText = m;
    } else if (type === 'telepatia') {
        let t = bancoTelepatia.pop() || "Trabalho Coletivo";
        document.getElementById('telepatia-target').innerText = t;
    } else if (type === 'memoria') {
        initMemoryGame();
    }

    startChallengeTimer();
}

function surrenderChallenge() {
    let msg = "Tem certeza que deseja desistir do desafio?\n\nIsso custará 300 de Força Comunitária e este minigame NÃO poderá ser jogado novamente!";
    let penalidade = 300;

    if (activeGameType === 'memoria' && matchedPairs >= 5) {
        msg = "Como vocês já acertaram 5 pares, a desistência agora NÃO custará pontos de Força Comunitária.\n\nDeseja realizar a retirada tática?";
        penalidade = 0;
    }

    if(confirm(msg)) {
        stopChallengeTimer();
        currentFC -= penalidade;
        if(currentFC < 0) currentFC = 0;
        document.getElementById('rpg-fc').innerText = currentFC;
        document.getElementById('minigame-modal-overlay').classList.remove('active');
        
        if (penalidade === 0) {
            alert("🏳️ Desistência Tática! Como acertaram 5 pares, vocês não perderam Força Comunitária.\n\nEste jogo foi descartado permanentemente.");
        } else {
            alert("🏳️ A equipe DESISTIU do desafio! Penalidade: -300 de Força Comunitária.\n\nEste jogo foi descartado permanentemente. Passe para o próximo minigame no botão de sorteio.");
        }
        if(currentFC <= 0) alert("💀 ATENÇÃO MESTRE: A Força Comunitária zerou!");
    }
}

function challengeTimeoutFail() {
    stopChallengeTimer();
    currentFC -= 300; if(currentFC < 0) currentFC = 0; document.getElementById('rpg-fc').innerText = currentFC;
    toggleGameInputs(activeGameType, false);
    document.getElementById('minigame-modal-overlay').classList.remove('active');
    
    alert("🚨 O TEMPO ESGOTOU! Vocês PERDERAM 300 de Força Comunitária!\n\nEste jogo foi perdido e descartado permanentemente. Passe para o próximo minigame no botão de sorteio.");
    if(currentFC <= 0) alert("💀 ATENÇÃO MESTRE: A Força Comunitária zerou!");
}

function startChallengeTimer() {
    challengeTimeLeft = 120;
    updateChallengeTimerDisplay();
    challengeTimerInterval = setInterval(() => {
        challengeTimeLeft--;
        updateChallengeTimerDisplay();
        if(challengeTimeLeft <= 0) challengeTimeoutFail();
    }, 1000);
}

function stopChallengeTimer() { clearInterval(challengeTimerInterval); }
function updateChallengeTimerDisplay() {
    let m = String(Math.floor(challengeTimeLeft / 60)).padStart(2, '0');
    let s = String(challengeTimeLeft % 60).padStart(2, '0');
    document.getElementById('central-timer-display').innerText = `${m}:${s}`;
}

function toggleGameInputs(type, enable) {
    if(type === 'quiz') { document.querySelectorAll('.quiz-item input').forEach(i => i.disabled = !enable); } 
    else if(type === 'naval') { navAct = enable; } 
}

let pts = { base: 0, infra: 0, docente: 0, acess: 0 };
function addPoints(type, amount, gameId) {
    stopChallengeTimer();
    pts[type] += amount;
    let max = (type === 'acess') ? 500 : (type === 'base' ? 800 : (type === 'infra' ? 1200 : 1500));
    if (pts[type] > max) pts[type] = max;
    document.getElementById('txt-' + type).innerText = `${pts[type]} / ${max}`;
    document.getElementById('bar-' + type).style.width = `${(pts[type]/max)*100}%`;
    document.getElementById('minigame-modal-overlay').classList.remove('active');
    alert(`CARTA SUPERADA: Desafio concluído a tempo! +${amount} pontos na demanda.`);
}

let memoryCards = [], flippedCards = [], matchedPairs = 0;
function initMemoryGame() {
    memoryCards = [];
    let shuffledMaster = [...masterMemoryPairs].sort(() => Math.random() - 0.5).slice(0, 10);
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
        cardEl.className = 'memory-card'; cardEl.dataset.id = card.id;
        cardEl.innerHTML = `<div class="memory-card-inner"><div class="memory-card-front">SANKO</div><div class="memory-card-back">${card.text}</div></div>`;
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
            
            if (matchedPairs >= 6) { 
                let btn = document.getElementById('btn-memoria');
                btn.classList.add('visible'); 
                btn.innerText = "VITÓRIA (" + matchedPairs + " PARES ACERTADOS) +300!";
            }
        } else { 
            setTimeout(() => { card1.classList.remove('flipped'); card2.classList.remove('flipped'); flippedCards = []; }, 1000); 
        }
    }
}

function checkQuiz() {
    let checked = document.querySelectorAll('.quiz-item input:checked').length;
    if(checked >= 3 && challengeTimeLeft > 0) document.getElementById('btn-quiz').classList.add('visible');
    else document.getElementById('btn-quiz').classList.remove('visible');
}

let navAtt = 0, navAct = true;

function playNav(cell, c, r) {
    if(!navAct || cell.classList.contains('hit') || cell.classList.contains('miss') || cell.classList.contains('close') || challengeTimeLeft <= 0) return;
    navAtt++;
    
    if(c === navTargetObj.c && r === navTargetObj.r) {
        cell.classList.add('hit'); navAct = false;
        document.getElementById('naval-info').innerHTML = "<span style='color:var(--cor-acerto-verde)'>GABARITO LOCALIZADO!</span>";
        document.getElementById('btn-naval').classList.add('visible');
    } else {
        let dist = Math.max(Math.abs(c - navTargetObj.c), Math.abs(r - navTargetObj.r));
        
        if (dist === 1) {
            cell.classList.add('close');
            document.getElementById('naval-info').innerHTML = `Aviso: <span style='color:#d97706;'>TÁ QUENTE! (Adjacente)</span> Restam ${10 - navAtt} tentativas.`;
        } else {
            cell.classList.add('miss');
            document.getElementById('naval-info').innerHTML = `Aviso: <span style='color:var(--alerta-vermelho);'>FRIO! (Longe)</span> Restam ${10 - navAtt} tentativas.`;
        }

        if(navAtt >= 10) { 
            navAct = false; stopChallengeTimer();
            document.getElementById('naval-info').innerHTML = "<span style='color:var(--alerta-vermelho)'>O OFÍCIO FOI DESTRUÍDO.</span>"; 
            currentFC -= 300; if(currentFC < 0) currentFC = 0; document.getElementById('rpg-fc').innerText = currentFC;
            document.getElementById('minigame-modal-overlay').classList.remove('active');
            alert("Gavetas trancadas e o tempo estourou! Erros custaram 300 de Força Comunitária.\n\nEste jogo foi perdido e descartado permanentemente.");
        }
    }
}

function rollDice() {
    const d = document.getElementById('dice-btn');
    if(d.classList.contains('rolling')) return;
    d.classList.add('rolling'); d.innerText = "?";
    setTimeout(() => {
        const res = Math.floor(Math.random() * 6) + 1;
        d.innerText = res; d.classList.remove('rolling');
        if(res <= 2) {d.style.background = "var(--alerta-vermelho)"; d.style.color = "white";} 
        else if(res >= 5) {d.style.background = "var(--tinta-preta)"; d.style.color = "var(--destaque-amarelo)";} 
        else {d.style.background = "var(--destaque-amarelo)"; d.style.color = "var(--tinta-preta)";}
    }, 500);
}

let tInt = null, tLeft = 120, isRun = false;
function toggleTimer() {
    const btn = document.getElementById('timer-btn');
    if(isRun) { clearInterval(tInt); isRun = false; btn.innerText = "INICIAR"; }
    else {
        isRun = true; btn.innerText = "PAUSAR";
        tInt = setInterval(() => {
            if(tLeft > 0) { tLeft--; document.getElementById('timer-display').innerText = `${String(Math.floor(tLeft/60)).padStart(2,'0')}:${String(tLeft%60).padStart(2,'0')}`; } 
            else { clearInterval(tInt); isRun = false; btn.innerText = "INICIAR"; alert("O PRAZO DO DEBATE ACABOU!"); }
        }, 1000);
    }
}
function resetTimer() { clearInterval(tInt); isRun = false; tLeft = 120; document.getElementById('timer-display').innerText = "02:00"; document.getElementById('timer-btn').innerText = "INICIAR"; }

const deck = [
    { n: "Chico Toledo", r: "Igreja / Base", h: "Motor da Teologia da Libertação.", s: "Use para ignorar erro no Quiz." },
    { n: "Seu Avelino", r: "Obras Práticas", h: "Ergueu as salas de aula na marra.", s: "Vence a rodada de Mutirão físico." },
    { n: "Lourival", r: "Política", h: "Unificava as associações de bairro.", s: "Acha a gaveta na Batalha Naval." }
];
function drawCard() {
    if(deck.length === 0) return alert("TODAS AS MEMÓRIAS FORAM RESGATADAS!");
    const d = deck.splice(Math.floor(Math.random() * deck.length), 1)[0];
    document.getElementById('card-name').innerText = d.n; document.getElementById('card-role').innerText = d.r;
    document.getElementById('card-desc').innerText = d.h; document.getElementById('card-skill').innerText = "VANTAGEM: " + d.s;
    document.getElementById('carimbo-queimado').style.display = 'none';
    document.getElementById('deck-btn').style.display = 'none'; document.getElementById('drawn-card').style.display = 'block';
}
function burnCard() { 
    document.getElementById('carimbo-queimado').style.display = 'block';
    setTimeout(() => { document.getElementById('drawn-card').style.display = 'none'; document.getElementById('deck-btn').style.display = 'flex'; }, 800);
}