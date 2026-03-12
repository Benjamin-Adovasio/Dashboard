const ICONS = {
  shield: `<svg viewBox="0 0 24 24"><path d="M12 2l8 4v6c0 5-3.5 9.5-8 12-4.5-2.5-8-7-8-12V6z"></path></svg>`,
  cloud: `<svg viewBox="0 0 24 24"><path d="M6 18h11a4 4 0 0 0 0-8 5 5 0 0 0-9.7-1A4 4 0 0 0 6 18z"></path></svg>`,
  printer: `<svg viewBox="0 0 24 24"><path d="M6 9V3h12v6"></path><rect x="6" y="14" width="12" height="7"></rect><rect x="4" y="9" width="16" height="5"></rect></svg>`,
  key: `<svg viewBox="0 0 24 24"><circle cx="7" cy="15" r="3"></circle><path d="M10 15h11l-2-2 2-2"></path></svg>`,
  camera: `<svg viewBox="0 0 24 24"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h3l2-3h6l2 3h3a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>`,
  clock: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path></svg>`,
  notes: `<svg viewBox="0 0 24 24"><rect x="4" y="3" width="16" height="18" rx="2"></rect><line x1="8" y1="7" x2="16" y2="7"></line><line x1="8" y1="11" x2="16" y2="11"></line><line x1="8" y1="15" x2="13" y2="15"></line></svg>`,
  energy: `<svg viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 10 10 13 2"></polygon></svg>`
};

const SERVICE_META = {
  shield: { label: "Secure Access", accent: "45, 212, 191" },
  key: { label: "Identity Layer", accent: "255, 184, 107" },
  cloud: { label: "Cloud Platform", accent: "102, 181, 255" },
  printer: { label: "Device Utility", accent: "255, 150, 120" },
  camera: { label: "Backup & Media", accent: "118, 199, 255" },
  clock: { label: "Network Timing", accent: "86, 211, 155" },
  notes: { label: "Knowledge Sync", accent: "245, 198, 108" },
  energy: { label: "Facility Insight", accent: "177, 217, 98" }
};

const STATUSPAGE_ID = "qzblys3lm8jb";
const STATUS_BASE = `https://${STATUSPAGE_ID}.statuspage.io/api/v2`;

document.addEventListener("DOMContentLoaded", () => {
  setupObservabilityToggle();
  loadServices();
  loadStatus();
});

