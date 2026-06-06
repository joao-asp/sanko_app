var pts = { base: 0, infra: 0, docente: 0, acess: 0 };
var navAtt = 0;
var navAct = true;
var tInt = null;
var tLeft = 120;
var isRun = false;

const deck = [
    { n: 'Chico Toledo', r: 'Teologia Libertação', h: 'Unia as lideranças em Boa Vista.', s: 'Ignora erro no Quiz.' },
    { n: 'Seu Avelino', r: 'Obras Práticas', h: 'Recolhia cimento porta a porta.', s: 'Vence a rodada de Mutirão.' },
    { n: 'Lourival', r: 'Associações', h: 'Articulava as ligações da região.', s: 'Revela B3 na Batalha.' }
];

function setPhase(num, btn) {
    document.querySelectorAll('.btn-phase').forEach(button => button.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.story-phase').forEach(phase => phase.classList.remove('active'));
    document.getElementById('phase-' + num).classList.add('active');
    document.querySelectorAll('.game-interface').forEach(game => game.classList.remove('active'));
}

function openGame(type) {
    document.querySelectorAll('.game-interface').forEach(game => game.classList.remove('active'));
    document.getElementById('game-' + type).classList.add('active');
    if (type === 'naval') {
        navAtt = 0;
        navAct = true;
        document.getElementById('naval-info').innerHTML = 'Encontrem o ofício em 4 tentativas.';
        document.querySelectorAll('.naval-cell').forEach(cell => cell.classList.remove('hit', 'miss'));
        document.getElementById('btn-naval').classList.remove('visible');
    }
}

function addPoints(type, amount, gameId) {
    pts[type] += amount;
    const max = (type === 'acess') ? 500 : (type === 'base' ? 800 : (type === 'infra' ? 1200 : 1500));
    if (pts[type] > max) pts[type] = max;
    document.getElementById('txt-' + type).innerText = `${pts[type]} / ${max}`;
    document.getElementById('bar-' + type).style.width = `${(pts[type] / max) * 100}%`;
    document.getElementById(gameId).classList.remove('active');
    alert(`Sucesso! +${amount} pontos computados!`);
}

function checkQuiz() {
    const checked = document.querySelectorAll('.quiz-item input:checked').length;
    if (checked >= 3) document.getElementById('btn-quiz').classList.add('visible');
    else document.getElementById('btn-quiz').classList.remove('visible');
}

function playNav(cell, isHit) {
    if (!navAct || cell.classList.contains('hit') || cell.classList.contains('miss')) return;
    navAtt++;
    if (isHit) {
        cell.classList.add('hit');
        navAct = false;
        document.getElementById('naval-info').innerHTML = "<span style='color:#10b981'>Achou a mesa certa (B3)!</span>";
        document.getElementById('btn-naval').classList.add('visible');
    } else {
        cell.classList.add('miss');
        if (navAtt >= 4) {
            navAct = false;
            document.getElementById('naval-info').innerHTML = "<span style='color:#ef4444'>O documento sumiu para sempre.</span>";
        } else {
            document.getElementById('naval-info').innerText = `Gaveta errada! Restam ${4 - navAtt} tentativas.`;
        }
    }
}

function rollDice() {
    const dice = document.getElementById('dice-btn');
    if (dice.classList.contains('rolling')) return;
    dice.classList.add('rolling');
    dice.innerText = '⏳';
    setTimeout(() => {
        const res = Math.floor(Math.random() * 6) + 1;
        dice.innerText = res;
        dice.classList.remove('rolling');
        if (res <= 2) dice.style.color = '#ef4444';
        else if (res >= 5) dice.style.color = '#10b981';
        else dice.style.color = '#f59e0b';
    }, 500);
}

function toggleTimer() {
    const btn = document.getElementById('timer-btn');
    if (isRun) {
        clearInterval(tInt);
        isRun = false;
        btn.innerText = 'Iniciar';
    } else {
        isRun = true;
        btn.innerText = 'Pausar';
        tInt = setInterval(() => {
            if (tLeft > 0) {
                tLeft--;
                document.getElementById('timer-display').innerText = `${String(Math.floor(tLeft / 60)).padStart(2, '0')}:${String(tLeft % 60).padStart(2, '0')}`;
            } else {
                clearInterval(tInt);
                isRun = false;
                btn.innerText = 'Iniciar';
                alert('Tempo Esgotado!');
            }
        }, 1000);
    }
}

function resetTimer() {
    clearInterval(tInt);
    isRun = false;
    tLeft = 120;
    document.getElementById('timer-display').innerText = '02:00';
    document.getElementById('timer-btn').innerText = 'Iniciar';
}

function drawCard() {
    if (deck.length === 0) return alert('Todas as cartas queimadas!');
    const d = deck.splice(Math.floor(Math.random() * deck.length), 1)[0];
    document.getElementById('card-name').innerText = d.n;
    document.getElementById('card-role').innerText = d.r;
    document.getElementById('card-desc').innerText = d.h;
    document.getElementById('card-skill').innerText = '✨ ' + d.s;
    document.getElementById('deck-btn').style.display = 'none';
    document.getElementById('drawn-card').style.display = 'block';
}

function hideCard() {
    document.getElementById('drawn-card').style.display = 'none';
    document.getElementById('deck-btn').style.display = 'flex';
}
