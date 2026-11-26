# Brand icons

Every channel (development, nightly, and production) uses the one dark icon. `prod/app-icon.icon` is the Icon Composer project and the source of truth: a black tile with `mark.svg`, the Offgrid mark.

Run `vp run icons:export` from the repository root to regenerate the tracked iOS, Linux, Windows, and web assets. The web exports are also copied to `apps/web/public` for the browser favicon, web app manifest icons, and splash screen. Run `vp run icons:check` to verify that the generated assets and public copies match their sources without changing files.

Exporting requires Icon Composer 2 or newer on macOS. The script selects the newest compatible exporter from Xcode or a standalone Icon Composer installation and pins design generation 26. Set `ICON_COMPOSER_TOOL` to the full path of `Icon Composer.app/Contents/Executables/ictool` to override automatic discovery.

## macOS exports

Icon Composer's command-line exporter does not expose the `macOS pre-Tahoe` preset, so the export script leaves `prod/black-macos-1024.png` unchanged. After changing the project, open it in Icon Composer and export with Platform `macOS pre-Tahoe`, Appearance `Default`, Size `1024pt`, Scale `1×`, saved to `prod/black-macos-1024.png`.

The result must be a 1024×1024 PNG with the classic macOS safe area: the opaque icon body is 824×824, inset 100 pixels on every side, with only the native Icon Composer shadow extending into the surrounding transparent canvas.

Do not edit the generated PNG or ICO files directly.

## Android launcher and splash artwork

Android masks the central 72dp of a 108dp adaptive canvas, and the Android 12+ splash screen masks
the central two thirds of a 288dp canvas, so the Icon Composer exports cannot be used directly:
their rounded-square silhouette gets framed again and the mark is cropped. The Android artwork
is instead rendered from `mark.svg` by `vp run icons:export:android`:

- `apps/mobile/assets/android-icon-foreground.png`: the transparent mark, sized to stay inside the
  safe zone, on a solid black adaptive background.
- `apps/mobile/assets/android-splash-icon-prod.png`: the mark on black, composed into one 288dp
  image so the splash mask reproduces the launcher icon's framing.

Rerun the export after changing `mark.svg`. `android-icon-mark.png` remains a flat silhouette for
Android's monochrome themed icon.
