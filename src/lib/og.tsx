import * as React from "react";

type OgVariant = "default" | "plush" | "jewelry" | "gifts" | "guide";

const variantStyles: Record<
  OgVariant,
  {
    accent: string;
    panel: string;
    badge: string;
  }
> = {
  default: {
    accent: "linear-gradient(135deg, #ff8aa1 0%, #ff6d88 100%)",
    panel: "linear-gradient(180deg, #fff7f9 0%, #fffdfd 100%)",
    badge: "#ff6d88",
  },
  plush: {
    accent: "linear-gradient(135deg, #ff9ab2 0%, #ff7e95 100%)",
    panel: "linear-gradient(180deg, #fff8fa 0%, #fffdfd 100%)",
    badge: "#ff6d88",
  },
  jewelry: {
    accent: "linear-gradient(135deg, #f6c95c 0%, #ef9f3f 100%)",
    panel: "linear-gradient(180deg, #fffaf0 0%, #fffdfd 100%)",
    badge: "#b97b25",
  },
  gifts: {
    accent: "linear-gradient(135deg, #92c5ff 0%, #6ea7ff 100%)",
    panel: "linear-gradient(180deg, #f4f9ff 0%, #fffdfd 100%)",
    badge: "#4177d8",
  },
  guide: {
    accent: "linear-gradient(135deg, #a88cff 0%, #7d68ff 100%)",
    panel: "linear-gradient(180deg, #f7f3ff 0%, #fffdfd 100%)",
    badge: "#6f57ff",
  },
};

export const ogSize = {
  width: 1200,
  height: 630,
};

export const ogContentType = "image/png";

export function createOgCard(input: {
  eyebrow: string;
  title: string;
  description?: string;
  locale: string;
  variant?: OgVariant;
  footer?: string;
}) {
  const variant = variantStyles[input.variant ?? "default"];

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        overflow: "hidden",
        background: "#fffafc",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at top left, rgba(255, 223, 231, 0.95), transparent 35%), radial-gradient(circle at bottom right, rgba(255, 241, 245, 0.9), transparent 30%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          right: -120,
          top: -80,
          width: 420,
          height: 420,
          borderRadius: 9999,
          background: variant.accent,
          opacity: 0.22,
        }}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          padding: "58px 64px",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
              maxWidth: 820,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                fontSize: 24,
                fontWeight: 700,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: variant.badge,
              }}
            >
              {input.eyebrow}
            </div>

            <div
              style={{
                fontSize: 62,
                lineHeight: 1.08,
                fontWeight: 800,
                color: "#2f2b32",
                letterSpacing: "-0.04em",
                display: "flex",
              }}
            >
              {input.title}
            </div>

            {input.description ? (
              <div
                style={{
                  marginTop: 6,
                  fontSize: 28,
                  lineHeight: 1.45,
                  color: "#615c64",
                  display: "flex",
                  maxWidth: 900,
                }}
              >
                {input.description}
              </div>
            ) : null}
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minWidth: 180,
              borderRadius: 32,
              padding: "22px 24px",
              background: variant.panel,
              boxShadow: "0 18px 42px -28px rgba(85, 58, 73, 0.35)",
              border: "1px solid rgba(255, 255, 255, 0.78)",
            }}
          >
            <div
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: "#8b838d",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              Locale
            </div>
            <div
              style={{
                marginTop: 10,
                fontSize: 34,
                fontWeight: 800,
                color: "#2f2b32",
                letterSpacing: "-0.03em",
              }}
            >
              {input.locale}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            gap: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <div
              style={{
                fontSize: 44,
                fontWeight: 800,
                color: "#2f2b32",
                letterSpacing: "-0.05em",
              }}
            >
              Northstar Atelier
            </div>
            <div
              style={{
                fontSize: 22,
                color: "#8a818d",
              }}
            >
              {input.footer ?? "Boutique plush toys, jewelry, gifts and evergreen buying guides."}
            </div>
          </div>

          <div
            style={{
              width: 220,
              height: 16,
              borderRadius: 9999,
              background: variant.accent,
              boxShadow: "0 18px 40px -26px rgba(255, 109, 136, 0.7)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
