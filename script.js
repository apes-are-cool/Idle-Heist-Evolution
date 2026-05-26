const state = {
  cash: 500,
  heat: 0,
  xp: 0,

  hqLevel: 1,
  cityControl: 0,

  passiveIncome: 0,
  totalEarned: 0,

  successBonus: 0,
  rewardMultiplier: 1,

  heistRunning: false,

  stats: {
    successfulHeists: 0,
    failedHeists: 0,
    recruits: 0
  },

  crew: [
    {
      name: "Vex",
      role: "Hacker",
      skill: 68,
      morale: 82,
      loyalty: 74
    },
    {
      name: "Nyx",
      role: "Driver",
      skill: 57,
      morale: 71,
      loyalty: 88
    },
    {
      name: "Rook",
      role: "Enforcer",
      skill: 61,
      morale: 76,
      loyalty: 67
    }
  ],

  targets: [
    {
      id: 0,
      name: "Convenience Store",
      security: 18,
      reward: 220,
      risk: 8,
      duration: 4000
    },

    {
      id: 1,
      name: "Luxury Jewelry Shop",
      security: 35,
      reward: 850,
      risk: 18,
      duration: 6500
    },

    {
      id: 2,
      name: "Downtown Bank",
      security: 55,
      reward: 2400,
      risk: 35,
      duration: 9000
    },

    {
      id: 3,
      name: "Casino Vault",
      security: 72,
      reward: 6500,
      risk: 50,
      duration: 12000
    },

    {
      id: 4,
      name: "Federal Reserve Transport",
      security: 92,
      reward: 15000,
      risk: 70,
      duration: 16000
    }
  ],

  selectedTarget: 0,

  achievements: [
    {
      id: "first_heist",
      title: "First Blood",
      description: "Complete your first successful heist.",
      unlocked: false,
      check: () => state.stats.successfulHeists >= 1
    },

    {
      id: "rich",
      title: "Money Printer",
      description: "Reach $10,000 cash.",
      unlocked: false,
      check: () => state.cash >= 10000
    },

    {
      id: "crew",
      title: "Gang Leader",
      description: "Recruit 5 crew members.",
      unlocked: false,
      check: () => state.crew.length >= 5
    },

    {
      id: "empire",
      title: "Empire Builder",
      description: "Upgrade HQ to Level 5.",
      unlocked: false,
      check: () => state.hqLevel >= 5
    }
  ]
};

const el = {};

const CREW_NAMES = [
  "Ghost",
  "Cipher",
  "Blaze",
  "Knox",
  "Shade",
  "Nova",
  "Raven",
  "Mako",
  "Jinx",
  "Zero"
];

const CREW_ROLES = [
  "Hacker",
  "Driver",
  "Scout",
  "Enforcer",
  "Demolitions",
  "Infiltrator"
];

/* ------------------------------ */
/* INIT */
/* ------------------------------ */

document.addEventListener("DOMContentLoaded", () => {
  bindElements();
  bindButtons();

  loadGame();

  renderAll();

  startPassiveIncomeLoop();
  startHeatLoop();
  startRandomEventLoop();
  startAutoSave();

  log("Empire initialized.");
});

/* ------------------------------ */
/* ELEMENTS */
/* ------------------------------ */

function bindElements() {

  const ids = [
    "cash",
    "heat",
    "income",
    "xp",
    "hq-level",
    "crew-capacity",
    "passive-income",
    "reputation",
    "city-control",
    "crew-list",
    "targets",
    "target-name",
    "target-security",
    "target-reward",
    "target-risk",
    "success-rate",
    "heist-progress",
    "log",
    "achievements",

    "upgrade-hq",
    "reduce-heat",
    "recruit-btn",

    "buy-informant",
    "buy-fakeids",
    "buy-launder",

    "run-heist"
  ];

  ids.forEach(id => {
    el[id] = document.getElementById(id);
  });
}

/* ------------------------------ */
/* BUTTONS */
/* ------------------------------ */

function bindButtons() {

  el["run-heist"].addEventListener("click", startHeist);

  el["upgrade-hq"].addEventListener("click", upgradeHQ);

  el["reduce-heat"].addEventListener("click", reduceHeat);

  el["recruit-btn"].addEventListener("click", recruitCrew);

  el["buy-informant"].addEventListener("click", buyInformant);

  el["buy-fakeids"].addEventListener("click", buyFakeIDs);

  el["buy-launder"].addEventListener("click", buyLaunder);
}

