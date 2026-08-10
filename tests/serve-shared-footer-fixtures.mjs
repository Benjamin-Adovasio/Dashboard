import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const mainRoot = path.resolve(testDirectory, "..");
const workspaceRoot = path.resolve(mainRoot, "..");
const port = Number(process.env.ADOVASIO_FIXTURE_PORT || 8765);
const headDirective = '<!--#include virtual="/_adovasio-shared/footer/head.html" -->';
const footerDirective = '<!--#include virtual="/_adovasio-shared/footer/footer.html" -->';
const headFragment = fs.readFileSync(path.join(mainRoot, "shared/footer/head.html"), "utf8");
const footerFragment = fs.readFileSync(path.join(mainRoot, "shared/footer/footer.html"), "utf8");

const siteRoots = new Map([
  ["adovasio.localhost", mainRoot],
  ["index.adovasio.localhost", path.join(workspaceRoot, "Index")],
  ["soc.adovasio.localhost", path.join(workspaceRoot, "SOC-Dashboard")],
  ["time.adovasio.localhost", path.join(workspaceRoot, "time-server")],
  ["tools.adovasio.localhost", path.join(workspaceRoot, "webtools")]
]);

const fixtureStyles = new Map([
  ["adovasio.localhost", ["/assets/css/experience.css"]],
  ["index.adovasio.localhost", ["/assets/css/main.css", "/assets/css/animations.css"]],
  ["soc.adovasio.localhost", ["/assets/css/styles.css"]],
  ["time.adovasio.localhost", ["/time.css"]],
  ["tools.adovasio.localhost", ["/assets/css/style.css"]]
]);

const fixtureBodies = new Map([
  ["adovasio.localhost", 'class="page-home" data-page="home"'],
  ["tools.adovasio.localhost", 'class="tool-page" data-page="network-tool"']
]);

const contentTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".webp", "image/webp"],
  [".woff2", "font/woff2"]
]);

function safeFile(root, requestPath) {
  const relative = decodeURIComponent(requestPath).replace(/^\/+/, "") || "index.html";
  const resolved = path.resolve(root, relative);
  return resolved === root || resolved.startsWith(`${root}${path.sep}`) ? resolved : null;
}

function sendFile(response, filePath, expandSsi = false) {
  if (!filePath || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  const extension = path.extname(filePath).toLowerCase();
  let body = fs.readFileSync(filePath);
  if (expandSsi && extension === ".html") {
    body = body.toString("utf8")
      .replaceAll(headDirective, headFragment)
      .replaceAll(footerDirective, footerFragment);
  }

  response.writeHead(200, {
    "Cache-Control": "no-store",
    "Content-Type": contentTypes.get(extension) || "application/octet-stream"
  });
  response.end(body);
}

const server = http.createServer((request, response) => {
  const host = String(request.headers.host || "").split(":")[0].toLowerCase();
  const siteRoot = siteRoots.get(host);
  if (!siteRoot) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Unknown fixture host");
    return;
  }

  const requestUrl = new URL(request.url || "/", `http://${host}`);
  if (requestUrl.pathname === "/_footer-fixture.html") {
    const localStyles = (fixtureStyles.get(host) || [])
      .map(href => `<link rel="stylesheet" href="${href}" />`)
      .join("\n");
    const bodyAttributes = fixtureBodies.get(host) || "";
    const isolatedFooter = host === "adovasio.localhost"
      ? footerFragment.replace("data-shared-footer>", "data-shared-footer data-canonical-host>")
      : footerFragment;
    const document = `<!doctype html>
<html class="no-js" lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  ${localStyles}
  ${headFragment}
  <script>document.documentElement.classList.replace("no-js", "js");</script>
</head>
<body ${bodyAttributes}>
  ${isolatedFooter}
</body>
</html>`;
    response.writeHead(200, {
      "Cache-Control": "no-store",
      "Content-Type": "text/html; charset=utf-8"
    });
    response.end(document);
    return;
  }
  const footerPrefix = "/_adovasio-shared/footer/";
  const assetPrefix = "/_adovasio-shared/assets/";
  if (requestUrl.pathname.startsWith(footerPrefix)) {
    sendFile(response, safeFile(path.join(mainRoot, "shared/footer"), requestUrl.pathname.slice(footerPrefix.length)));
    return;
  }
  if (requestUrl.pathname.startsWith(assetPrefix)) {
    sendFile(response, safeFile(path.join(mainRoot, "assets"), requestUrl.pathname.slice(assetPrefix.length)));
    return;
  }

  sendFile(response, safeFile(siteRoot, requestUrl.pathname), true);
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Shared footer fixtures listening on http://adovasio.localhost:${port}`);
});
