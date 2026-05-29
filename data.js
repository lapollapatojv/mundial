// data.js - Manejo del Estado y Persistencia en LocalStorage

const INITIAL_GROUPS = [];

const GROUPS_CONFIG = {
  "Grupo A": {
    teams: ["México", "Sudáfrica", "Corea del Sur", "Ucrania"],
    emojis: ["🇲🇽", "🇿🇦", "🇰🇷", "🇺🇦"],
    codes: ["mx", "za", "kr", "ua"],
    stadiums: ["Estadio Azteca", "Estadio Guadalajara", "Estadio Monterrey"]
  },
  "Grupo B": {
    teams: ["Canadá", "Gales", "Catar", "Suiza"],
    emojis: ["🇨🇦", "🏴\u{e0067}\u{e0062}\u{e0077}\u{e006c}\u{e0073}\u{e007f}", "🇶🇦", "🇨🇭"],
    codes: ["ca", "gb-wls", "qa", "ch"],
    stadiums: ["Estadio Toronto", "Estadio Vancouver", "Estadio Seattle"]
  },
  "Grupo C": {
    teams: ["Brasil", "Marruecos", "Haití", "Escocia"],
    emojis: ["🇧🇷", "🇲🇦", "🇭🇹", "🏴\u{e0067}\u{e0062}\u{e0073}\u{e0063}\u{e0074}\u{e007f}"],
    codes: ["br", "ma", "ht", "gb-sct"],
    stadiums: ["Estadio NY/NJ", "Estadio Boston", "Estadio Philadelphia"]
  },
  "Grupo D": {
    teams: ["Estados Unidos", "Paraguay", "Australia", "Suecia"],
    emojis: ["🇺🇸", "🇵🇾", "🇦🇺", "🇸🇪"],
    codes: ["us", "py", "au", "se"],
    stadiums: ["Estadio Los Ángeles", "Estadio San Francisco", "Estadio Seattle"]
  },
  "Grupo E": {
    teams: ["Alemania", "Curazao", "Costa de Marfil", "Ecuador"],
    emojis: ["🇩🇪", "🇨🇼", "🇨🇮", "🇪🇨"],
    codes: ["de", "cw", "ci", "ec"],
    stadiums: ["Estadio Houston", "Estadio Dallas", "Estadio Kansas City"]
  },
  "Grupo F": {
    teams: ["Países Bajos", "Japón", "Polonia", "Túnez"],
    emojis: ["🇳🇱", "🇯🇵", "🇵🇱", "🇹🇳"],
    codes: ["nl", "jp", "pl", "tn"],
    stadiums: ["Estadio Atlanta", "Estadio Miami", "Estadio Orlando"]
  },
  "Grupo G": {
    teams: ["Bélgica", "Egipto", "Irán", "Nueva Zelanda"],
    emojis: ["🇧🇪", "🇪🇬", "🇮🇷", "🇳🇿"],
    codes: ["be", "eg", "ir", "nz"],
    stadiums: ["Estadio Vancouver", "Estadio Toronto", "Estadio Boston"]
  },
  "Grupo H": {
    teams: ["España", "Cabo Verde", "Arabia Saudita", "Uruguay"],
    emojis: ["🇪🇸", "🇨🇻", "🇸🇦", "🇺🇾"],
    codes: ["es", "cv", "sa", "uy"],
    stadiums: ["Estadio Dallas", "Estadio Houston", "Estadio Monterrey"]
  },
  "Grupo I": {
    teams: ["Francia", "Senegal", "Perú", "Noruega"],
    emojis: ["🇫🇷", "🇸🇳", "🇵🇪", "🇳🇴"],
    codes: ["fr", "sn", "pe", "no"],
    stadiums: ["Estadio NY/NJ", "Estadio Philadelphia", "Estadio Atlanta"]
  },
  "Grupo J": {
    teams: ["Argentina", "Argelia", "Austria", "Jordania"],
    emojis: ["🇦🇷", "🇩🇿", "🇦🇹", "🇯🇴"],
    codes: ["ar", "dz", "at", "jo"],
    stadiums: ["Estadio Miami", "Estadio Orlando", "Estadio Kansas City"]
  },
  "Grupo K": {
    teams: ["Portugal", "Costa Rica", "Uzbekistán", "Colombia"],
    emojis: ["🇵🇹", "🇨🇷", "🇺🇿", "🇨🇴"],
    codes: ["pt", "cr", "uz", "co"],
    stadiums: ["Estadio Los Ángeles", "Estadio San Francisco", "Estadio Guadalajara"]
  },
  "Grupo L": {
    teams: ["Inglaterra", "Croacia", "Ghana", "Panamá"],
    emojis: ["🏴\u{e0067}\u{e0062}\u{e0065}\u{e006e}\u{e0067}\u{e007f}", "🇭🇷", "🇬🇭", "🇵🇦"],
    codes: ["gb-eng", "hr", "gh", "pa"],
    stadiums: ["Estadio Azteca", "Estadio Monterrey", "Estadio Dallas"]
  }
};

