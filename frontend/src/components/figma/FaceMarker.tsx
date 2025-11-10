import React from 'react';

interface FaceMarkerProps {
  face: {
    position: {
      left: number;
      top: number;
      width: number;
      height: number;
    };
  };
  index: number;
  imageRef: HTMLImageElement | null;
  containerRef: HTMLDivElement | null;
}

export function FaceMarker({ face, index, imageRef, containerRef }: FaceMarkerProps) {
  if (!imageRef || !containerRef) return null;

  // Calcular el ratio de escala entre la imagen original y cómo se muestra
  const scaleX = imageRef.clientWidth / imageRef.naturalWidth;
  const scaleY = imageRef.clientHeight / imageRef.naturalHeight;

  // Ajustar las coordenadas según la escala
  const left = face.position.left * scaleX;
  const top = face.position.top * scaleY;
  const width = face.position.width * scaleX;
  const height = face.position.height * scaleY;

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: `${left}px`,
        top: `${top}px`,
        width: `${width}px`,
        height: `${height}px`,
        border: '2px solid #22c55e',
        borderRadius: '4px',
        boxShadow: '0 0 0 1px rgba(0,0,0,0.1)',
      }}
    >
      <div
        className="absolute -top-6 -left-1 bg-green-500 text-white text-xs px-2 py-1 rounded-full"
        style={{
          fontSize: '10px',
          minWidth: '20px',
          textAlign: 'center',
        }}
      >
        {index + 1}
      </div>
    </div>
  );
}