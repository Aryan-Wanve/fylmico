-- AlterTable
ALTER TABLE "organizations" ADD COLUMN "type" TEXT NOT NULL DEFAULT 'custom';
ALTER TABLE "organizations" ADD COLUMN "enabled_modules" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- Backfill existing houses with every module enabled, so none silently
-- lose a nav item they already used before this concept existed.
UPDATE "organizations" SET "enabled_modules" = ARRAY[
  'home','projects','calendar','tasks','crews','files','storyboard',
  'scripts','messages','bookings','call-sheets','announcements',
  'analytics','settings'
];
