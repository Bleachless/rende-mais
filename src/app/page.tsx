import type { Metadata } from "next";
import { Learn } from "@/components/learn";
import { Simulator } from "@/components/simulator";
import { getRates } from "@/lib/rates";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default async function Page() {
  const rates = await getRates();
  return (
    <Simulator rates={rates}>
      <Learn rates={rates} />
    </Simulator>
  );
}
