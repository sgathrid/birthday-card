const checkStains = document.getElementById("check-stains");
const checkSleep = document.getElementById("check-sleep");
const foodInput = document.getElementById("food-input");
const form = document.getElementById("verify-form");
const submitBtn = document.getElementById("submit-btn");
const hint = document.getElementById("hint");
const statusPill = document.getElementById("status-pill");

function normalizeAnswer(value) {
  return value.trim().toLowerCase();
}

function getState() {
  const answer = normalizeAnswer(foodInput.value);

  return {
    answer,
    foodValid: answer === "sushi",
    stainValid: checkStains.checked,
    sleepValid: !checkSleep.checked,
  };
}

function getErrorMessage(state) {
  if (!state.sleepValid) {
    return "That control question failed. A reasonable reviewer would flag the sleep schedule.";
  }

  if (!state.stainValid) {
    return "One required credential is missing.";
  }

  if (state.answer.length === 0) {
    return "The security answer is required.";
  }

  if (!state.foodValid) {
    return "Incorrect answer. Try the dinner that always works.";
  }

  return "";
}

function isValidState() {
  const state = getState();
  return state.stainValid && state.sleepValid && state.foodValid;
}

function clearSubmitFeedback() {
  hint.textContent = "";
  hint.hidden = true;
  statusPill.textContent = "Pending";
  statusPill.classList.remove("status-pill-error", "status-pill-ok");
  submitBtn.classList.remove("invalid");
}

function getBlogUrlIfOpen() {
  return fetch("blog/manifest.json", { cache: "no-store" })
    .then((response) => {
      if (!response.ok) return "";
      return response.json();
    })
    .then((manifest) => {
      const hasPublishedPosts =
        Array.isArray(manifest.posts) &&
        manifest.posts.some((post) => post.published !== false);

      return manifest.enabled && hasPublishedPosts ? "blog/" : "";
    })
    .catch(() => "");
}

[checkStains, checkSleep, foodInput].forEach((field) => {
  field.addEventListener("input", clearSubmitFeedback);
  field.addEventListener("change", clearSubmitFeedback);
});

form.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!isValidState()) {
    const state = getState();

    hint.textContent = getErrorMessage(state);
    hint.hidden = false;
    statusPill.textContent = "Denied";
    statusPill.classList.add("status-pill-error");
    submitBtn.classList.remove("invalid");
    void submitBtn.offsetWidth;
    submitBtn.classList.add("invalid");

    if (!checkStains.checked) {
      checkStains.focus();
    } else if (checkSleep.checked) {
      checkSleep.focus();
    } else {
      foodInput.focus();
    }
    return;
  }

  statusPill.textContent = "Verified";
  statusPill.classList.remove("status-pill-error");
  statusPill.classList.add("status-pill-ok");
  sessionStorage.setItem("mom-clearance", "verified");
  getBlogUrlIfOpen().then((blogUrl) => {
    window.location.href = blogUrl || "gift.html";
  });
});

clearSubmitFeedback();
