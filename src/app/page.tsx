import { Simulator } from "@/components/simulator";
import { getRates } from "@/lib/rates";

export default async function Page() {
  const rates = await getRates();
  return <Simulator rates={rates} />;
}
