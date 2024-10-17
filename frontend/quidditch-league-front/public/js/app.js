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
    renderPlayers(unassignedPlayers);
}
//asignamos habilidades de forma dinamica segun la posicion del jugador
function getSpecialAbility(position) {
    const abilities = {
        Seeker: "Enhanced Vision",
        Beater: "Power Swing",
        Keeper: "Quick Reflexes",
        Chaser: "Accurate Passing"
    };
    return abilities[position] || "No special ability available";
}
//Aqui mostramos a los jugadores no asigandos en la tabla, es decir, cargamos los td de la tabla
function renderPlayers(players) {
    playersList.innerHTML = "";
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
}
//efectos de validacion del equipo
function isTeamNameUnique(name) {
    return !createdTeams.includes(name.trim().toLowerCase());
}
//Vamos a hacer el guardao de los equipos 
//se activa co el submit
//desactivamos el invalido
//con la API validamos que no exista el nombre, si existe marcamos error, si no existe guardamos y renderizamos el Drop de los equipos
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
            return;
        }
        const newTeam = await response.json();
        teams.push(newTeam);
        addTeamToDropdown(newTeam);
        alert(`Equipo "${newTeam.name}" creado!`);
        teamForm.reset();
    }
    catch (error) {
        console.error("Error creating team:", error);
        teamNameInput.classList.add("is-invalid");
    }
});
fetchTeams();
fetchPlayers();
