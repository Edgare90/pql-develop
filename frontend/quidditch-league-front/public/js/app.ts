console.log("App inicializada, llego a esta parte");
interface Player {
    id: number;
    name: string;
    age: number;
    position: string;
  }

  interface Team {
    id: number;
    name: string;
    description: string;
  }

  let teams: Team[] = [];
  const teamSelect = document.getElementById("team-select") as HTMLSelectElement;
  let unassignedPlayers: Player[] = [];
  const playersList = document.getElementById("players-list")!;
  const teamForm = document.getElementById("team-form") as HTMLFormElement;
  const teamNameInput = document.getElementById("team-name") as HTMLInputElement;
  const teamNameError = document.getElementById("team-name-error")!;
  const createdTeams: string[] = [];
  const searchInput = document.getElementById("search-input") as HTMLInputElement;

  async function fetchTeams() {
    console.log("quiero recuperar los equipos");
    const response = await fetch("http://localhost:8000/api/teams");
    teams = await response.json();
    console.log("Ya tengo los equipos",teams);
    renderTeams(teams);
  }

  function renderTeams(teams: Team[]) {
    teams.forEach(team => addTeamToDropdown(team));
  }

//vamos a agregar los equpos al drop
  function addTeamToDropdown(team: Team) {
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
    renderPlayers(unassignedPlayers );
  }

 /*asignamos habilidades de forma dinamica segun la posicion del jugador 
   si no hay una habilidad asignada para la posicion regresamos que no hay una habilidad especial disponible
 */
 function getSpecialAbility(position: string): string {
    const abilities: { [key: string]: string } = {
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
function renderPlayers(players: Player[]) {
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
        console.log("habilidad",ability);
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
function isTeamNameUnique(name: string): boolean {
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
const teamDescription = (document.getElementById("team-description") as HTMLTextAreaElement).value;
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

    const newTeam: Team = await response.json();
    teams.push(newTeam);
    addTeamToDropdown(newTeam);

    alert(`Equipo "${newTeam.name}" creado!`);
    teamForm.reset();
} catch (error) {
    console.error("Error creating team:", error);
    teamNameInput.classList.add("is-invalid");
}
});


//vamos a manejar cualquier click en el documento, si es boton y tiene data.id, es un jugador
//extraemos el id del jugador almacenado en el boton
//filtramos en el array provisional de jugadores disponibles y eliminamos el id que traemos de arriba
//volvemos a renderizar a los jugadores que aun quedanm, al tenerlos almacenados en un array provisional evitamos alguna modificacion en la BD
document.addEventListener("click", (event) => {
const target = event.target as HTMLButtonElement;
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
    const filteredPlayers = unassignedPlayers.filter(player =>
      player.name.toLowerCase().includes(query) || 
      player.position.toLowerCase().includes(query)
    );
    renderPlayers(filteredPlayers);
});

fetchTeams();
fetchPlayers();