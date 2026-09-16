# Phase 13 Audit — GitHub Pages Deployment + Browser Acceptance

**Status:** PASS — controlled publication release v1.0 accepted.  
**Date:** 2026-09-16  
**Canonical repository:** `knightfox789/weir-web-article`  
**Deployed publication tested:** `https://knightfox789.github.io/weir-web-article/`  
**Publication-content baseline:** Phase 12 `main` commit `df13658c638d590b4b978e2e3a691a2a428b067c`  
**Phase 13 accepted gate commit:** `b12fdab71029999dc3821a535ece0c3f200794e3`  
**Controlled release QA:** **208/208 PASS**

## Scope

Phase 13 is the final release-acceptance phase. It does not modify scientific results, article prose, live figure renderers, runtime JSON or CSS. It verifies the already deployed publication in real browser engines and establishes repeatable release QA infrastructure.

The release gate covers deployment/canonical metadata, desktop/mobile browser execution, FIG-01–FIG-17 lazy loading and data requests, representative figure interactions and Research Explorer behavior, accessibility/focus, mobile touch/overflow, reduced motion, internal navigation, author links, released JSON download behavior, browser console/page/network failures and deterministic release screenshots.

## Real-browser environment

The controlled GitHub Actions gate uses Ubuntu 24.04, Node 22 and Playwright **1.63.0** with:
- Chromium / Chrome for Testing **153.0.8010.12**;
- Firefox **155.0**;
- WebKit **26.6**.

Four scenarios are exercised:
- Chromium desktop — 1440 × 1000;
- Chromium mobile — 390 × 844 with reduced motion;
- Firefox desktop — 1366 × 900;
- WebKit mobile — 390 × 844.

## Browser result

Final accepted Phase 13 evidence:
- Chromium desktop: **49/49 PASS**;
- Chromium mobile + reduced motion: **51/51 PASS**;
- Firefox desktop: **49/49 PASS**;
- WebKit mobile: **50/50 PASS**;
- browser interaction/data-load subtotal: **199/199 PASS**;
- release link/visual gate: **9/9 PASS**;
- combined Phase 13 gate: **208/208 PASS**.

The browser gate verifies all 17 figures reach `ready` without figure-error UI, all 17 mount data sources return valid success/cache responses, all nine Research Explorer evidence views load, table/chart modes work, released-JSON download works, key interactive controls update, and no uncaught page errors, console errors, failed same-origin requests or root-level horizontal overflow are present.

## Harness correction recorded

The first cloud run reported one Firefox data-response failure even though FIG-04 rendered correctly. The cause was a QA-ledger bug: FIG-04 returned HTTP 200 when first loaded and later HTTP 304 when reused by the Research Explorer, while the original test retained only the last response status.

The acceptance harness was corrected to accept any successful 2xx or HTTP 304 response for a requested asset. The same four-browser gate then passed completely. This was a test-harness correction; no publication code or data changed.

## Visual acceptance

Screenshots were reviewed for desktop hero, mobile/reduced-motion hero, representative FIG-12 hydraulic-jump view, Research Explorer and cross-browser mobile/desktop Explorer views. No release-blocking clipping, root overflow or broken control layout was observed. The deterministic release screenshot harness disables smooth scrolling before capture so evidence frames are anchored reproducibly.

## Repository changes in Phase 13

Phase 13 adds only release-QA and repository-status infrastructure:
- `.github/workflows/phase13-browser-acceptance.yml`;
- `scripts/qa_phase13_browser.js`;
- `scripts/qa_phase13_release.js`;
- this audit and machine-readable result files;
- release manifest / README status update.

It does **not** change `index.html`, live figure JS/CSS, runtime JSON, scientific equations, figures, classifications, model coefficients, claim boundaries or reader-facing research interpretation.

## Four controlled gates

1. **Storyline fidelity — PASS.** No article prose or chapter structure is changed.
2. **Scientific fidelity — PASS.** Phase 12 scientific/provenance freeze remains byte-stable in Phase 13.
3. **Figure/data fidelity — PASS.** FIG-01–FIG-17 load successfully from deployed Pages in all controlled browser scenarios; the Research Explorer remains bounded to released evidence.
4. **Architecture restraint — PASS.** Release acceptance adds test infrastructure only; no framework, backend, raw-authoritative browser dataset or design-calculator behavior is introduced.

## Environment boundary

The project container's locally installed Chromium still hangs before page execution, including on `about:blank`. That environment defect is retained transparently. Phase 13 therefore uses GitHub-hosted real browser engines for controlled release evidence instead of falsely claiming local-browser coverage.

## Final closure evidence

The reviewed Phase 13 branch was merged through PR #3 to `main` as commit `b12fdab71029999dc3821a535ece0c3f200794e3`.

For that exact commit:
- GitHub Pages deployment run `35096684522` completed with conclusion **success**;
- Phase 13 browser-acceptance run `35096686145` (run #12) completed with conclusion **success**;
- browser evidence artifact id `10446471453` was retained with SHA-256 `31f27c78d7ca819e3b9c399ac8a3fd03712d3b7a943963636f4b4e970b45a5b7`;
- the canonical Library continuation file was updated with the accepted release checkpoint and evidence.

A subsequent documentation-only closure update may create a newer `main` SHA. Such a commit changes only the release audit/manifest record and does not alter the frozen scientific publication content; it must still pass the automatic Pages and Phase 13 browser workflows before being treated as the latest canonical checkpoint.

## Final status

**Phase 13 PASS. Phases 1–13 are complete and controlled publication release v1.0 is accepted.**
