-- CreateEnum
CREATE TYPE "JobType" AS ENUM ('DAILY_AT', 'INTERVAL');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('IDLE', 'RUNNING', 'SUCCESS', 'FAILED');

-- CreateTable
CREATE TABLE "job_definition" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "JobType" NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "dailyHour" INTEGER,
    "dailyMinute" INTEGER,
    "intervalMs" INTEGER,
    "status" "JobStatus" NOT NULL DEFAULT 'IDLE',
    "lastRunAt" TIMESTAMPTZ(3),
    "nextRunAt" TIMESTAMPTZ(3),
    "lastError" TEXT,
    "lockedAt" TIMESTAMPTZ(3),
    "lockedBy" TEXT,
    "lockTimeoutS" INTEGER NOT NULL DEFAULT 300,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "job_definition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_run" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "startedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMPTZ(3),
    "success" BOOLEAN,
    "error" TEXT,
    "triggeredBy" TEXT,

    CONSTRAINT "job_run_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "job_definition_key_key" ON "job_definition"("key");

-- CreateIndex
CREATE INDEX "job_run_jobId_startedAt_idx" ON "job_run"("jobId", "startedAt");

-- AddForeignKey
ALTER TABLE "job_run" ADD CONSTRAINT "job_run_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "job_definition"("id") ON DELETE CASCADE ON UPDATE CASCADE;