const INITIAL_MATCHES = [];
let matchIdCounter = 1;

// Generar partidos de Fase de Grupos (6 partidos por grupo * 12 grupos = 72 partidos)
const groupNames = Object.keys(GROUPS_CONFIG);
groupNames.forEach((gName) => {
  const g = GROUPS_CONFIG[gName];
  const matchups = [
    [0, 1], [2, 3], // Jornada 1
    [0, 2], [1, 3], // Jornada 2
    [0, 3], [1, 2]  // Jornada 3
  ];

  matchups.forEach((pair, matchIdx) => {
    const idxA = pair[0];
    const idxB = pair[1];
    
    const day = 11 + groupNames.indexOf(gName) + Math.floor(matchIdx / 2);
    const hour = matchIdx % 2 === 0 ? "15:00" : "20:00";
    const stadium = g.stadiums[matchIdx % g.stadiums.length];
    const dayStr = String(day).padStart(2, '0');

    INITIAL_MATCHES.push({
      id: "m" + matchIdCounter++,
      stage: "Fase de Grupos",
      group: gName,
      date: `Junio ${day} - ${hour} GMT-4 (${stadium})`,
      isoDate: `2026-06-${dayStr}T${hour}:00-04:00`,
      teamA: g.teams[idxA],
      teamB: g.teams[idxB],
      emojiA: g.emojis[idxA],
      emojiB: g.emojis[idxB],
      codeA: g.codes[idxA],
      codeB: g.codes[idxB],
      scoreA: null,
      scoreB: null,
      status: "pendiente"
    });
  });
});

// Dieciseisavos de Final (16 partidos, m73 a m88)
for (let i = 1; i <= 16; i++) {
  const day = 28 + Math.floor((i-1)/4);
  const dayStr = String(day).padStart(2, '0');
  INITIAL_MATCHES.push({
    id: "m" + matchIdCounter++,
    stage: "Dieciseisavos de Final",
    group: null,
    date: `Junio ${day} - 18:00 GMT-4`,
    isoDate: `2026-06-${dayStr}T18:00:00-04:00`,
    teamA: `Ganador Llave ${2*i - 1}`,
    teamB: `Segundo Llave ${2*i}`,
    emojiA: "🏆",
    emojiB: "🏆",
    codeA: null,
    codeB: null,
    scoreA: null,
    scoreB: null,
    status: "pendiente"
  });
}

// Octavos de Final (8 partidos, m89 a m96)
for (let i = 1; i <= 8; i++) {
  const day = 4 + Math.floor((i-1)/2);
  const dayStr = String(day).padStart(2, '0');
  INITIAL_MATCHES.push({
    id: "m" + matchIdCounter++,
    stage: "Octavos de Final",
    group: null,
    date: `Julio ${day} - 16:00 GMT-4`,
    isoDate: `2026-07-${dayStr}T16:00:00-04:00`,
    teamA: `Ganador Dieciseisavos ${2*i - 1}`,
    teamB: `Ganador Dieciseisavos ${2*i}`,
    emojiA: "🏆",
    emojiB: "🏆",
    codeA: null,
    codeB: null,
    scoreA: null,
    scoreB: null,
    status: "pendiente"
  });
}

