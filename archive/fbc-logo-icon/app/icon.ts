import { ImageResponse } from "next/og"

export const size = {
  width: 32,
  height: 32,
}
export const contentType = "image/png"

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#1a1a1a",
        borderRadius: "6px",
      }}
    >
      <div
        style={{
          width: "96%",
          height: "96%",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "radial-gradient(circle at 40% 40%, #2a2a2a, #1a1a1a)",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: "50%",
            height: "50%",
            clipPath: "path('M 20.8 6.4 A 12.8 12.8 0 0 0 11.2 11.2 L 16 16 Z')",
            background: "rgba(255, 255, 255, 0.1)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "8%",
            width: "18%",
            height: "18%",
            borderRadius: "50%",
            background: "#ff5b04",
          }}
        />
      </div>
    </div>,
    {
      ...size,
    },
  )
}
