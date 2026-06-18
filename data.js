// data.js - Manejo del Estado y Persistencia en LocalStorage

const INITIAL_GROUPS = [];

const GROUPS_CONFIG = {
  "Grupo A": {
    teams: ["México", "Sudáfrica", "Corea del Sur", "República Checa"],
    emojis: ["🇲🇽", "🇿🇦", "🇰🇷", "🇨🇿"],
    codes: ["mx", "za", "kr", "cz"],
    stadiums: ["Estadio Azteca", "Estadio Guadalajara", "Estadio Monterrey"]
  },
  "Grupo B": {
    teams: ["Canadá", "Bosnia y Herzegovina", "Catar", "Suiza"],
    emojis: ["🇨🇦", "🇧🇦", "🇶🇦", "🇨🇭"],
    codes: ["ca", "ba", "qa", "ch"],
    stadiums: ["Estadio Toronto", "Estadio Vancouver", "Estadio Seattle"]
  },
  "Grupo C": {
    teams: ["Brasil", "Marruecos", "Haití", "Escocia"],
    emojis: ["🇧🇷", "🇲🇦", "🇭🇹", "🏴\u{e0067}\u{e0062}\u{e0073}\u{e0063}\u{e0074}\u{e007f}"],
    codes: ["br", "ma", "ht", "gb-sct"],
    stadiums: ["Estadio NY/NJ", "Estadio Boston", "Estadio Philadelphia"]
  },
  "Grupo D": {
    teams: ["Estados Unidos", "Paraguay", "Australia", "Turquía"],
    emojis: ["🇺🇸", "🇵🇾", "🇦🇺", "🇹🇷"],
    codes: ["us", "py", "au", "tr"],
    stadiums: ["Estadio Los Ángeles", "Estadio San Francisco", "Estadio Seattle"]
  },
  "Grupo E": {
    teams: ["Alemania", "Curazao", "Costa de Marfil", "Ecuador"],
    emojis: ["🇩🇪", "🇨🇼", "🇨🇮", "🇪🇨"],
    codes: ["de", "cw", "ci", "ec"],
    stadiums: ["Estadio Houston", "Estadio Dallas", "Estadio Kansas City"]
  },
  "Grupo F": {
    teams: ["Países Bajos", "Japón", "Suecia", "Túnez"],
    emojis: ["🇳🇱", "🇯🇵", "🇸🇪", "🇹🇳"],
    codes: ["nl", "jp", "se", "tn"],
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
    teams: ["Francia", "Senegal", "Irak", "Noruega"],
    emojis: ["🇫🇷", "🇸🇳", "🇮🇶", "🇳🇴"],
    codes: ["fr", "sn", "iq", "no"],
    stadiums: ["Estadio NY/NJ", "Estadio Philadelphia", "Estadio Atlanta"]
  },
  "Grupo J": {
    teams: ["Argentina", "Argelia", "Austria", "Jordania"],
    emojis: ["🇦🇷", "🇩🇿", "🇦🇹", "🇯🇴"],
    codes: ["ar", "dz", "at", "jo"],
    stadiums: ["Estadio Miami", "Estadio Orlando", "Estadio Kansas City"]
  },
  "Grupo K": {
    teams: ["Portugal", "R. D. Congo", "Uzbekistán", "Colombia"],
    emojis: ["🇵🇹", "🇨🇩", "🇺🇿", "🇨🇴"],
    codes: ["pt", "cd", "uz", "co"],
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

// Definir el cronograma oficial de partidos del mundial (GMT-4 / Bolivia)
const OFFICIAL_FIXTURE_SCHEDULE = {};
const rawSchedule = [
  { t1: "México", t2: "Sudáfrica", day: 11, hour: "15:00" },
  { t1: "Corea del Sur", t2: "República Checa", day: 11, hour: "22:00" },
  { t1: "Canadá", t2: "Bosnia y Herzegovina", day: 12, hour: "15:00" },
  { t1: "Estados Unidos", t2: "Paraguay", day: 12, hour: "21:00" },
  { t1: "Catar", t2: "Suiza", day: 13, hour: "15:00" },
  { t1: "Brasil", t2: "Marruecos", day: 13, hour: "18:00" },
  { t1: "Haití", t2: "Escocia", day: 13, hour: "21:00" },
  { t1: "Australia", t2: "Turquía", day: 14, hour: "00:00" },
  { t1: "Alemania", t2: "Curazao", day: 14, hour: "13:00" },
  { t1: "Países Bajos", t2: "Japón", day: 14, hour: "16:00" },
  { t1: "Costa de Marfil", t2: "Ecuador", day: 14, hour: "19:00" },
  { t1: "Suecia", t2: "Túnez", day: 14, hour: "22:00" },
  { t1: "España", t2: "Cabo Verde", day: 15, hour: "12:00" },
  { t1: "Bélgica", t2: "Egipto", day: 15, hour: "15:00" },
  { t1: "Arabia Saudita", t2: "Uruguay", day: 15, hour: "18:00" },
  { t1: "Irán", t2: "Nueva Zelanda", day: 15, hour: "21:00" },
  { t1: "Francia", t2: "Senegal", day: 16, hour: "15:00" },
  { t1: "Irak", t2: "Noruega", day: 16, hour: "18:00" },
  { t1: "Argentina", t2: "Argelia", day: 16, hour: "21:00" },
  { t1: "Austria", t2: "Jordania", day: 17, hour: "00:00" },
  { t1: "Portugal", t2: "R. D. Congo", day: 17, hour: "13:00" },
  { t1: "Inglaterra", t2: "Croacia", day: 17, hour: "16:00" },
  { t1: "Ghana", t2: "Panamá", day: 17, hour: "19:00" },
  { t1: "Uzbekistán", t2: "Colombia", day: 17, hour: "22:00" },
  { t1: "República Checa", t2: "Sudáfrica", day: 18, hour: "12:00" },
  { t1: "Suiza", t2: "Bosnia y Herzegovina", day: 18, hour: "15:00" },
  { t1: "Canadá", t2: "Catar", day: 18, hour: "18:00" },
  { t1: "México", t2: "Corea del Sur", day: 18, hour: "21:00" },
  { t1: "Estados Unidos", t2: "Australia", day: 19, hour: "15:00" },
  { t1: "Escocia", t2: "Marruecos", day: 19, hour: "18:00" },
  { t1: "Brasil", t2: "Haití", day: 19, hour: "20:30" },
  { t1: "Turquía", t2: "Paraguay", day: 19, hour: "23:00" },
  { t1: "Países Bajos", t2: "Suecia", day: 20, hour: "13:00" },
  { t1: "Alemania", t2: "Costa de Marfil", day: 20, hour: "16:00" },
  { t1: "Ecuador", t2: "Curazao", day: 20, hour: "20:00" },
  { t1: "Túnez", t2: "Japón", day: 21, hour: "00:00" },
  { t1: "España", t2: "Arabia Saudita", day: 21, hour: "12:00" },
  { t1: "Bélgica", t2: "Irán", day: 21, hour: "15:00" },
  { t1: "Uruguay", t2: "Cabo Verde", day: 21, hour: "18:00" },
  { t1: "Egipto", t2: "Nueva Zelanda", day: 21, hour: "21:00" },
  { t1: "Argentina", t2: "Austria", day: 22, hour: "13:00" },
  { t1: "Francia", t2: "Irak", day: 22, hour: "17:00" },
  { t1: "Noruega", t2: "Senegal", day: 22, hour: "20:00" },
  { t1: "Argelia", t2: "Jordania", day: 22, hour: "23:00" },
  { t1: "Portugal", t2: "Uzbekistán", day: 23, hour: "13:00" },
  { t1: "Inglaterra", t2: "Ghana", day: 23, hour: "16:00" },
  { t1: "Panamá", t2: "Croacia", day: 23, hour: "19:00" },
  { t1: "Colombia", t2: "R. D. Congo", day: 23, hour: "22:00" },
  { t1: "Suiza", t2: "Canadá", day: 24, hour: "15:00" },
  { t1: "Bosnia y Herzegovina", t2: "Catar", day: 24, hour: "15:00" },
  { t1: "Escocia", t2: "Brasil", day: 24, hour: "18:00" },
  { t1: "Marruecos", t2: "Haití", day: 24, hour: "18:00" },
  { t1: "República Checa", t2: "México", day: 24, hour: "21:00" },
  { t1: "Sudáfrica", t2: "Corea del Sur", day: 24, hour: "21:00" },
  { t1: "Curazao", t2: "Costa de Marfil", day: 25, hour: "16:00" },
  { t1: "Ecuador", t2: "Alemania", day: 25, hour: "16:00" },
  { t1: "Japón", t2: "Suecia", day: 25, hour: "19:00" },
  { t1: "Túnez", t2: "Países Bajos", day: 25, hour: "19:00" },
  { t1: "Turquía", t2: "Estados Unidos", day: 25, hour: "22:00" },
  { t1: "Paraguay", t2: "Australia", day: 25, hour: "22:00" },
  { t1: "Noruega", t2: "Francia", day: 26, hour: "15:00" },
  { t1: "Senegal", t2: "Irak", day: 26, hour: "15:00" },
  { t1: "Cabo Verde", t2: "Arabia Saudita", day: 26, hour: "20:00" },
  { t1: "Uruguay", t2: "España", day: 26, hour: "20:00" },
  { t1: "Egipto", t2: "Irán", day: 26, hour: "23:00" },
  { t1: "Nueva Zelanda", t2: "Bélgica", day: 26, hour: "23:00" },
  { t1: "Panamá", t2: "Inglaterra", day: 27, hour: "17:00" },
  { t1: "Croacia", t2: "Ghana", day: 27, hour: "17:00" },
  { t1: "Colombia", t2: "Portugal", day: 27, hour: "19:30" },
  { t1: "R. D. Congo", t2: "Uzbekistán", day: 27, hour: "19:30" },
  { t1: "Argelia", t2: "Austria", day: 27, hour: "22:00" },
  { t1: "Jordania", t2: "Argentina", day: 27, hour: "22:00" }
];

rawSchedule.forEach(item => {
  const key = item.t1 < item.t2 ? `${item.t1}||${item.t2}` : `${item.t2}||${item.t1}`;
  OFFICIAL_FIXTURE_SCHEDULE[key] = { day: item.day, hour: item.hour };
});

// Generar partidos de Fase de Grupos
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
    
    const teamA = g.teams[idxA];
    const teamB = g.teams[idxB];
    const key = teamA < teamB ? `${teamA}||${teamB}` : `${teamB}||${teamA}`;
    const sched = OFFICIAL_FIXTURE_SCHEDULE[key] || { day: 11, hour: "15:00" };
    
    const day = sched.day;
    const hour = sched.hour;
    const stadium = g.stadiums[matchIdx % g.stadiums.length];
    const dayStr = String(day).padStart(2, '0');

    INITIAL_MATCHES.push({
      id: "m" + matchIdCounter++,
      stage: "Fase de Grupos",
      group: gName,
      date: `Junio ${day} - ${hour} GMT-4 (${stadium})`,
      isoDate: `2026-06-${dayStr}T${hour}:00-04:00`,
      teamA: teamA,
      teamB: teamB,
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
  const orderOnDay = (i - 1) % 4;
  const hoursPool = ["13:00", "16:00", "19:00", "22:00"];
  const hour = hoursPool[orderOnDay];

  INITIAL_MATCHES.push({
    id: "m" + matchIdCounter++,
    stage: "Dieciseisavos de Final",
    group: null,
    date: `Junio ${day} - ${hour} GMT-4`,
    isoDate: `2026-06-${dayStr}T${hour}:00-04:00`,
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
  const orderOnDay = (i - 1) % 2;
  const hour = orderOnDay === 0 ? "16:00" : "21:00";

  INITIAL_MATCHES.push({
    id: "m" + matchIdCounter++,
    stage: "Octavos de Final",
    group: null,
    date: `Julio ${day} - ${hour} GMT-4`,
    isoDate: `2026-07-${dayStr}T${hour}:00-04:00`,
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
  const orderOnDay = (i - 1) % 2;
  const hour = orderOnDay === 0 ? "17:00" : "21:00";

  INITIAL_MATCHES.push({
    id: "m" + matchIdCounter++,
    stage: "Cuartos de Final",
    group: null,
    date: `Julio ${day} - ${hour} GMT-4`,
    isoDate: `2026-07-${dayStr}T${hour}:00-04:00`,
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

function parseGroupName(dbName) {
  if (!dbName) return { name: "", potDist: "1st", whatsappLink: "", mode: "unica", feeG: 0, feeK: 0, distG: "1st", distK: "1st" };
  const parts = dbName.split(/\s*\|\s*\|\s*/);
  return {
    name: parts[0] ? parts[0].trim() : "",
    potDist: parts[1] ? parts[1].trim() : "1st",
    whatsappLink: parts[2] ? parts[2].trim() : "",
    mode: parts[3] ? parts[3].trim() : "unica",
    feeG: parts[4] ? parseFloat(parts[4]) || 0 : 0,
    feeK: parts[5] ? parseFloat(parts[5]) || 0 : 0,
    distG: parts[6] ? parts[6].trim() : "1st",
    distK: parts[7] ? parts[7].trim() : "1st"
  };
}

function formatGroupName(name, potDist, whatsappLink, mode = "unica", feeG = 0, feeK = 0, distG = "1st", distK = "1st") {
  return `${name.trim()}||${potDist || "1st"}||${(whatsappLink || "").trim()}||${mode}||${feeG}||${feeK}||${distG}||${distK}`;
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

    // 4. Obtener pronósticos (paginado para superar el límite de 1000 de Supabase)
    let dbPredictions = [];
    let start = 0;
    const limit = 1000;
    let hasMore = true;
    while (hasMore) {
      const { data: chunk, error: errPredictions } = await client
        .from('predictions')
        .select('*')
        .range(start, start + limit - 1);
      
      if (errPredictions) throw errPredictions;
      dbPredictions = dbPredictions.concat(chunk);
      if (chunk.length < limit) {
        hasMore = false;
      } else {
        start += limit;
      }
    }

    // 5. Obtener marcadores de partidos
    const { data: dbMatches, error: errMatches } = await client.from('matches').select('*');
    if (errMatches) throw errMatches;

    // Obtener estado actual
    const state = getAppState();

    // Sincronizar grupos
    if (dbGroups && dbGroups.length > 0) {
      state.groups = dbGroups.map(g => {
        const parsed = parseGroupName(g.name);
        return {
          id: g.id,
          name: parsed.name,
          entryFee: parseFloat(g.entry_fee) || 0,
          creator: g.creator,
          potDist: parsed.potDist,
          whatsappLink: parsed.whatsappLink,
          mode: parsed.mode,
          feeG: parsed.feeG,
          feeK: parsed.feeK,
          distG: parsed.distG,
          distK: parsed.distK
        };
      });
    }

    // Sincronizar usuarios
    if (dbUsers) {
      const userMap = {};
      dbUsers.forEach(u => {
        const parts = u.email.split("||");
        const cleanEmail = parts[0].trim().toLowerCase();
        const userGroupId = parts[1] || "";
        
        if (!userMap[cleanEmail]) {
          userMap[cleanEmail] = {
            email: cleanEmail,
            nickname: u.nickname,
            password: u.password || "",
            groupIds: []
          };
        } else {
          // Si el apodo de este registro es personalizado (diferente al correo) y el guardado hasta ahora es el correo, preferirlo
          if (u.nickname && u.nickname !== cleanEmail && (userMap[cleanEmail].nickname === cleanEmail || !userMap[cleanEmail].nickname)) {
            userMap[cleanEmail].nickname = u.nickname;
          }
        }
        
        if (userGroupId && !userMap[cleanEmail].groupIds.includes(userGroupId)) {
          userMap[cleanEmail].groupIds.push(userGroupId);
        }
      });

      if (dbUserGroups) {
        dbUserGroups.forEach(ug => {
          const parts = ug.email.split("||");
          const cleanEmail = parts[0].trim().toLowerCase();
          const userGroupId = parts[1] || ug.group_id;
          
          if (!userMap[cleanEmail]) {
            const dbU = dbUsers ? dbUsers.find(x => x.email.split("||")[0].trim().toLowerCase() === cleanEmail) : null;
            userMap[cleanEmail] = {
              email: cleanEmail,
              nickname: dbU ? dbU.nickname : (cleanEmail === "lapollapatojv@gmail.com" ? "Organizador (Admin)" : cleanEmail.split("@")[0]),
              password: dbU ? dbU.password || "" : "",
              groupIds: []
            };
          }
          
          if (userGroupId && !userMap[cleanEmail].groupIds.includes(userGroupId)) {
            userMap[cleanEmail].groupIds.push(userGroupId);
          }
        });
      }

      state.users = Object.values(userMap);

      // Asegurar que el admin siempre exista en memoria
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
    }

    // Sincronizar pronósticos
    if (dbPredictions) {
      state.predictions = {};
      dbPredictions.forEach(p => {
        const cleanEmail = p.email ? p.email.toLowerCase().trim() : "";
        if (!cleanEmail) return;
        if (!state.predictions[cleanEmail]) {
          state.predictions[cleanEmail] = {};
        }
        state.predictions[cleanEmail][p.match_id] = {
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
          if (dbM.team_a) m.teamA = dbM.team_a;
          if (dbM.team_b) m.teamB = dbM.team_b;
          if (dbM.emoji_a) m.emojiA = dbM.emoji_a;
          if (dbM.emoji_b) m.emojiB = dbM.emoji_b;
          if (dbM.code_a !== undefined && dbM.code_a !== null) m.codeA = dbM.code_a;
          if (dbM.code_b !== undefined && dbM.code_b !== null) m.codeB = dbM.code_b;
        }
      });

      // Recalcular finalistas en cadena
      const m101 = state.matches.find(m => m.id === "m101");
      const m102 = state.matches.find(m => m.id === "m102");
      if (m101 && m101.status === "jugado") {
        updateFinalists(state, "m101", m101);
      }
      if (m102 && m102.status === "jugado") {
        updateFinalists(state, "m102", m102);
      }
    }

    saveAppState(state);
    console.log("☁️ Sincronización exitosa con Supabase completada.");
  } catch (e) {
    console.error("❌ Error de comunicación con Supabase:", e.message);
  }
}

const DB_VERSION = 16; // Incrementada a versión 16 para forzar la sincronización correcta de las llaves en minúsculas de predicciones
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

  // Asegurar que el administrador siempre exista
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

  // Corrección en caliente para el partido Sudáfrica - República Checa del 18 de junio (cambiar de 00:00 a 12:00)
  if (parsedState && parsedState.matches) {
    parsedState.matches.forEach(m => {
      if ((m.teamA === "Sudáfrica" && m.teamB === "República Checa") || (m.teamA === "República Checa" && m.teamB === "Sudáfrica")) {
        if (m.isoDate && m.isoDate.includes("2026-06-18T00:00:00")) {
          m.date = m.date.replace("00:00", "12:00");
          m.isoDate = m.isoDate.replace("00:00:00", "12:00:00");
        }
      }
    });
    saveAppState(parsedState);
  }

  return parsedState;
}

function saveAppState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// Registro de un usuario en Supabase Auth y asociación de grupo
async function authenticateUser(email, nickname, groupId, password) {
  const state = getAppState();
  email = email.trim().toLowerCase();
  nickname = nickname.trim();
  const pass = (password || "").trim();

  const client = getSupabaseClient();
  if (client) {
    try {
      const { data: authData, error: authError } = await client.auth.signUp({
        email: email,
        password: pass,
        options: {
          data: {
            nickname: nickname
          }
        }
      });
      
      if (authError) {
        throw authError;
      }
    } catch (authError) {
      const isAlreadyRegistered = authError.message.toLowerCase().includes("already registered") || 
                                  authError.status === 400 ||
                                  authError.message.toLowerCase().includes("user_already_exists");
      
      if (isAlreadyRegistered) {
        // Validar contraseña intentando iniciar sesión
        const { error: signInError } = await client.auth.signInWithPassword({
          email: email,
          password: pass
        });
        
        if (signInError) {
          throw new Error("Este correo ya está registrado en la plataforma, pero la contraseña ingresada es incorrecta.");
        }
      } else {
        throw authError;
      }
    }
  }

  let user = state.users.find(u => u.email === email);

  if (!user) {
    user = {
      email: email,
      nickname: nickname || email.split("@")[0],
      groupIds: [groupId]
    };
    state.users.push(user);
  } else {
    if (!user.groupIds.includes(groupId)) {
      user.groupIds.push(groupId);
    }
    if (nickname) {
      user.nickname = nickname;
    }
  }

  saveAppState(state);

  if (client) {
    try {
      const emailKey = `${email}||${groupId}`;
      await client.from('users').upsert({
        email: emailKey,
        nickname: user.nickname
      });
      await client.from('user_groups').upsert({
        email: emailKey,
        group_id: groupId
      });
    } catch (e) {
      console.error("❌ Error al guardar usuario en Supabase:", e.message);
    }
  }

  return user;
}

// Inicio de sesión de un usuario con Supabase Auth
async function loginUser(email, password, groupId) {
  email = email.trim().toLowerCase();
  const pass = (password || "").trim();
  const client = getSupabaseClient();
  
  if (client) {
    const { data: authData, error: authError } = await client.auth.signInWithPassword({
      email: email,
      password: pass
    });
    
    if (authError) {
      throw authError;
    }
  }

  const state = getAppState();
  let user = state.users.find(u => u.email === email);

  if (client) {
    const emailKey = `${email}||${groupId}`;
    const { data: relData } = await client.from('user_groups').select('*').eq('email', emailKey).eq('group_id', groupId);
    if (!relData || relData.length === 0) {
      // Asociar al grupo si es el admin que está entrando
      if (email === "lapollapatojv@gmail.com") {
        await client.from('user_groups').upsert({
          email: emailKey,
          group_id: groupId
        });
      } else {
        throw new Error("No perteneces a este grupo. Regístrate en él en la pestaña 'Registrarse' para unirte.");
      }
    }
  }

  if (!user) {
    user = {
      email: email,
      nickname: email.split("@")[0],
      groupIds: [groupId]
    };
    state.users.push(user);
    saveAppState(state);
  } else {
    if (!user.groupIds.includes(groupId)) {
      user.groupIds.push(groupId);
      saveAppState(state);
    }
  }

  return user;
}

// Crear un nuevo grupo
async function createGroup(name, entryFee, creatorEmail, joinSelf = true, potDist = "1st", whatsappLink = "", mode = "unica", feeG = 0, feeK = 0, distG = "1st", distK = "1st") {
  const state = getAppState();
  const newId = "g_" + Date.now();
  const newGroup = {
    id: newId,
    name: name.trim(),
    entryFee: parseFloat(entryFee) || 0,
    creator: creatorEmail,
    potDist: potDist,
    whatsappLink: whatsappLink.trim(),
    mode: mode,
    feeG: parseFloat(feeG) || 0,
    feeK: parseFloat(feeK) || 0,
    distG: distG,
    distK: distK
  };
  state.groups.push(newGroup);
  
  // Agregar creador al grupo automáticamente sólo si joinSelf es verdadero
  if (joinSelf) {
    const user = state.users.find(u => u.email === creatorEmail);
    if (user && !user.groupIds.includes(newId)) {
      user.groupIds.push(newId);
    }
  }

  saveAppState(state);

  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('groups').insert({
        id: newId,
        name: formatGroupName(newGroup.name, potDist, whatsappLink, mode, feeG, feeK, distG, distK),
        entry_fee: newGroup.entryFee,
        creator: creatorEmail
      });
      if (joinSelf) {
        const dbEmail = `${creatorEmail}||${newId}`;
        await client.from('users').upsert({
          email: dbEmail,
          nickname: "Organizador (Admin)",
          password: "Jambalaya.4910519"
        });
        await client.from('user_groups').upsert({
          email: dbEmail,
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
async function saveUserPrediction(email, matchId, predA, predB, groupId) {
  const state = getAppState();
  email = email.trim().toLowerCase();
  const emailKey = groupId ? `${email}||${groupId}` : email;

  if (!state.predictions[emailKey]) {
    state.predictions[emailKey] = {};
  }

  const pA = predA === null || isNaN(parseInt(predA)) ? null : parseInt(predA);
  const pB = predB === null || isNaN(parseInt(predB)) ? null : parseInt(predB);

  state.predictions[emailKey][matchId] = {
    predA: pA,
    predB: pB
  };

  saveAppState(state);

  const client = getSupabaseClient();
  if (client) {
    try {
      // Upsert de usuario previo en Supabase para satisfacer la constraint de foreign key
      if (groupId) {
        const user = state.users.find(u => u.email === email);
        await client.from('users').upsert({
          email: emailKey,
          nickname: user ? user.nickname : email.split("@")[0],
          password: user ? user.password || "" : ""
        });
      }

      await client.from('predictions').upsert({
        email: emailKey,
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
      if (matchId === "m101" || matchId === "m102") {
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

// Actualizar equipos y banderas de un partido (Acción de Admin)
async function updateMatchTeams(matchId, teamA, teamB) {
  const state = getAppState();
  const match = state.matches.find(m => m.id === matchId);
  if (match) {
    const tA = (teamA || "").trim();
    const tB = (teamB || "").trim();
    
    match.teamA = tA;
    match.teamB = tB;
    
    // Buscar banderas defensivamente
    // Usamos el listado de COUNTRY_CODES mapeado en app.js o data.js.
    // Para simplificar, en data.js podemos tener un miniproyecto o buscar en COUNTRY_CODES.
    // Definimos un pequeño helper para códigos de país.
    const normalizedA = tA.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const normalizedB = tB.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    const simpleCodes = {
      "mexico": "mx", "sudafrica": "za", "corea del sur": "kr", "corea": "kr",
      "canada": "ca", "gales": "gb-wls", "catar": "qa", "qatar": "qa", "suiza": "ch",
      "brasil": "br", "marruecos": "ma", "haiti": "ht", "escocia": "gb-sct",
      "estados unidos": "us", "usa": "us", "paraguay": "py", "australia": "au", "suecia": "se",
      "alemania": "de", "curazao": "cw", "costa de marfil": "ci", "ecuador": "ec",
      "paises bajos": "nl", "japon": "jp", "polonia": "pl", "tunez": "tn",
      "belgica": "be", "egipto": "eg", "iran": "ir", "nueva zelanda": "nz",
      "espana": "es", "cabo verde": "cv", "arabia saudita": "sa", "uruguay": "uy",
      "francia": "fr", "senegal": "sn", "peru": "pe", "noruega": "no",
      "argentina": "ar", "argelia": "dz", "austria": "at", "jordania": "jo",
      "portugal": "pt", "costa rica": "cr", "uzbekistan": "uz", "colombia": "co",
      "inglaterra": "gb-eng", "croacia": "hr", "ghana": "gh", "panama": "pa",
      "italia": "it", "chile": "cl", "venezuela": "ve", "bolivia": "bo"
    };

    const codeA = simpleCodes[normalizedA] || null;
    const codeB = simpleCodes[normalizedB] || null;
    
    match.codeA = codeA;
    match.codeB = codeB;
    match.emojiA = codeA ? "" : "🏆";
    match.emojiB = codeB ? "" : "🏆";

    saveAppState(state);

    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('matches').upsert({
          id: matchId,
          team_a: match.teamA,
          team_b: match.teamB,
          emoji_a: match.emojiA,
          emoji_b: match.emojiB,
          code_a: match.codeA,
          code_b: match.codeB
        });
      } catch (e) {
        console.error("❌ Error al guardar equipos en Supabase:", e.message);
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
  
  const loser = finishedMatch.scoreA > finishedMatch.scoreB 
    ? { name: finishedMatch.teamB, emoji: finishedMatch.emojiB, code: finishedMatch.codeB }
    : (finishedMatch.scoreA < finishedMatch.scoreB 
       ? { name: finishedMatch.teamA, emoji: finishedMatch.emojiA, code: finishedMatch.codeA }
       : { name: finishedMatch.teamB + " (Pen)", emoji: finishedMatch.emojiB, code: finishedMatch.codeB });

  const finalMatch = state.matches.find(m => m.id === "m104");
  const thirdPlaceMatch = state.matches.find(m => m.id === "m103");

  if (matchId === "m101") {
    if (finalMatch) {
      finalMatch.teamA = winner.name;
      finalMatch.emojiA = winner.emoji;
      finalMatch.codeA = winner.code;
    }
    if (thirdPlaceMatch) {
      thirdPlaceMatch.teamA = loser.name;
      thirdPlaceMatch.emojiA = loser.emoji;
      thirdPlaceMatch.codeA = loser.code;
    }
  } else if (matchId === "m102") {
    if (finalMatch) {
      finalMatch.teamB = winner.name;
      finalMatch.emojiB = winner.emoji;
      finalMatch.codeB = winner.code;
    }
    if (thirdPlaceMatch) {
      thirdPlaceMatch.teamB = loser.name;
      thirdPlaceMatch.emojiB = loser.emoji;
      thirdPlaceMatch.codeB = loser.code;
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
function getGroupLeaderboard(groupId, phaseFilter = "todas") {
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
    const userPreds = state.predictions[`${user.email}||${groupId}`] || state.predictions[user.email] || {};

    state.matches.forEach(match => {
      if (match.status === "jugado") {
        if (phaseFilter === "grupos" && match.stage !== "Fase de Grupos") return;
        if (phaseFilter === "llaves" && match.stage === "Fase de Grupos") return;

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
function getGroupPotDetails(groupId, phaseFilter = "todas") {
  const state = getAppState();
  const group = state.groups.find(g => g.id === groupId);
  if (!group) return { totalPot: 0, membersCount: 0, entryFee: 0, potDist: "1st", breakdown: {} };

  const membersCount = state.users.filter(u => u.groupIds.includes(groupId)).length;
  
  let entryFee = group.entryFee;
  let potDist = group.potDist || "1st";

  if (group.mode === "dividida") {
    if (phaseFilter === "grupos") {
      entryFee = group.feeG !== undefined ? group.feeG : 0;
      potDist = group.distG || "1st";
    } else if (phaseFilter === "llaves") {
      entryFee = group.feeK !== undefined ? group.feeK : 0;
      potDist = group.distK || "1st";
    }
  }

  const totalPot = membersCount * entryFee;

  // Calcular reparto de premios
  const breakdown = {};
  if (potDist === "1st") {
    breakdown["1st"] = totalPot;
  } else if (potDist === "1st-2nd") {
    breakdown["1st"] = totalPot * 0.7;
    breakdown["2nd"] = totalPot * 0.3;
  } else if (potDist === "1st-2nd-3rd") {
    breakdown["1st"] = totalPot * 0.6;
    breakdown["2nd"] = totalPot * 0.3;
    breakdown["3rd"] = totalPot * 0.1;
  }

  return {
    totalPot: totalPot,
    membersCount: membersCount,
    entryFee: entryFee,
    potDist: potDist,
    breakdown: breakdown
  };
}

// Modificar nombre, cuota y distribución de premios de un grupo existente
async function updateGroup(groupId, newName, newFee, newPotDist, newWhatsappLink, mode = "unica", feeG = 0, feeK = 0, distG = "1st", distK = "1st") {
  const state = getAppState();
  const group = state.groups.find(g => g.id === groupId);
  if (group) {
    group.name = newName.trim();
    group.entryFee = parseFloat(newFee) || 0;
    group.potDist = newPotDist || "1st";
    group.whatsappLink = (newWhatsappLink || "").trim();
    group.mode = mode;
    group.feeG = parseFloat(feeG) || 0;
    group.feeK = parseFloat(feeK) || 0;
    group.distG = distG;
    group.distK = distK;
    saveAppState(state);

    const client = getSupabaseClient();
    if (client) {
      try {
        const { error } = await client.from('groups').update({
          name: formatGroupName(group.name, group.potDist, group.whatsappLink, mode, feeG, feeK, distG, distK),
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

// Actualizar apodo de un usuario (Acción de Admin)
async function updateUserInGroup(email, newNickname, groupId) {
  const state = getAppState();
  const user = state.users.find(u => u.email === email);
  if (user) {
    user.nickname = newNickname.trim();
    saveAppState(state);

    const client = getSupabaseClient();
    if (client) {
      try {
        const promises = [];
        if (user.groupIds && user.groupIds.length > 0) {
          user.groupIds.forEach(gId => {
            promises.push(
              client.from('users').upsert({
                email: `${email}||${gId}`,
                nickname: user.nickname
              })
            );
          });
        } else {
          promises.push(
            client.from('users').upsert({
              email: email,
              nickname: user.nickname
            })
          );
        }
        await Promise.all(promises);
      } catch (e) {
        console.error("❌ Error al actualizar usuario en Supabase:", e.message);
      }
    }
  }
}

// Remover un usuario de un grupo de juego (Acción de Admin)
async function removeUserFromGroup(email, groupId) {
  const state = getAppState();
  const user = state.users.find(u => u.email === email);
  if (user) {
    if (user.groupIds) {
      user.groupIds = user.groupIds.filter(id => id !== groupId);
    }
    
    const emailKey = `${email}||${groupId}`;
    delete state.predictions[emailKey];
    
    // Si el usuario ya no pertenece a ningún grupo, borrarlo por completo (salvo si es el admin)
    if (email !== "lapollapatojv@gmail.com" && (!user.groupIds || user.groupIds.length === 0)) {
      state.users = state.users.filter(u => u.email !== email);
      delete state.predictions[email];
    }
    saveAppState(state);

    const client = getSupabaseClient();
    if (client) {
      try {
        // 1. Borrar todas las predicciones de este usuario en este grupo
        await client.from('predictions').delete().eq('email', emailKey);

        // 2. Borrar relación grupo-usuario
        await client.from('user_groups').delete().eq('email', emailKey).eq('group_id', groupId);

        // 3. Borrar el perfil del usuario de este grupo
        await client.from('users').delete().eq('email', emailKey);
      } catch (e) {
        console.error("❌ Error al remover usuario en Supabase:", e.message);
      }
    }
  }
}
