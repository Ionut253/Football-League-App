"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { TeamType } from "@/app/types/team";
import { UserType } from "@/app/types/users";
import Link from "next/link";

export default function HomePage() {
  const [teams, setTeams] = useState<TeamType[]>([]);
  const [filteredTeams, setFilteredTeams] = useState<TeamType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortCriteria, setSortCriteria] = useState("points");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTeam, setNewTeam] = useState({
    name: "",
    abbreviation: "",
    coach_name: "",
    home_stadium: "",
    founded_year: "",
    country: "",
    wins: "",
    draws: "",
    losses: "",
    goals_scored: "",
    goals_conceded: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const searchInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const teamsPerPage = 100;

  // Add logout function
  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  // Fetch and filter teams
  const fetchTeams = async (isSearch = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        router.push('/');
        return;
      }

      const user: UserType = JSON.parse(userStr);
      if (!user.id) {
        router.push('/');
        return;
      }

      const query = new URLSearchParams({
        ...(searchQuery && { name: searchQuery }),
        sortBy: sortCriteria,
        order: sortOrder,
        userId: user.id.toString(),
      }).toString();

      const res = await fetch(`/api/teams?${query}`);
      if (!res.ok) throw new Error("Failed to fetch teams");
      const data: TeamType[] = await res.json();

      setTeams(data);
      setFilteredTeams(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load teams. Try again later.");
    } finally {
      setIsLoading(false);
      searchInputRef.current?.focus();
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
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
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        router.push('/');
        return;
      }

      const user: UserType = JSON.parse(userStr);
      if (!user.id) {
        router.push('/');
        return;
      }

      await Promise.all(
        selectedTeams.map(async (teamName) => {
          const team = teams.find(t => t.name === teamName);
          if (team) {
            const res = await fetch(`/api/teams/${team.id}?userId=${user.id}`, { 
              method: "DELETE" 
            });
            if (!res.ok) throw new Error(`Failed to delete ${teamName}`);
          }
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

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!newTeam.name.trim()) {
      errors.name = "Team name is required";
    }
    if (!newTeam.coach_name.trim()) {
      errors.coach_name = "Coach name is required";
    }
    if (!newTeam.home_stadium.trim()) {
      errors.home_stadium = "Home stadium is required";
    }
    if (!newTeam.founded_year.trim()) {
      errors.founded_year = "Founded year is required";
    } else if (!/^\d{4}$/.test(newTeam.founded_year)) {
      errors.founded_year = "Founded year must be a valid year (e.g., 1990)";
    }
    if (!newTeam.country.trim()) {
      errors.country = "Country is required";
    }

    // Validate integer fields
    const validateInteger = (value: string, fieldName: string) => {
      if (value.trim() === "") {
        errors[fieldName] = `${fieldName.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} is required`;
      } else if (!/^\d+$/.test(value)) {
        errors[fieldName] = "Must be a valid number";
      } else if (parseInt(value) < 0) {
        errors[fieldName] = "Cannot be negative";
      }
    };

    validateInteger(newTeam.wins, "wins");
    validateInteger(newTeam.draws, "draws");
    validateInteger(newTeam.losses, "losses");
    validateInteger(newTeam.goals_scored, "goals_scored");
    validateInteger(newTeam.goals_conceded, "goals_conceded");

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddTeam = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        router.push('/');
        return;
      }

      const user: UserType = JSON.parse(userStr);
      if (!user.id) {
        router.push('/');
        return;
      }

      const res = await fetch("/api/teams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newTeam,
          founded_year: parseInt(newTeam.founded_year),
          wins: parseInt(newTeam.wins),
          draws: parseInt(newTeam.draws),
          losses: parseInt(newTeam.losses),
          goals_scored: parseInt(newTeam.goals_scored),
          goals_conceded: parseInt(newTeam.goals_conceded),
          userId: user.id,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to create team");
      }

      setShowAddModal(false);
      setNewTeam({
        name: "",
        abbreviation: "",
        coach_name: "",
        home_stadium: "",
        founded_year: "",
        country: "",
        wins: "",
        draws: "",
        losses: "",
        goals_scored: "",
        goals_conceded: "",
      });
      await fetchTeams();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create team");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <StatusPage message="Loading teams..." />;
  if (error) return <StatusPage message={error} isError onRetry={fetchTeams} />;

  return (
    <div className="bg-black text-white min-h-screen p-4">
      <div className="container mx-auto bg-[#1d1d1d] p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-4 items-center flex-wrap">
            <input
              ref={searchInputRef}
              autoFocus
              value={searchQuery}
              onChange={handleSearchChange}
              className="p-2 rounded bg-gray-800 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors w-64"
              placeholder="Search teams..."
            />
            <select
              value={sortCriteria}
              onChange={(e) => setSortCriteria(e.target.value)}
              className="p-2 rounded bg-gray-800 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="points">Points</option>
              <option value="wins">Wins</option>
              <option value="goals_scored">Goals Scored</option>
              <option value="goals_conceded">Goals Conceded</option>
              <option value="name">Name</option>
            </select>
            <button onClick={toggleSortOrder} className="bg-blue-600 px-4 py-2 rounded cursor-pointer">
              {sortOrder === "asc" ? "↑ Asc" : "↓ Desc"}
            </button>
            <button
              className="bg-green-600 px-4 py-2 rounded cursor-pointer"
              onClick={() => setShowAddModal(true)}
            >
              Add Team
            </button>
            <button
              className="bg-red-600 px-4 py-2 rounded cursor-pointer"
              onClick={handleRemoveTeams}
              disabled={!selectedTeams.length}
            >
              Remove Selected
            </button>
          </div>
          <div className="flex gap-4 items-center">
            <button
              onClick={handleLogout}
              className="bg-red-600 px-4 py-2 rounded cursor-pointer hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
            {JSON.parse(localStorage.getItem('user') || '{}').role === 'ADMIN' && (
              <Link
                href="/admin/monitored-users"
                className="bg-green-600 px-4 py-2 rounded cursor-pointer hover:bg-green-700 transition-colors ml-2"
              >
                See Monitored Users
              </Link>
            )}
          </div>
        </div>

        <TeamTable
          teams={paginatedTeams}
          selected={selectedTeams}
          onSelect={handleCheckboxChange}
          onTeamClick={(id) => router.push(`/${id}`)}
        />

        <PaginationControls
          current={currentPage}
          total={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Add Team Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-[#1d1d1d] p-6 rounded-lg shadow-lg w-full max-w-md max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Add New Team</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-800 [&::-webkit-scrollbar-thumb]:bg-gray-600 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-gray-500 [&::-webkit-scrollbar]:rounded-full [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:my-2">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Team Name *</label>
                  <input
                    type="text"
                    value={newTeam.name}
                    onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                    className="w-full p-2 rounded bg-gray-800 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                  {formErrors.name && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Abbreviation</label>
                  <input
                    type="text"
                    value={newTeam.abbreviation}
                    onChange={(e) => setNewTeam({ ...newTeam, abbreviation: e.target.value })}
                    className="w-full p-2 rounded bg-gray-800 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="e.g., PSG"
                    maxLength={10}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Coach Name *</label>
                  <input
                    type="text"
                    value={newTeam.coach_name}
                    onChange={(e) => setNewTeam({ ...newTeam, coach_name: e.target.value })}
                    className="w-full p-2 rounded bg-gray-800 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                  {formErrors.coach_name && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.coach_name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Home Stadium *</label>
                  <input
                    type="text"
                    value={newTeam.home_stadium}
                    onChange={(e) => setNewTeam({ ...newTeam, home_stadium: e.target.value })}
                    className="w-full p-2 rounded bg-gray-800 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                  {formErrors.home_stadium && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.home_stadium}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Founded Year *</label>
                  <input
                    type="text"
                    value={newTeam.founded_year}
                    onChange={(e) => setNewTeam({ ...newTeam, founded_year: e.target.value })}
                    className="w-full p-2 rounded bg-gray-800 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="YYYY"
                  />
                  {formErrors.founded_year && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.founded_year}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Country *</label>
                  <input
                    type="text"
                    value={newTeam.country}
                    onChange={(e) => setNewTeam({ ...newTeam, country: e.target.value })}
                    className="w-full p-2 rounded bg-gray-800 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                  {formErrors.country && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.country}</p>
                  )}
                </div>

                {/* Stats Section */}
                <div className="border-t border-gray-700 pt-4 mt-4">
                  <h3 className="text-lg font-semibold mb-4">Team Statistics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Wins *</label>
                      <input
                        type="number"
                        min="0"
                        value={newTeam.wins}
                        onChange={(e) => setNewTeam({ ...newTeam, wins: e.target.value })}
                        className="w-full p-2 rounded bg-gray-800 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                      {formErrors.wins && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.wins}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Draws *</label>
                      <input
                        type="number"
                        min="0"
                        value={newTeam.draws}
                        onChange={(e) => setNewTeam({ ...newTeam, draws: e.target.value })}
                        className="w-full p-2 rounded bg-gray-800 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                      {formErrors.draws && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.draws}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Losses *</label>
                      <input
                        type="number"
                        min="0"
                        value={newTeam.losses}
                        onChange={(e) => setNewTeam({ ...newTeam, losses: e.target.value })}
                        className="w-full p-2 rounded bg-gray-800 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                      {formErrors.losses && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.losses}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Goals Scored *</label>
                      <input
                        type="number"
                        min="0"
                        value={newTeam.goals_scored}
                        onChange={(e) => setNewTeam({ ...newTeam, goals_scored: e.target.value })}
                        className="w-full p-2 rounded bg-gray-800 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                      {formErrors.goals_scored && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.goals_scored}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Goals Conceded *</label>
                      <input
                        type="number"
                        min="0"
                        value={newTeam.goals_conceded}
                        onChange={(e) => setNewTeam({ ...newTeam, goals_conceded: e.target.value })}
                        className="w-full p-2 rounded bg-gray-800 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                      {formErrors.goals_conceded && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.goals_conceded}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-6 border-t border-gray-700 pt-4">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded bg-gray-600 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTeam}
                className="px-4 py-2 rounded bg-green-600 cursor-pointer"
                disabled={isLoading}
              >
                {isLoading ? "Adding..." : "Add Team"}
              </button>
            </div>
          </div>
        </div>
      )}
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
        {isError ? "Error" : "Please wait..."}
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
  onTeamClick: (teamId: number) => void;
}) => (
  <div className="overflow-x-auto">
    <table className="min-w-full bg-[#1d1d1d] text-white table-fixed rounded-lg overflow-hidden">
      <thead className="bg-gray-700">
        <tr>
          <th className="py-2 px-4 w-8 text-left">#</th>
          <th className="py-2 px-4 w-1/3 text-left">Team</th>
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
            team.metadata?.isMostWins ? 'bg-green-600' :
            team.metadata?.isLeastWins ? 'bg-red-500' :
            team.metadata?.isAvgWins ? 'bg-blue-700' : '';

          return (
            <tr
              key={team.name}
              className={`${highlight} border-b border-gray-700 hover:bg-gray-600`}
            >
              <td className="py-2 px-4">{team.position}</td>
              <td className="py-2 px-4 cursor-pointer" onClick={() => onTeamClick(team.id)}>
                {team.name}
              </td>
              <td className="py-2 px-4 text-center">{team.wins + team.draws + team.losses}</td>
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
  return (
    <div className="flex justify-center mt-6 gap-4">
      <button
        onClick={() => onPageChange(current - 1)}
        disabled={current <= 1}
        className={`px-4 py-2 rounded ${
          current <= 1 ? "bg-gray-500 cursor-not-allowed" : "bg-blue-500 cursor-pointer"
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
          current >= total ? "bg-gray-500 cursor-not-allowed" : "bg-blue-500 cursor-pointer"
        }`}
      >
        Next
      </button>
    </div>
  );
};