-- CreateTable
CREATE TABLE "notification" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "content" JSONB,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dojo" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "activeChallenge" JSONB,
    "reputation" INTEGER NOT NULL DEFAULT 0,
    "teamUpdate" TIMESTAMP(3),
    "dailyReset" INTEGER NOT NULL DEFAULT 0,
    "tournamentTeamId" UUID,

    CONSTRAINT "dojo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DojoTeam" (
    "id" UUID NOT NULL,
    "dojoId" UUID NOT NULL,
    "dinozId" INTEGER NOT NULL,
    "fighted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "DojoTeam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DojoOpponents" (
    "id" UUID NOT NULL,
    "dojoId" UUID NOT NULL,
    "dinozId" INTEGER NOT NULL,
    "fighted" BOOLEAN NOT NULL DEFAULT false,
    "achieved" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "DojoOpponents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DojoChallengeHistory" (
    "id" UUID NOT NULL,
    "dojoId" UUID NOT NULL,
    "myDinozId" INTEGER NOT NULL,
    "opponentId" INTEGER NOT NULL,
    "challenge" TEXT NOT NULL,
    "victory" BOOLEAN NOT NULL,
    "achieved" BOOLEAN NOT NULL,
    "archivedAt" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DojoChallengeHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FightArchive" (
    "id" UUID NOT NULL,
    "fighters" TEXT NOT NULL,
    "steps" TEXT NOT NULL,
    "seed" VARCHAR(255) NOT NULL,
    "result" BOOLEAN NOT NULL,
    "userId" UUID,
    "leftUserId" UUID,
    "rightUserId" UUID,
    "tournamentStep" INTEGER NOT NULL DEFAULT 0,
    "slot" INTEGER NOT NULL DEFAULT 0,
    "createdDate" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tournamentTeamLeftId" UUID,
    "tournamentTeamRightId" UUID,
    "tournamentId" UUID,
    "metadata" TEXT,

    CONSTRAINT "FightArchive_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FightWatched" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "favorite" BOOLEAN NOT NULL,
    "fightArchiveId" UUID NOT NULL,

    CONSTRAINT "FightWatched_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tournament" (
    "id" UUID NOT NULL,
    "date" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "formatName" TEXT NOT NULL DEFAULT 'ffa',
    "teamSize" INTEGER NOT NULL DEFAULT 1,
    "raceMinimum" INTEGER NOT NULL DEFAULT 1,
    "poison" BOOLEAN NOT NULL DEFAULT true,
    "teamRace" TEXT NOT NULL,
    "levelLimit" INTEGER NOT NULL DEFAULT 50,
    "cashPrice" INTEGER NOT NULL DEFAULT 0,
    "nextRound" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tournament_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TournamentTeam" (
    "id" UUID NOT NULL,
    "dojoId" UUID,
    "teamCount" INTEGER NOT NULL DEFAULT 1,
    "tournamentId" UUID,
    "poolNumber" INTEGER,
    "poolWins" INTEGER NOT NULL DEFAULT 0,
    "poolLosses" INTEGER NOT NULL DEFAULT 0,
    "poolQualified" BOOLEAN NOT NULL DEFAULT false,
    "poolEliminated" BOOLEAN NOT NULL DEFAULT false,
    "finalSeed" INTEGER,

    CONSTRAINT "TournamentTeam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_DinozToTournamentTeam" (
    "A" INTEGER NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_DinozToTournamentTeam_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "notification_userId_idx" ON "notification"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "dojo_userId_key" ON "dojo"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "dojo_tournamentTeamId_key" ON "dojo"("tournamentTeamId");

-- CreateIndex
CREATE INDEX "dojo_userId_idx" ON "dojo"("userId");

-- CreateIndex
CREATE INDEX "DojoTeam_dojoId_idx" ON "DojoTeam"("dojoId");

-- CreateIndex
CREATE UNIQUE INDEX "DojoTeam_dojoId_dinozId_key" ON "DojoTeam"("dojoId", "dinozId");

-- CreateIndex
CREATE INDEX "DojoOpponents_dojoId_idx" ON "DojoOpponents"("dojoId");

-- CreateIndex
CREATE UNIQUE INDEX "DojoOpponents_dojoId_dinozId_key" ON "DojoOpponents"("dojoId", "dinozId");

-- CreateIndex
CREATE INDEX "DojoChallengeHistory_dojoId_idx" ON "DojoChallengeHistory"("dojoId");

-- CreateIndex
CREATE INDEX "FightArchive_tournamentId_tournamentStep_idx" ON "FightArchive"("tournamentId", "tournamentStep");

-- CreateIndex
CREATE INDEX "FightWatched_userId_fightArchiveId_idx" ON "FightWatched"("userId", "fightArchiveId");

-- CreateIndex
CREATE UNIQUE INDEX "FightWatched_userId_fightArchiveId_key" ON "FightWatched"("userId", "fightArchiveId");

-- CreateIndex
CREATE UNIQUE INDEX "Tournament_id_key" ON "Tournament"("id");

-- CreateIndex
CREATE INDEX "Tournament_id_date_idx" ON "Tournament"("id", "date");

-- CreateIndex
CREATE INDEX "TournamentTeam_dojoId_idx" ON "TournamentTeam"("dojoId");

-- CreateIndex
CREATE INDEX "TournamentTeam_tournamentId_poolNumber_idx" ON "TournamentTeam"("tournamentId", "poolNumber");

-- CreateIndex
CREATE UNIQUE INDEX "TournamentTeam_dojoId_tournamentId_key" ON "TournamentTeam"("dojoId", "tournamentId");

-- CreateIndex
CREATE INDEX "_DinozToTournamentTeam_B_index" ON "_DinozToTournamentTeam"("B");

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dojo" ADD CONSTRAINT "dojo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dojo" ADD CONSTRAINT "dojo_tournamentTeamId_fkey" FOREIGN KEY ("tournamentTeamId") REFERENCES "TournamentTeam"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DojoTeam" ADD CONSTRAINT "DojoTeam_dojoId_fkey" FOREIGN KEY ("dojoId") REFERENCES "dojo"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "DojoTeam" ADD CONSTRAINT "DojoTeam_dinozId_fkey" FOREIGN KEY ("dinozId") REFERENCES "Dinoz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DojoOpponents" ADD CONSTRAINT "DojoOpponents_dojoId_fkey" FOREIGN KEY ("dojoId") REFERENCES "dojo"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "DojoOpponents" ADD CONSTRAINT "DojoOpponents_dinozId_fkey" FOREIGN KEY ("dinozId") REFERENCES "Dinoz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DojoChallengeHistory" ADD CONSTRAINT "DojoChallengeHistory_dojoId_fkey" FOREIGN KEY ("dojoId") REFERENCES "dojo"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "FightArchive" ADD CONSTRAINT "FightArchive_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FightArchive" ADD CONSTRAINT "FightArchive_leftUserId_fkey" FOREIGN KEY ("leftUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FightArchive" ADD CONSTRAINT "FightArchive_rightUserId_fkey" FOREIGN KEY ("rightUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FightArchive" ADD CONSTRAINT "FightArchive_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FightArchive" ADD CONSTRAINT "FightArchive_tournamentTeamLeftId_fkey" FOREIGN KEY ("tournamentTeamLeftId") REFERENCES "TournamentTeam"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FightArchive" ADD CONSTRAINT "FightArchive_tournamentTeamRightId_fkey" FOREIGN KEY ("tournamentTeamRightId") REFERENCES "TournamentTeam"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FightWatched" ADD CONSTRAINT "FightWatched_fightArchiveId_fkey" FOREIGN KEY ("fightArchiveId") REFERENCES "FightArchive"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FightWatched" ADD CONSTRAINT "FightWatched_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentTeam" ADD CONSTRAINT "TournamentTeam_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DinozToTournamentTeam" ADD CONSTRAINT "_DinozToTournamentTeam_A_fkey" FOREIGN KEY ("A") REFERENCES "Dinoz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DinozToTournamentTeam" ADD CONSTRAINT "_DinozToTournamentTeam_B_fkey" FOREIGN KEY ("B") REFERENCES "TournamentTeam"("id") ON DELETE CASCADE ON UPDATE CASCADE;
