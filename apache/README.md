# Shared footer Apache setup

The files in `../shared/footer/` are the single source of truth for the
Adovasio footer. Apache exposes them through the same internal URL namespace on
all six vhosts and expands the two SSI directives embedded in each HTML page.

This is a one-time server setup. Footer HTML, CSS, JavaScript, project data, and
image changes under the `Main-Site` checkout are read directly on the next
request and do not require changes or deployments in the consumer repositories.

## Install

1. Edit the six `Define` paths at the top of
   `adovasio-shared-footer.conf` so they point to the live Git checkouts.
2. Enable the required Apache modules:

   ```sh
   sudo a2enmod alias filter headers include mime
   ```

3. Symlink the tracked configuration into Apache and enable it:

   ```sh
   sudo ln -s /absolute/path/to/Main-Site/apache/adovasio-shared-footer.conf \
     /etc/apache2/conf-available/adovasio-shared-footer.conf
   sudo a2enconf adovasio-shared-footer
   sudo apachectl configtest
   sudo systemctl reload apache2
   ```

If the destination symlink already exists, leave it in place. Do not copy the
configuration into each vhost.

## Verify on the VM

Run these checks after the one-time install:

```sh
curl -fsS https://adovasio.com/ | grep -F 'data-shared-footer'
curl -fsS https://index.adovasio.com/ | grep -F 'data-shared-footer'
curl -fsS https://soc.adovasio.com/ | grep -F 'data-shared-footer'
curl -fsS https://time.adovasio.com/ | grep -F 'data-shared-footer'
curl -fsS https://tools.adovasio.com/ | grep -F 'data-shared-footer'
curl -fsS https://connect.adovasio.com/ | grep -F 'data-shared-footer'
```

The browser response must contain the expanded `<footer>` and must not contain
the literal `<!--#include ... -->` directive. A request to
`/_adovasio-shared/footer/footer.css` on any of the six hosts should return the
same canonical file.

## Security and caching

`IncludesNOEXEC` allows SSI file inclusion but disables SSI command and CGI
execution. SSI response validators are disabled because a shared include can
change without changing the consumer HTML file. The HTML and stable shared URLs
are sent with `Cache-Control: no-cache, must-revalidate`, so future Main-Site
pulls are not hidden behind stale browser or proxy cache versions.
