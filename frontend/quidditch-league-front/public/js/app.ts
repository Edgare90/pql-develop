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