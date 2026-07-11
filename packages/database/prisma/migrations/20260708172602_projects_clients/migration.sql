-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contact_name" TEXT,
    "contact_email" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_clients" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_clients_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "projects_organization_id_idx" ON "projects"("organization_id");

-- CreateIndex
CREATE INDEX "clients_organization_id_idx" ON "clients"("organization_id");

-- CreateIndex
CREATE INDEX "project_clients_project_id_idx" ON "project_clients"("project_id");

-- CreateIndex
CREATE INDEX "project_clients_client_id_idx" ON "project_clients"("client_id");

-- CreateIndex
CREATE UNIQUE INDEX "project_clients_project_id_client_id_key" ON "project_clients"("project_id", "client_id");

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_clients" ADD CONSTRAINT "project_clients_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_clients" ADD CONSTRAINT "project_clients_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
