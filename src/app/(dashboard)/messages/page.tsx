"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { db } from "@/lib/firebase/config";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Loader2, Search, MessagesSquare } from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";
import { ChatWithUserDetails } from "@/types/chat";
import Link from "next/link";
import { UnreadBadge } from "@/components/messaging/unread-badge";
import { UnreadMessageBadge } from "@/components/messaging/unread-message-badge";
import { Badge } from "@/components/ui/badge";

export default function MessagesPage() {
  const { currentUser } = useAuth();
  const [chats, setChats] = useState<ChatWithUserDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!currentUser) return;

    setLoading(true);

    const chatsRef = collection(db, "chats");
    const q = query(
      chatsRef,
      where("participants", "array-contains", currentUser.uid),
      orderBy("updatedAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        const chatsList: ChatWithUserDetails[] = [];

        for (const docSnapshot of snapshot.docs) {
          const chatData = docSnapshot.data();

          const otherUserId = chatData.participants.find(
            (id: string) => id !== currentUser.uid
          );

          if (otherUserId) {
            try {
              const userRef = doc(db, "users", otherUserId);
              const userDoc = await getDoc(userRef);

              if (userDoc.exists()) {
                const userData = userDoc.data();

                const messages = chatData.messages || [];
                const unreadMessages = messages.filter(
                  (msg: any) => !msg.read && msg.senderId !== currentUser.uid
                );

                chatsList.push({
                  id: docSnapshot.id,
                  ...chatData,
                  otherUser: {
                    id: otherUserId,
                    username: userData.username || "Unknown User",
                    profileImage: userData.profileImage || "",
                  },
                  unreadCount: unreadMessages.length,
                  participants: chatData.participants || [],
                  messages: chatData.messages || [],
                  createdAt: chatData.createdAt || serverTimestamp(),
                  updatedAt: chatData.updatedAt || serverTimestamp(),
                });
              }
            } catch (error) {
              console.error("Error fetching user details:", error);
            }
          }
        }

        chatsList.sort((a, b) => {
          const aTime = a.updatedAt?.toDate().getTime() || 0;
          const bTime = b.updatedAt?.toDate().getTime() || 0;
          return bTime - aTime;
        });

        setChats(chatsList);
        setLoading(false);
      },
      (error) => {
        console.error("Error in chat listener:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  const formatChatTimestamp = (timestamp: Timestamp) => {
    if (!timestamp) return "";

    const date = timestamp.toDate();

    if (isToday(date)) {
      return format(date, "h:mm a");
    } else if (isYesterday(date)) {
      return "Yesterday";
    } else {
      return format(date, "MMM d");
    }
  };

  const filteredChats = chats.filter((chat) => {
    if (!searchQuery) return true;
    return chat.otherUser.username
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search conversations..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : chats.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent className="pt-12">
            <MessagesSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No messages yet</h3>
            <p className="text-muted-foreground mb-6">
              Start a conversation with someone to begin messaging
            </p>
            <Link href="/connect">
              <Button>Connect with others</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="bg-background border rounded-lg overflow-hidden">
          {filteredChats.map((chat, index) => (
            <div key={chat.id}>
              <Link href={`/messages/${chat.id}`}>
                <div className="flex items-center p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                  <Avatar className="h-12 w-12 mr-4">
                    <AvatarImage
                      src={chat.otherUser.profileImage}
                      alt={chat.otherUser.username}
                    />
                    <AvatarFallback>
                      {chat.otherUser.username?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3
                        className={`font-medium truncate ${
                          chat.unreadCount > 0
                            ? "text-primary font-semibold"
                            : ""
                        }`}
                      >
                        {chat.otherUser.username}
                      </h3>
                      {chat.updatedAt && (
                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                          {formatChatTimestamp(chat.updatedAt)}
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <p
                        className={`text-sm truncate flex-1 ${
                          chat.unreadCount > 0
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {chat.lastMessage?.text || "Start a conversation"}
                      </p>
                      {/* {chat.unreadCount > 0 && (
                        <Badge
                          variant="destructive"
                          className="ml-2 h-5 min-w-[20px] rounded-full flex items-center justify-center"
                        >
                          {chat.unreadCount}
                        </Badge>
                      )} */}
                    </div>
                    <UnreadMessageBadge
                      chatId={chat.id}
                      className="absolute right-2 top-2"
                    />
                  </div>
                </div>
              </Link>
              {index < filteredChats.length - 1 && <Separator />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
