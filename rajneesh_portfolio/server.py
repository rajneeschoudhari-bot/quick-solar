import os
import sys
from http.server import HTTPServer, SimpleHTTPRequestHandler

PORT = 5050
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class PortfolioHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

if __name__ == '__main__':
    # Ensure UTF-8 stdout if possible
    if sys.platform.startswith('win'):
        try:
            sys.stdout.reconfigure(encoding='utf-8')
        except Exception:
            pass

    server_address = ('', PORT)
    httpd = HTTPServer(server_address, PortfolioHandler)
    print("============================================================")
    print("RAJNEESH CHOUDHARY - SOLAR & ELECTRICAL ENGINEER PORTFOLIO")
    print(f"Running locally on: http://localhost:{PORT}")
    print(f"Serving directory: {DIRECTORY}")
    print("============================================================")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
