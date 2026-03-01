-- CreateTable
CREATE TABLE "DinozCatch" (
    "id" SERIAL NOT NULL,
    "dinozId" INTEGER NOT NULL,
    "hp" INTEGER NOT NULL,
    "monsterId" TEXT NOT NULL,

    CONSTRAINT "DinozCatch_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DinozCatch" ADD CONSTRAINT "DinozCatch_dinozId_fkey" FOREIGN KEY ("dinozId") REFERENCES "Dinoz"("id") ON DELETE CASCADE ON UPDATE CASCADE;
