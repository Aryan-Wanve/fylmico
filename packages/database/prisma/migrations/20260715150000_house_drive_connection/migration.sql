-- DropForeignKey
ALTER TABLE "drive_folder_links" DROP CONSTRAINT "drive_folder_links_file_entry_id_fkey";
ALTER TABLE "drive_folder_links" DROP CONSTRAINT "drive_folder_links_user_id_fkey";

-- DropTable
DROP TABLE "drive_folder_links";

-- AlterTable: DriveConnection flips from per-user to per-house. Existing
-- per-user connections have no valid mapping under the new model (a house's
-- Drive is now the Owner's, connected fresh) - truncated as a breaking
-- change, see ADR 0045.
TRUNCATE "drive_connections";

ALTER TABLE "drive_connections" DROP CONSTRAINT "drive_connections_user_id_fkey";
DROP INDEX "drive_connections_user_id_key";
ALTER TABLE "drive_connections" RENAME COLUMN "user_id" TO "connected_by_id";
ALTER TABLE "drive_connections" DROP COLUMN "drive_folder_id";
ALTER TABLE "drive_connections" ADD COLUMN "organization_id" TEXT NOT NULL;
ALTER TABLE "drive_connections" ADD COLUMN "visible_root_folder_id" TEXT NOT NULL;
ALTER TABLE "drive_connections" ADD COLUMN "sensitive_root_folder_id" TEXT NOT NULL;

CREATE UNIQUE INDEX "drive_connections_organization_id_key" ON "drive_connections"("organization_id");

ALTER TABLE "drive_connections" ADD CONSTRAINT "drive_connections_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "drive_connections" ADD CONSTRAINT "drive_connections_connected_by_id_fkey" FOREIGN KEY ("connected_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "file_entries" ADD COLUMN "drive_key" TEXT;
ALTER TABLE "file_entries" ADD COLUMN "sensitive" BOOLEAN NOT NULL DEFAULT false;

CREATE UNIQUE INDEX "file_entries_organization_id_drive_key_key" ON "file_entries"("organization_id", "drive_key");
