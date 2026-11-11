# Blink finder: per-pixel sign-flip flicker, but only in frames where the camera is near-still (global motion small),
# so real motion doesn't count. Saves a heatmap overlaid on a frame and prints which seconds are worst.
import sys, subprocess, numpy as np
from PIL import Image
ff, vid, out = sys.argv[1:4]
W, H = 640, 360
raw = subprocess.run([ff, "-loglevel", "error", "-i", vid, "-vf", f"scale={W}:{H}:flags=area,format=gray", "-f", "rawvideo", "-"], capture_output=True).stdout
f = np.frombuffer(raw, np.uint8).reshape(-1, H, W).astype(np.float32)
glob = np.abs(f[1:] - f[:-1]).mean(axis=(1, 2))
a = f[2:] - f[1:-1]; b = f[1:-1] - f[:-2]
flk = np.minimum(np.abs(a), np.abs(b)) * (np.sign(a) != np.sign(b))
still = glob[1:] < 2.5
heat = (flk[still] > 18).mean(0)
print("still frames:", still.sum(), " pixels blinking >5% of still frames:", (heat > .05).sum())
per = (flk > 18).mean((1, 2)) * 100
for i in np.argsort(-(per * still))[:8]: print(f"  t={(i + 1) / 60:.2f}s blink%={per[i]:.2f}")
base = f[int(np.argmax(still)) + 1]; rgb = np.stack([base] * 3, -1) * .6
hm = np.clip(heat / .1, 0, 1); rgb[..., 0] = np.maximum(rgb[..., 0], hm * 255); rgb[..., 1] *= 1 - hm * .7
Image.fromarray(rgb.astype(np.uint8)).save(out)
