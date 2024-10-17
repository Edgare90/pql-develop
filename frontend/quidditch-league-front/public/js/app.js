"use strict";
console.log("App inicializada, llego a esta parte");
let teams = [];
const teamSelect = document.getElementById("team-select");
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
