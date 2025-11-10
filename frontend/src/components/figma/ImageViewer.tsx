import { X, Heart, TrendingUp, TrendingDown, Download, User as UserIcon, Eye, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { ImageData, UserData } from "@/types";
import { ImageWithFallback } from "./ImageWithFallback";
import { imageService } from "@/services/imageService";
import { userService } from "@/services/userService";
import { useState, useEffect } from "react";

interface ImageViewerProps {
  image: ImageData;
  currentUser: UserData | null;
  onClose: () => void;
  onDelete?: () => void;
  onNavigateToProfile?: (username: string) => void;
}

export function ImageViewer({ image, currentUser, onClose, onDelete, onNavigateToProfile }: ImageViewerProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [hasUpvoted, setHasUpvoted] = useState(
    currentUser && currentUser.id ? image.upvotes?.includes(currentUser.id) || false : false
  );
  const [hasDownvoted, setHasDownvoted] = useState(
    currentUser && currentUser.id ? image.downvotes?.includes(currentUser.id) || false : false
  );
  const [upvotesCount, setUpvotesCount] = useState(image.upvotes?.length || 0);
  const [downvotesCount, setDownvotesCount] = useState(image.downvotes?.length || 0);
  const [isDeleting, setIsDeleting] = useState(false);

  const score = upvotesCount - downvotesCount;
  const isOwner = currentUser && image.author.username === `@${currentUser.username}`;

  // Cargar estado de favorito al montar el componente
  useEffect(() => {
    const checkFavorite = async () => {
      if (!currentUser) return;
      
      try {
        const favorites = await userService.getFavorites();
        const isFav = favorites.some((fav: any) => fav._id === image.id);
        setIsFavorite(isFav);
      } catch (error) {
        console.error('Error al verificar favorito:', error);
      }
    };
    
    checkFavorite();
  }, [currentUser, image.id]);

  const handleFavorite = async () => {
    if (!currentUser) return;
    
    try {
      const response = await userService.toggleFavorite(image.id);
      setIsFavorite(response.isFavorite);
    } catch (error) {
      console.error('Error al marcar favorito:', error);
    }
  };

  const handleUpvote = async () => {
    if (!currentUser) return;
    
    try {
      const response = await imageService.toggleUpvote(image.id);
      setHasUpvoted(response.hasUpvoted);
      setUpvotesCount(response.upvotes);
      setDownvotesCount(response.downvotes);
      if (response.hasUpvoted) {
        setHasDownvoted(false);
      }
    } catch (error) {
      console.error('Error al dar upvote:', error);
    }
  };

  const handleDownvote = async () => {
    if (!currentUser) return;
    
    try {
      const response = await imageService.toggleDownvote(image.id);
      setHasDownvoted(response.hasDownvoted);
      setUpvotesCount(response.upvotes);
      setDownvotesCount(response.downvotes);
      if (response.hasDownvoted) {
        setHasUpvoted(false);
      }
    } catch (error) {
      console.error('Error al dar downvote:', error);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = image.url;
    link.download = `${image.title}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async () => {
    if (!isOwner) return;
    
    const confirmed = window.confirm(
      '¿Estás seguro de que quieres eliminar esta imagen? Esta acción no se puede deshacer.'
    );
    
    if (!confirmed) return;
    
    setIsDeleting(true);
    try {
      await imageService.deleteImage(image.id);
      if (onDelete) {
        onDelete();
      }
      onClose();
    } catch (error) {
      console.error('Error al eliminar imagen:', error);
      alert('Error al eliminar la imagen. Por favor, intenta de nuevo.');
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-y-auto">
      <div className="min-h-screen py-6 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div 
              className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => {
                const username = image.author.username.replace('@', '');
                if (onNavigateToProfile) {
                  onNavigateToProfile(username);
                }
              }}
              title="Ver perfil del usuario"
            >
              <Avatar>
                <AvatarImage src={image.author.avatar} />
                <AvatarFallback>
                  <UserIcon className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium hover:underline">{image.author.name}</p>
                <p className="text-sm text-muted-foreground">
                  {image.author.username} · {image.timestamp}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Image Area */}
            <div className="lg:col-span-2 space-y-6">
              {/* Image - Solo vista original (transformaciones CSS solo) */}
              <div className="rounded-lg overflow-hidden bg-muted">
                <ImageWithFallback
                  src={image.url}
                  alt={image.title}
                  className="w-full h-auto max-h-[70vh] object-contain"
                />
              </div>

              {/* Image Info */}
              <div className="space-y-4">
                <div>
                  <h1 className="mb-2">{image.title}</h1>
                  <p className="text-muted-foreground">{image.description}</p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {image.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      #{tag}
                    </Badge>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Button 
                      variant={hasUpvoted ? "default" : "outline"} 
                      size="sm" 
                      className="gap-2"
                      onClick={handleUpvote}
                      disabled={!currentUser}
                    >
                      <TrendingUp className={`h-4 w-4 ${hasUpvoted ? 'fill-current' : ''}`} />
                      {upvotesCount}
                    </Button>
                    <Button 
                      variant={hasDownvoted ? "default" : "outline"} 
                      size="sm" 
                      className="gap-2"
                      onClick={handleDownvote}
                      disabled={!currentUser}
                    >
                      <TrendingDown className={`h-4 w-4 ${hasDownvoted ? 'fill-current' : ''}`} />
                      {downvotesCount}
                    </Button>
                  </div>
                  <Button 
                    variant={isFavorite ? "default" : "outline"} 
                    size="sm" 
                    className="gap-2"
                    onClick={handleFavorite}
                    disabled={!currentUser}
                  >
                    <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                    Favorito
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2"
                    onClick={handleDownload}
                  >
                    <Download className="h-4 w-4" />
                    Descargar
                  </Button>
                  {isOwner && (
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      className="gap-2"
                      onClick={handleDelete}
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4" />
                      {isDeleting ? 'Eliminando...' : 'Eliminar'}
                    </Button>
                  )}
                </div>

                <Separator />

                {/* Stats */}
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    <span>Puntuación: {score}</span>
                  </div>
                  <div>Subida {image.timestamp}</div>
                </div>
              </div>
            </div>

            {/* Sidebar with AI Analysis */}
            <div className="space-y-6">
              {/* Face Detection Results */}
              {image.faceDetection && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <UserIcon className="h-4 w-4" />
                      Detección Facial
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Rostros detectados
                      </p>
                      <Badge variant="secondary" className="gap-2">
                        <Sparkles className="h-3 w-3" />
                        {image.faceDetection.facesDetected}{" "}
                        {image.faceDetection.facesDetected === 1 ? "cara" : "caras"}
                      </Badge>
                    </div>
                    {image.faceDetection.emotions && image.faceDetection.emotions.length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Emociones detectadas
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {image.faceDetection.emotions.map((emotion) => (
                            <Badge key={emotion} variant="outline">
                              {emotion}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground pt-2 border-t">
                      Procesado con face-api.js y OpenCV
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Rekognition Results */}
              {image.rekognition && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Amazon Rekognition
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {image.rekognition.labels && image.rekognition.labels.length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Etiquetas detectadas
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {image.rekognition.labels.map((label) => (
                            <Badge key={label} variant="secondary">
                              {label}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {image.rekognition.moderationLabels && 
                     image.rekognition.moderationLabels.length === 0 && (
                      <div className="text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
                        <Badge variant="outline" className="border-green-500">
                          ✓ Contenido apropiado
                        </Badge>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground pt-2 border-t">
                      Análisis automático de contenido
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Transformations Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Transformaciones</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Original</span>
                    <Badge variant="outline">Alta resolución</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground pt-2 border-t">
                    Imagen procesada y optimizada
                  </p>
                </CardContent>
              </Card>

              {/* Storage Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Almacenamiento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500 mt-1.5" />
                    <div>
                      <p className="text-muted-foreground">
                        Almacenado en AWS S3
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Imágenes optimizadas
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500 mt-1.5" />
                    <div>
                      <p className="text-muted-foreground">
                        Metadatos en base de datos
                      </p>
                      <p className="text-xs text-muted-foreground">
                        MongoDB Atlas
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
