# SER Guidelines & Automated Workflows

## Git Commit Policy
- Always stage and commit all modified or newly created files after completing a code change or task.
- Provide clear and descriptive git commit messages explaining what was changed.

## Cloudflare Wrangler Deployment & Secrets
- **Worker & Client Deployments**: Whenever changes are made to the worker (`SER/worker`) or client (`SER/client`), deploy them using their respective Wrangler scripts/commands (`npx wrangler deploy`) wherever necessary after committing.
- **Secrets Management**: Update/upload any necessary secrets via `npx wrangler secret put <KEY>` for the worker environment.
