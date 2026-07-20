# AI-assisted test authoring with Playwright MCP

This suite's `tests/transactions.spec.ts` was authored with **Playwright MCP** and the
built-in **Playwright Test Agents**, then reviewed and refined by hand. This doc explains what
that means, how it was done here, and how to reproduce it.

## What Playwright MCP is

[Playwright MCP](https://playwright.dev/docs/mcp/introduction) is a
[Model Context Protocol](https://modelcontextprotocol.io) server that exposes browser control
to an AI agent as a set of structured tools (`browser_navigate`, `browser_click`, `browser_type`,
`browser_snapshot`, …). The agent drives a real browser and reasons over the page's
**accessibility tree** rather than screenshots — so it's fast, deterministic, and cheap on tokens,
and needs no vision model.

It is a **dev-time authoring tool, not a runtime dependency.** Nothing here runs an MCP server in
CI: [`../.github/workflows/ci.yml`](../../.github/workflows/ci.yml) still runs plain
`playwright test`. MCP produced the committed artifacts (`specs/`, the page object, the spec);
those artifacts are the durable output.

## How it differs from a normal Playwright test

| | Regular Playwright test | Playwright MCP / Agents |
|---|---|---|
| Who drives the browser | Code you wrote, run by the test runner | An AI agent, live, tool-call by tool-call |
| Durable artifact | A committed `.spec.ts` | The `.spec.ts` **the agent authored** (+ a plan) |
| When it runs | CI and local `npx playwright test` | Dev-time authoring and self-healing |
| Element model | Locators you chose up front | The accessibility snapshot the agent explores |

## The three Test Agents

`npx playwright init-agents --loop=claude` scaffolds three agent definitions under
[`../.claude/agents/`](../.claude/agents) plus [`../.mcp.json`](../.mcp.json) (which registers the
`playwright-test` MCP server via `npx playwright run-test-mcp-server`):

- **Planner** — explores the running app through Playwright MCP and writes a human-readable
  markdown test plan into `specs/`.
- **Generator** — turns a plan into a runnable `.spec.ts`, executing each step live through MCP so
  it picks robust locators.
- **Healer** — runs a failing suite, diagnoses the failure through MCP, and repairs the test (or
  flags a real regression).

All three are regenerated with `init-agents` whenever Playwright is upgraded, so their tool lists
stay in sync with the installed version. Requires Playwright **≥ 1.56**.

## The seed

[`../tests/seed.spec.ts`](../tests/seed.spec.ts) is the environment bootstrap the agents run before
planning or generating. It deliberately imports this suite's custom fixtures
([`../fixtures/test.ts`](../fixtures/test.ts)) instead of the stock `@playwright/test`, so anything
the agents generate inherits **worker-scoped auth** and the **auto data-reset** — i.e. it starts
signed in with the five seeded transactions already present.

## What was done here

The `/transactions` page (search, account/type filters, sortable columns) had no coverage. The
loop was:

1. **Plan** — the planner navigated to `/transactions`, read the accessibility snapshot, exercised
   each control, and saved [`specs/transactions.md`](../specs/transactions.md).
2. **Generate** — the generator worked through that plan against the live app and produced
   [`tests/transactions.spec.ts`](../tests/transactions.spec.ts) plus the
   [`TransactionsPage`](../pages/TransactionsPage.ts) page object.
3. **Refine (human)** — the generated output was reshaped to match this repo's conventions:
   Page Object Model, the custom `test` fixture, `@smoke` tagging, seed constants pulled into
   [`helpers/testData.ts`](../helpers/testData.ts), and assertions on **row order by description**
   rather than the locale/timezone-dependent displayed date.

The result is 8 tests + the seed, all green in the full suite.

## Reproduce it

1. Open this repo in an MCP-capable client (Claude Code, VS Code + Copilot, Cursor). The client
   reads `.mcp.json` and starts the `playwright-test` server automatically.
2. Start the app: `docker compose up --build` (or `npm start --prefix ../app` with
   `ENABLE_TEST_ROUTES=true`).
3. Invoke an agent, e.g.:
   - Planner: *"Plan tests for the /transactions page. Use tests/seed.spec.ts as the seed."*
   - Generator: *"Generate Playwright tests from specs/transactions.md."*
   - Healer: *"Run the healer on the suite in tests/ and fix any failures."*

Regenerate the agent definitions after any Playwright upgrade:

```bash
cd e2e && npx playwright init-agents --loop=claude
```
