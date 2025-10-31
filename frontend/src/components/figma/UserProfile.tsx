import { useState, useEffect } from "react";
import { ArrowLeft, Users, Image as ImageIcon, Camera, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ImageThumbnail } from "./ImageThumbnail";
import { ProfilePictureUpload } from "./ProfilePictureUpload";
import { userService } from "@/services/userService";
import type { ImageData, UserData } from "@/types";

interface FollowingUser {
  id: string;
  username: string;
  avatar: string;
  bio: string;
}

interface UserProfileProps {
  user: UserData;
  userImages: ImageData[];
  following: FollowingUser[];
  isOwnProfile?: boolean; // Nuevo prop para saber si es el perfil propio
  activeTab?: string; // Pestaña activa actual
  onTabChange?: (tab: string) => void; // Callback cuando cambia la pestaña
  onBack: () => void;
  onImageClick: (image: ImageData) => void;
  onAvatarChange?: (avatarFile: File) => void;
  onUserClick?: (username: string) => void;
  onUnfollow?: (username: string) => void;
}

export function UserProfile({ user, userImages, following, isOwnProfile = false, activeTab = "images", onTabChange, onBack, onImageClick, onAvatarChange, onUserClick, onUnfollow }: UserProfileProps) {
  const [showAvatarUpload, setShowAvatarUpload] = useState(false);
  const [isHoveringAvatar, setIsHoveringAvatar] = useState(false);
  const [favorites, setFavorites] = useState<ImageData[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  
  useEffect(() => {
    if (isOwnProfile) {
      loadFavorites();
    }
  }, [isOwnProfile]);
  
  const loadFavorites = async () => {
    setLoadingFavorites(true);
    try {
      const favoritesData = await userService.getFavorites();
      console.log('Favoritos recibidos:', favoritesData); // Debug
      
      // Convertir el formato de backend a ImageData
      const formattedFavorites = favoritesData.map((img: any) => {
        // Validar que img y img.author existan
        if (!img || !img._id) {
          console.warn('Imagen inválida en favoritos:', img);
          return null;
        }

        const authorUsername = img.author?.username || 'unknown';
        const authorAvatar = img.author?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${authorUsername}`;
        
        return {
          id: img._id,
          url: img.url?.startsWith('http') ? img.url : `http://localhost:5000${img.url}`,
          thumbnail: img.thumbnail?.startsWith('http') ? img.thumbnail : `http://localhost:5000${img.thumbnail}`,
          title: img.title || 'Sin título',
          description: img.description || '',
          tags: img.tags || [],
          author: {
            name: authorUsername,
            username: `@${authorUsername}`,
            avatar: authorAvatar
          },
          likes: img.likes || [],
          upvotes: img.upvotes || [],
          downvotes: img.downvotes || [],
          comments: img.comments || [],
          timestamp: img.createdAt ? formatTimestamp(img.createdAt) : 'Fecha desconocida',
          createdAt: img.createdAt || new Date().toISOString(),
          transformations: {
            original: img.url?.startsWith('http') ? img.url : `http://localhost:5000${img.url}`,
            sepia: img.url?.startsWith('http') ? img.url : `http://localhost:5000${img.url}`,
            bw: img.url?.startsWith('http') ? img.url : `http://localhost:5000${img.url}`,
            mirrored: img.url?.startsWith('http') ? img.url : `http://localhost:5000${img.url}`
          }
        };
      }).filter(Boolean); // Filtrar null values
      
      console.log('Favoritos formateados:', formattedFavorites); // Debug
      setFavorites(formattedFavorites as ImageData[]);
    } catch (error) {
      console.error('Error al cargar favoritos:', error);
      setFavorites([]); // En caso de error, establecer array vacío
    } finally {
      setLoadingFavorites(false);
    }
  };
  
  const formatTimestamp = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 1) return 'justo ahora';
    if (minutes < 60) return `hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
    if (hours < 24) return `hace ${hours} hora${hours > 1 ? 's' : ''}`;
    return `hace ${days} día${days > 1 ? 's' : ''}`;
  };
  
  const handleAvatarUpload = (avatarFile: File) => {
    if (onAvatarChange) {
      onAvatarChange(avatarFile);
    }
    setShowAvatarUpload(false);
  };
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center gap-4 px-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <span>Perfil</span>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Profile Info */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
            <div 
              className="relative group cursor-pointer"
              onMouseEnter={() => setIsHoveringAvatar(true)}
              onMouseLeave={() => setIsHoveringAvatar(false)}
              onClick={() => setShowAvatarUpload(true)}
            >
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.avatar} alt={user.username} />
                <AvatarFallback>{user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              {isHoveringAvatar && (
                <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center transition-opacity">
                  <div className="text-center text-white">
                    <Camera className="h-6 w-6 mx-auto mb-1" />
                    <p className="text-xs">Cambiar</p>
                  </div>
                </div>
              )}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h2>@{user.username}</h2>
              <p className="text-muted-foreground mt-2">{user.bio}</p>
              <div className="flex gap-6 mt-4 justify-center sm:justify-start">
                <div>
                  <span className="text-muted-foreground">Imágenes</span>
                  <p>{userImages.length}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Siguiendo</span>
                  <p>{following.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs 
          value={activeTab} 
          onValueChange={onTabChange}
          className="w-full"
        >
          <TabsList className={`w-full grid ${isOwnProfile ? 'grid-cols-3' : 'grid-cols-2'}`}>
            <TabsTrigger value="images">
              <ImageIcon className="h-4 w-4 mr-2" />
              Mis Imágenes
            </TabsTrigger>
            {isOwnProfile && (
              <TabsTrigger value="favorites">
                <Heart className="h-4 w-4 mr-2" />
                Favoritos
              </TabsTrigger>
            )}
            <TabsTrigger value="following">
              <Users className="h-4 w-4 mr-2" />
              Siguiendo
            </TabsTrigger>
          </TabsList>

          <TabsContent value="images" className="mt-6">
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
                  Aún no has subido ninguna imagen
                </p>
              </div>
            )}
          </TabsContent>

          {isOwnProfile && (
            <TabsContent value="favorites" className="mt-6">
              {loadingFavorites ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Cargando favoritos...</p>
                </div>
              ) : favorites.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {favorites.map((image) => (
                    <ImageThumbnail
                      key={image.id}
                      image={image}
                      onClick={() => onImageClick(image)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Aún no tienes imágenes favoritas
                  </p>
                </div>
              )}
            </TabsContent>
          )}

          <TabsContent value="following" className="mt-6">{following.length > 0 ? (
              <div className="space-y-4">
                {following.map((followedUser) => (
                  <Card 
                    key={followedUser.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <CardContent className="flex items-center gap-4 p-4">
                      <div 
                        className="flex items-center gap-4 flex-1"
                        onClick={() => onUserClick?.(followedUser.username)}
                      >
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={followedUser.avatar} alt={followedUser.username} />
                          <AvatarFallback>{followedUser.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p>@{followedUser.username}</p>
                          <p className="text-sm text-muted-foreground">{followedUser.bio}</p>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onUnfollow?.(followedUser.username);
                        }}
                      >
                        Siguiendo
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Aún no sigues a nadie
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Avatar Upload Modal */}
      {showAvatarUpload && (
        <ProfilePictureUpload
          onClose={() => setShowAvatarUpload(false)}
          onUpload={handleAvatarUpload}
        />
      )}
    </div>
  );
}
