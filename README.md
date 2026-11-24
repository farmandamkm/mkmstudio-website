# MKM Studio — Website redesign

A responsive, animated static website for MKM Studio Ltd. The page presents Star City RP, AFBOOK, MKM AI, AI CALL, MKM Pocket, the studio, careers and contact information.

## Preview locally

From this folder, run `python -m http.server 8080`, then open `http://localhost:8080`. The website has no build step.

## Publish

Extract the ZIP first. Upload the **contents** of this folder to the root of a static host or GitHub Pages repository. Make sure `index.html`, `css/`, `js/`, `.nojekyll` and `LICENSE` are all included.

## Contacts

- Business and career enquiries: `business@starcityrp.com`
- Privacy enquiries: `mkmgamingcompany@gmail.com`

## Motion and external resources

The background artwork and short looping motion asset are included locally, so the hero remains visually complete in a direct `file://` preview. On a hosted page, the original Three.js scene and enhanced motion use Three.js, GSAP, ScrollTrigger, Lenis and Google Fonts from public CDNs. Internet access is needed for those effects and fonts. The HTML contains the core content and navigation, and reduced-motion preferences are respected.

## Included visual assets

- `assets/mkm-studio-orb.webp` — hero poster artwork
- `assets/mkm-studio-orb-loop.mp4` — silent six-second hero loop
- `assets/mkm-studio-team.webp` — studio team image

## License and attribution

The original MIT license is retained in `LICENSE`; its required copyright notice is unchanged. The template's source and visual design have been adapted for MKM Studio. Product names and studio content belong to their respective owners.
