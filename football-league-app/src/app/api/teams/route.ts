import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get('name');
  const sortBy = searchParams.get('sortBy') || 'points';  // Display-level sort criterion
  const order = searchParams.get('order') || 'desc';       // Display-level sort order

  try {
    // Always fetch all teams (to calculate global ranking)
    const teams = await prisma.team.findMany({
      include: { players: true },
    });

    // Calculate points for each team
    const teamsWithPoints = teams.map((team: any) => ({
      ...team,
      points: team.wins * 3 + team.draws * 1,
    }));

    // GLOBAL RANKING: Sort by primary criteria for ranking:
    const globallySortedTeams = [...teamsWithPoints].sort((a, b) => {
      if (a.points !== b.points) return b.points - a.points;
      if (a.wins !== b.wins) return b.wins - a.wins;
      if (a.goalsScored !== b.goalsScored) return b.goalsScored - a.goalsScored;
      return a.goalsConceded - b.goalsConceded;
    });

    // Assign global positions based on this order
    const globalRankedTeams = globallySortedTeams.map((team, index) => ({
      ...team,
      position: index + 1,
    }));

    // If a search query is provided, filter the globally ranked teams
    let resultTeams = globalRankedTeams;
    if (name) {
      const lowerName = name.toLowerCase();
      resultTeams = globalRankedTeams.filter(team =>
        team.name.toLowerCase().includes(lowerName)
      );
    }

    // OPTIONAL: Apply display-level sorting based on query parameters
    // (This sorts the filtered list without modifying the already-calculated global position)
    const sortedTeams = resultTeams.sort((a, b) => {
      if (sortBy === 'points') {
        return order === 'asc' ? a.points - b.points : b.points - a.points;
      }
      if (sortBy === 'wins') {
        return order === 'asc' ? a.wins - b.wins : b.wins - a.wins;
      }
      if (sortBy === 'goalsScored') {
        return order === 'asc' ? a.goalsScored - b.goalsScored : b.goalsScored - a.goalsScored;
      }
      if (sortBy === 'goalsConceded') {
        return order === 'asc' ? a.goalsConceded - b.goalsConceded : b.goalsConceded - a.goalsConceded;
      }
      if (sortBy === 'name') {
        return order === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }
      return 0;
    });

    return NextResponse.json(sortedTeams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 });
  }
}
