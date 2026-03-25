import { useState, useCallback, useRef } from 'react';
import { useStore } from '../../store/useStore';
import type { AoeTemplate } from '../../store/useStore';

const GRID_PX = 50; // 50px = 5 feet

function feetToPx(feet: number) {
  return (feet / 5) * GRID_PX;
}

function hexToRgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

interface ShapeProps {
  template: AoeTemplate;
  interactive: boolean;
  onRightClick: (e: React.MouseEvent, id: string) => void;
  onMouseDown?: (e: React.MouseEvent, id: string) => void;
}

function CircleShape({ template, interactive, onRightClick, onMouseDown }: ShapeProps) {
  const r = feetToPx(template.size);
  return (
    <g transform={`translate(${template.x},${template.y})`}>
      <circle
        cx={0}
        cy={0}
        r={r}
        fill={hexToRgba(template.color, 0.4)}
        stroke={hexToRgba(template.color, 0.85)}
        strokeWidth={2}
        style={{ pointerEvents: interactive ? 'auto' : 'none', cursor: interactive ? 'move' : 'default' }}
        onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); onRightClick(e, template.id); }}
        onMouseDown={onMouseDown ? (e) => onMouseDown(e, template.id) : undefined}
      />
      {template.label && (
        <text
          x={0}
          y={-r - 6}
          textAnchor="middle"
          fill={hexToRgba(template.color, 0.95)}
          fontSize={12}
          fontFamily="inherit"
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          {template.label}
        </text>
      )}
    </g>
  );
}

function ConeShape({ template, interactive, onRightClick, onMouseDown }: ShapeProps) {
  const length = feetToPx(template.size);
  const halfAngle = 30; // 60° total cone
  const rad = (halfAngle * Math.PI) / 180;
  const x1 = length * Math.cos(-rad);
  const y1 = length * Math.sin(-rad);
  const x2 = length * Math.cos(rad);
  const y2 = length * Math.sin(rad);
  const pathD = `M 0,0 L ${x1},${y1} A ${length},${length} 0 0,1 ${x2},${y2} Z`;
  return (
    <g transform={`translate(${template.x},${template.y}) rotate(${template.angle})`}>
      <path
        d={pathD}
        fill={hexToRgba(template.color, 0.4)}
        stroke={hexToRgba(template.color, 0.85)}
        strokeWidth={2}
        style={{ pointerEvents: interactive ? 'auto' : 'none', cursor: interactive ? 'move' : 'default' }}
        onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); onRightClick(e, template.id); }}
        onMouseDown={onMouseDown ? (e) => onMouseDown(e, template.id) : undefined}
      />
      {template.label && (
        <text
          x={length * 0.45}
          y={-10}
          textAnchor="middle"
          fill={hexToRgba(template.color, 0.95)}
          fontSize={12}
          fontFamily="inherit"
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          {template.label}
        </text>
      )}
    </g>
  );
}

function LineShape({ template, interactive, onRightClick, onMouseDown }: ShapeProps) {
  const length = feetToPx(template.size);
  const width = GRID_PX; // 5ft wide
  const pathD = `M 0,${-width / 2} L ${length},${-width / 2} L ${length},${width / 2} L 0,${width / 2} Z`;
  return (
    <g transform={`translate(${template.x},${template.y}) rotate(${template.angle})`}>
      <path
        d={pathD}
        fill={hexToRgba(template.color, 0.4)}
        stroke={hexToRgba(template.color, 0.85)}
        strokeWidth={2}
        style={{ pointerEvents: interactive ? 'auto' : 'none', cursor: interactive ? 'move' : 'default' }}
        onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); onRightClick(e, template.id); }}
        onMouseDown={onMouseDown ? (e) => onMouseDown(e, template.id) : undefined}
      />
      {template.label && (
        <text
          x={length / 2}
          y={-width / 2 - 6}
          textAnchor="middle"
          fill={hexToRgba(template.color, 0.95)}
          fontSize={12}
          fontFamily="inherit"
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          {template.label}
        </text>
      )}
    </g>
  );
}

