const state = {

  /* =========================
     CORE
  ========================= */

  cash: 2500,
  gems: 25,
  intel: 0,
  influence: 0,

  heat: 0,
  xp: 0,
  prestige: 0,

  hqLevel: 1,
  labLevel: 1,

  district: 1,

  totalEarned: 0,

  passiveIncome: 0,

  successBonus: 0,
  rewardMultiplier: 1,

  adMultiplier: 1,
  adBoostTime: 0,

  heistRunning: false,

  selectedTarget: 0,

  crateLuck: 1,

  combo: 0,

  offlineTimestamp: Date.now(),

  autoHeistUnlocked: false,

  stats: {
    successfulHeists: 0,
    failedHeists: 0,
    openedCrates: 0,
    recruits: 0,
    critHeists: 0
  },

  /* =========================
     RESEARCH
  ========================= */

  research: {
    betterWeapons: 0,
    stealthTech: 0,
    cryptoAI: 0,
    insiderNetwork: 0,
    getawayCars: 0
  },

  /* =========================
     CREW
  ========================= */

  crew: [],

  /* =========================
     RECRUIT RARITIES
  ========================= */

  rarities: [

    {
      name: "Common",
      color: "#c7c7c7",
      multiplier: 1,
      chance: 62
    },

    {
      name: "Rare",
      color: "#55aaff",
      multiplier: 1.4,
      chance: 25
    },

    {
      name: "Epic",
      color: "#b96dff",
      multiplier: 2,
      chance: 9
    },

    {
      name: "Legendary",
      color: "#ffb347",
      multiplier: 3,
      chance: 3
    },

    {
      name: "Mythic",
      color: "#ff4d6d",
      multiplier: 5,
      chance: 1
    }
  ],

  /* =========================
     TARGETS
  ========================= */

  targets: [

    {
      id: 0,
      name: "Corner Store",
      security: 15,
      reward: 200,
      risk: 5,
      duration: 3500
    },

    {
      id: 1,
      name: "Luxury Mall",
      security: 32,
      reward: 850,
      risk: 12,
      duration: 6000
    },

    {
      id: 2,
      name: "Downtown Bank",
      security: 48,
      reward: 2500,
      risk: 20,
      duration: 8500
    },

    {
      id: 3,
      name: "Crypto Exchange",
      security: 70,
      reward: 8500,
      risk: 38,
      duration: 12000
    },

    {
      id: 4,
      name: "Military Convoy",
      security: 95,
      reward: 22000,
      risk: 60,
      duration: 17000
    }

  ],

  /* =========================
     BUSINESSES
  ========================= */

  businesses: [

    {
      name: "Underground Casino",
      level: 0,
      baseIncome: 25
    },

    {
      name: "Forgery Lab",
      level: 0,
      baseIncome: 75
    },

    {
      name: "Black Market Port",
      level: 0,
      baseIncome: 200
    }

  ],

  /* =========================
     ACHIEVEMENTS
  ========================= */

  achievements: [

    {
      title: "First Heist",
      reward: 500,
      unlocked: false,
      check: () => state.stats.successfulHeists >= 1
    },

    {
      title: "Big Boss",
      reward: 2000,
      unlocked: false,
      check: () => state.hqLevel >= 5
    },

    {
      title: "Millionaire",
      reward: 10,
      gemReward: true,
      unlocked: false,
      check: () => state.totalEarned >= 1000000
    }

  ]
};

const el = {};

const NAMES = [
  "Ghost",
  "Vex",
  "Nova",
  "Rogue",
  "Jinx",
  "Cipher",
  "Raven",
  "Blaze",
  "Zero",
  "Nyx"
];

const ROLES = [
  "Hacker",
  "Sniper",
  "Driver",
  "Scout",
  "Infiltrator",
  "Demolitions"
];

/* =====================================
   INIT
===================================== */

document.addEventListener("DOMContentLoaded", () => {

  bindElements();

  loadGame();

  if (state.crew.length === 0) {

    starterCrew();
  }

  renderAll();

  startLoops();

  processOfflineProgress();

  log("Empire online.");
});

/* =====================================
   ELEMENTS
===================================== */

