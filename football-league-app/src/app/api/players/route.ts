import { PrismaClient } from '@/generated/prisma';
import { NextRequest } from 'next/server';

const prisma = new PrismaClient();

// GET /api/players?teamId=1
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const teamId = searchParams.get('teamId');
  let where = {};
  if (teamId) {
    const tid = parseInt(teamId);
    if (!isNaN(tid)) {
      where = { team_id: tid };
    }
  }
  try {
    const players = await prisma.player.findMany({ where });
    return new Response(JSON.stringify(players), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('GET /api/players error:', error);
    return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500 });
  }
}

// POST /api/players
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, position, age, nationality, team_id } = body;
    if (!name || !team_id) {
      return new Response(JSON.stringify({ message: 'Player name and team_id are required' }), { status: 400 });
    }
    const newPlayer = await prisma.player.create({
      data: {
        name,
        position,
        age: age !== undefined ? Number(age) : null,
        nationality,
        team_id: Number(team_id),
      },
    });
    return new Response(JSON.stringify(newPlayer), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('POST /api/players error:', error);
    return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500 });
  }
} 