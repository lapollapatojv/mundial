// app.js - Controlador de la Aplicación (Lógica y Renderizado)

// Mapeo defensivo de países a códigos ISO para banderas vectoriales (jsDelivr)
const COUNTRY_CODES = {
  "méxico": "mx", "mexico": "mx",
  "sudáfrica": "za", "sudafrica": "za",
  "corea del sur": "kr", "corea": "kr", "corea republica": "kr",
  "república checa": "cz", "republica checa": "cz",
  "canadá": "ca", "canada": "ca",
  "bosnia y herzegovina": "ba", "bosnia": "ba",
  "estados unidos": "us", "usa": "us", "u.s.a.": "us",
  "paraguay": "py",
  "catar": "qa", "qatar": "qa",
  "suiza": "ch",
  "brasil": "br",
  "marruecos": "ma",
  "australia": "au",
  "turquía": "tr", "turquia": "tr",
  "alemania": "de",
  "curazao": "cw",
  "países bajos": "nl", "paises bajos": "nl",
  "japón": "jp", "japon": "jp",
  "españa": "es", "espana": "es",
  "cabo verde": "cv",
  "arabia saudita": "sa",
  "uruguay": "uy"
};

// Estado de la sesión actual
let currentUser = null;
let currentGroupId = null;
let currentDashboardPhaseFilter = "grupos";
let currentFixtureFilter = "today"; // "all", "today", "pending"

// Elementos del DOM
const headerLogo = document.getElementById("header-logo");
const navContainer = document.getElementById("nav-container");
const userDisplayName = document.getElementById("user-display-name");
const groupDisplayBadge = document.getElementById("group-display-badge");

const btnNavDashboard = document.getElementById("btn-nav-dashboard");
const btnNavPredictions = document.getElementById("btn-nav-predictions");
const btnNavFixture = document.getElementById("btn-nav-fixture");
const btnNavAdmin = document.getElementById("btn-nav-admin");
const btnLogout = document.getElementById("btn-logout");

// Vistas
const viewAuth = document.getElementById("view-auth");
const viewDashboard = document.getElementById("view-dashboard");
const viewPredictions = document.getElementById("view-predictions");
const viewFixture = document.getElementById("view-fixture");
const viewAdmin = document.getElementById("view-admin");

// Elementos de la Pestaña Auth (Formularios e Inputs)
const tabAuthLogin = document.getElementById("tab-auth-login");
const tabAuthRegister = document.getElementById("tab-auth-register");
const tabAuthAdmin = document.getElementById("tab-auth-admin");

const formUserLogin = document.getElementById("form-user-login");
const loginEmail = document.getElementById("login-email");
const loginPassword = document.getElementById("login-password");
const loginGroupSelect = document.getElementById("login-group");

const formUserRegister = document.getElementById("form-user-register");
const registerEmail = document.getElementById("register-email");
const registerNickname = document.getElementById("register-nickname");
const registerPassword = document.getElementById("register-password");
const registerGroupSelect = document.getElementById("register-group");

const formAdminLogin = document.getElementById("form-admin-login");
const adminEmail = document.getElementById("admin-email");
const adminPassword = document.getElementById("admin-password");

// Formulario de Crear Grupo en Vista Admin
const formAdminCreateGroup = document.getElementById("form-admin-create-group");
const adminNewGroupName = document.getElementById("admin-new-group-name");
const adminNewGroupFee = document.getElementById("admin-new-group-fee");
const adminNewGroupDist = document.getElementById("admin-new-group-dist");
const adminNewGroupWhatsapp = document.getElementById("admin-new-group-whatsapp");

const adminSelectUserGroup = document.getElementById("admin-select-user-group");
const adminUsersList = document.getElementById("admin-users-list");
const adminGroupJoinSelf = document.getElementById("admin-group-join-self");

// Inicialización de la Aplicación
document.addEventListener("DOMContentLoaded", () => {
  initApp();
});

async function initApp() {
  // Asegurar que el estado inicial exista
  getAppState();
  
  // Sincronizar desde Supabase antes de pintar la UI
  await syncStateFromSupabase();

  // Rellenar selectores de grupos
  populateGroupsDropdown();

  // Escuchar eventos globales
  setupEventListeners();

  // Configurar las pestañas del landing page
  setupAuthTabs();

  // Restaurar sesión si existe
  const client = getSupabaseClient();
  let sessionUser = null;
  if (client) {
    const { data: sessionData } = await client.auth.getSession();
    if (sessionData && sessionData.session) {
      sessionUser = sessionData.session.user;
    }
  }

  const savedGroupId = localStorage.getItem("session_group_id");

  if (sessionUser && savedGroupId) {
    const email = sessionUser.email.toLowerCase();
    const state = getAppState();
    const user = state.users.find(u => u.email === email);
    const group = state.groups.find(g => g.id === savedGroupId);
    
    if (user && group) {
      currentUser = user;
      currentGroupId = savedGroupId;
      updateHeaderUI();
      switchView("dashboard");
      return;
    }
  }

  // Si no hay sesión, ir a auth
  switchView("auth");
}

// Configurar el cambio de pestañas de la Landing Page
function setupAuthTabs() {
  console.log("Setting up auth tabs...");
  tabAuthLogin.addEventListener("click", () => {
    console.log("Login tab clicked");
    tabAuthLogin.classList.add("active");
    tabAuthRegister.classList.remove("active");
    tabAuthAdmin.classList.remove("active");

    formUserLogin.classList.remove("d-none");
    formUserRegister.classList.add("d-none");
    formAdminLogin.classList.add("d-none");
  });

  tabAuthRegister.addEventListener("click", () => {
    console.log("Register tab clicked");
    tabAuthLogin.classList.remove("active");
    tabAuthRegister.classList.add("active");
    tabAuthAdmin.classList.remove("active");

    formUserLogin.classList.add("d-none");
    formUserRegister.classList.remove("d-none");
    formAdminLogin.classList.add("d-none");
  });

  tabAuthAdmin.addEventListener("click", () => {
    console.log("Admin tab clicked");
    tabAuthLogin.classList.remove("active");
    tabAuthRegister.classList.remove("active");
    tabAuthAdmin.classList.add("active");

    formUserLogin.classList.add("d-none");
    formUserRegister.classList.add("d-none");
    formAdminLogin.classList.remove("d-none");
  });
}

