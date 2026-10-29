-- CreateTable
CREATE TABLE "govt_jobs" (
    "id" INTEGER NOT NULL,
    "job_id" TEXT NOT NULL,
    "api_status" TEXT,
    "api_status_code" INTEGER,
    "api_message_en" TEXT,
    "api_message_bn" TEXT,
    "job_title" TEXT NOT NULL,
    "job_title_bn" TEXT NOT NULL,
    "job_type" INTEGER,
    "vacancy" TEXT NOT NULL,
    "vacancy_not_specific" BOOLEAN NOT NULL,
    "gender" INTEGER,
    "min_age" INTEGER,
    "max_age" INTEGER,
    "application_site" TEXT NOT NULL,
    "job_source" TEXT,
    "advertisement_file" TEXT,
    "advertisement_no" TEXT,
    "advertisement_published_date" DATE,
    "published_date" TIMESTAMP(3) NOT NULL,
    "deadline_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "admit_card" BOOLEAN,
    "admit_card_upload" TEXT,
    "admit_card_text" TEXT,
    "download_url" TEXT,
    "download_start_date" TIMESTAMP(3),
    "download_end_date" TIMESTAMP(3),
    "is_result" BOOLEAN,
    "result_upload" TEXT,
    "is_notice" BOOLEAN,
    "notice_upload" TEXT,
    "notice_download_url" TEXT,
    "notice_text" TEXT,
    "view_count" INTEGER NOT NULL,
    "status" INTEGER,
    "circular_details" JSONB,
    "organization_id" INTEGER NOT NULL,

    CONSTRAINT "govt_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "govt_organizations" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "name_bn" TEXT,
    "short_name" TEXT NOT NULL,
    "logo" TEXT NOT NULL,
    "website" TEXT NOT NULL,
    "details" TEXT,

    CONSTRAINT "govt_organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "govt_job_packages" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "govt_job_packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "package_wise_govt_jobs" (
    "id" INTEGER NOT NULL,
    "job_id" INTEGER NOT NULL,
    "package_id" INTEGER NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,

    CONSTRAINT "package_wise_govt_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "govt_jobs_job_id_key" ON "govt_jobs"("job_id");

-- CreateIndex
CREATE INDEX "govt_jobs_job_id_idx" ON "govt_jobs"("job_id");

-- CreateIndex
CREATE INDEX "govt_jobs_organization_id_idx" ON "govt_jobs"("organization_id");

-- CreateIndex
CREATE INDEX "govt_jobs_published_date_idx" ON "govt_jobs"("published_date");

-- CreateIndex
CREATE INDEX "govt_jobs_deadline_date_idx" ON "govt_jobs"("deadline_date");

-- CreateIndex
CREATE INDEX "govt_jobs_created_at_idx" ON "govt_jobs"("created_at");

-- CreateIndex
CREATE INDEX "govt_jobs_status_idx" ON "govt_jobs"("status");

-- CreateIndex
CREATE INDEX "govt_organizations_short_name_idx" ON "govt_organizations"("short_name");

-- CreateIndex
CREATE INDEX "package_wise_govt_jobs_job_id_idx" ON "package_wise_govt_jobs"("job_id");

-- CreateIndex
CREATE INDEX "package_wise_govt_jobs_package_id_idx" ON "package_wise_govt_jobs"("package_id");

-- CreateIndex
CREATE UNIQUE INDEX "package_wise_govt_jobs_job_id_package_id_key" ON "package_wise_govt_jobs"("job_id", "package_id");

-- AddForeignKey
ALTER TABLE "govt_jobs" ADD CONSTRAINT "govt_jobs_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "govt_organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "package_wise_govt_jobs" ADD CONSTRAINT "package_wise_govt_jobs_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "govt_jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "package_wise_govt_jobs" ADD CONSTRAINT "package_wise_govt_jobs_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "govt_job_packages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
