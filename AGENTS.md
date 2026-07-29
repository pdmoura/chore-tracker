## Git workflow

- Make atomic commits after each complete and verified unit of work.
- Each commit should have one clear purpose and leave the repository in a working state.
- Use Conventional Commit-style messages such as `feat(api):`, `feat(web):`, `test:`, `docs:`, and `chore:`.
- Run the relevant lint, type-check, test, or build commands before committing.
- Do not combine unrelated backend, frontend, documentation, and infrastructure changes in one commit.
- Do not amend, squash, reorder, or rewrite existing commits.
- Do not create, rename, switch, merge, or delete branches unless explicitly instructed by the user.
- Leave the working tree clean after completing an approved task.
- If verification fails, report the failure and fix it before committing whenever reasonably possible.