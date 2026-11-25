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
  const well = "var(--color-surface-0)";

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
    note: {
      color: muted,
      fontSize: 10,
      textAlign: "center",
      padding: "8px 0",
      fontStyle: "italic",
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
      0: ["Liggend", "Standaard richting"],
      90: ["Portret links", "90° gedraaid"],
      180: ["Liggend", "180° gedraaid"],
      270: ["Portret rechts", "270° gedraaid"],
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

  function AFOverlay({ exif }) {
    const primary = exif.PrimaryAFPoint ?? exif.primaryAFPoint;
    const used = exif.AFPointsUsed ?? exif.afPointsUsed;
    if (blank(primary) && blank(used)) {
      return React.createElement("div", { style: S.note },
        "Geen Nikon-scherpstelpunten in de EXIF.");
    }

    const cols = 7;
    const rows = 6;
    const cell = 9;
    const gap = 2;
    const width = cols * cell + (cols - 1) * gap;
    const height = rows * cell + (rows - 1) * gap;
    const points = [];
    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        if (row === 2 && (col === 0 || col === 6)) continue;
        const index = points.length + 1;
        points.push({
          index,
          x: col * (cell + gap),
          y: row * (cell + gap),
          active: primary != null && String(primary).includes(String(index)),
        });
      }
    }

    return React.createElement("div", { style: { padding: "8px 0 2px" } },
      React.createElement("div", {
        style: {
          background: well,
          borderRadius: 4,
          padding: 8,
          display: "inline-block",
          border: `1px solid ${line}`,
        },
      },
        React.createElement("svg", { width, height },
          points.map((point) => React.createElement("rect", {
            key: point.index,
            x: point.x,
            y: point.y,
            width: cell,
            height: cell,
            rx: 1,
            fill: point.active ? accent : card,
            stroke: point.active ? accent : muted,
            strokeWidth: point.active ? 1.5 : 0.5,
          })),
        ),
      ),
      blank(primary) ? null : React.createElement("div", {
        style: { color: muted, fontSize: 10, marginTop: 4 },
      }, `Actief punt: ${primary}`),
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
    return date.toLocaleString("nl-NL", {
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
        "Geen foto geselecteerd");
    }

    const exif = photo.exif || {};
    const make = textOf(exif, ["make", "Make"]);
    const model = textOf(exif, ["model", "Model"]);
    const crop = cropFactor(make, model);
    const focal = Number(exif.focalLength ?? exif.FocalLength);
    const focalText = Number.isFinite(focal) && focal > 0
      ? (crop === 1 ? `${focal} mm` : `${focal} mm (${Math.round(focal * crop)} mm kleinbeeld)`)
      : null;
    const aperture = blank(exif.aperture) ? null : `f/${exif.aperture}`;
    const shutter = formatShutter(exif.shutter);
    const iso = blank(exif.iso) ? null : `ISO ${exif.iso}`;
    const summary = [aperture, shutter, iso].filter(Boolean).join("  ·  ");
    const width = Number(photo.width);
    const height = Number(photo.height);
    const dimensions = width > 0 && height > 0 ? `${grouped(width)} × ${grouped(height)} px` : null;
    const megapixels = width > 0 && height > 0 ? `${((width * height) / 1e6).toFixed(1)} MP` : null;
    const focusDistance = Number(exif.FocusDistance ?? exif.focusDistance);
    const focusText = Number.isFinite(focusDistance) && focusDistance > 0
      ? (focusDistance >= 100 ? `${(focusDistance / 100).toFixed(1)} m` : `${focusDistance} cm`)
      : null;
    const nikon = String(make || "").toUpperCase().includes("NIKON");
    const maxAperture = exif.maxApertureValue ?? exif.MaxApertureValue;

    return React.createElement("div", { style: S.container },
      summary ? React.createElement("div", { style: S.summary }, summary) : null,

      React.createElement(Section, { title: "Camerastand" },
        React.createElement(Orientation, { rotation: Number(photo.rotation) || 0 }),
      ),

      React.createElement(Section, { title: "Camera" },
        React.createElement(Row, { label: "Merk", value: make }),
        React.createElement(Row, { label: "Model", value: model, accent: true }),
        React.createElement(Row, { label: "Software", value: textOf(exif, ["software", "Software"]) }),
      ),

      React.createElement(Section, { title: "Belichting" },
        React.createElement(Row, { label: "Sluitertijd", value: shutter, accent: true }),
        React.createElement(Row, { label: "Diafragma", value: aperture, accent: true }),
        React.createElement(Row, { label: "ISO", value: iso, accent: true }),
        React.createElement(Row, { label: "Belichting +/-", value: formatEv(exif.exposureCompensation) }),
        React.createElement(Row, { label: "Meting", value: textOf(exif, ["meteringMode", "MeteringMode"]) }),
        React.createElement(Row, {
          label: "Programma",
          value: named(exif.exposureProgram, {
            0: "Niet gedefinieerd",
            1: "Handmatig",
            2: "Programma",
            3: "Diafragmavoorkeur",
            4: "Sluitertijdvoorkeur",
            5: "Creative",
            6: "Action",
            7: "Portret",
            8: "Landschap",
          }),
        }),
        React.createElement(Row, { label: "Flits", value: textOf(exif, ["flash", "Flash"]) }),
        React.createElement(Row, {
          label: "Opnamemodus",
          value: named(exif.ShootingMode ?? exif.shootingMode, {
            0: "Enkelbeeld",
            1: "Continue laag",
            2: "Continue hoog",
            3: "Zelfontspanner",
            4: "Afstandsbediening",
          }),
        }),
      ),

      React.createElement(Section, { title: "Lens" },
        React.createElement(Row, {
          label: "Lens",
          value: textOf(exif, ["lensModel", "lens", "LensModel", "Lens"]),
          accent: true,
        }),
        React.createElement(Row, { label: "Brandpunt", value: focalText }),
        crop === 1 ? null : React.createElement(Row, { label: "Cropfactor", value: `${crop}×` }),
        React.createElement(Row, {
          label: "Min. diafragma",
          value: blank(maxAperture) ? null : `f/${maxAperture}`,
        }),
      ),

      React.createElement(Section, { title: "Autofocus" },
        React.createElement(Row, {
          label: "AF-modus",
          value: textOf(exif, ["FocusMode", "focusMode", "AFAreaMode", "afAreaMode"]),
        }),
        React.createElement(Row, { label: "Focusafstand", value: focusText }),
        React.createElement(Row, {
          label: "AF-status",
          value: textOf(exif, ["AutoFocus", "autoFocus", "ContrastDetectAFInFocus"]),
        }),
        nikon ? React.createElement(AFOverlay, { exif }) : null,
      ),

      React.createElement(Section, { title: "Bestand" },
        React.createElement(Row, { label: "Bestandsnaam", value: photo.filename }),
        React.createElement(Row, { label: "Type", value: photo.mimeType }),
        React.createElement(Row, { label: "Grootte", value: formatBytes(photo.fileSize) }),
        React.createElement(Row, { label: "Afmetingen", value: dimensions }),
        React.createElement(Row, { label: "Megapixels", value: megapixels, accent: true }),
        React.createElement(Row, { label: "Opnamedatum", value: formatDate(photo.dateCreated) }),
        React.createElement(Row, { label: "Geïmporteerd", value: formatDate(photo.dateImported) }),
      ),

      React.createElement(Section, { title: "Status" },
        React.createElement(Row, {
          label: "Beoordeling",
          value: photo.rating ? "★".repeat(photo.rating) : null,
          accent: true,
        }),
        React.createElement(Row, {
          label: "Label",
          value: photo.colorLabel && photo.colorLabel !== "none" ? photo.colorLabel : null,
        }),
        React.createElement(Row, {
          label: "Vlag",
          value: photo.flag && photo.flag !== "none" ? photo.flag : null,
        }),
        React.createElement(Row, {
          label: "Trefwoorden",
          value: Array.isArray(photo.keywords) && photo.keywords.length ? photo.keywords.join(", ") : null,
        }),
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
