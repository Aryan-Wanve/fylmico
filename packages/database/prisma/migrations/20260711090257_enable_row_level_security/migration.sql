-- Enable Row Level Security with no policies (default-deny) on every
-- table in the public schema. This app never uses Supabase's own
-- PostgREST/auto-REST layer or its anon/authenticated API keys - the
-- backend connects directly via Prisma as the table-owning Postgres
-- role, which bypasses RLS regardless of whether it's enabled. This
-- migration exists purely to close the PostgREST exposure path Supabase
-- flags by default for any public-schema table, in case that layer is
-- ever reachable with the project's anon key.
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "organizations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "roles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "organization_memberships" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "auth_accounts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sessions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "email_verification_tokens" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "password_reset_tokens" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tasks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "conversations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "messages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "projects" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "clients" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "project_clients" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "notifications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "comments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "crew_profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "calendar_events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "time_entries" ENABLE ROW LEVEL SECURITY;

-- Prisma's own migration-history table also lives in the public schema
-- and gets the same PostgREST exposure warning.
ALTER TABLE "_prisma_migrations" ENABLE ROW LEVEL SECURITY;
