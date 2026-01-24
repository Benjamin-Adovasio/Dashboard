const SERVICES = {
  core: [
    { name: "VPN Portal", url: "https://vpn.adovasio.com", desc: "Secure remote access" },
    { name: "Nextcloud", url: "https://cloud.adovasio.com", desc: "Private cloud storage" },
    { name: "SSO", url: "https://sso.adovasio.com", desc: "Authentication gateway" },
    { name: "Print", url: "https://print.adovasio.com", desc: "PaperCut management" }
  ],
  infra: [
    { name: "Firewall", url: "#", desc: "Sophos perimeter security" },
    { name: "Hypervisor", url: "#", desc: "Virtual machine cluster" }
  ],
  obs: [
    { name: "Status", url: "https://adovasio.statuspage.io", desc: "Service health" }
  ]
};

function makeCard(svc) {
  const a = document.createElement("a");
  a.className = "card";
  a.href = svc.url;
  a.target = "_blank";
  a.rel = "noopener";

  a.innerHTML = `
    <h3>${svc.name}</h3>
    <p>${svc.desc}</p>
  `;

  a.addEventListener("pointermove", e => {
    const r = a.getBoundingClientRect();
    a.style.setProperty("--x", `${e.clientX - r.left}px`);
    a.style.setProperty("--y", `${e.clientY - r.top}px`);
  });

  return a;
}

function render() {
  let count = 0;

  [
    ["grid-core", SERVICES.core],
    ["grid-infra", SERVICES.infra],
    ["grid-obs", SERVICES.obs]
  ].forEach(([id, list]) => {
    const root = document.getElementById(id);
    list.forEach(s => {
      root.appendChild(makeCard(s));
      count++;
    });
  });

  document.getElementById("count").textContent = count;
}

document.addEventListener("DOMContentLoaded", render);