/* ------------------------------ */
/* RENDER */
/* ------------------------------ */

function renderAll() {

  renderTopbar();
  renderHQ();
  renderCrew();
  renderTargets();
  renderSelectedTarget();
  renderAchievements();
}

function renderTopbar() {

  el.cash.textContent =
    "$" + format(state.cash);

  el.heat.textContent =
    Math.floor(state.heat) + "%";

  el.income.textContent =
    "$" + format(state.passiveIncome);

  el.xp.textContent =
    format(state.xp);
}

function renderHQ() {

  el["hq-level"].textContent =
    "Level " + state.hqLevel;

  el["crew-capacity"].textContent =
    getCrewCapacity();

  el["passive-income"].textContent =
    "$" + format(state.passiveIncome) + "/sec";

  el["city-control"].textContent =
    Math.floor(state.cityControl) + "%";

  el["reputation"].textContent =
    getReputation();
}

function renderCrew() {

  el["crew-list"].innerHTML = "";

  state.crew.forEach(member => {

    const div = document.createElement("div");

    div.className = "crew-card";

    div.innerHTML = `
      <div class="crew-top">
        <div>
          <div class="crew-name">${member.name}</div>
          <div class="crew-role">${member.role}</div>
        </div>

        <div>
          ⭐ ${member.skill}
        </div>
      </div>

      <div class="crew-stats">

        <div class="mini-stat">
          <span>Morale</span>
          <strong>${member.morale}</strong>
        </div>

        <div class="mini-stat">
          <span>Loyalty</span>
          <strong>${member.loyalty}</strong>
        </div>

        <div class="mini-stat">
          <span>Skill</span>
          <strong>${member.skill}</strong>
        </div>

      </div>
    `;

    el["crew-list"].appendChild(div);
  });
}

function renderTargets() {

  el.targets.innerHTML = "";

  state.targets.forEach(target => {

    const card = document.createElement("div");

    card.className =
      "target-card" +
      (
        state.selectedTarget === target.id
          ? " active"
          : ""
      );

    card.innerHTML = `
      <h3>${target.name}</h3>

      <div class="target-info">
        Security: ${target.security}
      </div>

      <div class="target-info">
        Reward: $${format(target.reward)}
      </div>

      <div class="target-info">
        Risk: ${target.risk}%
      </div>
    `;

    card.addEventListener("click", () => {

      state.selectedTarget = target.id;

      renderTargets();
      renderSelectedTarget();
    });

    el.targets.appendChild(card);
  });
}

function renderSelectedTarget() {

  const target =
    state.targets[state.selectedTarget];

  el["target-name"].textContent =
    target.name;

  el["target-security"].textContent =
    target.security;

  el["target-reward"].textContent =
    "$" + format(
      target.reward * state.rewardMultiplier
    );

  el["target-risk"].textContent =
    target.risk + "%";

  el["success-rate"].textContent =
    Math.floor(getSuccessChance(target)) + "%";
}

function renderAchievements() {

  el.achievements.innerHTML = "";

  state.achievements.forEach(a => {

    const div = document.createElement("div");

    div.className =
      "achievement" +
      (
        a.unlocked
          ? " unlocked"
          : ""
      );

    div.innerHTML = `
      <strong>${a.title}</strong>
      <p>${a.description}</p>
    `;

    el.achievements.appendChild(div);
  });
}

/* ------------------------------ */
/* GAMEPLAY */
/* ------------------------------ */

function startHeist() {

  if (state.heistRunning) {
    return;
  }

  const target =
    state.targets[state.selectedTarget];

  state.heistRunning = true;

  let progress = 0;

  el["heist-progress"].style.width = "0%";

  log(`Crew deployed to ${target.name}.`);

  const interval = setInterval(() => {

    progress += 100 / (target.duration / 100);

    el["heist-progress"].style.width =
      progress + "%";

    if (progress >= 100) {

      clearInterval(interval);

      finishHeist(target);
    }

  }, 100);
}

