CREATE TABLE "bot_action_log" (
    "id" SERIAL NOT NULL,
    "botProfileId" UUID NOT NULL,
    "dinozId" INTEGER,
    "action" VARCHAR(64) NOT NULL,
    "success" BOOLEAN NOT NULL,
    "error" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bot_action_log_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "bot_action_log_botProfileId_createdAt_idx"
ON "bot_action_log"("botProfileId", "createdAt");

ALTER TABLE "bot_action_log"
ADD CONSTRAINT "bot_action_log_botProfileId_fkey"
FOREIGN KEY ("botProfileId") REFERENCES "bot_profile"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
