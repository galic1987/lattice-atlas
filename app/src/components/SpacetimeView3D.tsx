import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import type { Material, Object3D } from 'three/src/Three.js';
import { Box, Eye, Layers, RotateCcw, Sliders } from 'lucide-react';
import type { DecodeResult, Lattice, Pauli, Stabilizer } from '@/lib/surfaceCode';
import { computeSyndrome } from '@/lib/surfaceCode';

const PAULI_COLORS_HEX: Record<Exclude<Pauli, 0>, number> = {
  1: 0x8b5cf6,
  2: 0x22d3ee,
  3: 0xf5b83d,
};

const SYNDROME_HEX = 0xfb7185;
const MEASUREMENT_HEX = 0xf5b83d;
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
  cumulativeErrors: Pauli[];
  newDataFaults: Set<number>;
  idealSyndrome: Set<string>;
  measuredSyndrome: Set<string>;
  measurementFaults: Set<string>;
  detectionEvents: Set<string>;
}

function hash01(seed: number): number {
  let x = Math.imul(seed ^ 0x9e3779b9, 0x85ebca6b);
  x ^= x >>> 13;
  x = Math.imul(x, 0xc2b2ae35);
  x ^= x >>> 16;
  return (x >>> 0) / 4294967296;
}

const historySeed = (lat: Lattice) => Math.imul(lat.d, 0x45d9f3b) >>> 0;

function symmetricDifference(a: Set<string>, b: Set<string>): Set<string> {
  const result = new Set<string>();
  for (const id of a) if (!b.has(id)) result.add(id);
  for (const id of b) if (!a.has(id)) result.add(id);
  return result;
}

function phenomenologicalHistory(lat: Lattice, initialErrors: Pauli[], p: number): RoundData[] {
  const history: RoundData[] = [];
  // Later sampled faults remain stable while the learner edits the T=1 frame.
  const seed = historySeed(lat);
  const faultRate = Math.max(0, Math.min(p, 0.5));
  const cumulativeErrors = Array.from(
    { length: lat.n },
    (_, q): Pauli => initialErrors[q] ?? 0,
  );
  let previousMeasured = new Set<string>();

  for (let round = 1; round <= lat.d; round++) {
    const newDataFaults = new Set<number>();

    // The painted error frame is loaded before round 1. From round 2 onward,
    // newly sampled Paulis compose into that frame instead of replacing it.
    if (round > 1) {
      for (let q = 0; q < lat.n; q++) {
        if (hash01(seed + round * 524287 + q * 8191) >= faultRate) continue;
        const pauli = (1 + Math.floor(hash01(seed + round * 8191 + q * 127 + 1) * 3)) as Pauli;
        cumulativeErrors[q] = (cumulativeErrors[q] ^ pauli) as Pauli;
        newDataFaults.add(q);
      }
    }

    const idealSyndrome = computeSyndrome(lat, cumulativeErrors);
    const measurementFaults = new Set<string>();
    const measuredSyndrome = new Set(idealSyndrome);

    lat.stabilizers.forEach((stabilizer, index) => {
      if (hash01(seed + round * 104729 + index * 15485863 + 7) >= faultRate) return;
      measurementFaults.add(stabilizer.id);
      if (measuredSyndrome.has(stabilizer.id)) measuredSyndrome.delete(stabilizer.id);
      else measuredSyndrome.add(stabilizer.id);
    });

    const detectionEvents = symmetricDifference(measuredSyndrome, previousMeasured);
    history.push({
      round,
      cumulativeErrors: [...cumulativeErrors],
      newDataFaults,
      idealSyndrome,
      measuredSyndrome,
      measurementFaults,
      detectionEvents,
    });
    previousMeasured = measuredSyndrome;
  }

  return history;
}

function hasVisibleMeasurementPair(rounds: RoundData[], index: number, stabilizerId: string): boolean {
  const current = rounds[index];
  const next = rounds[index + 1];
  return Boolean(
    next &&
      current.measurementFaults.has(stabilizerId) &&
      current.detectionEvents.has(stabilizerId) &&
      next.detectionEvents.has(stabilizerId),
  );
}

