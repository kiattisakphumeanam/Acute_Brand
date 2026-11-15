import { MembershipCompare, MembershipHero, MembershipTerms, MembershipTiers } from "@/components/sections/Membership";

export const metadata = { title: "Membership | ACUTE" };

export default function MembershipPage() {
  return (
    <>
      <MembershipHero />
      <MembershipTiers />
      <MembershipCompare />
      <MembershipTerms />
    </>
  );
}
