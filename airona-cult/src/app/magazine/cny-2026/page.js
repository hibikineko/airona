import MagazineClient from "./MagazineClient";
import { cnyContent } from "./content";
import { cnyTheme } from "./theme";

export const metadata = {
  title: "Airona Files - CNY 2026",
  description: "Chinese New Year 2026 Special Edition - Year of the Horse",
};

export default function CNYMagazinePage() {
  return <MagazineClient content={cnyContent} theme={cnyTheme} />;
}
