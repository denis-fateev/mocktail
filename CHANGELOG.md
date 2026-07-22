# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-07-21

### Added

- Manifest V3 Chrome extension with side panel UI
- Per-tab mocking via Chrome Debugger / CDP Fetch interception
- Mock rules for response fulfillment (status, body, headers, delay)
- Request modification rules (outgoing headers + optional delay)
- URL match types: equals, contains, starts with, ends with; HTTP method including `ANY`
- Named rule sets with create / rename / delete / switch
- Import and export of rule sets as versioned JSON, plus AI import prompt helper
- Requests page with intercepted traffic and create-rule-from-request flow
- Settings: smart CORS response headers, capture bodies/headers, clear history on reload, Fetch/XHR-only, newest-first ordering
- About page with product FAQ and third-party license notices
- Local persistence for rules and settings via `chrome.storage`
