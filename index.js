const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

let lobbies = []; 
// Each lobby: { hostIP, port, playerName, inGame, timestamp }

// Register a new lobby
app.post("/register", (req, res) => {
  const { hostIP, port, playerName } = req.body;
  if (!hostIP || !port || !playerName) 
    return res.status(400).send("Missing required fields");

  // Remove any existing lobby from same host
  lobbies = lobbies.filter(l => l.hostIP !== hostIP);

  lobbies.push({
    hostIP,
    port,
    playerName,
    inGame: false,
    timestamp: Date.now()
  });

  console.log(`Lobby registered: ${playerName} at ${hostIP}:${port}`);
  res.send({ success: true });
});

// Mark a lobby as started
app.post("/start", (req, res) => {
  const { hostIP } = req.body;
  const lobby = lobbies.find(l => l.hostIP === hostIP && !l.inGame);
  if (lobby) {
    lobby.inGame = true;
    console.log(`Game started: ${lobby.playerName}`);
    res.send({ success: true });
  } else {
    res.send({ success: false });
  }
});

// Get all active lobbies (not in game)
app.get("/hosts", (req, res) => {
  const active = lobbies.filter(l => !l.inGame);
  res.send(active);
});

// Remove stale lobbies older than 2 minutes
setInterval(() => {
  const before = lobbies.length;
  lobbies = lobbies.filter(l => Date.now() - l.timestamp < 120000);
  if (lobbies.length !== before) console.log("Removed stale lobbies");
}, 30000);

app.listen(PORT, () => {
  console.log(`Lobby server running on port ${PORT}`);
});