async function loadServices() {
  try {
    const response = await fetch("/assets/data/services.json", {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error("services");
    }

    const data = await response.json();
    const services = Array.isArray(data.core) ? data.core : [];
    renderServiceCount(services.length);
    renderServiceLaunch(services);
    renderServices(services);
  } catch (error) {
    renderServiceCount(0);
    renderServices([]);
    renderServiceLaunch([]);
  }
}

function renderServiceCount(count) {
  document.querySelectorAll("[data-service-count]").forEach(node => {
    node.textContent = String(count);
  });
}

function renderServiceLaunch(services) {
  const root = document.getElementById("service-launch");
  if (!root) {
    return;
  }

  if (services.length === 0) {
    root.innerHTML = `
      <article class="status-card">
        <h3>Service list unavailable</h3>
        <p>Refresh the page to try again.</p>
      </article>
    `;
    return;
  }

  root.innerHTML = services
    .map((service, index) => {
      const host = formatServiceHost(service.url);
      return `
        <a
          class="service-link"
          href="${escapeAttribute(service.url)}"
          target="_blank"
          rel="noopener noreferrer"
          style="--card-delay: ${index * 55}ms"
        >
          <strong>${escapeHtml(service.name)}</strong>
          <span>${escapeHtml(host)}</span>
        </a>
      `;
    })
    .join("");
}

function renderServices(services) {
  const root = document.getElementById("grid-core");
  if (!root) {
    return;
  }

  if (services.length === 0) {
    root.innerHTML = `
      <article class="status-card">
        <h3>Services are temporarily unavailable</h3>
        <p>The service catalog could not be loaded right now.</p>
      </article>
    `;
    return;
  }

  root.innerHTML = services
    .map((service, index) => {
      const meta = SERVICE_META[service.icon] || SERVICE_META.cloud;
      return `
        <a
          class="card service-card"
          href="${escapeAttribute(service.url)}"
          target="_blank"
          rel="noopener noreferrer"
          style="--service-accent: ${meta.accent}; --card-delay: ${index * 70}ms"
        >
          <div class="card-top">
            <span class="service-kicker">${escapeHtml(meta.label)}</span>
            <div class="service-icon">
              ${ICONS[service.icon] || ICONS.cloud}
            </div>
          </div>
          <h3>${escapeHtml(service.name)}</h3>
          <p>${escapeHtml(service.desc || "")}</p>
          <div class="service-footer">
            <span class="service-domain">${escapeHtml(formatServiceHost(service.url))}</span>
            <span class="service-arrow">Open service</span>
          </div>
        </a>
      `;
    })
    .join("");
}

async function loadStatus() {
  await Promise.allSettled([
    renderStatusSummary(),
    renderStatusComponents(),
    renderIncidents(),
    renderPlannedMaintenance()
  ]);
}

async function fetchStatus(endpoint) {
  const response = await fetch(`${STATUS_BASE}/${endpoint}`, {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(endpoint);
  }

  return response.json();
}

async function renderStatusSummary() {
  const root = document.getElementById("status-summary");
  if (!root) {
    return;
  }

  try {
    const data = await fetchStatus("status.json");
    const indicator = statusClass(data.status?.indicator || "none");
    const description = data.status?.description || "Status unavailable";
    const updatedAt = formatDate(data.page?.updated_at);

    root.innerHTML = `
      <article class="status-card">
        <span class="status-kicker">Platform Status</span>
        <h3>${escapeHtml(description)}</h3>
        <p>Current health across the Adovasio service environment.</p>
        <div class="status-meta">
          <span class="status-badge ${indicator}">
            ${escapeHtml(displayLabel(data.status?.indicator || "operational"))}
          </span>
          <span class="status-pill">Updated ${escapeHtml(updatedAt)}</span>
        </div>
      </article>

      <article class="status-card">
        <span class="status-kicker">Reporting Model</span>
        <h3>${escapeHtml(data.page?.name || "Adovasio Status Page")}</h3>
        <p>
          Incidents, maintenance windows, and component health are surfaced here
          so users can trust the platform without guessing.
        </p>
        <div class="status-meta">
          <span class="status-pill">Public operational reporting</span>
          <span class="status-pill">Live maintenance visibility</span>
        </div>
      </article>
    `;
  } catch (error) {
    renderStatusError(
      root,
      "Status data unavailable",
      "The live summary could not be loaded right now."
    );
  }
}

async function renderStatusComponents() {
  const root = document.getElementById("status-components");
  if (!root) {
    return;
  }

  try {
    const data = await fetchStatus("components.json");
    const components = Array.isArray(data.components) ? data.components : [];

    if (components.length === 0) {
      root.innerHTML = `
        <article class="status-card">
          <h3>No components listed</h3>
          <p>Component-level reporting is not currently available.</p>
        </article>
      `;
      return;
    }

    root.innerHTML = components
      .map(component => {
        const componentStatus = statusClass(component.status || "operational");
        return `
          <article class="status-card">
            <span class="status-kicker">Component</span>
            <h3>${escapeHtml(component.name)}</h3>
            <p>Status: ${escapeHtml(humanize(component.status || "operational"))}</p>
            <div class="status-meta">
              <span class="status-badge ${componentStatus}">
                ${escapeHtml(displayLabel(component.status || "operational"))}
              </span>
            </div>
          </article>
        `;
      })
      .join("");
  } catch (error) {
    renderStatusError(
      root,
      "Component status unavailable",
      "The component-level feed could not be loaded."
    );
  }
}

async function renderIncidents() {
  const root = document.getElementById("status-incidents");
  if (!root) {
    return;
  }

  try {
    const data = await fetchStatus("incidents/unresolved.json");
    const incidents = Array.isArray(data.incidents) ? data.incidents : [];

    if (incidents.length === 0) {
      root.innerHTML = `
        <article class="status-card">
          <h3>No active incidents</h3>
          <p>All systems are currently operating without open incidents.</p>
          <div class="status-meta">
            <span class="status-badge operational">Operational</span>
          </div>
        </article>
      `;
      return;
    }

    root.innerHTML = incidents
      .map(incident => {
        const impactClass = statusClass(incident.impact || "minor");
        return `
          <article class="status-card">
            <span class="status-kicker">Incident</span>
            <h3>${escapeHtml(incident.name)}</h3>
            <p>
              ${escapeHtml(displayLabel(incident.status || "investigating"))}
              in progress. Last updated ${escapeHtml(formatDate(incident.updated_at))}.
            </p>
            <div class="status-meta">
              <span class="status-badge ${impactClass}">
                ${escapeHtml(displayLabel(incident.impact || "minor"))} impact
              </span>
              <span class="status-pill">
                ${escapeHtml(displayLabel(incident.status || "investigating"))}
              </span>
            </div>
          </article>
        `;
      })
      .join("");
  } catch (error) {
    renderStatusError(
      root,
      "Incident feed unavailable",
      "Open incidents could not be loaded from the status feed."
    );
  }
}

async function renderPlannedMaintenance() {
  const root = document.getElementById("status-maintenance");
  if (!root) {
    return;
  }

  try {
    const [upcoming, active] = await Promise.all([
      fetchStatus("scheduled-maintenances/upcoming.json"),
      fetchStatus("scheduled-maintenances/active.json")
    ]);

    const maintenance = [
      ...(Array.isArray(active.scheduled_maintenances)
        ? active.scheduled_maintenances
        : []),
      ...(Array.isArray(upcoming.scheduled_maintenances)
        ? upcoming.scheduled_maintenances
        : [])
    ];

    if (maintenance.length === 0) {
      root.innerHTML = `
        <article class="status-card">
          <h3>No planned maintenance</h3>
          <p>There are no upcoming or active maintenance windows at the moment.</p>
          <div class="status-meta">
            <span class="status-badge operational">Clear</span>
          </div>
        </article>
      `;
      return;
    }

    root.innerHTML = maintenance
      .map(item => {
        const maintenanceStatus = statusClass(item.status || "under_maintenance");
        return `
          <article class="status-card">
            <span class="status-kicker">Maintenance</span>
            <h3>${escapeHtml(item.name)}</h3>
            <p>
              Scheduled for ${escapeHtml(formatDate(item.scheduled_for))}.
            </p>
            <div class="status-meta">
              <span class="status-badge ${maintenanceStatus}">
                ${escapeHtml(displayLabel(item.status || "under_maintenance"))}
              </span>
            </div>
          </article>
        `;
      })
      .join("");
  } catch (error) {
    renderStatusError(
      root,
      "Maintenance feed unavailable",
      "Scheduled maintenance could not be loaded right now."
    );
  }
}

function setupObservabilityToggle() {
  const shell = document.querySelector(".components-shell");
  const toggle = shell?.querySelector(".collapse-toggle");
  const icon = shell?.querySelector(".collapse-icon");
  const body = document.getElementById("observability-body");

  if (!shell || !toggle || !icon || !body) {
    return;
  }

  toggle.addEventListener("click", () => {
    const expanded = toggle.getAttribute("aria-expanded") === "true";
    const nextState = !expanded;

    toggle.setAttribute("aria-expanded", String(nextState));
    body.hidden = !nextState;
    shell.classList.toggle("is-expanded", nextState);
    shell.classList.toggle("is-collapsed", !nextState);
    icon.textContent = nextState ? "-" : "+";
  });
}

function renderStatusError(root, title, description) {
  root.innerHTML = `
    <article class="status-card">
      <h3>${escapeHtml(title)}</h3>
      <p>${escapeHtml(description)}</p>
    </article>
  `;
}

function formatServiceHost(value) {
  try {
    return new URL(value).host;
  } catch (error) {
    return value.replace(/^https?:\/\//, "");
  }
}

function formatDate(value) {
  if (!value) {
    return "just now";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "just now";
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}

function humanize(value) {
  return String(value)
    .replace(/_/g, " ")
    .replace(/\b\w/g, char => char.toUpperCase());
}

function displayLabel(value) {
  const labels = {
    none: "Operational",
    operational: "Operational",
    under_maintenance: "Under Maintenance",
    degraded_performance: "Degraded Performance",
    partial_outage: "Partial Outage",
    major_outage: "Major Outage"
  };

  return labels[value] || humanize(value);
}

function statusClass(value) {
  return String(value || "operational").toLowerCase().replace(/\s+/g, "_");
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
