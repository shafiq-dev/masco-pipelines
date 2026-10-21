# MASCO Pipelines

October 2026 rework based on the two supplied site drafts, original company media and company portfolio. Dependency-free static site, ready for Netlify.

## Run and build

Run `npm run dev` and open http://localhost:3004. `npm run lint` checks JavaScript syntax, assets, fonts, photo provenance and footer-only portfolio mention. `npm run build` creates `dist/`. Netlify uses committed HTML and assets; Python is not required for deployment.

## Rework

Centred 1280px site frame with approximately 1160px content area, supplied white logo, navy header, cyan accents and heavier locally hosted Inter typography. Structure follows the supplied drafts: partnership, attributed parent-company track record, four service lines, EPCC lifecycle, six original project case studies, QHSE, values, country map, clients, partnership news and contact.

Interactive service tabs, project filters and detail dialogs, flag pins, rotating hero images, animated figures and restrained scroll reveals respect reduced-motion preferences. Mobile navigation and native dialogs support keyboard focus, Escape and backdrop dismissal. Unsupported draft-only safety records, fleet counts and conflicting project dates are omitted. The company portfolio PDF is linked only in the footer.

## Original media only

All photographs in `public/media/` come from supplied media or original photos packaged in the supplied drafts. No generated photography remains in the deployed site. Treatment is limited to EXIF orientation, proportional resizing and WebP compression.

`original-media-manifest.json` records each source archive, original filename and SHA-256. `public/brand/` contains supplied brand marks and original portfolio map and flags. `prepare_originals.py` records preparation from extracted local references in ignored `tmp/review/`.

Runtime: `public/index.html`, `public/site.css`, `public/site.js`. `rework.py` generates HTML. Historical generators are retained for reference and are not used by the build.

## Contact

The popup validates fields and prepares a draft for copying or downloading. Nothing is sent or stored remotely. A confirmed recipient or form service is required to enable direct submission. The footer links to the verified MASCO Group contact page.

## Protected client portal

The public site links to `/portal/`. The portal includes a responsive project tracker, animated delivery metrics, project switching, milestone progress, a demonstration weld/NDT register and a controlled-document preview. All included records are clearly labelled demonstration data until MASCO IT connects an approved project-data source.

Access IDs are checked only inside the Netlify function. The browser receives an HTTP-only, same-site, signed session cookie valid for eight hours; project data is not returned without a valid session. The login endpoint also applies best-effort request throttling. No production ID or signing secret is committed.

MASCO IT must configure these Netlify environment values before production access can work:

- `MASCO_PORTAL_ACCESS_IDS`: one or more long, randomly generated access IDs separated by commas.
- `MASCO_PORTAL_SESSION_SECRET`: a separate long random signing secret.

Changing either value invalidates the relevant access or sessions. `.env.example` documents the names using placeholders only.

## Hosting

GitHub: https://github.com/shafiq-dev/masco-pipelines

Netlify: branch `main`, command `npm run build`, publish `dist`, Node 22. No secrets or environment variables required.
