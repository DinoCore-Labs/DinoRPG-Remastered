-- Record completed tournament payouts so retries cannot duplicate gold, items or notifications.
CREATE TABLE "tournament_reward_payment" (
    "tournamentId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "rank" INTEGER NOT NULL,
    "grantedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tournament_reward_payment_pkey" PRIMARY KEY ("tournamentId", "userId")
);

CREATE INDEX "tournament_reward_payment_userId_idx" ON "tournament_reward_payment"("userId");

ALTER TABLE "tournament_reward_payment" ADD CONSTRAINT "tournament_reward_payment_tournamentId_fkey"
    FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "tournament_reward_payment" ADD CONSTRAINT "tournament_reward_payment_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
