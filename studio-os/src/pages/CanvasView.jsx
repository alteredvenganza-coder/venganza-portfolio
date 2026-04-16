import { useParams } from 'react-router-dom';

export default function CanvasView() {
  const { canvasId } = useParams();
  return (
    <div className="canvas-root">
      <div style={{ padding: 40 }}>
        <p>Canvas placeholder. id = {canvasId}</p>
      </div>
    </div>
  );
}