function CubeShape({ template, interactive, onRightClick, onMouseDown }: ShapeProps) {
  const side = feetToPx(template.size);
  const half = side / 2;
  return (
    <g transform={`translate(${template.x},${template.y}) rotate(${template.angle})`}>
      <rect
        x={-half}
        y={-half}
        width={side}
        height={side}
        fill={hexToRgba(template.color, 0.4)}
        stroke={hexToRgba(template.color, 0.85)}
        strokeWidth={2}
        style={{ pointerEvents: interactive ? 'auto' : 'none', cursor: interactive ? 'move' : 'default' }}
        onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); onRightClick(e, template.id); }}
        onMouseDown={onMouseDown ? (e) => onMouseDown(e, template.id) : undefined}
      />
      {template.label && (
        <text
          x={0}
          y={-half - 6}
          textAnchor="middle"
          fill={hexToRgba(template.color, 0.95)}
          fontSize={12}
          fontFamily="inherit"
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          {template.label}
        </text>
      )}
    </g>
  );
}

interface ContextMenuState {
  screenX: number;
  screenY: number;
  templateId: string;
}

interface AoeTemplateLayerProps {
  previewTemplate?: AoeTemplate | null;
}

export function AoeTemplateLayer({ previewTemplate }: AoeTemplateLayerProps) {
  const aoeTemplates = useStore((s) => s.aoeTemplates);
  const removeAoeTemplate = useStore((s) => s.removeAoeTemplate);
  const updateAoeTemplate = useStore((s) => s.updateAoeTemplate);
  const activeTool = useStore((s) => s.activeTool);
  const mapWidth = useStore((s) => s.mapWidth);
  const mapHeight = useStore((s) => s.mapHeight);
  const mapZoom = useStore((s) => s.mapZoom);

  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  const dragRef = useRef<{
    id: string;
    startScreenX: number;
    startScreenY: number;
    origX: number;
    origY: number;
  } | null>(null);

  const isPointer = activeTool === 'pointer';

  const handleRightClick = useCallback((e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ screenX: e.clientX, screenY: e.clientY, templateId: id });
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent, id: string) => {
    if (!isPointer || e.button !== 0) return;
    e.stopPropagation();
    const template = aoeTemplates.find((t) => t.id === id);
    if (!template) return;
    dragRef.current = {
      id,
      startScreenX: e.clientX,
      startScreenY: e.clientY,
      origX: template.x,
      origY: template.y,
    };
  }, [isPointer, aoeTemplates]);

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!dragRef.current) return;
    const { id, startScreenX, startScreenY, origX, origY } = dragRef.current;
    const dx = (e.clientX - startScreenX) / mapZoom;
    const dy = (e.clientY - startScreenY) / mapZoom;
    updateAoeTemplate(id, { x: origX + dx, y: origY + dy });
  }, [mapZoom, updateAoeTemplate]);

  const handleMouseUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  function renderShape(template: AoeTemplate, interactive: boolean, preview = false) {
    const shapeProps: ShapeProps = {
      template,
      interactive,
      onRightClick: handleRightClick,
      onMouseDown: interactive ? handleMouseDown : undefined,
    };
    return (
      <g key={template.id} opacity={preview ? 0.55 : 1}>
        {template.shape === 'circle' && <CircleShape {...shapeProps} />}
        {template.shape === 'cone' && <ConeShape {...shapeProps} />}
        {template.shape === 'line' && <LineShape {...shapeProps} />}
        {template.shape === 'cube' && <CubeShape {...shapeProps} />}
      </g>
    );
  }

  return (
    <>
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: mapWidth,
          height: mapHeight,
          pointerEvents: isPointer ? 'auto' : 'none',
          zIndex: 1,
          overflow: 'visible',
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={() => setContextMenu(null)}
      >
        {aoeTemplates.map((t) => renderShape(t, isPointer))}
        {previewTemplate && renderShape({ ...previewTemplate, id: '__preview__' }, false, true)}
      </svg>

      {contextMenu && (
        <div
          style={{
            position: 'fixed',
            top: contextMenu.screenY,
            left: contextMenu.screenX,
            background: 'var(--bg-panel)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-sm)',
            boxShadow: 'var(--shadow-md)',
            zIndex: 9999,
            minWidth: 150,
          }}
        >
          <button
            style={{
              display: 'block',
              width: '100%',
              padding: '8px 14px',
              background: 'none',
              color: 'var(--text-primary)',
              textAlign: 'left',
              fontSize: 13,
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--bg-card-hover)')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'none')}
            onClick={() => {
              removeAoeTemplate(contextMenu.templateId);
              setContextMenu(null);
            }}
          >
            Remove template
          </button>
          <button
            style={{
              display: 'block',
              width: '100%',
              padding: '8px 14px',
              background: 'none',
              color: 'var(--text-secondary)',
              textAlign: 'left',
              fontSize: 13,
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--bg-card-hover)')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'none')}
            onClick={() => setContextMenu(null)}
          >
            Cancel
          </button>
        </div>
      )}
    </>
  );
}