// Cuartos de Final (4 partidos, m97 a m100)
for (let i = 1; i <= 4; i++) {
  const day = 9 + Math.floor((i-1)/2);
  const dayStr = String(day).padStart(2, '0');
  INITIAL_MATCHES.push({
    id: "m" + matchIdCounter++,
    stage: "Cuartos de Final",
    group: null,
    date: `Julio ${day} - 17:00 GMT-4`,
    isoDate: `2026-07-${dayStr}T17:00:00-04:00`,
    teamA: `Ganador Octavos ${2*i - 1}`,
    teamB: `Ganador Octavos ${2*i}`,
    emojiA: "🏆",
    emojiB: "🏆",
    codeA: null,
    codeB: null,
    scoreA: null,
    scoreB: null,
    status: "pendiente"
  });
}

// Semifinales (2 partidos, m101 y m102)
INITIAL_MATCHES.push({
  id: "m" + matchIdCounter++,
  stage: "Semifinal",
  group: null,
  date: "Julio 14 - 19:00 GMT-4 (Estadio Dallas)",
  isoDate: "2026-07-14T19:00:00-04:00",
  teamA: "Ganador Cuartos 1",
  teamB: "Ganador Cuartos 2",
  emojiA: "🏆",
  emojiB: "🏆",
  codeA: null,
  codeB: null,
  scoreA: null,
  scoreB: null,
  status: "pendiente"
});
INITIAL_MATCHES.push({
  id: "m" + matchIdCounter++,
  stage: "Semifinal",
  group: null,
  date: "Julio 15 - 19:00 GMT-4 (Estadio Atlanta)",
  isoDate: "2026-07-15T19:00:00-04:00",
  teamA: "Ganador Cuartos 3",
  teamB: "Ganador Cuartos 4",
  emojiA: "🏆",
  emojiB: "🏆",
  codeA: null,
  codeB: null,
  scoreA: null,
  scoreB: null,
  status: "pendiente"
});

// Tercer Puesto (m103)
INITIAL_MATCHES.push({
  id: "m" + matchIdCounter++,
  stage: "Tercer Puesto",
  group: null,
  date: "Julio 18 - 15:00 GMT-4 (Estadio Miami)",
  isoDate: "2026-07-18T15:00:00-04:00",
  teamA: "Perdedor Semifinal 1",
  teamB: "Perdedor Semifinal 2",
  emojiA: "🥉",
  emojiB: "🥉",
  codeA: null,
  codeB: null,
  scoreA: null,
  scoreB: null,
  status: "pendiente"
});

// Gran Final (m104)
INITIAL_MATCHES.push({
  id: "m" + matchIdCounter++,
  stage: "Gran Final",
  group: null,
  date: "Julio 19 - 15:00 GMT-4 (Estadio NY/NJ)",
  isoDate: "2026-07-19T15:00:00-04:00",
  teamA: "Ganador Semifinal 1",
  teamB: "Ganador Semifinal 2",
  emojiA: "👑",
  emojiB: "👑",
  codeA: null,
  codeB: null,
  scoreA: null,
  scoreB: null,
  status: "pendiente"
});

// Usuarios por defecto para simular competencia
const INITIAL_USERS = [
  { email: "lapollapatojv@gmail.com", nickname: "Organizador (Admin)", groupIds: [], password: "Jambalaya.4910519" }
];

// Pronósticos por defecto para los usuarios de prueba (Empezamos limpios)
const INITIAL_PREDICTIONS = {};

const SUPABASE_URL = "https://njkcspemwzxoodrkgcsv.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qa2NzcGVtd3p4b29kcmtnY3N2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5ODA1MTgsImV4cCI6MjA5NTU1NjUxOH0.9XdQFx632V1Ahx3gK30XDkzuLwTZr7haVMLNJQpgk88";

