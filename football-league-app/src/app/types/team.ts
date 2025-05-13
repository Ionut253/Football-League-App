export type TeamType = {
    id: number;
    name: string;
    abbreviation: string;
    coach_name: string;
    home_stadium: string;
    founded_year: string;
    wins: number;
    draws: number;
    losses: number;
    goals_scored: number;
    goals_conceded: number;
    country: string;
    userId: number;

    // Computed fields
    points: number;
    gamesPlayed: number;
    position?: number;

    metadata?: {
        isMostWins?: boolean;
        isLeastWins?: boolean;
        isAvgWins?: boolean;
    };
};