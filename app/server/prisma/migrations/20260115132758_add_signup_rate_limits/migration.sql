-- CreateTable
CREATE TABLE "SignupDeviceMonthCounter" (
    "id" SERIAL NOT NULL,
    "monthKey" TEXT NOT NULL,
    "deviceToken" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SignupDeviceMonthCounter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SignupIpMonthCounter" (
    "id" SERIAL NOT NULL,
    "monthKey" TEXT NOT NULL,
    "ipToken" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SignupIpMonthCounter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SignupDeviceMonthCounter_monthKey_idx" ON "SignupDeviceMonthCounter"("monthKey");

-- CreateIndex
CREATE INDEX "SignupDeviceMonthCounter_expiresAt_idx" ON "SignupDeviceMonthCounter"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "SignupDeviceMonthCounter_monthKey_deviceToken_key" ON "SignupDeviceMonthCounter"("monthKey", "deviceToken");

-- CreateIndex
CREATE INDEX "SignupIpMonthCounter_monthKey_idx" ON "SignupIpMonthCounter"("monthKey");

-- CreateIndex
CREATE INDEX "SignupIpMonthCounter_expiresAt_idx" ON "SignupIpMonthCounter"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "SignupIpMonthCounter_monthKey_ipToken_key" ON "SignupIpMonthCounter"("monthKey", "ipToken");
