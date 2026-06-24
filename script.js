const searchInput = document.querySelector("#searchInput");
const resultCount = document.querySelector("#resultCount");
const emptyState = document.querySelector("#emptyState");
const toast = document.querySelector("#toast");
const cards = Array.from(document.querySelectorAll(".material-card"));
const downloadLinks = Array.from(document.querySelectorAll(".download-button"));
const heroAction = document.querySelector(".hero-action");
let toastTimer;

function normalize(value) {
  return value.toLocaleLowerCase("hy-AM").trim();
}

function updateMaterials() {
  const query = normalize(searchInput.value);
  let visibleCount = 0;

  cards.forEach((card) => {
    const title = normalize(card.dataset.title || card.textContent);
    const isVisible = title.includes(query);
    card.hidden = !isVisible;

    if (isVisible) {
      visibleCount += 1;
    }
  });

  const label = visibleCount === 1 ? "նյութ" : "նյութ";
  resultCount.textContent = `Ցուցադրված է ${visibleCount} ${label}`;
  emptyState.hidden = visibleCount !== 0;
}

searchInput.addEventListener("input", updateMaterials);

heroAction.addEventListener("click", (event) => {
  const target = document.querySelector(heroAction.getAttribute("href"));

  if (!target) {
    return;
  }

  event.preventDefault();
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  target.scrollIntoView({
    behavior: prefersReducedMotion ? "auto" : "smooth",
    block: "start",
  });
});

function showToast(message) {
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.hidden = true;
  }, 5200);
}

function triggerBrowserDownload(blob, filename) {
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
}

async function downloadPdf(event) {
  event.preventDefault();

  const link = event.currentTarget;
  const fileUrl = link.getAttribute("href");
  const filename = link.getAttribute("download") || fileUrl.split("/").pop();

  if (window.location.protocol === "file:") {
    showToast("Chrome-ը չի թույլ տալիս PDF-ը ուղղակի ներբեռնել file:/// ռեժիմում։ Բացեք կայքը start-site.command ֆայլով։");
    return;
  }

  link.setAttribute("aria-busy", "true");

  try {
    const response = await fetch(fileUrl);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const blob = await response.blob();
    triggerBrowserDownload(blob, filename);
  } catch (error) {
    showToast("Ներբեռնումը չստացվեց։ Փորձեք կրկին կամ բացեք ֆայլը և պահպանեք այն դիտարկիչից։");
  } finally {
    link.removeAttribute("aria-busy");
  }
}

downloadLinks.forEach((link) => {
  link.addEventListener("click", downloadPdf);
});
