# Fylmico Project Specification

Version: 1.0

## Project

Name: Fylmico

Working tagline: **The Operating System for Creative Production**

Mission: Build the world's most complete collaboration platform for filmmakers,
production houses, editors, photographers, agencies, creative teams, and social
media management companies.

The goal is to replace dozens of disconnected tools with one seamless platform.
Everything from client onboarding to final delivery should happen inside
Fylmico.

## Product Philosophy

Fylmico is not another productivity app.

It is not another Notion clone.

It is not another Discord clone.

It is not another Trello clone.

It is not another Frame.io clone.

It combines the best parts of all of them into one unified experience designed
specifically for creative production.

Every feature should feel like it belongs inside one ecosystem.

Everything should connect naturally.

## Long Term Vision

One workspace.

Every production.

Every team.

Every creative workflow.

From the first client meeting to the final exported video.

## Target Users

- Freelancers
- Videographers
- Editors
- Photographers
- Creative agencies
- Marketing teams
- Social media management companies
- Production houses
- Film studios
- Students
- Content creators
- Creative teams

## Core Modules

- Authentication
- Organizations
- Teams
- Projects
- Clients
- Departments
- Permissions
- Chat
- Voice channels
- Video meetings
- Announcements
- Notifications
- Tasks
- Kanban
- Calendar
- Timeline
- Scheduling
- Storyboards
- Moodboards
- Scripts
- Shot lists
- Call sheets
- Equipment
- Crew
- Locations
- Budgets
- Invoices
- Contracts
- Assets
- Cloud storage
- Video review
- Comments
- Approvals
- Version control
- Publishing
- Analytics
- Dashboards
- Global search
- Templates
- AI assistant
- Administration
- Settings
- Audit logs
- Activity feed

## Design Principles

- Premium
- Modern
- Minimal
- Elegant
- Fast
- Responsive
- Smooth
- Professional
- Dark mode first
- No visual clutter
- Intentional whitespace
- Subtle animations
- Expensive-feeling interface quality
- No template UI
- No childish gradients

## UI Inspiration

- Apple
- Linear
- Notion
- Figma
- Discord
- Spotify
- Frame.io

## Tech Stack

Frontend:

- Next.js
- React
- TypeScript
- TailwindCSS
- shadcn/ui
- Framer Motion

Backend:

- Node.js
- NestJS

Database:

- PostgreSQL
- Prisma ORM

Realtime:

- Socket.IO

Authentication:

- JWT
- OAuth
- Email authentication

Infrastructure:

- Docker
- Nginx
- Hostinger VPS
- GitHub

## Target Architecture

```text
apps/
  web/
  api/
packages/
  ui/
  auth/
  database/
  shared/
  realtime/
  calendar/
  storyboard/
  editor/
  ai/
  notifications/
  search/
  permissions/
docs/
  architecture.md
  database.md
  api.md
  deployment.md
  coding-standards.md
  roadmap.md
  progress.md
  context.md
  features.md
  changelog.md
  decisions.md
  tech-stack.md
  glossary.md
  session.md
  adr/
MASTER_INDEX.md
AI_RULES.md
PRODUCT_PRINCIPLES.md
README.md
```

## Architecture Decision Records

Every major architectural decision must create an ADR.

ADR filename format:

- `0001-authentication.md`
- `0002-database.md`
- `0003-chat.md`
- `0004-permissions.md`

Every ADR must include:

- Problem
- Decision
- Alternatives
- Tradeoffs
- Future implications

## Documentation Policy

Documentation is not optional.

Documentation is part of the code.

Every completed task updates documentation.

Documentation should always match the current codebase.

## Required Project Memory Files

`docs/context.md` is the permanent memory of the project. Another AI should
understand the project after reading only this file.

`docs/progress.md` must be updated after every coding session.

`docs/roadmap.md` must maintain current milestone, future milestones, completed
milestones, backlog, priority, and estimated completion.

`docs/features.md` must track every feature with status, priority,
dependencies, description, and implementation notes.

`docs/changelog.md` must track every meaningful change with version, date,
summary, breaking changes, and migration notes.

`docs/coding-standards.md` must define naming, folder conventions, import
conventions, component rules, state management, API rules, error handling,
testing rules, performance guidelines, accessibility rules, and animation rules.

`docs/database.md` must document every table, relationship, index, constraint,
migration history, and design reason.

`docs/api.md` must document every endpoint, request, response, permission,
authentication rule, and example.

## AI Development Rules

Act as CTO.

Never rush implementation.

Never skip planning.

Before writing code, explain:

- Architecture
- Reasoning
- Affected files
- Database impact
- API impact

Then implement.

## Implementation Rules

- Never rewrite unrelated files.
- Never create duplicate code.
- Never introduce technical debt.
- Never create placeholder implementations.
- Always build production-ready code.
- Always write reusable components.
- Always use strong typing.
- Always keep code modular.
- Always keep files small.
- Always optimize for maintainability.

## Quality Standard

Every pull request should feel like it came from senior engineers.

No shortcuts. No hacks. No unnecessary abstractions.

Readable. Elegant. Scalable. Production ready.

## Git Workflow

Use feature branches.

Never work directly on `main`.

Branch naming:

- `feature/authentication`
- `feature/chat`
- `feature/storyboard`
- `feature/calendar`
- `feature/permissions`
- `feature/dashboard`

Merge only after validation.

## Context Retention

Assume conversations can end at any time.

Never rely on chat history.

The repository must always contain enough documentation for another AI to
continue immediately.

Before every implementation, read:

- `README.md`
- `docs/context.md`
- `docs/progress.md`
- `docs/roadmap.md`
- `docs/decisions.md`
- Latest ADRs

## First Objective

Do not build features immediately.

Phase 1:

- Design the complete architecture.
- Design folder structure.
- Design database.
- Design permissions.
- Design authentication.
- Design deployment.
- Design coding standards.
- Create documentation.
- Create roadmap.
- Create ADR system.
- Create project memory files.

Only after the foundation is complete should implementation begin.

## Final Rule

Imagine Fylmico will eventually have millions of users and hundreds of engineers
working on it.

Every architectural decision should support that future.

Build as if this company will exist for the next 20 years.

Never optimize for speed of development over long-term quality.

Every line of code should move Fylmico closer to becoming the industry standard
platform for creative production.