// Configuración de los Event Listeners
function setupEventListeners() {
  // Navegación
  btnNavDashboard.addEventListener("click", () => switchView("dashboard"));
  btnNavPredictions.addEventListener("click", () => switchView("predictions"));
  btnNavFixture.addEventListener("click", () => switchView("fixture"));
  btnNavAdmin.addEventListener("click", () => switchView("admin"));

  // Cambiar grupo de participantes en panel admin
  adminSelectUserGroup.addEventListener("change", () => {
    renderAdminUsersList();
  });
  
  // Salir
  btnLogout.addEventListener("click", async () => {
    const client = getSupabaseClient();
    if (client) {
      await client.auth.signOut();
    }
    localStorage.removeItem("session_group_id");
    currentUser = null;
    currentGroupId = null;
    updateHeaderUI();
    switchView("auth");
  });

  // Login de Usuario
  formUserLogin.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = loginEmail.value.trim().toLowerCase();
    const password = loginPassword.value;
    const groupId = loginGroupSelect.value;

    if (!groupId) {
      alert("Por favor selecciona un grupo para ingresar.");
      return;
    }

    try {
      const user = await loginUser(email, password, groupId);
      currentUser = user;
      currentGroupId = groupId;

      // Guardar sesión
      localStorage.setItem("session_group_id", groupId);

      updateHeaderUI();
      switchView("dashboard");
    } catch (err) {
      alert("Error al iniciar sesión: " + err.message);
    }
  });

  // Registro de Usuario
  formUserRegister.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = registerEmail.value.trim().toLowerCase();
    const nickname = registerNickname.value.trim();
    const password = registerPassword.value;
    const groupId = registerGroupSelect.value;

    if (!groupId) {
      alert("Por favor selecciona un grupo.");
      return;
    }

    if (!password) {
      alert("Por favor ingresa una contraseña.");
      return;
    }

    try {
      const user = await authenticateUser(email, nickname, groupId, password);
      currentUser = user;
      currentGroupId = groupId;

      // Guardar sesión
      localStorage.setItem("session_group_id", groupId);

      updateHeaderUI();
      switchView("dashboard");
    } catch (err) {
      alert("Error en el registro: " + err.message);
    }
  });

  // Login de Admin
  formAdminLogin.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = adminEmail.value.trim().toLowerCase();
    const password = adminPassword.value;

    if (email !== "lapollapatojv@gmail.com") {
      alert("Este correo no tiene permisos de administrador.");
      return;
    }

    try {
      const client = getSupabaseClient();
      if (client) {
        const { error } = await client.auth.signInWithPassword({
          email: email,
          password: password
        });
        if (error) throw error;
      }

      const state = getAppState();
      let adminUser = state.users.find(u => u.email === "lapollapatojv@gmail.com");

      if (!adminUser) {
        adminUser = {
          email: "lapollapatojv@gmail.com",
          nickname: "Organizador (Admin)",
          groupIds: []
        };
        state.users.push(adminUser);
        saveAppState(state);
      }

      const activeGroup = state.groups[0] ? state.groups[0].id : "g1";

      currentUser = adminUser;
      currentGroupId = activeGroup;

      // Guardar sesión
      localStorage.setItem("session_group_id", activeGroup);

      updateHeaderUI();
      switchView("dashboard");
    } catch (err) {
      alert("Error al iniciar sesión de administrador: " + err.message);
    }
  });

  // Control de visibilidad para creación de grupo por fases
  const groupModeSelect = document.getElementById("admin-new-group-mode");
  const wrapperSingle = document.getElementById("wrapper-single-phase-fields");
  const wrapperSplit = document.getElementById("wrapper-split-phase-fields");

  if (groupModeSelect && wrapperSingle && wrapperSplit) {
    groupModeSelect.addEventListener("change", () => {
      if (groupModeSelect.value === "dividida") {
        wrapperSingle.classList.add("d-none");
        wrapperSplit.classList.remove("d-none");
      } else {
        wrapperSingle.classList.remove("d-none");
        wrapperSplit.classList.add("d-none");
      }
    });
  }

  // Creación de Grupo por el Admin (en panel admin)
  formAdminCreateGroup.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = adminNewGroupName.value.trim();
    const mode = groupModeSelect ? groupModeSelect.value : "unica";
    const whatsappLink = adminNewGroupWhatsapp ? adminNewGroupWhatsapp.value.trim() : "";
    
    let fee = 0;
    let potDist = "1st";
    let feeG = 0;
    let feeK = 0;
    let distG = "1st";
    let distK = "1st";

    if (mode === "dividida") {
      feeG = parseFloat(document.getElementById("admin-new-group-fee-g").value) || 0;
      feeK = parseFloat(document.getElementById("admin-new-group-fee-k").value) || 0;
      distG = document.getElementById("admin-new-group-dist-g").value;
      distK = document.getElementById("admin-new-group-dist-k").value;
      fee = feeG + feeK;
      potDist = distG; // Para fallback
    } else {
      fee = parseFloat(adminNewGroupFee.value) || 0;
      potDist = adminNewGroupDist ? adminNewGroupDist.value : "1st";
    }

    if (!name) {
      alert("Por favor ingresa un nombre para el grupo.");
      return;
    }

    const joinSelf = adminGroupJoinSelf ? adminGroupJoinSelf.checked : true;

    // Crear el grupo
    const newGroup = await createGroup(name, fee, "lapollapatojv@gmail.com", joinSelf, potDist, whatsappLink, mode, feeG, feeK, distG, distK);

    // Rellenar dropdowns de grupo de login/registro
    populateGroupsDropdown();

    // Auto-seleccionar el grupo recién creado si el grupo actual no es válido o es el marcador temporal "g1"
    const state = getAppState();
    const currentGroupExists = state.groups.some(g => g.id === currentGroupId);
    if (!currentGroupExists || currentGroupId === "g1") {
      currentGroupId = newGroup.id;
      localStorage.setItem("session_group_id", newGroup.id);
      updateHeaderUI();
    }

    // Reset del formulario y campos ocultos
    formAdminCreateGroup.reset();
    if (wrapperSingle && wrapperSplit) {
      wrapperSingle.classList.remove("d-none");
      wrapperSplit.classList.add("d-none");
    }

    alert(`Grupo "${newGroup.name}" creado con éxito. ¡Los usuarios ya se pueden registrar en él!`);
  });

  const formAdminChangePassword = document.getElementById("form-admin-change-password");
  if (formAdminChangePassword) {
    formAdminChangePassword.addEventListener("submit", async (e) => {
      e.preventDefault();
      const newPassword = document.getElementById("admin-new-password").value.trim();
      if (!newPassword) return;

      try {
        await changeAdminPassword(newPassword);
        alert("¡Contraseña de administrador actualizada con éxito!");
        formAdminChangePassword.reset();
      } catch (err) {
        console.error(err);
        alert("Error al actualizar la contraseña: " + err.message);
      }
    });
  }

  // Guardar Pronósticos (Botón superior e inferior)
  document.getElementById("btn-save-all-predictions").addEventListener("click", saveAllPredictionsFromUI);
  document.getElementById("btn-save-all-predictions-bottom").addEventListener("click", saveAllPredictionsFromUI);

  // Acceso directo a pronósticos desde el Dashboard
  document.getElementById("btn-go-to-predict").addEventListener("click", () => {
    switchView("predictions");
  });

  // Delegación de eventos para el botón de auto-completar individual por partido
  const containerMatches = document.getElementById("matches-tickets-container");
  if (containerMatches) {
    containerMatches.addEventListener("click", (e) => {
      const btn = e.target.closest(".btn-random-single");
      if (btn) {
        const scoreInputs = btn.closest(".score-inputs");
        if (scoreInputs) {
          const inputA = scoreInputs.querySelector(".pred-a");
          const inputB = scoreInputs.querySelector(".pred-b");
          if (inputA && inputB && !inputA.disabled && !inputB.disabled) {
            const realisticScores = [
              [1, 0], [2, 0], [2, 1], [3, 0], [3, 1], [3, 2],
              [0, 0], [1, 1], [2, 2],
              [0, 1], [0, 2], [1, 2], [0, 3], [1, 3], [2, 3]
            ];
            const randomIndex = Math.floor(Math.random() * realisticScores.length);
            const [scoreA, scoreB] = realisticScores[randomIndex];
            
            inputA.value = scoreA;
            inputB.value = scoreB;
            
            // Efecto destello cómic
            inputA.style.backgroundColor = "var(--primary)";
            inputB.style.backgroundColor = "var(--primary)";
            inputA.style.color = "var(--black)";
            inputB.style.color = "var(--black)";
            setTimeout(() => {
              inputA.style.backgroundColor = "";
              inputB.style.backgroundColor = "";
              inputA.style.color = "";
              inputB.style.color = "";
            }, 200);
          }
        }
      }
    });
  }

  // Filtros de Fixture
  const btnFilterAll = document.getElementById("btn-fixture-filter-all");
  const btnFilterToday = document.getElementById("btn-fixture-filter-today");
  const btnFilterPending = document.getElementById("btn-fixture-filter-pending");

  if (btnFilterAll) {
    btnFilterAll.addEventListener("click", () => {
      currentFixtureFilter = "all";
      setActiveFixtureFilterButton(btnFilterAll);
      renderFixtureView();
    });
  }
  if (btnFilterToday) {
    btnFilterToday.addEventListener("click", () => {
      currentFixtureFilter = "today";
      setActiveFixtureFilterButton(btnFilterToday);
      renderFixtureView();
    });
  }
  if (btnFilterPending) {
    btnFilterPending.addEventListener("click", () => {
      currentFixtureFilter = "pending";
      setActiveFixtureFilterButton(btnFilterPending);
      renderFixtureView();
    });
  }
}

function setActiveFixtureFilterButton(activeBtn) {
  const btns = [
    document.getElementById("btn-fixture-filter-all"),
    document.getElementById("btn-fixture-filter-today"),
    document.getElementById("btn-fixture-filter-pending")
  ];
  btns.forEach(btn => {
    if (btn) {
      btn.classList.remove("active");
    }
  });
  if (activeBtn) {
    activeBtn.classList.add("active");
  }
}

// Rellenar lista de grupos en los selectores de Auth (Login y Registro)
function populateGroupsDropdown() {
  const state = getAppState();
  loginGroupSelect.innerHTML = "";
  registerGroupSelect.innerHTML = "";

  if (state.groups.length === 0) {
    const optLogin = document.createElement("option");
    optLogin.value = "";
    optLogin.textContent = "No hay grupos creados.";
    loginGroupSelect.appendChild(optLogin);

    const optReg = document.createElement("option");
    optReg.value = "";
    optReg.textContent = "No hay grupos creados.";
    registerGroupSelect.appendChild(optReg);
    return;
  }

  state.groups.forEach(g => {
    const optLogin = document.createElement("option");
    optLogin.value = g.id;
    optLogin.textContent = `${g.name} (Bote: Bs. ${g.entryFee})`;
    loginGroupSelect.appendChild(optLogin);

    const optReg = document.createElement("option");
    optReg.value = g.id;
    optReg.textContent = `${g.name} (Bote: Bs. ${g.entryFee})`;
    registerGroupSelect.appendChild(optReg);
  });
}

// Actualizar barra superior (Header) con datos del usuario
function updateHeaderUI() {
  if (currentUser && currentGroupId) {
    const state = getAppState();
    const group = state.groups.find(g => g.id === currentGroupId);
    
    userDisplayName.textContent = currentUser.nickname;
    navContainer.classList.remove("d-none");
    
    // Mostrar u ocultar el botón de admin de acuerdo al correo
    if (currentUser.email === "lapollapatojv@gmail.com") {
      btnNavAdmin.classList.remove("d-none");
    } else {
      btnNavAdmin.classList.add("d-none");
    }

    const userGroups = currentUser.email === "lapollapatojv@gmail.com" 
      ? state.groups 
      : state.groups.filter(g => currentUser.groupIds && currentUser.groupIds.includes(g.id));

    if (userGroups.length > 1) {
      let selectHTML = `<select id="header-group-select" style="background: var(--black); color: var(--accent); border: 2px solid var(--accent); padding: 2px 6px; font-family: var(--font-comic); font-weight: bold; font-size: 0.85rem; border-radius: 6px; cursor: pointer; outline: none;">`;
      userGroups.forEach(g => {
        const selected = g.id === currentGroupId ? "selected" : "";
        selectHTML += `<option value="${g.id}" ${selected}>🎟️ ${g.name}</option>`;
      });
      selectHTML += `</select>`;
      groupDisplayBadge.innerHTML = selectHTML;
      
      // Agregar listener para cambiar de grupo dinámicamente
      const selectElem = document.getElementById("header-group-select");
      if (selectElem) {
        selectElem.addEventListener("change", (e) => {
          const newGroupId = e.target.value;
          currentGroupId = newGroupId;
          localStorage.setItem("session_group_id", newGroupId);
          currentDashboardPhaseFilter = "grupos";
          
          // Refrescar el header y las vistas activas
          updateHeaderUI();
          if (!viewDashboard.classList.contains("d-none")) {
            renderDashboard();
          } else if (!viewPredictions.classList.contains("d-none")) {
            renderPredictions();
          } else if (viewFixture && !viewFixture.classList.contains("d-none")) {
            renderFixtureView();
          }
        });
      }
    } else {
      groupDisplayBadge.textContent = group ? `🎟️ ${group.name}` : "Sin grupos";
    }

    // Compartir grupo info en el dashboard sidebar
    const shareInput = document.getElementById("share-group-name");
    if (shareInput && group) {
      shareInput.value = group.name;
    }
  } else {
    navContainer.classList.add("d-none");
  }
}

