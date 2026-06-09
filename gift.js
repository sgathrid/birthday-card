if (sessionStorage.getItem("mom-clearance") !== "verified") {
  window.location.replace("index.html");
}

const actions = document.getElementById("gift-actions");

fetch("blog/manifest.json", { cache: "no-store" })
  .then((response) => {
    if (!response.ok) throw new Error("Digest manifest unavailable");
    return response.json();
  })
  .then((manifest) => {
    const hasPublishedPosts =
      Array.isArray(manifest.posts) &&
      manifest.posts.some((post) => post.published !== false);

    if (manifest.enabled && hasPublishedPosts) {
      window.location.replace("blog/");
      return;
    }

    if (actions) actions.hidden = true;
  })
  .catch(() => {
    if (actions) actions.hidden = true;
  });
