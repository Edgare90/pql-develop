export let createdTeams = [];
export function isTeamNameUnique(name) {
    return !createdTeams.includes(name.trim().toLowerCase());
}
