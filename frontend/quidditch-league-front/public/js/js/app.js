"use strict";
console.log("App inicializada, llego a esta parte");
let teams = [];
const teamSelect = document.getElementById("team-select");
let unassignedPlayers = [];
const playersList = document.getElementById("players-list");
const teamForm = document.getElementById("team-form");
const teamNameInput = document.getElementById("team-name");
const teamNameError = document.getElementById("team-name-error");
const createdTeams = [];
const searchInput = document.getElementById("search-input");
const tableHeaders = document.querySelectorAll(".sortable");
const ExcelJS = window.ExcelJS;
let currentPage = 1;
const itemsPerPage = 5;
async function fetchTeams() {
    console.log("quiero recuperar los equipos");
    const response = await fetch("http://localhost:8000/api/teams");
    teams = await response.json();
    console.log("Ya tengo los equipos", teams);
    renderTeams(teams);
}
function renderTeams(teams) {
    teams.forEach(team => addTeamToDropdown(team));
}
//vamos a agregar los equpos al drop
function addTeamToDropdown(team) {
    const option = document.createElement("option");
    option.value = team.id.toString();
    option.textContent = team.name;
    teamSelect.appendChild(option);
}
//Recuperamos a los jugadores
async function fetchPlayers() {
    console.log("Fetching players...");
    const response = await fetch("http://localhost:8000/api/players/unassigned");
    unassignedPlayers = await response.json();
    console.log(unassignedPlayers);
    renderPlayers(getPaginatedPlayers(unassignedPlayers, currentPage));
    renderPagination(unassignedPlayers.length);
}
/*asignamos habilidades de forma dinamica segun la posicion del jugador
  si no hay una habilidad asignada para la posicion regresamos que no hay una habilidad especial disponible
*/
function getSpecialAbility(position) {
    const abilities = {
        Seeker: "Enhanced Vision",
        Beater: "Power Swing",
        Keeper: "Quick Reflexes",
        Chaser: "Accurate Passing"
    };
    return abilities[position] || "No special ability available";
}
/*Aqui mostramos a los jugadores no asigandos en la tabla, es decir, cargamos los td de la tabla.
  Si no hay jugadores a mostrar lo indicamos
  Si hay creamos los TD
  Mandamos llamar a la funcion que nos asiganrá de manera dinamica las habilidades
  Renderizamos*/
function renderPlayers(players) {
    playersList.innerHTML = "";
    if (players.length === 0) {
        const noResultsRow = document.createElement("tr");
        noResultsRow.innerHTML = `
          <td colspan="4" class="text-center text-muted">No players found.</td>
        `;
        playersList.appendChild(noResultsRow);
        return;
    }
    players.forEach(player => {
        const ability = getSpecialAbility(player.position);
        console.log("habilidad", ability);
        const row = document.createElement("tr");
        row.innerHTML = `
        <td>${player.name}</td>
        <td>${player.age}</td>
        <td>${player.position}</td>
        <td>${ability}</td>
        <td><button class="btn btn-danger btn-sm" data-id="${player.id}">Remove</button></td>
        `;
        playersList.appendChild(row);
    });
    renderPagination(players.length);
}
//efectos de validacion del equipo
function isTeamNameUnique(name) {
    return !createdTeams.includes(name.trim().toLowerCase());
}
/*Vamos a hacer el guardao de los equipos
se activa con el submit
desactivamos el invalido
con la API validamos que no exista el nombre
    si existe marcamos error,
    si no existe guardamos en la BD y agregamos en nuestro array provisional
    renderizamos el Drop de los equipos con el array provisional */
teamForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const teamName = teamNameInput.value.trim();
    const teamDescription = document.getElementById("team-description").value;
    teamNameInput.classList.remove("is-invalid");
    teamNameError.textContent = "";
    if (!isTeamNameUnique(teamName)) {
        teamNameInput.classList.add("is-invalid");
        return;
    }
    teamNameInput.classList.remove("is-invalid");
    try {
        const response = await fetch("http://localhost:8000/api/teams", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: teamName, description: teamDescription }),
        });
        if (!response.ok) {
            console.log("Soy invalido");
            const errorData = await response.json();
            teamNameInput.classList.add("is-invalid");
            teamNameError.textContent = errorData.error || "Failed to create team.";
            showNotification("Failed creating team.", "error");
            return;
        }
        const newTeam = await response.json();
        teams.push(newTeam);
        addTeamToDropdown(newTeam);
        //alert(`Equipo "${newTeam.name}" creado!`);
        showNotification(`Team "${newTeam.name}" created successfully!`);
        teamForm.reset();
    }
    catch (error) {
        console.error("Error creating team:", error);
        showNotification("Strange error occurred.", "error");
        teamNameInput.classList.add("is-invalid");
    }
});
//vamos a manejar cualquier click en el documento, si es boton y tiene data.id, es un jugador
//extraemos el id del jugador almacenado en el boton
//filtramos en el array provisional de jugadores disponibles y eliminamos el id que traemos de arriba
//volvemos a renderizar a los jugadores que aun quedanm, al tenerlos almacenados en un array provisional evitamos alguna modificacion en la BD
document.addEventListener("click", (event) => {
    const target = event.target;
    if (target.tagName === "BUTTON" && target.dataset.id) {
        const playerId = parseInt(target.dataset.id);
        unassignedPlayers = unassignedPlayers.filter(player => player.id !== playerId);
        renderPlayers(unassignedPlayers);
    }
});
/*Funcion para buscar en nuestro array
  Podemos buscar por nombre o posicion
  Atentos al evento input, cada vez que escribimos se llama a la funcion
  Obtenemos el valor escrito y lo convertimos a minusculas, para buscar mejor
  Usamos filter para buscar coincidencias en nombre o psicion
  Renderizamos*/
