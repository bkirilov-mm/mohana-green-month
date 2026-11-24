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

## Green Month popup release

The public campaign runs at https://mohana.bg/page/green-month. Its HTML, images,
styles and browser code are in `public/mohana/green-month/`. The existing
Nitrogen `/green-month` route is the earlier campaign. The live embed uses
`/mohana/green-month/index.html`.

1. Overlay the release files onto the existing connected repository, preserving
   the folder structure. The linked Nova workflow and environment stay with
   that repository. A push to its `main` branch deploys automatically.
2. When Nova deploys, open
   https://green-month-5978adc2ca6a108d.cloudcart.dev/mohana/green-month/index.html
   to check the release directly.
3. In the classic CloudCart page with link `green-month`, replace the current
   HTML/Code widget contents with `docs/CLOUDCART-EMBED.html`. The embed uses
   an iframe so it does not depend on a script in the classic page editor.
4. Open https://mohana.bg/page/green-month. In a private window, add two variants
   and a second product, edit a quantity, and remove one line. Click
   **Към поръчка** and compare every remaining product, variant and quantity
   on the full-page CloudCart checkout. Stop before order submission.

The popup looks up live variants when a visitor opens a product or uses quick
add. The card displays use the supplied campaign snapshot. The drawer shows
prices and quantities from the Storefront API. The campaign has its own guest
cart, and the cart-specific CloudCart checkout URL opens in the top-level
window. The classic store’s pre-existing cart is separate. Cart persistence
across reloads uses tab storage when the browser allows it.

## Campaign edits

- `app/lib/green-month.ts`: copy, campaign dates, categories and product selections
- `app/routes/green-month.tsx`: data loading and page
- `app/components/green-month/`: page sections
- `app/styles/green-month.css`: campaign styles
- `app/assets/green-month/`: campaign images

The original handoff is retained in `docs/ORIGINAL-HANDOFF.md` for reference. Its historical claims of live API, mobile and tracking verification have not been independently reverified for this new deployment. Verify prices, stock, add-to-cart, checkout and consent/tracking after connecting the new storefront.
