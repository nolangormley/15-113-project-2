import dynamic from "next/dynamic";
import "@/lib/widgets"; // Auto-bootstrap all registered widget modules

// Dashboard relies heavily on DOM globals (window/navigator) and react-grid-layout
const DashboardGrid = dynamic(() => import("@/components/DashboardGrid"), { ssr: false });

export default function Home() {
  return (
    <main className="w-full h-full text-text-color">
      <DashboardGrid />
    </main>
  );
}