let supabaseClient = null;

const isSupabaseConfigured = () => {
  return typeof supabase !== 'undefined' && 
         SUPABASE_URL && 
         SUPABASE_URL !== "YOUR_SUPABASE_URL_HERE" && 
         SUPABASE_ANON_KEY && 
         SUPABASE_ANON_KEY !== "YOUR_SUPABASE_ANON_KEY_HERE";
};

function getSupabaseClient() {
  if (!supabaseClient && isSupabaseConfigured()) {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return supabaseClient;
}

// Sincronizar el estado en memoria y LocalStorage con la base de datos de Supabase en la nube
async function syncStateFromSupabase() {
  const client = getSupabaseClient();
  if (!client) {
    console.log("ℹ️ Supabase no está configurado o no se ha cargado la SDK. Usando LocalStorage local.");
    return;
  }

  try {
    // 1. Obtener grupos
    const { data: dbGroups, error: errGroups } = await client.from('groups').select('*');
    if (errGroups) throw errGroups;

    // 2. Obtener usuarios
    const { data: dbUsers, error: errUsers } = await client.from('users').select('*');
    if (errUsers) throw errUsers;

    // 3. Obtener relación de grupos de usuarios
    const { data: dbUserGroups, error: errUserGroups } = await client.from('user_groups').select('*');
    if (errUserGroups) throw errUserGroups;

    // 4. Obtener pronósticos
    const { data: dbPredictions, error: errPredictions } = await client.from('predictions').select('*');
    if (errPredictions) throw errPredictions;

    // 5. Obtener marcadores de partidos
    const { data: dbMatches, error: errMatches } = await client.from('matches').select('*');
    if (errMatches) throw errMatches;

    // Obtener estado actual
    const state = getAppState();

    // Sincronizar grupos
    if (dbGroups && dbGroups.length > 0) {
      state.groups = dbGroups.map(g => ({
        id: g.id,
        name: g.name,
        entryFee: parseFloat(g.entry_fee) || 0,
        creator: g.creator
      }));
    }

    // Sincronizar usuarios
    if (dbUsers) {
      state.users = dbUsers.map(u => {
        const groupIds = dbUserGroups 
          ? dbUserGroups.filter(ug => ug.email === u.email).map(ug => ug.group_id) 
          : [];
        return {
          email: u.email,
          nickname: u.nickname,
          password: u.password || "",
          groupIds: groupIds
        };
      });

      // Asegurar que el admin siempre exista en memoria y participe en todos los grupos
      let admin = state.users.find(u => u.email === "lapollapatojv@gmail.com");
      if (!admin) {
        admin = {
          email: "lapollapatojv@gmail.com",
          nickname: "Organizador (Admin)",
          password: "Jambalaya.4910519",
          groupIds: []
        };
        state.users.push(admin);
      }
      state.groups.forEach(g => {
        if (!admin.groupIds.includes(g.id)) {
          admin.groupIds.push(g.id);
        }
      });
    }

    // Sincronizar pronósticos
    if (dbPredictions) {
      state.predictions = {};
      dbPredictions.forEach(p => {
        if (!state.predictions[p.email]) {
          state.predictions[p.email] = {};
        }
        state.predictions[p.email][p.match_id] = {
          predA: p.pred_a,
          predB: p.pred_b
        };
      });
    }

    // Sincronizar partidos
    if (dbMatches) {
      state.matches.forEach(m => {
        const dbM = dbMatches.find(x => x.id === m.id);
        if (dbM) {
          m.scoreA = dbM.score_a;
          m.scoreB = dbM.score_b;
          m.status = dbM.status;
        }
      });

      // Recalcular finalistas en cadena
      const m11 = state.matches.find(m => m.id === "m11");
      const m12 = state.matches.find(m => m.id === "m12");
      if (m11 && m11.status === "jugado") {
        updateFinalists(state, "m11", m11);
      }
      if (m12 && m12.status === "jugado") {
        updateFinalists(state, "m12", m12);
      }
    }

    saveAppState(state);
    console.log("☁️ Sincronización exitosa con Supabase completada.");
  } catch (e) {
    console.error("❌ Error de comunicación con Supabase:", e.message);
  }
}

const DB_VERSION = 10; // Incrementada a versión 10 para asegurar que el admin sea participante en todos los grupos
const STORAGE_KEY = "la_polla_mundialista_state";
const VERSION_KEY = "la_polla_mundialista_db_version";

// Inicializa el estado si no existe en localStorage o si la versión es antigua
function getAppState() {
  let state = localStorage.getItem(STORAGE_KEY);
  let version = localStorage.getItem(VERSION_KEY);
  let parsedState = null;
  
  if (state && version && parseInt(version) === DB_VERSION) {
    parsedState = JSON.parse(state);
  } else {
    // Si la versión es antigua o no existe, borrar todo y forzar reinicio
    localStorage.removeItem(STORAGE_KEY);
    parsedState = null;
  }

  if (!parsedState) {
    const defaultState = {
      groups: INITIAL_GROUPS,
      matches: INITIAL_MATCHES,
      users: INITIAL_USERS,
      predictions: INITIAL_PREDICTIONS
    };
    saveAppState(defaultState);
    localStorage.setItem(VERSION_KEY, DB_VERSION.toString());
    parsedState = defaultState;
  }

  // Asegurar que el administrador siempre exista y esté registrado en todos los grupos existentes
  let admin = parsedState.users.find(u => u.email === "lapollapatojv@gmail.com");
  if (!admin) {
    admin = {
      email: "lapollapatojv@gmail.com",
      nickname: "Organizador (Admin)",
      password: "Jambalaya.4910519",
      groupIds: []
    };
    parsedState.users.push(admin);
  }
  parsedState.groups.forEach(g => {
    if (!admin.groupIds.includes(g.id)) {
      admin.groupIds.push(g.id);
    }
  });

  return parsedState;
}

function saveAppState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// Registro / Inicio de sesión de un usuario
async function authenticateUser(email, nickname, groupId, password) {
  const state = getAppState();
  email = email.trim().toLowerCase();
  nickname = nickname.trim();
  const pass = (password || "").trim();

  let user = state.users.find(u => u.email === email);

  if (!user) {
    // Si no existe, crear usuario nuevo y asignarlo al grupo seleccionado con su contraseña
    user = {
      email: email,
      nickname: nickname || email.split("@")[0],
      password: pass,
      groupIds: [groupId]
    };
    state.users.push(user);
  } else {
    // Si el usuario existe pero la contraseña no coincide, lanzar error
    if (user.password && pass && user.password !== pass) {
      throw new Error("Contraseña incorrecta para este usuario.");
    }
    // Si no tiene contraseña guardada, asignarla
    if (!user.password) {
      user.password = pass;
    }
    // Si el usuario existe pero no está en este grupo, agregarlo
    if (!user.groupIds.includes(groupId)) {
      user.groupIds.push(groupId);
    }
    // Si provee un nickname nuevo, actualizarlo
    if (nickname) {
      user.nickname = nickname;
    }
  }

  saveAppState(state);

  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('users').upsert({
        email: email,
        nickname: user.nickname,
        password: user.password
      });
      await client.from('user_groups').upsert({
        email: email,
        group_id: groupId
      });
    } catch (e) {
      console.error("❌ Error al guardar usuario en Supabase:", e.message);
    }
  }

  return user;
}

