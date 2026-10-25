/**
 * Main application component.
 *
 * Sets up React Router with routes for dashboard, forecasts, and
 * accuracy pages. Provides a consistent navigation shell.
 */
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import { Dashboard } from "@/pages/Dashboard";
import { Accuracy } from "@/pages/Accuracy";
import { Forecasts } from "@/pages/Forecasts";
import { NotFound } from "@/pages/NotFound";
import { useForecastStore } from "@/store/store";

export function App() {
  const { error, clearError } = useForecastStore();

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 text-slate-900">
        {/* Top navigation */}
        <nav className="bg-slate-900 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-2">
                <span className="text-brand-600 font-bold text-xl tracking-tight">⚡GridBrick</span>
                <span className="ml-2 text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Wind Forecast Portal
                </span>
              </div>
              <div className="hidden md:flex items-center gap-1">
                <NavLink
                  to="/"
                  end
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-brand-500 text-white"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`
                  }
                >
                  Dashboard
                </NavLink>
                <NavLink
                  to="/forecasts"
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-brand-500 text-white"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`
                  }
                >
                  Forecasts &amp; Actuals
                </NavLink>
                <NavLink
                  to="/accuracy"
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-brand-500 text-white"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`
                  }
                >
                  Accuracy
                </NavLink>
              </div>
            </div>
          </div>
        </nav>

        {/* Main content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-sm">
              {error}
              <button
                onClick={clearError}
                className="ml-3 text-xs underline text-rose-600 hover:text-rose-800"
              >
                Dismiss
              </button>
            </div>
          )}
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/forecasts" element={<Forecasts />} />
            <Route path="/accuracy" element={<Accuracy />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        <footer className="border-t border-slate-200 bg-white py-6 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-xs text-slate-400">
              Data source: Elexon BMRS (FUELHH actuals, WINDFOR forecasts) —
              UK national wind generation, January 2026.
            </p>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;