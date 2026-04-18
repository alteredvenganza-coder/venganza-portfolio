import { useEffect, useRef, useState } from 'react';

const STRIP_COLORS = {
  note:    'var(--cv-gold2)',
  image:   '#6B8FA8',
  link:    'var(--cv-sage)',
  todo:    'var(--cv-purple)',
  board:   'var(--cv-orange)',
  heading: 'var(--cv-text)',
};

/**
 * Reusable wrapper for all cards.
 * Handles drag, resize, selection, action buttons (connect/duplicate/delete)
 * and the "+" button. Children render the type-specific body.
 *
 * Props:
 * - card: { id, type, x, y, w, ... }
 * - zoom: current canvas zoom (used for delta math)
 * - selected: boolean
 * - onSelect()
 * - onMove(x, y)         — fires while dragging (positions are world coords)
 * - onMoveEnd()          — fires on mouseup (good time for save)
 * - onResize(w)          — fires while resizing
 * - onResizeEnd()
 * - onDelete()
 * - onDuplicate()
 * - onConnectStart()
 * - onPlusClick(clientX, clientY)
 * - tool: current tool ('select'|'pan'|'connect')
 * - onConnectFinish() — called when this card is the target of a connect
 * - children: card body
 * - title: shown in header (string)
 * - onTitleChange(value)
 * - showStrip: whether to render the colored strip top
 */
