const socket = io();
const canvas = document.getElementById('gridCanvas');
const ctx = canvas.getContext('2d');

let grid = [];
let gridSize = 20;
let TILE_SIZE = 1;
let myId = null;

let role = 'Spectator';
let thieves = {}; 
let policePlayers = {};

// UI Elements
const roleDisplay = document.getElementById('role-display');
const instructions = document.getElementById('instructions');
const gameOverScreen = document.getElementById('game-over');

const loginModal = document.getElementById('login-modal');
const usernameInput = document.getElementById('username-input');
const btnLogin = document.getElementById('btn-login');
const loginError = document.getElementById('login-error');

const roleSelectionOverlay = document.getElementById('role-selection');
const roleError = document.getElementById('role-error');

// -- LOGIN --
btnLogin.addEventListener('click', () => {
    const val = usernameInput.value.trim();
    if (val.length < 2) {
        loginError.innerText = "Name must be at least 2 chars!";
        return;
    }
    socket.emit('login', { username: val });
});

socket.on('login_success', () => {
    loginModal.classList.add('hidden');
    roleSelectionOverlay.classList.remove('hidden');
});

// -- ROLE SELECTION --
document.getElementById('btn-thief').addEventListener('click', () => {
    socket.emit('request_role', { role: 'Thief' });
});

document.getElementById('btn-chief').addEventListener('click', () => {
    socket.emit('request_role', { role: 'Police Chief' });
});

socket.on('role_granted', (data) => {
    role = data.role;
    roleSelectionOverlay.classList.add('hidden');
    roleDisplay.innerText = `You are playing as: ${role}`;
    
    if (role === 'Thief') {
        roleDisplay.className = 'role thief';
        instructions.innerText = "Use W, A, S, D to evade the Police Fleet! You are the Bright Red runner.";
    } else if (role === 'Police Chief') {
        roleDisplay.className = 'role chief';
        instructions.innerText = "Click on a Thief grid slot to target them. NOTE: If someone else is closer, you'll be blocked!";
    }
});

socket.on('role_denied', (data) => {
    roleError.innerText = data.message;
});


// -- GAMEPLAY EVENTS --
socket.on('init_game', (data) => {
    grid = data.grid;
    gridSize = data.gridSize;
    myId = data.id;
    TILE_SIZE = canvas.width / gridSize;
    draw();
});

socket.on('state_update', (data) => {
    thieves = data.thieves || {};
    policePlayers = data.policePlayers || {};
    draw();
});

socket.on('dispatch_warning', (data) => {
    let el = document.getElementById('game-wrapper');
    el.style.boxShadow = "inset 0 0 100px rgba(255,165,0,0.8)"; // Orange warning
    instructions.innerText = data.message;
    instructions.style.color = "#ff5555";
    setTimeout(() => {
        el.style.boxShadow = "0 0 20px rgba(0, 240, 255, 0.2)";
        instructions.style.color = "#4e829e";
        instructions.innerText = "Click on a Thief grid slot to target them. NOTE: If someone else is closer, you'll be blocked!";
    }, 2500);
});

socket.on('busted', (data) => {
    let el = document.getElementById('game-wrapper');
    el.style.boxShadow = "inset 0 0 150px rgba(255,0,0,0.8)"; // Red busted
    setTimeout(() => {
        el.style.boxShadow = "0 0 20px rgba(0, 240, 255, 0.2)";
    }, 500);
});


// -- INPUTS --
window.addEventListener('keydown', (e) => {
    if (role !== 'Thief') return;
    if (!thieves[myId]) return;

    let nx = thieves[myId].x;
    let ny = thieves[myId].y;

    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') ny--;
    if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') ny++;
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') nx--;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') nx++;

    if (nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize) {
        if (grid[ny][nx] === 0) {
            socket.emit('thief_move', { x: nx, y: ny });
        }
    }
});

canvas.addEventListener('click', (e) => {
    if (role !== 'Police Chief') return;
    if (!policePlayers[myId]) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const gridX = Math.floor(clickX / TILE_SIZE);
    const gridY = Math.floor(clickY / TILE_SIZE);

    if (grid[gridY] && grid[gridY][gridX] === 0) {
       socket.emit('police_target', { x: gridX, y: gridY });
    }
});


// -- DRAW LOOP --
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (grid.length === 0) return;

    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            if (grid[y][x] === 1) {
                ctx.fillStyle = '#21262d'; 
                ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                ctx.strokeStyle = '#30363d';
                ctx.lineWidth = 2;
                ctx.strokeRect(x * TILE_SIZE + 1, y * TILE_SIZE + 1, TILE_SIZE - 2, TILE_SIZE - 2);
            } else {
                ctx.fillStyle = '#0d1117'; 
                ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                ctx.strokeStyle = 'rgba(255,255,255,0.05)'; 
                ctx.lineWidth = 1;
                ctx.strokeRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            }
        }
    }

    // Paths
    ctx.fillStyle = 'rgba(0, 102, 255, 0.4)';
    Object.values(policePlayers).forEach(cop => {
        if (cop.currentPath && cop.currentPath.length > 0) {
            cop.currentPath.forEach(p => {
                 ctx.fillRect(p.x * TILE_SIZE, p.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                 ctx.strokeStyle = 'rgba(0, 210, 255, 0.8)';
                 ctx.strokeRect(p.x * TILE_SIZE, p.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            });
        }
    });

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Thieves
    Object.keys(thieves).forEach(tId => {
        let t = thieves[tId];
        
        ctx.font = '22px Arial';
        if (tId === myId) {
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#ff2a2a';
            ctx.fillText('🏃', t.x * TILE_SIZE + TILE_SIZE/2, t.y * TILE_SIZE + TILE_SIZE/2);
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#ff2a2a';
            ctx.fillRect(t.x * TILE_SIZE + TILE_SIZE/2 - 2, t.y * TILE_SIZE, 4, -8);
        } else {
            ctx.fillText('🏃', t.x * TILE_SIZE + TILE_SIZE/2, t.y * TILE_SIZE + TILE_SIZE/2);
        }

        // Draw Username
        ctx.font = '10px Share Tech Mono';
        ctx.fillStyle = '#ff5555';
        ctx.fillText(t.username, t.x * TILE_SIZE + TILE_SIZE/2, t.y * TILE_SIZE - 5);
    });

    // Police
    Object.keys(policePlayers).forEach(pId => {
        let cop = policePlayers[pId];

        ctx.font = '22px Arial';
        if (cop.currentPath && cop.currentPath.length > 0) {
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#00d2ff';
            ctx.fillText('🚓', cop.x * TILE_SIZE + TILE_SIZE/2, cop.y * TILE_SIZE + TILE_SIZE/2);
            ctx.shadowBlur = 0;
        } else {
            ctx.fillText('🚓', cop.x * TILE_SIZE + TILE_SIZE/2, cop.y * TILE_SIZE + TILE_SIZE/2);
        }

        // Draw Username
        ctx.font = '10px Share Tech Mono';
        ctx.fillStyle = '#00d2ff';
        ctx.fillText(cop.username, cop.x * TILE_SIZE + TILE_SIZE/2, cop.y * TILE_SIZE - 5);
    });
}
