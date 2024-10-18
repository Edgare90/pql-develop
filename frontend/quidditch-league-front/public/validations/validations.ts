export let createdTeams: string[] = [];

export function isTeamNameUnique(name: string): boolean {
  return !createdTeams.includes(name.trim().toLowerCase());
}