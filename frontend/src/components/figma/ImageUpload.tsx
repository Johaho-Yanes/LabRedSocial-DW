import { useState, useRef } from "react";
import { X, Upload, Image as ImageIcon, Loader2, AlertCircle, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Alert, AlertDescription } from "../ui/alert";
import type { ImageData, UserData } from "@/types";
import { imageService } from "@/services/imageService";

interface ImageUploadProps {
  onClose: () => void;
  onUpload: (image: ImageData) => void;
  currentUser: UserData;
}

export function ImageUpload({ onClose, onUpload, currentUser }: ImageUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [titleError, setTitleError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState("");
  const [detectionResults, setDetectionResults] = useState<{
    faces?: number;
    emotions?: string[];
    labels?: string[];
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const simulateImageProcessing = async () => {
    setIsProcessing(true);

    // Etapa 1: Subida a almacenamiento en la nube
    setProcessingStage("Subiendo imagen a almacenamiento en la nube...");
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Etapa 2: Detección facial con face-api.js
    setProcessingStage("Detectando rostros con face-api.js...");
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const facesDetected = Math.floor(Math.random() * 3); // Simulación
    const emotions = facesDetected > 0 ? ["Happy", "Neutral", "Surprised"] : [];

    // Etapa 3: Análisis con Amazon Rekognition
    setProcessingStage("Analizando imagen con Amazon Rekognition...");
    await new Promise((resolve) => setTimeout(resolve, 1200));
    const labels = ["Photography", "Art", "Beautiful", "Creative"];

    // Etapa 4: Generación de transformaciones
    setProcessingStage("Generando transformaciones automáticas...");
    await new Promise((resolve) => setTimeout(resolve, 1800));

    // Etapa 5: Creación de miniaturas con Sharp
    setProcessingStage("Creando miniaturas optimizadas con Sharp...");
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setDetectionResults({
      faces: facesDetected,
      emotions: emotions.slice(0, facesDetected),
      labels: labels,
    });

    setProcessingStage("¡Completado!");
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsProcessing(false);
  };

  const handleUpload = async () => {
    if (!selectedFile || !title) return;
    
    // Validar que el título no comience con @
    const firstWord = title.trim().split(/\s+/)[0];
    if (firstWord.startsWith("@")) {
      setTitleError("El título no puede comenzar con '@'. Este símbolo está reservado para búsqueda de usuarios.");
      return;
    }
    
    setTitleError("");
    setIsProcessing(true);
    
    try {
      // Etapa 1: Preparar FormData
      setProcessingStage("Preparando imagen para subida...");
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      const formData = new FormData();
      formData.append("image", selectedFile);
      formData.append("title", title);
      formData.append("description", description);
      formData.append("tags", tags);

      // Etapa 2: Subir a servidor
      setProcessingStage("Subiendo imagen al servidor...");
      const newImage = await imageService.uploadImage(formData);
      
      // Etapa 3: Procesamiento completado
      setProcessingStage("¡Procesamiento completado!");
      setDetectionResults({
        faces: newImage.faceDetection?.facesDetected || 0,
        emotions: newImage.faceDetection?.emotions,
        labels: newImage.rekognition?.labels,
      });
      
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      onUpload(newImage);
    } catch (error: any) {
      console.error("Error al subir imagen:", error);
      alert(error.response?.data?.message || "Error al subir la imagen");
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Subir Nueva Fotografía
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Con procesamiento automático y reconocimiento facial
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Upload Area */}
          {!preview ? (
            <div
              className="border-2 border-dashed rounded-lg p-12 text-center cursor-pointer hover:border-primary transition-colors"
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-foreground mb-2">
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
              {/* Preview */}
              <div className="relative rounded-lg overflow-hidden bg-muted">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full max-h-96 object-contain"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setSelectedFile(null);
                    setPreview("");
                    setDetectionResults(null);
                  }}
                >
                  <X className="h-4 w-4 mr-1" />
                  Cambiar imagen
                </Button>
              </div>

              {/* Processing Status */}
              {isProcessing && (
                <Alert>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <AlertDescription className="flex items-center gap-2">
                    <span>{processingStage}</span>
                  </AlertDescription>
                </Alert>
              )}

              {/* Detection Results */}
              {detectionResults && !isProcessing && (
                <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="flex items-center gap-2 font-medium">
                        <Sparkles className="h-4 w-4" />
                        <span>Procesamiento completado exitosamente</span>
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {detectionResults.faces !== undefined && (
                          <Badge variant="secondary">
                            {detectionResults.faces} {detectionResults.faces === 1 ? "rostro detectado" : "rostros detectados"}
                          </Badge>
                        )}
                        {detectionResults.labels?.map((label) => (
                          <Badge key={label} variant="outline">
                            {label}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        ✅ 3 transformaciones generadas (Escalado, B/N, Sepia)
                        <br />
                        ✅ Miniaturas optimizadas creadas
                        <br />
                        ✅ Análisis de contenido completado
                      </p>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Form Fields */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    placeholder="Dale un título a tu imagen..."
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      setTitleError("");
                    }}
                    disabled={isProcessing}
                    className={titleError ? "border-destructive" : ""}
                  />
                  {titleError && (
                    <p className="text-sm text-destructive flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      {titleError}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    placeholder="Cuéntanos sobre esta imagen..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={isProcessing}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (separados por comas)</Label>
                  <Input
                    id="tags"
                    placeholder="naturaleza, fotografía, paisaje"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    disabled={isProcessing}
                  />
                </div>
              </div>

              {/* Info Alert */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  <strong>Procesamiento automático incluye:</strong>
                  <br />
                  • Reconocimiento facial con face-api.js y OpenCV
                  <br />
                  • Análisis de contenido con Amazon Rekognition
                  <br />
                  • Generación de 3 transformaciones automáticas
                  <br />
                  • Creación de miniaturas optimizadas con Sharp
                  <br />• Almacenamiento en la nube (AWS S3 / Supabase Storage)
                </AlertDescription>
              </Alert>

              {/* Actions */}
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={onClose} disabled={isProcessing}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={!title || isProcessing}
                  className="gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Subir Imagen
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
