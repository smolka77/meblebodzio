import { Suspense } from "react";
import AccountPage from "./ZawartoscKonta";

export default function KontoPage() {
  return (
    <Suspense fallback={<div className="py-16 text-center text-sand">Ładowanie...</div>}>
      <AccountPage />
    </Suspense>
  );
}
