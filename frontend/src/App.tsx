import { useState, useEffect } from "react";
import { WelcomePage } from "./components/figma/WelcomePage";
import { HomePage } from "./components/figma/HomePage";
import { UserProfile } from "./components/figma/UserProfile";
import { OtherUserProfile } from "./components/figma/OtherUserProfile";
import { ImageViewer } from "./components/figma/ImageViewer";
import { Messages } from "./components/figma/Messages";
import type { UserData, ImageData, FollowingUser } from "./types";
import { authService } from "./services/authService";
import { imageService } from "./services/imageService";
import { userService } from "./services/userService";

type ViewType = "welcome" | "home" | "profile" | "otherProfile" | "imageViewer";

export default function App() {
  const [currentView, setCurrentView] = useState<ViewType>("welcome");
  const [previousView, setPreviousView] = useState<ViewType>("home"); // Nueva variable para guardar la vista anterior
  const [activeProfileTab, setActiveProfileTab] = useState<string>("images"); // Guardar pestaña activa del perfil
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [allImages, setAllImages] = useState<ImageData[]>([]);
  const [allUsers, setAllUsers] = useState<FollowingUser[]>([]);
  const [following, setFollowing] = useState<FollowingUser[]>([]);
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
  const [selectedUsername, setSelectedUsername] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [showMessagesModal, setShowMessagesModal] = useState(false);
  const [messageRecipient, setMessageRecipient] = useState<string>("");

  // Verificar si hay usuario autenticado al cargar la app
  useEffect(() => {
    const checkAuth = async () => {
      const user = authService.getCurrentUser();
      if (user && authService.isAuthenticated()) {
        setCurrentUser(user);
        setCurrentView("home");
        await loadInitialData();
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  // Cargar datos iniciales (imágenes, usuarios, following)
  const loadInitialData = async () => {
    try {
      const [images, users, followingUsers] = await Promise.all([
        imageService.getAllImages(),
        userService.getAllUsers(),
        userService.getFollowing(),
      ]);
      setAllImages(images);
      setAllUsers(users);
      setFollowing(followingUsers);
    } catch (error) {
      console.error("Error al cargar datos iniciales:", error);
    }
  };

  const handleLogin = async (userData: UserData) => {
    setCurrentUser(userData);
    setCurrentView("home");
    await loadInitialData();
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setCurrentView("welcome");
    setAllImages([]);
    setAllUsers([]);
    setFollowing([]);
  };

  const handleNewImage = async (newImage: ImageData) => {
    setAllImages([newImage, ...allImages]);
    // Recargar las imágenes para obtener datos actualizados del servidor
    try {
      const images = await imageService.getAllImages();
      setAllImages(images);
    } catch (error) {
      console.error("Error al recargar imágenes:", error);
    }
  };

  const handleImageClick = (image: ImageData) => {
    setPreviousView(currentView); // Guardar la vista actual antes de cambiar
    setSelectedImage(image);
    setCurrentView("imageViewer");
  };

  const handleProfileClick = () => {
    setCurrentView("profile");
  };

  const handleUserProfileClick = (username: string) => {
    setSelectedUsername(username);
    setCurrentView("otherProfile");
  };

  const handleAvatarChange = async (avatarFile: File) => {
    if (currentUser) {
      try {
        const avatarUrl = await userService.uploadAvatar(avatarFile);
        setCurrentUser({ ...currentUser, avatar: avatarUrl });
      } catch (error) {
        console.error("Error al actualizar avatar:", error);
        alert("Error al subir el avatar. Por favor intenta de nuevo.");
      }
    }
  };

  const handleFollow = async () => {
    try {
      const isCurrentlyFollowing = following.some(f => f.username === selectedUsername);
      
      if (isCurrentlyFollowing) {
        await userService.unfollowUser(selectedUsername);
        setFollowing(following.filter(f => f.username !== selectedUsername));
        alert(`Dejaste de seguir a @${selectedUsername}`);
      } else {
        await userService.followUser(selectedUsername);
        // Recargar la lista de following
        const followingUsers = await userService.getFollowing();
        setFollowing(followingUsers);
        alert(`Ahora sigues a @${selectedUsername}`);
      }
    } catch (error: any) {
      console.error("Error al seguir/dejar de seguir:", error);
      alert(error.response?.data?.message || "Error al seguir/dejar de seguir usuario");
    }
  };

  const handleUnfollow = async (username: string) => {
    try {
      await userService.unfollowUser(username);
      setFollowing(following.filter(f => f.username !== username));
      alert(`Dejaste de seguir a @${username}`);
    } catch (error: any) {
      console.error("Error al dejar de seguir:", error);
      alert(error.response?.data?.message || "Error al dejar de seguir usuario");
    }
  };

  const getUserImages = (username: string): ImageData[] => {
    return allImages.filter(img => img.author.username === `@${username}`);
  };

  const currentUserImages = currentUser ? getUserImages(currentUser.username) : [];
  const selectedUserImages = getUserImages(selectedUsername);
  const selectedUserData = allUsers.find(u => u.username === selectedUsername);
  const isFollowing = following.some(f => f.username === selectedUsername);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {currentView === "welcome" && (
        <WelcomePage onLogin={handleLogin} />
      )}

      {currentView === "home" && currentUser && (
        <HomePage
          currentUser={currentUser}
          allImages={allImages}
          following={following}
          allUsers={allUsers}
          onImageClick={handleImageClick}
          onLogout={handleLogout}
          onProfileClick={handleProfileClick}
          onUserProfileClick={handleUserProfileClick}
          onNewImage={handleNewImage}
        />
      )}

      {currentView === "profile" && currentUser && (
        <UserProfile
          user={currentUser}
          userImages={currentUserImages}
          following={following}
          isOwnProfile={true}
          activeTab={activeProfileTab}
          onTabChange={setActiveProfileTab}
          onBack={() => setCurrentView("home")}
          onImageClick={handleImageClick}
          onAvatarChange={handleAvatarChange}
          onUserClick={handleUserProfileClick}
          onUnfollow={handleUnfollow}
        />
      )}

      {currentView === "otherProfile" && selectedUserData && (
        <OtherUserProfile
          username={selectedUserData.username}
          avatar={selectedUserData.avatar}
          bio={selectedUserData.bio}
          userImages={selectedUserImages}
          isFollowing={isFollowing}
          onBack={() => setCurrentView("home")}
          onImageClick={handleImageClick}
          onFollow={handleFollow}
          onMessage={() => {
            setMessageRecipient(selectedUserData.username);
            setShowMessagesModal(true);
          }}
        />
      )}

      {currentView === "imageViewer" && selectedImage && (
        <ImageViewer
          image={selectedImage}
          currentUser={currentUser}
          onClose={() => setCurrentView(previousView)} // Regresar a la vista anterior
          onDelete={async () => {
            // Recargar imágenes después de eliminar
            const images = await imageService.getAllImages();
            setAllImages(images);
            setCurrentView(previousView); // Regresar a la vista anterior después de eliminar
          }}
        />
      )}

      {showMessagesModal && currentUser && (
        <Messages
          currentUser={currentUser}
          following={following}
          allUsers={allUsers}
          selectedUsername={messageRecipient}
          onClose={() => {
            setShowMessagesModal(false);
            setMessageRecipient("");
          }}
        />
      )}
    </div>
  );
}

