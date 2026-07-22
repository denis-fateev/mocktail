# Privacy Policy

**Last updated:** 2026-07-21

Mocktail is a local developer tool. It does not operate a backend that receives your browsing or network data.

## What Mocktail does

When you **enable mocking on a tab**, the extension attaches to that tab using the Chrome Debugger API and may:

- Observe request URL, method, and related network metadata for matching and the Requests list
- Optionally store response bodies and headers (controlled by **Capture response bodies and headers** in Settings)
- Apply your mock rules (status, body, headers, delay) or modify outgoing request headers

When mocking is **disabled**, Mocktail does not intercept that tab’s network traffic.

## What is stored locally

Depending on your usage and settings, Mocktail may store in Chrome extension storage (on your device):

- Mock rules and rule sets
- App settings
- Which tabs have mocking enabled (session restore behavior)
- Captured request history shown in the Requests UI (subject to settings such as clearing on reload)

This data stays in your browser profile unless you export rule sets yourself (for example, copying JSON to another tool).

## What Mocktail does not do

- It does **not** upload intercepted requests, responses, or rule contents to Mocktail servers (there are none in this project)
- It does **not** use analytics or advertising SDKs in the extension code shipped from this repository
- It does **not** sell personal data

## Sensitive environments

Mocking can expose or rewrite traffic on the tab where it is enabled. For maximum safety, avoid using Mocktail on production accounts or pages that handle real secrets, payments, or personal data you are not prepared to see in a local log.

## Permissions (summary)

| Permission  | Purpose                                                            |
| ----------- | ------------------------------------------------------------------ |
| `debugger`  | Attach to a tab and intercept/fulfill or continue requests via CDP |
| `sidePanel` | Host the primary UI                                                |
| `storage`   | Persist rules, settings, and related local state                   |
| `tabs`      | Know which tab is active for per-tab enablement and the side panel |

## Contact

For privacy questions, open a GitHub issue or use the contact email on the extension About page.
