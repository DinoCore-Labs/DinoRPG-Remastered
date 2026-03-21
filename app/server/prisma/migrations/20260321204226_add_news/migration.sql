-- CreateEnum
CREATE TYPE "NewsType" AS ENUM ('update', 'information', 'war', 'war_mana', 'championship', 'tid_start', 'tid_end', 'event_christmas', 'story', 'announce');

-- CreateTable
CREATE TABLE "news" (
    "id" SERIAL NOT NULL,
    "slug" VARCHAR NOT NULL,
    "type" "NewsType" NOT NULL DEFAULT 'update',
    "image" BYTEA,
    "imageMimeType" VARCHAR,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "news_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news_translations" (
    "id" SERIAL NOT NULL,
    "newsId" INTEGER NOT NULL,
    "lang" "Language" NOT NULL,
    "title" VARCHAR NOT NULL,
    "excerpt" VARCHAR,
    "content" VARCHAR NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "news_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "polls" (
    "id" SERIAL NOT NULL,
    "newsId" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "endAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "polls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "poll_options" (
    "id" SERIAL NOT NULL,
    "pollId" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "poll_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "poll_option_translations" (
    "id" SERIAL NOT NULL,
    "pollOptionId" INTEGER NOT NULL,
    "lang" "Language" NOT NULL,
    "label" VARCHAR NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "poll_option_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "poll_votes" (
    "id" SERIAL NOT NULL,
    "pollId" INTEGER NOT NULL,
    "pollOptionId" INTEGER NOT NULL,
    "userId" UUID NOT NULL,
    "votedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "poll_votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news_likes" (
    "newsId" INTEGER NOT NULL,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "news_likes_pkey" PRIMARY KEY ("newsId","userId")
);

-- CreateIndex
CREATE UNIQUE INDEX "news_slug_key" ON "news"("slug");

-- CreateIndex
CREATE INDEX "news_type_idx" ON "news"("type");

-- CreateIndex
CREATE INDEX "news_isPublished_publishedAt_idx" ON "news"("isPublished", "publishedAt");

-- CreateIndex
CREATE INDEX "news_createdAt_idx" ON "news"("createdAt");

-- CreateIndex
CREATE INDEX "news_translations_lang_idx" ON "news_translations"("lang");

-- CreateIndex
CREATE UNIQUE INDEX "news_translations_newsId_lang_key" ON "news_translations"("newsId", "lang");

-- CreateIndex
CREATE UNIQUE INDEX "polls_newsId_key" ON "polls"("newsId");

-- CreateIndex
CREATE INDEX "polls_isActive_endAt_idx" ON "polls"("isActive", "endAt");

-- CreateIndex
CREATE INDEX "poll_options_pollId_idx" ON "poll_options"("pollId");

-- CreateIndex
CREATE UNIQUE INDEX "poll_options_pollId_sortOrder_key" ON "poll_options"("pollId", "sortOrder");

-- CreateIndex
CREATE INDEX "poll_option_translations_lang_idx" ON "poll_option_translations"("lang");

-- CreateIndex
CREATE UNIQUE INDEX "poll_option_translations_pollOptionId_lang_key" ON "poll_option_translations"("pollOptionId", "lang");

-- CreateIndex
CREATE INDEX "poll_votes_pollId_idx" ON "poll_votes"("pollId");

-- CreateIndex
CREATE INDEX "poll_votes_pollOptionId_idx" ON "poll_votes"("pollOptionId");

-- CreateIndex
CREATE INDEX "poll_votes_userId_idx" ON "poll_votes"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "poll_votes_pollId_userId_key" ON "poll_votes"("pollId", "userId");

-- CreateIndex
CREATE INDEX "news_likes_userId_idx" ON "news_likes"("userId");

-- AddForeignKey
ALTER TABLE "news_translations" ADD CONSTRAINT "news_translations_newsId_fkey" FOREIGN KEY ("newsId") REFERENCES "news"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "polls" ADD CONSTRAINT "polls_newsId_fkey" FOREIGN KEY ("newsId") REFERENCES "news"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "poll_options" ADD CONSTRAINT "poll_options_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "polls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "poll_option_translations" ADD CONSTRAINT "poll_option_translations_pollOptionId_fkey" FOREIGN KEY ("pollOptionId") REFERENCES "poll_options"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "poll_votes" ADD CONSTRAINT "poll_votes_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "polls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "poll_votes" ADD CONSTRAINT "poll_votes_pollOptionId_fkey" FOREIGN KEY ("pollOptionId") REFERENCES "poll_options"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "poll_votes" ADD CONSTRAINT "poll_votes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news_likes" ADD CONSTRAINT "news_likes_newsId_fkey" FOREIGN KEY ("newsId") REFERENCES "news"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news_likes" ADD CONSTRAINT "news_likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
