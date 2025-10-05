# 🏆 Top Goleadores — Day 9/365

Simple Top Goleadores tool for Haxball.  
Counts goals per player and shows the Top 10 when someone types `!goleadores`.

By TLS / Teleese

---

## Features
- Counts goals per player reliably using the last ball touch as primary source.
- Fallback: selects the most recently active player on the scoring team.
- Command: `!goleadores` → shows Top 10 `Name (goals)`.
- Keeps counts across games (persist in memory while host runs).

---

## Installation
1. Copy `goleadores.js` into your Haxball host script.
2. Optionally tweak these constants at top of the file:
   - `MAX_TOP` — how many players to show (default 10).
   - `MIN_TOUCH_WINDOW` — ms to consider last touch as scorer (default 7000).
   - `DEBOUNCE_GOAL_MS` — ms to avoid double counting (default 1500).
3. Run your room. Use `!goleadores` in chat to display the top scorers.

---

## Notes
- Own goals are **not** credited to the scorer (they appear as "scorer unknown").
- If you want own goals to count, the logic is in `onTeamGoal` and can be adjusted.
- If the site/client API changes, the fallback helps in most common cases.

---

## License
Apache 2.0 — keep NOTICE and LICENSE intact.

**By TLS / Teleese — Day 9/365**
