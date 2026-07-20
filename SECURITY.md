# Security Policy

## About this project

FinBank is a **demonstration application** built solely as a target for the
Playwright test suite in this repository. It is **not** intended for production
use. It ships with well-known demo credentials (`demo` / `demo123`), stores data
in memory only, and exposes a test-only reset route when `ENABLE_TEST_ROUTES` is
set. None of this is a vulnerability — it is by design for a test sandbox.

## Reporting a vulnerability

If you find a security issue in the tooling or example code that you believe is
worth addressing, please open a
[GitHub Security Advisory](https://github.com/1mjcf/playwright-portfolio/security/advisories/new)
or a regular issue. Because this is a personal portfolio project, there is no
formal SLA, but reports are welcome and appreciated.

Please do **not** report the intentional demo behaviours listed above.