// Crear un nuevo grupo
async function createGroup(name, entryFee, creatorEmail) {
  const state = getAppState();
  const newId = "g_" + Date.now();
  const newGroup = {
    id: newId,
    name: name.trim(),
    entryFee: parseFloat(entryFee) || 0,
    creator: creatorEmail
  };
  state.groups.push(newGroup);
  
  // Agregar creador al grupo automáticamente
  const user = state.users.find(u => u.email === creatorEmail);
  if (user && !user.groupIds.includes(newId)) {
    user.groupIds.push(newId);
  }

  // Asegurar que el admin (lapollapatojv@gmail.com) también participe en el grupo
  const admin = state.users.find(u => u.email === "lapollapatojv@gmail.com");
  if (admin && !admin.groupIds.includes(newId)) {
    admin.groupIds.push(newId);
  }

  saveAppState(state);

  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('groups').insert({
        id: newId,
        name: newGroup.name,
        entry_fee: newGroup.entryFee,
        creator: creatorEmail
      });
      await client.from('user_groups').upsert({
        email: creatorEmail,
        group_id: newId
      });
      // Asegurar registro de user_groups en Supabase para el admin si no es el creador
      if (creatorEmail !== "lapollapatojv@gmail.com") {
        await client.from('user_groups').upsert({
          email: "lapollapatojv@gmail.com",
          group_id: newId
        });
      }
    } catch (e) {
      console.error("❌ Error al crear grupo en Supabase:", e.message);
    }
  }

  return newGroup;
}