function finishHeist(target) {

  state.heistRunning = false;

  const chance =
    getSuccessChance(target);

  const roll =
    Math.random() * 100;

  if (roll <= chance) {

    const payout =
      Math.floor(
        target.reward *
        state.rewardMultiplier *
        randomRange(0.9, 1.25)
      );

    state.cash += payout;

    state.totalEarned += payout;

    state.xp += Math.floor(payout / 4);

    state.cityControl += 1.5;

    state.heat += target.risk;

    state.stats.successfulHeists++;

    boostCrewMorale(3);

    log(`SUCCESS: ${target.name} earned $${format(payout)}.`);

    toast(`+$${format(payout)}`);

  } else {

    state.heat += target.risk * 1.5;

    state.stats.failedHeists++;

    lowerCrewMorale(5);

    log(`FAILED: ${target.name} collapsed.`);

    toast("Heist Failed");
  }

  checkAchievements();

  scaleGame();

  renderAll();
}

function getSuccessChance(target) {

  const avgSkill =
    average(state.crew.map(c => c.skill));

  const avgMorale =
    average(state.crew.map(c => c.morale));

  const avgLoyalty =
    average(state.crew.map(c => c.loyalty));

  let chance =
    avgSkill
    + avgMorale * 0.2
    + avgLoyalty * 0.15
    + state.successBonus
    + state.hqLevel * 2
    - target.security
    - state.heat * 0.45;

  chance =
    clamp(chance, 5, 95);

  return chance;
}

/* ------------------------------ */
/* HQ */
/* ------------------------------ */

function upgradeHQ() {

  const cost =
    state.hqLevel * 1200;

  if (state.cash < cost) {

    log("Not enough cash for HQ upgrade.");
    return;
  }

  state.cash -= cost;

  state.hqLevel++;

  state.passiveIncome +=
    15 * state.hqLevel;

  state.crew.forEach(c => {
    c.skill += 2;
    c.loyalty += 1;
  });

  log(`HQ upgraded to Level ${state.hqLevel}.`);

  toast("HQ Upgraded");

  checkAchievements();

  renderAll();
}

function reduceHeat() {

  const cost = 400;

  if (state.cash < cost) {

    log("Need more cash to lay low.");
    return;
  }

  state.cash -= cost;

  state.heat =
    Math.max(0, state.heat - 25);

  log("The crew disappeared for a while.");

  renderAll();
}

function getCrewCapacity() {

  return 3 + state.hqLevel * 2;
}

/* ------------------------------ */
/* CREW */
/* ------------------------------ */

function recruitCrew() {

  if (state.crew.length >= getCrewCapacity()) {

    log("HQ capacity reached.");
    return;
  }

  const cost =
    500 + state.crew.length * 350;

  if (state.cash < cost) {

    log("Not enough cash to recruit.");
    return;
  }

  state.cash -= cost;

  const member = {

    name:
      CREW_NAMES[
        randomInt(0, CREW_NAMES.length - 1)
      ],

    role:
      CREW_ROLES[
        randomInt(0, CREW_ROLES.length - 1)
      ],

    skill:
      randomInt(40, 85),

    morale:
      randomInt(50, 100),

    loyalty:
      randomInt(45, 100)
  };

  state.crew.push(member);

  state.stats.recruits++;

  log(`${member.name} joined the empire.`);

  toast("New Recruit");

  checkAchievements();

  renderAll();
}

function boostCrewMorale(amount) {

  state.crew.forEach(c => {
    c.morale =
      clamp(c.morale + amount, 0, 100);
  });
}

function lowerCrewMorale(amount) {

  state.crew.forEach(c => {
    c.morale =
      clamp(c.morale - amount, 0, 100);
  });
}

/* ------------------------------ */
/* MARKET */
/* ------------------------------ */

function buyInformant() {

  const cost = 750;

  if (state.cash < cost) {
    return log("Not enough cash.");
  }

  state.cash -= cost;

  state.successBonus += 8;

  log("Inside informant acquired.");

  renderAll();
}

function buyFakeIDs() {

  const cost = 500;

  if (state.cash < cost) {
    return log("Not enough cash.");
  }

  state.cash -= cost;

  state.heat =
    Math.max(0, state.heat - 10);

  log("Fake IDs distributed.");

  renderAll();
}

