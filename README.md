# Mohana Green Month

CloudCart Nitrogen landing page for https://mohana.bg/.
Campaign route: `/green-month`. The original storefront homepage at `/` is retained.

## Upload to GitHub

1. Extract the repository ZIP.
2. Upload the CONTENTS to the root of your new GitHub repository. `package.json`, `app/`, `public/` and `.github/` must be at the top level, not inside a second project folder.
3. Commit to `main`.
4. In CloudCart, connect this repository to the Mohana Nitrogen storefront. If already connected, keep the CloudCart-generated deployment workflow; do not delete or replace it.
5. If CloudCart creates a deployment pull request, review and merge it. This package intentionally has no store-specific Nova deployment credentials or target ID.
6. Configure the storefront environment variables listed below in CloudCart. Use the values issued for the Mohana storefront.
7. Check GitHub Actions for the CloudCart deployment run. The included `Mohana checks` workflow validates the source; its success alone does NOT mean the site was deployed.
8. After deployment, open the storefront URL followed by `/green-month`.

## Required environment

- `PUBLIC_STORE_DOMAIN`: `mohana.bg`
- `PUBLIC_STOREFRONT_API_TOKEN`: issued for this storefront
- `PRIVATE_STOREFRONT_API_TOKEN`: issued for this storefront, server-only
- `SESSION_SECRET`: unique random secret, at least 32 characters

Never upload a real `.env`, tokens or credentials to GitHub. `.env.example` documents the variable names only. CloudCart's deployment workflow manages its own deployment secrets separately.

## Local development

Use Node 22 or 24.

```sh
npm ci
cloudcart nitrogen link
cloudcart nitrogen env pull
npm run dev
```

Open the dev server's `/green-month` route. For validation:

```sh
npm run codegen
npm run typecheck
npm run build
```

`npm run check` also runs the original project's strict lint and formatting checks.

## What is preserved

The supplied design, images, fonts, campaign settings, Storefront API queries, cart drawer and checkout integration are retained. Products and prices require working Mohana API credentials. This package is a full server-rendered storefront, not a static HTML embed.

No CloudCart HTML-builder embed is included at this stage. Hosting the same interactive landing page inside the classic store will require a separate integration step; do not paste the React source into the HTML builder.

## Campaign edits

- `app/lib/green-month.ts`: copy, campaign dates, categories and product selections
- `app/routes/green-month.tsx`: data loading and page
- `app/components/green-month/`: page sections
- `app/styles/green-month.css`: campaign styles
- `app/assets/green-month/`: campaign images

The original handoff is retained in `docs/ORIGINAL-HANDOFF.md` for reference. Its historical claims of live API, mobile and tracking verification have not been independently reverified for this new deployment. Verify prices, stock, add-to-cart, checkout and consent/tracking after connecting the new storefront.
