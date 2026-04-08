-- CreateTable
CREATE TABLE "dinoz_mission" (
    "id" SERIAL NOT NULL,
    "missionKey" TEXT NOT NULL,
    "progression" INTEGER NOT NULL DEFAULT 0,
    "tracking" INTEGER NOT NULL DEFAULT 0,
    "state" JSONB,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "dinozId" INTEGER NOT NULL,

    CONSTRAINT "dinoz_mission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "dinoz_mission_dinozId_idx" ON "dinoz_mission"("dinozId");

-- CreateIndex
CREATE INDEX "dinoz_mission_missionKey_idx" ON "dinoz_mission"("missionKey");

-- CreateIndex
CREATE INDEX "dinoz_mission_isCompleted_idx" ON "dinoz_mission"("isCompleted");

-- CreateIndex
CREATE UNIQUE INDEX "dinoz_mission_missionKey_dinozId_key" ON "dinoz_mission"("missionKey", "dinozId");

-- AddForeignKey
ALTER TABLE "dinoz_mission" ADD CONSTRAINT "dinoz_mission_dinozId_fkey" FOREIGN KEY ("dinozId") REFERENCES "Dinoz"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
