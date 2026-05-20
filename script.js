// ----------------------------
// STATE
// ----------------------------
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

// ----------------------------
// DOM
// ----------------------------
const cashEl = document.getElementById("cash");
const heatEl = document.getElementById("heat");
const crewListEl = document.getElementById("crew-list");
const logBox = document.getElementById("log-box");

// ----------------------------
// LOGGING
// ----------------------------
function log(msg) {
  const div = document.createElement("div");
  div.textContent = `> ${msg}`;
  logBox.prepend(div);
}

// ----------------------------
// RENDER
// ----------------------------
function render() {
  cashEl.textContent = `Cash: $${state.cash}`;
  heatEl.textContent = `Heat: ${state.heat}`;

  crewListEl.innerHTML = "";
  state.crew.forEach(c => {
    const el = document.createElement("div");
    el.textContent = `${c.name} | Skill: ${c.skill} | Morale: ${c.morale}`;
    crewListEl.appendChild(el);
  });
}

// ----------------------------
// HEIST SIMULATION
// ----------------------------
function runHeist() {
  const avgSkill =
    state.crew.reduce((a, c) => a + c.skill, 0) / state.crew.length;

  const avgMorale =
    state.crew.reduce((a, c) => a + c.morale, 0) / state.crew.length;

  const successChance =
    avgSkill - state.target.security + (avgMorale * 0.1) - state.heat * 0.5;

  const roll = Math.random() * 100;

  log(`Running heist on ${state.target.name}...`);
  log(`Success chance: ${successChance.toFixed(1)}% | Roll: ${roll.toFixed(1)}`);

  if (roll < successChance) {
    state.cash += state.target.reward;
    state.heat += 2;

    log(`SUCCESS! Gained $${state.target.reward}`);
  } else if (roll < successChance + 20) {
    const partial = Math.floor(state.target.reward * 0.4);
    state.cash += partial;
    state.heat += 3;

    log(`PARTIAL SUCCESS. Gained $${partial}`);
  } else {
    state.heat += 5;

    log(`FAILURE. Crew escaped but heat increased.`);
  }

  render();
}

// ----------------------------
// HQ UPGRADE (placeholder system)
// ----------------------------
function upgradeHQ() {
  const cost = state.hqLevel * 100;

  if (state.cash < cost) {
    log(`Not enough cash for HQ upgrade.`);
    return;
  }

  state.cash -= cost;
  state.hqLevel += 1;

  state.crew.forEach(c => c.skill += 2);

  log(`HQ upgraded to level ${state.hqLevel}`);
  render();
}

// ----------------------------
// EVENTS
// ----------------------------
document.getElementById("run-heist").onclick = runHeist;
document.getElementById("upgrade-btn").onclick = upgradeHQ;

// ----------------------------
// INIT
// ----------------------------
render();
log("Idle Heist Empire initialized.");