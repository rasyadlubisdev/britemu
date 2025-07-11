"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { db } from "@/lib/firebase/config";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  deleteDoc,
  doc,
  limit,
  startAfter,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { JourneyEntryForm } from "@/components/journey/journey-entry";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Loader2,
  MoreVertical,
  Pencil,
  Trash2,
  ThumbsUp,
  MessageCircle,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { JourneyDetail } from "@/components/journey/journey-detail";
import { JourneyCard } from "@/components/journey/journey-card";
import { toast } from "sonner";

interface JourneyEntry {
  id: string;
  userId: string;
  title: string;
  content: string;
  imageURL: string | null;
  tags: string[];
  likes: number;
  createdAt: any;
  username?: string;
  profileImage?: string;
}

export default function JourneysPage() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [journeys, setJourneys] = useState<JourneyEntry[]>([]);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot | null>(
    null
  );
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [selectedJourney, setSelectedJourney] = useState<JourneyEntry | null>(
    null
  );
  const [activeTab, setActiveTab] = useState("my-updates");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchJourneys = async (tabValue: string, reset = false) => {
    if (!currentUser) return;

    try {
      if (reset) {
        setLoading(true);
        setJourneys([]);
        setLastVisible(null);
      } else {
        setLoadingMore(true);
      }

      let journeysQuery;
      const journeysRef = collection(db, "journeys");

      if (tabValue === "my-updates") {
        journeysQuery =
          lastVisible && !reset
            ? query(
                journeysRef,
                where("userId", "==", currentUser.uid),
                orderBy("createdAt", "desc"),
                startAfter(lastVisible),
                limit(10)
              )
            : query(
                journeysRef,
                where("userId", "==", currentUser.uid),
                orderBy("createdAt", "desc"),
                limit(10)
              );
      } else {
        journeysQuery =
          lastVisible && !reset
            ? query(
                journeysRef,
                orderBy("createdAt", "desc"),
                startAfter(lastVisible),
                limit(10)
              )
            : query(journeysRef, orderBy("createdAt", "desc"), limit(10));
      }

      const querySnapshot = await getDocs(journeysQuery);

      if (querySnapshot.docs.length < 10) {
        setHasMore(false);
      } else {
        setHasMore(true);
        setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
      }

      const journeyEntries = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const data = doc.data() as JourneyEntry;

          if (data.userId !== currentUser.uid) {
            const userDoc = await getDocs(
              query(
                collection(db, "users"),
                where("__name__", "==", data.userId)
              )
            );
            if (!userDoc.empty) {
              const userData = userDoc.docs[0].data();
              data.username = userData.username || "Unknown";
              data.profileImage = userData.profileImage || "";
            }
          } else {
            const userDoc = await getDocs(
              query(
                collection(db, "users"),
                where("__name__", "==", data.userId)
              )
            );
            if (!userDoc.empty) {
              const userData = userDoc.docs[0].data();
              data.username = userData.username || "Unknown";
              data.profileImage = userData.profileImage || "";
            }
          }
          const { id: _, ...rest } = data;
          return {
            id: doc.id,
            ...rest,
          };
        })
      );

      setJourneys((prev) =>
        reset ? journeyEntries : [...prev, ...journeyEntries]
      );
    } catch (error) {
      console.error("Error fetching journeys:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchJourneys(activeTab, true);
    }
  }, [currentUser, activeTab]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleDeleteJourney = async (journeyId: string) => {
    if (!currentUser) return;

    try {
      setDeletingId(journeyId);
      await deleteDoc(doc(db, "journeys", journeyId));

      setJourneys((prev) => prev.filter((j) => j.id !== journeyId));
      toast("Your journey update has been deleted successfully.", {
        description: "Journey deleted",
      });
    } catch (error) {
      console.error("Error deleting journey:", error);
      toast.error("There was a problem deleting your journey update.", {
        description: "Error",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleJourneyCreated = () => {
    fetchJourneys(activeTab, true);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Journey Updates</h1>

      <Tabs
        defaultValue="my-updates"
        className="space-y-6"
        onValueChange={handleTabChange}
      >
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="my-updates">My Updates</TabsTrigger>
          <TabsTrigger value="discover">Discover</TabsTrigger>
        </TabsList>
        <TabsContent value="my-updates" className="space-y-6">
          <JourneyEntryForm onJourneyCreated={handleJourneyCreated} />

          <div>
            <h2 className="text-xl font-semibold mb-4">Your Journey Log</h2>

            {loading ? (
              <div className="flex justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : journeys.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">
                    No journey updates yet
                  </h3>
                  <p className="text-muted-foreground mt-2">
                    Start documenting your progress by creating your first
                    update.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {journeys.map((journey) => (
                  <JourneyCard
                    key={journey.id}
                    journey={journey}
                    // onView={() => setSelectedJourney(journey)}
                    onEdit={() => setSelectedJourney(journey)}
                    onDelete={handleDeleteJourney}
                    isCurrentUser={journey.userId === currentUser?.uid}
                  />
                ))}

                {hasMore && (
                  <Button
                    variant="outline"
                    onClick={() => fetchJourneys(activeTab)}
                    disabled={loadingMore}
                    className="w-full"
                  >
                    {loadingMore ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading more...
                      </>
                    ) : (
                      "Load More"
                    )}
                  </Button>
                )}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="discover" className="space-y-6">
          {loading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : journeys.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No updates found</p>
            </div>
          ) : (
            <div className="space-y-6">
              {journeys
                .filter((journey) => journey.userId !== currentUser?.uid)
                .map((journey) => (
                  <JourneyCard
                    key={journey.id}
                    journey={journey}
                    // onView={() => setSelectedJourney(journey)}
                    isCurrentUser={false}
                    showActions={true}
                  />
                ))}

              {hasMore &&
                journeys.some((j) => j.userId !== currentUser?.uid) && (
                  <Button
                    variant="outline"
                    onClick={() => fetchJourneys(activeTab)}
                    disabled={loadingMore}
                    className="w-full"
                  >
                    {loadingMore ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading more...
                      </>
                    ) : (
                      "Load More"
                    )}
                  </Button>
                )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {selectedJourney && (
        <JourneyDetail
          journey={selectedJourney}
          onClose={() => setSelectedJourney(null)}
          onUpdate={() => {
            fetchJourneys(activeTab, true);
            setSelectedJourney(null);
          }}
        />
      )}
    </div>
  );
}
