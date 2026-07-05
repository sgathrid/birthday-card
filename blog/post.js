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

function createThumbnail(figure, index) {
  const button = document.createElement("button");
  const caption = figure.querySelector("figcaption")?.textContent?.trim();
  const image = figure.querySelector("img");
  const video = figure.querySelector("video");

  button.className = "media-gallery__thumb";
  button.type = "button";
  button.setAttribute("aria-label", caption || `Show item ${index + 1}`);

  if (image) {
    const thumbnail = image.cloneNode(false);
    thumbnail.loading = "lazy";
    thumbnail.alt = "";
    button.append(thumbnail);
    return button;
  }

  if (video) {
    const thumbnail = video.cloneNode(false);
    const marker = document.createElement("span");

    thumbnail.removeAttribute("controls");
    thumbnail.muted = true;
    thumbnail.playsInline = true;
    thumbnail.preload = "metadata";
    thumbnail.setAttribute("aria-hidden", "true");
    marker.className = "media-gallery__play";
    marker.setAttribute("aria-hidden", "true");
    marker.textContent = "Play";
    button.append(thumbnail, marker);
  }

  return button;
}

function enhanceGallery(gallery) {
  if (gallery.dataset.enhanced === "true") return;

  const figures = Array.from(gallery.querySelectorAll(":scope > figure"));
  if (figures.length === 0) return;

  const label = gallery.dataset.galleryLabel || "Media";
  const stage = document.createElement("div");
  const previous = document.createElement("button");
  const next = document.createElement("button");
  const thumbs = document.createElement("div");
  let activeIndex = 0;
  let pointerStart = null;

  gallery.dataset.enhanced = "true";
  gallery.setAttribute("role", "region");
  gallery.setAttribute("aria-label", `${label} gallery`);
  gallery.tabIndex = 0;

  stage.className = "media-gallery__stage";
  thumbs.className = "media-gallery__thumbs";
  thumbs.setAttribute("role", "tablist");
  thumbs.setAttribute("aria-label", `${label} thumbnails`);

  previous.className = "media-gallery__control media-gallery__control--prev";
  previous.type = "button";
  previous.setAttribute("aria-label", "Previous item");
  previous.textContent = "‹";

  next.className = "media-gallery__control media-gallery__control--next";
  next.type = "button";
  next.setAttribute("aria-label", "Next item");
  next.textContent = "›";

  function setActive(index) {
    activeIndex = (index + figures.length) % figures.length;

    figures.forEach((figure, figureIndex) => {
      const isActive = figureIndex === activeIndex;
      const video = figure.querySelector("video");

      figure.hidden = !isActive;
      figure.classList.toggle("is-active", isActive);

      if (!isActive && video) {
        video.pause();
      }
    });

    Array.from(thumbs.children).forEach((thumb, thumbIndex) => {
      const isActive = thumbIndex === activeIndex;

      thumb.classList.toggle("is-active", isActive);
      thumb.setAttribute("aria-selected", String(isActive));
      thumb.tabIndex = isActive ? 0 : -1;
    });
  }

  figures.forEach((figure, index) => {
    const thumb = createThumbnail(figure, index);

    figure.classList.add("media-gallery__slide");
    thumb.setAttribute("role", "tab");
    thumb.addEventListener("click", () => setActive(index));
    thumbs.append(thumb);
    stage.append(figure);
  });

  previous.addEventListener("click", () => setActive(activeIndex - 1));
  next.addEventListener("click", () => setActive(activeIndex + 1));

  stage.addEventListener("pointerdown", (event) => {
    if (event.target.closest("button, video")) return;
    pointerStart = event.clientX;
  });

  stage.addEventListener("pointerup", (event) => {
    if (pointerStart === null) return;

    const delta = event.clientX - pointerStart;
    pointerStart = null;

    if (Math.abs(delta) < 38) return;
    setActive(activeIndex + (delta < 0 ? 1 : -1));
  });

  gallery.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      setActive(activeIndex - 1);
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      setActive(activeIndex + 1);
    }
  });

  stage.append(previous, next);
  gallery.append(stage, thumbs);
  setActive(0);
}

function enhanceGalleries() {
  const root = postContent.shadowRoot?.querySelector(".markdown-body");
  if (!root) return false;

  const galleries = root.querySelectorAll(".media-gallery");
  if (galleries.length === 0) return false;

  galleries.forEach(enhanceGallery);
  return true;
}

function scheduleGalleryEnhancement() {
  let attempts = 0;

  function attempt() {
    attempts += 1;

    if (enhanceGalleries() || attempts >= 80) return;
    window.setTimeout(attempt, 50);
  }

  attempt();
}

postContent.addEventListener("zero-md-rendered", scheduleGalleryEnhancement);

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
      postContent.setAttribute("src", `${post.src}?v=${encodeURIComponent(post.version || post.date)}`);
      postHeader.hidden = false;
      postStatus.hidden = true;
      markdownFrame.hidden = false;
      scheduleGalleryEnhancement();
    })
    .catch(() => {
      showStatus("Unavailable", "Update could not load.", "Check blog/manifest.json and the Markdown path.");
    });
}
