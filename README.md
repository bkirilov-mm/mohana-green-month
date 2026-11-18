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

The supplied design, images, fonts, campaign settings, Storefront API queries, cart drawer and checkout integration are retained. Products and prices require working Mohana API credentials.

## Classic CloudCart page embed

The classic Mohana theme remains active. The Green Month campaign is embedded only on a normal CloudCart page at `https://mohana.bg/page/green-month`.

1. Deploy this repository to Nova.
2. Confirm that `https://green-month-5978adc2ca6a108d.cloudcart.dev/mohana/landing.js` returns JavaScript.
3. Create a classic CloudCart page with page link `green-month`.
4. Add an HTML/Code widget and paste the complete contents of `docs/CLOUDCART-EMBED.html`.
5. Save and publish the page, then test products, cart and checkout on desktop and mobile.

The loader displays the Nitrogen campaign in a full-window frame while the browser address stays on `mohana.bg/page/green-month`. The Nitrogen content security policy permits framing only from `mohana.bg` and `www.mohana.bg`.

## Campaign edits

- `app/lib/green-month.ts`: copy, campaign dates, categories and product selections
- `app/routes/green-month.tsx`: data loading and page
- `app/components/green-month/`: page sections
- `app/styles/green-month.css`: campaign styles
- `app/assets/green-month/`: campaign images

The original handoff is retained in `docs/ORIGINAL-HANDOFF.md` for reference. Its historical claims of live API, mobile and tracking verification have not been independently reverified for this new deployment. Verify prices, stock, add-to-cart, checkout and consent/tracking after connecting the new storefront.
