(() => {
  "use strict";

  const PROJECTS_URL = "/_adovasio-shared/assets/data/projects.json";
  const TECHNOLOGIES_URL = "/_adovasio-shared/assets/data/technologies.json";
  const PROJECT_AUDIENCES = new Set(["public", "client", "internal"]);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSharedFooters, { once: true });
  } else {
    initSharedFooters();
  }

  function initSharedFooters() {
    const footers = Array.from(document.querySelectorAll("[data-shared-footer]"));
    if (!footers.length) {
      return;
    }

    footers.forEach(footer => {
      markCanonicalHost(footer);
      updateCurrentYear(footer);
      updateCurrentPage(footer);
      footer.querySelectorAll("[data-reveal]").forEach(element => {
        element.classList.add("is-visible");
      });
    });

    refreshProjectLinks(footers);
  }

  function markCanonicalHost(footer) {
    const host = window.location.hostname.toLowerCase();
    if (host === "adovasio.com" || host === "www.adovasio.com") {
      footer.setAttribute("data-canonical-host", "");
    }
  }

  function updateCurrentYear(footer) {
    const year = String(new Date().getFullYear());
    footer.querySelectorAll("[data-current-year]").forEach(element => {
      element.textContent = year;
    });
  }

  function updateCurrentPage(footer) {
    footer.querySelectorAll("[data-footer-page]").forEach(link => {
      link.removeAttribute("aria-current");
    });

    const host = window.location.hostname.toLowerCase();
    if (host !== "adovasio.com" && host !== "www.adovasio.com") {
      return;
    }

    const bodyPage = cleanText(document.body?.dataset.page).toLowerCase();
    const routePage = (window.location.pathname.split("/").pop() || "home")
      .replace(/\.html$/i, "") || "home";
    const currentPage = bodyPage || routePage;
    const currentLink = footer.querySelector(`[data-footer-page="${escapeSelector(currentPage)}"]`);
    currentLink?.setAttribute("aria-current", "page");
  }

  async function refreshProjectLinks(footers) {
    const surfaces = footers.flatMap(footer => [
      footer.querySelector("[data-footer-client]"),
      ...footer.querySelectorAll("[data-footer-project-group]")
    ]).filter(Boolean);

    surfaces.forEach(surface => surface.setAttribute("aria-busy", "true"));

    try {
      const [projectPayload, technologyPayload] = await Promise.all([
        fetchJson(PROJECTS_URL),
        fetchJson(TECHNOLOGIES_URL).catch(() => ({ technologies: {} }))
      ]);
      const projects = normalizeProjects(projectPayload, technologyPayload);
      if (!projects.length) {
        throw new Error("No valid projects were found.");
      }

      footers.forEach(footer => renderFooterProjects(footer, projects));
    } catch (error) {
      console.warn("The canonical footer project directory could not be refreshed.", error);
    } finally {
      surfaces.forEach(surface => surface.setAttribute("aria-busy", "false"));
    }
  }

  async function fetchJson(url) {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Unable to load ${url}`);
    }
    return response.json();
  }

  function renderFooterProjects(footer, projects) {
    const clientSurface = footer.querySelector("[data-footer-client]");
    const clientProject = projects
      .filter(project => (
        project.status === "live"
        && project.audience === "client"
        && Number.isFinite(project.placements["footer-client"])
      ))
      .sort((a, b) => comparePlacement(a, b, "footer-client"))[0];

    if (clientSurface && clientProject) {
      clientSurface.innerHTML = renderClientLink(clientProject);
    }

    footer.querySelectorAll("[data-footer-project-group]").forEach(surface => {
      const group = cleanText(surface.dataset.footerProjectGroup).toLowerCase();
      const selected = projects
        .filter(project => getFooterGroup(project) === group)
        .sort((a, b) => compareGroupOrder(a, b, group));

      if (selected.length) {
        surface.innerHTML = selected.map(renderProjectLink).join("");
      }
    });
  }

  function normalizeProjects(payload, technologyPayload) {
    const source = Array.isArray(payload?.projects) ? payload.projects : [];
    const technologyIds = new Set(
      Object.entries(technologyPayload?.technologies || {})
        .filter(([, technology]) => technology && typeof technology === "object" && cleanText(technology.name))
        .map(([id]) => id)
    );

    return source.map((value, index) => {
      if (!value || typeof value !== "object") {
        return null;
      }

      const id = cleanText(value.id);
      const name = cleanText(value.name);
      const url = normalizeUrl(value.url);
      if (!id || !name) {
        return null;
      }

      const rawAudience = cleanText(value.audience).toLowerCase();

      return {
        id,
        name,
        url,
        action: cleanText(value.action),
        audience: PROJECT_AUDIENCES.has(rawAudience) ? rawAudience : "internal",
        categoryKey: slugify(cleanText(value.category) || "Other"),
        kind: (cleanText(value.kind) || "Project").toLowerCase(),
        order: toFiniteNumber(value.order, index + 1),
        placements: normalizePlacements(value.placements),
        slug: cleanText(value.slug) || slugify(id),
        status: (cleanText(value.status) || "live").toLowerCase(),
        technologies: Array.isArray(value.technologies)
          ? value.technologies.filter(technologyId => technologyIds.has(technologyId))
          : []
      };
    }).filter(Boolean);
  }

  function normalizePlacements(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return {};
    }

    return Object.fromEntries(
      Object.entries(value)
        .map(([key, placement]) => [cleanText(key), Number(placement)])
        .filter(([key, placement]) => key && Number.isFinite(placement))
    );
  }

  function getFooterGroup(project) {
    if (Number.isFinite(project.placements["footer-client"])) {
      return "client";
    }

    if (project.kind === "app" || project.technologies.includes("ios")) {
      return "ios";
    }

    if (project.categoryKey === "tools" || project.audience === "public") {
      return "tools";
    }

    return "systems";
  }

  function compareGroupOrder(a, b, group) {
    const placement = `footer-${group}`;
    const aPlacement = a.placements[placement];
    const bPlacement = b.placements[placement];
    const aHasPlacement = Number.isFinite(aPlacement);
    const bHasPlacement = Number.isFinite(bPlacement);

    if (aHasPlacement || bHasPlacement) {
      if (!aHasPlacement) {
        return 1;
      }
      if (!bHasPlacement) {
        return -1;
      }
      if (aPlacement !== bPlacement) {
        return aPlacement - bPlacement;
      }
    }

    return a.order - b.order || a.name.localeCompare(b.name);
  }

  function comparePlacement(a, b, placement) {
    return a.placements[placement] - b.placements[placement]
      || a.order - b.order
      || a.name.localeCompare(b.name);
  }

  function renderProjectLink(project) {
    const destination = project.url
      || `https://adovasio.com/portfolio.html#project-${encodeURIComponent(project.slug)}`;
    const action = project.action
      ? `<small>${escapeHtml(project.action)}</small>`
      : "";

    return `
      <li${action ? ' class="mega-footer__project--action"' : ""}>
        <a href="${escapeAttribute(destination)}" target="_blank" rel="noopener noreferrer">
          <span class="mega-footer__project-name">
            <span>${escapeHtml(project.name)}</span>
            ${action}
          </span>
          ${renderArrowIcon()}
          <span class="sr-only"> (opens in a new tab)</span>
        </a>
      </li>
    `;
  }

  function renderClientLink(project) {
    const destination = project.url || "https://adovasio.com/contact.html";
    const action = project.action || project.name;

    return `
      <a
        class="mega-footer__client-login"
        href="${escapeAttribute(destination)}"
        target="_blank"
        rel="noopener noreferrer"
      >
        <svg class="mega-footer__client-login-icon" aria-hidden="true" viewBox="0 0 20 20">
          <rect x="4.5" y="8.5" width="11" height="8" rx="2"></rect>
          <path d="M7 8.5V6.8a3 3 0 0 1 6 0v1.7"></path>
        </svg>
        <span>${escapeHtml(action)}</span>
        <span class="mega-footer__client-login-arrow" aria-hidden="true">&#8599;</span>
        <span class="sr-only"> (opens in a new tab)</span>
      </a>
    `;
  }

  function renderArrowIcon(className = "") {
    const classAttribute = className ? ` class="${className}"` : "";
    return `<svg${classAttribute} aria-hidden="true" viewBox="0 0 20 20"><path d="M5 15 15 5M7 5h8v8"></path></svg>`;
  }

  function normalizeUrl(value) {
    const rawUrl = cleanText(value);
    if (!rawUrl) {
      return "";
    }

    try {
      const url = new URL(rawUrl, "https://adovasio.com/");
      return new Set(["http:", "https:"]).has(url.protocol) ? url.href : "";
    } catch {
      return "";
    }
  }

  function toFiniteNumber(value, fallback) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  }

  function slugify(value) {
    return cleanText(value)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function cleanText(value) {
    return typeof value === "string" ? value.trim() : "";
  }

  function escapeHtml(value) {
    return cleanText(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function escapeAttribute(value) {
    return escapeHtml(value);
  }

  function escapeSelector(value) {
    if (window.CSS?.escape) {
      return window.CSS.escape(value);
    }
    return value.replace(/[^a-z0-9_-]/gi, "");
  }
})();
