# Rapha Physio Care — Website

Static website for Rapha Physio Care (Truganina, VIC). Built by NovaLink Innovations.

- Plain HTML, CSS and JavaScript — no build step needed to host.
- Animations: GSAP + ScrollTrigger, smooth scrolling with Lenis (bundled in `assets/vendor`).
- Font: Manrope (self-hosted in `assets/fonts`).
- Contact form: `contact.php` sends enquiries by email (needs PHP hosting such as cPanel).

## Preview locally

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

To test the contact form locally, use `php -S localhost:8000` instead.

## Deploy

Upload everything in this folder to `public_html` on the cPanel hosting.
