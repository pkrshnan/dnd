import { useCallback, useRef } from 'react';
import { useStore } from '../store/useStore';

const GRID_SIZE = 50; // pixels — one 5-foot square

export function useDrag(tokenId: string) {
  const updateToken = useStore((s) => s.updateToken);
  const mapWidth = useStore((s) => s.mapWidth);
  const mapHeight = useStore((s) => s.mapHeight);
  const mapZoom = useStore((s) => s.mapZoom);

  const isDraggingRef = useRef(false);
  const startPosRef = useRef({ x: 0, y: 0 });
  const startTokenPosRef = useRef({ x: 0, y: 0 });

  const TOKEN_SIZE = 40;

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.button !== 0) return;
      e.stopPropagation();
      isDraggingRef.current = true;
      e.currentTarget.setPointerCapture(e.pointerId);
      startPosRef.current = { x: e.clientX, y: e.clientY };

      const token = useStore.getState().tokens.find((t) => t.id === tokenId);
      if (token) startTokenPosRef.current = { x: token.x, y: token.y };
    },
    [tokenId]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDraggingRef.current) return;
      e.stopPropagation();

      const dx = (e.clientX - startPosRef.current.x) / mapZoom;
      const dy = (e.clientY - startPosRef.current.y) / mapZoom;

      let x = startTokenPosRef.current.x + dx;
      let y = startTokenPosRef.current.y + dy;

      // Clamp to map bounds
      x = Math.max(0, Math.min(mapWidth - TOKEN_SIZE, x));
      y = Math.max(0, Math.min(mapHeight - TOKEN_SIZE, y));

      updateToken(tokenId, { x, y });
    },
    [tokenId, mapZoom, mapWidth, mapHeight, updateToken]
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      e.currentTarget.releasePointerCapture(e.pointerId);

      // Snap to grid
      const token = useStore.getState().tokens.find((t) => t.id === tokenId);
      if (token) {
        const snappedX = Math.round(token.x / GRID_SIZE) * GRID_SIZE;
        const snappedY = Math.round(token.y / GRID_SIZE) * GRID_SIZE;
        const clampedX = Math.max(0, Math.min(mapWidth - TOKEN_SIZE, snappedX));
        const clampedY = Math.max(0, Math.min(mapHeight - TOKEN_SIZE, snappedY));
        updateToken(tokenId, { x: clampedX, y: clampedY });
      }
    },
    [tokenId, mapWidth, mapHeight, updateToken]
  );

  return { onPointerDown, onPointerMove, onPointerUp };
}
