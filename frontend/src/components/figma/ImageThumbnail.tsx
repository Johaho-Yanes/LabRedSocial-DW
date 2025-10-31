import { Heart, MessageCircle, TrendingUp, TrendingDown, Eye } from "lucide-react";
import { Badge } from "../ui/badge";
import { ImageWithFallback } from "./ImageWithFallback";
import type { ImageData } from "@/types";

interface ImageThumbnailProps {
  image: ImageData;
  onClick: () => void;
}

export function ImageThumbnail({ image, onClick }: ImageThumbnailProps) {
  const score = (image.upvotes?.length || 0) - (image.downvotes?.length || 0);

  return (
    <div
      className="group relative cursor-pointer overflow-hidden rounded-lg bg-muted transition-all hover:scale-105 hover:shadow-lg"
      onClick={onClick}
    >
      {/* Miniatura de la imagen */}
      <div className="aspect-square relative overflow-hidden">
        <ImageWithFallback
          src={image.thumbnail}
          alt={image.title}
          className="h-full w-full object-cover transition-transform group-hover:scale-110"
        />
        
        {/* Overlay con información */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
            <p className="text-sm line-clamp-2 mb-2">
              {image.title}
            </p>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Heart className="h-3 w-3" />
                  {image.likes?.length || 0}
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="h-3 w-3" />
                  {image.comments?.length || 0}
                </span>
              </div>
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                Ver más
              </span>
            </div>
          </div>
        </div>

        {/* Badge de puntuación (estilo Imgur) */}
        <div className="absolute top-2 right-2">
          <Badge
            variant={score > 1000 ? "default" : "secondary"}
            className="gap-1 bg-background/80 backdrop-blur"
          >
            {score > 0 ? (
              <TrendingUp className="h-3 w-3 text-green-500" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-500" />
            )}
            {score}
          </Badge>
        </div>

        {/* Badge de detección de caras */}
        {image.faceDetection && image.faceDetection.facesDetected > 0 && (
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="bg-blue-500/80 text-white backdrop-blur text-xs">
              {image.faceDetection.facesDetected} {image.faceDetection.facesDetected === 1 ? 'cara' : 'caras'}
            </Badge>
          </div>
        )}
      </div>

      {/* Tags (visible sin hover) */}
      {image.tags && image.tags.length > 0 && (
        <div className="absolute bottom-2 left-2 right-2 flex gap-1 flex-wrap opacity-0 group-hover:opacity-100 transition-opacity">
          {image.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs bg-background/80 backdrop-blur">
              #{tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
