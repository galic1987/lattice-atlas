import { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { Layers, RotateCcw, Eye, Box, Sliders } from 'lucide-react';
import type { Lattice, Pauli, DecodeResult, Stabilizer } from '@/lib/surfaceCode';
import { computeSyndrome } from '@/lib/surfaceCode';

const PAULI_COLORS_HEX: Record<Exclude<Pauli, 0>, number> = {
  1: 0x8b5cf6, // X - star violet
  2: 0x22d3ee, // Z - plaquette cyan
  3: 0xf5b83d, // Y - magic amber
};

const SYNDROME_HEX = 0xfb7185;
const OK_HEX = 0x34d399;
const NEUTRAL_QUBIT_HEX = 0x3d5178;

interface SpacetimeView3DProps {
  lat: Lattice;
  errors: Pauli[];
  result: DecodeResult | null;
  currentStep: number;
  p: number;
}

interface RoundData {
  round: number;
  errors: Pauli[];
  syndrome: Set<string>;
  defects: Set<string>; // detectors triggered in this round relative to round-1
}

/* ------------------------------------------------------------------ */
/* Three.js WebGL 3D Canvas Sub-Component                             */
/* ------------------------------------------------------------------ */

function WebGLSpacetimeCanvas({
  lat,
  roundsData,
  result,
  currentStep,
  layerSpacing,
  selectedRound,
}: {
  lat: Lattice;
  roundsData: RoundData[];
  result: DecodeResult | null;
  currentStep: number;
  layerSpacing: number;
  selectedRound: number | 'all';
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Mouse orbit interaction state
  const isDragging = useRef(false);
  const previousMouse = useRef({ x: 0, y: 0 });
  const rotation = useRef({ x: Math.PI / 6, y: -Math.PI / 4 });
  const zoomDistance = useRef(lat.d * 3.5);

  const resetView = () => {
    rotation.current = { x: Math.PI / 6, y: -Math.PI / 4 };
    zoomDistance.current = lat.d * 3.5;
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 450;

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);
    sceneRef.current = scene;

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    cameraRef.current = camera;

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight1.position.set(10, 20, 15);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x8b5cf6, 0.4);
    dirLight2.position.set(-10, -10, -10);
    scene.add(dirLight2);

    // 5. Grid/lattice geometry parameters
    const d = lat.d;
    const gridScale = 1.2;
    const centerOffset = ((d - 1) * gridScale) / 2;

    const qubitPos3D = (q: number, t: number) => {
      const r = Math.floor(q / d);
      const c = q % d;
      const x = c * gridScale - centerOffset;
      const z = r * gridScale - centerOffset;
      const y = (t - (roundsData.length + 1) / 2) * layerSpacing;
      return new THREE.Vector3(x, y, z);
    };

    const stabPos3D = (s: Stabilizer, t: number) => {
      const x = (s.fc - 0.5) * gridScale - centerOffset;
      const z = (s.fr - 0.5) * gridScale - centerOffset;
      const y = (t - (roundsData.length + 1) / 2) * layerSpacing;
      return new THREE.Vector3(x, y, z);
    };

    // Build 3D elements for each time round
    roundsData.forEach((rd) => {
      const t = rd.round;
      if (selectedRound !== 'all' && selectedRound !== t) return;

      const layerY = (t - (roundsData.length + 1) / 2) * layerSpacing;

      // Render horizontal plane mesh
      const planeGeo = new THREE.PlaneGeometry((d + 0.5) * gridScale, (d + 0.5) * gridScale);
      const planeMat = new THREE.MeshBasicMaterial({
        color: 0x1e293b,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.25,
      });
      const planeMesh = new THREE.Mesh(planeGeo, planeMat);
      planeMesh.rotation.x = Math.PI / 2;
      planeMesh.position.y = layerY;
      scene.add(planeMesh);

      // Render Stabilizer Faces
      lat.stabilizers.forEach((s) => {
        const isFlipped = rd.syndrome.has(s.id) && currentStep >= 2;
        const color = isFlipped
          ? SYNDROME_HEX
          : s.type === 'X'
            ? PAULI_COLORS_HEX[1]
            : PAULI_COLORS_HEX[2];

        const sPos = stabPos3D(s, t);

        const faceGeo = new THREE.PlaneGeometry(gridScale * 0.9, gridScale * 0.9);
        const faceMat = new THREE.MeshLambertMaterial({
          color,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: isFlipped ? 0.65 : 0.15,
        });
        const faceMesh = new THREE.Mesh(faceGeo, faceMat);
        faceMesh.rotation.x = Math.PI / 2;
        faceMesh.position.copy(sPos);
        scene.add(faceMesh);

        // Defect sphere overlay in Step 3+
        if (isFlipped && currentStep >= 3) {
          const defectGeo = new THREE.SphereGeometry(0.22, 16, 16);
          const defectMat = new THREE.MeshStandardMaterial({
            color: SYNDROME_HEX,
            emissive: SYNDROME_HEX,
            emissiveIntensity: 0.8,
            roughness: 0.2,
          });
          const defectMesh = new THREE.Mesh(defectGeo, defectMat);
          defectMesh.position.copy(sPos);
          scene.add(defectMesh);
        }
      });

      // Render Data Qubits
      rd.errors.forEach((e, q) => {
        const qPos = qubitPos3D(q, t);
        const hasErr = e !== 0 && currentStep >= 1 && currentStep < 5;
        const color = hasErr ? PAULI_COLORS_HEX[e as Exclude<Pauli, 0>] : NEUTRAL_QUBIT_HEX;

        const sphereGeo = new THREE.SphereGeometry(hasErr ? 0.2 : 0.1, 16, 16);
        const sphereMat = new THREE.MeshStandardMaterial({
          color,
          emissive: hasErr ? color : 0x000000,
          emissiveIntensity: hasErr ? 0.6 : 0,
          roughness: 0.3,
        });
        const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
        sphereMesh.position.copy(qPos);
        scene.add(sphereMesh);
      });

      // Timelike connection lines to next round
      if (t < roundsData.length && (selectedRound === 'all' || selectedRound === t)) {
        lat.stabilizers.forEach((s) => {
          if (rd.defects.has(s.id) && currentStep >= 2) {
            const p1 = stabPos3D(s, t);
            const p2 = stabPos3D(s, t + 1);

            const points = [p1, p2];
            const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
            const lineMat = new THREE.LineDashedMaterial({
              color: SYNDROME_HEX,
              dashSize: 0.2,
              gapSize: 0.1,
              linewidth: 2,
            });
            const line = new THREE.Line(lineGeo, lineMat);
            line.computeLineDistances();
            scene.add(line);
          }
        });
      }
    });

    // Render MWPM matching 3D lines in Step 4+
    if (result && currentStep >= 4) {
      const activeRound = selectedRound === 'all' ? roundsData.length : selectedRound;

      result.matches.forEach((m) => {
        const stabById = new Map(lat.stabilizers.map((s) => [s.id, s]));
        const a = stabById.get(m.a);
        if (!a) return;

        const pts: THREE.Vector3[] = [stabPos3D(a, activeRound)];
        m.qubits.forEach((q) => pts.push(qubitPos3D(q, activeRound)));
        if (m.b !== 'boundary') {
          const b = stabById.get(m.b);
          if (b) pts.push(stabPos3D(b, activeRound));
        }

        const curve = new THREE.CatmullRomCurve3(pts);
        const tubeGeo = new THREE.TubeGeometry(curve, 20, 0.06, 8, false);
        const tubeMat = new THREE.MeshStandardMaterial({
          color: OK_HEX,
          emissive: OK_HEX,
          emissiveIntensity: 0.7,
        });
        const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
        scene.add(tubeMesh);
      });
    }

    // Animation loop
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);

      const r = zoomDistance.current;
      const x = r * Math.sin(rotation.current.y) * Math.cos(rotation.current.x);
      const y = r * Math.sin(rotation.current.x);
      const z = r * Math.cos(rotation.current.y) * Math.cos(rotation.current.x);

      camera.position.set(x, y, z);
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      // Dispose every GPU resource this scene allocated. renderer.dispose()
      // alone leaves geometries/materials on the GPU, and recreating the
      // renderer each re-render (without forceContextLoss) can exhaust the
      // browser's ~16 WebGL context cap. Free both here.
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else if (mat) mat.dispose();
      });
      scene.clear();
      renderer.dispose();
      renderer.forceContextLoss();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [lat, roundsData, result, currentStep, layerSpacing, selectedRound]);

  // Pointer event handlers for drag orbit rotation & wheel zoom
  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    previousMouse.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - previousMouse.current.x;
    const dy = e.clientY - previousMouse.current.y;

    rotation.current.y += dx * 0.008;
    rotation.current.x = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, rotation.current.x + dy * 0.008));
    previousMouse.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = () => {
    isDragging.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    zoomDistance.current = Math.max(lat.d * 1.5, Math.min(lat.d * 8, zoomDistance.current + e.deltaY * 0.01));
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onWheel={handleWheel}
      className="relative h-[440px] w-full cursor-grab overflow-hidden rounded-lg bg-ink-900 active:cursor-grabbing"
    >
      <div className="pointer-events-none absolute left-4 top-4 flex flex-col gap-1 rounded-md bg-ink-850/80 p-2.5 font-mono text-[11px] text-text-mid backdrop-blur">
        <span className="text-text-hi font-bold">3D Spacetime View (Three.js WebGL)</span>
        <span>Drag to rotate · Scroll to zoom</span>
        <span className="text-text-low">
          T = 1..{roundsData.length} rounds stacked along vertical axis
        </span>
      </div>

      <button
        type="button"
        onClick={resetView}
        className="btn-ghost absolute right-4 top-4 !p-2 text-text-mid hover:text-text-hi"
        title="Reset 3D camera"
      >
        <RotateCcw className="h-4 w-4" />
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* SVG Isometric Stacked Sub-Component                                 */
/* ------------------------------------------------------------------ */

function SvgIsometricSpacetime({
  lat,
  roundsData,
  currentStep,
  selectedRound,
}: {
  lat: Lattice;
  roundsData: RoundData[];
  result?: DecodeResult | null;
  currentStep: number;
  selectedRound: number | 'all';
}) {
  const d = lat.d;
  const CELL = 44;
  const ISO_ANGLE = 0.52; // ~30 deg
  const COS = Math.cos(ISO_ANGLE);
  const SIN = Math.sin(ISO_ANGLE);

  const toIso = (x: number, y: number, z: number) => {
    // Project 3D (x, y, z) to 2D isometric (ix, iy)
    const ix = (x - y) * COS * CELL;
    const iy = (x + y) * SIN * CELL - z * 64;
    return { x: ix, y: iy };
  };

  const centerOffset = (d - 1) / 2;
  const sizeX = 700;
  const sizeY = 520;
  const originX = sizeX / 2;
  const originY = sizeY / 2 + (roundsData.length * 32) / 2;

  return (
    <div className="relative h-[440px] w-full overflow-hidden rounded-lg bg-ink-900 p-2">
      <svg viewBox={`0 0 ${sizeX} ${sizeY}`} className="h-full w-full">
        {/* Render stacked layers from bottom T=1 to top T=d */}
        {roundsData.map((rd) => {
          const t = rd.round;
          if (selectedRound !== 'all' && selectedRound !== t) return null;

          const layerZ = t - 1;

          // Render timelike defect connections between rounds
          return (
            <g key={`round-${t}`}>
              {/* Layer boundary box */}
              <path
                d={
                  `M ${originX + toIso(-0.5 - centerOffset, -0.5 - centerOffset, layerZ).x} ${
                    originY + toIso(-0.5 - centerOffset, -0.5 - centerOffset, layerZ).y
                  } ` +
                  `L ${originX + toIso(d - 0.5 - centerOffset, -0.5 - centerOffset, layerZ).x} ${
                    originY + toIso(d - 0.5 - centerOffset, -0.5 - centerOffset, layerZ).y
                  } ` +
                  `L ${originX + toIso(d - 0.5 - centerOffset, d - 0.5 - centerOffset, layerZ).x} ${
                    originY + toIso(d - 0.5 - centerOffset, d - 0.5 - centerOffset, layerZ).y
                  } ` +
                  `L ${originX + toIso(-0.5 - centerOffset, d - 0.5 - centerOffset, layerZ).x} ${
                    originY + toIso(-0.5 - centerOffset, d - 0.5 - centerOffset, layerZ).y
                  } Z`
                }
                fill="#1E293B"
                fillOpacity={0.2}
                stroke="#334155"
                strokeWidth={1}
                strokeDasharray="4 4"
              />

              <text
                x={originX + toIso(-0.8 - centerOffset, -0.8 - centerOffset, layerZ).x}
                y={originY + toIso(-0.8 - centerOffset, -0.8 - centerOffset, layerZ).y}
                fill="#94A3B8"
                fontSize={11}
                fontFamily="'JetBrains Mono', monospace"
              >
                T={t}
              </text>

              {/* Stabilizers */}
              {lat.stabilizers.map((s) => {
                const isFlipped = rd.syndrome.has(s.id) && currentStep >= 2;
                const baseColor = s.type === 'X' ? '#8B5CF6' : '#22D3EE';
                const color = isFlipped ? '#FB7185' : baseColor;

                const scx = s.fc - 0.5 - centerOffset;
                const scy = s.fr - 0.5 - centerOffset;
                const pt = toIso(scx, scy, layerZ);

                const p1 = toIso(scx - 0.4, scy - 0.4, layerZ);
                const p2 = toIso(scx + 0.4, scy - 0.4, layerZ);
                const p3 = toIso(scx + 0.4, scy + 0.4, layerZ);
                const p4 = toIso(scx - 0.4, scy + 0.4, layerZ);

                return (
                  <g key={s.id}>
                    <polygon
                      points={`${originX + p1.x},${originY + p1.y} ${originX + p2.x},${originY + p2.y} ${originX + p3.x},${originY + p3.y} ${originX + p4.x},${originY + p4.y}`}
                      fill={color}
                      fillOpacity={isFlipped ? 0.55 : 0.12}
                      stroke={color}
                      strokeWidth={isFlipped ? 1.5 : 0.8}
                    />
                    {isFlipped && currentStep >= 3 && (
                      <circle
                        cx={originX + pt.x}
                        cy={originY + pt.y}
                        r={6}
                        fill="#FB7185"
                        className="animate-pulse"
                      />
                    )}
                  </g>
                );
              })}

              {/* Data Qubits */}
              {rd.errors.map((e, q) => {
                const qr = Math.floor(q / d) - centerOffset;
                const qc = (q % d) - centerOffset;
                const qpt = toIso(qc, qr, layerZ);
                const hasErr = e !== 0 && currentStep >= 1 && currentStep < 5;

                return (
                  <circle
                    key={q}
                    cx={originX + qpt.x}
                    cy={originY + qpt.y}
                    r={hasErr ? 5 : 2.5}
                    fill={
                      hasErr
                        ? e === 1
                          ? '#8B5CF6'
                          : e === 2
                            ? '#22D3EE'
                            : '#F5B83D'
                        : '#475569'
                    }
                  />
                );
              })}

              {/* Timelike connections to T+1 */}
              {t < roundsData.length && (
                <g>
                  {lat.stabilizers.map((s) => {
                    if (rd.defects.has(s.id) && currentStep >= 2) {
                      const scx = s.fc - 0.5 - centerOffset;
                      const scy = s.fr - 0.5 - centerOffset;
                      const pLower = toIso(scx, scy, layerZ);
                      const pUpper = toIso(scx, scy, layerZ + 1);

                      return (
                        <line
                          key={`time-link-${s.id}`}
                          x1={originX + pLower.x}
                          y1={originY + pLower.y}
                          x2={originX + pUpper.x}
                          y2={originY + pUpper.y}
                          stroke="#FB7185"
                          strokeWidth={2}
                          strokeDasharray="3 3"
                        />
                      );
                    }
                    return null;
                  })}
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main SpacetimeView3D Container Component                           */
/* ------------------------------------------------------------------ */

export default function SpacetimeView3D({
  lat,
  errors,
  result,
  currentStep,
  p,
}: SpacetimeView3DProps) {
  const [renderMode, setRenderMode] = useState<'webgl' | 'svg'>('webgl');
  const [layerSpacing, setLayerSpacing] = useState(1.4);
  const [selectedRound, setSelectedRound] = useState<number | 'all'>('all');

  // Generate simulated spacetime history over T=1..d rounds
  const roundsData: RoundData[] = useMemo(() => {
    const numRounds = lat.d;
    const history: RoundData[] = [];

    let prevSyndrome = new Set<string>();

    for (let t = 1; t <= numRounds; t++) {
      // Round T=d uses active lab errors; earlier rounds simulate random noise
      let rErrors: Pauli[];
      if (t === numRounds) {
        rErrors = errors;
      } else {
        // Deterministic pseudo-noise: render must stay pure (react-hooks/purity),
        // and it keeps past rounds stable across re-renders.
        const hash = (seed: number) => {
          let x = Math.imul(seed ^ 0x9e3779b9, 0x85ebca6b);
          x ^= x >>> 13;
          x = Math.imul(x, 0xc2b2ae35);
          x ^= x >>> 16;
          return (x >>> 0) / 4294967296;
        };
        rErrors = new Array<Pauli>(lat.n).fill(0);
        for (let q = 0; q < lat.n; q++) {
          if (hash(t * 8191 + q * 127 + lat.d) < p * 0.7) {
            rErrors[q] = (1 + Math.floor(hash(t * 524287 + q * 8191 + 1) * 3)) as Pauli;
          }
        }
      }

      const rSyndrome = computeSyndrome(lat, rErrors);

      // Detectors trigger when syndrome outcome changes from prev round
      const rDefects = new Set<string>();
      lat.stabilizers.forEach((s) => {
        const cur = rSyndrome.has(s.id);
        const prev = prevSyndrome.has(s.id);
        if (cur !== prev) {
          rDefects.add(s.id);
        }
      });

      history.push({
        round: t,
        errors: rErrors,
        syndrome: rSyndrome,
        defects: rDefects,
      });

      prevSyndrome = rSyndrome;
    }

    return history;
  }, [lat, errors, p]);

  return (
    <div className="rounded-xl border border-ink-600 bg-ink-850 p-4 md:p-6">
      {/* Header controls */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-ink-700 pb-4">
        <div>
          <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-text-hi">
            <Layers className="h-5 w-5 text-magic" />
            3D Spacetime View (T = 1..{lat.d} Syndrome Rounds)
          </h3>
          <p className="mt-0.5 text-[13px] text-text-mid">
            Visualizing spatial defect propagation across time measurement rounds.
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-2">
          <div className="flex overflow-hidden rounded-lg border border-ink-600 bg-ink-800">
            <button
              type="button"
              onClick={() => setRenderMode('webgl')}
              className={`flex items-center gap-1.5 px-3 py-1.5 font-mono text-[12px] transition-colors ${
                renderMode === 'webgl'
                  ? 'bg-magic/20 text-magic font-bold'
                  : 'text-text-mid hover:text-text-hi'
              }`}
            >
              <Box className="h-3.5 w-3.5" /> 3D WebGL
            </button>
            <button
              type="button"
              onClick={() => setRenderMode('svg')}
              className={`flex items-center gap-1.5 px-3 py-1.5 font-mono text-[12px] transition-colors ${
                renderMode === 'svg'
                  ? 'bg-magic/20 text-magic font-bold'
                  : 'text-text-mid hover:text-text-hi'
              }`}
            >
              <Eye className="h-3.5 w-3.5" /> Isometric SVG
            </button>
          </div>
        </div>
      </div>

      {/* Layer selector and spacing toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-4 font-mono text-[12px] text-text-mid">
        <div className="flex items-center gap-1.5">
          <span className="text-text-low">Focus Round:</span>
          <button
            type="button"
            onClick={() => setSelectedRound('all')}
            className={`rounded px-2 py-1 transition-colors ${
              selectedRound === 'all'
                ? 'bg-plaquette/20 text-plaquette font-bold'
                : 'bg-ink-800 text-text-low hover:text-text-mid'
            }`}
          >
            All (1..{lat.d})
          </button>
          {roundsData.map((rd) => (
            <button
              key={rd.round}
              type="button"
              onClick={() => setSelectedRound(rd.round)}
              className={`rounded px-2.5 py-1 transition-colors ${
                selectedRound === rd.round
                  ? 'bg-plaquette/20 text-plaquette font-bold'
                  : 'bg-ink-800 text-text-low hover:text-text-mid'
              }`}
            >
              T={rd.round}
            </button>
          ))}
        </div>

        {renderMode === 'webgl' && (
          <div className="ml-auto flex items-center gap-2">
            <Sliders className="h-3.5 w-3.5 text-text-low" />
            <span className="text-text-low">Layer Gap:</span>
            <input
              type="range"
              min={0.8}
              max={2.5}
              step={0.1}
              value={layerSpacing}
              onChange={(e) => setLayerSpacing(Number(e.target.value))}
              className="w-24 accent-[#8B5CF6]"
            />
          </div>
        )}
      </div>

      {/* Render Canvas / SVG */}
      {renderMode === 'webgl' ? (
        <WebGLSpacetimeCanvas
          lat={lat}
          roundsData={roundsData}
          result={result}
          currentStep={currentStep}
          layerSpacing={layerSpacing}
          selectedRound={selectedRound}
        />
      ) : (
        <SvgIsometricSpacetime
          lat={lat}
          roundsData={roundsData}
          result={result}
          currentStep={currentStep}
          selectedRound={selectedRound}
        />
      )}

      {/* Spacetime Legend */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-ink-700 pt-3 font-mono text-[11px] text-text-low">
        <div className="flex items-center gap-4">
          <span>
            <span style={{ color: '#8B5CF6' }}>■</span> X face
          </span>
          <span>
            <span style={{ color: '#22D3EE' }}>■</span> Z face
          </span>
          <span>
            <span style={{ color: '#FB7185' }}>●</span> Spacetime Defect (3D Detector)
          </span>
          <span>
            <span style={{ color: '#34D399' }}>━</span> MWPM Matching Chain
          </span>
        </div>
        <span>3D graph size: d × d × d = {lat.d ** 3} spacetime nodes</span>
      </div>
    </div>
  );
}
