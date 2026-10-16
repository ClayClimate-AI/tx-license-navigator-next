-- CreateTable
CREATE TABLE "SavedSearch" (
    "id" SERIAL NOT NULL,
    "licenseType" TEXT NOT NULL,
    "county" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SavedSearch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SavedSearch_licenseType_county_key" ON "SavedSearch"("licenseType", "county");