// Control de navegación / Cambio de pestañas
async function switchView(viewName) {
  // Si el usuario está saliendo de la pestaña de pronósticos, guardar los cambios automáticamente de forma silenciosa
  if (currentUser && viewPredictions && !viewPredictions.classList.contains("d-none") && viewName !== "predictions") {
    try {
      await saveAllPredictionsFromUI(true);
    } catch (e) {
      console.error("❌ Error al guardar pronósticos automáticamente:", e);
    }
  }

  // Ocultar todas las vistas
  viewAuth.classList.add("d-none");
  viewDashboard.classList.add("d-none");
  viewPredictions.classList.add("d-none");
  if (viewFixture) viewFixture.classList.add("d-none");
  viewAdmin.classList.add("d-none");

  // Quitar clase active a los botones del menú
  btnNavDashboard.classList.remove("comic-btn-primary");
  btnNavDashboard.classList.add("comic-btn-outline");
  btnNavPredictions.classList.remove("comic-btn-primary");
  btnNavPredictions.classList.add("comic-btn-outline");
  if (btnNavFixture) {
    btnNavFixture.classList.remove("comic-btn-primary");
    btnNavFixture.classList.add("comic-btn-outline");
  }
  btnNavAdmin.classList.remove("comic-btn-accent");
  btnNavAdmin.classList.add("comic-btn-secondary");

  if (viewName === "auth") {
    viewAuth.classList.remove("d-none");
  } else if (viewName === "dashboard") {
    viewDashboard.classList.remove("d-none");
    btnNavDashboard.classList.add("comic-btn-primary");
    btnNavDashboard.classList.remove("comic-btn-outline");
    renderDashboard();
  } else if (viewName === "predictions") {
    viewPredictions.classList.remove("d-none");
    btnNavPredictions.classList.add("comic-btn-primary");
    btnNavPredictions.classList.remove("comic-btn-outline");
    renderPredictions();
  } else if (viewName === "fixture") {
    if (viewFixture) viewFixture.classList.remove("d-none");
    if (btnNavFixture) {
      btnNavFixture.classList.add("comic-btn-primary");
      btnNavFixture.classList.remove("comic-btn-outline");
    }
    renderFixtureView();
  } else if (viewName === "admin") {
    viewAdmin.classList.remove("d-none");
    btnNavAdmin.classList.add("comic-btn-accent");
    btnNavAdmin.classList.remove("comic-btn-secondary");
    renderAdmin();
  }
}

// ==========================================================================
// RENDERIZADO DE LAS VISTAS
// ==========================================================================

