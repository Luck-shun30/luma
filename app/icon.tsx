import { ImageResponse } from "next/og";

export const size = {
  width: 512,
  height: 512,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(145deg, rgba(243,179,76,1) 0%, rgba(19,43,56,1) 88%)",
          color: "#f8f5ee",
          fontSize: 180,
          fontWeight: 700,
          letterSpacing: "-0.08em",
        }}
      >
        L
      </div>
    ),
    size,
  );
}
