(function () {
  const STORAGE_KEY = "learnpathGamificationV1";
  const WINDOW_STATE_PREFIX = "LEARNPATH_STATE:";
  const XP_PER_LEVEL = 250;

  const defaults = {
    xp: 340,
    weeklyXp: 180,
    streak: 5,
    bestStreak: 8,
    lastActive: null,
    comebackAvailable: true,
    comebackClaimed: false,
    completedExercises: {},
    ratings: {},
    personalBests: {},
    updatedAt: 0
  };

  function load() {
    const candidates = [];
    try {
      candidates.push(JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"));
    } catch (error) {}
    try {
      if (window.name.startsWith(WINDOW_STATE_PREFIX)) {
        candidates.push(JSON.parse(window.name.slice(WINDOW_STATE_PREFIX.length)));
      }
    } catch (error) {}
    const newest = candidates.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))[0] || {};
    return { ...defaults, ...newest };
  }

  function save(state) {
    state.updatedAt = Date.now();
    const serialized = JSON.stringify(state);
    try {
      localStorage.setItem(STORAGE_KEY, serialized);
    } catch (error) {}
    window.name = WINDOW_STATE_PREFIX + serialized;
    window.dispatchEvent(new CustomEvent("learnpath:progress", { detail: state }));
    return state;
  }

  function dateKey(date) {
    return date.toISOString().slice(0, 10);
  }

  function dayDifference(from, to) {
    const start = new Date(from + "T00:00:00");
    const end = new Date(to + "T00:00:00");
    return Math.round((end - start) / 86400000);
  }

  function recordActivity(state) {
    const today = dateKey(new Date());
    if (!state.lastActive) {
      state.streak = Math.max(1, state.streak);
    } else {
      const gap = dayDifference(state.lastActive, today);
      if (gap === 1) state.streak += 1;
      if (gap > 1) state.streak = 1;
    }
    state.lastActive = today;
    state.bestStreak = Math.max(state.bestStreak, state.streak);
  }

  function getLevel(xp) {
    const number = Math.floor(xp / XP_PER_LEVEL) + 1;
    const levelXp = xp % XP_PER_LEVEL;
    return {
      number,
      title: ["Explorer", "Builder", "Creator", "Specialist", "Master"][Math.min(number - 1, 4)],
      currentXp: levelXp,
      requiredXp: XP_PER_LEVEL,
      progress: Math.round((levelXp / XP_PER_LEVEL) * 100)
    };
  }

  function getLeague(state) {
    const players = [
      { name: "Maya", xp: 420 },
      { name: "Arjun", xp: 315 },
      { name: "Sofia", xp: 245 },
      { name: "Rahul", xp: state.weeklyXp, current: true },
      { name: "Noah", xp: 130 }
    ].sort((a, b) => b.xp - a.xp);
    return players.map((player, index) => ({ ...player, rank: index + 1 }));
  }

  function completeExercise(id, result) {
    const state = load();
    const previous = state.completedExercises[id];
    const stars = Math.max(1, Math.min(3, result.stars));
    const earnedXp = previous ? 0 : 100 + stars * 25;

    if (!previous) {
      state.xp += earnedXp;
      state.weeklyXp += earnedXp;
      recordActivity(state);
    }

    state.completedExercises[id] = {
      completed: true,
      completedAt: new Date().toISOString(),
      stars: Math.max(previous?.stars || 0, stars)
    };
    state.ratings[id] = Math.max(state.ratings[id] || 0, stars);

    const best = state.personalBests[id] || {};
    state.personalBests[id] = {
      fastestSeconds: best.fastestSeconds
        ? Math.min(best.fastestSeconds, result.seconds)
        : result.seconds,
      fewestHints: Number.isFinite(best.fewestHints)
        ? Math.min(best.fewestHints, result.hints)
        : result.hints,
      fewestMistakes: Number.isFinite(best.fewestMistakes)
        ? Math.min(best.fewestMistakes, result.mistakes)
        : result.mistakes,
      stars: Math.max(best.stars || 0, stars)
    };

    save(state);
    return { state, earnedXp, stars, level: getLevel(state.xp) };
  }

  function claimComebackBonus() {
    const state = load();
    if (!state.comebackAvailable || state.comebackClaimed) return { state, earnedXp: 0 };
    state.xp += 50;
    state.weeklyXp += 50;
    state.comebackClaimed = true;
    state.comebackAvailable = false;
    save(state);
    return { state, earnedXp: 50 };
  }

  function formatTime(seconds) {
    if (!Number.isFinite(seconds)) return "--";
    const minutes = Math.floor(seconds / 60);
    const remaining = seconds % 60;
    return minutes ? `${minutes}m ${remaining}s` : `${remaining}s`;
  }

  window.LearnPathGame = {
    load,
    save,
    getLevel,
    getLeague,
    completeExercise,
    claimComebackBonus,
    formatTime
  };
})();
