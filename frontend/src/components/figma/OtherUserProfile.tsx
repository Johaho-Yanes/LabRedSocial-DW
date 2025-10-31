import { useState } from "react";
import { ArrowLeft, UserPlus, MessageCircle, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ImageThumbnail } from "./ImageThumbnail";
import type { ImageData } from "@/types";

interface OtherUserProfileProps {
  username: string;
  avatar: string;
  bio: string;
  userImages: ImageData[];
  onBack: () => void;
  onImageClick: (image: ImageData) => void;
  onFollow: () => void;
  onMessage: () => void;
  isFollowing: boolean;
}

export function OtherUserProfile({ 
  username, 
  avatar, 
  bio, 
  userImages, 
  onBack, 
  onImageClick,
  onFollow,
  onMessage,
  isFollowing 
}: OtherUserProfileProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center gap-4 px-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <span>Perfil de @{username}</span>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Profile Info */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={avatar} alt={username} />
              <AvatarFallback>{username.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center sm:text-left">
              <h2>@{username}</h2>
              <p className="text-muted-foreground mt-2">{bio}</p>
              <div className="flex gap-6 mt-4 justify-center sm:justify-start">
                <div>
                  <span className="text-muted-foreground">Imágenes</span>
                  <p>{userImages.length}</p>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-3 mt-6 justify-center sm:justify-start">
                <Button 
                  variant={isFollowing ? "outline" : "default"}
                  className="gap-2"
                  onClick={onFollow}
                >
                  <UserPlus className="h-4 w-4" />
                  {isFollowing ? "Siguiendo" : "Seguir"}
                </Button>
                <Button 
                  variant="outline"
                  className="gap-2"
                  onClick={onMessage}
                >
                  <MessageCircle className="h-4 w-4" />
                  Enviar mensaje
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Images Grid */}
        <div className="mb-4">
          <h3 className="mb-4">Imágenes de @{username}</h3>
        </div>
        {userImages.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {userImages.map((image) => (
              <ImageThumbnail
                key={image.id}
                image={image}
                onClick={() => onImageClick(image)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Este usuario aún no ha subido ninguna imagen
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
