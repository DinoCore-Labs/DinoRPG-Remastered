-- AlterTable
ALTER TABLE "User" ADD COLUMN     "clanId" INTEGER;

-- CreateTable
CREATE TABLE "Clan" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "treasureValue" INTEGER NOT NULL DEFAULT 0,
    "creationDate" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "banner" BYTEA,
    "leaderId" UUID NOT NULL,
    "langs" "Language"[],

    CONSTRAINT "Clan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClanJoinRequest" (
    "id" SERIAL NOT NULL,
    "clanId" INTEGER NOT NULL,
    "date" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" UUID NOT NULL,

    CONSTRAINT "ClanJoinRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clan_ingredient" (
    "id" SERIAL NOT NULL,
    "ingredientId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "clanId" INTEGER NOT NULL,

    CONSTRAINT "clan_ingredient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clan_messages" (
    "id" SERIAL NOT NULL,
    "clanId" INTEGER NOT NULL,
    "date" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "content" TEXT NOT NULL,
    "authorId" UUID,
    "authorName" TEXT NOT NULL,

    CONSTRAINT "clan_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClanHistory" (
    "id" SERIAL NOT NULL,
    "clanId" INTEGER NOT NULL,
    "date" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL DEFAULT 'CLAN_CREATED',
    "authorId" UUID,
    "authorMessage" TEXT NOT NULL,

    CONSTRAINT "ClanHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClanMember" (
    "id" SERIAL NOT NULL,
    "clanId" INTEGER NOT NULL,
    "dateJoin" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nickname" TEXT,
    "rights" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "donation" INTEGER NOT NULL DEFAULT 0,
    "userId" UUID NOT NULL,

    CONSTRAINT "ClanMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClanPage" (
    "id" SERIAL NOT NULL,
    "home" BOOLEAN NOT NULL,
    "public" BOOLEAN NOT NULL,
    "name" TEXT NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "clanId" INTEGER NOT NULL,

    CONSTRAINT "ClanPage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Clan_name_key" ON "Clan"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Clan_leaderId_key" ON "Clan"("leaderId");

-- CreateIndex
CREATE UNIQUE INDEX "ClanJoinRequest_userId_key" ON "ClanJoinRequest"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "clan_ingredient_ingredientId_clanId_key" ON "clan_ingredient"("ingredientId", "clanId");

-- CreateIndex
CREATE INDEX "clan_messages_clanId_idx" ON "clan_messages"("clanId");

-- CreateIndex
CREATE UNIQUE INDEX "clan_messages_id_clanId_key" ON "clan_messages"("id", "clanId");

-- CreateIndex
CREATE UNIQUE INDEX "ClanMember_userId_key" ON "ClanMember"("userId");

-- CreateIndex
CREATE INDEX "ClanMember_clanId_idx" ON "ClanMember"("clanId");

-- CreateIndex
CREATE INDEX "ClanPage_clanId_idx" ON "ClanPage"("clanId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_clanId_fkey" FOREIGN KEY ("clanId") REFERENCES "Clan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Clan" ADD CONSTRAINT "Clan_leaderId_fkey" FOREIGN KEY ("leaderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClanJoinRequest" ADD CONSTRAINT "ClanJoinRequest_clanId_fkey" FOREIGN KEY ("clanId") REFERENCES "Clan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClanJoinRequest" ADD CONSTRAINT "ClanJoinRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clan_ingredient" ADD CONSTRAINT "clan_ingredient_clanId_fkey" FOREIGN KEY ("clanId") REFERENCES "Clan"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "clan_messages" ADD CONSTRAINT "clan_messages_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clan_messages" ADD CONSTRAINT "clan_messages_clanId_fkey" FOREIGN KEY ("clanId") REFERENCES "Clan"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ClanHistory" ADD CONSTRAINT "ClanHistory_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClanHistory" ADD CONSTRAINT "ClanHistory_clanId_fkey" FOREIGN KEY ("clanId") REFERENCES "Clan"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ClanMember" ADD CONSTRAINT "ClanMember_clanId_fkey" FOREIGN KEY ("clanId") REFERENCES "Clan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClanMember" ADD CONSTRAINT "ClanMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClanPage" ADD CONSTRAINT "ClanPage_clanId_fkey" FOREIGN KEY ("clanId") REFERENCES "Clan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
