import { ImageResponse } from "next/og";
import { IconTent } from "@tabler/icons-react";

// Route segment config
export const runtime = "edge";

// Image metadata
export const size = {
  width: 180,
  height: 180,
};

// Image generation
export default function AppIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 120,
          background: "#f59e0b",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          borderRadius: "50%",
        }}
      >
        <IconTent size={120} />
      </div>
    ),
    {
      ...size,
    }
  );
}
