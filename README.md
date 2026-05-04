# GitHub PR Kanban

<img width="1345" height="821" alt="image" src="https://github.com/user-attachments/assets/9ddd2209-1aaa-4741-9b18-31f0678a0353" />

A Chrome extension that turns GitHub's repository pull request list into a kanban board.

PRs are auto-classified into three columns based on their review and CI status:

- **Needs Review** — anything that isn't approved yet (drafts, awaiting review, changes requested).
- **Approved** — approved by reviewers but CI is still running or failing.
- **Ready for Merge** — approved and CI passing.

## Install (development)

```bash
npm install
npm run build
```

Then in Chrome:

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked** and select the `dist/` folder.

Open any GitHub repository's PR list page (`https://github.com/<org>/<repo>/pulls`). A floating **Kanban view** button appears at the top-right of the page — click it to swap GitHub's table for the kanban.

## Use

- **Toggle:** the floating button in the top-right of the page switches between table and kanban. State is remembered per repository.
- **Filters:** the top bar of the kanban filters by title/author text, by author, and by label.
- **New Pull Request:** opens GitHub's compare page for the current repository.
- **Refresh:** the kanban auto-refreshes on a configurable interval and whenever GitHub updates the PR rows in the DOM.

## Development

```bash
npm run dev      # Vite dev server with HMR (load dist/ into Chrome)
npm run build    # production build into dist/
npm test         # run unit tests
```

The dev server requires CORS for the extension origin — already configured in `vite.config.ts`. Note that the MAIN-world content script (`src/main-world/hook.ts`) does not support HMR; reload the extension after editing it.

## How it works

The extension scrapes signals directly from each PR list row rather than calling the GitHub API:

- **Review status** comes from the merge-status link (`a[href*="#partial-pull-merging"]`) — its `aria-label` and visible text distinguish *Approved*, *Review required*, and *Changes requested*.
- **CI status** comes from the `<details class="commit-build-statuses">` element's nested octicon — `octicon-check` (passing), `octicon-x` (failing), `octicon-dot-fill` (running).
- **Title, author, labels, draft state, created-at** come from the row's structured markup.

A `MutationObserver` on `.repository-content` triggers a debounced re-scrape whenever GitHub updates row content (e.g. when commit-status sockets push updates), so the kanban stays in sync without polling the GitHub API.

The UI is a React app rendered inside a shadow DOM to isolate it from GitHub's stylesheets.

## Project structure

```
src/
├── manifest.ts              # MV3 manifest (typed)
├── main-world/hook.ts       # fetch/XHR interception (MAIN world)
├── content/                 # isolated-world content script
│   ├── index.tsx            # entry, mounts shadow-DOM React app
│   ├── toggle.ts            # floating toggle button
│   ├── scraper.ts           # parses PR rows
│   ├── enricher.ts          # detail-page enrichment + cache
│   ├── classifier.ts        # column assignment (pure)
│   ├── bridge.ts            # postMessage bridge to main-world hook
│   └── selectors.ts         # GitHub DOM selectors
├── ui/                      # React components + zustand store
├── lib/                     # storage, types, throttle helpers
├── background/              # service worker (cache GC)
├── popup/                   # extension popup
└── options/                 # options page
```

## Limitations

- **github.com only.** GitHub Enterprise is not supported in v1.
- **Repository PR lists only.** The global `/pulls` dashboard is not supported.
- **Selectors are scoped to the current GitHub markup.** If GitHub redesigns the PR list, the scraper in `src/content/scraper.ts` and `src/content/selectors.ts` will need updating.
