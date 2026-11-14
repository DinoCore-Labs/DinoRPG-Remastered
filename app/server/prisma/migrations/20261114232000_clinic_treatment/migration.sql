-- Le statut MT "soin" immobilise un Dinoz pendant le traitement.
ALTER TYPE "DinozState" ADD VALUE IF NOT EXISTS 'clinic';

-- Une ligne par joueur : dernière prise en charge, réutilisée seulement
-- après guérison et expiration des 20 heures.
CREATE TABLE "clinic_treatment" (
    "userId" UUID NOT NULL,
    "dinozId" INTEGER NOT NULL,
    "startedAt" TIMESTAMPTZ(3) NOT NULL,
    "readyAt" TIMESTAMPTZ(3) NOT NULL,
    "finishedAt" TIMESTAMPTZ(3),
    CONSTRAINT "clinic_treatment_pkey" PRIMARY KEY ("userId")
);

CREATE INDEX "clinic_treatment_dinozId_idx" ON "clinic_treatment"("dinozId");
ALTER TABLE "clinic_treatment" ADD CONSTRAINT "clinic_treatment_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "clinic_treatment" ADD CONSTRAINT "clinic_treatment_dinozId_fkey"
    FOREIGN KEY ("dinozId") REFERENCES "Dinoz"("id") ON DELETE CASCADE ON UPDATE CASCADE;
