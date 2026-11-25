// Image Information for Safelight.
// Orientation, exposure, lens, Nikon autofocus, file details and catalog status.
// React comes from the host. Colours come from the active theme.

export function activate(api) {
  const React = api.react;
  const { useState, useEffect } = React;

  const ink = "var(--color-text-primary)";
  const muted = "var(--color-text-muted)";
  const accent = "var(--color-accent)";
  const line = "var(--color-border-subtle)";
  const card = "var(--color-surface-3)";

  const S = {
    container: {
      color: ink,
      fontSize: 11,
      padding: "10px 12px",
      height: "100%",
      overflowY: "auto",
      boxSizing: "border-box",
    },
    empty: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "100%",
      color: muted,
    },
    summary: {
      background: card,
      color: ink,
      borderRadius: 4,
      padding: "8px 10px",
      marginBottom: 8,
      fontSize: 12,
      textAlign: "center",
      letterSpacing: "0.03em",
    },
    sectionHeader: {
      display: "flex",
      alignItems: "center",
      gap: 6,
      padding: "8px 0 3px",
      cursor: "pointer",
      color: accent,
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: "0.04em",
      textTransform: "uppercase",
      userSelect: "none",
    },
    row: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "baseline",
      gap: 12,
      padding: "3px 0",
      borderBottom: `1px solid ${line}`,
    },
    label: { color: muted, flexShrink: 0 },
    value: {
      textAlign: "right",
      fontVariantNumeric: "tabular-nums",
      overflowWrap: "anywhere",
    },
};

  const blank = (value) => value == null || value === "" || value === "—";

  function Row({ label, value, accent: emphasize }) {
    if (blank(value)) return null;
    return React.createElement("div", { style: S.row },
      React.createElement("span", { style: S.label }, label),
      React.createElement("span", {
        style: { ...S.value, color: emphasize ? accent : ink },
      }, value),
    );
  }

  function Section({ title, children }) {
    const [open, setOpen] = useState(true);
    return React.createElement("div", null,
      React.createElement("div", {
        style: S.sectionHeader,
        onClick: () => setOpen((current) => !current),
      },
        React.createElement("span", { style: { fontSize: 9 } }, open ? "▾" : "▸"),
        title,
      ),
      open ? React.createElement("div", null, children) : null,
    );
  }

  function Orientation({ rotation }) {
    const rot = [0, 90, 180, 270].includes(rotation) ? rotation : 0;
    const labels = {
      0: ["Landscape", "Normal orientation"],
      90: ["Portrait left", "Rotated 90°"],
      180: ["Landscape", "Rotated 180°"],
      270: ["Portrait right", "Rotated 270°"],
    };
    const [title, detail] = labels[rot];
    return React.createElement("div", {
      style: {
        background: card,
        borderRadius: 6,
        padding: "10px 12px",
        display: "flex",
        alignItems: "center",
        gap: 12,
      },
    },
      React.createElement("svg", {
        width: 48,
        height: 42,
        viewBox: "0 0 24 21",
        style: { transform: `rotate(${rot}deg)`, transition: "transform 0.3s ease", flexShrink: 0 },
      },
        React.createElement("rect", {
          x: 2, y: 6, width: 20, height: 13, rx: 2,
          fill: card, stroke: muted, strokeWidth: 1,
        }),
        React.createElement("path", {
          d: "M8 6 L9.5 3 L14.5 3 L16 6",
          fill: card, stroke: muted, strokeWidth: 1,
        }),
        React.createElement("circle", {
          cx: 12, cy: 13, r: 4,
          fill: "none", stroke: muted, strokeWidth: 1.2,
        }),
        React.createElement("circle", { cx: 12, cy: 13, r: 2, fill: accent }),
        React.createElement("rect", {
          x: 17, y: 8, width: 2, height: 2, rx: 0.5, fill: muted,
        }),
      ),
      React.createElement("div", null,
        React.createElement("div", { style: { fontSize: 12, fontWeight: 600 } }, title),
        React.createElement("div", { style: { color: muted, fontSize: 10, marginTop: 2 } }, detail),
      ),
    );
  }

  function formatShutter(value) {
    if (blank(value)) return null;
    const speed = Number(value);
    if (!Number.isFinite(speed) || speed <= 0) return String(value);
    if (speed >= 1) return `${speed}s`;
    return `1/${Math.round(1 / speed)}`;
  }

  function formatEv(value) {
    if (blank(value)) return null;
    const ev = Number(value);
    if (!Number.isFinite(ev)) return String(value);
    return ev >= 0 ? `+${ev} EV` : `${ev} EV`;
  }

  function grouped(value) {
    return String(Math.round(value)).replace(/\B(?=(\d{3})+(?!\d))/g, "\u202f");
  }

  function formatDate(value) {
    if (blank(value)) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatBytes(value) {
    const bytes = Number(value);
    if (!Number.isFinite(bytes) || bytes <= 0) return null;
    if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    return `${Math.round(bytes / 1024)} KB`;
  }

  function textOf(exif, keys) {
    for (const key of keys) {
      const value = exif[key];
      if (!blank(value)) return String(value);
    }
    return null;
  }

  function cropFactor(make, model) {
    const name = `${make || ""} ${model || ""}`.toUpperCase();
    if (!name.trim()) return 1;
    if ([
      "D3000", "D3100", "D3200", "D3300", "D3400", "D3500",
      "D5000", "D5100", "D5200", "D5300", "D5500", "D5600",
      "D7000", "D7100", "D7200", "D7500", "D500",
    ].some((modelName) => name.includes(modelName))) return 1.5;
    if (name.includes("CANON") && !["5D", "6D", "1D", "R5", "R6"].some((fullFrame) => name.includes(fullFrame))) {
      return 1.6;
    }
    return 1;
  }

  function named(value, names) {
    if (blank(value)) return null;
    if (typeof value === "number" || /^\d+$/.test(String(value))) {
      const index = Number(value);
      return names[index] || String(value);
    }
    return String(value);
  }

  function ImageInfoPanel() {
    const [photo, setPhoto] = useState(null);

    useEffect(() => {
      const store = api.stores.useCatalogStore;
      const sync = (state) => {
        const id = state.activePhotoId;
        if (!id) {
          setPhoto(null);
          return;
        }
        setPhoto(state.photos.find((item) => item.id === id) || null);
      };
      const unsubscribe = store.subscribe(sync);
      sync(store.getState());
      return unsubscribe;
    }, []);

    if (!photo) {
      return React.createElement("div", { style: { ...S.container, ...S.empty } },
        "No photo selected");
    }

    const exif = photo.exif || {};
    const make = textOf(exif, ["cameraMake", "make", "Make"]);
    const model = textOf(exif, ["cameraModel", "model", "Model"]);
    const focal = Number(exif.focalLength);
    const focal35 = Number(exif.focalLength35mm);
    const crop = Number.isFinite(focal) && focal > 0 && Number.isFinite(focal35) && focal35 > 0
      ? Math.round((focal35 / focal) * 10) / 10
      : cropFactor(make, model);
    const equivalent = Number.isFinite(focal35) && focal35 > 0
      ? focal35
      : (crop !== 1 && Number.isFinite(focal) && focal > 0 ? Math.round(focal * crop) : null);
    const focalText = Number.isFinite(focal) && focal > 0
      ? (equivalent && equivalent !== focal ? `${focal} mm (${equivalent} mm equiv.)` : `${focal} mm`)
      : null;
    const aperture = blank(exif.aperture) ? null : `f/${exif.aperture}`;
    const shutter = textOf(exif, ["shutterSpeed"]) || formatShutter(exif.shutter);
    const iso = blank(exif.iso) ? null : `ISO ${exif.iso}`;
    const summary = [aperture, shutter, iso].filter(Boolean).join("  ·  ");
    const width = Number(photo.width);
    const height = Number(photo.height);
    const dimensions = width > 0 && height > 0 ? `${grouped(width)} × ${grouped(height)} px` : null;
    const megapixels = width > 0 && height > 0 ? `${((width * height) / 1e6).toFixed(1)} MP` : null;
    const focusDistance = Number(exif.subjectDistance);
    const focusText = Number.isFinite(focusDistance) && focusDistance > 0
      ? (focusDistance >= 1 ? `${focusDistance} m` : `${Math.round(focusDistance * 100)} cm`)
      : null;
    const maxAperture = exif.maxAperture;
    const afMode = textOf(exif, ["focusMode", "FocusMode", "AFMode", "afMode", "AFAreaMode", "afAreaMode"]);

    return React.createElement("div", { style: S.container },
      summary ? React.createElement("div", { style: S.summary }, summary) : null,

      React.createElement(Section, { title: "Orientation" },
        React.createElement(Orientation, { rotation: Number(photo.rotation) || 0 }),
      ),

      React.createElement(Section, { title: "Camera" },
        React.createElement(Row, { label: "Make", value: make }),
        React.createElement(Row, { label: "Model", value: model, accent: true }),
        React.createElement(Row, { label: "Software", value: textOf(exif, ["software", "Software"]) }),
      ),

      React.createElement(Section, { title: "Exposure" },
        React.createElement(Row, { label: "Shutter", value: shutter, accent: true }),
        React.createElement(Row, { label: "Aperture", value: aperture, accent: true }),
        React.createElement(Row, { label: "ISO", value: iso, accent: true }),
        React.createElement(Row, { label: "Exposure comp.", value: formatEv(exif.exposureCompensation) }),
        React.createElement(Row, { label: "Metering", value: textOf(exif, ["meteringMode", "MeteringMode"]) }),
        React.createElement(Row, {
          label: "Program",
          value: named(exif.exposureProgram, {
            0: "Not defined",
            1: "Manual",
            2: "Program",
            3: "Aperture priority",
            4: "Shutter priority",
            5: "Creative",
            6: "Action",
            7: "Portrait",
            8: "Landscape",
          }),
        }),
        React.createElement(Row, { label: "Flash", value: textOf(exif, ["flash", "Flash"]) }),
        React.createElement(Row, { label: "White balance", value: textOf(exif, ["whiteBalance"]) }),
        React.createElement(Row, { label: "Exposure mode", value: textOf(exif, ["exposureMode"]) }),
      ),

      React.createElement(Section, { title: "Lens" },
        React.createElement(Row, {
          label: "Lens",
          value: textOf(exif, ["lensModel", "lens", "LensModel", "Lens"]),
          accent: true,
        }),
        React.createElement(Row, { label: "Focal length", value: focalText }),
        crop === 1 ? null : React.createElement(Row, { label: "Crop factor", value: `${crop}×` }),
        React.createElement(Row, {
          label: "Max aperture",
          value: blank(maxAperture) ? null : `f/${maxAperture}`,
        }),
        React.createElement(Row, { label: "Subject distance", value: focusText }),
      ),

      afMode ? React.createElement(Section, { title: "Autofocus" },
        React.createElement(Row, { label: "AF mode", value: afMode }),
      ) : null,

      React.createElement(Section, { title: "File" },
        React.createElement(Row, { label: "Filename", value: photo.filename }),
        React.createElement(Row, { label: "Type", value: photo.mimeType }),
        React.createElement(Row, { label: "Size", value: formatBytes(photo.fileSize) }),
        React.createElement(Row, { label: "Dimensions", value: dimensions }),
        React.createElement(Row, { label: "Megapixels", value: megapixels, accent: true }),
        React.createElement(Row, { label: "Captured", value: formatDate(photo.dateCreated) }),
        React.createElement(Row, { label: "Imported", value: formatDate(photo.dateImported) }),
      ),
    );
  }

  api.registerPanel({
    id: "safelight-image-info.panel",
    title: "Image Information",
    component: ImageInfoPanel,
    defaultDock: { module: "library", direction: "right", order: 80, width: 300 },
  });
}

export function deactivate() {}
