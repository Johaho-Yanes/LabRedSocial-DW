import { useState, useMemo } from "react";
import { Search, Upload, Grid3x3, LogOut, Image as ImageIcon, UserCircle, MessageCircle } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ImageUpload } from "./ImageUpload";
import { ImageThumbnail } from "./ImageThumbnail";
import { Messages } from "./Messages";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { Card, CardContent } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import type { ImageData, UserData, FollowingUser } from "@/types";

interface HomePageProps {
  onImageClick: (image: ImageData) => void;
  onLogout: () => void;
  onProfileClick: () => void;
  onUserProfileClick: (username: string) => void;
  currentUser: UserData;
  onNewImage: (image: ImageData) => void;
  allImages: ImageData[];
  following?: FollowingUser[];
  allUsers?: FollowingUser[];
}

export function HomePage({ onImageClick, onLogout, onProfileClick, onUserProfileClick, currentUser, onNewImage, allImages, following = [], allUsers = [] }: HomePageProps) {
  const [showUpload, setShowUpload] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "popular" | "new" | "following">("all");
  
  // Determinar si estamos buscando usuarios (comienza con @)
  const isSearchingUsers = searchQuery.startsWith("@");

  const handleNewImage = (newImage: ImageData) => {
    onNewImage(newImage);
    setShowUpload(false);
  };

  // Función para mezclar array aleatoriamente (Fisher-Yates shuffle)
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Calcular ponderación de popularidad
  const calculatePopularity = (image: ImageData): number => {
    return image.likes.length + (image.upvotes?.length || 0) * 1.5 - (image.downvotes?.length || 0) * 0.5;
  };

  // Obtener timestamp para ordenamiento (usar createdAt si está disponible)
  const getImageDate = (image: ImageData): number => {
    // Si tiene createdAt, usarlo
    if (image.createdAt) {
      return new Date(image.createdAt).getTime();
    }
    // Si no, intentar parsear el timestamp string
    const match = image.timestamp.match(/hace (\d+) (hora|día)/);
    if (match) {
      const value = parseInt(match[1]);
      const unit = match[2];
      const hoursAgo = unit === 'día' ? value * 24 : value;
      return Date.now() - (hoursAgo * 60 * 60 * 1000);
    }
    return Date.now();
  };

  // Filtrar usuarios cuando la búsqueda comienza con @
  const filteredUsers = useMemo(() => {
    if (!isSearchingUsers) return [];
    
    const usernameQuery = searchQuery.slice(1).toLowerCase(); // Remover el @
    return allUsers.filter(user => 
      user.username.toLowerCase().includes(usernameQuery) &&
      user.username !== currentUser.username // Excluir al usuario actual
    );
  }, [allUsers, searchQuery, isSearchingUsers, currentUser.username]);

  // Aplicar filtros y ordenamiento para imágenes
  const filteredAndSortedImages = useMemo(() => {
    // Si estamos buscando usuarios, no mostrar imágenes
    if (isSearchingUsers) return [];
    
    // Primero filtrar por búsqueda
    let filtered = allImages.filter((img) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        img.title.toLowerCase().includes(searchLower) ||
        img.description.toLowerCase().includes(searchLower) ||
        img.tags.some((tag) => tag.toLowerCase().includes(searchLower)) ||
        img.author.name.toLowerCase().includes(searchLower)
      );
    });

    // Aplicar filtro por modo
    if (filterMode === "following") {
      const followingUsernames = following.map(u => `@${u.username}`);
      filtered = filtered.filter(img => followingUsernames.includes(img.author.username));
    }

    // Aplicar ordenamiento según el modo
    switch (filterMode) {
      case "all":
        return shuffleArray(filtered);
      
      case "popular":
        return [...filtered].sort((a, b) => calculatePopularity(b) - calculatePopularity(a));
      
      case "new":
        // Ordenar por fecha, más recientes primero
        return [...filtered].sort((a, b) => getImageDate(b) - getImageDate(a));
      
      case "following":
        // Para siguiendo, ordenar por recientes
        return [...filtered].sort((a, b) => getImageDate(b) - getImageDate(a));
      
      default:
        return filtered;
    }
  }, [allImages, searchQuery, filterMode, following, isSearchingUsers]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center gap-4 px-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
              <Grid3x3 className="h-5 w-5 text-white" />
            </div>
            <span className="hidden sm:inline-block font-semibold">InstaGur</span>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar imágenes, usuarios, tags..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-2">
            <Button
              size="sm"
              className="gap-2 bg-purple-600 hover:bg-purple-700 text-white"
              onClick={() => setShowUpload(true)}
            >
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">Subir</span>
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setShowMessages(true)}
              className="relative"
            >
              <MessageCircle className="h-5 w-5" />
              {/* Badge para mensajes no leídos - puedes agregar lógica aquí */}
            </Button>
            <Button variant="ghost" size="icon" onClick={onProfileClick}>
              <UserCircle className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onLogout}
              className="text-destructive hover:text-destructive"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Mostrar usuarios si la búsqueda comienza con @ */}
        {isSearchingUsers ? (
          <div className="max-w-2xl mx-auto">
            <p className="text-sm text-muted-foreground mb-4">
              Buscando usuarios: <span className="text-foreground font-medium">{searchQuery}</span>
            </p>
            {filteredUsers.length > 0 ? (
              <div className="space-y-3">
                {filteredUsers.map((user) => (
                  <Card 
                    key={user.id} 
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => onUserProfileClick(user.username)}
                  >
                    <CardContent className="flex items-center gap-4 p-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={user.avatar} alt={user.username} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                          {user.username.slice(0, 1).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">@{user.username}</p>
                        <p className="text-sm text-muted-foreground">{user.bio}</p>
                      </div>
                      <UserCircle className="h-5 w-5 text-muted-foreground" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <UserCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  No se encontraron usuarios que coincidan con tu búsqueda
                </p>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Filter Tabs */}
            <div className="mb-6 max-w-2xl mx-auto">
              <Tabs value={filterMode} onValueChange={(value) => setFilterMode(value as any)} className="w-full">
                <TabsList className="w-full grid grid-cols-4">
                  <TabsTrigger value="all">
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Todas
                  </TabsTrigger>
                  <TabsTrigger value="popular">Popular</TabsTrigger>
                  <TabsTrigger value="new">Recientes</TabsTrigger>
                  <TabsTrigger value="following">Siguiendo</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Images Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-7xl mx-auto pb-6">
              {filteredAndSortedImages.map((image) => (
                <ImageThumbnail
                  key={image.id}
                  image={image}
                  onClick={() => onImageClick(image)}
                />
              ))}
            </div>

            {filteredAndSortedImages.length === 0 && (
              <div className="text-center py-12">
                <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {filterMode === "following" 
                    ? "No hay imágenes de usuarios que sigues"
                    : "No se encontraron imágenes que coincidan con tu búsqueda"}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <ImageUpload
          onClose={() => setShowUpload(false)}
          onUpload={handleNewImage}
          currentUser={currentUser}
        />
      )}

      {/* Messages Modal */}
      {showMessages && (
        <Messages
          onClose={() => setShowMessages(false)}
          currentUser={currentUser}
          following={following}
          allUsers={allUsers}
        />
      )}
    </div>
  );
}
