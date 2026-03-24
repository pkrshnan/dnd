import { useRef } from 'react';
import { useStore } from '../../store/useStore';
import { useFogPainter } from '../../hooks/useFogPainter';

export function FogOfWar() {
  const mapWidth = useStore((s) => s.mapWidth);
  const mapHeight = useStore((s) => s.mapHeight);
  const activeTool = useStore((s) => s.activeTool);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useFogPainter(canvasRef);

  const isFogTool = activeTool === 'fog-reveal' || activeTool === 'fog-hide';

  return (
    <canvas
      ref={canvasRef}
      width={mapWidth}
      height={mapHeight}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: isFogTool ? 'auto' : 'none',
        cursor: isFogTool ? 'crosshair' : 'default',
        filter: 'blur(3px)',
        zIndex: 1,
      }}
    />
  );
}
