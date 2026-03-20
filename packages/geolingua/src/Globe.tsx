import { useEffect, useRef, useCallback, useState } from 'react';
import * as THREE from 'three';
import { geoContains, geoEquirectangular, geoPath } from 'd3-geo';
import * as topojson from 'topojson-client';
import type { Topology } from 'topojson-specification';
import type { FeatureCollection, Feature, Geometry } from 'geojson';
import type { ThemeObject } from './types';
import { GeoLinguaError } from './types';
import { cartesianToLatLng } from './utils/geoMath';
import { COUNTRY_LANGUAGES } from './data/languages';

// GeoJSON: Natural Earth (naturalearthdata.com) — Public Domain
const TOPO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json';

interface GlobeProps {
  theme: ThemeObject;
  selectedCountry: string | null;
  onCountryHover: (isoCode: string | null, name: string | null) => void;
  onCountryClick: (isoCode: string, name: string) => void;
  onReady?: () => void;
  onError?: (error: GeoLinguaError) => void;
  rotationSpeed?: number;
  ariaLabel?: string;
}

// Map of numeric ID -> ISO alpha-2 codes (subset of most-used)
// The world-atlas TopoJSON uses numeric IDs from Natural Earth
const NUMERIC_TO_ISO: Record<string, string> = {
  '4': 'AF', '8': 'AL', '12': 'DZ', '20': 'AD', '24': 'AO', '28': 'AG', '32': 'AR',
  '36': 'AU', '40': 'AT', '44': 'BS', '48': 'BH', '50': 'BD', '51': 'AM', '56': 'BE',
  '64': 'BT', '68': 'BO', '70': 'BA', '72': 'BW', '76': 'BR', '84': 'BZ', '90': 'SB',
  '96': 'BN', '100': 'BG', '104': 'MM', '108': 'BI', '112': 'BY', '116': 'KH',
  '120': 'CM', '124': 'CA', '132': 'CV', '140': 'CF', '144': 'LK', '148': 'TD',
  '152': 'CL', '156': 'CN', '170': 'CO', '174': 'KM', '178': 'CG', '180': 'CD',
  '188': 'CR', '191': 'HR', '192': 'CU', '196': 'CY', '203': 'CZ', '204': 'BJ',
  '208': 'DK', '214': 'DO', '218': 'EC', '222': 'SV', '226': 'GQ', '231': 'ET',
  '232': 'ER', '233': 'EE', '242': 'FJ', '246': 'FI', '250': 'FR', '262': 'DJ',
  '266': 'GA', '268': 'GE', '270': 'GM', '276': 'DE', '288': 'GH', '300': 'GR',
  '320': 'GT', '324': 'GN', '328': 'GY', '332': 'HT', '340': 'HN', '348': 'HU',
  '352': 'IS', '356': 'IN', '360': 'ID', '364': 'IR', '368': 'IQ', '372': 'IE',
  '376': 'IL', '380': 'IT', '384': 'CI', '388': 'JM', '392': 'JP', '398': 'KZ',
  '400': 'JO', '404': 'KE', '408': 'KP', '410': 'KR', '414': 'KW', '417': 'KG',
  '418': 'LA', '422': 'LB', '426': 'LS', '428': 'LV', '430': 'LR', '434': 'LY',
  '440': 'LT', '442': 'LU', '450': 'MG', '454': 'MW', '458': 'MY', '466': 'ML',
  '478': 'MR', '480': 'MU', '484': 'MX', '496': 'MN', '498': 'MD', '504': 'MA',
  '508': 'MZ', '512': 'OM', '516': 'NA', '524': 'NP', '528': 'NL', '540': 'NC',
  '548': 'VU', '554': 'NZ', '558': 'NI', '562': 'NE', '566': 'NG', '578': 'NO',
  '586': 'PK', '591': 'PA', '598': 'PG', '600': 'PY', '604': 'PE', '608': 'PH',
  '616': 'PL', '620': 'PT', '624': 'GW', '626': 'TL', '630': 'PR', '634': 'QA',
  '642': 'RO', '643': 'RU', '646': 'RW', '682': 'SA', '686': 'SN', '694': 'SL',
  '702': 'SG', '703': 'SK', '704': 'VN', '705': 'SI', '706': 'SO', '710': 'ZA',
  '716': 'ZW', '724': 'ES', '728': 'SS', '729': 'SD', '740': 'SR', '748': 'SZ',
  '752': 'SE', '756': 'CH', '760': 'SY', '762': 'TJ', '764': 'TH', '768': 'TG',
  '780': 'TT', '784': 'AE', '788': 'TN', '792': 'TR', '795': 'TM', '800': 'UG',
  '804': 'UA', '807': 'MK', '818': 'EG', '826': 'GB', '834': 'TZ', '840': 'US',
  '854': 'BF', '858': 'UY', '860': 'UZ', '862': 'VE', '887': 'YE', '894': 'ZM',
  // Additional territories
  '158': 'TW', '275': 'PS', '304': 'GL', '499': 'ME', '688': 'RS', '810': 'RU',
  '736': 'SD',
};

