# Sid's Monthly Digest

This folder powers the private monthly digest.

The archive is currently locked because `manifest.json` has `"enabled": false`.
When the first real update is ready, set it to `true`.

## Publish a new update

1. Add a Markdown file under `posts/`, named by month, for example `posts/2026-07.md`.
2. Add that month's images under `assets/2026-07/`.
3. Add one entry to `manifest.json`.
4. Set `"enabled": true` when the archive should appear from the gift page.

Example manifest:

```json
{
  "enabled": true,
  "posts": [
    {
      "slug": "2026-07",
      "date": "2026-07-01",
      "title": "July Update",
      "summary": "A short sentence about the month.",
      "cover": "assets/2026-07/cover.jpg",
      "src": "posts/2026-07.md",
      "published": true
    }
  ]
}
```

## Images and captions

Use normal Markdown image syntax. Put the caption on the next line in italics:

```md
![Coffee shop window](../assets/2026-07/window.jpg)
*Rainy morning, good coffee, questionable umbrella decision.*
```

Markdown files are loaded by `zero-md`, so view the site through GitHub Pages or
a local server. Opening the HTML files directly from Finder can block Markdown
loading in the browser.
