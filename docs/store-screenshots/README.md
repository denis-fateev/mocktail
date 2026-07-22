# Store & GitHub screenshots

Promotional images sized for the **Chrome Web Store** (`1280×800`) and README.

## Files

| File                        | Use                                 |
| --------------------------- | ----------------------------------- |
| `png/slide-01-hero.png`     | Store #1 / README hero            |
| `png/slide-02-response.png` | Store #2 — response mocks / Rules |
| `png/slide-03-requests.png` | Store #3 — capture → mock         |
| `png/slide-04-headers.png`  | Store #4 — request headers        |
| `png/slide-05-privacy.png`  | Store #5 — open source & privacy  |

## Chrome Web Store

Upload up to **5** screenshots. Dimensions are already `1280×800` PNG.

## Regenerate

Requires Playwright Chromium once:

```bash
npx playwright install chromium
npm run screenshots
```

Edit copy/layout in `promo-slides.html`, then re-run the capture script.
