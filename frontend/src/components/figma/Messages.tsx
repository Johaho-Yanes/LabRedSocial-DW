import { useState, useEffect } from "react";
import { X, Send, ArrowLeft, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { messageService, type Message, type Conversation } from "@/services/messageService";
import type { UserData } from "@/types";

interface FollowingUser {
  id: string;
  username: string;
  avatar: string;
  bio: string;
}

interface MessagesProps {
  onClose: () => void;
  currentUser: UserData;
  following: FollowingUser[];
  allUsers?: FollowingUser[];
  selectedUsername?: string;
}

export function Messages({ onClose, currentUser, following, allUsers = [], selectedUsername }: MessagesProps) {
  const [selectedUser, setSelectedUser] = useState<FollowingUser | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // Cargar conversaciones al montar el componente
  useEffect(() => {
    loadConversations();
  }, []);

  // Al abrir el componente, si hay un usuario seleccionado, buscarlo y seleccionarlo
  useEffect(() => {
    if (selectedUsername) {
      const user = allUsers.find(u => u.username === selectedUsername) || 
                   following.find(u => u.username === selectedUsername);
      if (user) {
        handleSelectUser(user);
      }
    }
  }, [selectedUsername, allUsers, following]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const convs = await messageService.getConversations();
      setConversations(convs);
    } catch (error) {
      console.error('Error al cargar conversaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (username: string) => {
    try {
      const msgs = await messageService.getMessages(username);
      setMessages(msgs);
    } catch (error) {
      console.error('Error al cargar mensajes:', error);
    }
  };

  const handleSelectUser = async (user: FollowingUser) => {
    setSelectedUser(user);
    await loadMessages(user.username);
    
    // Actualizar conversaciones para quitar badge de no leído
    setConversations(convs => 
      convs.map(conv => 
        conv.user.username === user.username 
          ? { ...conv, unreadCount: 0 }
          : conv
      )
    );
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return;

    try {
      const message = await messageService.sendMessage(selectedUser.username, newMessage);
      setMessages([...messages, message]);
      setNewMessage("");
      
      // Actualizar conversaciones
      await loadConversations();
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      alert('Error al enviar el mensaje');
    }
  };

  // Formatear timestamp
  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) return 'justo ahora';
    if (minutes < 60) return `hace ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `hace ${hours} hora${hours > 1 ? 's' : ''}`;
    const days = Math.floor(hours / 24);
    return `hace ${days} día${days > 1 ? 's' : ''}`;
  };

  // Mensajes de la conversación actual
  const currentConversation = messages;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed inset-4 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-4xl bg-background border rounded-lg shadow-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <MessageCircle className="h-5 w-5" />
            <h2>Mensajes</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Conversations List */}
          <div className="w-full sm:w-80 border-r flex flex-col">
            <div className="px-4 py-3 border-b">
              <p className="text-muted-foreground">
                Tus conversaciones
              </p>
            </div>
            <ScrollArea className="flex-1">
              <div className="divide-y">
                {conversations.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No tienes conversaciones aún</p>
                    <p className="text-xs mt-2">Busca usuarios con @ para comenzar a chatear</p>
                  </div>
                ) : (
                  conversations.map(({ user, unreadCount, lastMessage }) => (
                    <button
                      key={user.id}
                      onClick={() => handleSelectUser(user)}
                      className={`w-full p-4 flex items-start gap-3 hover:bg-muted/50 transition-colors text-left ${
                        selectedUser?.id === user.id ? "bg-muted" : ""
                      }`}
                    >
                      <Avatar>
                        <AvatarImage src={user.avatar} alt={user.username} />
                        <AvatarFallback>
                          {user.username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="truncate">@{user.username}</span>
                          {unreadCount > 0 && (
                            <span className="bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5 ml-2">
                              {unreadCount}
                            </span>
                          )}
                        </div>
                        {lastMessage && (
                          <p className="text-muted-foreground truncate">
                            {lastMessage.senderId === user.id
                              ? ""
                              : "Tú: "}
                            {lastMessage.text}
                          </p>
                        )}
                        {lastMessage && (
                          <p className="text-muted-foreground mt-1">
                            {formatTimestamp(lastMessage.timestamp)}
                          </p>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Chat Area */}
          {selectedUser ? (
            <div className="hidden sm:flex flex-col flex-1">
              {/* Chat Header */}
              <div className="flex items-center gap-3 px-6 py-4 border-b">
                <Avatar>
                  <AvatarImage src={selectedUser.avatar} alt={selectedUser.username} />
                  <AvatarFallback>
                    {selectedUser.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p>@{selectedUser.username}</p>
                  <p className="text-muted-foreground">{selectedUser.bio}</p>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-6">
                <div className="space-y-4">
                  {currentConversation.length === 0 ? (
                    <div className="text-center text-muted-foreground py-12">
                      <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No hay mensajes aún</p>
                      <p className="mt-2">¡Envía el primer mensaje!</p>
                    </div>
                  ) : (
                    currentConversation.map((message) => {
                      const isOwn = message.sender.username === currentUser.username;
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              isOwn
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}
                          >
                            <p>{message.text}</p>
                            <p
                              className={`mt-1 text-right ${
                                isOwn
                                  ? "text-primary-foreground/70"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {formatTimestamp(message.timestamp)}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    placeholder="Escribe un mensaje..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="hidden sm:flex flex-1 items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Selecciona una conversación</p>
                <p className="mt-2">para empezar a mensajear</p>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Chat View */}
        {selectedUser && (
          <div className="sm:hidden fixed inset-0 bg-background z-50 flex flex-col">
            {/* Mobile Chat Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedUser(null)}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Avatar className="h-8 w-8">
                <AvatarImage src={selectedUser.avatar} alt={selectedUser.username} />
                <AvatarFallback>
                  {selectedUser.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="truncate">@{selectedUser.username}</p>
              </div>
            </div>

            {/* Mobile Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {currentConversation.length === 0 ? (
                  <div className="text-center text-muted-foreground py-12">
                    <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No hay mensajes aún</p>
                    <p className="mt-2">¡Envía el primer mensaje!</p>
                  </div>
                ) : (
                  currentConversation.map((message) => {
                    const isOwn = message.sender.username === currentUser.username;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[75%] px-4 py-2 rounded-lg ${
                            isOwn
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <p>{message.text}</p>
                          <p
                            className={`mt-1 text-right ${
                              isOwn
                                ? "text-primary-foreground/70"
                                : "text-muted-foreground"
                            }`}
                          >
                            {formatTimestamp(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>

            {/* Mobile Message Input */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  placeholder="Escribe un mensaje..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
