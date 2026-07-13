-- CreateTable
CREATE TABLE "drive_folder_links" (
    "id" TEXT NOT NULL,
    "file_entry_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "drive_folder_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "drive_folder_links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "drive_folder_links_file_entry_id_user_id_key" ON "drive_folder_links"("file_entry_id", "user_id");

-- AddForeignKey
ALTER TABLE "drive_folder_links" ADD CONSTRAINT "drive_folder_links_file_entry_id_fkey" FOREIGN KEY ("file_entry_id") REFERENCES "file_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drive_folder_links" ADD CONSTRAINT "drive_folder_links_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Enable Row Level Security with no policies (default-deny), matching every
-- other table in the public schema (see the 20260711090257 migration).
ALTER TABLE "drive_folder_links" ENABLE ROW LEVEL SECURITY;
