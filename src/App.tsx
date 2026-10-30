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
  Cpu,
  FolderGit2,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Sparkles,
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

  return (
    <div className="min-h-screen kiro-bg-grid flex flex-col">
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

      {/* Hero Strip estilo Kiro.dev con estado de arquitectura y rol activo */}
      <div className="border-b border-[#b080ff]/15 bg-gradient-to-r from-[#181326]/90 via-[#120e1c]/90 to-[#181326]/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#8847ff]/20 border border-[#b080ff]/40 text-[#e2d3fe]">
              {currentRoleMeta.icon}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-white">
                  Módulo Activo: {currentRoleMeta.label}
                </h1>
                <span className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-[#b080ff]/15 text-[#e2d3fe] border border-[#b080ff]/30">
                  {currentRoleMeta.badge}
                </span>
              </div>
              <p className="text-xs text-[#a59bb8]">{currentRoleMeta.shortDesc}</p>
            </div>
          </div>

          {/* Kiro Spec & AWS Architecture Pills */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#161320] border border-white/10 text-[#c4b8db]">
              <MapPin className="w-3.5 h-3.5 text-[#ff80b5]" />
              Foco: Piura &amp; Catacaos
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#161320] border border-[#b080ff]/25 text-[#e2d3fe]">
              <Cpu className="w-3.5 h-3.5 text-[#b080ff]" />
              Bedrock Claude 3 Haiku
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#161320] border border-[#80ffb5]/25 text-[#80ffb5]">
              <FolderGit2 className="w-3.5 h-3.5" />
              .kiro/ Specs Ready
            </span>
            <button
              onClick={refreshAllData}
              disabled={loadingData}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#221c2e] hover:bg-[#2d253d] text-white border border-[#b080ff]/30 transition cursor-pointer"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-[#b080ff] ${
                  loadingData ? 'animate-spin' : ''
                }`}
              />
              Sincronizar
            </button>
          </div>
        </div>
      </div>

      {/* Contenido Principal por Rol */}
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

      {/* Footer Técnico con Acceso Rápido a Certificación de Insignias */}
      <footer className="border-t border-white/10 bg-[#0b0910]/90 py-4 mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between gap-3 text-xs text-[#9589ab]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#b080ff]" />
            <span>
              <strong>FEN — Ayuda Trazable</strong> • Hackatón AWS &amp; Kiro 2026 (IATHON)
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4 font-mono">
            <button
              onClick={() => setActiveRole('administrador')}
              className="text-[#80ffb5] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Abrir Verificador 150 Pts (/health • /items • /jobs)
            </button>
            <span>CORS: * | Auth: NONE | Timeout &le; 12s</span>
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
