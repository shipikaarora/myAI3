export function Sidebar() {
  return (
    <div className="w-64 bg-orange-50 border-r-2 border-orange-300 p-6 hidden md:flex">
      
      {/* This wrapper ensures perfect vertical centering */}
      <div className="flex flex-col h-full w-full justify-center space-y-8 text-center">

        {/* Logo + Title */}
        <div>
          <img 
            src="/ashoka.png" 
            alt="Udyog Mitra" 
            className="w-36 h-36 mx-auto mb-4 object-contain"
          />
          <h2 className="text-2xl font-bold text-orange-800">Udyog Mitra</h2>
          <p className="text-sm text-orange-600">MSME साथी</p>
        </div>

        {/* Navigation */}
        <nav className="space-y-3">
          <a href="#" className="flex items-center gap-3 p-3 rounded-lg bg-orange-100 text-orange-800 font-medium justify-center">
            Home
          </a>
          <a href="#" className="flex items-center gap-3 p-3 rounded-lg hover:bg-orange-100 text-orange-700 justify-center">
            Udyam Registration
          </a>
          <a href="#" className="flex items-center gap-3 p-3 rounded-lg hover:bg-orange-100 text-orange-700 justify-center">
            GST Help
          </a>
          <a href="#" className="flex items-center gap-3 p-3 rounded-lg hover:bg-orange-100 text-orange-700 justify-center">
            Loan Schemes
          </a>
        </nav>

        {/* Footer */}
        <div className="text-xs text-orange-600">
          Made for Indian MSMEs with ❤
        </div>
      </div>

    </div>
  );
}
