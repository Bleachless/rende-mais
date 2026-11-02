import { ImageResponse } from "next/og";
import { Mascot, type Arms, type Face } from "@/components/mascot";

// Imagem de compartilhamento do tutorial: o título à esquerda e o Rendinho à direita.
export const OG_SIZE = { width: 1200, height: 630 };

export function lessonImage({ kicker, title, face = "happy", arms = "wave" }: { kicker: string; title: string; face?: Face; arms?: Arms }) {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", gap: 40, padding: "64px 72px", background: "#0a0d12", color: "#e8eef6" }}>
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <div style={{ display: "flex", fontSize: 26, letterSpacing: 6, color: "#3ddc97" }}>{kicker}</div>
          <div style={{ display: "flex", marginTop: 24, fontSize: title.length > 40 ? 60 : 72, fontWeight: 700, lineHeight: 1.08 }}>{title}</div>
          <div style={{ display: "flex", marginTop: 36, fontSize: 28, color: "#8693a6" }}>
            rende<span style={{ color: "#3ddc97" }}>mais</span>&nbsp;· aprenda com o Rendinho
          </div>
        </div>
        <Mascot face={face} arms={arms} size={340} />
      </div>
    ),
    OG_SIZE,
  );
}
