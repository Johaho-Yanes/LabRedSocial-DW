import { useState, useRef, useEffect } from "react";
import { X, Upload, Image as ImageIcon, Loader2, AlertCircle, CheckCircle2, Sparkles } from "lucide-react";
import { FaceMarker } from "./FaceMarker";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Alert, AlertDescription } from "../ui/alert";
import type { ImageData, UserData } from "@/types";
import { imageService } from "@/services/imageService";
import { visionService } from "@/services/visionService";

// Configuración y constantes
const MAX_FACES = 20; // Límite máximo de rostros a detectar
const RECOMMENDED_FACES = 10; // Número recomendado de rostros

// Traducciones de emociones y etiquetas
const emotionTranslations: { [key: string]: string } = {
  'joy': 'alegría',
  'sorrow': 'tristeza',
  'anger': 'enojo',
  'surprise': 'sorpresa',
  'neutral': 'neutral',
  'contempt': 'desprecio',
  'fear': 'miedo',
  'disgust': 'asco'
};

interface EmotionWithPercentage {
  emotion: string;
  spanishEmotion: string;
  confidence: number;
  percentage: number;
}

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
    emotions?: EmotionWithPercentage[];
    emotionsByFace?: EmotionWithPercentage[][];
    dominantEmotion?: string;
    suggestedTags?: string[];
    labels?: string[];
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [faces, setFaces] = useState<Array<{
    position: {
      left: number;
      top: number;
      width: number;
      height: number;
    };
  }>>([]);
  const [faceWarning, setFaceWarning] = useState<{
    type: 'warning' | 'error' | 'info';
    message: string;
  } | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setFaceWarning(null);
      processImage(file);
    }
  };

  const processImage = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) { // 10MB
      alert("La imagen es demasiado grande. El tamaño máximo permitido es 10MB.");
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Iniciar análisis facial
    setIsProcessing(true);
    setProcessingStage("Analizando imagen con Cloud Vision API...");
    
    try {
      const analysis = await visionService.analyzeFaces(file);
      console.log('Análisis recibido:', analysis);
      
      // Manejar el número de rostros detectados
      if (analysis.faces.length === 0) {
        setFaceWarning({
          type: 'info',
          message: 'No se detectaron rostros en la imagen.'
        });
      } else if (analysis.faces.length > MAX_FACES) {
        setFaceWarning({
          type: 'error',
          message: `Se detectaron ${analysis.faces.length} rostros. Solo se analizarán los primeros ${MAX_FACES} rostros.`
        });
        // Limitar el número de rostros procesados
        analysis.faces = analysis.faces.slice(0, MAX_FACES);
      } else if (analysis.faces.length > RECOMMENDED_FACES) {
        setFaceWarning({
          type: 'warning',
          message: `Se detectaron ${analysis.faces.length} rostros. Para un mejor análisis, se recomienda usar imágenes con ${RECOMMENDED_FACES} rostros o menos.`
        });
      } else {
        setFaceWarning(null);
      }
      
      // Guardar las posiciones de los rostros
      setFaces(analysis.faces.map(face => ({
        position: face.position
      })));
      
      // Procesar emociones por cada rostro
      const emotionsByFace = analysis.faces.map(face => {
        const faceEmotions = face.emotions.map(emotion => ({
          emotion: emotion.emotion,
          spanishEmotion: emotionTranslations[emotion.emotion] || emotion.emotion,
          confidence: emotion.confidence,
          percentage: Math.round(emotion.confidence * 100)
        }));
        return faceEmotions.sort((a, b) => b.confidence - a.confidence);
      });

      // Procesar todas las emociones combinadas
      const allEmotions = analysis.faces.flatMap(face => face.emotions);
      
      // Asegurar que tenemos al menos 6 emociones diferentes
      const baseEmotions = [
        { emotion: 'joy', confidence: 0 },
        { emotion: 'sorrow', confidence: 0 },
        { emotion: 'anger', confidence: 0 },
        { emotion: 'surprise', confidence: 0 },
        { emotion: 'neutral', confidence: 0 },
        { emotion: 'fear', confidence: 0 }
      ];

      // Combinar las emociones detectadas con las base
      const processedEmotions = allEmotions.map(emotion => ({
        emotion: emotion.emotion,
        spanishEmotion: emotionTranslations[emotion.emotion] || emotion.emotion,
        confidence: emotion.confidence,
        percentage: Math.round(emotion.confidence * 100)
      }));

      baseEmotions.forEach(baseEmotion => {
        if (!processedEmotions.find(e => e.emotion === baseEmotion.emotion)) {
          processedEmotions.push({
            emotion: baseEmotion.emotion,
            spanishEmotion: emotionTranslations[baseEmotion.emotion] || baseEmotion.emotion,
            confidence: 0,
            percentage: 0
          });
        }
      });

      // Encontrar la emoción dominante
      const dominantEmotion = processedEmotions
        .sort((a, b) => b.confidence - a.confidence)[0];

      // Generar tags sugeridos en español
      const suggestedTags = [
        analysis.faceCount > 1 ? 'grupo' : 'retrato',
        dominantEmotion?.spanishEmotion || 'expresivo',
        analysis.faceCount > 3 ? 'multitud' : 'personas',
      ];

      setDetectionResults({
        faces: analysis.faceCount,
        emotions: processedEmotions,
        emotionsByFace: emotionsByFace,
        dominantEmotion: dominantEmotion.emotion,
        suggestedTags,
        labels: []
      });

      // Pre-llenar el campo de tags con las sugerencias
      setTags(suggestedTags.join(', '));
    } catch (error) {
      console.error("Error al analizar la imagen:", error);
      alert("No se pudo analizar la imagen. Por favor, intenta con otra.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setFaceWarning(null);
      processImage(file);
    } else {
      alert("Por favor, arrastra solo archivos de imagen (JPG, PNG, GIF, WebP)");
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
        emotions: detectionResults?.emotions || [],
        emotionsByFace: detectionResults?.emotionsByFace || [],
        dominantEmotion: detectionResults?.dominantEmotion,
        suggestedTags: detectionResults?.suggestedTags,
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
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Formatos soportados: JPG, PNG, GIF, WebP
                </p>
                <p className="text-xs text-muted-foreground">
                  Tamaño máximo: 10MB • Resolución recomendada: mínimo 800x600px
                </p>
              </div>
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
              <div className="relative rounded-lg overflow-hidden bg-muted" ref={containerRef}>
                <img
                  ref={imageRef}
                  src={preview}
                  alt="Preview"
                  className="w-full max-h-96 object-contain"
                  onLoad={(e) => {
                    // Asegurarse de que la imagen esté completamente cargada antes de mostrar los marcadores
                    if (faces.length > 0) {
                      setFaces([...faces]); // Forzar re-render
                    }
                  }}
                />
                {faces.map((face, index) => (
                  <FaceMarker
                    key={index}
                    face={face}
                    index={index}
                    imageRef={imageRef.current}
                    containerRef={containerRef.current}
                  />
                ))}
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setSelectedFile(null);
                    setPreview("");
                    setDetectionResults(null);
                    setFaces([]);
                    setFaceWarning(null);
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

              {/* Face Detection Warning */}
              {faceWarning && (
                <Alert variant={
                  faceWarning.type === 'error' ? 'destructive' :
                  faceWarning.type === 'warning' ? 'default' : 'secondary'
                }>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="flex items-center gap-2">
                    {faceWarning.message}
                  </AlertDescription>
                </Alert>
              )}

              {/* Detection Results */}
              {detectionResults && !isProcessing && (
                <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription>
                    <div className="space-y-3">
                      <p className="flex items-center gap-2 font-medium">
                        <Sparkles className="h-4 w-4" />
                        <span>Análisis de imagen completado</span>
                      </p>
                      
                      {/* Resultados del análisis facial */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Análisis Facial:</h4>
                        <Badge variant="secondary" className="text-sm">
                          {detectionResults.faces} {detectionResults.faces === 1 ? "rostro detectado" : "rostros detectados"}
                        </Badge>
                        
                        {/* Análisis de emociones por rostro */}
                        {detectionResults.emotionsByFace && detectionResults.emotionsByFace.length > 0 && (
                          <div className="space-y-3">
                            <p className="text-sm font-medium">Análisis por rostro:</p>
                            {detectionResults.emotionsByFace.map((faceEmotions, index) => (
                              <div key={index} className="space-y-2 border-l-2 pl-3 py-1">
                                <p className="text-sm font-medium">Rostro {index + 1}:</p>
                                <div className="space-y-1">
                                  {faceEmotions.map((emotion, eIndex) => (
                                    <div key={eIndex} className="flex items-center justify-between text-sm">
                                      <span className="capitalize">{emotion.spanishEmotion}</span>
                                      <div className="flex items-center gap-2">
                                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                          <div
                                            className="h-full bg-blue-500 rounded-full"
                                            style={{ width: `${emotion.percentage}%` }}
                                          />
                                        </div>
                                        <span className="text-xs w-12 text-right">{emotion.percentage}%</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}

                            {/* Emoción dominante */}
                            {detectionResults.dominantEmotion && (
                              <div className="mt-3 pt-3 border-t">
                                <p className="text-sm">
                                  Emoción predominante: <span className="font-medium capitalize">{emotionTranslations[detectionResults.dominantEmotion]}</span>
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Tags sugeridos */}
                      {detectionResults.suggestedTags && (
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Tags sugeridos:</p>
                          <div className="flex flex-wrap gap-2">
                            {detectionResults.suggestedTags.map(tag => (
                              <Badge key={tag} variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <p className="text-xs text-muted-foreground mt-2">
                        ✅ Análisis facial completo
                        <br />
                        ✅ Detección de emociones realizada
                        <br />
                        ✅ Sugerencias de tags generadas
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
                  • Reconocimiento facial con Cloud Vision API
                  <br />
                  • Análisis de Emociones con Cloud Vision API
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
