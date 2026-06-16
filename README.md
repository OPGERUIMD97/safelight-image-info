# Safelight Image Information

Extended image information panel for [Safelight](https://github.com/anthonyreimche/SafeLight), inspired by Nikon NX Studio's Image Information panel.

## What it shows

### 📷 Camera orientation
Visual camera icon that rotates with the photo — shows portrait left, portrait right, landscape, or flipped.

### 📸 Shooting info
Exposure program, shooting mode, shutter speed, aperture, ISO, focal length, exposure compensation.

### 🎯 Autofocus
AF mode, focus distance, AF status — and for **Nikon NEF files**: a visual 39-point AF grid showing the active focus point (orange).

### 🖼 Image
Pixel dimensions, file type, file size.

## Installation

In Safelight → **View → Extensions**, enter:

```
OPGERUIMD97/safelight-image-info
```

## Notes on Nikon AF data

The AF point overlay requires Nikon Makernote data (`PrimaryAFPoint`, `AFPointsUsed`) to be present in `photo.exif`. This depends on whether Safelight's libraw-wasm exposes these fields. If AF data is not available, the panel shows a note with instructions to check which EXIF fields are accessible via the browser console.

The camera orientation indicator works for all cameras based on the photo's rotation value.

## Tested with
- Nikon D5300 (NEF) — full AF overlay when Makernote data available
- General JPEG/RAW — orientation + shooting info

## License

MIT