let cachedGeoData: FeatureCollection | null = null;

async function loadGeoData(): Promise<FeatureCollection> {
  if (cachedGeoData) return cachedGeoData;
  const res = await fetch(TOPO_URL);
  const topo = (await res.json()) as Topology;
  const fc = topojson.feature(topo, topo.objects.countries) as FeatureCollection;
  cachedGeoData = fc;
  return fc;
}

function paintCountries(
  canvas: HTMLCanvasElement,
  features: Feature<Geometry>[],
  theme: ThemeObject,
  hoveredId: string | null,
  selectedId: string | null,
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  const projection = geoEquirectangular()
    .scale(w / (2 * Math.PI))
    .translate([w / 2, h / 2]);
  const pathGen = geoPath(projection, ctx);

  // Ocean background
  ctx.fillStyle = theme.globeOcean;
  ctx.fillRect(0, 0, w, h);

  // Draw all countries
  for (const f of features) {
    ctx.beginPath();
    pathGen(f);
    const fId = String(Number(f.id));
    const iso = NUMERIC_TO_ISO[fId] ?? fId;

    if (iso === selectedId) {
      ctx.fillStyle = theme.globeSelected;
    } else if (iso === hoveredId) {
      ctx.fillStyle = theme.globeHover;
    } else {
      ctx.fillStyle = theme.globeLand;
    }
    ctx.fill();

    // Borders
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.lineWidth = 0.5;
    ctx.stroke();
  }
}

function findCountryAtPoint(
  features: Feature<Geometry>[],
  lng: number,
  lat: number,
): { id: string; iso: string; name: string } | null {
  for (const f of features) {
    if (geoContains(f, [lng, lat])) {
      const numId = String(Number(f.id));
      const iso = NUMERIC_TO_ISO[numId] ?? numId;
      // Use our own language data for the country name (world-atlas has no name property)
      const name = COUNTRY_LANGUAGES[iso]?.name ?? iso;
      return { id: numId, iso, name };
    }
  }
  return null;
}

