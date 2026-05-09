-- CreateEnum
CREATE TYPE "OfferStatus" AS ENUM ('ONGOING', 'ENDED', 'CLAIMED');

-- CreateTable
CREATE TABLE "Offer" (
    "id" SERIAL NOT NULL,
    "sellerId" UUID,
    "sellerName" TEXT NOT NULL,
    "endDate" TIMESTAMPTZ(3) NOT NULL,
    "dinozId" INTEGER,
    "dinozDetails" TEXT,
    "total" INTEGER NOT NULL,
    "status" "OfferStatus" NOT NULL DEFAULT 'ONGOING',

    CONSTRAINT "Offer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OfferItem" (
    "id" SERIAL NOT NULL,
    "offerId" INTEGER NOT NULL,
    "itemId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "isIngredient" BOOLEAN NOT NULL,

    CONSTRAINT "OfferItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OfferBid" (
    "id" SERIAL NOT NULL,
    "offerId" INTEGER NOT NULL,
    "userId" UUID,
    "userName" TEXT NOT NULL,
    "value" INTEGER NOT NULL,

    CONSTRAINT "OfferBid_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Offer_status_endDate_idx" ON "Offer"("status", "endDate");

-- CreateIndex
CREATE INDEX "Offer_sellerId_idx" ON "Offer"("sellerId");

-- CreateIndex
CREATE INDEX "Offer_dinozId_idx" ON "Offer"("dinozId");

-- CreateIndex
CREATE INDEX "OfferItem_offerId_idx" ON "OfferItem"("offerId");

-- CreateIndex
CREATE INDEX "OfferBid_offerId_idx" ON "OfferBid"("offerId");

-- CreateIndex
CREATE INDEX "OfferBid_userId_idx" ON "OfferBid"("userId");

-- CreateIndex
CREATE INDEX "job_definition_enabled_nextRunAt_idx" ON "job_definition"("enabled", "nextRunAt");

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_dinozId_fkey" FOREIGN KEY ("dinozId") REFERENCES "Dinoz"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfferItem" ADD CONSTRAINT "OfferItem_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "Offer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfferBid" ADD CONSTRAINT "OfferBid_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "Offer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfferBid" ADD CONSTRAINT "OfferBid_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
