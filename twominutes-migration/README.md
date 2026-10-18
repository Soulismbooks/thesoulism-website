# Two Minutes — Blogger Migration Preview

A **non-production starter** for the planned migration of https://www.twominutes.in to GitHub + Cloudflare Pages.

## Safety
- This is a preview only; production DNS and Blogger remain unchanged.
- This starter is isolated under `twominutes-migration/` within the existing GitHub repository because the connected account did not expose a dedicated twominutes repository or repository-creation action.
- Before launch, move this folder into a dedicated repository to keep the unrelated Soulism website separate.
- No complete Blogger content has been imported yet. Real post/page migration depends on parsing the uploaded Google Takeout ZIP and auditing each source URL.

## Local preview
Open `index.html` directly in a browser. No build step is required.

## What's included
- Responsive Hindi homepage
- Money Tips and Happy Life sections
- Interactive SIP and goal calculators
- About, privacy-policy and contact draft pages
- Mobile navigation and CSS
- SEO baseline; marked `noindex,nofollow` while still a preview

## Before Cloudflare preview deployment
1. Import the Blogger XML export and enumerate posts/pages, labels, timestamps, original URLs, images and comments.
2. Generate old-route-compatible HTML for every article and static page.
3. Test for route collisions, broken links, missing media and content count mismatches.
4. Add sitemap/robots/canonical metadata based on final domain decision.
5. Build an authenticated server-side publishing system. Never expose AI keys or admin credentials in client-side code.
6. Deploy only to a Cloudflare Pages preview.
7. Approve migration after manual review. No DNS cutover is part of this preview.
