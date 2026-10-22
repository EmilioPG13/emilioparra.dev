# emilioparra.dev

Source of Emilio Parra's personal site: a Software Developer portfolio with two project case studies, experience, education and contact.

## Stack

Astro, TypeScript (strict), Tailwind CSS and MDX content collections. Static output, no backend. Deployed on Vercel.

## Develop

Requires Node 22.23.4 or newer.

```sh
npm install
npm run dev       # dev server on http://localhost:4321
npm run check     # type check
npm test          # build, then Playwright tests (desktop and mobile)
npm run links     # broken link check on dist/ (run npm run build first)
npm run lighthouse
```

CI runs the type check, build and tests on every push and pull request. The link check and Lighthouse run as warnings until launch.
