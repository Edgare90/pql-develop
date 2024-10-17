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

 //asignamos habilidades de forma dinamica segun la posicion del jugador
 function getSpecialAbility(position: string): string {
    const abilities: { [key: string]: string } = {
        Seeker: "Enhanced Vision",
        Beater: "Power Swing",
        Keeper: "Quick Reflexes",
        Chaser: "Accurate Passing"
    };
    return abilities[position] || "No special ability available";
 }

    //Aqui mostramos a los jugadores no asigandos en la tabla, es decir, cargamos los td de la tabla
    function renderPlayers(players: Player[]) {
        playersList.innerHTML = "";
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

  fetchTeams();
  fetchPlayers();