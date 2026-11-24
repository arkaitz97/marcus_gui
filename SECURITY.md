# Security policy

## Supported versions

This is a demo repository. Only the `main` branch receives fixes.

## Reporting a vulnerability

Do not open a public issue for a security problem. Use GitHub private
vulnerability reporting:

1. Go to the repository's **Security** tab.
2. Select **Advisories** and then **Report a vulnerability**.
3. Describe the issue, the affected view or store, and the steps to reproduce.

You can expect an acknowledgement within seven days. If the report is valid, the
fix and the advisory are published together.

## Scope notes

- The app has no authentication; the admin routes are open. Do not deploy it as a
  public admin panel without adding an auth layer in front of it.
- The API base URL is build-time configuration, not a secret.
- CI scans the history with gitleaks and runs lint, tests and a production build.
