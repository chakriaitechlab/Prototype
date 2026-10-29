
-- AlterTable
ALTER TABLE "companies" ADD COLUMN     "about" TEXT,
ADD COLUMN     "address" TEXT,
ADD COLUMN     "banner_position" INTEGER NOT NULL DEFAULT 50,
ADD COLUMN     "banner_url" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "founded_on" DATE,
ADD COLUMN     "industry" TEXT,
ADD COLUMN     "lat" DOUBLE PRECISION,
ADD COLUMN     "lng" DOUBLE PRECISION,
ADD COLUMN     "map_location" TEXT,
ADD COLUMN     "organization_type" TEXT,
ADD COLUMN     "rl_no" TEXT,
ADD COLUMN     "social_links" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "team_size" TEXT,
ADD COLUMN     "trade_license" TEXT,
ADD COLUMN     "vision" TEXT,
ADD COLUMN     "website" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "companies_trade_license_key" ON "companies"("trade_license");