// Guardar o actualizar un pronóstico de un usuario
async function saveUserPrediction(email, matchId, predA, predB) {
  const state = getAppState();
  email = email.trim().toLowerCase();

  if (!state.predictions[email]) {
    state.predictions[email] = {};
  }

  const pA = predA === null || isNaN(parseInt(predA)) ? null : parseInt(predA);
  const pB = predB === null || isNaN(parseInt(predB)) ? null : parseInt(predB);

  state.predictions[email][matchId] = {
    predA: pA,
    predB: pB
  };

  saveAppState(state);

  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('predictions').upsert({
        email: email,
        match_id: matchId,
        pred_a: pA,
        pred_b: pB,
        updated_at: new Date().toISOString()
      });
    } catch (e) {
      console.error("❌ Error al guardar pronóstico en Supabase:", e.message);
    }
  }
}

// Actualizar el resultado real de un partido (Acción de Admin)
async function updateMatchResult(matchId, scoreA, scoreB) {
  const state = getAppState();
  const match = state.matches.find(m => m.id === matchId);
  if (match) {
    let sA = null;
    let sB = null;
    let status = "pendiente";

    if (scoreA === null || scoreB === null || scoreA === "" || scoreB === "") {
      match.scoreA = null;
      match.scoreB = null;
      match.status = "pendiente";
    } else {
      sA = parseInt(scoreA);
      sB = parseInt(scoreB);
      status = "jugado";

      match.scoreA = sA;
      match.scoreB = sB;
      match.status = status;

      // Si es una semifinal, actualizar los equipos de la final de forma simulada
      if (matchId === "m11" || matchId === "m12") {
        updateFinalists(state, matchId, match);
      }
    }
    saveAppState(state);

    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('matches').upsert({
          id: matchId,
          score_a: sA,
          score_b: sB,
          status: status
        });
      } catch (e) {
        console.error("❌ Error al guardar resultado en Supabase:", e.message);
      }
    }
  }
}

// Función auxiliar para actualizar los finalistas al simular resultados
function updateFinalists(state, matchId, finishedMatch) {
  const winner = finishedMatch.scoreA > finishedMatch.scoreB 
    ? { name: finishedMatch.teamA, emoji: finishedMatch.emojiA, code: finishedMatch.codeA }
    : (finishedMatch.scoreA < finishedMatch.scoreB 
       ? { name: finishedMatch.teamB, emoji: finishedMatch.emojiB, code: finishedMatch.codeB }
       : { name: finishedMatch.teamA + " (Pen)", emoji: finishedMatch.emojiA, code: finishedMatch.codeA }); // Simplificación de penales
  
  const finalMatch = state.matches.find(m => m.id === "m13");
  if (finalMatch) {
    if (matchId === "m11") {
      finalMatch.teamA = winner.name;
      finalMatch.emojiA = winner.emoji;
      finalMatch.codeA = winner.code;
    } else if (matchId === "m12") {
      finalMatch.teamB = winner.name;
      finalMatch.emojiB = winner.emoji;
      finalMatch.codeB = winner.code;
    }
  }
}

