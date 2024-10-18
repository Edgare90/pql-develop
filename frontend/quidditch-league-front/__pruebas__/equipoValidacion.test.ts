import { isTeamNameUnique, createdTeams } from '../public/validations/validations';

describe('Validación de nombres de equipo unicos', () => {
  beforeEach(() => {
    createdTeams.length = 0;
    createdTeams.push('equipo uno', 'super team');
  });

  test('Debe regresar false si el equipo ya existe', () => {
    expect(isTeamNameUnique('equipo uno')).toBe(false);
  });

  test('Debe regresar true si el equipo no existe', () => {
    expect(isTeamNameUnique('nuevo equipo')).toBe(true);
  });

  test('Debe ignorar mayúsculas y espacios en blanco', () => {
    expect(isTeamNameUnique(' EQUIPO UNO ')).toBe(false);
  });
});