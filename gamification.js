(function () {
  const STORAGE_KEY = "learnpathGamificationV1";
  const WINDOW_STATE_PREFIX = "LEARNPATH_STATE:";
  const XP_PER_LEVEL = 250;
  const LEVEL_TITLES = [
    "Explorer",
    "Builder",
    "Code Captain",
    "Boss Coder",
    "Code Architect",
    "Tech Legend"
  ];

  const defaults = {
    xp: 340,
    weeklyXp: 180,
    semesterXp: 340,
    streak: 5,
    bestStreak: 8,
    lastActive: null,
    comebackAvailable: true,
    comebackClaimed: false,
    completedExercises: {},
    ratings: {},
    personalBests: {},
    celebrationQueue: [],
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
    const state = { ...defaults, ...newest };
    if (!Number.isFinite(newest.semesterXp)) state.semesterXp = state.xp;
    return state;
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
      title: LEVEL_TITLES[Math.min(number - 1, LEVEL_TITLES.length - 1)],
      currentXp: levelXp,
      requiredXp: XP_PER_LEVEL,
      progress: Math.round((levelXp / XP_PER_LEVEL) * 100)
    };
  }

  function queueLevelUp(state, previousLevel, nextLevel) {
    if (nextLevel.number <= previousLevel.number) return;
    state.celebrationQueue = Array.isArray(state.celebrationQueue) ? state.celebrationQueue : [];
    state.celebrationQueue.push({
      id: `level-up-${Date.now()}-${nextLevel.number}`,
      type: "level_up",
      previousLevel: previousLevel.number,
      previousTitle: previousLevel.title,
      level: nextLevel.number,
      title: nextLevel.title,
      createdAt: new Date().toISOString()
    });
  }

  function consumeCelebration() {
    const state = load();
    const event = state.celebrationQueue?.shift() || null;
    if (event) save(state);
    return event;
  }

  function getPlayerStatus(state = load()) {
    const level = getLevel(state.xp);
    const semester = getSemesterLeaderboard(state);
    return {
      level,
      totalXp: state.xp,
      semesterXp: state.semesterXp,
      semesterRank: semester.current.rank,
      semesterStudents: semester.totalStudents,
      streak: state.streak,
      xpToNextLevel: level.requiredXp - level.currentXp
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

  function getSemesterLeaderboard(state) {
    const classmates = [
      ["Aarav Mehta", 780, "CSE-A"],
      ["Maya Iyer", 735, "CSE-A"],
      ["Ishaan Gupta", 690, "CSE-B"],
      ["Ananya Rao", 655, "CSE-A"],
      ["Vivaan Shah", 620, "CSE-B"],
      ["Diya Nair", 590, "CSE-A"],
      ["Arjun Verma", 560, "CSE-B"],
      ["Sofia Khan", 525, "CSE-A"],
      ["Kabir Singh", 490, "CSE-B"],
      ["Meera Joshi", 455, "CSE-A"],
      ["Rohan Das", 425, "CSE-B"],
      ["Aisha Patel", 395, "CSE-A"],
      ["Neel Kapoor", 365, "CSE-B"],
      ["Tara Menon", 325, "CSE-A"],
      ["Aditya Bose", 295, "CSE-B"],
      ["Kiara Jain", 270, "CSE-A"],
      ["Reyansh Roy", 245, "CSE-B"],
      ["Sara Thomas", 220, "CSE-A"],
      ["Dev Malhotra", 195, "CSE-B"],
      ["Ira Kulkarni", 170, "CSE-A"],
      ["Yash Sethi", 150, "CSE-B"],
      ["Naina Bhat", 130, "CSE-A"],
      ["Om Prakash", 115, "CSE-B"],
      ["Riya Sen", 95, "CSE-A"],
      ["Manav Gill", 80, "CSE-B"],
      ["Zoya Ali", 65, "CSE-A"],
      ["Aryan Pillai", 50, "CSE-B"],
      ["Myra Dutta", 35, "CSE-A"],
      ["Veer Saxena", 20, "CSE-B"]
    ].map(([name, xp, section]) => ({ name, xp, section }));

    const ranked = [
      ...classmates,
      { name: "Rahul", xp: state.semesterXp, section: "CSE-A", current: true }
    ]
      .sort((a, b) => b.xp - a.xp || a.name.localeCompare(b.name))
      .map((student, index, all) => ({
        ...student,
        rank: index + 1,
        aheadPercent: Math.round(((all.length - index - 1) / all.length) * 100),
        topPercent: Math.max(1, Math.ceil(((index + 1) / all.length) * 100))
      }));

    return {
      cohortName: "BTech CSE 2026",
      semesterName: "Semester 1",
      totalStudents: ranked.length,
      students: ranked,
      current: ranked.find((student) => student.current)
    };
  }

  function completeExercise(id, result) {
    const state = load();
    const previousLevel = getLevel(state.xp);
    const previous = state.completedExercises[id];
    const stars = Math.max(1, Math.min(3, result.stars));
    const earnedXp = previous ? 0 : 100 + stars * 25;

    if (!previous) {
      state.xp += earnedXp;
      state.weeklyXp += earnedXp;
      state.semesterXp += earnedXp;
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

    const level = getLevel(state.xp);
    queueLevelUp(state, previousLevel, level);
    save(state);
    return {
      state,
      earnedXp,
      stars,
      level,
      previousLevel,
      leveledUp: level.number > previousLevel.number
    };
  }

  function claimComebackBonus() {
    const state = load();
    if (!state.comebackAvailable || state.comebackClaimed) return { state, earnedXp: 0 };
    const previousLevel = getLevel(state.xp);
    state.xp += 50;
    state.weeklyXp += 50;
    state.semesterXp += 50;
    state.comebackClaimed = true;
    state.comebackAvailable = false;
    const level = getLevel(state.xp);
    queueLevelUp(state, previousLevel, level);
    save(state);
    return {
      state,
      earnedXp: 50,
      level,
      previousLevel,
      leveledUp: level.number > previousLevel.number
    };
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
    getPlayerStatus,
    getLeague,
    getSemesterLeaderboard,
    completeExercise,
    claimComebackBonus,
    consumeCelebration,
    formatTime
  };
})();
