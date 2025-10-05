// goleadores.js
// Day 9/365 - Top Goleadores (By TLS)
// Shit code i really dont like it but i dont have more time :( sorry chat
const MAX_TOP = 10;
const MIN_TOUCH_WINDOW = 7000;   
const DEBOUNCE_GOAL_MS = 1500;  
const FALLBACK_ACTIVE_WINDOW = 20000; /
const ANN_COLOR = 0x00FF00;
const ANN_STYLE = "bold";

const playersState = new Map(); 
const goalCounts = new Map();  

let lastTouch = { id: null, team: null, time: 0 };
let lastGoalAt = 0;

function now() { return Date.now(); }
function safeName(id) {
  const st = playersState.get(id);
  if (st && st.name) return st.name;
  try { const p = room.getPlayer(id); return (p && p.name) ? p.name : `id:${id}`; } catch (e) { return `id:${id}`; }
}

room.onPlayerJoin = function(player) {
  playersState.set(player.id, { name: player.name || "", lastActive: now(), team: player.team });
  if (!goalCounts.has(player.id)) goalCounts.set(player.id, 0);
};

room.onPlayerLeave = function(playerId) {
  playersState.delete(playerId);
 
};

room.onPlayerTeamChange = function(player) {
  if (playersState.has(player.id)) {
    const s = playersState.get(player.id);
    s.team = player.team;
    s.name = player.name || s.name;
    s.lastActive = now();
  } else {
    playersState.set(player.id, { name: player.name || "", lastActive: now(), team: player.team });
    if (!goalCounts.has(player.id)) goalCounts.set(player.id, 0);
  }
};

room.onPlayerChat = function(player, message) {

  if (playersState.has(player.id)) playersState.get(player.id).lastActive = now();

  const msg = (message || "").trim().toLowerCase();
  if (msg === '!goleadores') {
    const arr = Array.from(goalCounts.entries())
      .map(([id, g]) => ({ id, name: safeName(id), goals: g }))
      .filter(x => x.goals > 0)
      .sort((a, b) => b.goals - a.goals || a.name.localeCompare(b.name))
      .slice(0, MAX_TOP);

    if (arr.length === 0) {
      room.sendAnnouncement("🏆 Top Goleadores: nadie anotó todavía.", null, ANN_COLOR, ANN_STYLE, 4);
      return false;
    }

    const lines = ['🏆 Top Goleadores:'];
    for (let i = 0; i < arr.length; i++) {
      const r = arr[i];
      lines.push(`${i+1}. ${r.name} (${r.goals})`);
    }
    room.sendAnnouncement(lines.join('\n'), null, ANN_COLOR, ANN_STYLE, 6);
    return false; 
  }

  return true;
};

room.onPlayerBallKick = function(player) {
  lastTouch = { id: player.id, team: player.team, time: now() };
  if (playersState.has(player.id)) playersState.get(player.id).lastActive = now();
};

room.onTeamGoal = function(team) {
  const t = now();
  if (t - lastGoalAt < DEBOUNCE_GOAL_MS) return;
  lastGoalAt = t;

  let scorerId = null;

  if (lastTouch.id && (t - lastTouch.time) <= MIN_TOUCH_WINDOW) {
    if (lastTouch.team === team) {
      scorerId = lastTouch.id; 
    } else {
      scorerId = null;
    }
  }

  if (!scorerId) {
    try {
      const list = room.getPlayerList ? room.getPlayerList() : [];
      let bestId = null;
      let bestTime = 0;
      for (const p of list) {
        if (p.team !== team) continue;
        const st = playersState.get(p.id);
        const tActive = (st && st.lastActive) ? st.lastActive : 0;
        if (tActive > bestTime) { bestTime = tActive; bestId = p.id; }
      }
      if (bestId && (t - bestTime) <= FALLBACK_ACTIVE_WINDOW) scorerId = bestId;
    } catch (e) {
      
    }
  }

  if (scorerId) {
    goalCounts.set(scorerId, (goalCounts.get(scorerId) || 0) + 1);
    const name = safeName(scorerId);
    const total = goalCounts.get(scorerId);
    console.log(`[GOL] ${name} scored. Total: ${total} — By TLS`);
    room.sendAnnouncement(`⚽ ${name} scored! (${total})`, null, ANN_COLOR, ANN_STYLE, 3);
  } else {
    console.log(`[GOL] Team ${team} scored but scorer unknown/own-goal — By TLS`);
    room.sendAnnouncement(`⚽ Goal! (scorer unknown)`, null, ANN_COLOR, ANN_STYLE, 3);
  }
};

room.onRoomLink = function() {
  console.log("Top Goleadores active — By TLS");
};
