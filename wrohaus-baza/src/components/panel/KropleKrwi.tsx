"use client";

const DRIPS = [
  { left: "4%", delay: "0s", duration: "3.4s", width: "7px" },
  { left: "11%", delay: "0.4s", duration: "4.1s", width: "11px" },
  { left: "18%", delay: "1.1s", duration: "3.2s", width: "6px" },
  { left: "27%", delay: "0.2s", duration: "4.6s", width: "9px" },
  { left: "36%", delay: "1.6s", duration: "3.8s", width: "8px" },
  { left: "44%", delay: "0.7s", duration: "4.3s", width: "12px" },
  { left: "53%", delay: "1.3s", duration: "3.5s", width: "7px" },
  { left: "61%", delay: "0.1s", duration: "4.8s", width: "10px" },
  { left: "69%", delay: "1.8s", duration: "3.1s", width: "6px" },
  { left: "76%", delay: "0.5s", duration: "4s", width: "9px" },
  { left: "84%", delay: "1.4s", duration: "3.7s", width: "8px" },
  { left: "92%", delay: "0.9s", duration: "4.4s", width: "11px" },
];

export function AdminBloodDrips() {
  return (
    <div className="admin-blood" aria-hidden>
      <div className="admin-blood-pool" />
      {DRIPS.map((drip) => (
        <span
          key={drip.left}
          className="admin-blood-drip"
          style={{
            left: drip.left,
            width: drip.width,
            animationDelay: drip.delay,
            animationDuration: drip.duration,
          }}
        />
      ))}
    </div>
  );
}
