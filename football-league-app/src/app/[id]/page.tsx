// File: src/app/[id]/page.tsx
import { PrismaClient } from '@/generated/prisma';
import { TeamType } from "@/app/types/team";
import { PlayerType } from "@/app/types/player";

// Initialize Prisma Client
const prisma = new PrismaClient();

export default async function TeamPage({ params }: { params: { id: string } }) {
  const id = params.id;
  const teamId = parseInt(id);
  
  if (isNaN(teamId)) {
    return <div className="p-4">Invalid team ID.</div>;
  }
  
  try {
    // Fetch data directly instead of using an API route
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: { players: true },
    });
    
    if (!team) {
      return <div className="p-4">Team not found.</div>;
    }
    
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">{team.name}</h1>
        <p className="text-gray-700">Coach: {team.coach_name}</p>
        <p className="text-gray-700">Stadium: {team.home_stadium}</p>
        <p className="text-gray-700">Founded: {team.founded_year}</p>
        <p className="text-gray-700">Country: {team.country}</p>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Team Stats</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-gray-800">
            <p><strong>Wins:</strong> {team.wins}</p>
            <p><strong>Draws:</strong> {team.draws}</p>
            <p><strong>Losses:</strong> {team.losses}</p>
            <p><strong>Goals Scored:</strong> {team.goals_scored}</p>
            <p><strong>Goals Conceded:</strong> {team.goals_conceded}</p>
          </div>
        </div>

        <h2 className="text-2xl font-semibold mt-6">Players</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-left">Name</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Position</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Age</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Nationality</th>
              </tr>
            </thead>
            <tbody>
              {team.players.map((player) => (
                <tr key={player.id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">{player.name}</td>
                  <td className="border border-gray-300 px-4 py-2">{player.position ?? "N/A"}</td>
                  <td className="border border-gray-300 px-4 py-2">{player.age ?? "Unknown"}</td>
                  <td className="border border-gray-300 px-4 py-2">{player.nationality ?? "Unknown"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error fetching team:", error);
    return (
      <div className="p-4 text-red-500">
        <h1>Error loading team</h1>
        <p>{String(error)}</p>
      </div>
    );
  }
}