import { useState, useMemo, lazy, Suspense } from 'react';
import {
  Layers,
  Cpu,
  Boxes,
  Orbit,
  Calculator,
  Award,
  Upload,
  Zap,
  Sparkles,
  Terminal,
  Binary,
  Shield,
  type LucideIcon,
} from 'lucide-react';
import SpacetimeView3D from '@/components/SpacetimeView3D';
import SpacetimeBraidWeaver from '@/components/SpacetimeBraidWeaver';
import TorusTopologyViewer from '@/components/TorusTopologyViewer';
import StimUploader from '@/components/StimUploader';
import GenusExplorer from '@/components/GenusExplorer';
import LatticeSurgeryWelder from '@/components/LatticeSurgeryWelder';
import AnyonBraidingSandbox from '@/components/AnyonBraidingSandbox';
import QECOverheadCalculator from '@/components/QECOverheadCalculator';
import QuantumCircuitComposer from '@/components/QuantumCircuitComposer';
import MagicStateDistillationFactory from '@/components/MagicStateDistillationFactory';
import CertificateGenerator from '@/components/CertificateGenerator';
import ErrorCodeExplorer from '@/components/ErrorCodeExplorer';
import { buildLattice, decode, type Pauli } from '@/lib/surfaceCode';
import { sound } from '@/lib/sound';

const ExecutableSimulatorStudio = lazy(() => import('@/components/ExecutableSimulatorStudio'));
const StimDetectorGraphVisualizer = lazy(() => import('@/components/StimDetectorGraphVisualizer'));
const StandardCodeZooStudio = lazy(() => import('@/components/StandardCodeZooStudio'));
const QldpcTannerGraphVisualizer = lazy(() => import('@/components/QldpcTannerGraphVisualizer'));

export type ToolTab =
  | 'code-zoo'
  | 'surface-3d'
  | 'braid-3d'
  | 'circuit-composer'
  | 'executable-simulator'
  | 'stim-dem-graph'
  | 'standard-code-zoo'
  | 'qldpc-tanner-graph'
  | 'surgery-welder'
  | 'multi-manifold'
  | 'anyon-braid'
  | 'qec-overhead'
  | 'stim-uploader'
  | 't-distillation'
  | 'mastery-cert';

export interface ToolMeta {
  id: ToolTab;
  title: string;
  category: 'Foundations' | 'Simulation' | 'Topology' | 'Physics' | 'Engineering' | 'Mastery';
  icon: LucideIcon;
  description: string;
}