function bindElements() {

  const ids = [

    "cash",
    "heat",
    "income",
    "xp",

    "crew-list",
    "targets",
    "log",

    "run-heist"

  ];

  ids.forEach(id => {

    el[id] =
      document.getElementById(id);
  });
}

/* =====================================
   STARTER CREW
===================================== */

function starterCrew() {

  for (let i = 0; i < 3; i++) {

    openRecruitChest(true);
  }
}

/* =====================================
   RENDER
===================================== */

function renderAll() {

  renderCurrency();
  renderCrew();
  renderTargets();
}

function renderCurrency() {

  if (el.cash) {

    el.cash.textContent =
      "$" + format(state.cash);
  }

  if (el.heat) {

    el.heat.textContent =
      Math.floor(state.heat) + "%";
  }

  if (el.income) {

    el.income.textContent =
      "$" + format(state.passiveIncome);
  }

  if (el.xp) {

    el.xp.textContent =
      format(state.xp);
  }
}

function renderCrew() {

  if (!el["crew-list"]) {
    return;
  }

  el["crew-list"].innerHTML = "";

  state.crew.forEach(member => {

    const card =
      document.createElement("div");

    card.className = "crew-card";

    card.innerHTML = `

      <div class="crew-top">

        <div>

          <div class="crew-name">
            ${member.name}
          </div>

          <div
            class="crew-role"
            style="color:${member.color}"
          >
            ${member.rarity}
          </div>

        </div>

        <div>
          ⭐ ${member.skill}
        </div>

      </div>

      <div class="crew-stats">

        <div class="mini-stat">
          <span>Role</span>
          <strong>${member.role}</strong>
        </div>

        <div class="mini-stat">
          <span>Morale</span>
          <strong>${member.morale}</strong>
        </div>

        <div class="mini-stat">
          <span>Loyalty</span>
          <strong>${member.loyalty}</strong>
        </div>

      </div>

    `;

    el["crew-list"].appendChild(card);
  });
}

function renderTargets() {

  if (!el.targets) {
    return;
  }

  el.targets.innerHTML = "";

  state.targets.forEach(target => {

    const div =
      document.createElement("div");

    div.className = "target-card";

    div.innerHTML = `

      <h3>${target.name}</h3>

      <div class="target-info">
        Reward: $${format(target.reward)}
      </div>

      <div class="target-info">
        Security: ${target.security}
      </div>

      <div class="target-info">
        Risk: ${target.risk}%
      </div>

    `;

    div.addEventListener("click", () => {

      state.selectedTarget =
        target.id;
    });

    el.targets.appendChild(div);
  });
}

/* =====================================
   CHEST SYSTEM
===================================== */

function openRecruitChest(free = false) {

  const cost = 1000;

  if (!free && state.cash < cost) {

    log("Need more cash.");
    return;
  }

  if (!free) {

    state.cash -= cost;
  }

  state.stats.openedCrates++;

  let rarity =
    rollRarity();

  const member =
    generateRecruit(rarity);

  state.crew.push(member);

  log(
    `${rarity.name} recruit acquired: ${member.name}`
  );

  toast(
    `${rarity.name} ${member.role}`
  );

  renderAll();
}

function rollRarity() {

  const boostedLuck =
    state.crateLuck *
    state.adMultiplier;

  let roll =
    Math.random() * 100;

  let adjusted =
    roll / boostedLuck;

  let cumulative = 0;

  for (const rarity of state.rarities) {

    cumulative += rarity.chance;

    if (adjusted <= cumulative) {

      return rarity;
    }
  }

  return state.rarities[0];
}

function generateRecruit(rarity) {

  const baseSkill =
    randomInt(40, 80);

  const multiplier =
    rarity.multiplier;

  return {

    name:
      NAMES[
        randomInt(0, NAMES.length - 1)
      ],

    role:
      ROLES[
        randomInt(0, ROLES.length - 1)
      ],

    rarity: rarity.name,

    color: rarity.color,

    skill:
      Math.floor(
        baseSkill * multiplier
      ),

    morale:
      randomInt(60, 100),

    loyalty:
      randomInt(50, 100)
  };
}

/* =====================================
   HEISTS
===================================== */

