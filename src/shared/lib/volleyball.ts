export type PlayerRecord = {
  id: string;
  nome: string;
  apelido?: string | null;
  posicao?: string | null;
  camisa?: number | null;
  foto_url?: string | null;
  status?: string | null;
  data_nascimento?: string | null;
  curso?: string | null;
  altura?: number | null;
  peso?: number | null;
};

export type GameRecord = {
  id: string;
  data: string;
  adversario: string;
  local?: string | null;
  placar_nos: number;
  placar_eles: number;
  observacoes?: string | null;
};

export function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function getFirstName(name: string) {
  return name.trim().split(" ")[0] || name;
}

export function getStatusLabel(status?: string | null) {
  if (!status) return "Disponivel";

  const labels: Record<string, string> = {
    DISPONIVEL: "Disponivel",
    LESIONADO: "Lesionado",
    INATIVO: "Inativo",
    TITULAR: "Titular",
    OBSERVACAO: "Observacao",
  };

  return labels[status] || status;
}

export function formatMatchDate(dateStr: string, includeWeekday = false) {
  const date = new Date(`${dateStr}T12:00:00`);
  if (Number.isNaN(date.getTime())) return dateStr;

  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(includeWeekday ? { weekday: "short" as const } : {}),
  });
}

export function calculateAge(birthDate?: string | null) {
  if (!birthDate) return null;
  const birth = new Date(`${birthDate}T12:00:00`);
  if (Number.isNaN(birth.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const hasHadBirthday =
    today.getMonth() > birth.getMonth() ||
    (today.getMonth() === birth.getMonth() &&
      today.getDate() >= birth.getDate());

  if (!hasHadBirthday) age -= 1;
  return age;
}

export function getPlayerHeightLabel(height?: number | null) {
  if (!height) return "--";
  return `${height} cm`;
}

export function getPlayerWeightLabel(weight?: number | null) {
  if (!weight) return "--";
  return `${weight} kg`;
}

export function getResult(game: GameRecord) {
  if (game.placar_nos > game.placar_eles) return "win";
  if (game.placar_nos < game.placar_eles) return "loss";
  return "draw";
}

export function getWinRate(games: GameRecord[]) {
  if (!games.length) return 0;
  const wins = games.filter((game) => getResult(game) === "win").length;
  return Math.round((wins / games.length) * 100);
}

export function getSetBalance(games: GameRecord[]) {
  return games.reduce(
    (acc, game) => acc + (game.placar_nos - game.placar_eles),
    0,
  );
}

export function getPositionGroups(players: PlayerRecord[]) {
  const counts = new Map<string, number>();

  players.forEach((player) => {
    const position = player.posicao?.trim() || "Sem posicao";
    counts.set(position, (counts.get(position) || 0) + 1);
  });

  return Array.from(counts.entries())
    .map(([position, count]) => ({ position, count }))
    .sort((a, b) => b.count - a.count);
}

export function getAverageHeight(players: PlayerRecord[]) {
  const heights = players.map((player) => player.altura).filter(Boolean) as number[];
  if (!heights.length) return null;
  return Math.round(heights.reduce((sum, value) => sum + value, 0) / heights.length);
}

export function getAverageAge(players: PlayerRecord[]) {
  const ages = players.map((player) => calculateAge(player.data_nascimento)).filter(Boolean) as number[];
  if (!ages.length) return null;
  return Math.round(ages.reduce((sum, value) => sum + value, 0) / ages.length);
}

export function getUpcomingGames(games: GameRecord[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return games
    .filter((game) => new Date(`${game.data}T12:00:00`).getTime() >= today.getTime())
    .sort(
      (a, b) =>
        new Date(`${a.data}T12:00:00`).getTime() -
        new Date(`${b.data}T12:00:00`).getTime(),
    );
}

export function getRecentGames(games: GameRecord[], count = 5) {
  return [...games]
    .sort(
      (a, b) =>
        new Date(`${b.data}T12:00:00`).getTime() -
        new Date(`${a.data}T12:00:00`).getTime(),
    )
    .slice(0, count);
}

export function getStatusTone(status?: string | null) {
  switch (status) {
    case "LESIONADO":
      return "danger";
    case "INATIVO":
      return "muted";
    case "TITULAR":
      return "success";
    default:
      return "neutral";
  }
}
