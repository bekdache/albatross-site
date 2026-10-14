# albatross-cap.com

Static website for Albatross, hosted free on GitHub Pages. It replaces the earlier Framer build, with the same design and content.

## Structure

```
index.html        Home
about-us.html     About Us (team)
portfolio.html    Portfolio
contact-us.html   Contact form
404.html          Page not found
assets/css/site.css   All styles (desktop >= 1200px, tablet 810-1199px, phone <= 809px)
assets/js/site.js     Intro, mobile menu, headline rotator, video tilt, fade-ins, counters, accordion, forms
assets/img/           Images (WebP), background SVGs, logo
assets/fonts/         Poppins + Inter (self-hosted, OFL)
assets/video/         Hero video
```

## Editing

- Text: edit the HTML file for that page. The header and footer are repeated in each page, so change all five files.
- Images: add a `.webp` to `assets/img/` and point the `<img src>` at it.
- After editing CSS or JS, bump the `?v=` number in the `<link>`/`<script>` tags so browsers fetch the new file.

## Forms

The contact form and newsletter sign-up post to [FormSubmit](https://formsubmit.co) (free, no account).
The destination address is set once in `assets/js/site.js` (`FORM_ENDPOINT`). The first submission sends a one-time activation email to that address.

## Publishing

Every push to `main` publishes automatically through GitHub Pages. The custom domain is set in `CNAME`.
DNS (GoDaddy): four `A` records on `@` pointing at 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153, and `www` as a `CNAME` to `bekdache.github.io`. Email records (MX, SPF, Google verification) are separate and unaffected.
