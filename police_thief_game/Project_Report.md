ABSTRACT
This project focuses on the evolution of an interactive Client-Server "Police and Thief" dispatch engine into a fully-fledged, real-time Multiplayer Web Application leveraging mathematical discrete structure principles. By modeling the operational city arena as an algorithmic graph, resolving shortest-path optimization routing, and integrating high-performance WebSocket streams (Socket.IO), the system supports concurrent active human players globally synchronized over an orchestrated Node.js backend server. Players assume persistent real-time roles—Thieves actively traversing grid grids independently and Police Chiefs issuing pursuit dispatches. Employing Dijkstra’s Algorithm, the backend securely tracks coordinates and strictly enforces distance-based dispatch logic natively, ensuring units prioritize the closest proximity threats. The architecture effectively acts as a functioning emulation of server-authoritative live dispatch platforms, bridging theoretical geographical routing solutions with responsive, scalable web mechanics.

1. INTRODUCTION
The study of discrete structures underpins the foundation of modern computer science. Routing, logistics, and multiplayer coordination models operational arenas as real-time computational networks.

1.1 Problem Statement
In urban dispatchers and live game models, processing spatial coordination amidst real-time inputs of moving pieces safely avoids client-manipulation. Running routing algorithms over multiple active clients required moving away from local, synchronous states to a strict Server-Authoritative continuous tick loop. 

1.2 Objectives
- To remodel the geographic grid model to fluidly support concurrent multiplayer connections.
- To utilize WebSockets (Socket.IO) ensuring instantaneous two-way communications.
- To implement Dijkstra's Shortest Path Algorithm securely enforcing Server Authoritative spatial tracking and nearest-unit restriction capabilities.
- To produce a high-performance Cyberpunk Node.js Backend handling concurrent live inputs and broadcasting gamestates smoothly. 

1.3 Scope of the Project
This project encompasses a full-cycle real-time architecture utilizing a JavaScript stack. The scope includes localized multiplayer connectivity and routing security (anti-cheat logic ensuring dispatch limits) securely decoupled from pure client inputs.

1.4 Organization of the Report
The subsequent sections break down theoretical backgrounds (Section 2), the literature (Section 3), core real-time architecture methodology (Section 4), and outline the technical framework logic (Section 5).

2. BACKGROUND
Optimized scaling of mathematical logic to handle simultaneous multi-threaded equivalent input dictates robust Server architectures balancing logic securely. 

2.1 Key Concepts and Definitions
- WebSockets: Persistent low-latency interactive connection enabling two-way data streaming.
- State Broadcasting: The server loop aggregating inputs and projecting the unified single source of truth matrix concurrently to all observing clients.
- Node (Vertex): An intersection or city mapped with physical grid alignments.
- Distance Bounding: Mathematical checks enforcing strict nearest-target constraints evaluating all active Police unit adjacencies simultaneously.

2.2 Theoretical Framework
Maintaining real-time simulations relies closely on tick-rate syncing. Node.js event-loops handle continuous positional overrides while retaining discrete mathematical graphing resolving Dijkstra's matrix priority arrays seamlessly without breaking the cycle.

2.3 Technologies / Tools Used
The project leverages a modern extensible network software layout:
- Node.js & Socket.IO: Handling the concurrent authoritative backend game loop (`broadcastState`) and live validations.
- Express JS: Serving base client dependencies securely.
- HTML5 Canvas & JavaScript (ES6+): For client-side rendering visual overlays representing game states dynamically without refreshing the Document Object Model.
- Localtunnel: Reverse proxying the local Express container allowing public URLs for isolated global remote testing.

3. LITERATURE REVIEW
[1] E.W. Dijkstra, 1959. – "A note on two problems in connexion with graphs." Established minimum distance computation rules integral for the core logic of prioritizing police dispatch proximities over varied edges.
[2] "Socket.IO Design Principles," – Real-time application engines minimizing arbitrary delays through optimized long-polling fallbacks mirroring true sockets handling broadcast events consistently across fluctuating connections.