function startHeist() {

  if (state.heistRunning) {
    return;
  }

  const target =
    state.targets[state.selectedTarget];

  state.heistRunning = true;

  log(`Started ${target.name}`);

  setTimeout(() => {

    finishHeist(target);

  }, target.duration);
}

function finishHeist(target) {

  state.heistRunning = false;

  const chance =
    getSuccessChance(target);

  const roll =
    Math.random() * 100;

  const critChance =
    8 + state.research.cryptoAI * 2;

  const crit =
    Math.random() * 100 < critChance;

  if (roll <= chance) {

    let payout =
      target.reward *
      state.rewardMultiplier;

    if (crit) {

      payout *= 2.5;

      state.stats.critHeists++;

      log("CRITICAL HEIST!");
    }

    payout *=
      1 + state.combo * 0.05;

    payout =
      Math.floor(payout);

    state.cash += payout;

    state.totalEarned += payout;

    state.xp +=
      Math.floor(payout / 3);

    state.combo++;

    state.heat += target.risk;

    state.stats.successfulHeists++;

    if (Math.random() < 0.12) {

      state.gems += 1;

      toast("+1 Gem");
    }

    if (Math.random() < 0.08) {

      state.intel += 1;
    }

    if (Math.random() < 0.03) {

      state.influence += 1;
    }

    log(
      `SUCCESS +$${format(payout)}`
    );

    toast(
      `+$${format(payout)}`
    );

  } else {

    state.combo = 0;

    state.heat +=
      target.risk * 1.5;

    state.stats.failedHeists++;

    log("Heist failed.");
  }

  scaleGame();

  checkAchievements();

  renderAll();
}

/* =====================================
   SUCCESS FORMULA
===================================== */

function getSuccessChance(target) {

  if (state.crew.length === 0) {
    return 5;
  }

  const avgSkill =
    average(
      state.crew.map(c => c.skill)
    );

  let chance =

    avgSkill

    + state.hqLevel * 2

    + state.labLevel * 1.5

    + state.successBonus

    + state.research.stealthTech * 3

    - target.security

    - state.heat * 0.4;

  return clamp(chance, 5, 95);
}

/* =====================================
   RESEARCH LAB
===================================== */

function buyResearch(type) {

  const cost =
    (
      state.research[type] + 1
    ) * 5;

  if (state.intel < cost) {

    log("Not enough intel.");
    return;
  }

  state.intel -= cost;

  state.research[type]++;

  log(
    `${type} upgraded.`
  );
}

/* =====================================
   BUSINESSES
===================================== */

function upgradeBusiness(index) {

  const business =
    state.businesses[index];

  const cost =
    (
      business.level + 1
    ) * 1200;

  if (state.cash < cost) {

    return;
  }

  state.cash -= cost;

  business.level++;

  recalculatePassiveIncome();

  renderAll();
}

function recalculatePassiveIncome() {

  let total = 0;

  state.businesses.forEach(b => {

    total +=
      b.level *
      b.baseIncome;
  });

  total *=
    1 + state.prestige * 0.15;

  total *=
    1 + state.research.cryptoAI * 0.08;

  state.passiveIncome =
    Math.floor(total);
}

/* =====================================
   ADS
===================================== */

function watchAdForCash() {

  const reward =
    5000 *
    (
      1 + state.prestige
    );

  state.cash += reward;

  log(
    `Ad payout: $${format(reward)}`
  );

  toast(
    `+$${format(reward)}`
  );
}

function watchAdForLuck(multiplier) {

  state.adMultiplier =
    multiplier;

  state.adBoostTime =
    300;

  log(
    `${multiplier}x recruit luck active`
  );
}

/* =====================================
   PRESTIGE
===================================== */

function prestigeReset() {

  if (state.totalEarned < 500000) {

    log("Need more empire value.");
    return;
  }

  const reward =
    Math.floor(
      state.totalEarned / 500000
    );

  state.prestige += reward;

  state.cash = 2500;

  state.heat = 0;

  state.totalEarned = 0;

  state.hqLevel = 1;

  state.labLevel = 1;

  state.passiveIncome = 0;

  state.crew = [];

  state.businesses.forEach(b => {

    b.level = 0;
  });

  starterCrew();

  log(
    `Prestiged for ${reward} prestige.`
  );

  renderAll();
}

