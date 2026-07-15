-- Ban list on the house.
ALTER TABLE "organizations" ADD COLUMN "banned_user_ids" TEXT[] NOT NULL DEFAULT '{}';

-- Modular permissions on each named Role, shared by everyone holding it.
ALTER TABLE "roles" ADD COLUMN "permissions" TEXT[] NOT NULL DEFAULT '{}';

-- Backfill existing roles with sensible starting permission sets.
UPDATE "roles" SET "permissions" = ARRAY[
  'view_projects','edit_projects','create_tasks','delete_tasks','view_files',
  'upload_files','delete_files','manage_crew','invite_members','remove_members',
  'manage_calendar','manage_bookings','manage_house_settings','manage_roles',
  'approve_members','manage_drive','manage_storyboards','manage_budget','manage_clients'
] WHERE "name" = 'Owner';

UPDATE "roles" SET "permissions" = ARRAY[
  'view_projects','edit_projects','create_tasks','delete_tasks','view_files',
  'upload_files','manage_calendar','manage_bookings','manage_clients'
] WHERE "name" = 'Producer';

UPDATE "roles" SET "permissions" = ARRAY[
  'view_projects','create_tasks','view_files','upload_files','manage_storyboards'
] WHERE "name" = 'Editor';

UPDATE "roles" SET "permissions" = ARRAY['view_projects', 'view_files']
  WHERE "name" NOT IN ('Owner', 'Producer', 'Editor');

-- Membership no longer requires a role at creation time - a pending member
-- has a membership row with role_id null until an admin assigns one.
ALTER TABLE "organization_memberships" ALTER COLUMN "role_id" DROP NOT NULL;
