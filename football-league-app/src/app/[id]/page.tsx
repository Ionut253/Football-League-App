"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TeamType } from "@/app/types/team";
import { PlayerType } from "@/app/types/player";

type TeamWithPlayers = TeamType & { players: PlayerType[] };

export default function TeamPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = React.use(params);
  const teamId = parseInt(id);

  const [team, setTeam] = useState<TeamWithPlayers | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit modes and data for each section
  const [editInfoMode, setEditInfoMode] = useState(false);
  const [editStatsMode, setEditStatsMode] = useState(false);
  const [infoData, setInfoData] = useState<any>({});
  const [statsData, setStatsData] = useState<any>({});
  const [savingInfo, setSavingInfo] = useState(false);
  const [savingStats, setSavingStats] = useState(false);

  useEffect(() => {
    if (isNaN(teamId)) {
      setError("Invalid team ID");
      setLoading(false);
      return;
    }
    const fetchTeam = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/teams/${teamId}`);
        if (!res.ok) throw new Error("Failed to fetch team");
        const data = await res.json();
        setTeam(data as TeamWithPlayers);
        setInfoData({
          name: data.name,
          coach_name: data.coach_name,
          home_stadium: data.home_stadium,
          founded_year: data.founded_year,
          country: data.country,
        });
        setStatsData({
          wins: data.wins,
          draws: data.draws,
          losses: data.losses,
          goals_scored: data.goals_scored,
          goals_conceded: data.goals_conceded,
        });
      } catch (err: any) {
        setError(err.message || "Failed to load team");
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, [teamId]);

  // Handlers for info section
  const handleInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInfoData({ ...infoData, [name]: value });
  };
  const handleInfoSave = async () => {
    setSavingInfo(true);
    setError(null);
    try {
      const res = await fetch(`/api/teams/${teamId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...infoData }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to update team info");
      }
      const updated = await res.json();
      setTeam(prev => prev ? { ...prev, ...updated, players: prev.players } : updated);
      setEditInfoMode(false);
      setInfoData({
        name: updated.name,
        coach_name: updated.coach_name,
        home_stadium: updated.home_stadium,
        founded_year: updated.founded_year,
        country: updated.country,
      });
    } catch (err: any) {
      setError(err.message || "Failed to update team info");
    } finally {
      setSavingInfo(false);
    }
  };

  // Handlers for stats section
  const handleStatsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setStatsData({
      ...statsData,
      [name]: type === "number" ? (value === "" ? "" : Number(value)) : value,
    });
  };
  const handleStatsSave = async () => {
    setSavingStats(true);
    setError(null);
    try {
      const res = await fetch(`/api/teams/${teamId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...statsData }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to update team stats");
      }
      const updated = await res.json();
      setTeam(prev => prev ? { ...prev, ...updated, players: prev.players } : updated);
      setEditStatsMode(false);
      setStatsData({
        wins: updated.wins,
        draws: updated.draws,
        losses: updated.losses,
        goals_scored: updated.goals_scored,
        goals_conceded: updated.goals_conceded,
      });
    } catch (err: any) {
      setError(err.message || "Failed to update team stats");
    } finally {
      setSavingStats(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="bg-[#1d1d1d] p-8 rounded-lg shadow-lg">
          <h1 className="text-2xl font-semibold text-white">Loading...</h1>
        </div>
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="bg-[#1d1d1d] p-8 rounded-lg shadow-lg">
          <h1 className="text-2xl font-semibold text-red-500 mb-2">{error}</h1>
        </div>
      </div>
    );
  if (!team) return null;

  return (
    <div className="min-h-screen bg-black py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Team Header */}
        <div className="bg-[#1d1d1d] rounded-lg shadow-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                {editInfoMode ? (
                  <input
                    name="name"
                    value={infoData.name}
                    onChange={handleInfoChange}
                    className="text-4xl font-bold text-white mb-2 bg-gray-800 border border-gray-600 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors w-full max-w-md"
                  />
                ) : (
                  <h1 className="text-4xl font-bold text-white mb-2">{team.name}</h1>
                )}
                <button
                  onClick={() => setEditInfoMode((v) => !v)}
                  className="ml-2 p-2 rounded hover:bg-gray-700"
                  title="Edit team info"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400 hover:text-blue-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-2.828 0L9 13zm0 0L4 19l5-1 1-5z"
                    />
                  </svg>
                </button>
              </div>
              <div className="flex flex-wrap gap-4 text-gray-400 mt-2">
                <p className="flex items-center">
                  <span className="font-medium text-gray-300">Coach:</span>
                  {editInfoMode ? (
                    <input
                      name="coach_name"
                      value={infoData.coach_name}
                      onChange={handleInfoChange}
                      className="ml-2 bg-gray-800 border border-gray-600 rounded p-1 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  ) : (
                    <span className="ml-2">{team.coach_name}</span>
                  )}
                </p>
                <p className="flex items-center">
                  <span className="font-medium text-gray-300">Stadium:</span>
                  {editInfoMode ? (
                    <input
                      name="home_stadium"
                      value={infoData.home_stadium}
                      onChange={handleInfoChange}
                      className="ml-2 bg-gray-800 border border-gray-600 rounded p-1 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  ) : (
                    <span className="ml-2">{team.home_stadium}</span>
                  )}
                </p>
                <p className="flex items-center">
                  <span className="font-medium text-gray-300">Founded:</span>
                  {editInfoMode ? (
                    <input
                      name="founded_year"
                      value={infoData.founded_year}
                      onChange={handleInfoChange}
                      className="ml-2 bg-gray-800 border border-gray-600 rounded p-1 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors w-20"
                    />
                  ) : (
                    <span className="ml-2">{team.founded_year}</span>
                  )}
                </p>
                <p className="flex items-center">
                  <span className="font-medium text-gray-300">Country:</span>
                  {editInfoMode ? (
                    <input
                      name="country"
                      value={infoData.country}
                      onChange={handleInfoChange}
                      className="ml-2 bg-gray-800 border border-gray-600 rounded p-1 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  ) : (
                    <span className="ml-2">{team.country}</span>
                  )}
                </p>
              </div>
              {editInfoMode && (
                <div className="flex gap-4 mt-4">
                  <button
                    onClick={handleInfoSave}
                    className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                    disabled={savingInfo}
                  >
                    {savingInfo ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={() => {
                      setEditInfoMode(false);
                      setInfoData({
                        name: team.name,
                        coach_name: team.coach_name,
                        home_stadium: team.home_stadium,
                        founded_year: team.founded_year,
                        country: team.country,
                      });
                    }}
                    className="px-4 py-2 rounded bg-gray-600 text-white hover:bg-gray-700"
                    disabled={savingInfo}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Team Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-[#1d1d1d] rounded-lg shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-white">Team Statistics</h2>
              <button
                onClick={() => setEditStatsMode((v) => !v)}
                className="ml-2 p-2 rounded hover:bg-gray-700"
                title="Edit team stats"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-400 hover:text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-2.828 0L9 13zm0 0L4 19l5-1 1-5z"
                  />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {[
                { label: "Wins", name: "wins", color: "text-blue-400" },
                { label: "Draws", name: "draws", color: "text-green-400" },
                { label: "Losses", name: "losses", color: "text-red-400" },
                { label: "Goals Scored", name: "goals_scored", color: "text-purple-400" },
                { label: "Goals Conceded", name: "goals_conceded", color: "text-orange-400" },
              ].map((stat) => (
                <div key={stat.name} className="bg-gray-800 rounded-lg p-4">
                  <p className={`text-sm font-medium ${stat.color}`}>{stat.label}</p>
                  {editStatsMode ? (
                    <input
                      type="number"
                      min="0"
                      name={stat.name}
                      value={statsData[stat.name]}
                      onChange={handleStatsChange}
                      className="w-full p-2 rounded bg-gray-900 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  ) : (
                    <p className="text-3xl font-bold text-white">
                      {stat.name === "wins" && team.wins}
                      {stat.name === "draws" && team.draws}
                      {stat.name === "losses" && team.losses}
                      {stat.name === "goals_scored" && team.goals_scored}
                      {stat.name === "goals_conceded" && team.goals_conceded}
                    </p>
                  )}
                </div>
              ))}
            </div>
            {editStatsMode && (
              <div className="flex gap-4 mt-4">
                <button
                  onClick={handleStatsSave}
                  className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                  disabled={savingStats}
                >
                  {savingStats ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => {
                    setEditStatsMode(false);
                    setStatsData({
                      wins: team.wins,
                      draws: team.draws,
                      losses: team.losses,
                      goals_scored: team.goals_scored,
                      goals_conceded: team.goals_conceded,
                    });
                  }}
                  className="px-4 py-2 rounded bg-gray-600 text-white hover:bg-gray-700"
                  disabled={savingStats}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Squad Overview */}
          <div className="bg-[#1d1d1d] rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-white mb-6">Squad Overview</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Total Players</span>
                <span className="text-2xl font-bold text-white">{team.players ? team.players.length : 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Average Age</span>
                <span className="text-2xl font-bold text-white">
                  {team.players && team.players.length > 0
                    ? Math.round(
                        team.players.reduce((acc: number, player: PlayerType) => acc + (player.age || 0), 0) / team.players.length
                      )
                    : "N/A"}
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
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                    Age
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                    Nationality
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {team.players.map((player: PlayerType) => (
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
}