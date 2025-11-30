-- CreateEnum
CREATE TYPE "MoneyType" AS ENUM ('GOLD');

-- CreateTable
CREATE TABLE "Wallet" (
    "id" TEXT NOT NULL,
    "type" "MoneyType" NOT NULL,
    "amount" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_userId_type_key" ON "Wallet"("userId", "type");

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
