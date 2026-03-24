import { useEffect, useRef, useCallback } from 'react';
import { useStore } from '../store/useStore';

const FOG_COLOR = 'rgba(8, 8, 20, 0.94)';

export function useFogPainter(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const mapWidth = useStore((s) => s.mapWidth);
  const mapHeight = useStore((s) => s.mapHeight);
  const mapZoom = useStore((s) => s.mapZoom);
  const activeTool = useStore((s) => s.activeTool);
  const fogBrushSize = useStore((s) => s.fogBrushSize);
  const fogData = useStore((s) => s.fogData);
  const setFogData = useStore((s) => s.setFogData);

  const isDrawingRef = useRef(false);
  const initializedRef = useRef(false);
  const lastMapUrlRef = useRef<string | null>(null);
  const mapImageUrl = useStore((s) => s.mapImageUrl);

  const getCtx = useCallback(() => {
    return canvasRef.current?.getContext('2d') ?? null;
  }, [canvasRef]);

  const fillFog = useCallback(() => {
    const ctx = getCtx();
    if (!ctx || !mapWidth || !mapHeight) return;
    ctx.clearRect(0, 0, mapWidth, mapHeight);
    ctx.fillStyle = FOG_COLOR;
    ctx.fillRect(0, 0, mapWidth, mapHeight);
  }, [getCtx, mapWidth, mapHeight]);

  // Initialize canvas when map changes
  useEffect(() => {
    if (!canvasRef.current || !mapWidth || !mapHeight) return;
    const canvas = canvasRef.current;
    canvas.width = mapWidth;
    canvas.height = mapHeight;

    const ctx = canvas.getContext('2d')!;

    // New map loaded — restore fog data or fill fresh
    if (mapImageUrl !== lastMapUrlRef.current) {
      lastMapUrlRef.current = mapImageUrl;
      initializedRef.current = false;
    }

    if (!initializedRef.current) {
      if (fogData && fogData.length === mapWidth * mapHeight * 4) {
        // Restore saved fog
        const imageData = ctx.createImageData(mapWidth, mapHeight);
        imageData.data.set(fogData);
        ctx.putImageData(imageData, 0, 0);
      } else {
        fillFog();
        saveFog(ctx, mapWidth, mapHeight, setFogData);
      }
      initializedRef.current = true;
    }
  }, [mapWidth, mapHeight, mapImageUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  const paint = useCallback(
    (e: PointerEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const rect = canvas.getBoundingClientRect();
      // Convert from screen coords to canvas (map) coords, accounting for zoom
      const x = (e.clientX - rect.left) / mapZoom;
      const y = (e.clientY - rect.top) / mapZoom;

      ctx.save();

      if (activeTool === 'fog-reveal') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = 'rgba(0,0,0,1)';
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = FOG_COLOR;
      }

      ctx.beginPath();
      ctx.arc(x, y, fogBrushSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    },
    [canvasRef, activeTool, fogBrushSize, mapZoom]
  );

  const handlePointerDown = useCallback(
    (e: PointerEvent) => {
      if (activeTool !== 'fog-reveal' && activeTool !== 'fog-hide') return;
      isDrawingRef.current = true;
      canvasRef.current?.setPointerCapture(e.pointerId);
      paint(e);
    },
    [activeTool, canvasRef, paint]
  );

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!isDrawingRef.current) return;
      paint(e);
    },
    [paint]
  );

  const handlePointerUp = useCallback(
    (e: PointerEvent) => {
      if (!isDrawingRef.current) return;
      isDrawingRef.current = false;
      canvasRef.current?.releasePointerCapture(e.pointerId);
      // Save fog state
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      saveFog(ctx, mapWidth, mapHeight, setFogData);
    },
    [canvasRef, mapWidth, mapHeight, setFogData]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', handlePointerUp);

    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerup', handlePointerUp);
    };
  }, [canvasRef, handlePointerDown, handlePointerMove, handlePointerUp]);
}

function saveFog(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  setFogData: (data: number[] | null) => void
) {
  if (!width || !height) return;
  try {
    const imageData = ctx.getImageData(0, 0, width, height);
    setFogData(Array.from(imageData.data));
  } catch {
    // cross-origin or quota issue — skip persistence
  }
}
