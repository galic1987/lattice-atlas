import { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { Play, Pause, RotateCcw, Zap, Sparkles, Copy, Check } from 'lucide-react';
import { sound } from '@/lib/sound';

interface SpacetimeNode {
  id: string;
  x: number;
  y: number;
  t: number;
  type: 'data' | 'ancilla_z' | 'ancilla_x';
  hasError: boolean;
  errorType: 'X' | 'Z' | 'Y' | null;
  isDetectorFire: boolean;
}

interface MatchingEdge {
  fromId: string;
  toId: string;
  weight: number;
}

export default function SpacetimeDecoderSandbox3D() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState<number>(3); // d=3 or d=5
  const [rounds, setRounds] = useState<number>(3); // T=3 rounds
  const [errorProbability, setErrorProbability] = useState<number>(0.05);
  const [injectedErrors, setInjectedErrors] = useState<Map<string, 'X' | 'Z' | 'Y'>>(new Map());
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // 1. Generate 3D Spacetime Grid Nodes
  const nodes = useMemo(() => {
    const list: SpacetimeNode[] = [];
    for (let t = 0; t < rounds; t++) {
      for (let y = 0; y < distance; y++) {
        for (let x = 0; x < distance; x++) {
          const isAncilla = (x + y) % 2 === 1;
          const nodeType = isAncilla ? ((x % 2 === 1) ? 'ancilla_z' : 'ancilla_x') : 'data';
          const id = `${x}_${y}_${t}`;
          const err = injectedErrors.get(id) || null;
          
          // Detector fires if error present at round t
          const isDetectorFire = isAncilla && err !== null;
          
          list.push({
            id,
            x,
            y,
            t,
            type: nodeType,
            hasError: err !== null,
            errorType: err,
            isDetectorFire,
          });
        }
      }
    }
    return list;
  }, [distance, rounds, injectedErrors]);

  // 2. Compute Real-Time MWPM Matchings
  const matchings = useMemo(() => {
    const defectNodes = nodes.filter((n) => n.isDetectorFire);
    const edges: MatchingEdge[] = [];
    
    for (let i = 0; i < defectNodes.length; i++) {
      for (let j = i + 1; j < defectNodes.length; j++) {
        const n1 = defectNodes[i];
        const n2 = defectNodes[j];
        const dist = Math.abs(n1.x - n2.x) + Math.abs(n1.y - n2.y) + Math.abs(n1.t - n2.t);
        const weight = Math.max(0.1, dist * (1.0 - errorProbability));
        edges.push({ fromId: n1.id, toId: n2.id, weight });
      }
    }
    
    // Pair defects
    edges.sort((a, b) => a.weight - b.weight);
    const paired = new Set<string>();
    const matchedEdges: MatchingEdge[] = [];
    
    for (const e of edges) {
      if (!paired.has(e.fromId) && !paired.has(e.toId)) {
        matchedEdges.push(e);
        paired.add(e.fromId);
        paired.add(e.toId);
      }
    }
    return matchedEdges;
  }, [nodes, errorProbability]);

  // 3. Inject Random Errors based on probability p
  const handleSimulateNoise = () => {
    sound.playSyndromeTick();
    const newErrors = new Map<string, 'X' | 'Z' | 'Y'>();
    nodes.forEach((n) => {
      if (Math.random() < errorProbability) {
        const r = Math.random();
        const err = r < 0.45 ? 'X' : r < 0.9 ? 'Z' : 'Y';
        newErrors.set(n.id, err);
      }
    });
    setInjectedErrors(newErrors);
  };

  const handleClearErrors = () => {
    sound.playDecoderLock();
    setInjectedErrors(new Map());
  };

  const toggleNodeError = (id: string) => {
    sound.playSyndromeTick();
    const copy = new Map(injectedErrors);
    if (copy.has(id)) {
      copy.delete(id);
    } else {
      copy.set(id, 'X');
    }
    setInjectedErrors(copy);
  };

  // 4. Veo 3.1 Prompt Generation
  const veoPrompt = `Cinematic 8K 3D photorealistic animation of a distance-${distance} surface code spacetime lattice (${rounds} measurement rounds) inside a 15mK dilution refrigerator. Glowing red syndrome defect nodes illuminate where Pauli errors flip stabilizer measurement outcomes in (3D spacetime x,y,t), while cyan Minimum Weight Perfect Matching error correction paths resolve defect chains in real-time microsecond latency, 60fps.`;

  const copyPrompt = () => {
    navigator.clipboard.writeText(veoPrompt);
    sound.playDecoderLock();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 5. Three.js 3D Scene Initialization & Cleanup
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 480;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0c101c);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(distance * 1.8, rounds * 1.5, distance * 2.2);
    camera.lookAt(distance / 2, rounds / 2, distance / 2);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Track geometries and materials for dispose cleanup
    const geometriesToDispose: THREE.BufferGeometry[] = [];
    const materialsToDispose: THREE.Material[] = [];

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x22d3ee, 1.2);
    dirLight.position.set(10, 20, 15);
    scene.add(dirLight);

    // Node Mesh Geometries
    const dataGeo = new THREE.SphereGeometry(0.18, 16, 16);
    const ancillaGeo = new THREE.BoxGeometry(0.24, 0.24, 0.24);
    const defectGeo = new THREE.SphereGeometry(0.32, 20, 20);

    geometriesToDispose.push(dataGeo, ancillaGeo, defectGeo);

    const dataMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.3 });
    const ancillaZMat = new THREE.MeshStandardMaterial({ color: 0x8b5cf6, roughness: 0.3 });
    const ancillaXMat = new THREE.MeshStandardMaterial({ color: 0x22d3ee, roughness: 0.3 });
    const defectMat = new THREE.MeshStandardMaterial({ color: 0xfb7185, emissive: 0xfb7185, emissiveIntensity: 0.6 });

    materialsToDispose.push(dataMat, ancillaZMat, ancillaXMat, defectMat);

    // Node Lookup Map for matching lines
    const nodePositions = new Map<string, THREE.Vector3>();

    nodes.forEach((n) => {
      const pos = new THREE.Vector3(n.x - distance / 2, n.t * 1.2 - rounds / 2, n.y - distance / 2);
      nodePositions.set(n.id, pos);

      let mesh: THREE.Mesh;
      if (n.isDetectorFire) {
        mesh = new THREE.Mesh(defectGeo, defectMat);
      } else if (n.type === 'data') {
        mesh = new THREE.Mesh(dataGeo, dataMat);
      } else if (n.type === 'ancilla_z') {
        mesh = new THREE.Mesh(ancillaGeo, ancillaZMat);
      } else {
        mesh = new THREE.Mesh(ancillaGeo, ancillaXMat);
      }
      mesh.position.copy(pos);
      scene.add(mesh);
    });

    // Draw MWPM Matching Lines
    matchings.forEach((m) => {
      const p1 = nodePositions.get(m.fromId);
      const p2 = nodePositions.get(m.toId);
      if (p1 && p2) {
        const lineGeo = new THREE.BufferGeometry().setFromPoints([p1, p2]);
        const lineMat = new THREE.LineBasicMaterial({ color: 0x34d399, linewidth: 3 });
        geometriesToDispose.push(lineGeo);
        materialsToDispose.push(lineMat);
        const line = new THREE.Line(lineGeo, lineMat);
        scene.add(line);
      }
    });

    // Animation RAF Loop
    let animationFrameId: number;
    let rotationAngle = 0;

    const animate = () => {
      if (isPlaying) {
        rotationAngle += 0.008;
        camera.position.x = Math.cos(rotationAngle) * (distance * 2.2);
        camera.position.z = Math.sin(rotationAngle) * (distance * 2.2);
        camera.lookAt(0, 0, 0);
      }
      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight || 480;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Full GPU Dispose Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);

      geometriesToDispose.forEach((g) => g.dispose());
      materialsToDispose.forEach((m) => m.dispose());

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      renderer.forceContextLoss();
      renderer.dispose();
    };
  }, [distance, rounds, nodes, matchings, isPlaying]);

  return (
    <div className="rounded-2xl border border-ink-600 bg-ink-850 p-6 shadow-glow-cyan">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink-700 pb-5">
        <div>
          <span className="eyebrow text-plaquette mb-1">// INTERACTIVE 3D DECODER SANDBOX</span>
          <h3 className="font-display text-xl font-bold text-text-hi">
            3D Spacetime Syndrome Lattice & MWPM Decoder
          </h3>
          <p className="mt-1 text-sm text-text-mid">
            Inject Pauli X/Z physical errors into a (2+1)D spacetime lattice and observe real-time Minimum Weight Perfect Matching defect pairing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSimulateNoise}
            className="flex items-center gap-1.5 rounded-xl border border-syndrome/40 bg-syndrome/10 px-3.5 py-1.5 font-mono text-xs font-bold text-syndrome hover:bg-syndrome/20 transition-colors"
          >
            <Zap className="h-4 w-4" /> Inject Noise (p={errorProbability})
          </button>
          <button
            type="button"
            onClick={handleClearErrors}
            className="flex items-center gap-1.5 rounded-xl border border-ink-600 bg-ink-800 px-3.5 py-1.5 font-mono text-xs font-semibold text-text-mid hover:text-text-hi transition-colors"
          >
            <RotateCcw className="h-4 w-4" /> Clear Lattice
          </button>
        </div>
      </div>

      {/* Control Panel */}
      <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
        <div className="rounded-xl border border-ink-700 bg-ink-900 p-3">
          <span className="text-text-low text-[10px] uppercase block mb-1">Code Distance (d):</span>
          <div className="flex gap-2">
            {[3, 5].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => { setDistance(d); sound.playSyndromeTick(); }}
                className={`flex-1 rounded py-1 font-bold ${
                  distance === d ? 'bg-plaquette text-ink-950' : 'bg-ink-800 text-text-mid hover:text-text-hi'
                }`}
              >
                d={d}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-ink-700 bg-ink-900 p-3">
          <span className="text-text-low text-[10px] uppercase block mb-1">Rounds (T):</span>
          <div className="flex gap-2">
            {[2, 3, 5].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => { setRounds(r); sound.playSyndromeTick(); }}
                className={`flex-1 rounded py-1 font-bold ${
                  rounds === r ? 'bg-star text-ink-950' : 'bg-ink-800 text-text-mid hover:text-text-hi'
                }`}
              >
                T={r}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-ink-700 bg-ink-900 p-3">
          <span className="text-text-low text-[10px] uppercase block mb-1">Error Rate (p):</span>
          <input
            type="range"
            min="0.01"
            max="0.15"
            step="0.01"
            value={errorProbability}
            onChange={(e) => setErrorProbability(parseFloat(e.target.value))}
            className="w-full accent-syndrome"
          />
          <div className="text-right text-[11px] font-bold text-syndrome mt-0.5">
            {(errorProbability * 100).toFixed(1)}%
          </div>
        </div>

        <div className="rounded-xl border border-ink-700 bg-ink-900 p-3 flex flex-col justify-between">
          <span className="text-text-low text-[10px] uppercase block mb-1">3D Orbit Animation:</span>
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center justify-center gap-1.5 rounded py-1 bg-ink-800 text-text-hi font-bold hover:bg-ink-700 transition-colors"
          >
            {isPlaying ? <Pause className="h-3.5 w-3.5 text-syndrome" /> : <Play className="h-3.5 w-3.5 text-stabilizer" />}
            {isPlaying ? 'Pause Orbit' : 'Rotate Orbit'}
          </button>
        </div>
      </div>

      {/* Manual Error Injection Selector Bar */}
      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-ink-700/60 pt-4 font-mono text-xs">
        <span className="text-text-low text-[10px] uppercase font-bold mr-1">Manual Node Faults:</span>
        {nodes.slice(0, 12).map((n) => (
          <button
            key={n.id}
            type="button"
            onClick={() => toggleNodeError(n.id)}
            className={`px-2 py-0.5 rounded text-[10px] border transition-colors ${
              n.hasError
                ? 'border-syndrome bg-syndrome/20 text-syndrome font-bold'
                : 'border-ink-700 bg-ink-900 text-text-mid hover:border-ink-500'
            }`}
          >
            Node ({n.x},{n.y},t={n.t})
          </button>
        ))}
      </div>

      {/* Main 3D Canvas Area */}
      <div className="mt-5 relative rounded-xl border border-ink-700 bg-ink-950 overflow-hidden">
        <div ref={mountRef} className="w-full h-[460px]" />

        {/* Legend Overlay */}
        <div className="absolute top-4 left-4 rounded-xl border border-ink-700 bg-ink-900/90 p-3 backdrop-blur font-mono text-[11px] space-y-1.5 text-text-mid">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#3b82f6]" /> Data Qubits (x,y)
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 bg-[#8b5cf6]" /> Z-Check Plaquettes
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 bg-[#22d3ee]" /> X-Check Plaquettes
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#fb7185] animate-pulse" /> Detector Fire Defect
          </div>
          <div className="flex items-center gap-2">
            <span className="h-0.5 w-4 bg-[#34d399]" /> MWPM Correction Match
          </div>
        </div>

        {/* Stats Overlay */}
        <div className="absolute bottom-4 right-4 rounded-xl border border-ink-700 bg-ink-900/90 p-3 backdrop-blur font-mono text-xs text-text-hi space-y-1">
          <div>Detectors Fired: <span className="font-bold text-syndrome">{nodes.filter((n) => n.isDetectorFire).length}</span></div>
          <div>MWPM Matches: <span className="font-bold text-stabilizer">{matchings.length}</span></div>
        </div>
      </div>

      {/* Google Veo 3.1 AI Prompt Box */}
      <div className="mt-5 rounded-xl border border-magic/30 bg-ink-900 p-4 font-mono text-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-magic font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" /> Google Veo 3.1 AI Video Generation Prompt
          </span>
          <button
            type="button"
            onClick={copyPrompt}
            className="flex items-center gap-1 rounded bg-ink-800 px-2.5 py-1 text-[10px] text-plaquette hover:bg-ink-700 border border-ink-600"
          >
            {copied ? <Check className="h-3 w-3 text-stabilizer" /> : <Copy className="h-3 w-3" />}
            {copied ? 'Copied!' : 'Copy Prompt'}
          </button>
        </div>
        <div className="rounded-lg bg-ink-950 p-3 border border-ink-700 text-text-mid select-all">
          &ldquo;{veoPrompt}&rdquo;
        </div>
      </div>
    </div>
  );
}
