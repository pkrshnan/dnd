import { useRef, useCallback, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { FogOfWar } from './FogOfWar';
import { TokenLayer } from './TokenLayer';
import './MapView.css';

export function MapView() {
  const mapImageUrl = useStore((s) => s.mapImageUrl);
  const mapWidth = useStore((s) => s.mapWidth);
  const mapHeight = useStore((s) => s.mapHeight);
  const mapZoom = useStore((s) => s.mapZoom);
  const mapPanX = useStore((s) => s.mapPanX);
  const mapPanY = useStore((s) => s.mapPanY);
  const setZoom = useStore((s) => s.setZoom);
  const setPan = useStore((s) => s.setPan);

  const containerRef = useRef<HTMLDivElement>(null);
  const isPanningRef = useRef(false);
  const spaceHeldRef = useRef(false);
  const lastPanPosRef = useRef({ x: 0, y: 0 });

  // Zoom with mouse wheel
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setZoom(mapZoom * delta);
    },
    [mapZoom, setZoom]
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  // Space+drag to pan
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        spaceHeldRef.current = true;
        if (containerRef.current) containerRef.current.style.cursor = 'grab';
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        spaceHeldRef.current = false;
        isPanningRef.current = false;
        if (containerRef.current) containerRef.current.style.cursor = '';
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Middle-click pan
      if (e.button === 1 || (e.button === 0 && spaceHeldRef.current)) {
        e.preventDefault();
        isPanningRef.current = true;
        lastPanPosRef.current = { x: e.clientX, y: e.clientY };
        if (containerRef.current) containerRef.current.style.cursor = 'grabbing';
      }
    },
    []
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isPanningRef.current) return;
      const dx = e.clientX - lastPanPosRef.current.x;
      const dy = e.clientY - lastPanPosRef.current.y;
      lastPanPosRef.current = { x: e.clientX, y: e.clientY };
      setPan(mapPanX + dx / mapZoom, mapPanY + dy / mapZoom);
    },
    [mapPanX, mapPanY, mapZoom, setPan]
  );

  const handleMouseUp = useCallback(() => {
    if (isPanningRef.current) {
      isPanningRef.current = false;
      if (containerRef.current) {
        containerRef.current.style.cursor = spaceHeldRef.current ? 'grab' : '';
      }
    }
  }, []);

  if (!mapImageUrl) {
    return (
      <div className="mapview-empty">
        <div className="mapview-empty-content">
          <div className="mapview-empty-icon">🗺</div>
          <p>No map loaded</p>
          <p className="mapview-empty-hint">Click "Upload Map" in the toolbar to begin</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="mapview-viewport"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div
        className="mapview-world"
        style={{
          width: mapWidth,
          height: mapHeight,
          transform: `scale(${mapZoom}) translate(${mapPanX}px, ${mapPanY}px)`,
          transformOrigin: '0 0',
        }}
      >
        <img
          src={mapImageUrl}
          className="mapview-bg"
          width={mapWidth}
          height={mapHeight}
          draggable={false}
          alt="Map"
        />
        <FogOfWar />
        <TokenLayer />
      </div>
    </div>
  );
}
