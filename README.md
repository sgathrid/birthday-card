# Birthday Card + Sid's Monthly Digest

This is a static GitHub Pages site for the QR code in Mom's birthday card.

The flow is:

1. `index.html` asks the security questions.
2. If the blog is not open yet, the verified user lands on `gift.html`.
3. If the blog is open and has posts, the verified user goes straight to `blog/`.
4. `blog/` lists monthly updates from Markdown files.
5. `blog/post.html?post=<slug>` renders the selected Markdown post with `zero-md`.

## View Locally

Run a local server from the repo root:

```sh
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000/
```

Do not test by double-clicking the HTML files. The blog uses `fetch()` and
`zero-md`, so it needs HTTP, just like GitHub Pages.

## Monthly Update Workflow

To publish a new monthly update:

1. Add a Markdown file:

   ```text
   blog/posts/2026-07.md
   ```

2. Add photos for that month:

   ```text
   blog/assets/2026-07/
     cover.jpg
     dinner.jpg
     walk.jpg
   ```

3. In the Markdown file, reference images relative to the Markdown file:

   ```md
   ![Dinner table](../assets/2026-07/dinner.jpg)
   *Dinner after a long travel day.*
   ```

4. Add one entry to `blog/manifest.json`:

   ```json
   {
     "slug": "2026-07",
     "date": "2026-07-01",
     "title": "July Update",
     "summary": "A short sentence about the month.",
     "cover": "assets/2026-07/cover.jpg",
     "src": "posts/2026-07.md",
     "published": true
   }
   ```

5. Commit and push.

If `blog/manifest.json` has `"enabled": true` and at least one published post,
Mom goes straight from verification to the blog archive.

## Blog File Structure

Use this structure:

```text
blog/
  index.html
  post.html
  blog.js
  post.js
  manifest.json
  posts/
    2026-07.md
  assets/
    2026-07/
      cover.jpg
```

The live blog uses only `blog/posts/` for Markdown and `blog/assets/` for
images. Do not create root-level `posts/` or `assets/updates/` folders.

## Template Post

The repo includes a visible template post so the archive and Markdown rendering
can be tested:

```text
blog/posts/template.md
blog/assets/template/cover.svg
```

When the first real update is ready, either delete the template entry from
`blog/manifest.json` or set it to:

```json
"published": false
```

## Validation

Run this before pushing:

```sh
node scripts/validate-blog.mjs
```

The validator checks:

- `blog/manifest.json` is valid JSON.
- Each listed post has required fields.
- Slugs are unique.
- Markdown files exist.
- Cover images exist.
- Markdown image paths exist.

GitHub Actions also runs this check on every push and pull request.
