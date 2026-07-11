-- CreateTable
CREATE TABLE "crew_profiles" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "job_title" TEXT NOT NULL,
    "department" TEXT NOT NULL DEFAULT 'Production',
    "role_category" TEXT NOT NULL DEFAULT 'Other',
    "status" TEXT NOT NULL DEFAULT 'available',
    "current_project" TEXT,
    "project_stage" TEXT,
    "availability" TEXT,
    "birthday" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crew_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "crew_profiles_organization_id_idx" ON "crew_profiles"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "crew_profiles_organization_id_user_id_key" ON "crew_profiles"("organization_id", "user_id");

-- AddForeignKey
ALTER TABLE "crew_profiles" ADD CONSTRAINT "crew_profiles_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crew_profiles" ADD CONSTRAINT "crew_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
