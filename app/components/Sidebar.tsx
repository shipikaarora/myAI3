import { BadgeIndianRupee, FileText, Home, ScrollText } from "lucide-react";

export function Sidebar() {
  return (
    <div className="w-64 bg-orange-50 border-r-2 border-orange-300 p-6 space-y-8 hidden md:block">
      <div className="text-center">
        <img src="/ashoka.png" alt="Ashoka Chakra" className="w-24 h-24 mx-auto mb-4 rounded-full shadow-xl" />
        <h2 className="text-2xl font-bold text-orange-800">Udyog Mitra</h2>
        <p className="text-sm text-orange-600">MSME साथी</p>
      </div>

      <nav className="space-y-3">
        <a href="#" className="flex items-center gap-3 p-3 rounded-lg bg-orange-100 text-orange-800 font-medium">
          <Home className="size-5" /> Home
        </a>
        <a href="#" className="flex items-center gap-3 p-3 rounded-lg hover:bg-orange-100 text-orange-700">
          <FileText className="size-5" /> Udyam Registration
        </a>
        <a href="#" className="flex items-center gap-3 p-3 rounded-lg hover:bg-orange-100 text-orange-700">
          <BadgeIndianRupee className="size-5" /> GST Help
        </a>
        <a href="#" className="flex items-center gap-3 p-3 rounded-lg hover:bg-orange-100 text-orange-700">
          <ScrollText className="size-5" /> Loan Schemes
        </a>
      </nav>

      <div className="text-xs text-orange-600 text-center">
        Made for Indian MSMEs with ❤️
      </div>
    </div>
  );
}