searchInput.addEventListener("input", () => {
    const query = searchInput.value.trim().toLowerCase();
    const filteredPlayers = unassignedPlayers.filter(player => player.name.toLowerCase().includes(query) ||
        player.position.toLowerCase().includes(query));
    renderPlayers(filteredPlayers);
});
/*Funcion para la creacion de un archivo de excel con los registros de los jugadores
  Recibe como parametro playeres del tipo Player
  Asiganamos el nombre de los encabezados del documento
  recorremos nuestro array para obtener los registros
  agregamos los row al archivo
  generamos el archivo*/
async function exportToExcel(players) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Players");
    worksheet.columns = [
        { header: "ID", key: "id", width: 10 },
        { header: "Name", key: "name", width: 30 },
        { header: "Age", key: "age", width: 10 },
        { header: "Position", key: "position", width: 20 }
    ];
    players.forEach(player => worksheet.addRow(player));
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "jugadores.xlsx";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}
/*obtenemos el elemento boton por su id desde el HTML
  le agregamos un listener para estar atentos al click en el boton y mandar llamar la funcion donde se genera el excel*/
const exportButton = document.getElementById("export-excel");
exportButton.addEventListener("click", () => exportToExcel(unassignedPlayers));
/*Funcion para darle mas estilo a los mensajes ya sea de error(error) o de exito(success)
  Recibe un mensaje (string) y un tipo (error o exito)
  Creamos la notificacion
  Le damos el estilo al cuadrito (color, tamaño etc)
  Agregamos la notificacion al div en el HTML
  Desaparecemos la notificacion en 8 segundos*/
function showNotification(giveMessage, type = "success") {
    const notificationContainer = document.getElementById("notification-container");
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.textContent = giveMessage;
    notification.style.cssText = `
    background-color: ${type === "success" ? "#4caf50" : "#f44336"};
    color: white;
    padding: 15px;
    margin-top: 10px;
    border-radius: 5px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    opacity: 1;
    transition: opacity 0.5s ease;
`;
    notificationContainer.appendChild(notification);
    setTimeout(() => {
        notification.style.opacity = "0";
        setTimeout(() => notificationContainer.removeChild(notification), 800);
    }, 3000);
}
/*Paginador 1
  Dos parametros de entrada: players(array de jugadores) page(numero de la pagina qu estamos viendo)
  Con slice seleccionamos una porcion del array (donde empieza, donde termina) */
function getPaginatedPlayers(players, page) {
    const startIndex = (page - 1) * itemsPerPage;
    return players.slice(startIndex, startIndex + itemsPerPage);
}
/*Paginador 2
  Botones del Paginador
  Recibe el numero de jugadores
  Limpiamos el contenedor para no encimar los botones
  Calculamos el total de paginas redondeando hacia arriba
  Si el total de paginas es menor o igaul a uno, nonecesitamos botones, se ocultan
  Con el for creamos un boton por pagina, agregamos estilo y agregamos clase 'active' si el boton es la pagina actual
  Agregamos un evento click a cada boton
  getPaginatedPlayers -> renderizamos los jugadores por pagina y por indice de esa pagina
  renderPlayers -> rederizamos el resultado de la funcion interna en la tabla del HTML*/
function renderPagination(totalItems) {
    const paginationContainer = document.getElementById("pagination");
    paginationContainer.innerHTML = "";
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (totalPages <= 1) {
        paginationContainer.style.display = "none";
        return;
    }
    paginationContainer.style.display = "flex";
    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement("button");
        button.textContent = i.toString();
        button.classList.add("btn", "btn-primary", "m-1");
        if (i === currentPage)
            button.classList.add("active");
        button.addEventListener("click", () => {
            currentPage = i;
            renderPlayers(getPaginatedPlayers(unassignedPlayers, currentPage));
            renderPagination(totalItems);
        });
        paginationContainer.appendChild(button);
    }
}
fetchTeams();
fetchPlayers();
