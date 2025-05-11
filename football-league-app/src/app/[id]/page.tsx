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
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="bg-[#1d1d1d] p-8 rounded-lg shadow-lg">
          <h1 className="text-2xl font-semibold text-red-500">Invalid team ID</h1>
        </div>
      </div>
    );
  }
  
  try {
    // Fetch data directly instead of using an API route
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: { players: true },
    });
    
    if (!team) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-black">
          <div className="bg-[#1d1d1d] p-8 rounded-lg shadow-lg">
            <h1 className="text-2xl font-semibold text-white">Team not found</h1>
          </div>
        </div>
      );
    }
    
    return (
      <div className="min-h-screen bg-black py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Team Header */}
          <div className="bg-[#1d1d1d] rounded-lg shadow-lg p-8 mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">{team.name}</h1>
                <div className="flex flex-wrap gap-4 text-gray-400">
                  <p className="flex items-center">
                    <span className="font-medium text-gray-300">Coach:</span>
                    <span className="ml-2">{team.coach_name}</span>
                  </p>
                  <p className="flex items-center">
                    <span className="font-medium text-gray-300">Stadium:</span>
                    <span className="ml-2">{team.home_stadium}</span>
                  </p>
                  <p className="flex items-center">
                    <span className="font-medium text-gray-300">Founded:</span>
                    <span className="ml-2">{team.founded_year}</span>
                  </p>
                  <p className="flex items-center">
                    <span className="font-medium text-gray-300">Country:</span>
                    <span className="ml-2">{team.country}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Team Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-[#1d1d1d] rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-semibold text-white mb-6">Team Statistics</h2>
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-sm text-blue-400 font-medium">Wins</p>
                  <p className="text-3xl font-bold text-white">{team.wins}</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-sm text-green-400 font-medium">Draws</p>
                  <p className="text-3xl font-bold text-white">{team.draws}</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-sm text-red-400 font-medium">Losses</p>
                  <p className="text-3xl font-bold text-white">{team.losses}</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-sm text-purple-400 font-medium">Goals Scored</p>
                  <p className="text-3xl font-bold text-white">{team.goals_scored}</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-sm text-orange-400 font-medium">Goals Conceded</p>
                  <p className="text-3xl font-bold text-white">{team.goals_conceded}</p>
                </div>
              </div>
            </div>

            {/* Squad Overview */}
            <div className="bg-[#1d1d1d] rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-semibold text-white mb-6">Squad Overview</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Players</span>
                  <span className="text-2xl font-bold text-white">{team.players.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Average Age</span>
                  <span className="text-2xl font-bold text-white">
                    {Math.round(team.players.reduce((acc, player) => acc + (player.age || 0), 0) / team.players.length)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Players Table */}
          <div className="bg-[#1d1d1d] rounded-lg shadow-lg overflow-hidden">
            <div className="p-8">
              <h2 className="text-2xl font-semibold text-white mb-6">Squad Players</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-700">
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">Position</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">Age</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">Nationality</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {team.players.map((player) => (
                    <tr key={player.id} className="hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">{player.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-400">{player.position ?? "N/A"}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-400">{player.age ?? "Unknown"}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-400">{player.nationality ?? "Unknown"}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error fetching team:", error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="bg-[#1d1d1d] p-8 rounded-lg shadow-lg">
          <h1 className="text-2xl font-semibold text-red-500 mb-2">Error loading team</h1>
          <p className="text-gray-400">{String(error)}</p>
        </div>
      </div>
    );
  }
}