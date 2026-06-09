const statusEl = document.getElementById("blog-status");
const postList = document.getElementById("post-list");

if (sessionStorage.getItem("mom-clearance") !== "verified") {
  window.location.replace("../index.html");
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

function renderLocked() {
  statusEl.hidden = false;
  postList.hidden = true;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function renderPosts(posts) {
  statusEl.hidden = true;
  postList.hidden = false;
  postList.innerHTML = posts
    .map((post) => {
      const cover = post.cover
        ? `<img src="${escapeHtml(post.cover)}" alt="" loading="lazy">`
        : "";

      return `
        <a class="post-row" href="post.html?post=${encodeURIComponent(post.slug)}">
          ${cover}
          <span>
            <time datetime="${escapeHtml(post.date)}">${formatDate(post.date)}</time>
            <strong>${escapeHtml(post.title)}</strong>
            <small>${escapeHtml(post.summary)}</small>
          </span>
        </a>
      `;
    })
    .join("");
}

fetch("manifest.json", { cache: "no-store" })
  .then((response) => {
    if (!response.ok) throw new Error("Digest manifest unavailable");
    return response.json();
  })
  .then((manifest) => {
    const posts = Array.isArray(manifest.posts)
      ? manifest.posts.filter((post) => post.published !== false)
      : [];

    if (!manifest.enabled || posts.length === 0) {
      renderLocked();
      return;
    }

    renderPosts(posts);
  })
  .catch(() => {
    statusEl.querySelector(".panel-label").textContent = "Unavailable";
    statusEl.querySelector("h2").textContent = "Digest archive could not load.";
    statusEl.querySelector("p").textContent = "Check blog/manifest.json and try again.";
    renderLocked();
  });
