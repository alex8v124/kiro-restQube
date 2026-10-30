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
  MapPin,
  RefreshCw,
  Truck,
} from 'lucide-react';

export function App() {
  const [activeRole, setActiveRole] = useState<RoleId>('solicitante');
  const [selectedTrackingId, setSelectedTrackingId] = useState<string>('TRK-FEN-2026');
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
    <div className="min-h-screen kiro-bg-grid flex flex-col text-[#f2eefc]">
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

      {/* Franja Superior Limpia: Resumen de Impacto Comunitario */}
      <section className="border-b border-[#b080ff]/15 bg-[#120e1a]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#8847ff]/20 text-[#e2d3fe] border border-[#b080ff]/30">
              {currentRoleMeta.icon}
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {currentRoleMeta.label}
              </h1>
              <p className="text-xs text-[#a59bb8]">{currentRoleMeta.shortDesc}</p>
            </div>
          </div>

          {/* Resumen de Emergencia en Lenguaje Humano y Cálido */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#181324] border border-white/5 text-[#c4b8db]">
              <Building2 className="w-3.5 h-3.5 text-[#b080ff]" />
              <span>Albergues atendidos: <strong className="text-white">{necesidades.length}</strong></span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#181324] border border-white/5 text-[#c4b8db]">
              <Truck className="w-3.5 h-3.5 text-[#80f4ff]" />
              <span>En camino: <strong className="text-white">{enCaminoCount}</strong></span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#181324] border border-white/5 text-[#c4b8db]">
              <HeartHandshake className="w-3.5 h-3.5 text-[#80ffb5]" />
              <span>Familias asistidas: <strong className="text-[#80ffb5]">{totalFamilias}</strong></span>
            </div>

            <button
              onClick={refreshAllData}
              disabled={loadingData}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#20182e] hover:bg-[#2b203d] text-white border border-[#b080ff]/30 transition cursor-pointer text-xs font-medium"
              title="Actualizar datos"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-[#80ffb5] ${
                  loadingData ? 'animate-spin' : ''
                }`}
              />
              <span className="hidden sm:inline">Actualizar</span>
            </button>
          </div>
        </div>
      </section>

      {/* Contenido Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
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

      {/* Pie de Página Limpio y Confiable */}
      <footer className="border-t border-white/5 bg-[#0b0910] py-4 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between gap-3 text-xs text-[#9589ab]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#80ffb5]"></span>
            <span>
              <strong>Ayuda Trazable FEN</strong> • Coordinación solidaria para el norte del Perú
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveRole('administrador')}
              className="text-[#a59bb8] hover:text-white hover:underline cursor-pointer"
            >
              Panel de Control y Diagnóstico
            </button>
            <span className="text-white/20">|</span>
            <span className="text-[#80ffb5] flex items-center gap-1">
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
        onClear={clearApiLogs}
      />
    </div>
  );
}
export default App;
