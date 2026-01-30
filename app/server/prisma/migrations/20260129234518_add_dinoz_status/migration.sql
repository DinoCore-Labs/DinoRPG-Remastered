-- CreateTable
CREATE TABLE "dinoz_status" (
    "id" SERIAL NOT NULL,
    "statusId" INTEGER NOT NULL,
    "dinozId" INTEGER,

    CONSTRAINT "dinoz_status_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "dinoz_status_dinozId_idx" ON "dinoz_status"("dinozId");

-- CreateIndex
CREATE UNIQUE INDEX "dinoz_status_statusId_dinozId_key" ON "dinoz_status"("statusId", "dinozId");

-- AddForeignKey
ALTER TABLE "dinoz_status" ADD CONSTRAINT "dinoz_status_dinozId_fkey" FOREIGN KEY ("dinozId") REFERENCES "Dinoz"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
