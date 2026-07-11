-- CreateTable
CREATE TABLE "boards" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "project_id" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "boards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shots" (
    "id" TEXT NOT NULL,
    "board_id" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT NOT NULL,
    "camera_angle" TEXT,
    "notes" TEXT,
    "image_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "boards_organization_id_idx" ON "boards"("organization_id");

-- CreateIndex
CREATE INDEX "boards_project_id_idx" ON "boards"("project_id");

-- CreateIndex
CREATE INDEX "shots_board_id_idx" ON "shots"("board_id");

-- AddForeignKey
ALTER TABLE "boards" ADD CONSTRAINT "boards_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boards" ADD CONSTRAINT "boards_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shots" ADD CONSTRAINT "shots_board_id_fkey" FOREIGN KEY ("board_id") REFERENCES "boards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Enable Row Level Security with no policies (default-deny), matching every
-- other table in the public schema (see the 20260711090257 migration) - the
-- backend connects directly via Prisma as the table-owning Postgres role,
-- which bypasses RLS regardless of whether it's enabled.
ALTER TABLE "boards" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "shots" ENABLE ROW LEVEL SECURITY;
