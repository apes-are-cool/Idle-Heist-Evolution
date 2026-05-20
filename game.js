const state = {
  cash: 0,
  heat: 0,
  hqLevel: 1,
  crew: [
    { name: "Vex", skill: 55, morale: 80 },
    { name: "Rook", skill: 40, morale: 65 },
    { name: "Nyx", skill: 70, morale: 50 }
  ],
  target: {
    name: "Convenience Store",
    security: 10,
    reward: 150
  }
};

const el = {};

// --------------------
// SAFE INIT (NEVER FAILS)
// --------------------
document.addEventListener("DOMContentLoaded", () => {
  bind();
  render();
  log("Game started.");
});

function bind() {
  const ids = [
    "cash", "heat", "hq-level",
    "crew", "log",
    "target-name", "target-stats",
    "run-heist", "upgrade-hq"
  ];

  ids.forEach(id => {
    el[id] = document.getElementById(id);
  });

  // HARD GUARANTEE: buttons always bind or error is visible
  if (!el["run-heist"] || !el["upgrade-hq"]) {
    console.error("Critical buttons missing from DOM");
    return;
  }

  el["run-heist"].addEventListener("click", runHeist);
  el["upgrade-hq"].addEventListener("click", upgradeHQ);
}

// --------------------
// LOG
// --------------------
function log(msg) {
  if (!el.log) return;
  const div = document.createElement("div");
  div.textContent = `> ${msg}`;
  el.log.prepend(div);
}

// --------------------
// RENDER
// --------------------
function render() {
  if (!el.cash) return;

  el.cash.textContent = `Cash: $${Math.floor(state.cash)}`;
  el.heat.textContent = `Heat: ${state.heat}`;
  el["hq-level"].textContent = `HQ Level: ${state.hqLevel}`;

  el["target-name"].textContent = `Target: ${state.target.name}`;
  el["target-stats"].textContent =
    `Security: ${state.target.security} | Reward: $${state.target.reward}`;

  el.crew.innerHTML = "";
  state.crew.forEach(c => {
    const d = document.createElement("div");
    d.textContent = `${c.name} | Skill ${c.skill} | Morale ${c.morale}`;
    el.crew.appendChild(d);
  });
}

// --------------------
// GAME LOGIC
// --------------------
function runHeist() {
  const avgSkill =
    state.crew.reduce((a, c) => a + c.skill, 0) / state.crew.length;

  const avgMorale =
    state.crew.reduce((a, c) => a + c.morale, 0) / state.crew.length;

  const chance =
    avgSkill -
    state.target.security +
    avgMorale * 0.1 -
    state.heat * 0.5;

  const roll = Math.random() * 100;

  log(`Heist chance ${chance.toFixed(1)}% roll ${roll.toFixed(1)}`);

  if (roll < chance) {
    state.cash += state.target.reward;
    state.heat += 2;
    log("SUCCESS");
  } else if (roll < chance + 20) {
    state.cash += state.target.reward * 0.4;
    state.heat += 3;
    log("PARTIAL");
  } else {
    state.heat += 5;
    log("FAILED");
  }

  render();
}

function upgradeHQ() {
  const cost = state.hqLevel * 100;

  if (state.cash < cost) {
    log("Not enough cash");
    return;
  }

  state.cash -= cost;
  state.hqLevel++;

  state.crew.forEach(c => c.skill += 2);

  log(`HQ upgraded to ${state.hqLevel}`);
  render();
}
