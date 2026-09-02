-- CreateTable
CREATE TABLE "roadmap" (
    "position" INTEGER NOT NULL,
    "titleFr" VARCHAR NOT NULL,
    "titleEn" VARCHAR NOT NULL,
    "titleEs" VARCHAR NOT NULL,
    "titleDe" VARCHAR NOT NULL,

    CONSTRAINT "roadmap_pkey" PRIMARY KEY ("position")
);

-- CreateTable
CREATE TABLE "roadmap_item" (
    "id" SERIAL NOT NULL,
    "roadmapPosition" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "icon" VARCHAR,
    "textFr" TEXT NOT NULL,
    "textEn" TEXT NOT NULL,
    "textEs" TEXT NOT NULL,
    "textDe" TEXT NOT NULL,

    CONSTRAINT "roadmap_item_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "roadmap_item_roadmapPosition_idx" ON "roadmap_item"("roadmapPosition");

-- CreateIndex
CREATE UNIQUE INDEX "roadmap_item_roadmapPosition_position_key" ON "roadmap_item"("roadmapPosition", "position");

-- AddForeignKey
ALTER TABLE "roadmap_item" ADD CONSTRAINT "roadmap_item_roadmapPosition_fkey" FOREIGN KEY ("roadmapPosition") REFERENCES "roadmap"("position") ON DELETE CASCADE ON UPDATE CASCADE;
