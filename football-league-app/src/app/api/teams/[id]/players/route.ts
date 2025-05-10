import { PrismaClient } from '@/generated/prisma';
import { NextRequest } from 'next/server';

const prisma = new PrismaClient();

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const teamId = parseInt(params.id);

  if (isNaN(teamId)) {
    return new Response(JSON.stringify({ message: 'Invalid team ID' }), {
      status: 400,
    });
  }

  try {
    const players = await prisma.player.findMany({
      where: {
        team_id: teamId,
      },
    });

    return new Response(JSON.stringify(players), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('GET /teams/[id]/players error:', error);
    return new Response(JSON.stringify({ message: 'Internal server error' }), {
      status: 500,
    });
  }
}
