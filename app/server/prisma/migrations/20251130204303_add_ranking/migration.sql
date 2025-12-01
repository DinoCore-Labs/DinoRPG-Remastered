-- CreateTable
CREATE TABLE "Ranking" (
    "id" SERIAL NOT NULL,
    "dinozCount" INTEGER NOT NULL DEFAULT 0,
    "points" INTEGER NOT NULL DEFAULT 0,
    "average" INTEGER NOT NULL DEFAULT 0,
    "completion" INTEGER NOT NULL DEFAULT 0,
    "dojo" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Ranking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Ranking_userId_key" ON "Ranking"("userId");

-- CreateIndex
CREATE INDEX "Ranking_userId_idx" ON "Ranking"("userId");

-- AddForeignKey
ALTER TABLE "Ranking" ADD CONSTRAINT "Ranking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
