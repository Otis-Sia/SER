# SER Guidelines & Automated Workflows

## Git Commit Policy
- Always stage and commit all modified or newly created files after completing a code change or task.
- Provide clear and descriptive git commit messages explaining what was changed.

## Cloudflare Wrangler Policy
- **On-Demand Deployment**: Deploy the worker (`SER/worker`) or client (`SER/client`) using Wrangler only when explicitly requested by the user.
- **Secrets Management**: Update/upload any necessary secrets via `npx wrangler secret put <KEY>` for the worker environment.
