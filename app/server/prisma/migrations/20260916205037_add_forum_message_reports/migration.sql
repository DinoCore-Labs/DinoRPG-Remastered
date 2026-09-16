-- AlterTable
ALTER TABLE "Report" ADD COLUMN     "reportedForumAuthorId" UUID,
ADD COLUMN     "reportedForumAuthorName" TEXT,
ADD COLUMN     "reportedForumContent" TEXT,
ADD COLUMN     "reportedForumMessageId" INTEGER,
ADD COLUMN     "reportedForumTopicId" INTEGER,
ADD COLUMN     "reportedForumTopicTitle" TEXT;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_reportedForumMessageId_fkey" FOREIGN KEY ("reportedForumMessageId") REFERENCES "forum_message"("id") ON DELETE SET NULL ON UPDATE CASCADE;
