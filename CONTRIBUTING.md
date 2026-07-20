# Contributing

Thanks for your interest! This is a personal QA-automation portfolio project, so
it is not looking for large feature contributions — but bug reports, test-quality
suggestions, and small improvements are very welcome.

## Getting set up

```bash
# Run the app
docker compose up --build          # http://localhost:3000

# Run the test suite
cd e2e
npm install
npx playwright install chromium
npm test
```

See the [README](./README.md) for the full layout and the techniques on display.

## Guidelines

- Keep changes small and focused; one logical change per pull request.
- Match the existing style — the code is plain, dependency-light, and uses the
  Page Object Model for tests.
- Make sure `npm test` passes locally before opening a PR.
- Prefer user-facing Playwright locators (`getByRole`, `getByLabel`,
  `getByTestId`) over CSS/XPath selectors.

## Reporting bugs

Open an issue with steps to reproduce, what you expected, and what happened.
For anything security-related, see [SECURITY.md](./SECURITY.md).
