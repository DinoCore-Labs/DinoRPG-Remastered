-- CreateTable
CREATE TABLE "user_tag" (
    "id" SERIAL NOT NULL,
    "tag" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_tag_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_tag_userId_idx" ON "user_tag"("userId");

-- CreateIndex
CREATE INDEX "user_tag_tag_idx" ON "user_tag"("tag");

-- CreateIndex
CREATE UNIQUE INDEX "user_tag_tag_userId_key" ON "user_tag"("tag", "userId");

-- AddForeignKey
ALTER TABLE "user_tag" ADD CONSTRAINT "user_tag_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
