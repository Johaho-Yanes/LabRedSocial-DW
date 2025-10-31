import { useState, useRef } from "react";
import { X, Upload, Image as ImageIcon, ZoomIn, ZoomOut, Move } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

interface ProfilePictureUploadProps {
  onClose: () => void;
  onUpload: (file: File) => void;
}

export function ProfilePictureUpload({ onClose, onUpload }: ProfilePictureUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleSave = async () => {
    if (!selectedFile || !preview) return;

    try {
      // Crear imagen temporal para obtener dimensiones reales
      const img = new Image();
      img.src = preview;

      await new Promise((resolve) => {
        img.onload = resolve;
      });

      // Dimensiones del contenedor de preview (256x256px = w-64 h-64)
      const containerSize = 256;
      
      // Calcular el tamaño que tendrá la imagen en el preview
      // La imagen se ajusta al contenedor manteniendo aspect ratio
      const imgAspect = img.width / img.height;
      let previewImgWidth, previewImgHeight;
      
      if (imgAspect > 1) {
        // Imagen horizontal: se ajusta al alto
        previewImgHeight = containerSize;
        previewImgWidth = containerSize * imgAspect;
      } else {
        // Imagen vertical o cuadrada: se ajusta al ancho
        previewImgWidth = containerSize;
        previewImgHeight = containerSize / imgAspect;
      }

      // Con el zoom aplicado
      const scaledWidth = previewImgWidth * zoom;
      const scaledHeight = previewImgHeight * zoom;

      // Centro del contenedor
      const centerX = containerSize / 2;
      const centerY = containerSize / 2;

      // Posición de la imagen (centro + desplazamiento)
      const imgCenterX = centerX + position.x;
      const imgCenterY = centerY + position.y;

      // Esquina superior izquierda de la imagen en el preview
      const imgLeft = imgCenterX - (scaledWidth / 2);
      const imgTop = imgCenterY - (scaledHeight / 2);

      // Calcular qué región de la imagen ORIGINAL necesitamos
      // para llenar el área visible del preview (0,0 a containerSize,containerSize)
      const cropX = (0 - imgLeft) / zoom * (img.width / previewImgWidth);
      const cropY = (0 - imgTop) / zoom * (img.height / previewImgHeight);
      const cropW = (containerSize / zoom) * (img.width / previewImgWidth);
      const cropH = (containerSize / zoom) * (img.height / previewImgHeight);

      console.log('🎯 Debug Avatar Crop:', {
        'Imagen original': `${img.width}x${img.height}`,
        'Preview sin zoom': `${previewImgWidth.toFixed(1)}x${previewImgHeight.toFixed(1)}`,
        'Preview con zoom': `${scaledWidth.toFixed(1)}x${scaledHeight.toFixed(1)}`,
        'Posición': `x:${position.x}, y:${position.y}`,
        'Zoom': zoom,
        'Crop': `x:${cropX.toFixed(1)}, y:${cropY.toFixed(1)}, w:${cropW.toFixed(1)}, h:${cropH.toFixed(1)}`
      });

      // Crear canvas de salida
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const outputSize = 400;
      canvas.width = outputSize;
      canvas.height = outputSize;

      // Fondo blanco
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, outputSize, outputSize);

      // Dibujar el crop
      ctx.drawImage(
        img,
        cropX, cropY, cropW, cropH,
        0, 0, outputSize, outputSize
      );

      // Convertir a blob
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
        onUpload(file);
      }, 'image/jpeg', 0.95);
      
    } catch (error) {
      console.error('Error al procesar la imagen:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Cambiar foto de perfil
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Ajusta tu imagen de perfil
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Upload Area or Editor */}
          {!preview ? (
            <div
              className="border-2 border-dashed rounded-lg p-12 text-center cursor-pointer hover:border-primary transition-colors"
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="mb-2">
                Arrastra una imagen aquí o haz clic para seleccionar
              </p>
              <p className="text-sm text-muted-foreground">
                Formatos soportados: JPG, PNG, WebP
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Preview Editor */}
              <div className="space-y-4">
                <div 
                  ref={imageRef}
                  className="relative w-64 h-64 mx-auto rounded-full overflow-hidden bg-muted border-4 border-border cursor-move"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                >
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{
                      transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                      transformOrigin: 'center',
                      transition: isDragging ? 'none' : 'transform 0.1s',
                    }}
                  >
                    <img
                      src={preview}
                      alt="Preview"
                      className="max-w-full max-h-full pointer-events-none"
                      draggable={false}
                      style={{ 
                        width: 'auto',
                        height: 'auto',
                        maxWidth: '100%',
                        maxHeight: '100%'
                      }}
                    />
                  </div>
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <Move className="h-8 w-8 text-white/50" />
                  </div>
                </div>

                {/* Zoom Control */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <ZoomOut className="h-4 w-4" />
                      Zoom
                    </Label>
                    <ZoomIn className="h-4 w-4" />
                  </div>
                  <Slider
                    value={[zoom]}
                    onValueChange={(value) => setZoom(value[0])}
                    min={1}
                    max={3}
                    step={0.1}
                    className="w-full"
                  />
                </div>

                <p className="text-sm text-muted-foreground text-center">
                  Arrastra la imagen para ajustar la posición
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-between">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedFile(null);
                    setPreview("");
                    setZoom(1);
                    setPosition({ x: 0, y: 0 });
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cambiar imagen
                </Button>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={onClose}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSave} className="gap-2">
                    <Upload className="h-4 w-4" />
                    Guardar
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