const WORKBENCH_TOOLS: ToolMeta[] = [
  {
    id: 'code-zoo',
    title: 'Error-Correcting Code Explorer',
    category: 'Foundations',
    icon: Binary,
    description: 'The classical roots: break real Repetition & Hamming[7,4] codes by hand (exact GF(2)), and see how they lead to Shor, Steane, and the surface code.',
  },
  {
    id: 'surface-3d',
    title: 'Rotated Surface Code 2D/3D',
    category: 'Simulation',
    icon: Layers,
    description: 'Interactive d=3 rotated surface code lattice with error brushes & MWPM decoder.',
  },
  {
    id: 'braid-3d',
    title: '3D Spacetime Braid Weaver',
    category: 'Simulation',
    icon: Boxes,
    description: 'Visualizes (x,y,t) space-time manifolds for logical CNOT welds and Majorana braiding.',
  },
  {
    id: 'circuit-composer',
    title: 'Quantum Circuit Composer',
    category: 'Simulation',
    icon: Cpu,
    description: 'Build 3-qubit circuits with H, X, Z, S, T, and CX gates with real-time statevectors.',
  },
  {
    id: 'executable-simulator',
    title: 'Executable Stim Simulator Studio',
    category: 'Simulation',
    icon: Terminal,
    description: 'Run executable Stim & QSim examples (Rotated Surface Code, Bell State, Lattice Surgery, Magic State, Color Code).',
  },
  {
    id: 'stim-dem-graph',
    title: 'Stim DEM Syndrome Graph Studio',
    category: 'Simulation',
    icon: Sparkles,
    description: 'Interactive Stim Detector Error Model (DEM) graph visualizer with live fault injection and MWPM matching.',
  },
  {
    id: 'standard-code-zoo',
    title: 'Standard Quantum Code Zoo Studio',
    category: 'Simulation',
    icon: Shield,
    description: 'Interactive Fano plane, Shor 9-qubit, 5-qubit perfect code, & classical Hamming code visualizer.',
  },
  {
    id: 'qldpc-tanner-graph',
    title: 'Quantum LDPC Bivariate Bicycle Studio',
    category: 'Simulation',
    icon: Layers,
    description: 'Interactive bipartite Tanner graph visualizer for high-rate QLDPC codes & Belief-Propagation decoding.',
  },
  {
    id: 'surgery-welder',
    title: 'Lattice Surgery Welder',
    category: 'Topology',
    icon: Zap,
    description: 'Merge Z/X boundaries and split planar surface code patches for fault-tolerant CNOT gates.',
  },
  {
    id: 'multi-manifold',
    title: 'Multi-Manifold Topology',
    category: 'Topology',
    icon: Sparkles,
    description: 'Why a genus-g surface code encodes k=2g logical qubits (sphere → triple torus), plus where that rule stops for non-orientable surfaces.',
  },
  {
    id: 'anyon-braid',
    title: 'Anyon Braiding & Fusion',
    category: 'Physics',
    icon: Orbit,
    description: 'Drag electric charges (e), magnetic fluxons (m), and fermions (ε) with Z₂ fusion rules.',
  },
  {
    id: 'qec-overhead',
    title: 'QEC Overhead Calculator',
    category: 'Engineering',
    icon: Calculator,
    description: 'Estimate code distance d, physical qubit count, and execution runtime from error rates.',
  },
  {
    id: 'stim-uploader',
    title: 'Stim Drag & Drop Uploader',
    category: 'Engineering',
    icon: Upload,
    description: 'Upload or paste raw .stim / .dem files to analyze detector graphs and instructions.',
  },
  {
    id: 't-distillation',
    title: 'Magic State Distillation',
    category: 'Engineering',
    icon: Zap,
    description: '15-to-1 Bravyi-Kitaev Reed-Muller magic state distillation factory block schematic.',
  },
  {
    id: 'mastery-cert',
    title: 'Mastery Certificate Exporter',
    category: 'Mastery',
    icon: Award,
    description: 'Export an official, high-resolution TQEC completion credential.',
  },
];

