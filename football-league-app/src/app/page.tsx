"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { TeamType } from "@/app/types/team";

export default function PremierLeagueTeams() {
  const [teams, setTeams] = useState<TeamType[]>([]);
  const [filteredTeams, setFilteredTeams] = useState<TeamType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortCriteria, setSortCriteria] = useState("points");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const teamsPerPage = 10;

  // Fetch and filter teams
  const fetchTeams = async (isSearch = false) => {
  setIsLoading(true);
  setError(null);
  try {
    const query = new URLSearchParams({
      ...(searchQuery && { name: searchQuery }),  // Pass 'name' for searching
      sortBy: sortCriteria,
      order: sortOrder,
    }).toString();

    const res = await fetch(`/api/teams?${query}`); // Use the query params in the URL
    if (!res.ok) throw new Error("Failed to fetch teams");
    const data = await res.json();

    // If no teams match, update state to show "No teams found"
    if (data.length === 0) {
      setTeams([]);
      setFilteredTeams([]);
    } else {
      setTeams(data); // Update the teams based on the response
      setFilteredTeams(data);
    }
  } catch (err) {
    console.error(err);
    setError("Failed to load teams. Try again later.");
  } finally {
    setIsLoading(false);
    searchInputRef.current?.focus();
  }
};



  // Handle search/sort debounce
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery || sortCriteria || sortOrder) {
        fetchTeams(true);
      } else {
        fetchTeams(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, sortCriteria, sortOrder]);

  // Initial load
  useEffect(() => {
    fetchTeams();
  }, []);

  // Pagination
  const paginatedTeams = filteredTeams.slice(
    (currentPage - 1) * teamsPerPage,
    currentPage * teamsPerPage
  );
  const totalPages = Math.ceil(filteredTeams.length / teamsPerPage);

  const handleCheckboxChange = (teamName: string) => {
    setSelectedTeams((prev) =>
      prev.includes(teamName)
        ? prev.filter((name) => name !== teamName)
        : [...prev, teamName]
    );
  };

  const handleRemoveTeams = async () => {
    if (!selectedTeams.length) return;

    setIsLoading(true);
    try {
      await Promise.all(
        selectedTeams.map(async (name) => {
          const res = await fetch(`/api/teams/${name}`, { method: "DELETE" });
          if (!res.ok) throw new Error(`Failed to delete ${name}`);
        })
      );
      setSelectedTeams([]);
      await fetchTeams();
    } catch (err) {
      setError("Error removing teams.");
    } finally {
      setIsLoading(false);
      searchInputRef.current?.focus();
    }
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  if (isLoading) return <StatusPage message="Loading teams..." />;
  if (error) return <StatusPage message={error} isError onRetry={fetchTeams} />;
  // if (!teams.length) return <StatusPage message="No Teams Available" />;

  return (
    <div className="bg-black text-white min-h-screen p-4">
      <div className="container mx-auto bg-[#1d1d1d] p-6 rounded-lg shadow-lg">
        <div className="flex gap-4 mb-4 items-center">
          <input
            ref={searchInputRef}
            autoFocus
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="p-2 rounded bg-gray-800 text-white border border-gray-600 w-64"
            placeholder="Search teams..."
          />
          <select
            value={sortCriteria}
            onChange={(e) => setSortCriteria(e.target.value)}
            className="p-2 rounded bg-gray-800 border border-gray-600"
          >
            <option value="points">Points</option>
            <option value="wins">Wins</option>
            <option value="goalsScored">Goals Scored</option>
            <option value="goalsConceded">Goals Conceded</option>
            <option value="name">Name</option>
          </select>
          <button onClick={toggleSortOrder} className="bg-blue-600 px-4 py-2 rounded cursor-pointer">
            {sortOrder === "asc" ? "↑ Asc" : "↓ Desc"}
          </button>
          <button
            className="bg-red-600 px-4 py-2 rounded cursor-pointer"
            onClick={handleRemoveTeams}
            disabled={!selectedTeams.length}
          >
            Remove Selected
          </button>
          <button
            onClick={() => router.push("/statistics")}
            className="bg-purple-600 px-4 py-2 rounded cursor-pointer"
          >
            View Stats
          </button>
        </div>

        <TeamTable
          teams={paginatedTeams}
          selected={selectedTeams}
          onSelect={handleCheckboxChange}
          onTeamClick={(name) => router.push(`/${name}`)}
        />

        <PaginationControls
          current={currentPage}
          total={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}

const StatusPage = ({
  message,
  isError = false,
  onRetry,
}: {
  message: string;
  isError?: boolean;
  onRetry?: () => void;
}) => (
  <div className="bg-black text-white min-h-screen flex items-center justify-center">
    <div className="text-center">
      <h1 className={`text-3xl font-bold ${isError ? "text-red-500" : ""}`}>
        {isError ? "Error" : "Notice"}
      </h1>
      <p className="mt-2">{message}</p>
      {isError && onRetry && (
        <button onClick={onRetry} className="mt-4 bg-blue-500 px-4 py-2 rounded">
          Try Again
        </button>
      )}
    </div>
  </div>
);

const TeamTable = ({
  teams,
  selected,
  onSelect,
  onTeamClick,
}: {
  teams: TeamType[];
  selected: string[];
  onSelect: (teamName: string) => void;
  onTeamClick: (teamName: string) => void;
}) => (
  <div className="overflow-x-auto">
    <table className="min-w-full bg-[#1d1d1d] text-white table-fixed rounded-lg overflow-hidden">
      <thead className="bg-gray-700">
        <tr>
          <th className="py-2 px-4 w-8">#</th>
          <th className="py-2 px-4 w-1/3">Team</th>
          <th className="py-2 px-4 text-center w-16">Played</th>
          <th className="py-2 px-4 text-center w-16">Wins</th>
          <th className="py-2 px-4 text-center w-16">Draws</th>
          <th className="py-2 px-4 text-center w-16">Losses</th>
          <th className="py-2 px-4 text-center w-16">Points</th>
          <th className="py-2 px-4 text-center w-12">✓</th>
        </tr>
      </thead>
      <tbody>
        {teams.map((team) => {
          const highlight =
            team.metadata?.isMostWins
              ? "bg-green-600"
              : team.metadata?.isLeastWins
              ? "bg-red-500"
              : team.metadata?.isAvgWins
              ? "bg-blue-700"
              : "";

          return (
            <tr
              key={team.name}
              className={`${highlight} border-b border-gray-700 hover:bg-gray-600`}
            >
              <td className="py-2 px-4">{team.position}</td>
              <td className="py-2 px-4 cursor-pointer" onClick={() => onTeamClick(team.name)}>
                {team.name}
              </td>
              <td className="py-2 px-4 text-center">{team.gamesPlayed}</td>
              <td className="py-2 px-4 text-center">{team.wins}</td>
              <td className="py-2 px-4 text-center">{team.draws}</td>
              <td className="py-2 px-4 text-center">{team.losses}</td>
              <td className="py-2 px-4 text-center font-bold">{team.points}</td>
              <td className="py-2 px-4 text-center">
                <input
                  type="checkbox"
                  checked={selected.includes(team.name)}
                  onChange={() => onSelect(team.name)}
                />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

const PaginationControls = ({
  current,
  total,
  onPageChange,
}: {
  current: number;
  total: number;
  onPageChange: (page: number) => void;
}) => {
  if (total <= 1) return null;
  return (
    <div className="flex justify-center mt-6 gap-4">
      <button
        onClick={() => onPageChange(current - 1)}
        disabled={current <= 1}
        className={`px-4 py-2 rounded ${
          current <= 1 ? "bg-gray-500 cursor-not-allowed" : "bg-blue-500"
        }`}
      >
        Prev
      </button>
      <span className="text-white">
        Page {current} of {total}
      </span>
      <button
        onClick={() => onPageChange(current + 1)}
        disabled={current >= total}
        className={`px-4 py-2 rounded ${
          current >= total ? "bg-gray-500 cursor-not-allowed" : "bg-blue-500"
        }`}
      >
        Next
      </button>
    </div>
  );
};