export default function CardShell({
  card, zoom, selected, tool,
  onSelect, onMoveStart, onMove, onMoveEnd,
  onResizeStart, onResize, onResizeEnd,
  onDelete, onDuplicate, onConnectStart, onConnectFinish,
  onPlusClick,
  title, onTitleChange,
  showStrip = true,
  children,
}) {
  const ref = useRef(null);
  const dragRef = useRef(null);
  const resizeRef = useRef(null);

  function onHeaderMouseDown(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (tool === 'connect') {
      onConnectStart && onConnectStart();
      e.stopPropagation();
      return;
    }
    onSelect && onSelect(e);
    onMoveStart && onMoveStart({ x: card.x, y: card.y });
    dragRef.current = {
      startClientX: e.clientX,
      startClientY: e.clientY,
      startX: card.x,
      startY: card.y,
    };
    e.stopPropagation();
    e.preventDefault();
  }

  function onCardClick(e) {
    if (tool === 'connect') {
      onConnectFinish && onConnectFinish();
      e.stopPropagation();
    }
  }

  useEffect(() => {
    const GRID = 20;
    let lastX = null, lastY = null;
    function move(e) {
      if (!dragRef.current) return;
      const dx = (e.clientX - dragRef.current.startClientX) / zoom;
      const dy = (e.clientY - dragRef.current.startClientY) / zoom;
      let nx = dragRef.current.startX + dx;
      let ny = dragRef.current.startY + dy;
      // Snap to 20px grid unless Alt held
      if (!e.altKey) {
        nx = Math.round(nx / GRID) * GRID;
        ny = Math.round(ny / GRID) * GRID;
      }
      lastX = nx; lastY = ny;
      onMove && onMove(nx, ny);
    }
    function up() {
      if (dragRef.current) {
        dragRef.current = null;
        onMoveEnd && onMoveEnd(lastX != null ? { x: lastX, y: lastY } : null);
        lastX = lastY = null;
      }
    }
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
  }, [zoom, onMove, onMoveEnd]);

  function onResizeMouseDown(e) {
    onResizeStart && onResizeStart({ w: card.w });
    resizeRef.current = { startClientX: e.clientX, startW: card.w };
    e.stopPropagation();
    e.preventDefault();
  }

  useEffect(() => {
    let lastW = null;
    function move(e) {
      if (!resizeRef.current) return;
      const dx = (e.clientX - resizeRef.current.startClientX) / zoom;
      lastW = Math.max(180, resizeRef.current.startW + dx);
      onResize && onResize(lastW);
    }
    function up() {
      if (resizeRef.current) {
        resizeRef.current = null;
        onResizeEnd && onResizeEnd(lastW != null ? { w: lastW } : null);
        lastW = null;
      }
    }
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
  }, [zoom, onResize, onResizeEnd]);

  const isHeading = card.type === 'heading';
  const stripColor = STRIP_COLORS[card.type] || 'var(--cv-muted)';

  return (
    <div
      id={card.id}
      ref={ref}
      onClick={onCardClick}
      style={{
        position: 'absolute',
        left: card.x,
        top: card.y,
        width: card.w,
        background: isHeading ? 'transparent' : 'var(--cv-white)',
        border: isHeading ? 'none' : `1px solid ${selected ? 'var(--cv-gold2)' : 'var(--cv-border)'}`,
        borderRadius: 9,
        boxShadow: isHeading ? 'none' : 'var(--cv-shadow)',
        outline: selected && !isHeading ? '2px solid var(--cv-gold2)' : 'none',
        outlineOffset: 1,
        zIndex: 10,
      }}
      className="cv-card"
    >
      {showStrip && !isHeading && (
        <div style={{ height: 3, background: stripColor, borderRadius: '8px 8px 0 0' }} />
      )}

      {/* Action buttons (visible on hover via parent CSS) */}
      <div
        className="cv-card-actions"
        style={{
          position: 'absolute', top: -34, right: 0,
          background: 'var(--cv-white)', border: '1px solid var(--cv-border)',
          borderRadius: 7, boxShadow: 'var(--cv-shadow)',
          display: 'none', gap: 2, padding: 3,
        }}
      >
        <button onClick={onConnectStart} title="Connect" style={actBtn}>↔</button>
        <button onClick={onDuplicate}    title="Duplicate" style={actBtn}>⎘</button>
        <button onClick={onDelete}       title="Delete" style={{...actBtn, color:'var(--cv-red)'}}>×</button>
      </div>

      {/* Header / title */}
      <div onMouseDown={onHeaderMouseDown}
        style={{
          padding: isHeading ? '0' : '9px 11px 5px',
          cursor: 'grab',
          userSelect: 'none',
        }}>
        {title !== undefined && (
          <input
            value={title}
            onChange={(e) => onTitleChange && onTitleChange(e.target.value)}
            onMouseDown={(e) => e.stopPropagation()}
            style={{
              border: 'none', background: 'transparent', outline: 'none',
              fontFamily: isHeading ? 'Bebas Neue, sans-serif' : 'DM Sans, sans-serif',
              fontWeight: isHeading ? 400 : 600,
              fontSize: isHeading ? 28 : 12.5,
              letterSpacing: isHeading ? '2px' : 'normal',
              color: 'var(--cv-text)', width: '100%',
            }}
          />
        )}
      </div>

      {/* Body */}
      {!isHeading && (
        <div style={{ padding: '6px 11px 11px' }}>
          {children}
        </div>
      )}

      {/* Resize handle */}
      {!isHeading && (
        <div
          onMouseDown={onResizeMouseDown}
          style={{
            position: 'absolute', bottom: 0, right: 0,
            width: 14, height: 14, cursor: 'se-resize',
          }}
        >
          <div style={{
            position: 'absolute', bottom: 3, right: 3,
            width: 7, height: 7,
            borderRight: '2px solid var(--cv-muted)',
            borderBottom: '2px solid var(--cv-muted)',
          }} />
        </div>
      )}

      {/* + button */}
      {onPlusClick && (
        <button
          onClick={(e) => { e.stopPropagation(); onPlusClick(e.clientX, e.clientY); }}
          className="cv-card-plus"
          style={{
            position: 'absolute', bottom: -10, right: -10,
            width: 22, height: 22, borderRadius: '50%',
            background: 'var(--cv-white)', border: '1.5px solid var(--cv-border)',
            display: 'none', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', fontSize: 14, color: 'var(--cv-muted)',
            boxShadow: 'var(--cv-shadow)', lineHeight: 1, zIndex: 20,
          }}
        >+</button>
      )}
    </div>
  );
}

const actBtn = {
  width: 24, height: 24, borderRadius: 5,
  background: 'transparent', border: 'none', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  color: 'var(--cv-muted)', fontSize: 14,
};
