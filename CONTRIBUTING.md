# Contributing

## Before you open a pull request

1. Keep the change small: one view, one store or one fix at a time.
2. Add or update a Vitest case for any store behaviour change. Name the test after
   the behaviour, not the method.
3. Run the local gate:

   ```bash
   npm run lint
   npm test
   npm run build
   ```

4. Use a conventional commit subject (`feat:`, `fix:`, `test:`, `docs:`,
   `chore:`). Explain the reason in the body when the subject cannot carry it.

## Review expectations

- A store change without a test is not ready for review.
- Components stay thin: data loading, validation and pricing belong in a store or
  in `apiService`, not in a template.
- Do not hard-code the API URL outside `apiService`. Use `VITE_API_BASE_URL`.
- Do not commit `.env` files. CI runs gitleaks on the full history.

## Local setup

See the README. The app needs a running `marcus_api`; without it, the lists are
empty and the console shows failed requests.