// 1. Renderizar Dashboard
function renderDashboard() {
  if (!currentGroupId || !currentUser) return;

  const state = getAppState();
  const group = state.groups.find(g => g.id === currentGroupId);
  
  let phaseFilter = "todas";
  const tabsContainer = document.getElementById("dashboard-phase-tabs-container");

  if (group && group.mode === "dividida") {
    if (currentDashboardPhaseFilter !== "grupos" && currentDashboardPhaseFilter !== "llaves") {
      currentDashboardPhaseFilter = "grupos";
    }
    phaseFilter = currentDashboardPhaseFilter;
    
    if (tabsContainer) {
      tabsContainer.classList.remove("d-none");
      const btnGrupos = document.getElementById("btn-phase-tab-grupos");
      const btnLlaves = document.getElementById("btn-phase-tab-llaves");
      
      if (btnGrupos && btnLlaves) {
        if (currentDashboardPhaseFilter === "grupos") {
          btnGrupos.className = "comic-btn comic-btn-primary";
          btnLlaves.className = "comic-btn comic-btn-outline";
        } else {
          btnGrupos.className = "comic-btn comic-btn-outline";
          btnLlaves.className = "comic-btn comic-btn-primary";
        }
        
        btnGrupos.onclick = () => {
          currentDashboardPhaseFilter = "grupos";
          renderDashboard();
        };
        btnLlaves.onclick = () => {
          currentDashboardPhaseFilter = "llaves";
          renderDashboard();
        };
      }
    }
  } else {
    if (tabsContainer) {
      tabsContainer.classList.add("d-none");
    }
  }

  const potDetails = getGroupPotDetails(currentGroupId, phaseFilter);
  const leaderboard = getGroupLeaderboard(currentGroupId, phaseFilter);
  
  // Actualizar Bote
  document.getElementById("pot-total-display").textContent = `Bs. ${potDetails.totalPot.toFixed(2)}`;
  document.getElementById("pot-members-count").textContent = potDetails.membersCount;
  document.getElementById("pot-fee-display").textContent = `Bs. ${potDetails.entryFee}`;

  // Reparto de Premios dinámico
  const breakdownDiv = document.getElementById("pot-distribution-breakdown");
  if (breakdownDiv) {
    breakdownDiv.innerHTML = "";
    
    // Verificar si la fase ha terminado (todos los partidos de la fase jugados)
    const stateObj = getAppState();
    const phaseMatches = stateObj.matches.filter(match => {
      if (phaseFilter === "grupos") return match.stage === "Fase de Grupos";
      if (phaseFilter === "llaves") return match.stage !== "Fase de Grupos";
      return true; // "todas"
    });
    const isPhaseCompleted = phaseMatches.length > 0 && phaseMatches.every(m => m.status === "jugado");

    if (isPhaseCompleted && leaderboard.length > 0) {
      // Agrupar jugadores por puntuación para manejar empates en los puestos 1, 2 y 3
      const distinctRanks = [];
      leaderboard.forEach(player => {
        if (distinctRanks.length < 3) {
          const exists = distinctRanks.find(r => r.points === player.points && r.exact === player.exact);
          if (!exists) {
            distinctRanks.push({ points: player.points, exact: player.exact, players: [player] });
          } else {
            exists.players.push(player);
          }
        } else {
          const exists = distinctRanks.find(r => r.points === player.points && r.exact === player.exact);
          if (exists) {
            exists.players.push(player);
          }
        }
      });

      // Aplicar estilos llamativos
      breakdownDiv.style.flexDirection = "column";
      breakdownDiv.style.alignItems = "center";
      breakdownDiv.style.width = "100%";
      breakdownDiv.style.gap = "10px";
      breakdownDiv.style.background = "linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 69, 0, 0.2) 100%)";
      breakdownDiv.style.border = "3px dashed var(--accent)";
      breakdownDiv.style.borderRadius = "8px";
      breakdownDiv.style.padding = "15px";
      breakdownDiv.style.animation = "pulseGlow 2s infinite alternate";

      let winnersHTML = `
        <div style="font-size: 1.1rem; color: var(--accent); font-weight: bold; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 1px; display: flex; align-items: center; gap: 8px;">
          🎉 ¡GANADORES DE LA FASE! 🎉
        </div>
      `;

      if (potDetails.potDist === "1st" && distinctRanks[0]) {
        const names = distinctRanks[0].players.map(p => `<span style="color: var(--white); background: var(--primary); padding: 3px 8px; border-radius: 4px; display: inline-block; margin: 2px; font-weight: 800; border: 1.5px solid #000; box-shadow: 2px 2px 0px #000;">${p.nickname}</span>`).join(" ");
        winnersHTML += `
          <div style="font-size: 1rem; color: #ffd700; text-shadow: 1px 1px 0px #000; text-align: center;">
            🥇 1er Lugar (Bs. ${potDetails.totalPot.toFixed(2)}):
            <div style="margin-top: 5px; font-size: 1.1rem;">${names}</div>
          </div>
        `;
      } else if (potDetails.potDist === "1st-2nd") {
        if (distinctRanks[0]) {
          const names1 = distinctRanks[0].players.map(p => `<span style="color: var(--white); background: var(--primary); padding: 3px 8px; border-radius: 4px; display: inline-block; margin: 2px; font-weight: 800; border: 1.5px solid #000; box-shadow: 2px 2px 0px #000;">${p.nickname}</span>`).join(" ");
          winnersHTML += `
            <div style="font-size: 0.95rem; color: #ffd700; text-shadow: 1px 1px 0px #000; text-align: center;">
              🥇 1er Lugar (Bs. ${(potDetails.breakdown["1st"] || 0).toFixed(2)}):
              <div style="margin-top: 5px;">${names1}</div>
            </div>
          `;
        }
        if (distinctRanks[1]) {
          const names2 = distinctRanks[1].players.map(p => `<span style="color: var(--white); background: var(--secondary); padding: 3px 8px; border-radius: 4px; display: inline-block; margin: 2px; font-weight: 800; border: 1.5px solid #000; box-shadow: 2px 2px 0px #000;">${p.nickname}</span>`).join(" ");
          winnersHTML += `
            <div style="font-size: 0.9rem; color: #c0c0c0; text-shadow: 1px 1px 0px #000; text-align: center; margin-top: 5px; border-top: 1px dashed rgba(255,255,255,0.1); width: 100%; padding-top: 8px;">
              🥈 2do Lugar (Bs. ${(potDetails.breakdown["2nd"] || 0).toFixed(2)}):
              <div style="margin-top: 5px;">${names2}</div>
            </div>
          `;
        }
      } else if (potDetails.potDist === "1st-2nd-3rd") {
        if (distinctRanks[0]) {
          const names1 = distinctRanks[0].players.map(p => `<span style="color: var(--white); background: var(--primary); padding: 3px 8px; border-radius: 4px; display: inline-block; margin: 2px; font-weight: 800; border: 1.5px solid #000; box-shadow: 2px 2px 0px #000;">${p.nickname}</span>`).join(" ");
          winnersHTML += `
            <div style="font-size: 0.95rem; color: #ffd700; text-shadow: 1px 1px 0px #000; text-align: center;">
              🥇 1er Lugar (Bs. ${(potDetails.breakdown["1st"] || 0).toFixed(2)}):
              <div style="margin-top: 5px;">${names1}</div>
            </div>
          `;
        }
        if (distinctRanks[1]) {
          const names2 = distinctRanks[1].players.map(p => `<span style="color: var(--white); background: var(--secondary); padding: 3px 8px; border-radius: 4px; display: inline-block; margin: 2px; font-weight: 800; border: 1.5px solid #000; box-shadow: 2px 2px 0px #000;">${p.nickname}</span>`).join(" ");
          winnersHTML += `
            <div style="font-size: 0.9rem; color: #c0c0c0; text-shadow: 1px 1px 0px #000; text-align: center; margin-top: 5px; border-top: 1px dashed rgba(255,255,255,0.1); width: 100%; padding-top: 8px;">
              🥈 2do Lugar (Bs. ${(potDetails.breakdown["2nd"] || 0).toFixed(2)}):
              <div style="margin-top: 5px;">${names2}</div>
            </div>
          `;
        }
        if (distinctRanks[2]) {
          const names3 = distinctRanks[2].players.map(p => `<span style="color: var(--white); background: #cd7f32; padding: 3px 8px; border-radius: 4px; display: inline-block; margin: 2px; font-weight: 800; border: 1.5px solid #000; box-shadow: 2px 2px 0px #000;">${p.nickname}</span>`).join(" ");
          winnersHTML += `
            <div style="font-size: 0.85rem; color: #cd7f32; text-shadow: 1px 1px 0px #000; text-align: center; margin-top: 5px; border-top: 1px dashed rgba(255,255,255,0.1); width: 100%; padding-top: 8px;">
              🥉 3er Lugar (Bs. ${(potDetails.breakdown["3rd"] || 0).toFixed(2)}):
              <div style="margin-top: 5px;">${names3}</div>
            </div>
          `;
        }
      }
      breakdownDiv.innerHTML = winnersHTML;
    } else {
      // Restaurar estilos originales
      breakdownDiv.style.flexDirection = "";
      breakdownDiv.style.alignItems = "";
      breakdownDiv.style.width = "";
      breakdownDiv.style.gap = "15px";
      breakdownDiv.style.background = "";
      breakdownDiv.style.border = "";
      breakdownDiv.style.borderRadius = "";
      breakdownDiv.style.padding = "";
      breakdownDiv.style.animation = "";

      if (potDetails.potDist === "1st") {
        breakdownDiv.innerHTML = `<div>🥇 1er Lugar: Bs. ${(potDetails.breakdown["1st"] || 0).toFixed(2)}</div>`;
      } else if (potDetails.potDist === "1st-2nd") {
        breakdownDiv.innerHTML = `
          <div>🥇 1er Lugar: Bs. ${(potDetails.breakdown["1st"] || 0).toFixed(2)}</div>
          <div>🥈 2do Lugar: Bs. ${(potDetails.breakdown["2nd"] || 0).toFixed(2)}</div>
        `;
      } else if (potDetails.potDist === "1st-2nd-3rd") {
        breakdownDiv.innerHTML = `
          <div>🥇 1er Lugar: Bs. ${(potDetails.breakdown["1st"] || 0).toFixed(2)}</div>
          <div>🥈 2do Lugar: Bs. ${(potDetails.breakdown["2nd"] || 0).toFixed(2)}</div>
          <div>🥉 3er Lugar: Bs. ${(potDetails.breakdown["3rd"] || 0).toFixed(2)}</div>
        `;
      }
    }
  }

  // Vincular enlace de WhatsApp del grupo si existe
  const whatsappContainer = document.getElementById("whatsapp-link-container");
  const whatsappHref = document.getElementById("group-whatsapp-href");
  if (whatsappContainer && whatsappHref) {
    if (group && group.whatsappLink) {
      whatsappHref.href = group.whatsappLink;
      whatsappContainer.classList.remove("d-none");
    } else {
      whatsappContainer.classList.add("d-none");
    }
  }

  // Actualizar Tabla de Clasificación
  const tbody = document.getElementById("leaderboard-tbody");
  tbody.innerHTML = "";

  if (leaderboard.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="empty-state">No hay participantes aún.</td></tr>`;
  } else {
    leaderboard.forEach((player, index) => {
      const tr = document.createElement("tr");
      tr.className = "leaderboard-row";
      if (player.email === currentUser.email) {
        tr.classList.add("current-user");
      }

      tr.innerHTML = `
        <td><span class="rank-badge">${index + 1}</span></td>
        <td>
          <div class="player-info">
            <span class="player-name">${player.nickname} ${player.email === currentUser.email ? " (Tú)" : ""}</span>
            <span class="player-email">${player.email}</span>
          </div>
        </td>
        <td style="text-align: center;">${player.exact}</td>
        <td style="text-align: center;">${player.trend}</td>
        <td class="player-points">${player.points} pts</td>
      `;
      tbody.appendChild(tr);
    });
  }

  // Actualizar Panel Lateral de Usuario
  const myStats = leaderboard.find(p => p.email === currentUser.email);
  if (myStats) {
    document.getElementById("side-user-name").textContent = currentUser.nickname;
    document.getElementById("side-user-points").textContent = `${myStats.points} pts`;
    
    // Calcular porcentaje de aciertos
    const state = getAppState();
    const playedMatches = state.matches.filter(m => m.status === "jugado").length;
    let accuracy = 0;
    if (playedMatches > 0) {
      accuracy = Math.round(((myStats.exact + myStats.trend) / playedMatches) * 100);
    }
    document.getElementById("side-user-accuracy").textContent = `${accuracy}%`;
  }
}

// Variable de control para las pestañas de los pronósticos
let activePredictionsTab = "Grupo A";

// 2. Renderizar Pronósticos (Vista Entradas de Estadio con Pestañas)
function renderPredictions() {
  if (!currentUser) return;

  const state = getAppState();
  const userPreds = state.predictions[`${currentUser.email}||${currentGroupId}`] || state.predictions[currentUser.email] || {};
  const container = document.getElementById("matches-tickets-container");
  const tabsBar = document.getElementById("predictions-tabs-bar");
  
  container.innerHTML = "";

  if (state.matches.length === 0) {
    container.innerHTML = `<div class="empty-state"><div class="empty-state-icon">🎟️</div>No hay partidos cargados en la base de datos.</div>`;
    if (tabsBar) tabsBar.innerHTML = "";
    return;
  }

  // Obtener lista de las 12 grupos de la fase de grupos y añadir las fases finales individuales
  const groupNames = ["Grupo A", "Grupo B", "Grupo C", "Grupo D", "Grupo E", "Grupo F", "Grupo G", "Grupo H", "Grupo I", "Grupo J", "Grupo K", "Grupo L"];
  const knockoutTabs = ["Dieciseisavos", "Octavos", "Cuartos", "Semifinales", "Finales"];
  const allTabs = [...groupNames, ...knockoutTabs];

  // Validación de seguridad por si cambia el estado
  if (!allTabs.includes(activePredictionsTab)) {
    activePredictionsTab = "Grupo A";
  }

  // Renderizar la barra de sub-pestañas
  if (tabsBar) {
    tabsBar.innerHTML = "";
    allTabs.forEach(tabName => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "tab-btn";
      if (knockoutTabs.includes(tabName)) {
        btn.classList.add("finales-tab");
      }
      if (tabName === activePredictionsTab) {
        btn.classList.add("active");
      }
      btn.textContent = tabName;
      btn.addEventListener("click", () => switchPredictionsTab(tabName));
      tabsBar.appendChild(btn);
    });
  }

  // Filtrar los partidos a mostrar en la pestaña seleccionada
  let matchesToRender = [];
  if (knockoutTabs.includes(activePredictionsTab)) {
    if (activePredictionsTab === "Dieciseisavos") {
      matchesToRender = state.matches.filter(m => m.stage === "Dieciseisavos de Final");
    } else if (activePredictionsTab === "Octavos") {
      matchesToRender = state.matches.filter(m => m.stage === "Octavos de Final");
    } else if (activePredictionsTab === "Cuartos") {
      matchesToRender = state.matches.filter(m => m.stage === "Cuartos de Final");
    } else if (activePredictionsTab === "Semifinales") {
      matchesToRender = state.matches.filter(m => m.stage === "Semifinal");
    } else if (activePredictionsTab === "Finales") {
      matchesToRender = state.matches.filter(m => m.stage === "Tercer Puesto" || m.stage === "Gran Final");
    }
  } else {
    matchesToRender = state.matches.filter(m => m.stage === "Fase de Grupos" && m.group === activePredictionsTab);
  }

  if (matchesToRender.length === 0) {
    container.innerHTML = `<div class="empty-state">No hay partidos registrados en esta sección.</div>`;
    return;
  }

  // Encabezado de la pestaña actual
  const tabHeader = document.createElement("div");
  tabHeader.style.margin = "10px 0 20px 0";
  if (knockoutTabs.includes(activePredictionsTab)) {
    tabHeader.innerHTML = `<h2 class="comic-banner secondary" style="font-size: 1.6rem; transform: rotate(1deg); padding: 8px 16px; margin-bottom: 10px;">${activePredictionsTab} 🏆</h2>`;
  } else {
    tabHeader.innerHTML = `<h2 class="comic-banner primary" style="font-size: 1.6rem; transform: rotate(-1deg); padding: 8px 16px; margin-bottom: 10px;">${activePredictionsTab} ⚽</h2>`;
  }
  container.appendChild(tabHeader);

  // Renderizar encuentros secuencialmente
  matchesToRender.forEach(match => {
    const matchIndex = state.matches.findIndex(m => m.id === match.id);
    const pred = userPreds[match.id] || { predA: "", predB: "" };

    const ticketWrapper = document.createElement("div");
    ticketWrapper.className = "ticket-wrapper";
    ticketWrapper.innerHTML = getMatchTicketHTML(match, pred, matchIndex);
    container.appendChild(ticketWrapper);
  });
}

// 3. Renderizar Vista de Fixture
function renderFixtureView() {
  const container = document.getElementById("fixture-list-container");
  if (!container) return;
  container.innerHTML = "";

  const state = getAppState();
  if (state.matches.length === 0) {
    container.innerHTML = `<div class="empty-state">No hay partidos cargados.</div>`;
    return;
  }

  const userPreds = state.predictions[`${currentUser.email}||${currentGroupId}`] || state.predictions[currentUser.email] || {};
  console.log("Fixture Debug:", {
    emailKey: `${currentUser.email}||${currentGroupId}`,
    userPreds: userPreds,
    availableKeys: Object.keys(state.predictions)
  });

  // Determinar hoy en Bolivia (GMT-4)
  const nowBolivia = new Date(Date.now() - 4 * 60 * 60 * 1000);
  const todayStr = nowBolivia.toISOString().split('T')[0];

  const isMatchToday = (match) => {
    if (!match.isoDate) return false;
    return match.isoDate.split('T')[0] === todayStr;
  };

  // Lógica de prioridad: 1. Hoy, 2. Faltan pronosticar (no bloqueado), 3. El resto
  const getMatchPriority = (m) => {
    const isToday = isMatchToday(m);
    const pred = userPreds[m.id];
    const hasPrediction = pred && pred.predA !== null && pred.predA !== undefined && pred.predA !== "" &&
                         pred.predB !== null && pred.predB !== undefined && pred.predB !== "";
    const isPlayed = m.status === "jugado";
    const isLocked = isPlayed || isMatchLocked(m);
    const isMissing = !hasPrediction && !isLocked;

    if (isToday) return 1;
    if (isMissing) return 2;
    return 3;
  };

  const sortedMatches = [...state.matches].sort((a, b) => {
    const priorityA = getMatchPriority(a);
    const priorityB = getMatchPriority(b);
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }
    if (!a.isoDate) return 1;
    if (!b.isoDate) return -1;
    return new Date(a.isoDate) - new Date(b.isoDate);
  });

  let filteredMatches = sortedMatches;
  if (currentFixtureFilter === "today") {
    filteredMatches = sortedMatches.filter(m => isMatchToday(m));
  } else if (currentFixtureFilter === "pending") {
    filteredMatches = sortedMatches.filter(m => {
      const pred = userPreds[m.id];
      const hasPrediction = pred && pred.predA !== null && pred.predA !== undefined && pred.predA !== "" &&
                           pred.predB !== null && pred.predB !== undefined && pred.predB !== "";
      const isPlayed = m.status === "jugado";
      const isLocked = isPlayed || isMatchLocked(m);
      return !hasPrediction && !isLocked;
    });
  }

  if (filteredMatches.length === 0) {
    container.innerHTML = `
      <div class="comic-card" style="grid-column: 1 / -1; text-align: center; padding: 40px; border-color: var(--secondary); background: var(--panel-bg);">
        <div style="font-size: 3rem; margin-bottom: 15px;">📅</div>
        <h3 style="font-family: var(--font-comic); font-size: 1.5rem; margin-bottom: 10px; color: var(--secondary);">No se encontraron partidos</h3>
        <p style="color: var(--gray);">Intenta cambiar el filtro de visualización de arriba.</p>
      </div>
    `;
    return;
  }

  filteredMatches.forEach(match => {
    const pred = userPreds[match.id];
    const hasPrediction = pred && pred.predA !== null && pred.predA !== undefined && pred.predA !== "" &&
                         pred.predB !== null && pred.predB !== undefined && pred.predB !== "";
    const isPlayed = match.status === "jugado";
    const isLocked = isPlayed || isMatchLocked(match);
    const isToday = isMatchToday(match);

    const card = document.createElement("div");
    card.className = "fixture-match-card";
    if (isToday) {
      card.classList.add("today-highlight");
    }

    const codeA = match.codeA || COUNTRY_CODES[match.teamA.toLowerCase().trim()];
    const codeB = match.codeB || COUNTRY_CODES[match.teamB.toLowerCase().trim()];
    const flagA = codeA 
      ? `<img src="https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/${codeA}.svg" alt="${match.teamA}" style="width: 20px; height: 14px; border: 1px solid rgba(255,255,255,0.2); border-radius: 2px;">`
      : `<span>${match.emojiA || "🏳️"}</span>`;
    const flagB = codeB 
      ? `<img src="https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/${codeB}.svg" alt="${match.teamB}" style="width: 20px; height: 14px; border: 1px solid rgba(255,255,255,0.2); border-radius: 2px;">`
      : `<span>${match.emojiB || "🏳️"}</span>`;

    const groupBadge = match.group ? ` | ${match.group}` : "";
    const headerHTML = `
      <div class="fixture-card-header">
        <span>${match.stage.toUpperCase()}${groupBadge}</span>
        ${isToday ? `<span style="background: var(--accent); color: var(--black); padding: 2px 6px; border-radius: 4px; font-weight: 800; font-family: var(--font-comic); font-size: 0.75rem;">HOY ⚽</span>` : ""}
      </div>
    `;

    const teamsHTML = `
      <div class="fixture-teams-row">
        <div class="fixture-team team-a">
          ${flagA}
          <span class="full-name">${match.teamA}</span>
          <span class="short-name" style="display: none;">${getTeamAbbreviation(match.teamA)}</span>
        </div>
        <div class="fixture-vs">VS</div>
        <div class="fixture-team team-b">
          <span class="full-name">${match.teamB}</span>
          <span class="short-name" style="display: none;">${getTeamAbbreviation(match.teamB)}</span>
          ${flagB}
        </div>
      </div>
    `;

    let statusBadgeHTML = "";
    let actionBtnHTML = "";

    if (hasPrediction) {
      statusBadgeHTML = `
        <span class="fixture-status-badge predicted">
          🟢 Pronosticado (${pred.predA} - ${pred.predB})
        </span>
      `;
    } else {
      if (isLocked) {
        statusBadgeHTML = `
          <span class="fixture-status-badge missing" style="background: var(--gray); color: var(--black); opacity: 0.7;">
            🔒 Cerrado sin pronóstico
          </span>
        `;
      } else {
        statusBadgeHTML = `
          <span class="fixture-status-badge missing">
            🔴 Falta Pronosticar
          </span>
        `;
        actionBtnHTML = `
          <button class="btn-fixture-go-predict" data-match-id="${match.id}">
            ✍️ Pronosticar
          </button>
        `;
      }
    }

    card.innerHTML = `
      ${headerHTML}
      ${teamsHTML}
      <div style="font-size: 0.75rem; color: var(--accent); font-weight: bold; text-align: center; margin: 5px 0 10px 0;">
        📅 ${match.date}
      </div>
      <div class="fixture-card-footer">
        ${statusBadgeHTML}
        ${actionBtnHTML}
      </div>
    `;

    const btn = card.querySelector(".btn-fixture-go-predict");
    if (btn) {
      btn.addEventListener("click", () => {
        let targetTab = "Grupo A";
        if (match.stage === "Fase de Grupos") {
          targetTab = match.group;
        } else if (match.stage === "Dieciseisavos de Final") {
          targetTab = "Dieciseisavos";
        } else if (match.stage === "Octavos de Final") {
          targetTab = "Octavos";
        } else if (match.stage === "Cuartos de Final") {
          targetTab = "Cuartos";
        } else if (match.stage === "Semifinal") {
          targetTab = "Semifinales";
        } else if (match.stage === "Tercer Puesto" || match.stage === "Gran Final") {
          targetTab = "Finales";
        }

        switchView("predictions").then(() => {
          switchPredictionsTab(targetTab).then(() => {
            setTimeout(() => {
              const el = document.getElementById(`ticket-${match.id}`);
              if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                el.style.transition = "all 0.5s ease";
                el.style.boxShadow = "0 0 25px var(--accent)";
                el.style.borderColor = "var(--accent)";
                setTimeout(() => {
                  el.style.boxShadow = "";
                  el.style.borderColor = "";
                }, 2500);
              }
            }, 350);
          });
        });
      });
    }

    container.appendChild(card);
  });
}

// Función para verificar si el partido ya está cerrado para pronósticos (menos de 15 minutos antes del inicio)
function isMatchLocked(match) {
  if (!match.isoDate) return false;
  const matchTime = new Date(match.isoDate).getTime();
  const limitTime = matchTime - 15 * 60 * 1000; // Límite: 15 minutos antes del partido
  const now = Date.now();
  return now > limitTime;
}

// Función auxiliar para construir el HTML de la entrada de estadio
function getMatchTicketHTML(match, pred, index) {
  const isPlayed = match.status === "jugado";
  const isLocked = isPlayed || isMatchLocked(match);

  // Determinar puntos obtenidos y sticker si ya se jugó
  let pointsStickerHTML = "";
  if (isPlayed) {
    const pointsEarned = calculatePredictionPoints(pred.predA, pred.predB, match.scoreA, match.scoreB);
    if (pointsEarned === 3) {
      pointsStickerHTML = `<div class="sticker-points exact">¡EXACTO! +3 PTS</div>`;
    } else if (pointsEarned === 1) {
      pointsStickerHTML = `<div class="sticker-points">ACERTADO +1 PT</div>`;
    } else {
      pointsStickerHTML = `<div class="sticker-points fail">FALLADO 0 PTS</div>`;
    }
  }

  // Determinar código de bandera resolviendo de forma defensiva si no está en la base de datos
  const codeA = match.codeA || COUNTRY_CODES[match.teamA.toLowerCase().trim()];
  const codeB = match.codeB || COUNTRY_CODES[match.teamB.toLowerCase().trim()];

  const flagAHTML = codeA 
    ? `<img class="team-flag-img" src="https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/${codeA}.svg" alt="${match.teamA}">`
    : `<span class="team-flag">${match.emojiA}</span>`;

  const flagBHTML = codeB 
    ? `<img class="team-flag-img" src="https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/${codeB}.svg" alt="${match.teamB}">`
    : `<span class="team-flag">${match.emojiB}</span>`;

  // Texto de estado y resultado real
  let statusTextHTML = "";
  if (isPlayed) {
    statusTextHTML = `Resultado Real: <strong style="color: var(--white);">${match.scoreA} - ${match.scoreB}</strong>`;
  } else if (isMatchLocked(match)) {
    statusTextHTML = `<span style="color: var(--secondary); font-weight: bold;">🔒 Pronósticos cerrados (15m límite)</span>`;
  } else {
    statusTextHTML = `<span style="color: var(--primary);">🟢 Abierto para pronósticos</span>`;
  }

  return `
    <div class="ticket" id="ticket-${match.id}">
      <!-- Cuerpo Principal: Detalles del Encuentro -->
      <div class="ticket-body">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span class="match-stage">${match.stage}</span>
          <span style="font-size: 0.8rem; font-weight: 800; color: var(--accent);">G-GATE ${index + 1}</span>
        </div>

        <div class="match-teams">
          <!-- Equipo A -->
          <div class="team-container">
            ${flagAHTML}
            <span class="team-name" title="${match.teamA}">
              <span class="full-name">${match.teamA}</span>
              <span class="short-name" style="display: none;">${getTeamAbbreviation(match.teamA)}</span>
            </span>
          </div>

          <!-- Goles Pronóstico -->
          <div class="score-inputs" data-match-id="${match.id}" style="display: flex; align-items: center; gap: 6px;">
            <input type="number" class="score-field pred-a" min="0" placeholder="-" 
              value="${pred.predA !== null && pred.predA !== undefined ? pred.predA : ""}" 
              ${isLocked ? "disabled" : ""}>
            <span class="score-separator">:</span>
            <input type="number" class="score-field pred-b" min="0" placeholder="-" 
              value="${pred.predB !== null && pred.predB !== undefined ? pred.predB : ""}" 
              ${isLocked ? "disabled" : ""}>
            ${!isLocked ? `<button type="button" class="comic-btn btn-random-single" style="padding: 4px 6px; font-size: 0.9rem; border-radius: 6px; border-width: 2px; box-shadow: var(--comic-shadow-sm); background: var(--accent); color: var(--black); line-height: 1;" title="Auto-completar este partido">🎲</button>` : ''}
          </div>

          <!-- Equipo B -->
          <div class="team-container">
            ${flagBHTML}
            <span class="team-name" title="${match.teamB}">
              <span class="full-name">${match.teamB}</span>
              <span class="short-name" style="display: none;">${getTeamAbbreviation(match.teamB)}</span>
            </span>
          </div>
        </div>

        <!-- Estado de cierre o resultado -->
        <div style="font-size: 0.8rem; color: var(--gray); text-align: center;">
          ${statusTextHTML}
        </div>
        <!-- Fecha y hora del partido -->
        <div style="font-size: 0.75rem; color: var(--accent); text-align: center; font-weight: bold; margin-top: 5px;">
          📅 ${match.date}
        </div>
      </div>

      <!-- Línea de corte perforada -->
      <div class="ticket-divider"></div>

      <!-- Talón del Ticket -->
      <div class="ticket-stub">
        <div class="ticket-date">${match.date}</div>
        
        <div style="width: 100%;">
          <div class="ticket-gate">ACCESO A</div>
          <div class="barcode">
            <span class="bar thin"></span>
            <span class="bar thick"></span>
            <span class="bar"></span>
            <span class="bar wide"></span>
            <span class="bar thin"></span>
            <span class="bar"></span>
            <span class="bar thick"></span>
            <span class="bar thin"></span>
            <span class="bar wide"></span>
            <span class="bar"></span>
          </div>
        </div>
      </div>

      <!-- Sticker flotante de puntos si aplica -->
      ${pointsStickerHTML}
    </div>
  `;
}

// Función para cambiar de pestaña con guardado automático silencioso
async function switchPredictionsTab(tabName) {
  if (currentUser) {
    await saveAllPredictionsFromUI(true); // Guardar silenciosamente el tab actual
  }
  activePredictionsTab = tabName;
  renderPredictions();
}

// Guardar todos los pronósticos ingresados en la interfaz (Enforzando límite de 30 minutos)
async function saveAllPredictionsFromUI(silent = false) {
  if (!currentUser) return;

  const isSilent = (silent === true);
  const scoreContainers = document.querySelectorAll(".score-inputs");
  const state = getAppState();
  let savedCount = 0;
  let skippedCount = 0;

  const promises = [];

  scoreContainers.forEach(container => {
    const matchId = container.getAttribute("data-match-id");
    const match = state.matches.find(m => m.id === matchId);

    // Solo permitir guardar si no está bloqueado (menos de 30 mins) y no se ha jugado
    if (match && !isMatchLocked(match) && match.status !== "jugado") {
      const valA = container.querySelector(".pred-a").value;
      const valB = container.querySelector(".pred-b").value;

      if (valA === "" || valB === "") {
        promises.push(saveUserPrediction(currentUser.email, matchId, null, null, currentGroupId));
      } else {
        promises.push(saveUserPrediction(currentUser.email, matchId, parseInt(valA), parseInt(valB), currentGroupId));
        savedCount++;
      }
    } else {
      skippedCount++;
    }
  });

  if (promises.length > 0) {
    await Promise.all(promises);
  }

  if (!isSilent) {
    // Verificar si faltan pronósticos por completar únicamente en la pestaña/grupo actual
    let tabIncomplete = 0;
    scoreContainers.forEach(container => {
      const matchId = container.getAttribute("data-match-id");
      const match = state.matches.find(m => m.id === matchId);
      if (match && !isMatchLocked(match) && match.status !== "jugado") {
        const valA = container.querySelector(".pred-a").value;
        const valB = container.querySelector(".pred-b").value;
        if (valA === "" || valB === "") {
          tabIncomplete++;
        }
      }
    });

    // Mostrar alerta de éxito estilo Comic
    const alertBox = document.getElementById("predictions-alert");
    if (alertBox) {
      alertBox.className = "alert-comic success";
      let msg = `¡Tus pronósticos se han guardado con éxito! (${savedCount} marcadores registrados en esta pestaña)`;
      if (skippedCount > 0) {
        msg += ` [Se omitieron ${skippedCount} partidos cerrados]`;
      }
      alertBox.textContent = msg;
      alertBox.classList.remove("d-none");
      
      // Auto desvanecer alerta y refrescar vista
      setTimeout(() => {
        alertBox.className = "alert-comic success d-none";
      }, 4000);
    }

    // Confirmación nativa de guardado
    if (tabIncomplete > 0) {
      alert(`⚠️ Nota: Tienes ${tabIncomplete} partido(s) pendiente(s) de pronosticar en esta sección (${activePredictionsTab}). Si no completas los resultados, el partido quedará sin resultado y no sumará puntos.`);
    } else {
      alert("¡Tus pronósticos se han guardado con éxito!");
    }

    // Volver a renderizar para fijar estilos
    renderPredictions();
  }
}

// Rellenar de forma aleatoria y realista
function fillRandomPredictions() {
  if (!currentUser) return;

  // Lista de marcadores realistas de fútbol (ponderando marcadores lógicos)
  const realisticScores = [
    [1, 0], [2, 0], [2, 1], [3, 0], [3, 1], [3, 2],
    [0, 0], [1, 1], [2, 2],
    [0, 1], [0, 2], [1, 2], [0, 3], [1, 3], [2, 3]
  ];

  const scoreContainers = document.querySelectorAll(".score-inputs");
  let count = 0;

  scoreContainers.forEach(container => {
    const inputA = container.querySelector(".pred-a");
    const inputB = container.querySelector(".pred-b");

    // Rellenar solo si el partido no se ha jugado (inputs no deshabilitados)
    if (inputA && inputB && !inputA.disabled && !inputB.disabled) {
      const randomIndex = Math.floor(Math.random() * realisticScores.length);
      const [scoreA, scoreB] = realisticScores[randomIndex];

      inputA.value = scoreA;
      inputB.value = scoreB;
      count++;
    }
  });

  // Alerta de éxito estilo Comic
  const alertBox = document.getElementById("predictions-alert");
  alertBox.className = "alert-comic success";
  alertBox.textContent = `🎲 ¡Se completaron ${count} pronósticos aleatorios en pantalla! Revisa los resultados y haz clic en "GUARDAR PRONÓSTICOS" para registrarlos.`;
  alertBox.classList.remove("d-none");

  setTimeout(() => {
    alertBox.classList.add("d-none");
  }, 5000);
}

// 3. Renderizar Panel Admin (Cargar Resultados Reales con Banderas y Gestionar Grupos)
function renderAdmin() {
  const state = getAppState();

  // Rellenar selector de grupos para administración de usuarios
  if (adminSelectUserGroup) {
    const previousVal = adminSelectUserGroup.value;
    adminSelectUserGroup.innerHTML = "";
    
    if (state.groups.length === 0) {
      const opt = document.createElement("option");
      opt.value = "";
      opt.textContent = "No hay grupos creados.";
      adminSelectUserGroup.appendChild(opt);
    } else {
      state.groups.forEach(g => {
        const opt = document.createElement("option");
        opt.value = g.id;
        opt.textContent = g.name;
        if (g.id === previousVal) {
          opt.selected = true;
        }
        adminSelectUserGroup.appendChild(opt);
      });
    }
  }

  // Renderizar lista de usuarios del grupo seleccionado
  renderAdminUsersList();

  // A. RENDERIZAR LISTADO DE GRUPOS EXISTENTES
  const groupsContainer = document.getElementById("admin-groups-list");
  if (groupsContainer) {
    groupsContainer.innerHTML = "";

    if (state.groups.length === 0) {
      groupsContainer.innerHTML = `<p class="empty-state">No hay grupos de juego registrados.</p>`;
    } else {
      state.groups.forEach(group => {
        const isDivided = group.mode === "dividida";
        const row = document.createElement("div");
        row.className = "admin-group-row";
        row.style.display = "flex";
        row.style.flexWrap = "wrap";
        row.style.gap = "10px";
        row.style.alignItems = "center";
        row.style.marginBottom = "15px";
        row.style.paddingBottom = "10px";
        row.style.borderBottom = "1px dashed rgba(255, 255, 255, 0.1)";

        row.innerHTML = `
          <div style="flex: 1 1 100%; display: flex; flex-wrap: wrap; gap: 10px; align-items: flex-end;">
            <div style="flex: 2; min-width: 150px;">
              <span style="font-size: 0.75rem; color: var(--gray); display: block; margin-bottom: 2px;">Nombre del Grupo</span>
              <input type="text" class="comic-input edit-group-name" value="${group.name}" style="margin-bottom: 0; padding: 6px 10px; font-size: 0.9rem;">
            </div>
            
            <div style="width: 120px;">
              <span style="font-size: 0.75rem; color: var(--gray); display: block; margin-bottom: 2px;">Modo de Juego</span>
              <select class="comic-input edit-group-mode" style="margin-bottom: 0; padding: 6px 10px; font-size: 0.9rem;">
                <option value="unica" ${group.mode === 'unica' ? 'selected' : ''}>Fase Única</option>
                <option value="dividida" ${group.mode === 'dividida' ? 'selected' : ''}>Fases Divididas</option>
              </select>
            </div>

            <!-- Contenedor Única -->
            <div class="edit-single-phase-fields ${isDivided ? 'd-none' : ''}" style="display: flex; gap: 10px;">
              <div style="width: 80px;">
                <span style="font-size: 0.75rem; color: var(--gray); display: block; margin-bottom: 2px;">Cuota</span>
                <input type="number" class="comic-input edit-group-fee" min="0" value="${group.entryFee}" style="margin-bottom: 0; padding: 6px 10px; font-size: 0.9rem;">
              </div>
              <div style="width: 120px;">
                <span style="font-size: 0.75rem; color: var(--gray); display: block; margin-bottom: 2px;">Premios</span>
                <select class="comic-input edit-group-dist" style="margin-bottom: 0; padding: 6px 10px; font-size: 0.9rem;">
                  <option value="1st" ${group.potDist === '1st' ? 'selected' : ''}>🥇 100% 1er</option>
                  <option value="1st-2nd" ${group.potDist === '1st-2nd' ? 'selected' : ''}>🥈 70% / 30%</option>
                  <option value="1st-2nd-3rd" ${group.potDist === '1st-2nd-3rd' ? 'selected' : ''}>🥉 60% / 30% / 10%</option>
                </select>
              </div>
            </div>

            <!-- Contenedor Dividida -->
            <div class="edit-split-phase-fields ${isDivided ? '' : 'd-none'}" style="display: flex; gap: 10px; flex-wrap: wrap;">
              <div style="width: 80px;">
                <span style="font-size: 0.75rem; color: var(--primary); display: block; margin-bottom: 2px;">Cuota G</span>
                <input type="number" class="comic-input edit-group-fee-g" min="0" value="${group.feeG !== undefined ? group.feeG : 10}" style="margin-bottom: 0; padding: 6px 10px; font-size: 0.9rem;">
              </div>
              <div style="width: 120px;">
                <span style="font-size: 0.75rem; color: var(--primary); display: block; margin-bottom: 2px;">Premios G</span>
                <select class="comic-input edit-group-dist-g" style="margin-bottom: 0; padding: 6px 10px; font-size: 0.9rem;">
                  <option value="1st" ${group.distG === '1st' ? 'selected' : ''}>🥇 100% 1er</option>
                  <option value="1st-2nd" ${group.distG === '1st-2nd' ? 'selected' : ''}>🥈 70% / 30%</option>
                  <option value="1st-2nd-3rd" ${group.distG === '1st-2nd-3rd' ? 'selected' : ''}>🥉 60% / 30% / 10%</option>
                </select>
              </div>
              <div style="width: 80px;">
                <span style="font-size: 0.75rem; color: var(--secondary); display: block; margin-bottom: 2px;">Cuota Ll</span>
                <input type="number" class="comic-input edit-group-fee-k" min="0" value="${group.feeK !== undefined ? group.feeK : 10}" style="margin-bottom: 0; padding: 6px 10px; font-size: 0.9rem;">
              </div>
              <div style="width: 120px;">
                <span style="font-size: 0.75rem; color: var(--secondary); display: block; margin-bottom: 2px;">Premios Ll</span>
                <select class="comic-input edit-group-dist-k" style="margin-bottom: 0; padding: 6px 10px; font-size: 0.9rem;">
                  <option value="1st" ${group.distK === '1st' ? 'selected' : ''}>🥇 100% 1er</option>
                  <option value="1st-2nd" ${group.distK === '1st-2nd' ? 'selected' : ''}>🥈 70% / 30%</option>
                  <option value="1st-2nd-3rd" ${group.distK === '1st-2nd-3rd' ? 'selected' : ''}>🥉 60% / 30% / 10%</option>
                </select>
              </div>
            </div>

            <div style="flex: 2; min-width: 150px;">
              <span style="font-size: 0.75rem; color: var(--gray); display: block; margin-bottom: 2px;">Enlace WhatsApp</span>
              <input type="url" class="comic-input edit-group-whatsapp" value="${group.whatsappLink || ''}" placeholder="https://chat.whatsapp.com/..." style="margin-bottom: 0; padding: 6px 10px; font-size: 0.9rem;">
            </div>
            
            <div style="display: flex; gap: 5px;">
              <button class="comic-btn comic-btn-primary btn-update-group" style="padding: 6px 12px; font-size: 0.85rem; border-width: 2px; height: 38px;">
                Guardar 💾
              </button>
              <button class="comic-btn comic-btn-secondary btn-delete-group" style="padding: 6px 12px; font-size: 0.85rem; border-width: 2px; height: 38px;">
                Eliminar 🗑️
              </button>
            </div>
          </div>
        `;

        // Toggle de campos en el listado
        const modeSelect = row.querySelector(".edit-group-mode");
        const divSingle = row.querySelector(".edit-single-phase-fields");
        const divSplit = row.querySelector(".edit-split-phase-fields");
        
        modeSelect.addEventListener("change", () => {
          if (modeSelect.value === "dividida") {
            divSingle.classList.add("d-none");
            divSplit.classList.remove("d-none");
          } else {
            divSingle.classList.remove("d-none");
            divSplit.classList.add("d-none");
          }
        });

        // Modificar Grupo
        row.querySelector(".btn-update-group").addEventListener("click", async () => {
          const newName = row.querySelector(".edit-group-name").value.trim();
          const newMode = modeSelect.value;
          const newWhatsappLink = row.querySelector(".edit-group-whatsapp").value.trim();

          let newFee = 0;
          let newPotDist = "1st";
          let newFeeG = 0;
          let newFeeK = 0;
          let newDistG = "1st";
          let newDistK = "1st";

          if (newMode === "dividida") {
            newFeeG = parseFloat(row.querySelector(".edit-group-fee-g").value) || 0;
            newFeeK = parseFloat(row.querySelector(".edit-group-fee-k").value) || 0;
            newDistG = row.querySelector(".edit-group-dist-g").value;
            newDistK = row.querySelector(".edit-group-dist-k").value;
            newFee = newFeeG + newFeeK;
            newPotDist = newDistG; // fallback
          } else {
            newFee = parseFloat(row.querySelector(".edit-group-fee").value) || 0;
            newPotDist = row.querySelector(".edit-group-dist").value;
          }

          if (!newName) {
            alert("El nombre del grupo no puede estar vacío.");
            return;
          }

          await updateGroup(group.id, newName, newFee, newPotDist, newWhatsappLink, newMode, newFeeG, newFeeK, newDistG, newDistK);
          
          // Refrescar selectores de Auth
          populateGroupsDropdown();
          
          // Feedback visual
          const btn = row.querySelector(".btn-update-group");
          btn.textContent = "Guardado ✔";
          btn.style.backgroundColor = "var(--accent)";
          btn.style.color = "var(--black)";
          setTimeout(() => {
            btn.textContent = "Guardar 💾";
            btn.style.backgroundColor = "var(--primary)";
            btn.style.color = "var(--black)";
          }, 1200);
        });

        // Eliminar Grupo
        row.querySelector(".btn-delete-group").addEventListener("click", async () => {
          if (confirm(`¿Estás seguro de que deseas eliminar el grupo "${group.name}"? Esta acción borrará permanentemente a los usuarios y pronósticos asociados a este grupo.`)) {
            await deleteGroup(group.id);
            
            // Si el grupo eliminado era el seleccionado, cambiar al primero disponible
            if (currentGroupId === group.id) {
              const state = getAppState();
              const nextGroup = state.groups[0] ? state.groups[0].id : "g1";
              currentGroupId = nextGroup;
              localStorage.setItem("session_group_id", nextGroup);
              updateHeaderUI();
            }

            // Refrescar selectores y volver a renderizar todo el panel
            populateGroupsDropdown();
            renderAdmin();
          }
        });

        groupsContainer.appendChild(row);
      });
    }
  }

  // B. RENDERIZAR LISTADO DE PARTIDOS
  const container = document.getElementById("admin-matches-list");
  container.innerHTML = "";

  if (state.matches.length === 0) {
    container.innerHTML = `<p class="empty-state">No hay partidos registrados.</p>`;
    return;
  }

  state.matches.forEach(match => {
    const card = document.createElement("div");
    card.className = "admin-match-card";
    card.id = `admin-card-${match.id}`;

    const scoreAVal = match.scoreA !== null ? match.scoreA : "";
    const scoreBVal = match.scoreB !== null ? match.scoreB : "";

    const codeA = match.codeA || COUNTRY_CODES[match.teamA.toLowerCase().trim()];
    const codeB = match.codeB || COUNTRY_CODES[match.teamB.toLowerCase().trim()];

    const flagAAdmin = codeA 
      ? `<img src="https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/${codeA}.svg" alt="${match.teamA}" style="width: 24px; height: 16px; border: 1px solid var(--black); border-radius: 2px; vertical-align: middle; margin-right: 5px;">`
      : `<span style="margin-right: 5px;">${match.emojiA}</span>`;

    const flagBAdmin = codeB 
      ? `<img src="https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/${codeB}.svg" alt="${match.teamB}" style="width: 24px; height: 16px; border: 1px solid var(--black); border-radius: 2px; vertical-align: middle; margin-left: 5px; margin-right: 5px;">`
      : `<span style="margin-left: 5px; margin-right: 5px;">${match.emojiB}</span>`;

    let teamsDisplayHTML = "";
    if (match.stage !== "Fase de Grupos") {
      teamsDisplayHTML = `
        <div style="display: flex; align-items: center; gap: 8px; font-weight: 800; margin-top: 5px; flex-wrap: wrap;">
          <div style="display: inline-flex; align-items: center; gap: 4px;">
            ${flagAAdmin}
            <input type="text" class="comic-input admin-team-a" value="${match.teamA}" placeholder="Equipo A" style="width: 150px; margin-bottom: 0; padding: 4px 8px; font-size: 0.85rem;">
          </div>
          <span style="color: var(--gray);">vs</span>
          <div style="display: inline-flex; align-items: center; gap: 4px;">
            <input type="text" class="comic-input admin-team-b" value="${match.teamB}" placeholder="Equipo B" style="width: 150px; margin-bottom: 0; padding: 4px 8px; font-size: 0.85rem;">
            ${flagBAdmin}
          </div>
        </div>
      `;
    } else {
      teamsDisplayHTML = `
        <div style="display: flex; align-items: center; gap: 10px; font-weight: 800; margin-top: 5px;">
          <span style="display: inline-flex; align-items: center;">${flagAAdmin} ${match.teamA}</span>
          <span style="color: var(--gray);">vs</span>
          <span style="display: inline-flex; align-items: center;">${flagBAdmin} ${match.teamB}</span>
        </div>
      `;
    }

    card.innerHTML = `
      <div class="admin-match-details">
        <div style="font-size: 0.8rem; color: var(--accent); font-weight: bold; margin-bottom: 5px;">
          ${match.stage.toUpperCase()} | ${match.date}
        </div>
        ${teamsDisplayHTML}
      </div>

      <div class="admin-match-scores" data-match-id="${match.id}">
        <input type="number" class="score-field admin-score-a" min="0" placeholder="-" value="${scoreAVal}" style="width: 45px; height: 45px;">
        <span style="font-weight: bold; color: var(--secondary);">:</span>
        <input type="number" class="score-field admin-score-b" min="0" placeholder="-" value="${scoreBVal}" style="width: 45px; height: 45px;">
        
        <button class="comic-btn comic-btn-primary btn-save-admin-score" style="padding: 10px 15px; font-size: 0.9rem; margin-left: 10px;">
          OK
        </button>
      </div>
    `;

    // Asignar evento al botón de guardado individual de resultado real
    card.querySelector(".btn-save-admin-score").addEventListener("click", async () => {
      const inputA = card.querySelector(".admin-score-a").value;
      const inputB = card.querySelector(".admin-score-b").value;

      // Si es fase eliminatoria, obtener también los inputs de los nombres de equipo
      if (match.stage !== "Fase de Grupos") {
        const teamAVal = card.querySelector(".admin-team-a").value.trim();
        const teamBVal = card.querySelector(".admin-team-b").value.trim();
        if (teamAVal && teamBVal) {
          await updateMatchTeams(match.id, teamAVal, teamBVal);
        }
      }

      if (inputA === "" || inputB === "") {
        // Restaurar a pendiente
        await updateMatchResult(match.id, null, null);
        alert(`Partido devuelto a PENDIENTE.`);
      } else {
        const isUpdate = match.status === "jugado";
        await updateMatchResult(match.id, parseInt(inputA), parseInt(inputB));
        
        // Efecto visual rápido de guardado exitoso en el botón
        const btn = card.querySelector(".btn-save-admin-score");
        const originalText = btn.textContent;
        btn.textContent = "✔";
        btn.style.backgroundColor = "var(--accent)";
        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.backgroundColor = "var(--primary)";
        }, 1000);

        if (isUpdate) {
          alert(`¡El resultado del partido se ha modificado correctamente! La tabla de clasificación y los puntos de todos los usuarios se han recalculado.`);
        } else {
          alert(`¡Resultado guardado con éxito!`);
        }
      }
      
      // Volver a cargar el listado del admin para refrescar valores
      renderAdmin();
    });

    container.appendChild(card);
  });
}

// Renderizar lista de usuarios/participantes del grupo seleccionado para editar/eliminar
function renderAdminUsersList() {
  if (!adminUsersList) return;
  adminUsersList.innerHTML = "";

  const state = getAppState();
  const groupId = adminSelectUserGroup ? adminSelectUserGroup.value : "";
  if (!groupId) {
    adminUsersList.innerHTML = `<p class="empty-state">Selecciona un grupo para listar sus participantes.</p>`;
    return;
  }

  // Filtrar los usuarios que pertenecen a este grupo
  const groupUsers = state.users.filter(u => u.groupIds && u.groupIds.includes(groupId));

  if (groupUsers.length === 0) {
    adminUsersList.innerHTML = `<p class="empty-state">No hay participantes registrados en este grupo.</p>`;
    return;
  }

  groupUsers.forEach(user => {
    // No permitir eliminar al administrador principal desde aquí (seguridad básica)
    const isAdminUser = user.email === "lapollapatojv@gmail.com";

    const row = document.createElement("div");
    row.className = "admin-user-row";
    row.style.display = "flex";
    row.style.flexWrap = "wrap";
    row.style.gap = "10px";
    row.style.alignItems = "center";
    row.style.marginBottom = "15px";
    row.style.paddingBottom = "10px";
    row.style.borderBottom = "1px dashed rgba(255, 255, 255, 0.1)";

    row.innerHTML = `
      <div style="flex: 2; min-width: 180px;">
        <span style="font-size: 0.85rem; color: var(--gray); display: block;">Correo</span>
        <strong style="font-size: 0.9rem; word-break: break-all;">${user.email}</strong>
      </div>
      <div style="flex: 1.5; min-width: 130px;">
        <span style="font-size: 0.85rem; color: var(--gray); display: block;">Apodo</span>
        <input type="text" class="comic-input edit-user-nickname" value="${user.nickname}" style="margin-bottom: 0; padding: 6px 10px; font-size: 0.9rem;">
      </div>
      <div style="display: flex; gap: 5px; align-items: flex-end; padding-top: 15px;">
        <button class="comic-btn comic-btn-primary btn-update-user" style="padding: 6px 12px; font-size: 0.85rem; border-width: 2px;">
          Guardar 💾
        </button>
        <button class="comic-btn comic-btn-secondary btn-delete-user" style="padding: 6px 12px; font-size: 0.85rem; border-width: 2px;">
          Remover ❌
        </button>
      </div>
    `;

    // Asignar evento de guardado
    row.querySelector(".btn-update-user").addEventListener("click", async () => {
      const newNickname = row.querySelector(".edit-user-nickname").value.trim();

      if (!newNickname) {
        alert("El apodo del participante no puede estar vacío.");
        return;
      }

      await updateUserInGroup(user.email, newNickname, groupId);

      // Feedback visual
      const btn = row.querySelector(".btn-update-user");
      btn.textContent = "Guardado ✔";
      btn.style.backgroundColor = "var(--accent)";
      btn.style.color = "var(--black)";
      setTimeout(() => {
        btn.textContent = "Guardar 💾";
        btn.style.backgroundColor = "var(--primary)";
        btn.style.color = "var(--black)";
      }, 1200);

      // Refrescar el Dashboard por si cambió su apodo
      if (!viewDashboard.classList.contains("d-none")) {
        renderDashboard();
      }
    });

    // Asignar evento de remover
    row.querySelector(".btn-delete-user").addEventListener("click", async () => {
      const confirmMsg = isAdminUser 
        ? `¿Estás seguro de que deseas dejar de participar en este grupo? Seguirás teniendo acceso como administrador pero no aparecerás en la tabla de clasificación.`
        : `¿Estás seguro de que deseas remover a "${user.nickname}" (${user.email}) de este grupo? Esta acción borrará sus pronósticos en este grupo.`;

      if (confirm(confirmMsg)) {
        await removeUserFromGroup(user.email, groupId);
        
        // Si el admin se removió a sí mismo del grupo actual de la sesión, refrescar header
        if (isAdminUser && currentGroupId === groupId) {
          updateHeaderUI();
        }

        // Volver a renderizar
        renderAdminUsersList();

        // Refrescar el Dashboard
        if (!viewDashboard.classList.contains("d-none")) {
          renderDashboard();
        }
      }
    });

    adminUsersList.appendChild(row);
  });
}

// Obtener abreviación de 3 letras oficial para países
function getTeamAbbreviation(name) {
  if (!name) return "";
  const norm = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  const abbs = {
    "mexico": "MEX", "sudafrica": "RSA", "corea del sur": "KOR", "republica checa": "CZE",
    "canada": "CAN", "bosnia y herzegovina": "BIH", "qatar": "QAT", "catar": "QAT", "suiza": "SUI",
    "brasil": "BRA", "marruecos": "MAR", "haiti": "HAI", "escocia": "SCO",
    "estados unidos": "USA", "usa": "USA", "paraguay": "PAR", "australia": "AUS", "turquia": "TUR",
    "alemania": "GER", "curazao": "CUW", "costa de marfil": "CIV", "ecuador": "ECU",
    "paises bajos": "NED", "japon": "JPN", "suecia": "SWE", "tunez": "TUN",
    "belgica": "BEL", "egipto": "EGY", "iran": "IRN", "nueva zelanda": "NZL",
    "espana": "ESP", "cabo verde": "CPV", "arabia saudita": "KSA", "uruguay": "URU",
    "francia": "FRA", "senegal": "SEN", "noruega": "NOR", "irak": "IRQ",
    "argentina": "ARG", "argelia": "ALG", "austria": "AUT", "jordania": "JOR",
    "portugal": "POR", "uzbekistan": "UZB", "colombia": "COL", "r. d. congo": "COD", "congo dr": "COD",
    "inglaterra": "ENG", "croacia": "CRO", "ghana": "GHA", "panama": "PAN"
  };
  return abbs[norm] || name.substring(0, 3).toUpperCase();
}
