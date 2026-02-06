-- CreateTable
CREATE TABLE "dinoz_item" (
    "id" SERIAL NOT NULL,
    "itemId" INTEGER NOT NULL,
    "dinozId" INTEGER,

    CONSTRAINT "dinoz_item_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "dinoz_item_dinozId_idx" ON "dinoz_item"("dinozId");

-- AddForeignKey
ALTER TABLE "dinoz_item" ADD CONSTRAINT "dinoz_item_dinozId_fkey" FOREIGN KEY ("dinozId") REFERENCES "Dinoz"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
