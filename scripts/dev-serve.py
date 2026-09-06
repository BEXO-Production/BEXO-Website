import http.server
import functools

ROOT = "/Users/kavin/Documents/BEXO/BEXO-Website"


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
        self.send_header("Pragma", "no-cache")
        super().end_headers()


Handler = functools.partial(NoCacheHandler, directory=ROOT)
httpd = http.server.ThreadingHTTPServer(("0.0.0.0", 4173), Handler)
httpd.serve_forever()
