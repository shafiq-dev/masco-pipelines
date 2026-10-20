# MASCO Pipelines

Company content and sections come from the supplied MASCO Pipelines Profile (12 pages). The website uses the supplied `29lt-bukra-regular.ttf`, hosted locally. At the user's request, four capability images and six project thumbnails were created with the built-in imagegen tool. Named projects and client references retain the PDF's content and logos.

## Run locally

Run `npm run dev` in this directory and open http://localhost:3004. No dependency installation is required.

`npm run lint` checks JavaScript syntax, local assets, local font, and image paths. `npm run build` creates a clean static production copy in `dist/`.

## Source and sections

1. Cover
2. About Masco Pipelines / Who We Are / JV partners
3. Vision, Mission & Values (five values)
4. Core Capabilities
5. EPCC Capabilities
6. Project Portfolio (six projects)
7. Combined Track Record (eight figures)
8. Geographic Presence (four countries)
9. Why MASCO Pipelines?
10. Certifications & Standards (six entries)
11. Key Clients & Partners (twelve entries)
12. Closing company message, location and official websites

`extract_profile.py` extracts the original embedded PDF artwork, transparent logos and the vector SABIC mark. `profile-assets.json` records source page and image references. `rebuild.py` and `enhancements.py` create the page. `public/profile.css`, `public/enhancements.css` and `public/profile.js` provide layout, icons, popup behavior and motion.

The EPCC chapter is scroll-driven, with keyboard-accessible tabs and matching industrial images. The site includes scroll reveals, hero parallax, animated counts, project filters, country flag pins, reduced-motion support and a responsive mobile menu. Contact Us opens an accessible responsive dialog with validated enquiry fields and a draft preview. Enquiries can be copied or downloaded; nothing is sent or stored remotely. The PDF includes no verified enquiry email address.

Generated image originals are saved locally in `output/imagegen/` (ignored by Git). Optimized website images are committed in `public/imagery/`. Complete prompts and provenance are recorded in `image-generation.json` and `project-image-generation.json`. The imagery illustrates service areas and project types and is not represented as photography of the named portfolio projects.

## Netlify

Repository: https://github.com/shafiq-dev/masco-pipelines

Connect this repository to Netlify, using branch `main`. `netlify.toml` supplies the build command (`npm run build`), publish directory (`dist`) and Node.js version (22). No environment secrets, dependencies or Python installation are needed for the Netlify build. The generated HTML and all runtime assets are committed.

The local preview remains available on port 3004. A successful Git push and a completed Netlify deployment are separate states; verify the deployment in Netlify or through GitHub deployment checks.
