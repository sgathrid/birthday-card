const postHeader = document.getElementById("post-header");
const postDate = document.getElementById("post-date");
const postTitle = document.getElementById("post-title");
const postSummary = document.getElementById("post-summary");
const postStatus = document.getElementById("post-status");
const markdownFrame = document.getElementById("markdown-frame");
const postContent = document.getElementById("post-content");
const slug = new URLSearchParams(window.location.search).get("post");

if (sessionStorage.getItem("mom-clearance") !== "verified") {
  window.location.replace("../index.html");
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

function showStatus(label, title, message) {
  postStatus.hidden = false;
  markdownFrame.hidden = true;
  postHeader.hidden = true;
  postStatus.querySelector(".panel-label").textContent = label;
  postStatus.querySelector("h2").textContent = title;
  postStatus.querySelector("p").textContent = message;
}

if (!slug) {
  showStatus("Missing post", "No update selected.", "Return to the archive and choose an update.");
} else {
  fetch("manifest.json", { cache: "no-store" })
    .then((response) => {
      if (!response.ok) throw new Error("Digest manifest unavailable");
      return response.json();
    })
    .then((manifest) => {
      const posts = Array.isArray(manifest.posts) ? manifest.posts : [];
      const post = posts.find((entry) => entry.slug === slug && entry.published !== false);

      if (!manifest.enabled || !post) {
        showStatus("Not available", "This update is not open yet.", "Return to the gift page for now.");
        return;
      }

      document.title = `${post.title} | Sid's Monthly Digest`;
      postDate.textContent = formatDate(post.date);
      postTitle.textContent = post.title;
      postSummary.textContent = post.summary;
      postContent.setAttribute("src", post.src);
      postHeader.hidden = false;
      postStatus.hidden = true;
      markdownFrame.hidden = false;
    })
    .catch(() => {
      showStatus("Unavailable", "Update could not load.", "Check blog/manifest.json and the Markdown path.");
    });
}
