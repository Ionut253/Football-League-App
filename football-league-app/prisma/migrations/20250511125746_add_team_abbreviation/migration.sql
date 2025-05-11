-- CreateTable
CREATE TABLE "Player" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "position" VARCHAR(50),
    "age" INTEGER,
    "nationality" VARCHAR(100),
    "team_id" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "abbreviation" VARCHAR(10),
    "coach_name" VARCHAR(100),
    "home_stadium" VARCHAR(100),
    "founded_year" INTEGER,
    "wins" INTEGER DEFAULT 0,
    "draws" INTEGER DEFAULT 0,
    "losses" INTEGER DEFAULT 0,
    "goals_scored" INTEGER DEFAULT 0,
    "goals_conceded" INTEGER DEFAULT 0,
    "country" VARCHAR(100),
    "createdAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Team_name_key" ON "Team"("name");

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