function WebGLSpacetimeCanvas({
  lat,
  roundsData,
  result,
  currentStep,
  layerSpacing,
  selectedRound,
  sceneSummary,
  descriptionId,
  onUnavailable,
}: {
  lat: Lattice;
  roundsData: RoundData[];
  result: DecodeResult | null;
  currentStep: number;
  layerSpacing: number;
  selectedRound: number | 'all';
  sceneSummary: string;
  descriptionId: string;
  onUnavailable: (message: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const renderRef = useRef<() => void>(() => undefined);
  const isDragging = useRef(false);
  const previousMouse = useRef({ x: 0, y: 0 });
  const rotation = useRef({ x: Math.PI / 6, y: -Math.PI / 4 });
  const zoomDistance = useRef(lat.d * 3.5);

  const renderNow = () => renderRef.current();

  useEffect(() => {
    zoomDistance.current = lat.d * 3.5;
  }, [lat.d]);

  const setCameraPreset = (preset: 'top' | 'oblique' | 'side' | 'reset') => {
    if (preset === 'top') rotation.current = { x: 1.35, y: 0 };
    else if (preset === 'side') rotation.current = { x: 0, y: Math.PI / 2 };
    else rotation.current = { x: Math.PI / 6, y: -Math.PI / 4 };
    if (preset === 'reset') zoomDistance.current = lat.d * 3.5;
    renderNow();
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      onUnavailable('WebGL could not start on this device. Showing the accessible SVG view instead.');
      return undefined;
    }

    const width = Math.max(container.clientWidth, 1);
    const height = Math.max(container.clientHeight, 1);
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.domElement.setAttribute('role', 'img');
    renderer.domElement.setAttribute('aria-label', sceneSummary);
    renderer.domElement.className = 'block h-full w-full';
    container.prepend(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const frontLight = new THREE.DirectionalLight(0xffffff, 0.8);
    frontLight.position.set(10, 20, 15);
    scene.add(frontLight);
    const backLight = new THREE.DirectionalLight(0x8b5cf6, 0.4);
    backLight.position.set(-10, -10, -10);
    scene.add(backLight);

    const d = lat.d;
    const gridScale = 1.2;
    const centerOffset = ((d - 1) * gridScale) / 2;
    const qubitPos3D = (q: number, t: number) => {
      const row = Math.floor(q / d);
      const column = q % d;
      return new THREE.Vector3(
        column * gridScale - centerOffset,
        (t - (roundsData.length + 1) / 2) * layerSpacing,
        row * gridScale - centerOffset,
      );
    };
    const stabilizerPos3D = (stabilizer: Stabilizer, t: number) =>
      new THREE.Vector3(
        (stabilizer.fc - 0.5) * gridScale - centerOffset,
        (t - (roundsData.length + 1) / 2) * layerSpacing,
        (stabilizer.fr - 0.5) * gridScale - centerOffset,
      );

    roundsData.forEach((roundData, roundIndex) => {
      const t = roundData.round;
      if (selectedRound !== 'all' && selectedRound !== t) return;
      const layerY = (t - (roundsData.length + 1) / 2) * layerSpacing;

      const plane = new THREE.Mesh(
        new THREE.PlaneGeometry((d + 0.5) * gridScale, (d + 0.5) * gridScale),
        new THREE.MeshBasicMaterial({
          color: 0x1e293b,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.25,
        }),
      );
      plane.rotation.x = Math.PI / 2;
      plane.position.y = layerY;
      scene.add(plane);

      lat.stabilizers.forEach((stabilizer) => {
        const measuredMinus = roundData.measuredSyndrome.has(stabilizer.id) && currentStep >= 2;
        const hasDetectionEvent = roundData.detectionEvents.has(stabilizer.id) && currentStep >= 3;
        const hasMeasurementFault = roundData.measurementFaults.has(stabilizer.id) && currentStep >= 2;
        const baseColor = stabilizer.type === 'X' ? PAULI_COLORS_HEX[1] : PAULI_COLORS_HEX[2];
        const position = stabilizerPos3D(stabilizer, t);

        const face = new THREE.Mesh(
          new THREE.PlaneGeometry(gridScale * 0.9, gridScale * 0.9),
          new THREE.MeshLambertMaterial({
            color: measuredMinus ? SYNDROME_HEX : baseColor,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: measuredMinus ? 0.6 : 0.14,
          }),
        );
        face.rotation.x = Math.PI / 2;
        face.position.copy(position);
        scene.add(face);

        if (hasDetectionEvent) {
          const marker = new THREE.Mesh(
            new THREE.SphereGeometry(0.22, 14, 14),
            new THREE.MeshStandardMaterial({
              color: SYNDROME_HEX,
              emissive: SYNDROME_HEX,
              emissiveIntensity: 0.7,
              roughness: 0.2,
            }),
          );
          marker.position.copy(position);
          scene.add(marker);
        }

        if (hasMeasurementFault) {
          const ring = new THREE.Mesh(
            new THREE.TorusGeometry(0.31, 0.035, 8, 24),
            new THREE.MeshBasicMaterial({ color: MEASUREMENT_HEX }),
          );
          ring.rotation.x = Math.PI / 2;
          ring.position.copy(position);
          scene.add(ring);
        }

        if (
          selectedRound === 'all' &&
          currentStep >= 3 &&
          hasVisibleMeasurementPair(roundsData, roundIndex, stabilizer.id)
        ) {
          const geometry = new THREE.BufferGeometry().setFromPoints([
            position,
            stabilizerPos3D(stabilizer, t + 1),
          ]);
          const line = new THREE.Line(
            geometry,
            new THREE.LineDashedMaterial({
              color: MEASUREMENT_HEX,
              dashSize: 0.2,
              gapSize: 0.1,
            }),
          );
          line.computeLineDistances();
          scene.add(line);
        }
      });

      roundData.cumulativeErrors.forEach((error, q) => {
        const hasError = error !== 0 && currentStep >= 1;
        const color = hasError ? PAULI_COLORS_HEX[error as Exclude<Pauli, 0>] : NEUTRAL_QUBIT_HEX;
        const sphere = new THREE.Mesh(
          new THREE.SphereGeometry(hasError ? 0.2 : 0.1, 12, 12),
          new THREE.MeshStandardMaterial({
            color,
            emissive: hasError ? color : 0x000000,
            emissiveIntensity: roundData.newDataFaults.has(q) ? 0.9 : hasError ? 0.45 : 0,
            roughness: 0.3,
          }),
        );
        sphere.position.copy(qubitPos3D(q, t));
        scene.add(sphere);
      });
    });

    // This remains a spatial overlay on the painted frame at T=1. It is not
    // presented or used as a spacetime decoder.
    if (result && currentStep >= 4 && (selectedRound === 'all' || selectedRound === 1)) {
      const stabilizerById = new Map(lat.stabilizers.map((stabilizer) => [stabilizer.id, stabilizer]));
      result.matches.forEach((match) => {
        const start = stabilizerById.get(match.a);
        if (!start) return;
        const points: THREE.Vector3[] = [stabilizerPos3D(start, 1)];
        match.qubits.forEach((q) => points.push(qubitPos3D(q, 1)));
        if (match.b !== 'boundary') {
          const end = stabilizerById.get(match.b);
          if (end) points.push(stabilizerPos3D(end, 1));
        }
        if (points.length < 2) return;
        const curve = new THREE.CatmullRomCurve3(points);
        const tube = new THREE.Mesh(
          new THREE.TubeGeometry(curve, 20, 0.06, 8, false),
          new THREE.MeshStandardMaterial({
            color: OK_HEX,
            emissive: OK_HEX,
            emissiveIntensity: 0.7,
          }),
        );
        scene.add(tube);
      });
    }

    const render = () => {
      const radius = zoomDistance.current;
      const cameraX = radius * Math.sin(rotation.current.y) * Math.cos(rotation.current.x);
      const cameraY = radius * Math.sin(rotation.current.x);
      const cameraZ = radius * Math.cos(rotation.current.y) * Math.cos(rotation.current.x);
      camera.position.set(cameraX, cameraY, cameraZ);
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    };
    renderRef.current = render;
    render();

    const resizeObserver = new ResizeObserver(() => {
      const nextWidth = Math.max(container.clientWidth, 1);
      const nextHeight = Math.max(container.clientHeight, 1);
      camera.aspect = nextWidth / nextHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(nextWidth, nextHeight);
      render();
    });
    resizeObserver.observe(container);

    const handleContextLost = (event: Event) => {
      event.preventDefault();
      onUnavailable('The WebGL context was lost. Showing the accessible SVG view instead.');
    };
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost);

    return () => {
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
      renderRef.current = () => undefined;
      scene.traverse((object: Object3D) => {
        if (!(object instanceof THREE.Mesh || object instanceof THREE.Line)) return;
        object.geometry.dispose();
        const materials: Material[] = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((material) => material.dispose());
      });
      scene.clear();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
      renderer.dispose();
      renderer.forceContextLoss();
    };
  }, [currentStep, lat, layerSpacing, onUnavailable, result, roundsData, sceneSummary, selectedRound]);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    isDragging.current = true;
    previousMouse.current = { x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    rotation.current.y += (event.clientX - previousMouse.current.x) * 0.008;
    rotation.current.x = Math.max(
      -Math.PI / 2.2,
      Math.min(Math.PI / 2.2, rotation.current.x + (event.clientY - previousMouse.current.y) * 0.008),
    );
    previousMouse.current = { x: event.clientX, y: event.clientY };
    renderNow();
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    isDragging.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    if (!event.ctrlKey && !event.metaKey) return;
    event.preventDefault();
    zoomDistance.current = Math.max(
      lat.d * 1.5,
      Math.min(lat.d * 8, zoomDistance.current + event.deltaY * 0.01),
    );
    renderNow();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    let handled = true;
    if (event.key === 'ArrowLeft') rotation.current.y -= 0.12;
    else if (event.key === 'ArrowRight') rotation.current.y += 0.12;
    else if (event.key === 'ArrowUp') rotation.current.x = Math.min(1.4, rotation.current.x + 0.12);
    else if (event.key === 'ArrowDown') rotation.current.x = Math.max(-1.4, rotation.current.x - 0.12);
    else if (event.key === '+' || event.key === '=') zoomDistance.current = Math.max(lat.d * 1.5, zoomDistance.current - 0.5);
    else if (event.key === '-') zoomDistance.current = Math.min(lat.d * 8, zoomDistance.current + 0.5);
    else if (event.key === '1') setCameraPreset('top');
    else if (event.key === '2') setCameraPreset('oblique');
    else if (event.key === '3') setCameraPreset('side');
    else if (event.key === '0') setCameraPreset('reset');
    else handled = false;
    if (!handled) return;
    event.preventDefault();
    renderNow();
  };

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label="Interactive spacetime camera"
      aria-describedby={descriptionId}
      tabIndex={0}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onWheel={handleWheel}
      onKeyDown={handleKeyDown}
      className="relative h-[400px] w-full min-w-0 cursor-grab overflow-hidden rounded-lg bg-ink-900 outline-none ring-magic/70 focus-visible:ring-2 active:cursor-grabbing md:h-[440px]"
    >
      <div className="pointer-events-none absolute left-2 top-2 z-10 max-w-[calc(100%-7rem)] rounded-md bg-ink-850/90 p-2 font-mono text-[11px] text-text-mid backdrop-blur md:left-4 md:top-4 md:p-2.5 md:text-xs">
        <span className="block font-bold text-text-hi">Fixed-seed phenomenological sample</span>
        <span className="block">Drag or arrows: rotate · Ctrl/⌘ + scroll or +/−: zoom</span>
        <span className="block text-text-low">Rounds 1–{roundsData.length} stack on the vertical axis</span>
      </div>
      <div className="absolute bottom-2 right-2 z-20 flex gap-1 md:bottom-auto md:right-4 md:top-4">
        {([
          ['top', '1', 'Top camera'],
          ['oblique', '2', 'Oblique camera'],
          ['side', '3', 'Side camera'],
        ] as const).map(([preset, label, ariaLabel]) => (
          <button
            key={preset}
            type="button"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              setCameraPreset(preset);
            }}
            className="btn-ghost !h-8 !min-h-8 !w-8 !p-0 font-mono text-[11px] text-text-mid"
            aria-label={ariaLabel}
          >
            {label}
          </button>
        ))}
        <button
          type="button"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation();
            setCameraPreset('reset');
          }}
          className="btn-ghost !h-8 !min-h-8 !w-8 !p-0 text-text-mid"
          aria-label="Reset 3D camera"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function SvgIsometricSpacetime({
  lat,
  roundsData,
  result,
  currentStep,
  selectedRound,
  sceneSummary,
}: {
  lat: Lattice;
  roundsData: RoundData[];
  result: DecodeResult | null;
  currentStep: number;
  selectedRound: number | 'all';
  sceneSummary: string;
}) {
  const d = lat.d;
  const cell = 44;
  const cos = Math.cos(0.52);
  const sin = Math.sin(0.52);
  const toIso = (x: number, y: number, z: number) => ({
    x: (x - y) * cos * cell,
    y: (x + y) * sin * cell - z * 64,
  });
  const centerOffset = (d - 1) / 2;
  const sizeX = 700;
  const sizeY = 520;
  const viewWidth = d === 3 ? 420 : d === 5 ? 560 : sizeX;
  const viewX = (sizeX - viewWidth) / 2;
  const originX = sizeX / 2;
  const originY = sizeY / 2 + (roundsData.length * 32) / 2;
  const stabilizerById = new Map(lat.stabilizers.map((stabilizer) => [stabilizer.id, stabilizer]));

  return (
    <div className="relative h-[400px] w-full min-w-0 overflow-hidden rounded-lg bg-ink-900 p-2 md:h-[440px]">
      <svg viewBox={`${viewX} 0 ${viewWidth} ${sizeY}`} className="h-full w-full" role="img" aria-label={sceneSummary}>
        <title>Phenomenological surface-code history</title>
        <desc>{sceneSummary}</desc>
        {roundsData.map((roundData, roundIndex) => {
          const t = roundData.round;
          if (selectedRound !== 'all' && selectedRound !== t) return null;
          const layerZ = t - 1;
          return (
            <g key={`round-${t}`}>
              <path
                d={
                  `M ${originX + toIso(-0.5 - centerOffset, -0.5 - centerOffset, layerZ).x} ${originY + toIso(-0.5 - centerOffset, -0.5 - centerOffset, layerZ).y} ` +
                  `L ${originX + toIso(d - 0.5 - centerOffset, -0.5 - centerOffset, layerZ).x} ${originY + toIso(d - 0.5 - centerOffset, -0.5 - centerOffset, layerZ).y} ` +
                  `L ${originX + toIso(d - 0.5 - centerOffset, d - 0.5 - centerOffset, layerZ).x} ${originY + toIso(d - 0.5 - centerOffset, d - 0.5 - centerOffset, layerZ).y} ` +
                  `L ${originX + toIso(-0.5 - centerOffset, d - 0.5 - centerOffset, layerZ).x} ${originY + toIso(-0.5 - centerOffset, d - 0.5 - centerOffset, layerZ).y} Z`
                }
                fill="#1E293B"
                fillOpacity={0.2}
                stroke="#475569"
                strokeWidth={1}
                strokeDasharray="4 4"
              />
              <text
                x={originX + toIso(-0.8 - centerOffset, -0.8 - centerOffset, layerZ).x}
                y={originY + toIso(-0.8 - centerOffset, -0.8 - centerOffset, layerZ).y}
                fill="#A9B4CC"
                fontSize={18}
                fontFamily="'JetBrains Mono', monospace"
              >
                T={t}
              </text>

              {lat.stabilizers.map((stabilizer) => {
                const measuredMinus = roundData.measuredSyndrome.has(stabilizer.id) && currentStep >= 2;
                const hasDetectionEvent = roundData.detectionEvents.has(stabilizer.id) && currentStep >= 3;
                const hasMeasurementFault = roundData.measurementFaults.has(stabilizer.id) && currentStep >= 2;
                const baseColor = stabilizer.type === 'X' ? '#8B5CF6' : '#22D3EE';
                const color = measuredMinus ? '#FB7185' : baseColor;
                const scx = stabilizer.fc - 0.5 - centerOffset;
                const scy = stabilizer.fr - 0.5 - centerOffset;
                const point = toIso(scx, scy, layerZ);
                const corners = [
                  toIso(scx - 0.4, scy - 0.4, layerZ),
                  toIso(scx + 0.4, scy - 0.4, layerZ),
                  toIso(scx + 0.4, scy + 0.4, layerZ),
                  toIso(scx - 0.4, scy + 0.4, layerZ),
                ];
                return (
                  <g key={stabilizer.id}>
                    <polygon
                      points={corners.map((corner) => `${originX + corner.x},${originY + corner.y}`).join(' ')}
                      fill={color}
                      fillOpacity={measuredMinus ? 0.55 : 0.12}
                      stroke={color}
                      strokeWidth={measuredMinus ? 1.5 : 0.8}
                    />
                    {hasDetectionEvent && (
                      <circle cx={originX + point.x} cy={originY + point.y} r={6} fill="#FB7185" />
                    )}
                    {hasMeasurementFault && (
                      <circle
                        cx={originX + point.x}
                        cy={originY + point.y}
                        r={9}
                        fill="none"
                        stroke="#F5B83D"
                        strokeWidth={2}
                      />
                    )}
                    {selectedRound === 'all' &&
                      currentStep >= 3 &&
                      hasVisibleMeasurementPair(roundsData, roundIndex, stabilizer.id) && (
                        <line
                          x1={originX + point.x}
                          y1={originY + point.y}
                          x2={originX + toIso(scx, scy, layerZ + 1).x}
                          y2={originY + toIso(scx, scy, layerZ + 1).y}
                          stroke="#F5B83D"
                          strokeWidth={2}
                          strokeDasharray="3 3"
                        />
                      )}
                  </g>
                );
              })}

              {roundData.cumulativeErrors.map((error, q) => {
                const row = Math.floor(q / d) - centerOffset;
                const column = (q % d) - centerOffset;
                const point = toIso(column, row, layerZ);
                const hasError = error !== 0 && currentStep >= 1;
                return (
                  <circle
                    key={q}
                    cx={originX + point.x}
                    cy={originY + point.y}
                    r={hasError ? (roundData.newDataFaults.has(q) ? 6 : 5) : 2.5}
                    fill={
                      hasError
                        ? error === 1
                          ? '#8B5CF6'
                          : error === 2
                            ? '#22D3EE'
                            : '#F5B83D'
                        : '#526281'
                    }
                    stroke={roundData.newDataFaults.has(q) ? '#EAF0FB' : 'none'}
                    strokeWidth={roundData.newDataFaults.has(q) ? 1.5 : 0}
                  />
                );
              })}

              {t === 1 && result && currentStep >= 4 &&
                result.matches.map((match, index) => {
                  const start = stabilizerById.get(match.a);
                  if (!start) return null;
                  const points = [
                    toIso(start.fc - 0.5 - centerOffset, start.fr - 0.5 - centerOffset, layerZ),
                    ...match.qubits.map((q) =>
                      toIso((q % d) - centerOffset, Math.floor(q / d) - centerOffset, layerZ),
                    ),
                  ];
                  if (match.b !== 'boundary') {
                    const end = stabilizerById.get(match.b);
                    if (end) points.push(toIso(end.fc - 0.5 - centerOffset, end.fr - 0.5 - centerOffset, layerZ));
                  }
                  if (points.length < 2) return null;
                  return (
                    <polyline
                      key={`${match.a}-${match.b}-${index}`}
                      points={points.map((point) => `${originX + point.x},${originY + point.y}`).join(' ')}
                      fill="none"
                      stroke="#34D399"
                      strokeWidth={3}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  );
                })}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

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
  const [renderNotice, setRenderNotice] = useState<string | null>(null);
  const descriptionId = 'spacetime-model-description';

  const roundsData = useMemo(() => phenomenologicalHistory(lat, errors, p), [lat, errors, p]);
  const visibleRounds = selectedRound === 'all'
    ? roundsData
    : roundsData.filter((roundData) => roundData.round === selectedRound);
  const eventCount = visibleRounds.reduce((sum, roundData) => sum + roundData.detectionEvents.size, 0);
  const dataFaultCount = visibleRounds.reduce((sum, roundData) => sum + roundData.newDataFaults.size, 0);
  const measurementFaultCount = visibleRounds.reduce(
    (sum, roundData) => sum + roundData.measurementFaults.size,
    0,
  );
  const sceneSummary = `Distance-${lat.d} fixed-seed phenomenological history showing ${visibleRounds.length} measurement round${visibleRounds.length === 1 ? '' : 's'}, ${eventCount} detection events, ${dataFaultCount} new data faults after round 1, and ${measurementFaultCount} measurement faults. Painted errors form the initial frame. Later data faults accumulate. Detection events are changes between measured check outcomes, starting from an expected all-plus-one record.`;

  const handleWebGLUnavailable = (message: string) => {
    setRenderNotice(message);
    setRenderMode('svg');
  };

  return (
    <div className="min-w-0 overflow-hidden rounded-xl border border-ink-600 bg-ink-850 p-4 md:p-6">
      <div className="mb-4 flex min-w-0 flex-wrap items-center justify-between gap-3 border-b border-ink-700 pb-4">
        <div className="min-w-0">
          <h3 className="flex items-start gap-2 font-display text-lg font-semibold text-text-hi">
            <Layers className="mt-0.5 h-5 w-5 shrink-0 text-magic" />
            <span>Phenomenological spacetime sample</span>
          </h3>
          <p className="mt-1 max-w-3xl text-[13px] leading-relaxed text-text-mid">
            The painted Pauli frame is measured at T=1. From T=2 onward, fixed-seed data faults accumulate and independent measurement faults flip readouts, with p<sub>data</sub> = p<sub>measurement</sub> = {(p * 100).toFixed(1)}%.
          </p>
        </div>

        <div className="flex max-w-full overflow-hidden rounded-lg border border-ink-600 bg-ink-800" aria-label="Spacetime render mode">
          <button
            type="button"
            onClick={() => setRenderMode('webgl')}
            aria-pressed={renderMode === 'webgl'}
            className={`flex min-w-0 items-center gap-1.5 px-2.5 py-1.5 font-mono text-[12px] transition-colors md:px-3 ${
              renderMode === 'webgl' ? 'bg-magic/20 font-bold text-magic' : 'text-text-mid hover:text-text-hi'
            }`}
          >
            <Box className="h-3.5 w-3.5 shrink-0" /> WebGL
          </button>
          <button
            type="button"
            onClick={() => setRenderMode('svg')}
            aria-pressed={renderMode === 'svg'}
            className={`flex min-w-0 items-center gap-1.5 px-2.5 py-1.5 font-mono text-[12px] transition-colors md:px-3 ${
              renderMode === 'svg' ? 'bg-magic/20 font-bold text-magic' : 'text-text-mid hover:text-text-hi'
            }`}
          >
            <Eye className="h-3.5 w-3.5 shrink-0" /> SVG
          </button>
        </div>
      </div>

      <p id={descriptionId} className="mb-4 rounded-lg border border-plaquette/30 bg-plaquette/[0.06] p-3 text-[12px] leading-relaxed text-text-mid">
        <strong className="text-text-hi">What is verified here:</strong> a detection event is the parity change between consecutive measured check outcomes, starting from a record in which every check reports +1. Amber rings mark sampled measurement faults; an amber vertical segment appears only when that fault produces a visible event pair in adjacent rounds. The finite window ends after T={lat.d}, without a terminal data measurement. The green path, when present, is the existing <strong className="text-stabilizer">T=1 spatial decoder overlay</strong> for the painted frame—not a 3D decoder. It is not fed forward into later rounds. No spacetime MWPM is run.
      </p>

      <div className="mb-4 flex min-w-0 flex-wrap items-center gap-3 font-mono text-[12px] text-text-mid">
        <div className="flex min-w-0 flex-wrap items-center gap-1.5" aria-label="Visible measurement round">
          <span className="mr-1 text-text-low">Focus:</span>
          <button
            type="button"
            onClick={() => setSelectedRound('all')}
            aria-pressed={selectedRound === 'all'}
            className={`rounded px-2 py-1 transition-colors ${
              selectedRound === 'all' ? 'bg-plaquette/20 font-bold text-plaquette' : 'bg-ink-800 text-text-low hover:text-text-mid'
            }`}
          >
            All
          </button>
          {roundsData.map((roundData) => (
            <button
              key={roundData.round}
              type="button"
              onClick={() => setSelectedRound(roundData.round)}
              aria-pressed={selectedRound === roundData.round}
              className={`rounded px-2 py-1 transition-colors ${
                selectedRound === roundData.round
                  ? 'bg-plaquette/20 font-bold text-plaquette'
                  : 'bg-ink-800 text-text-low hover:text-text-mid'
              }`}
            >
              T={roundData.round}
            </button>
          ))}
        </div>

        {renderMode === 'webgl' && (
          <label className="ml-auto flex items-center gap-2" htmlFor="spacetime-layer-gap">
            <Sliders className="h-3.5 w-3.5 text-text-low" />
            <span className="text-text-low">Layer gap</span>
            <input
              id="spacetime-layer-gap"
              type="range"
              min={0.8}
              max={2.5}
              step={0.1}
              value={layerSpacing}
              onChange={(event) => setLayerSpacing(Number(event.target.value))}
              className="w-20 accent-[#8B5CF6] md:w-24"
            />
          </label>
        )}
      </div>

      {renderNotice && (
        <p role="status" className="mb-3 rounded-md border border-magic/40 bg-magic/[0.08] p-2 text-[12px] text-text-mid">
          {renderNotice}
        </p>
      )}

      {renderMode === 'webgl' ? (
        <WebGLSpacetimeCanvas
          lat={lat}
          roundsData={roundsData}
          result={result}
          currentStep={currentStep}
          layerSpacing={layerSpacing}
          selectedRound={selectedRound}
          sceneSummary={sceneSummary}
          descriptionId={descriptionId}
          onUnavailable={handleWebGLUnavailable}
        />
      ) : (
        <SvgIsometricSpacetime
          lat={lat}
          roundsData={roundsData}
          result={result}
          currentStep={currentStep}
          selectedRound={selectedRound}
          sceneSummary={sceneSummary}
        />
      )}

      <div className="mt-3 flex min-w-0 flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-ink-700 pt-3 font-mono text-xs text-text-low">
        <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1">
          <span><span style={{ color: '#8B5CF6' }}>■</span>/<span style={{ color: '#22D3EE' }}>■</span> X/Z check face</span>
          <span><span style={{ color: '#8B5CF6' }}>●</span>/<span style={{ color: '#22D3EE' }}>●</span>/<span style={{ color: '#F5B83D' }}>●</span> X/Z/Y data frame</span>
          <span><span style={{ color: '#FB7185' }}>■</span> measured −1</span>
          <span><span style={{ color: '#FB7185' }}>●</span> detection event</span>
          <span><span style={{ color: '#F5B83D' }}>◎</span> measurement fault</span>
          <span><span style={{ color: '#F5B83D' }}>┊</span> observed temporal pair</span>
          <span><span style={{ color: '#34D399' }}>━</span> T=1 spatial overlay</span>
        </div>
        <span>{lat.d} rounds × {lat.stabilizers.length} measured checks</span>
      </div>
    </div>
  );
}
