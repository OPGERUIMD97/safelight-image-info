# Safelight Image Information

One panel for the photo you have selected: how the camera was held, the exposure, the lens, Nikon autofocus points when the file has them, the file itself, and the catalog status.

EXIF Plus is folded into this panel.

## What it shows

- Camera orientation, with an icon that follows the photo's rotation
- Camera make, model and software
- Shutter, aperture, ISO, exposure compensation, metering, program, flash and drive mode
- Lens, focal length (with a 35 mm equivalent when the crop factor is known), and maximum aperture
- Autofocus mode, focus distance, and for Nikon NEF files a 39-point grid when the makernote is present
- Filename, type, size, pixel dimensions, megapixels, capture date and import date
- Rating, colour label, flag and keywords

Empty rows stay hidden. Colours follow the active Safelight theme.

The crop factor is recognised for the common Nikon DX bodies and for Canon APS-C. It needs the camera make and model in the photo's EXIF. A full-frame body stays at its real focal length.

## Installation

In Safelight, open **View → Extensions** and enter:

```
OPGERUIMD97/safelight-image-info
```

The panel starts on the right in Library. Drag it where you want it.

## License

MIT
