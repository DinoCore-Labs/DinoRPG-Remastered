-- CreateEnum
CREATE TYPE "DinozConcentrationState" AS ENUM ('GATHERING', 'OPEN');

-- CreateTable
CREATE TABLE "dinoz_concentration" (
    "dinozId" INTEGER NOT NULL,
    "sessionId" INTEGER NOT NULL,
    "startedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dinoz_concentration_pkey" PRIMARY KEY ("dinozId")
);

-- CreateTable
CREATE TABLE "dinoz_concentration_session" (
    "id" SERIAL NOT NULL,
    "scopeKey" VARCHAR(64) NOT NULL,
    "state" "DinozConcentrationState" NOT NULL DEFAULT 'GATHERING',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "openedAt" TIMESTAMPTZ(3),

    CONSTRAINT "dinoz_concentration_session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "dinoz_concentration_sessionId_idx" ON "dinoz_concentration"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "dinoz_concentration_session_scopeKey_key" ON "dinoz_concentration_session"("scopeKey");

-- CreateIndex
CREATE INDEX "dinoz_concentration_session_state_idx" ON "dinoz_concentration_session"("state");

-- AddForeignKey
ALTER TABLE "dinoz_concentration" ADD CONSTRAINT "dinoz_concentration_dinozId_fkey" FOREIGN KEY ("dinozId") REFERENCES "Dinoz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dinoz_concentration" ADD CONSTRAINT "dinoz_concentration_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "dinoz_concentration_session"("id") ON DELETE CASCADE ON UPDATE CASCADE;
