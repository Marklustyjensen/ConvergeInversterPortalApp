-- CreateTable
CREATE TABLE "Budget" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "propertyId" TEXT NOT NULL,
    "rentalIncome" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "otherIncome" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "insurance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "propertyTaxes" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "utilities" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "maintenance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "repairs" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "landscaping" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "management" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "marketing" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "legal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "accounting" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "otherExpenses" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "capexAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "capexDescription" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "Budget_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Budget_propertyId_year_month_idx" ON "Budget"("propertyId", "year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "Budget_propertyId_year_month_key" ON "Budget"("propertyId", "year", "month");

-- AddForeignKey
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
