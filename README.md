# FinBank — QA Automation Portfolio

A small but complete demonstration of modern test-automation practice: a Dockerized
financial web app, a Playwright/TypeScript suite built on the Page Object Model with
service mocking and API tests, and a GitHub Actions pipeline that uses smoke tests
as a deployment gate before running the full regression suite.

```
┌─────────────────────┐     docker compose up --wait      ┌──────────────────────┐
│  GitHub Actions CI  │ ────────────────────────────────▶ │  FinBank (container)  │
│                     │                                   │  Express + static UI  │
│  1. smoke  @smoke   │ ◀──────────────────────────────── │  per-session sandbox  │
│  2. full regression │        Playwright (UI + API)      └──────────────────────┘
└─────────────────────┘
```

## The app under test

`app/` is a deliberately simple online-banking demo (Node/Express, no build step):

- **Login** — token-based auth (`demo` / `demo123`)
- **Dashboard** — accounts, recent transactions, and an FX-rates widget backed by a
  simulated third-party provider (slow on purpose, so mocking it matters)
- **Transfer** — move funds between accounts with server-side validation
  (insufficient funds, invalid amounts, same-account transfers)

Two design choices exist purely to make the app a good test target:

- **Per-session data sandboxes** — every login token gets its own copy of the seed
  data, so parallel test workers can mutate state without racing each other.
- **`POST /api/test/reset`** — resets the calling session's sandbox; only mounted
  when `ENABLE_TEST_ROUTES=true` (set in `docker-compose.yml`, never in production).

### Run it

```bash
docker compose up --build          # http://localhost:3000
```

## The test suite (`e2e/`)

21 tests across UI, network-mocking, and API layers. Techniques on display:

| Technique | Where |
|---|---|
| Page Object Model with a shared base page | `pages/` |
| Custom fixtures wiring page objects into tests | `fixtures/test.ts` |
| Worker-scoped auth: one API login per worker, reused via `storageState` | `fixtures/test.ts` (`workerAuth`) |
| Auto fixture resetting test data before every test | `fixtures/test.ts` (`resetData`) |
| Third-party service mocking (`page.route`): happy path, 503, network failure | `tests/rates-mock.spec.ts` |
| API testing with an authenticated `APIRequestContext` | `tests/api/transfers-api.spec.ts` |
| Parameterized validation tests | `tests/api/transfers-api.spec.ts` |
| Test tagging (`@smoke`) for suite slicing | all specs |
| User-facing locators (`getByRole`, `getByLabel`, `getByTestId`) and web-first assertions | everywhere |
| Fully parallel execution, trace/screenshot on failure, retries in CI | `playwright.config.ts` |

### Run the tests

```bash
cd e2e
npm install
npx playwright install chromium

npm test              # full suite (boots the app automatically)
npm run test:smoke    # @smoke subset only
npm run test:ui       # Playwright UI mode
npm run report        # open the last HTML report
```

Locally, Playwright starts the app via its `webServer` config. To test against the
Docker container instead (what CI does):

```bash
docker compose up --build --detach --wait
cd e2e && BASE_URL=http://localhost:3000 CI=true npx playwright test
```

## CI (`.github/workflows/ci.yml`)

Every push/PR to `main` runs a single pipeline that mirrors a real deployment flow:

1. **Build & deploy** — `docker compose up --build --wait` (the compose healthcheck
   gates on `/health`, so tests never start against a half-booted app)
2. **Smoke tests as a deployment gate** — `--grep @smoke`; a failure stops the
   pipeline before the expensive regression run
3. **Full regression** — `--grep-invert @smoke`
4. **Artifacts** — HTML reports for both stages are uploaded on success *and*
   failure; app container logs are dumped when anything fails

## Project layout

```
portfolio/
├── app/                        # System under test (Dockerized Express app)
│   ├── Dockerfile              # node:20-alpine, non-root, HEALTHCHECK
│   ├── server.js               # API + static hosting, per-session sandboxes
│   ├── data/seed.js            # Seed accounts/transactions/rates
│   └── public/                 # Login, dashboard, transfer UI
├── e2e/                        # Playwright test suite (TypeScript)
│   ├── playwright.config.ts
│   ├── fixtures/test.ts        # Worker auth, API client, auto-reset, page objects
│   ├── pages/                  # BasePage, LoginPage, DashboardPage, TransferPage
│   ├── mocks/rates.ts          # Canned FX-provider responses
│   ├── helpers/testData.ts     # Seed constants + currency formatter
│   └── tests/
│       ├── login.spec.ts
│       ├── dashboard.spec.ts
│       ├── transfer.spec.ts
│       ├── rates-mock.spec.ts  # Network-level service mocking
│       └── api/transfers-api.spec.ts
├── docker-compose.yml
└── .github/workflows/ci.yml   # Smoke gate → full regression → report artifacts
```
