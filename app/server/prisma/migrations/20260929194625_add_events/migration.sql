-- CreateTable
CREATE TABLE "user_event_tracking" (
    "id" SERIAL NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "daily" INTEGER NOT NULL DEFAULT 0,
    "total" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "user_event_tracking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_event_tracking_userId_idx" ON "user_event_tracking"("userId");

-- CreateIndex
CREATE INDEX "user_event_tracking_eventId_idx" ON "user_event_tracking"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "user_event_tracking_eventId_userId_key" ON "user_event_tracking"("eventId", "userId");

-- AddForeignKey
ALTER TABLE "user_event_tracking" ADD CONSTRAINT "user_event_tracking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