export function Globe({
  theme,
  selectedCountry,
  onCountryHover,
  onCountryClick,
  onReady,
  onError,
  rotationSpeed = 0.002,
  ariaLabel = 'Interactive world map. Tap your country to see available languages.',
}: GlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const globeRef = useRef<THREE.Mesh | null>(null);
  const textureCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const textureRef = useRef<THREE.CanvasTexture | null>(null);
  const featuresRef = useRef<Feature<Geometry>[]>([]);
  const rafRef = useRef<number>(0);
  const isInteractingRef = useRef(false);
  const isDraggingRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const hoveredRef = useRef<string | null>(null);
  const rotationRef = useRef({ x: 0, y: 0 });
  const zoomRef = useRef(2.8);
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);

  // Repaint the texture canvas when hover/selection changes
  const repaint = useCallback(
    (hovered: string | null) => {
      if (!textureCanvasRef.current || featuresRef.current.length === 0) return;
      paintCountries(
        textureCanvasRef.current,
        featuresRef.current,
        theme,
        hovered,
        selectedCountry,
      );
      if (textureRef.current) textureRef.current.needsUpdate = true;
    },
    [theme, selectedCountry],
  );

  // Initialize Three.js scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const w = container.clientWidth;
    const h = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000);
    camera.position.z = zoomRef.current;
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const sunlight = new THREE.DirectionalLight(0xfff8e0, 1.2);
    sunlight.position.set(2, 1.5, 1);
    scene.add(sunlight);
    const ambient = new THREE.AmbientLight(0x404060, 0.6);
    scene.add(ambient);

    // Texture canvas for country overlay — 4096×2048 for crisp zoom
    const texCanvas = document.createElement('canvas');
    texCanvas.width = 4096;
    texCanvas.height = 2048;
    textureCanvasRef.current = texCanvas;

    const texture = new THREE.CanvasTexture(texCanvas);
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    textureRef.current = texture;

    // Globe sphere
    const geometry = new THREE.SphereGeometry(1, 64, 64);
    const material = new THREE.MeshPhongMaterial({
      map: texture,
      specular: 0x111111,
      shininess: 10,
    });
    const globe = new THREE.Mesh(geometry, material);
    scene.add(globe);
    globeRef.current = globe;

    // Atmosphere glow
    const atmosGeom = new THREE.SphereGeometry(1.015, 64, 64);
    const atmosMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(theme.accent),
      transparent: true,
      opacity: 0.08,
      side: THREE.BackSide,
    });
    const atmos = new THREE.Mesh(atmosGeom, atmosMat);
    scene.add(atmos);

    // Load GeoJSON
    loadGeoData().then((fc) => {
      featuresRef.current = fc.features;
      paintCountries(texCanvas, fc.features, theme, null, selectedCountry);
      texture.needsUpdate = true;
      setIsLoading(false);
      setIsReady(true);
      onReady?.();
    }).catch(() => {
      setIsLoading(false);
      onError?.(new GeoLinguaError('geo_data_load_failed'));
    });

    // Animation loop
    function animate() {
      rafRef.current = requestAnimationFrame(animate);
      if (globe && !isInteractingRef.current) {
        rotationRef.current.y += rotationSpeed;
        globe.rotation.y = rotationRef.current.y;
      }
      renderer.render(scene, camera);
    }
    animate();

    // Handle resize
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      if (width === 0 || height === 0) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    });
    ro.observe(container);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      texture.dispose();
      atmosGeom.dispose();
      atmosMat.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Repaint when theme or selected country changes
  useEffect(() => {
    repaint(hoveredRef.current);
  }, [repaint]);

  // Raycasting helper
  const getCountryAtEvent = useCallback(
    (clientX: number, clientY: number) => {
      const container = containerRef.current;
      const camera = cameraRef.current;
      const globe = globeRef.current;
      if (!container || !camera || !globe) return null;

      const rect = container.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((clientX - rect.left) / rect.width) * 2 - 1,
        -((clientY - rect.top) / rect.height) * 2 + 1,
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(globe);
      if (intersects.length === 0) return null;

      const point = intersects[0].point.clone();
      // Transform point from world to globe's local space
      globe.worldToLocal(point);
      const [lat, lng] = cartesianToLatLng(point);
      return findCountryAtPoint(featuresRef.current, lng, lat);
    },
    [],
  );

  // Mouse handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isDraggingRef.current = false;
    isInteractingRef.current = true;
    prevMouseRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (e.buttons > 0 && isInteractingRef.current) {
        // Dragging to rotate
        const dx = e.clientX - prevMouseRef.current.x;
        const dy = e.clientY - prevMouseRef.current.y;

        // Only start dragging after a 5px threshold to avoid accidental drags
        if (!isDraggingRef.current) {
          if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
            isDraggingRef.current = true;
          } else {
            return; // Don't rotate yet — might be a click
          }
        }

        const globe = globeRef.current;
        if (globe) {
          rotationRef.current.y += dx * 0.005;
          rotationRef.current.x += dy * 0.005;
          rotationRef.current.x = Math.max(
            -Math.PI / 2,
            Math.min(Math.PI / 2, rotationRef.current.x),
          );
          globe.rotation.y = rotationRef.current.y;
          globe.rotation.x = rotationRef.current.x;
        }
        prevMouseRef.current = { x: e.clientX, y: e.clientY };
      } else {
        // Hover detection
        const country = getCountryAtEvent(e.clientX, e.clientY);
        const newHovered = country?.iso ?? null;
        if (newHovered !== hoveredRef.current) {
          hoveredRef.current = newHovered;
          onCountryHover(newHovered, country?.name ?? null);
          repaint(newHovered);
        }
      }
    },
    [getCountryAtEvent, onCountryHover, repaint],
  );

  const handleMouseUp = useCallback(
    (e: React.MouseEvent) => {
      if (!isDraggingRef.current) {
        const country = getCountryAtEvent(e.clientX, e.clientY);
        if (country) {
          onCountryClick(country.iso, country.name);
        }
      }
      isDraggingRef.current = false;
    },
    [getCountryAtEvent, onCountryClick],
  );

  const handleMouseLeave = useCallback(() => {
    isInteractingRef.current = false;
    isDraggingRef.current = false;
    if (hoveredRef.current) {
      hoveredRef.current = null;
      onCountryHover(null, null);
      repaint(null);
    }
  }, [onCountryHover, repaint]);

  // Scroll to zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const camera = cameraRef.current;
    if (!camera) return;
    zoomRef.current += e.deltaY * 0.001;
    zoomRef.current = Math.max(1.5, Math.min(4, zoomRef.current));
    camera.position.z = zoomRef.current;
  }, []);

  // Touch handlers
  const lastTouchRef = useRef<{ x: number; y: number } | null>(null);
  const lastPinchRef = useRef(0);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    isInteractingRef.current = true;
    isDraggingRef.current = false;
    if (e.touches.length === 1) {
      lastTouchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else if (e.touches.length === 2) {
      lastPinchRef.current = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      );
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const globe = globeRef.current;
    const camera = cameraRef.current;
    if (!globe) return;

    if (e.touches.length === 1 && lastTouchRef.current) {
      const dx = e.touches[0].clientX - lastTouchRef.current.x;
      const dy = e.touches[0].clientY - lastTouchRef.current.y;
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) isDraggingRef.current = true;
      rotationRef.current.y += dx * 0.005;
      rotationRef.current.x += dy * 0.005;
      rotationRef.current.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, rotationRef.current.x));
      globe.rotation.y = rotationRef.current.y;
      globe.rotation.x = rotationRef.current.x;
      lastTouchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else if (e.touches.length === 2 && camera) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      );
      zoomRef.current += (lastPinchRef.current - dist) * 0.01;
      zoomRef.current = Math.max(1.5, Math.min(4, zoomRef.current));
      camera.position.z = zoomRef.current;
      lastPinchRef.current = dist;
    }
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!isDraggingRef.current && lastTouchRef.current) {
        const country = getCountryAtEvent(lastTouchRef.current.x, lastTouchRef.current.y);
        if (country) {
          onCountryClick(country.iso, country.name);
        }
      }
      isInteractingRef.current = false;
      isDraggingRef.current = false;
      lastTouchRef.current = null;
    },
    [getCountryAtEvent, onCountryClick],
  );

  // Keyboard handler for globe rotation and zoom
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const globe = globeRef.current;
    const camera = cameraRef.current;
    if (!globe) return;

    const ROTATE_STEP = 0.1;
    const ZOOM_STEP = 0.2;

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        rotationRef.current.y -= ROTATE_STEP;
        globe.rotation.y = rotationRef.current.y;
        break;
      case 'ArrowRight':
        e.preventDefault();
        rotationRef.current.y += ROTATE_STEP;
        globe.rotation.y = rotationRef.current.y;
        break;
      case 'ArrowUp':
        e.preventDefault();
        rotationRef.current.x = Math.max(-Math.PI / 2, rotationRef.current.x - ROTATE_STEP);
        globe.rotation.x = rotationRef.current.x;
        break;
      case 'ArrowDown':
        e.preventDefault();
        rotationRef.current.x = Math.min(Math.PI / 2, rotationRef.current.x + ROTATE_STEP);
        globe.rotation.x = rotationRef.current.x;
        break;
      case '+':
      case '=':
        e.preventDefault();
        if (camera) {
          zoomRef.current = Math.max(1.5, zoomRef.current - ZOOM_STEP);
          camera.position.z = zoomRef.current;
        }
        break;
      case '-':
      case '_':
        e.preventDefault();
        if (camera) {
          zoomRef.current = Math.min(4, zoomRef.current + ZOOM_STEP);
          camera.position.z = zoomRef.current;
        }
        break;
    }
  }, []);

  return (
    <div
      ref={containerRef}
      role="application"
      aria-label={ariaLabel}
      aria-roledescription="Interactive globe"
      tabIndex={0}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onKeyDown={handleKeyDown}
      style={{
        width: '100%',
        height: '100%',
        cursor: isDraggingRef.current ? 'grabbing' : 'grab',
        touchAction: 'none',
        position: 'relative',
      }}
    >
      {/* Loading indicator */}
      {isLoading && (
        <div
          aria-live="polite"
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            zIndex: 5,
            pointerEvents: 'none',
          }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
            stroke={theme.textSecondary} strokeWidth="2" strokeLinecap="round"
            style={{ animation: 'gl-globe-spin 2s linear infinite', opacity: 0.6 }}>
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          <span style={{ color: theme.textSecondary, fontSize: 13, opacity: 0.6 }}>
            Loading map data...
          </span>
        </div>
      )}
    </div>
  );
}
