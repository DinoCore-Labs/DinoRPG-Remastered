-- Cosmetic surgery is per Dinoz; its latest operation is retained for the 30-day cooldown.
CREATE TABLE "dinoz_surgery" (
    "dinozId" INTEGER NOT NULL,
    "userId" UUID NOT NULL,
    "startedAt" TIMESTAMPTZ(3) NOT NULL,
    "readyAt" TIMESTAMPTZ(3) NOT NULL,
    "finishedAt" TIMESTAMPTZ(3),
    "oldDisplay" TEXT NOT NULL,
    "newDisplay" TEXT NOT NULL,
    CONSTRAINT "dinoz_surgery_pkey" PRIMARY KEY ("dinozId")
);
CREATE INDEX "dinoz_surgery_userId_idx" ON "dinoz_surgery"("userId");
ALTER TABLE "dinoz_surgery" ADD CONSTRAINT "dinoz_surgery_dinozId_fkey"
    FOREIGN KEY ("dinozId") REFERENCES "Dinoz"("id") ON DELETE CASCADE ON UPDATE CASCADE;
