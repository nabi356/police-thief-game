const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(__dirname));

const GRID_SIZE = 20;
let grid = [];

function generateGrid() {
    grid = [];
    for (let y = 0; y < GRID_SIZE; y++) {
        let row = [];
        for (let x = 0; x < GRID_SIZE; x++) {
            if (x > 2 && x < GRID_SIZE-3 && y > 2 && y < GRID_SIZE-3 && Math.random() < 0.25) {
               row.push(1);
            } else {
               row.push(0);
            }
        }
        grid.push(row);
    }
}
generateGrid();

function getRandomClearSpot() {
    let x, y;
    do {
        x = Math.floor(Math.random() * GRID_SIZE);
        y = Math.floor(Math.random() * GRID_SIZE);
    } while (grid[y][x] === 1);
    return { x, y };
}

// Map socket.id -> { username, role }
let connectedUsers = {};

let thieves = {}; // socket.id -> { x, y, username }
let policePlayers = {}; // socket.id -> { x, y, username, currentPath: [] }

function dijkstra(grid, start, end) {
    if (grid[end.y][end.x] === 1) return { path: [], dist: Infinity }; 
    
    let dist = {};
    let prev = {};
    let pq = [];

    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            let key = `${x},${y}`;
            dist[key] = Infinity;
            prev[key] = null;
        }
    }

    let startKey = `${start.x},${start.y}`;
    dist[startKey] = 0;
    pq.push({key: startKey, x: start.x, y: start.y, d: 0});

    const dirs = [[0,1], [1,0], [0,-1], [-1,0]];

    while (pq.length > 0) {
        pq.sort((a,b) => a.d - b.d);
        let curr = pq.shift();
        
        if (curr.x === end.x && curr.y === end.y) break;

        dirs.forEach(dir => {
            let nx = curr.x + dir[0];
            let ny = curr.y + dir[1];
            
            if (nx >= 0 && nx < GRID_SIZE && ny >= 0 && ny < GRID_SIZE && grid[ny][nx] === 0) {
                let nKey = `${nx},${ny}`;
                let alt = dist[curr.key] + 1; 
                if (alt < dist[nKey]) {
                    dist[nKey] = alt;
                    prev[nKey] = {x: curr.x, y: curr.y};
                    pq.push({key: nKey, x: nx, y: ny, d: alt});
                }
            }
        });
    }

    let path = [];
    let curr = end;
    let currKey = `${curr.x},${curr.y}`;
    
    if (prev[currKey] !== null || (curr.x === start.x && curr.y === start.y)) {
        while (curr !== null) {
            path.unshift(curr);
            let pNode = prev[`${curr.x},${curr.y}`];
            curr = pNode ? {x: pNode.x, y: pNode.y} : null;
        }
    }
    return { path, dist: dist[`${end.x},${end.y}`] };
}

function broadcastState() {
    io.emit('state_update', { thieves, policePlayers });
}

function handleCollisions() {
    let bustedThieves = [];

    Object.keys(policePlayers).forEach(pId => {
        let cop = policePlayers[pId];
        Object.keys(thieves).forEach(tId => {
            let thief = thieves[tId];
            if (thief.x === cop.x && thief.y === cop.y) {
                bustedThieves.push(tId);
                cop.currentPath = []; // Stop cop
            }
        });
    });

    bustedThieves.forEach(tId => {
        let newSpot = getRandomClearSpot();
        thieves[tId].x = newSpot.x;
        thieves[tId].y = newSpot.y;
        io.to(tId).emit('busted', { message: "CAUGHT! Escaped to a new location!" });
    });
}

setInterval(() => {
    let hasMoved = false;

    Object.values(policePlayers).forEach(cop => {
        if (cop.currentPath && cop.currentPath.length > 0) {
            hasMoved = true;
            let nextStep = cop.currentPath.shift();
            cop.x = nextStep.x;
            cop.y = nextStep.y;
        }
    });

    if (hasMoved) {
        handleCollisions();
        broadcastState();
    }
}, 400);

io.on('connection', (socket) => {
    connectedUsers[socket.id] = { username: "Anonymous" };
    socket.emit('init_game', { grid, gridSize: GRID_SIZE, id: socket.id });

    socket.on('login', (data) => {
        connectedUsers[socket.id].username = data.username.substring(0, 15);
        socket.emit('login_success');
        broadcastState();
    });

    socket.on('request_role', (data) => {
        let user = connectedUsers[socket.id];
        if (data.role === 'Thief') {
            let spawn = getRandomClearSpot();
            thieves[socket.id] = { x: spawn.x, y: spawn.y, username: user.username };
            // If they were police before, delete
            if (policePlayers[socket.id]) delete policePlayers[socket.id];
            
            socket.emit('role_granted', { role: 'Thief' });
            broadcastState();
        } else if (data.role === 'Police Chief') {
            let spawn = getRandomClearSpot();
            policePlayers[socket.id] = { x: spawn.x, y: spawn.y, username: user.username, currentPath: [] };
            // If they were thief before, delete
            if (thieves[socket.id]) delete thieves[socket.id];

            socket.emit('role_granted', { role: 'Police Chief' });
            broadcastState();
        }
    });

    socket.on('thief_move', (newPos) => {
        if (!thieves[socket.id]) return;
        if (newPos.x >= 0 && newPos.x < GRID_SIZE && newPos.y >= 0 && newPos.y < GRID_SIZE) {
            if (grid[newPos.y][newPos.x] === 0) {
                thieves[socket.id].x = newPos.x;
                thieves[socket.id].y = newPos.y;
                handleCollisions();
                broadcastState();
            }
        }
    });

    socket.on('police_target', (targetPos) => {
        let me = policePlayers[socket.id];
        if (!me) return;

        // Verify if the targetPos contains a Thief
        let targetThief = Object.values(thieves).find(t => t.x === targetPos.x && t.y === targetPos.y);
        
        let pathResult = dijkstra(grid, {x: me.x, y: me.y}, targetPos);
        let myDistance = pathResult.dist;

        if (myDistance === Infinity) {
            socket.emit('dispatch_warning', { message: "Route impossible!" });
            return;
        }

        if (targetThief) {
            // Check all OTHER human players' distance to this EXACT thief
            let isClosest = true;
            let closerCopName = "";

            Object.keys(policePlayers).forEach(pId => {
                if (pId !== socket.id) {
                    let other = policePlayers[pId];
                    let otherRes = dijkstra(grid, {x: other.x, y: other.y}, targetPos);
                    if (otherRes.dist < myDistance) {
                        isClosest = false;
                        closerCopName = other.username;
                    }
                }
            });

            if (!isClosest) {
                socket.emit('dispatch_warning', { message: `Warning: ${closerCopName} is closer to this Thief! You must target your NEAREST Thief.` });
                return; // Block the action!
            }
        }

        // Action Allowed: Animate the path!
        if (pathResult.path.length > 1) {
            pathResult.path.shift(); // remove starting point
            me.currentPath = pathResult.path;
            socket.emit('dispatch_approved');
            broadcastState();
        } else {
            socket.emit('dispatch_warning', { message: 'Already at target!' });
        }
    });

    socket.on('disconnect', () => {
        if (thieves[socket.id]) delete thieves[socket.id];
        if (policePlayers[socket.id]) delete policePlayers[socket.id];
        if (connectedUsers[socket.id]) delete connectedUsers[socket.id];
        broadcastState();
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Grid Game Socket.io Server listening on port ${PORT}`);
});