/* =====================================
   SCALE
===================================== */

function scaleGame() {

  state.targets.forEach(target => {

    target.reward *= 1.025;

    target.security += 0.5;

    target.risk += 0.08;
  });
}

/* =====================================
   ACHIEVEMENTS
===================================== */

function checkAchievements() {

  state.achievements.forEach(a => {

    if (
      !a.unlocked &&
      a.check()
    ) {

      a.unlocked = true;

      if (a.gemReward) {

        state.gems += a.reward;

      } else {

        state.cash += a.reward;
      }

      toast(a.title);

      log(
        `Achievement unlocked: ${a.title}`
      );
    }
  });
}

/* =====================================
   LOOPS
===================================== */

function startLoops() {

  setInterval(gameTick, 1000);

  setInterval(autoSave, 5000);

  setInterval(randomEvents, 25000);

  setInterval(adTimerTick, 1000);
}

function gameTick() {

  state.cash += state.passiveIncome;

  state.totalEarned +=
    state.passiveIncome;

  if (state.heat > 0) {

    state.heat -= 0.5;
  }

  state.heat =
    clamp(state.heat, 0, 100);

  renderCurrency();
}

function adTimerTick() {

  if (state.adBoostTime <= 0) {

    state.adMultiplier = 1;

    return;
  }

  state.adBoostTime--;
}

function randomEvents() {

  const roll =
    Math.random();

  if (roll < 0.25) {

    const cash =
      randomInt(2000, 12000);

    state.cash += cash;

    log(
      `Black market payout: $${cash}`
    );

  } else if (roll < 0.45) {

    state.heat += 12;

    log("Police raid wave.");

  } else if (roll < 0.60) {

    state.gems += 1;

    toast("+1 Gem");

  } else if (roll < 0.70) {

    openRecruitChest(true);
  }

  renderAll();
}

/* =====================================
   OFFLINE PROGRESS
===================================== */

function processOfflineProgress() {

  const now = Date.now();

  const diff =
    Math.floor(
      (
        now -
        state.offlineTimestamp
      ) / 1000
    );

  if (diff <= 5) {
    return;
  }

  const earnings =
    diff *
    state.passiveIncome;

  state.cash += earnings;

  toast(
    `Offline Earnings: $${format(earnings)}`
  );

  renderAll();
}

/* =====================================
   SAVE
===================================== */

function autoSave() {

  state.offlineTimestamp =
    Date.now();

  localStorage.setItem(
    "idleHeistEmpireSaveV2",
    JSON.stringify(state)
  );
}

function loadGame() {

  const save =
    localStorage.getItem(
      "idleHeistEmpireSaveV2"
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

/* =====================================
   UTIL
===================================== */

function average(arr) {

  return (
    arr.reduce((a, b) => a + b, 0)
    / arr.length
  );
}

function clamp(v, min, max) {

  return Math.max(
    min,
    Math.min(max, v)
  );
}

function randomInt(min, max) {

  return Math.floor(
    Math.random() *
    (max - min + 1)
  ) + min;
}

function format(num) {

  return Math.floor(num)
    .toLocaleString();
}

/* =====================================
   LOG
===================================== */

function log(msg) {

  if (!el.log) {
    return;
  }

  const div =
    document.createElement("div");

  div.className =
    "log-entry";

  div.textContent =
    `[${new Date().toLocaleTimeString()}] ${msg}`;

  el.log.prepend(div);

  while (
    el.log.children.length > 40
  ) {

    el.log.removeChild(
      el.log.lastChild
    );
  }
}

/* =====================================
   TOAST
===================================== */

function toast(text) {

  let container =
    document.getElementById(
      "toast-container"
    );

  if (!container) {

    container =
      document.createElement("div");

    container.id =
      "toast-container";

    document.body.appendChild(
      container
    );
  }

  const div =
    document.createElement("div");

  div.className = "toast";

  div.textContent = text;

  container.appendChild(div);

  setTimeout(() => {

    div.remove();

  }, 3000);
}