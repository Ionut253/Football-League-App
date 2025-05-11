import { PrismaClient } from '@/generated/prisma';
import { NextRequest } from 'next/server';

const prisma = new PrismaClient();

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Access id directly from params
  const id = params.id;
  console.log("Fetching team with ID:", id);

  const teamId = parseInt(id);
  if (isNaN(teamId)) {
    return new Response(JSON.stringify({ message: "Invalid team ID" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: { players: true },
    });

    if (!team) {
      return new Response(JSON.stringify({ message: "Team not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(team), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching team:", error);
    return new Response(JSON.stringify({ message: "Server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const teamId = parseInt(id);

  if (isNaN(teamId)) {
    return new Response(JSON.stringify({ message: "Invalid team ID" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const { name, coach_name, home_stadium, founded_year, country, wins, draws, losses, goals_scored, goals_conceded } = body;

    // Validate required fields
    if (!name) {
      return new Response(JSON.stringify({ message: "Team name is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check if team exists
    const existingTeam = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!existingTeam) {
      return new Response(JSON.stringify({ message: "Team not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Update team
    const updatedTeam = await prisma.team.update({
      where: { id: teamId },
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

    return new Response(JSON.stringify(updatedTeam), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating team:", error);
    return new Response(JSON.stringify({ message: "Server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const teamId = parseInt(id);

  if (isNaN(teamId)) {
    return new Response(JSON.stringify({ message: "Invalid team ID" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // Check if team exists
    const existingTeam = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!existingTeam) {
      return new Response(JSON.stringify({ message: "Team not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Delete team
    await prisma.team.delete({
      where: { id: teamId },
    });

    return new Response(JSON.stringify({ message: "Team deleted successfully" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error deleting team:", error);
    return new Response(JSON.stringify({ message: "Server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const teamId = parseInt(id);

  if (isNaN(teamId)) {
    return new Response(JSON.stringify({ message: "Invalid team ID" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const data: any = {};
    if (body.name !== undefined) data.name = body.name;
    if (body.coach_name !== undefined) data.coach_name = body.coach_name;
    if (body.home_stadium !== undefined) data.home_stadium = body.home_stadium;
    if (body.founded_year !== undefined) data.founded_year = Number(body.founded_year);
    if (body.country !== undefined) data.country = body.country;
    if (body.wins !== undefined) data.wins = Number(body.wins);
    if (body.draws !== undefined) data.draws = Number(body.draws);
    if (body.losses !== undefined) data.losses = Number(body.losses);
    if (body.goals_scored !== undefined) data.goals_scored = Number(body.goals_scored);
    if (body.goals_conceded !== undefined) data.goals_conceded = Number(body.goals_conceded);

    // Check if team exists
    const existingTeam = await prisma.team.findUnique({
      where: { id: teamId },
      include: { players: true },
    });

    if (!existingTeam) {
      return new Response(JSON.stringify({ message: "Team not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Update team with only the provided fields
    const updatedTeam = await prisma.team.update({
      where: { id: teamId },
      data,
      include: { players: true },
    });

    return new Response(JSON.stringify(updatedTeam), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating team:", error);
    return new Response(JSON.stringify({ message: "Server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}