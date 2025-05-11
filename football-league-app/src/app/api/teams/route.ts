import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get('name');
  const sortBy = searchParams.get('sortBy') || 'points';  
  const order = searchParams.get('order') || 'desc';       

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

    const globallySortedTeams = [...teamsWithPoints].sort((a, b) => {
      if (a.points !== b.points) return b.points - a.points;
      if (a.wins !== b.wins) return b.wins - a.wins;
      if (a.goals_scored !== b.goals_scored) return b.goals_scored - a.goals_scored;
      return a.goals_conceded - b.goals_conceded;
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

    const sortedTeams = resultTeams.sort((a, b) => {
      if (sortBy === 'points') {
        return order === 'asc' ? a.points - b.points : b.points - a.points;
      }
      if (sortBy === 'wins') {
        return order === 'asc' ? a.wins - b.wins : b.wins - a.wins;
      }
      if (sortBy === 'goals_scored') {
        return order === 'asc' ? a.goals_scored - b.goals_scored : b.goals_scored - a.goals_scored;
      }
      if (sortBy === 'goals_conceded') {
        return order === 'asc' ? a.goals_conceded - b.goals_conceded : b.goals_conceded - a.goals_conceded;
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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      name, 
      coach_name, 
      home_stadium, 
      founded_year, 
      country,
      wins = 0,
      draws = 0,
      losses = 0,
      goals_scored = 0,
      goals_conceded = 0
    } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { message: "Team name is required" },
        { status: 400 }
      );
    }

    // Check if team with same name already exists
    const existingTeam = await prisma.team.findFirst({
      where: { name },
    });

    if (existingTeam) {
      return NextResponse.json(
        { message: "A team with this name already exists" },
        { status: 409 }
      );
    }

    // Create new team
    const newTeam = await prisma.team.create({
      data: {
        name,
        coach_name,
        home_stadium,
        founded_year,
        country,
        wins,
        draws,
        losses,
        goals_scored,
        goals_conceded,
      },
    });

    return NextResponse.json(newTeam, { status: 201 });
  } catch (error) {
    console.error('Error creating team:', error);
    return NextResponse.json(
      { message: "Failed to create team" },
      { status: 500 }
    );
  }
}