// Calcular puntos obtenidos por un pronóstico vs resultado real
function calculatePredictionPoints(predA, predB, realA, realB) {
  if (predA === null || predB === null || realA === null || realB === null) {
    return 0;
  }

  // Acierto exacto de goles
  if (predA === realA && predB === realB) {
    return 3;
  }

  // Acierto de tendencia (Ganador o Empate)
  const predTrend = Math.sign(predA - predB);
  const realTrend = Math.sign(realA - realB);

  if (predTrend === realTrend) {
    return 1;
  }

  return 0;
}

// Obtener tabla de clasificación (Leaderboard) para un grupo
function getGroupLeaderboard(groupId) {
  const state = getAppState();
  const group = state.groups.find(g => g.id === groupId);
  if (!group) return [];

  // Obtener los usuarios en este grupo
  const groupUsers = state.users.filter(u => u.groupIds.includes(groupId));

  // Calcular puntos para cada usuario
  const leaderboard = groupUsers.map(user => {
    let totalPoints = 0;
    let exactMatches = 0;
    let trendMatches = 0;
    const userPreds = state.predictions[user.email] || {};

    state.matches.forEach(match => {
      if (match.status === "jugado") {
        const pred = userPreds[match.id];
        if (pred) {
          const points = calculatePredictionPoints(pred.predA, pred.predB, match.scoreA, match.scoreB);
          totalPoints += points;
          if (points === 3) exactMatches++;
          if (points === 1) trendMatches++;
        }
      }
    });

    return {
      email: user.email,
      nickname: user.nickname,
      points: totalPoints,
      exact: exactMatches,
      trend: trendMatches
    };
  });

  // Ordenar por puntos desc, luego aciertos exactos desc, luego nickname alf.
  return leaderboard.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.exact !== a.exact) return b.exact - a.exact;
    return a.nickname.localeCompare(b.nickname);
  });
}

// Obtener detalles del bote acumulado del grupo
function getGroupPotDetails(groupId) {
  const state = getAppState();
  const group = state.groups.find(g => g.id === groupId);
  if (!group) return { totalPot: 0, membersCount: 0, entryFee: 0 };

  const membersCount = state.users.filter(u => u.groupIds.includes(groupId)).length;
  const totalPot = membersCount * group.entryFee;

  return {
    totalPot: totalPot,
    membersCount: membersCount,
    entryFee: group.entryFee
  };
}

// Modificar nombre y cuota de un grupo existente
async function updateGroup(groupId, newName, newFee) {
  const state = getAppState();
  const group = state.groups.find(g => g.id === groupId);
  if (group) {
    group.name = newName.trim();
    group.entryFee = parseFloat(newFee) || 0;
    saveAppState(state);

    const client = getSupabaseClient();
    if (client) {
      try {
        const { error } = await client.from('groups').update({
          name: group.name,
          entry_fee: group.entryFee
        }).eq('id', groupId);
        if (error) throw error;
      } catch (e) {
        console.error("❌ Error al actualizar grupo en Supabase:", e.message);
      }
    }
  }
}

// Eliminar grupo de juego por ID
async function deleteGroup(groupId) {
  const state = getAppState();
  
  // 1. Eliminar grupo de la lista
  state.groups = state.groups.filter(g => g.id !== groupId);

  // 2. Limpiar asociaciones de usuarios
  state.users.forEach(user => {
    if (user.groupIds) {
      user.groupIds = user.groupIds.filter(id => id !== groupId);
    }
  });

  saveAppState(state);

  const client = getSupabaseClient();
  if (client) {
    try {
      const { error } = await client.from('groups').delete().eq('id', groupId);
      if (error) throw error;
    } catch (e) {
      console.error("❌ Error al eliminar grupo en Supabase:", e.message);
    }
  }
}
