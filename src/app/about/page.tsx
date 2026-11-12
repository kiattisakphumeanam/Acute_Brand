import { Lookbook } from "@/components/sections/Lookbook";
import { Philosophy } from "@/components/sections/Philosophy";

export const metadata = { title: "About us — ACUTE" };

export default function AboutPage() {
  return (
    <div>
      <Philosophy />
      <Lookbook />
    </div>
  );
}
