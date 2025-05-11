import { PrismaClient } from '@/generated/prisma';
import { NextRequest } from 'next/server';

const prisma = new PrismaClient();

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const playerId = parseInt(params.id);
  if (isNaN(playerId)) {
    return new Response(JSON.stringify({ message: 'Invalid player ID' }), { status: 400 });
  }
  try {
    const player = await prisma.player.findUnique({ where: { id: playerId } });
    if (!player) {
      return new Response(JSON.stringify({ message: 'Player not found' }), { status: 404 });
    }
    return new Response(JSON.stringify(player), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('GET /api/players/[id] error:', error);
    return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const playerId = parseInt(params.id);
  if (isNaN(playerId)) {
    return new Response(JSON.stringify({ message: 'Invalid player ID' }), { status: 400 });
  }
  try {
    const body = await req.json();
    const data: any = {};
    if (body.name !== undefined) data.name = body.name;
    if (body.position !== undefined) data.position = body.position;
    if (body.age !== undefined) data.age = Number(body.age);
    if (body.nationality !== undefined) data.nationality = body.nationality;
    if (body.team_id !== undefined) data.team_id = Number(body.team_id);
    const updatedPlayer = await prisma.player.update({ where: { id: playerId }, data });
    return new Response(JSON.stringify(updatedPlayer), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('PATCH /api/players/[id] error:', error);
    return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const playerId = parseInt(params.id);
  if (isNaN(playerId)) {
    return new Response(JSON.stringify({ message: 'Invalid player ID' }), { status: 400 });
  }
  try {
    await prisma.player.delete({ where: { id: playerId } });
    return new Response(JSON.stringify({ message: 'Player deleted successfully' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('DELETE /api/players/[id] error:', error);
    return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500 });
  }
} 