import { useEffect, useRef, useCallback } from 'react';
import { geoMercator, geoPath, geoContains } from 'd3-geo';
import type { FeatureCollection, Feature, Geometry } from 'geojson';
import type { ThemeObject, DenseRegion } from './types';

interface FlatMapProps {
  features: Feature<Geometry>[];
  region: DenseRegion;
  theme: ThemeObject;
  selectedCountry: string | null;
  numericToIso: Record<string, string>;
  onCountryClick: (isoCode: string, name: string) => void;
  onBack: () => void;
}

export function FlatMap({
  features,
  region,
  theme,
  selectedCountry,
  numericToIso,
  onCountryClick,
  onBack,
}: FlatMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hoveredRef = useRef<string | null>(null);

  const getProjection = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const { bounds } = region;
    const centerLng = (bounds.east + bounds.west) / 2;
    const centerLat = (bounds.north + bounds.south) / 2;
    const lngSpan = bounds.east - bounds.west;
    const latSpan = bounds.north - bounds.south;
    const scale = Math.min(
      canvas.width / (lngSpan * 0.02),
      canvas.height / (latSpan * 0.02),
    );
    return geoMercator()
      .center([centerLng, centerLat])
      .scale(scale)
      .translate([canvas.width / 2, canvas.height / 2]);
  }, [region]);

  const paint = useCallback(
    (hovered: string | null) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const projection = getProjection();
      if (!projection) return;

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = theme.globeOcean;
      ctx.fillRect(0, 0, w, h);

      const pathGen = geoPath(projection, ctx);
      const { bounds } = region;

      for (const f of features) {
        ctx.beginPath();
        pathGen(f);
        const numId = String(f.id);
        const iso = numericToIso[numId] ?? numId;

        if (iso === selectedCountry) {
          ctx.fillStyle = theme.globeSelected;
        } else if (iso === hovered) {
          ctx.fillStyle = theme.globeHover;
        } else {
          ctx.fillStyle = theme.globeLand;
        }
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    },
    [features, theme, selectedCountry, region, getProjection, numericToIso],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    canvas.width = parent.clientWidth * 2;
    canvas.height = parent.clientHeight * 2;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    paint(null);
  }, [paint]);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const projection = getProjection();
      if (!projection) return;

      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
      const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
      const coords = projection.invert?.([x, y]);
      if (!coords) return;

      for (const f of features) {
        if (geoContains(f, coords)) {
          const numId = String(f.id);
          const iso = numericToIso[numId] ?? numId;
          const name = (f.properties?.name as string) ?? iso;
          onCountryClick(iso, name);
          return;
        }
      }
    },
    [features, getProjection, numericToIso, onCountryClick],
  );

  const handleMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const projection = getProjection();
      if (!projection) return;

      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
      const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
      const coords = projection.invert?.([x, y]);
      if (!coords) return;

      let found: string | null = null;
      for (const f of features) {
        if (geoContains(f, coords)) {
          const numId = String(f.id);
          found = numericToIso[numId] ?? numId;
          break;
        }
      }

      if (found !== hoveredRef.current) {
        hoveredRef.current = found;
        paint(found);
      }
    },
    [features, getProjection, numericToIso, paint],
  );

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <button
        onClick={onBack}
        style={{
          position: 'absolute',
          top: 12,
          left: 12,
          zIndex: 10,
          background: theme.panelBackground,
          border: `1px solid ${theme.panelBorder}`,
          borderRadius: 8,
          padding: '6px 14px',
          color: theme.textPrimary,
          cursor: 'pointer',
          fontSize: 14,
        }}
      >
        ← Back to globe
      </button>
      <div
        style={{
          position: 'absolute',
          top: 12,
          left: '50%',
          transform: 'translateX(-50%)',
          background: theme.panelBackground,
          border: `1px solid ${theme.panelBorder}`,
          borderRadius: 8,
          padding: '6px 14px',
          color: theme.textPrimary,
          fontSize: 14,
          fontWeight: 500,
        }}
      >
        {region.label}
      </div>
      <canvas
        ref={canvasRef}
        onClick={handleClick}
        onMouseMove={handleMove}
        style={{ cursor: 'pointer' }}
      />
    </div>
  );
}
