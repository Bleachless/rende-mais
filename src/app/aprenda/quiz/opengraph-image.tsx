import { lessonImage, OG_SIZE } from "@/lib/og";

export const alt = "Quiz do Rendinho: quanto você sabe de dinheiro?";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return lessonImage({ kicker: "QUIZ DO RENDINHO", title: "Quanto você sabe de dinheiro?", face: "cheer", arms: "up" });
}