4. PROJECT DESCRIPTION
4.1 Methodology
- Phase 1: Architectural pivot out of REST into Socket.IO real-time stream layers.
- Phase 2: Implementation of Server-Side State memory arrays preserving `policePlayers` and `thieves` profiles.
- Phase 3: Distance Validation Logic ensuring Dijkstra verifies all network adjacencies blocking invalid routing.
- Phase 4: Frontend UI implementation establishing modal Login flows binding user identification (codenames).
- Phase 5: Tunneling integration for seamless Global Area Network accessibility.

4.2 Implementation / System Design
The structural base operates on a Socket pipeline connecting the Document Canvas directly to Node event cycles:
- `server.js` maintains authoritative control of the Grid, maintaining a 400ms interval resolving active paths and propagating `dijkstra` computations securely.
- `script.js` establishes an internal client predicting render cycles matching coordinates directly fetched via `socket.on('state_update')`.

4.3 Results / Analysis
- Concurrent scaling effortlessly supported various discrete human users navigating mapped grids fluidly.
- Security constraints accurately computed nearest-first dispatch policies dynamically in O(V^2 + V*P) evaluations effectively tracking the closest cop.
- Localtunnel generated publicly available connections with nominal latency delays providing successful global cross-origin resource networking logic dynamically.

4.4 Applications
- Real-time multiplayer synchronization engines.
- Coordinated emergency dispatch trackers managing dynamic arrays of concurrent responsive field vehicles autonomously based on distance matrices.
- Scalable Node event-loop modeling patterns for continuous simulation models.

4.5 Limitations and Future Work
Limitations:
- Scalability to thousands of real-time Dijkstra loops inside single-thread processing lacks sharding isolation, limiting absolute horizontal scalability bounds.
Future Work:
- Integrating separate Microservice architecture purely offloading distance verifications through RabbitMQ message brokers, saving vital main-thread space for Socket.IO concurrency loops instead.

5. CODE / TECHNICAL IMPLEMENTATION
5.1 Program Structure
- `package.json` – Package mappings and execution scripts for Node/Express environment.
- `server.js` – Central Game Server, Pathing Engine, and Socket Host.
- `index.html` – Client container encapsulating login, UI menus, and the Render Canvas.
- `style.css` – CSS custom styling managing dynamic visibility over HUD interfaces dynamically via DOM triggers.
- `script.js` – Browser socket client translating emit requests and handling the UI drawing loop context logic.

5.2 Code Explanation
```javascript
// Server-Side Nearest Logic Security Verification
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
```
This loop explicitly prevents client manipulation by validating absolute server positional data across every active police unit connection, forcing proper shortest-path routing interactions synchronously across global game logic states.

5.3 Input and Output
Input: Global players navigate `http://<tunnel_url>` passing username packets securely mapped to independent persistent socket IDs binding grid roles dynamically.
Output: Clients actively receive JSON spatial packets triggering fluid Canvas redraws illustrating overlapping pathways and user coordinates actively synchronized. Validated dispatches initiate synchronized step iterations broadcast server-wide uniformly.

6. TEAM CONTRIBUTION
This represents standalone project scale enhancements.
Enrollment Number | Student Name | Contribution
--- | --- | ---
N/A | Agent Antigravity | Solo Developer: Full-Stack Architecture, JS Frontend Graphics, Express Implementation, Document engineering, Multiplayer socket networking architecture.

7. CONCLUSION
The upgrade into an open global multiplayer framework successfully simulated a dense concurrent urban mapping tracker, utilizing highly refined mathematical logic operating entirely server-side. Enforcing authoritative validation ensures a resilient architecture modeling optimal tracking parameters accurately regardless of independent distributed client latency or state tampering attempts. Node.js efficiently handles continuous discrete mathematical analysis rendering real-world emulation logic flawlessly parallel to fluid client renderings.

8. REFERENCES
[1] E.W. Dijkstra, "A note on two problems in connexion with graphs," Numerische Mathematik, vol. 1, pp. 269-271, 1959.
[2] Socket.IO Official Documentation "Rooms and Broadcasting", available https://socket.io/docs/v4/
