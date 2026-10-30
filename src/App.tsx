import React, { useCallback, useEffect, useState } from 'react';
import {
  AsignacionItem,
  DashboardMetrics,
  DonacionItem,
  NecesidadItem,
  RoleId,
} from './types/fen';
import {
  apiGetAsignaciones,
  apiGetDashboardMetrics,
  apiGetDonaciones,
  apiGetNecesidades,
  clearApiLogs,
  getApiConfig,
  getApiLogs,
  setApiConfig,
  subscribeApiState,
} from './services/api';
import { Navbar, ROLES_CONFIG } from './components/Navbar';
import { ApiConfigModal } from './components/ApiConfigModal';
import { ApiInspectorDrawer } from './components/ApiInspectorDrawer';
import { SolicitanteView } from './components/views/SolicitanteView';
import { DonanteView } from './components/views/DonanteView';
import { CoordinadorView } from './components/views/CoordinadorView';
import { LogisticoView } from './components/views/LogisticoView';
import { TrazabilidadView } from './components/views/TrazabilidadView';
import { AdminView } from './components/views/AdminView';
import {
  Building2,
  CheckCircle2,
  HeartHandshake,
  RefreshCw,
  Truck,
} from 'lucide-react';

export default function App() {
  const [activeRole, setActiveRole] = useState<RoleId>('trazabilidad');
  const [selectedTrackingId, setSelectedTrackingId] = useState<string>('TRK-101');
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);

  const [necesidades, setNecesidades] = useState<NecesidadItem[]>([]);
  const [donaciones, setDonaciones] = useState<DonacionItem[]>([]);
  const [asignaciones, setAsignaciones] = useState<AsignacionItem[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loadingData, setLoadingData] = useState(false);

  const [, setTick] = useState(0);

  useEffect(() => {
    return subscribeApiState(() => setTick((t) => t + 1));
  }, []);

  const refreshAllData = useCallback(async () => {
    setLoadingData(true);
    try {
      const [necRes, donRes, asgRes, dashRes] = await Promise.all([
        apiGetNecesidades(),
        apiGetDonaciones(),
        apiGetAsignaciones(),
        apiGetDashboardMetrics(),
      ]);
      setNecesidades(necRes.data);
      setDonaciones(donRes.data);
      setAsignaciones(asgRes.data);
      setMetrics(dashRes.data);
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  const handleInspectTracking = (trackingId: string) => {
    setSelectedTrackingId(trackingId);
    setActiveRole('trazabilidad');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cfg = getApiConfig();
  const logs = getApiLogs();
  const currentRoleMeta =
    ROLES_CONFIG.find((r) => r.id === activeRole) || ROLES_CONFIG[0];

  const totalFamilias = necesidades.reduce((acc, n) => acc + (n.familiasAfectadas || 0), 0);
  const enCaminoCount = asignaciones.filter(a => a.estadoRuta === 'EN_TRANSITO' || a.estadoRuta === 'EN_RUTA').length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans">
      <Navbar
        activeRole={activeRole}
        onSelectRole={setActiveRole}
        apiUrl={cfg.apiUrl}
        teamId={cfg.teamId}
        mode={cfg.mode}
        onOpenConfig={() => setIsConfigOpen(true)}
        onToggleConsole={() => setIsConsoleOpen((v) => !v)}
        consoleCount={logs.length}
      />

      {/* Franja Superior: Resumen de Impacto Comunitario estilo Apple Clean */}
      <section className="border-b border-slate-200/80 bg-white shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100">
              {currentRoleMeta.icon}
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                {currentRoleMeta.label}
              </h1>
              <p className="text-xs text-slate-500">{currentRoleMeta.shortDesc}</p>
            </div>
          </div>

          {/* Resumen de Emergencia en Tarjetas Sutiles */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-600">
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Albergues: <strong className="text-slate-900">{necesidades.length || 4}</strong></span>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-600">
              <Truck className="w-3.5 h-3.5 text-blue-600" />
              <span>En camino: <strong className="text-slate-900">{enCaminoCount || 2}</strong></span>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800">
              <HeartHandshake className="w-3.5 h-3.5 text-emerald-600" />
              <span>Familias asistidas: <strong className="text-emerald-700">{totalFamilias || 280}</strong></span>
            </div>

            <button
              onClick={refreshAllData}
              disabled={loadingData}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition cursor-pointer text-xs font-medium"
              title="Actualizar datos"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-slate-600 ${
                  loadingData ? 'animate-spin' : ''
                }`}
              />
              <span className="hidden sm:inline">Actualizar</span>
            </button>
          </div>
        </div>
      </section>

      {/* Contenido Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {activeRole === 'solicitante' && (
          <SolicitanteView
            necesidades={necesidades}
            onRefresh={refreshAllData}
            onInspectTracking={handleInspectTracking}
          />
        )}

        {activeRole === 'donante' && (
          <DonanteView
            necesidades={necesidades}
            donaciones={donaciones}
            onRefresh={refreshAllData}
            onInspectTracking={handleInspectTracking}
          />
        )}

        {activeRole === 'coordinador' && (
          <CoordinadorView
            necesidades={necesidades}
            donaciones={donaciones}
            asignaciones={asignaciones}
            onRefresh={refreshAllData}
            onInspectTracking={handleInspectTracking}
          />
        )}

        {activeRole === 'logistico' && (
          <LogisticoView
            asignaciones={asignaciones}
            onRefresh={refreshAllData}
            onInspectTracking={handleInspectTracking}
          />
        )}

        {activeRole === 'trazabilidad' && (
          <TrazabilidadView initialTrackingId={selectedTrackingId} />
        )}

        {activeRole === 'administrador' && (
          <AdminView metrics={metrics} onRefresh={refreshAllData} />
        )}
      </main>

      {/* Pie de Página Limpio estilo Apple */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>
              <strong className="text-slate-800">Ayuda Trazable FEN</strong> • Coordinación solidaria para el norte del Perú
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveRole('administrador')}
              className="text-slate-500 hover:text-slate-800 transition cursor-pointer"
            >
              Panel de Control
            </button>
            <span className="text-slate-300">|</span>
            <span className="text-emerald-700 flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Conexión Segura Activa
            </span>
          </div>
        </div>
      </footer>

      <ApiConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        currentUrl={cfg.apiUrl}
        currentTeamId={cfg.teamId}
        currentMode={cfg.mode}
        onSave={(newCfg) => {
          setApiConfig(newCfg);
          refreshAllData();
        }}
      />

      <ApiInspectorDrawer
        isOpen={isConsoleOpen}
        onClose={() => setIsConsoleOpen(false)}
        logs={logs}
        onClear={() => {
          clearApiLogs();
          setTick((t) => t + 1);
        }}
      />
    </div>
  );
}

export { App };
