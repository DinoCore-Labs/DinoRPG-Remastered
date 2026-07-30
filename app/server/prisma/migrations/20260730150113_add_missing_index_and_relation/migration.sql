-- CreateIndex
CREATE INDEX "Report_reporterId_idx" ON "Report"("reporterId");

-- CreateIndex
CREATE INDEX "Report_reportedUserId_idx" ON "Report"("reportedUserId");

-- CreateIndex
CREATE INDEX "Report_reportedDinozId_idx" ON "Report"("reportedDinozId");

-- CreateIndex
CREATE INDEX "Report_reportedClanId_idx" ON "Report"("reportedClanId");

-- CreateIndex
CREATE INDEX "Report_status_idx" ON "Report"("status");