function buyLaunder() {

  const cost = 1800;

  if (state.cash < cost) {
    return log("Not enough cash.");
  }

  state.cash -= cost;

  state.rewardMultiplier += 0.2;

  log("Crypto laundering online.");

  renderAll();
}

/* ------------------------------ */
/* PASSIVE */
/* ------------------------------ */

function startPassiveIncomeLoop() {

  setInterval(() => {

    state.cash +=
      state.passiveIncome / 2;

    state.totalEarned +=
      state.passiveIncome / 2;

    renderTopbar();

  }, 500);
}

function startHeatLoop() {

  setInterval(() => {

    if (state.heat > 0) {
      state.heat -= 0.35;
    }

    state.heat =
      clamp(state.heat, 0, 100);

    renderTopbar();

  }, 1000);
}

/* ------------------------------ */
/* RANDOM EVENTS */
/* ------------------------------ */

function startRandomEventLoop() {

  setInterval(() => {

    const roll =
      Math.random();

    if (roll < 0.25) {

      const bonus =
        randomInt(200, 1200);

      state.cash += bonus;

      log(`Anonymous tip earned $${bonus}.`);

      toast(`+$${bonus}`);

    } else if (roll < 0.45) {

      state.heat += 8;

      log("Police crackdown increased heat.");

      toast("Heat Rising");

    } else if (roll < 0.60) {

      boostCrewMorale(10);

      log("Crew party boosted morale.");

    }

    renderAll();

  }, 30000);
}

/* ------------------------------ */
/* ACHIEVEMENTS */
/* ------------------------------ */

function checkAchievements() {

  state.achievements.forEach(a => {

    if (!a.unlocked && a.check()) {

      a.unlocked = true;

      state.cash += 1000;

      log(`Achievement unlocked: ${a.title}`);

      toast(a.title);
    }
  });

  renderAchievements();
}

/* ------------------------------ */
/* SCALE */
/* ------------------------------ */

function scaleGame() {

  state.targets.forEach(target => {

    target.reward =
      Math.floor(target.reward * 1.02);

    target.security += 0.3;
  });
}

/* ------------------------------ */
/* UTIL */
/* ------------------------------ */

function average(arr) {

  return (
    arr.reduce((a, b) => a + b, 0)
    / arr.length
  );
}

function clamp(value, min, max) {

  return Math.max(
    min,
    Math.min(max, value)
  );
}

function randomInt(min, max) {

  return Math.floor(
    Math.random() * (max - min + 1)
  ) + min;
}

function randomRange(min, max) {

  return Math.random() * (max - min) + min;
}

function format(num) {

  return Math.floor(num)
    .toLocaleString();
}

function getReputation() {

  if (state.totalEarned >= 1000000) {
    return "Shadow King";
  }

  if (state.totalEarned >= 250000) {
    return "Crime Syndicate";
  }

  if (state.totalEarned >= 50000) {
    return "Mastermind";
  }

  if (state.totalEarned >= 10000) {
    return "Kingpin";
  }

  if (state.totalEarned >= 3000) {
    return "Professional Crew";
  }

  return "Street Nobody";
}

/* ------------------------------ */
/* LOG */
/* ------------------------------ */

function log(message) {

  const div =
    document.createElement("div");

  div.className = "log-entry";

  div.textContent =
    `[${new Date().toLocaleTimeString()}] ${message}`;

  el.log.prepend(div);

  while (el.log.children.length > 40) {
    el.log.removeChild(el.log.lastChild);
  }
}

/* ------------------------------ */
/* TOAST */
/* ------------------------------ */

function toast(message) {

  const container =
    document.getElementById("toast-container");

  const div =
    document.createElement("div");

  div.className = "toast";

  div.textContent = message;

  container.appendChild(div);

  setTimeout(() => {
    div.remove();
  }, 2500);
}

/* ------------------------------ */
/* SAVE */
/* ------------------------------ */

function saveGame() {

  localStorage.setItem(
    "idleHeistEmpireSave",
    JSON.stringify(state)
  );
}

function loadGame() {

  const save =
    localStorage.getItem(
      "idleHeistEmpireSave"
    );

  if (!save) {
    return;
  }

  try {

    const parsed =
      JSON.parse(save);

    Object.assign(state, parsed);

  } catch (err) {

    console.error(err);
  }
}

function startAutoSave() {

  setInterval(() => {

    saveGame();

  }, 5000);
}