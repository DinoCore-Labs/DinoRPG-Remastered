-- CreateTable
CREATE TABLE "dinoz_skill" (
    "id" SERIAL NOT NULL,
    "skillId" INTEGER NOT NULL,
    "state" BOOLEAN NOT NULL DEFAULT true,
    "dinozId" INTEGER,

    CONSTRAINT "dinoz_skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dinoz_skill_unlockable" (
    "id" SERIAL NOT NULL,
    "skillId" INTEGER NOT NULL,
    "dinozId" INTEGER,

    CONSTRAINT "dinoz_skill_unlockable_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "dinoz_skill_dinozId_idx" ON "dinoz_skill"("dinozId");

-- CreateIndex
CREATE UNIQUE INDEX "dinoz_skill_skillId_dinozId_key" ON "dinoz_skill"("skillId", "dinozId");

-- AddForeignKey
ALTER TABLE "dinoz_skill" ADD CONSTRAINT "dinoz_skill_dinozId_fkey" FOREIGN KEY ("dinozId") REFERENCES "Dinoz"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "dinoz_skill_unlockable" ADD CONSTRAINT "dinoz_skill_unlockable_dinozId_fkey" FOREIGN KEY ("dinozId") REFERENCES "Dinoz"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