export default function LabWorkbenchHub() {
  const [activeTab, setActiveTab] = useState<ToolTab>('surface-3d');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = ['All', 'Foundations', 'Simulation', 'Topology', 'Physics', 'Engineering', 'Mastery'];

  const defaultLattice = useMemo(() => buildLattice(3), []);
  const defaultErrors = useMemo<Pauli[]>(() => new Array(defaultLattice.n).fill(0), [defaultLattice]);
  const defaultResult = useMemo(
    () => decode(defaultLattice, defaultErrors),
    [defaultLattice, defaultErrors]
  );

  const filteredTools =
    activeCategory === 'All'
      ? WORKBENCH_TOOLS
      : WORKBENCH_TOOLS.filter((t) => t.category === activeCategory);

  const switchTab = (tab: ToolTab) => {
    sound.playDecoderLock();
    setActiveTab(tab);
  };

  return (
    <div className="space-y-8">
      {/* Non-Linear Workbench Control Hub */}
      <div className="rounded-2xl border border-plaquette/40 bg-ink-900 p-6 shadow-glow-cyan">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-ink-700 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-text-low">// NON-LINEAR LAB WORKBENCH</span>
              <span className="rounded bg-plaquette/20 px-2 py-0.5 font-mono text-[10px] text-plaquette font-bold">{WORKBENCH_TOOLS.length} INTERACTIVE TOOLS</span>
            </div>
            <h2 className="font-display text-2xl font-bold text-text-hi">TQEC Exploration Workbench</h2>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 rounded-full font-mono text-xs transition-colors ${
                  activeCategory === cat
                    ? 'bg-plaquette text-ink-950 font-bold'
                    : 'bg-ink-800 text-text-mid hover:text-text-hi'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Non-Linear Tool Selector Cards Grid */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {filteredTools.map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => switchTab(t.id)}
                className={`flex flex-col justify-between p-3.5 rounded-xl border text-left transition-all ${
                  active
                    ? 'border-plaquette bg-plaquette/15 shadow-glow-cyan scale-[1.02]'
                    : 'border-ink-700 bg-ink-950/80 hover:border-ink-500 hover:bg-ink-850'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-1.5 rounded-lg ${active ? 'bg-plaquette text-ink-950' : 'bg-ink-800 text-plaquette'}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="font-mono text-[9px] uppercase tracking-wider text-text-low">{t.category}</span>
                  </div>
                  <h4 className="font-display text-xs font-bold text-text-hi line-clamp-1">{t.title}</h4>
                  <p className="mt-1 text-[10px] text-text-mid line-clamp-2 leading-relaxed">{t.description}</p>
                </div>

                <span className={`mt-3 font-mono text-[9px] ${active ? 'text-plaquette font-bold' : 'text-text-low'}`}>
                  {active ? '● Active in Workspace' : 'Click to launch →'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Workspace Viewport */}
      <div className="rounded-2xl border border-ink-700 bg-ink-950 p-2 shadow-2xl">
        {activeTab === 'code-zoo' && (
          <div className="p-4">
            <ErrorCodeExplorer />
          </div>
        )}

        {activeTab === 'surface-3d' && (
          <div className="p-4">
            <SpacetimeView3D
              lat={defaultLattice}
              errors={defaultErrors}
              result={defaultResult}
              currentStep={5}
              p={0.01}
            />
          </div>
        )}

        {activeTab === 'braid-3d' && (
          <div className="p-4">
            <SpacetimeBraidWeaver />
          </div>
        )}

        {activeTab === 'circuit-composer' && (
          <div className="p-4">
            <QuantumCircuitComposer />
          </div>
        )}

        {activeTab === 'executable-simulator' && (
          <div className="p-4">
            <Suspense fallback={<div className="p-8 text-center font-mono text-sm text-text-low">Loading Executable Simulator Studio...</div>}>
              <ExecutableSimulatorStudio />
            </Suspense>
          </div>
        )}

        {activeTab === 'stim-dem-graph' && (
          <div className="p-4">
            <Suspense fallback={<div className="p-8 text-center font-mono text-sm text-text-low">Loading Stim DEM Graph Studio...</div>}>
              <StimDetectorGraphVisualizer />
            </Suspense>
          </div>
        )}

        {activeTab === 'standard-code-zoo' && (
          <div className="p-4">
            <Suspense fallback={<div className="p-8 text-center font-mono text-sm text-text-low">Loading Standard Quantum Code Zoo Studio...</div>}>
              <StandardCodeZooStudio />
            </Suspense>
          </div>
        )}

        {activeTab === 'qldpc-tanner-graph' && (
          <div className="p-4">
            <Suspense fallback={<div className="p-8 text-center font-mono text-sm text-text-low">Loading QLDPC Bivariate Bicycle Studio...</div>}>
              <QldpcTannerGraphVisualizer />
            </Suspense>
          </div>
        )}

        {activeTab === 'surgery-welder' && (
          <div className="p-4">
            <LatticeSurgeryWelder />
          </div>
        )}

        {activeTab === 'multi-manifold' && (
          <div className="p-4">
            <TorusTopologyViewer />
            <div className="mt-6">
              <GenusExplorer />
            </div>
          </div>
        )}

        {activeTab === 'anyon-braid' && (
          <div className="p-4">
            <AnyonBraidingSandbox />
          </div>
        )}

        {activeTab === 'qec-overhead' && (
          <div className="p-4">
            <QECOverheadCalculator />
          </div>
        )}

        {activeTab === 'stim-uploader' && (
          <div className="p-4">
            <StimUploader />
          </div>
        )}

        {activeTab === 't-distillation' && (
          <div className="p-4">
            <MagicStateDistillationFactory />
          </div>
        )}

        {activeTab === 'mastery-cert' && (
          <div className="p-4">
            <CertificateGenerator />
          </div>
        )}
      </div>
    </div>
  );
}
