# 0013: File Storage Architecture

Date: 2026-07-04

Status: Accepted

## Problem

Fylmico will manage large creative files, versions, previews, exports,
thumbnails, transcodes, and review artifacts. PostgreSQL cannot be the storage
location for large binaries, but metadata and permissions must remain strongly
consistent.

## Decision

Store binary files in object storage and store metadata, ownership, object keys,
versions, processing state, and permissions in PostgreSQL. The API authorizes
requests and issues short-lived signed upload/download URLs.

Media processing runs asynchronously once worker infrastructure exists.

## Alternatives

- Store files directly in PostgreSQL.
- Store files on local VPS disk.
- Let clients upload directly to public buckets.
- Use a third-party asset platform as the only source of truth.

## Tradeoffs

Benefits:

- Object storage scales better for large media.
- Database remains the source of truth for permissions and review state.
- Signed URLs avoid proxying every byte through the API.
- Versioned metadata supports review and approval workflows.

Costs:

- Requires object lifecycle and cleanup jobs.
- Requires careful signed URL expiration and access checks.
- Requires background processing for previews and transcodes.

## Future Implications

The exact storage provider remains a future decision. Object keys should include
environment and tenant scope, but bucket paths must not become public API
contracts. CDN integration can be added once access and cache rules are clear.
