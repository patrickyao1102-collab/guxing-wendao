import sys, importlib
mods = ['maps_yy', 'maps_nw', 'maps_cy', 'maps_xx']
for f in sys.argv[1:]:
    for m in mods:
        try: M = importlib.import_module(m)
        except ModuleNotFoundError: continue
        if hasattr(M, f): getattr(M, f)(); print('ok', f); break
