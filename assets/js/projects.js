(() => {
  "use strict";

  const PROJECTS_URL = "/assets/data/projects.json";
  const TECHNOLOGIES_URL = "/assets/data/technologies.json";
  const PROJECT_AUDIENCES = new Set(["public", "client", "internal"]);

  const VISUAL_ICONS = {
    ai: `<svg viewBox="0 0 24 24"><path d="M8 5h8a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3Z"></path><path d="M9 10h.01M15 10h.01M9 15c2 1 4 1 6 0M12 2v3"></path></svg>`,
    app: `<svg viewBox="0 0 24 24"><rect x="7" y="2" width="10" height="20" rx="2"></rect><path d="M11 18h2"></path></svg>`,
    clock: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path></svg>`,
    cloud: `<svg viewBox="0 0 24 24"><path d="M6 18h11a4 4 0 0 0 0-8 5 5 0 0 0-9.7-1A4 4 0 0 0 6 18Z"></path></svg>`,
    code: `<svg viewBox="0 0 24 24"><path d="m9 7-5 5 5 5M15 7l5 5-5 5M13 4l-2 16"></path></svg>`,
    document: `<svg viewBox="0 0 24 24"><path d="M6 2h8l4 4v16H6Z"></path><path d="M14 2v5h5M9 12h6M9 16h6"></path></svg>`,
    files: `<svg viewBox="0 0 24 24"><path d="M3 7h7l2 2h9v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"></path><path d="M3 7V5a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v2"></path></svg>`,
    identity: `<svg viewBox="0 0 24 24"><circle cx="8" cy="12" r="3"></circle><path d="M11 12h10l-2-2 2-2M4 21a8 8 0 0 1 13-6"></path></svg>`,
    mail: `<svg viewBox="0 0 24 24"><rect x="2.5" y="5" width="19" height="14" rx="2"></rect><path d="m4 7 8 6 8-6"></path></svg>`,
    media: `<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2"></rect><circle cx="9" cy="10" r="2"></circle><path d="m5 18 5-5 3 3 2-2 4 4"></path></svg>`,
    network: `<svg viewBox="0 0 24 24"><rect x="3" y="3" width="6" height="6" rx="1"></rect><rect x="15" y="3" width="6" height="6" rx="1"></rect><rect x="9" y="15" width="6" height="6" rx="1"></rect><path d="M9 6h6M12 9v6"></path></svg>`,
    print: `<svg viewBox="0 0 24 24"><path d="M6 9V3h12v6"></path><rect x="6" y="14" width="12" height="7"></rect><rect x="4" y="9" width="16" height="6" rx="1"></rect></svg>`,
    security: `<svg viewBox="0 0 24 24"><path d="m12 2 8 4v6c0 5-3.5 9.5-8 12-4.5-2.5-8-7-8-12V6Z"></path><path d="m9 12 2 2 4-5"></path></svg>`,
    tools: `<svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1.5"></rect><rect x="14" y="3" width="7" height="7" rx="1.5"></rect><rect x="3" y="14" width="7" height="7" rx="1.5"></rect><path d="M17.5 14v7M14 17.5h7"></path></svg>`,
    fallback: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"></circle><circle cx="4" cy="6" r="2"></circle><circle cx="20" cy="6" r="2"></circle><circle cx="12" cy="21" r="2"></circle><path d="m6 7 4 3m8-3-4 3m-2 5v4"></path></svg>`
  };

  const directoryState = {
    filter: "all",
    query: ""
  };

  renderSiteFooters();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initProjectSurfaces, { once: true });
  } else {
    initProjectSurfaces();
  }

  function renderSiteFooters() {
    const page = getCurrentPage();
    const year = new Date().getFullYear();

    document.querySelectorAll("[data-site-footer]").forEach(root => {
      root.classList.add("site-footer--mega");
      root.removeAttribute("aria-labelledby");
      root.innerHTML = `
        <div class="mega-footer__main">
          <div class="mega-footer__shell mega-footer__directory">
            <div class="mega-footer__brand" data-reveal>
              <a class="mega-footer__lockup" href="/" aria-label="Adovasio Technology LLC home">
                <img
                  src="/assets/images/adovasio-footer-mark-96.webp"
                  width="96"
                  height="96"
                  loading="lazy"
                  alt=""
                />
                <span>
                  <strong>Adovasio</strong>
                  <small>Technology LLC</small>
                </span>
              </a>
              <p class="mega-footer__brand-copy">
                Professional technology without enterprise complexity.
              </p>
              <a class="mega-footer__email" href="mailto:info@adovasio.com">
                info@adovasio.com
              </a>
              <p class="mega-footer__copyright">
                <span>&copy; <span data-current-year>${year}</span> Adovasio Technology LLC</span>
                <span>Technology that just works.</span>
              </p>
            </div>

            <nav class="mega-footer__group" aria-labelledby="footer-explore-title" data-reveal>
              <h2 id="footer-explore-title">Explore</h2>
              <ul>
                <li>
                  <a href="/business.html"${renderCurrentPage("business", page)}>Business</a>
                </li>
                <li>
                  <a href="/residential.html"${renderCurrentPage("residential", page)}>
                    Residential
                  </a>
                </li>
                <li>
                  <a href="/portfolio.html"${renderCurrentPage("portfolio", page)}>Portfolio</a>
                </li>
                <li>
                  <a href="/about.html"${renderCurrentPage("about", page)}>About</a>
                </li>
                <li>
                  <a href="/contact.html"${renderCurrentPage("contact", page)}>Contact</a>
                </li>
                <li>
                  <a
                    href="https://www.instagram.com/adovasiotech/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Instagram<span class="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              </ul>
            </nav>

            <nav
              class="mega-footer__group mega-footer__project-group"
              aria-labelledby="footer-tools-title"
              data-reveal
            >
              <h2 id="footer-tools-title">Tools &amp; Platforms</h2>
              <ul
                class="mega-footer__project-list"
                data-projects-surface="footer-projects"
                data-footer-project-group="tools"
                aria-live="polite"
                aria-busy="true"
              >
                <li class="mega-footer__loading">Loading tools…</li>
              </ul>
            </nav>

            <nav
              class="mega-footer__group mega-footer__project-group"
              aria-labelledby="footer-ios-title"
              data-reveal
            >
              <h2 id="footer-ios-title">iOS Apps</h2>
              <ul
                class="mega-footer__project-list"
                data-projects-surface="footer-projects"
                data-footer-project-group="ios"
                aria-live="polite"
                aria-busy="true"
              >
                <li class="mega-footer__loading">Loading apps…</li>
              </ul>
            </nav>

            <nav
              class="mega-footer__group mega-footer__project-group mega-footer__project-group--systems"
              aria-labelledby="footer-systems-title"
              data-reveal
            >
              <h2 id="footer-systems-title">Systems &amp; Infrastructure</h2>
              <ul
                class="mega-footer__project-list"
                data-projects-surface="footer-projects"
                data-footer-project-group="systems"
                aria-live="polite"
                aria-busy="true"
              >
                <li class="mega-footer__loading">Loading systems…</li>
              </ul>
            </nav>
          </div>
        </div>
      `;

      root.querySelectorAll("[data-reveal]").forEach(element => {
        element.classList.add("is-visible");
      });
    });
  }

  function getCurrentPage() {
    const page = cleanText(document.body?.dataset.page).toLowerCase();
    if (page) {
      return page;
    }

    const route = window.location.pathname.split("/").pop() || "home";
    return route.replace(/\.html$/i, "") || "home";
  }

  function renderCurrentPage(target, current) {
    return target === current ? ' aria-current="page"' : "";
  }

  async function initProjectSurfaces() {
    const roots = Array.from(document.querySelectorAll("[data-projects-surface]"));
    if (!roots.length) {
      return;
    }

    setupDirectoryControls();
    roots.forEach(root => root.setAttribute("aria-busy", "true"));

    try {
      const [projectPayload, technologyPayload] = await Promise.all([
        fetchJson(PROJECTS_URL),
        fetchJson(TECHNOLOGIES_URL).catch(() => ({ technologies: {} }))
      ]);
      const technologies = normalizeTechnologies(technologyPayload);
      const projects = normalizeProjects(projectPayload, technologies);

      if (!projects.length) {
        throw new Error("No valid projects were found.");
      }

      roots.forEach(root => {
        renderProjectSurface(root, projects, technologies);
        root.setAttribute("aria-busy", "false");
      });
    } catch (error) {
      roots.forEach(root => renderProjectError(root));
    }
  }

  async function fetchJson(url) {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Unable to load ${url}`);
    }
    return response.json();
  }

  function normalizeTechnologies(payload) {
    const source = payload && typeof payload.technologies === "object"
      ? payload.technologies
      : {};
    const technologies = new Map();

    Object.entries(source).forEach(([id, value]) => {
      if (!value || typeof value !== "object") {
        return;
      }

      const name = cleanText(value.name);
      if (!name) {
        return;
      }

      technologies.set(id, {
        id,
        name,
        logo: normalizeImagePath(value.logo),
        mark: cleanText(value.mark) || getTechnologyMark(name)
      });
    });

    return technologies;
  }

  function normalizeProjects(payload, technologies) {
    const source = payload && Array.isArray(payload.projects) ? payload.projects : [];

    return source
      .map((project, index) => normalizeProject(project, index, technologies))
      .filter(Boolean)
      .sort(compareProjectOrder);
  }

  function normalizeProject(source, index, technologies) {
    if (!source || typeof source !== "object") {
      return null;
    }

    const id = cleanText(source.id);
    const name = cleanText(source.name);
    if (!id || !name) {
      return null;
    }

    const visualSource = source.visual && typeof source.visual === "object"
      ? source.visual
      : {};
    const technologyIds = Array.isArray(source.technologies)
      ? source.technologies.filter(id => technologies.has(id))
      : [];
    const category = cleanText(source.category) || "Other";
    const url = normalizeUrl(source.url);
    const domain = cleanText(source.domain) || getUrlHost(url);
    const rawOrder = Number(source.order);
    const rawAudience = cleanText(source.audience).toLowerCase();

    return {
      id,
      slug: cleanText(source.slug) || slugify(id),
      name,
      domain,
      url,
      tagline: cleanText(source.tagline),
      description: cleanText(source.description),
      category,
      categoryKey: slugify(category),
      kind: cleanText(source.kind) || "Project",
      audience: PROJECT_AUDIENCES.has(rawAudience) ? rawAudience : "internal",
      featured: source.featured === true,
      placements: normalizePlacements(source.placements),
      status: cleanText(source.status) || "live",
      order: Number.isFinite(rawOrder) ? rawOrder : index + 1,
      action: cleanText(source.action),
      tags: normalizeTags(source.tags),
      technologies: technologyIds,
      visual: {
        type: cleanText(visualSource.type) || cleanText(visualSource.icon) || cleanText(source.icon) || "fallback",
        image: normalizeImagePath(visualSource.image || source.image)
      }
    };
  }

  function normalizePlacements(value) {
    if (!value || typeof value !== "object") {
      return {};
    }

    return Object.fromEntries(
      Object.entries(value)
        .map(([surface, order]) => [surface, Number(order)])
        .filter(([, order]) => Number.isFinite(order))
    );
  }

  function normalizeTags(value) {
    if (!Array.isArray(value)) {
      return [];
    }

    return Array.from(
      new Set(value.map(cleanText).filter(Boolean))
    );
  }

  function renderProjectSurface(root, projects, technologies) {
    const surface = root.dataset.projectsSurface;

    if (surface === "footer-projects") {
      renderFooterPortfolioGroup(root, projects, root.dataset.footerProjectGroup);
      root.setAttribute("aria-busy", "false");
      return;
    }

    if (surface === "footer-tools" || surface === "footer-client") {
      renderFooterProjectSurface(root, projects, surface, root.dataset.projectLimit);
      root.setAttribute("aria-busy", "false");
      return;
    }

    if (surface === "portfolio") {
      renderCategoryFilters(projects);
      renderProjectGrid(root, projects, technologies);
      applyDirectoryFilters();
      revealInjectedContent(root);
      setupImageFallbacks(root);
      scrollToRequestedProject(root);
      return;
    }

    const selected = selectPlacedProjects(projects, surface, root.dataset.projectLimit);
    if (!selected.length) {
      renderProjectEmpty(root);
      return;
    }

    root.innerHTML = selected
      .map((project, index) => (
        surface === "business"
          ? renderBusinessProject(project, technologies, index)
          : renderHomeProject(project, technologies, index)
      ))
      .join("");

    setupImageFallbacks(root);
    revealInjectedContent(root);
  }

  function renderFooterPortfolioGroup(root, projects, rawGroup) {
    const group = cleanText(rawGroup).toLowerCase();
    const selected = projects
      .filter(project => getFooterProjectGroup(project) === group)
      .sort((a, b) => compareFooterGroupOrder(a, b, group));

    if (!selected.length) {
      renderFooterProjectFallback(root, "footer-projects");
      return;
    }

    root.innerHTML = selected.map(renderFooterToolProject).join("");
  }

  function getFooterProjectGroup(project) {
    const kind = project.kind.toLowerCase();

    if (kind === "app" || project.technologies.includes("ios")) {
      return "ios";
    }

    if (project.categoryKey === "tools" || project.audience === "public") {
      return "tools";
    }

    return "systems";
  }

  function compareFooterGroupOrder(a, b, group) {
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

    return compareProjectOrder(a, b);
  }

  function renderFooterProjectSurface(root, projects, surface, rawLimit) {
    const requiredAudience = surface === "footer-client" ? "client" : "public";
    const selected = selectPlacedProjects(
      projects.filter(project => (
        project.status.toLowerCase() === "live"
        && project.audience === requiredAudience
      )),
      surface,
      rawLimit
    );

    if (!selected.length) {
      renderFooterProjectFallback(root, surface);
      return;
    }

    root.innerHTML = surface === "footer-client"
      ? renderFooterClientProject(selected[0])
      : selected.map(renderFooterToolProject).join("");
  }

  function renderFooterToolProject(project) {
    const destination = project.url || `/portfolio.html#project-${slugify(project.slug)}`;
    const action = cleanText(project.action);

    return `
      <li${action ? ' class="mega-footer__project--action"' : ""}>
        <a href="${escapeAttribute(destination)}" ${buildLinkAttributes(destination)}>
          <span class="mega-footer__project-name">
            <span>${escapeHtml(project.name)}</span>
            ${action ? `<small>${escapeHtml(action)}</small>` : ""}
          </span>
          <svg aria-hidden="true" viewBox="0 0 20 20" focusable="false">
            <path d="M5 15 15 5M7 5h8v8"></path>
          </svg>
          ${renderExternalNote(destination)}
        </a>
      </li>
    `;
  }

  function renderFooterClientProject(project) {
    const destination = project.url || "/contact.html";
    const action = project.action || project.name;

    return `
      <p>Secure access to the Adovasio services you use.</p>
      <a
        class="mega-footer__client-link"
        href="${escapeAttribute(destination)}"
        ${buildLinkAttributes(destination)}
      >
        <span>
          <strong>${escapeHtml(action)}</strong>
          <small>${escapeHtml(project.domain || project.name)}</small>
        </span>
        <svg aria-hidden="true" viewBox="0 0 20 20" focusable="false">
          <path d="M5 15 15 5M7 5h8v8"></path>
        </svg>
        ${renderExternalNote(destination)}
      </a>
    `;
  }

  function renderFooterProjectFallback(root, surface) {
    if (surface === "footer-client") {
      root.innerHTML = `
        <p>Need help reaching your account?</p>
        <a class="mega-footer__fallback" href="/contact.html">Contact Adovasio</a>
      `;
      return;
    }

    root.innerHTML = `
      <li>
        <a class="mega-footer__fallback" href="/portfolio.html">Explore the portfolio</a>
      </li>
    `;
  }

  function selectPlacedProjects(projects, surface, rawLimit) {
    const placed = projects
      .filter(project => Number.isFinite(project.placements[surface]))
      .sort((a, b) => (
        a.placements[surface] - b.placements[surface] || compareProjectOrder(a, b)
      ));
    const fallback = surface === "home"
      ? projects.filter(project => project.featured)
      : [];
    const selection = placed.length ? placed : fallback;
    const limit = Number(rawLimit);

    return Number.isFinite(limit) && limit > 0
      ? selection.slice(0, limit)
      : selection;
  }

  function renderProjectGrid(root, projects, technologies) {
    root.innerHTML = projects
      .map((project, index) => renderProjectCard(project, technologies, index))
      .join("");
  }

  function renderProjectCard(project, technologies, index) {
    const tag = project.tags[0] || project.kind;
    const number = String(index + 1).padStart(2, "0");
    const searchText = buildSearchText(project, technologies);
    const visual = renderCardVisual(project);
    const stack = renderTechnologyStack(project, technologies);
    const copy = project.tagline || project.description;
    const destination = project.domain || project.status;
    const action = project.action || (project.url ? "Visit project" : "");
    const body = `
      <div class="work-card-visual card-visual" aria-hidden="true">
        <span class="work-card-grid"></span>
        <span class="work-card-orbit"></span>
        ${visual}
        <span class="work-card-number">${number}</span>
      </div>

      <div class="work-card-content">
        <div class="card-top">
          <span class="card-kind">${escapeHtml(project.category)}</span>
          <span class="card-tag">${escapeHtml(tag)}</span>
        </div>
        <div class="card-body">
          <h3>${escapeHtml(project.name)}</h3>
          ${copy ? `<p>${escapeHtml(copy)}</p>` : ""}
          ${stack}
        </div>
        <div class="card-footer">
          <span class="card-destination">${escapeHtml(destination)}</span>
          ${action ? `
            <strong class="card-action">
              <span>${escapeHtml(action)}${renderExternalNote(project.url)}</span>
              <svg aria-hidden="true" viewBox="0 0 20 20" focusable="false">
                <path d="M5 15 15 5M7 5h8v8"></path>
              </svg>
            </strong>
          ` : ""}
        </div>
      </div>
    `;

    return renderProjectContainer({
      project,
      tagName: project.url ? "a" : "article",
      className: `work-card directory-card work-card--${slugify(project.kind)} work-card--${slugify(project.visual.type)}${project.featured ? " work-card--featured" : ""}`,
      attributes: `
        id="project-${escapeAttribute(slugify(project.slug))}"
        data-directory-card
        data-entry-id="${escapeAttribute(project.id)}"
        data-category="${escapeAttribute(project.categoryKey)}"
        data-search="${escapeAttribute(searchText)}"
        data-reveal
        style="--work-index: ${index}"
      `,
      body
    });
  }

  function renderHomeProject(project, technologies, index) {
    const number = String(index + 1).padStart(2, "0");
    const copy = project.tagline || project.description;
    const body = `
      <div class="project-mark${project.visual.image ? " has-project-image" : ""}" aria-hidden="true">
        <span class="project-mark-icon">${resolveVisualIcon(project.visual.type)}</span>
        ${project.visual.image ? `
          <img class="project-tile-image" src="${escapeAttribute(project.visual.image)}" alt="" loading="lazy" decoding="async" />
        ` : ""}
      </div>
      <div class="project-tile-content">
        <div class="project-meta">
          <span>${escapeHtml(project.category)}</span>
          <span>${number}</span>
        </div>
        <div>
          <h3>${escapeHtml(project.name)}</h3>
          ${copy ? `<p>${escapeHtml(copy)}</p>` : ""}
          ${renderTechnologyStack(project, technologies, "compact")}
        </div>
      </div>
    `;

    return renderProjectContainer({
      project,
      tagName: project.url ? "a" : "article",
      className: "project-tile",
      attributes: `data-reveal style="--reveal-delay: ${index * 90}ms"`,
      body
    });
  }

  function renderBusinessProject(project, technologies, index) {
    const copy = project.tagline || project.description;
    const body = `
      <span class="work-card__meta">${escapeHtml(project.category)} / ${escapeHtml(project.kind)}</span>
      <span class="business-project-visual${project.visual.image ? " has-project-image" : ""}" aria-hidden="true">
        ${resolveVisualIcon(project.visual.type)}
        ${project.visual.image ? `
          <img src="${escapeAttribute(project.visual.image)}" alt="" loading="lazy" decoding="async" />
        ` : ""}
      </span>
      <h3>${escapeHtml(project.name)}</h3>
      ${copy ? `<p>${escapeHtml(copy)}</p>` : ""}
      ${renderTechnologyStack(project, technologies, "compact")}
      ${project.url ? `<span class="work-card__action">Open project${renderExternalNote(project.url)}</span>` : ""}
    `;

    return renderProjectContainer({
      project,
      tagName: project.url ? "a" : "article",
      className: "work-card business-project-card",
      attributes: `data-reveal style="--reveal-delay: ${index * 90}ms"`,
      body
    });
  }

  function renderProjectContainer({ project, tagName, className, attributes, body }) {
    const linkAttributes = project.url
      ? `href="${escapeAttribute(project.url)}" ${buildLinkAttributes(project.url)}`
      : "";

    return `
      <${tagName} class="${escapeAttribute(className)}" ${linkAttributes} ${attributes}>
        ${body}
      </${tagName}>
    `;
  }

  function renderCardVisual(project) {
    const image = project.visual.image;

    return `
      <span class="card-icon work-card-icon${image ? " has-project-image" : ""}">
        ${resolveVisualIcon(project.visual.type)}
        ${image ? `
          <img class="project-card-image" src="${escapeAttribute(image)}" alt="" loading="lazy" decoding="async" />
        ` : ""}
      </span>
    `;
  }

  function renderTechnologyStack(project, technologies, variant = "") {
    const items = project.technologies
      .map(id => technologies.get(id))
      .filter(Boolean);

    if (!items.length) {
      return "";
    }

    const visibleItems = variant === "compact" ? items.slice(0, 3) : items;

    return `
      <ul class="technology-stack${variant ? ` technology-stack--${variant}` : ""}" aria-label="Technology stack">
        ${visibleItems.map(technology => `
          <li title="${escapeAttribute(technology.name)}">
            <span class="technology-logo" aria-hidden="true">
              <span class="technology-mark">${escapeHtml(technology.mark)}</span>
              ${technology.logo ? `
                <img src="${escapeAttribute(technology.logo)}" alt="" loading="lazy" decoding="async" />
              ` : ""}
            </span>
            <span class="technology-name">${escapeHtml(technology.name)}</span>
          </li>
        `).join("")}
      </ul>
    `;
  }

  function renderCategoryFilters(projects) {
    const root = document.getElementById("directory-tags");
    if (!root) {
      return;
    }

    const categories = Array.from(
      new Map(projects.map(project => [project.categoryKey, project.category])).entries()
    );

    if (
      directoryState.filter !== "all"
      && !categories.some(([key]) => key === directoryState.filter)
    ) {
      directoryState.filter = "all";
    }

    root.innerHTML = [
      renderFilterButton("all", "All"),
      ...categories.map(([value, label]) => renderFilterButton(value, label))
    ].join("");
  }

  function renderFilterButton(value, label) {
    const active = directoryState.filter === value;

    return `
      <button
        class="filter-pill${active ? " is-active" : ""}"
        type="button"
        data-directory-filter="${escapeAttribute(value)}"
        aria-pressed="${String(active)}"
      >
        ${escapeHtml(label)}
      </button>
    `;
  }

  function setupDirectoryControls() {
    const search = document.getElementById("directory-search");
    const filters = document.getElementById("directory-tags");

    search?.addEventListener("input", event => {
      directoryState.query = cleanText(event.target.value).toLowerCase();
      applyDirectoryFilters();
    });

    search?.addEventListener("keydown", event => {
      if (event.key !== "Escape" || !search.value) {
        return;
      }

      search.value = "";
      directoryState.query = "";
      applyDirectoryFilters();
    });

    filters?.addEventListener("click", event => {
      const button = event.target.closest("[data-directory-filter]");
      if (!button) {
        return;
      }

      directoryState.filter = button.dataset.directoryFilter || "all";
      filters.querySelectorAll("[data-directory-filter]").forEach(node => {
        const active = node === button;
        node.classList.toggle("is-active", active);
        node.setAttribute("aria-pressed", String(active));
      });
      applyDirectoryFilters();
    });
  }

  function applyDirectoryFilters() {
    const root = document.getElementById("grid-directory");
    if (!root) {
      return;
    }

    const cards = Array.from(root.querySelectorAll("[data-directory-card]"));
    let visibleCount = 0;

    cards.forEach(card => {
      const matchesCategory = directoryState.filter === "all"
        || card.dataset.category === directoryState.filter;
      const matchesQuery = !directoryState.query
        || String(card.dataset.search || "").includes(directoryState.query);
      const visible = matchesCategory && matchesQuery;

      card.hidden = !visible;
      if (visible) {
        visibleCount += 1;
      }
    });

    const empty = document.getElementById("directory-empty");
    if (empty) {
      empty.hidden = cards.length === 0 || visibleCount > 0;
    }

    setText("[data-results-count]", visibleCount);
    setText("[data-results-label]", visibleCount === 1 ? "entry shown" : "entries shown");
    announceDirectoryResults(visibleCount);
  }

  function buildSearchText(project, technologies) {
    return [
      project.name,
      project.domain,
      project.tagline,
      project.description,
      project.category,
      project.kind,
      project.status,
      ...project.tags,
      ...project.technologies.map(id => technologies.get(id)?.name)
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
  }

  function announceDirectoryResults(count) {
    const status = document.getElementById("directory-status");
    if (!status) {
      return;
    }

    const activeFilter = document.querySelector(
      `[data-directory-filter="${escapeSelector(directoryState.filter)}"]`
    );
    const category = directoryState.filter === "all"
      ? ""
      : ` in ${activeFilter?.textContent.trim() || "the selected category"}`;
    const query = directoryState.query
      ? ` matching "${directoryState.query}"`
      : "";

    status.textContent = `${count} ${count === 1 ? "entry" : "entries"}${category}${query}.`;
  }

  function setupImageFallbacks(root) {
    root.querySelectorAll(".has-project-image img").forEach(image => {
      image.addEventListener("error", () => {
        image.closest(".has-project-image")?.classList.add("is-image-missing");
        image.remove();
      }, { once: true });
    });

    root.querySelectorAll(".technology-logo img").forEach(image => {
      image.addEventListener("error", () => {
        image.closest(".technology-logo")?.classList.add("is-image-missing");
        image.remove();
      }, { once: true });
    });
  }

  function scrollToRequestedProject(root) {
    let targetId = "";

    try {
      targetId = decodeURIComponent(window.location.hash.slice(1));
    } catch (error) {
      return;
    }

    if (!targetId) {
      return;
    }

    const target = document.getElementById(targetId);
    if (!target || !root.contains(target)) {
      return;
    }

    window.requestAnimationFrame(() => {
      target.scrollIntoView({ block: "start" });
    });
  }

  function revealInjectedContent(root) {
    const elements = Array.from(root.querySelectorAll("[data-reveal]"));
    if (!elements.length) {
      return;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || !("IntersectionObserver" in window)) {
      elements.forEach(element => element.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) {
          return;
        }
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, {
      rootMargin: "0px 0px -8% 0px",
      threshold: 0.04
    });

    elements.forEach(element => observer.observe(element));
  }

  function renderProjectError(root) {
    root.setAttribute("aria-busy", "false");

    if (
      root.dataset.projectsSurface === "footer-projects"
      || root.dataset.projectsSurface === "footer-tools"
      || root.dataset.projectsSurface === "footer-client"
    ) {
      renderFooterProjectFallback(root, root.dataset.projectsSurface);
      return;
    }

    root.innerHTML = `
      <article class="state-card project-state" role="alert">
        <p class="eyebrow panel-label">Unavailable</p>
        <h3>Projects could not be loaded.</h3>
        <p>Please try again or contact Adovasio for project information.</p>
        <a class="text-link" href="mailto:info@adovasio.com">Contact Adovasio</a>
      </article>
    `;

    if (root.dataset.projectsSurface === "portfolio") {
      setText("[data-results-count]", 0);
      setText("[data-results-label]", "entries shown");
    }
  }

  function renderProjectEmpty(root) {
    root.setAttribute("aria-busy", "false");
    root.innerHTML = `
      <article class="state-card project-state">
        <p class="eyebrow panel-label">Projects</p>
        <h3>More work is on the way.</h3>
        <a class="text-link" href="/portfolio.html">View the project directory</a>
      </article>
    `;
  }

  function resolveVisualIcon(type) {
    const icon = VISUAL_ICONS[type] || VISUAL_ICONS.fallback;
    return icon.replace("<svg ", '<svg aria-hidden="true" focusable="false" ');
  }

  function normalizeUrl(value) {
    const url = cleanText(value);
    return /^https?:\/\//i.test(url) || url.startsWith("/") ? url : "";
  }

  function normalizeImagePath(value) {
    const path = cleanText(value);
    return path.startsWith("/assets/images/") ? path : "";
  }

  function getUrlHost(value) {
    if (!value) {
      return "";
    }

    try {
      return new URL(value, window.location.origin).host;
    } catch (error) {
      return "";
    }
  }

  function buildLinkAttributes(url) {
    return isExternalUrl(url) ? 'target="_blank" rel="noopener noreferrer"' : "";
  }

  function renderExternalNote(url) {
    return isExternalUrl(url)
      ? '<span class="sr-only"> (opens in a new tab)</span>'
      : "";
  }

  function isExternalUrl(url) {
    return /^https?:\/\//i.test(url);
  }

  function compareProjectOrder(a, b) {
    return a.order - b.order || a.name.localeCompare(b.name);
  }

  function getTechnologyMark(name) {
    return name
      .split(/\s+/)
      .map(word => word[0])
      .join("")
      .slice(0, 3)
      .toUpperCase();
  }

  function slugify(value) {
    return cleanText(value)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "other";
  }

  function cleanText(value) {
    return String(value ?? "").trim();
  }

  function setText(selector, value) {
    document.querySelectorAll(selector).forEach(node => {
      node.textContent = String(value);
    });
  }

  function escapeSelector(value) {
    if (window.CSS?.escape) {
      return window.CSS.escape(value);
    }
    return String(value).replace(/["\\]/g, "\\$&");
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function escapeAttribute(value) {
    return escapeHtml(value);
  }
})();
