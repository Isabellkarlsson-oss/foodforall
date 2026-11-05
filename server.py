# Lokal server för Food for All. Starta med: python3 server.py
#
# Fungerar som "python3 -m http.server 8000 --bind 127.0.0.1", men säger
# också åt webbläsaren att alltid fråga servern om en fil har ändrats innan
# den använder sin sparade kopia (Cache-Control: no-cache). Utan det kan
# webbläsaren blanda nya och gamla JS-filer efter en ändring, och då kraschar
# appen redan när den startar.

import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

# Porten kan bytas med t.ex. "python3 server.py 8001".
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8000

# Servera projektmappen, oavsett vilken mapp kommandot körs från.
PROJECT_FOLDER = str(Path(__file__).resolve().parent)


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-cache")
        super().end_headers()


# 127.0.0.1 gör att bara den egna datorn når servern, inte resten av nätverket.
server = ThreadingHTTPServer(("127.0.0.1", PORT), partial(NoCacheHandler, directory=PROJECT_FOLDER))
print(f"Food for All körs på http://localhost:{PORT} – avsluta med Ctrl+C")
try:
    server.serve_forever()
except KeyboardInterrupt:
    print("\nServern är stoppad.")
