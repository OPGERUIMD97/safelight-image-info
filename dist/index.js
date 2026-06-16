// ── Safelight Image Information Extension ────────────────────────────────────
// Inspired by Nikon NX Studio's Image Information panel.
// Shows: camera orientation, shooting info, AF point overlay (Nikon NEF).

const S = {
  container: {
    background: "#1C1917", color: "#F4F3EE",
    fontFamily: "system-ui, -apple-system, sans-serif",
    fontSize: 11, padding: "10px 12px",
    height: "100%", overflowY: "auto", boxSizing: "border-box",
  },
  empty: {
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "#B1ADA1", height: "100%",
  },
  sectionTitle: {
    color: "#C15F3C", fontSize: 10, fontWeight: 600,
    letterSpacing: "0.06em", textTransform: "uppercase",
    margin: "12px 0 6px",
  },
  row: {
    display: "flex", justifyContent: "space-between",
    alignItems: "baseline", padding: "3px 0",
    borderBottom: "1px solid #3C3836",
  },
  label: { color: "#B1ADA1", fontSize: 11, flexShrink: 0, marginRight: 8 },
  value: { fontSize: 11, textAlign: "right", color: "#F4F3EE",
           fontVariantNumeric: "tabular-nums" },
  accent: { fontSize: 11, textAlign: "right", color: "#C15F3C",
            fontVariantNumeric: "tabular-nums" },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function Row({ label, value, accent }) {
  if (!value && value !== 0) return null;
  const React = window._slReact;
  return React.createElement("div", { style: S.row },
    React.createElement("span", { style: S.label }, label),
    React.createElement("span", { style: accent ? S.accent : S.value }, value)
  );
}

// Detecteer camera-orientatie via EXIF rotation + breedte/hoogte
function detectOrientation(exif, rotation) {
  const rot = rotation || exif?.orientation || 0;
  if (rot === 90 || rot === 270) return "portrait";
  return "landscape";
}

// Orientatie-indicator SVG — kleine camera-icoon met rotatie-aanduiding
function OrientationIndicator({ orientation, rotation }) {
  const React = window._slReact;
  const rot = rotation || 0;

  // Camera body SVG, geroteerd
  const cameraPath = "M6 6h12v9H6z M9 4h6l1.5 2H7.5z M12 8a3 3 0 1 0 0 6 3 3 0 0 0 0-6z";
  const dotPath    = "M12 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4z";

  // Richting labels
  const labels = {
    0:   { text: "Liggend",        icon: "→" },
    90:  { text: "Portret links",  icon: "↑" },
    180: { text: "Liggend (180°)", icon: "←" },
    270: { text: "Portret rechts", icon: "↓" },
  };
  const info = labels[rot] || labels[0];

  return React.createElement("div", {
    style: {
      background: "#292524", borderRadius: 6, padding: "10px 12px",
      display: "flex", alignItems: "center", gap: 12, marginBottom: 4,
    }
  },
    // Camera-icoon
    React.createElement("svg", {
      width: 48, height: 48, viewBox: "0 0 24 21",
      style: {
        transform: `rotate(${rot}deg)`,
        transition: "transform 0.3s ease",
        flexShrink: 0,
      }
    },
      React.createElement("rect", {
        x: 2, y: 6, width: 20, height: 13, rx: 2,
        fill: "#3C3836", stroke: "#B1ADA1", strokeWidth: 1
      }),
      React.createElement("path", {
        d: "M8 6 L9.5 3 L14.5 3 L16 6",
        fill: "#3C3836", stroke: "#B1ADA1", strokeWidth: 1
      }),
      React.createElement("circle", {
        cx: 12, cy: 13, r: 4,
        fill: "none", stroke: "#B1ADA1", strokeWidth: 1.2
      }),
      React.createElement("circle", {
        cx: 12, cy: 13, r: 2,
        fill: "#C15F3C"
      }),
      React.createElement("rect", {
        x: 17, y: 8, width: 2, height: 2, rx: 0.5,
        fill: "#B1ADA1"
      })
    ),
    // Label
    React.createElement("div", null,
      React.createElement("div", {
        style: { color: "#F4F3EE", fontSize: 12, fontWeight: 600 }
      }, info.text),
      React.createElement("div", {
        style: { color: "#B1ADA1", fontSize: 10, marginTop: 2 }
      }, rot ? `${rot}° gedraaid` : "Standaard richting")
    )
  );
}

// AF-punt overlay — 39-punts schema (Nikon D5300)
// Toont een kleine grid met het actieve AF-punt gemarkeerd
function AFOverlay({ exif }) {
  const React = window._slReact;

  // Nikon Makernote AF velden
  const primaryAF   = exif?.PrimaryAFPoint   || exif?.primaryAFPoint;
  const afPointsUsed = exif?.AFPointsUsed    || exif?.afPointsUsed;
  const afMode      = exif?.AFAreaMode       || exif?.afAreaMode;
  const focusDist   = exif?.FocusDistance    || exif?.focusDistance;

  if (!primaryAF && !afPointsUsed) {
    return React.createElement("div", {
      style: { color: "#57534E", fontSize: 10, textAlign: "center",
               padding: "8px 0", fontStyle: "italic" }
    }, "AF-info niet beschikbaar (geen Nikon Makernote)");
  }

  // Eenvoudige 39-punts visualisatie (7 kolommen × 6 rijen, middelste rij 5)
  // Nikon D5300 39-punt layout
  const COLS = 7, ROWS = 6;
  const CELL = 9;
  const W = COLS * CELL + (COLS - 1) * 2;
  const H = ROWS * CELL + (ROWS - 1) * 2;

  // Bouw punten array
  const points = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      // Middelste rij heeft 5 punten (niet 7)
      if (r === 2 && (c === 0 || c === 6)) continue;
      const idx = points.length + 1;
      const x = c * (CELL + 2);
      const y = r * (CELL + 2);
      const isPrimary = primaryAF && String(primaryAF).includes(String(idx));
      points.push({ x, y, idx, isPrimary });
    }
  }

  return React.createElement("div", null,
    React.createElement("div", {
      style: {
        background: "#0D0B0A", borderRadius: 4, padding: 8,
        display: "inline-block", border: "1px solid #3C3836",
      }
    },
      React.createElement("svg", { width: W, height: H },
        ...points.map(p =>
          React.createElement("rect", {
            key: p.idx,
            x: p.x, y: p.y, width: CELL, height: CELL, rx: 1,
            fill:   p.isPrimary ? "#C15F3C" : "#2A2520",
            stroke: p.isPrimary ? "#E07050" : "#57534E",
            strokeWidth: p.isPrimary ? 1.5 : 0.5,
          })
        )
      )
    ),
    primaryAF && React.createElement("div", {
      style: { color: "#B1ADA1", fontSize: 10, marginTop: 4 }
    }, `Actief punt: ${primaryAF}`)
  );
}

// ── Hoofd panel ───────────────────────────────────────────────────────────────
export function activate(api) {
  const { react: React, stores } = api;
  const { useState, useEffect } = React;

  // Bewaar React ref voor sub-componenten
  window._slReact = React;

  const ce = (type, props, ...ch) => React.createElement(type, props, ...ch);

  function ImageInfoPanel() {
    const [photo, setPhoto] = useState(null);

    useEffect(() => {
      const store = stores.useCatalogStore;
      const sync = state => {
        const id = state.activePhotoId;
        if (!id) { setPhoto(null); return; }
        setPhoto(state.photos.find(p => p.id === id) || null);
      };
      const unsub = store.subscribe(sync);
      sync(store.getState());
      return () => { unsub(); delete window._slReact; };
    }, []);

    if (!photo) {
      return ce("div", { style: { ...S.container, ...S.empty } },
        "Geen foto geselecteerd");
    }

    const e   = photo.exif || {};
    const rot = photo.rotation || 0;

    // Belichtingsprogramma vertaling
    const programs = {
      0: "Niet gedefinieerd", 1: "Handmatig", 2: "Programma",
      3: "Diafragmavoorkeur", 4: "Sluitertijdvoorkeur",
      5: "Creative", 6: "Action", 7: "Portret", 8: "Landschap",
    };

    const shootingModes = {
      0: "Enkelbeeeld", 1: "Continue laag", 2: "Continue hoog",
      3: "Zelfontspanner", 4: "Afstandsbediening",
    };

    const afModes = {
      0: "AF-S", 1: "AF-C", 2: "AF-A", 3: "MF",
      4: "Focus Tracking",
    };

    const expProg = e.exposureProgram != null
      ? (programs[e.exposureProgram] || `Modus ${e.exposureProgram}`) : null;

    const shootMode = e.ShootingMode != null
      ? (shootingModes[e.ShootingMode] || null) : null;

    const afMode = e.FocusMode || e.AFAreaMode || e.afAreaMode || null;

    const focusDist = e.FocusDistance || e.focusDistance;
    const focusDistStr = focusDist
      ? (focusDist >= 100
          ? `${(focusDist / 100).toFixed(1)} m`
          : `${focusDist} cm`)
      : null;

    // Nikon specifieke velden
    const isNikon   = String(e.make || "").toUpperCase().includes("NIKON");
    const hasAFData = isNikon && (e.PrimaryAFPoint || e.AFPointsUsed ||
                                   e.primaryAFPoint || e.afPointsUsed);

    return ce("div", { style: S.container },

      // Orientatie indicator
      ce("div", { style: S.sectionTitle }, "Camerastand"),
      ce(OrientationIndicator, { orientation: detectOrientation(e, rot), rotation: rot }),

      // Opname info
      ce("div", { style: S.sectionTitle }, "Opname"),
      ce(Row, { label: "Belichtingsprogramma", value: expProg }),
      ce(Row, { label: "Opnamemodus",           value: shootMode }),
      ce(Row, { label: "Sluitertijd",
                value: e.shutter ? (e.shutter >= 1 ? `${e.shutter}s` : `1/${Math.round(1/e.shutter)}`) : null }),
      ce(Row, { label: "Diafragma",    value: e.aperture ? `f/${e.aperture}` : null }),
      ce(Row, { label: "ISO",          value: e.iso ? `ISO ${e.iso}` : null }),
      ce(Row, { label: "Brandpunt",    value: e.focalLength ? `${e.focalLength} mm` : null }),
      ce(Row, { label: "Belichting +/-",
                value: e.exposureCompensation != null
                  ? (e.exposureCompensation >= 0
                      ? `+${e.exposureCompensation} EV`
                      : `${e.exposureCompensation} EV`)
                  : null }),

      // Autofocus
      ce("div", { style: S.sectionTitle }, "Autofocus"),
      ce(Row, { label: "AF-modus",     value: afMode }),
      ce(Row, { label: "Focusafstand", value: focusDistStr }),
      ce(Row, { label: "AF status",
                value: e.AutoFocus || e.autoFocus || e.ContrastDetectAFInFocus || null }),

      // AF overlay (Nikon)
      ce("div", { style: { marginTop: 8 } },
        ce(AFOverlay, { exif: e })
      ),

      // Afbeelding
      ce("div", { style: S.sectionTitle }, "Afbeelding"),
      ce(Row, { label: "Afmetingen",
                value: (photo.width && photo.height)
                  ? `${photo.width.toLocaleString()} × ${photo.height.toLocaleString()} px`
                  : null }),
      ce(Row, { label: "Bestandstype", value: photo.mimeType }),
      ce(Row, { label: "Bestandsgrootte",
                value: photo.fileSize
                  ? photo.fileSize >= 1024*1024
                    ? `${(photo.fileSize/1024/1024).toFixed(1)} MB`
                    : `${Math.round(photo.fileSize/1024)} KB`
                  : null }),

      // Debug — alleen als geen Makernote data
      !hasAFData && isNikon && ce("div", {
        style: { marginTop: 12, padding: "6px 8px", background: "#292524",
                 borderRadius: 4, color: "#B1ADA1", fontSize: 10 }
      }, "ℹ️ Nikon Makernote AF-data niet beschikbaar in photo.exif. " +
         "Open F12 → Console en typ: " +
         "window.safelight.stores.useCatalogStore.getState().photos[0].exif " +
         "om beschikbare velden te zien.")
    );
  }

  api.registerPanel({
    id:              "safelight-image-info.panel",
    title:           "Image Information",
    component:       ImageInfoPanel,
    defaultLocation: "right",
  });
}

export function deactivate() {
  delete window._slReact;
}
