import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, BookMarked, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface HadithData {
  text: string;
  reference: string;
  narrator: string;
  chain: string;
  grade: string;
}

export const HadithBrowser = () => {
  const [selectedCollection, setSelectedCollection] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [hadithData, setHadithData] = useState<HadithData | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const collections = [
    { value: "bukhari", label: "Sahih al-Bukhari" },
    { value: "muslim", label: "Sahih Muslim" },
    { value: "tirmidhi", label: "Jami' at-Tirmidhi" },
    { value: "abudawud", label: "Sunan Abu Dawud" },
    { value: "nasai", label: "Sunan an-Nasa'i" },
    { value: "ibnmajah", label: "Sunan Ibn Majah" },
  ];

  const fetchHadith = async () => {
    if (!selectedCollection) {
      toast({
        title: "Please select a collection",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("https://afshi.app.n8n.cloud/webhook-test/afshan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "hadith",
          collection: selectedCollection,
          query: searchQuery || "faith"
        }),
      });

      if (!response.ok) throw new Error("Failed to fetch hadith");

      const data = await response.json();
      setHadithData(data);
      
      toast({
        title: "Hadith loaded successfully",
        description: `From ${selectedCollection}`,
      });
    } catch (error) {
      toast({
        title: "Error loading hadith",
        description: "Please check your connection and try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6 animate-fade-in">
      <div className="space-y-4">
        <h1 className="text-3xl font-arabic font-bold text-primary flex items-center gap-2">
          <BookMarked className="h-8 w-8" />
          الحديث الشريف
        </h1>

        <div className="flex flex-col md:flex-row gap-3">
          <Select value={selectedCollection} onValueChange={setSelectedCollection}>
            <SelectTrigger className="md:w-[240px]">
              <SelectValue placeholder="Select Collection" />
            </SelectTrigger>
            <SelectContent>
              {collections.map((collection) => (
                <SelectItem key={collection.value} value={collection.value}>
                  {collection.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-2 flex-1">
            <Input
              placeholder="Search hadith by topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchHadith()}
              className="flex-1"
            />
            <Button onClick={fetchHadith} className="gap-2">
              <Search className="h-4 w-4" />
              Search
            </Button>
          </div>
        </div>
      </div>

      {loading && (
        <Card className="p-8 text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4 mx-auto"></div>
            <div className="h-4 bg-muted rounded w-5/6 mx-auto"></div>
            <div className="h-4 bg-muted rounded w-2/3 mx-auto"></div>
          </div>
        </Card>
      )}

      {hadithData && !loading && (
        <div className="space-y-4 animate-slide-in">
          <Card className="p-6 shadow-lg" style={{ boxShadow: "var(--shadow-elegant)" }}>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <BookMarked className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-accent mb-1">
                    {hadithData.reference || "Sahih al-Bukhari 1"}
                  </p>
                  <p className="text-base leading-relaxed text-foreground">
                    {hadithData.text || "The Prophet (ﷺ) said: 'Actions are judged by intentions...'"}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-secondary/50">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Narrator & Chain
            </h3>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-semibold text-muted-foreground">Narrator:</span>{" "}
                <span className="text-foreground">
                  {hadithData.narrator || "Umar ibn al-Khattab (رضي الله عنه)"}
                </span>
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                <span className="font-semibold">Chain of Transmission:</span>{" "}
                {hadithData.chain || "Yahya ibn Sa'id → Muhammad ibn Ibrahim → Alqamah ibn Waqqas → Umar ibn al-Khattab"}
              </p>
              <p className="mt-3">
                <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-primary/20 text-primary">
                  {hadithData.grade || "Sahih (Authentic)"}
                </span>
              </p>
            </div>
          </Card>
        </div>
      )}

      {!hadithData && !loading && (
        <Card className="p-12 text-center">
          <BookMarked className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg text-muted-foreground mb-2">Search for Authentic Hadith</p>
          <p className="text-sm text-muted-foreground">
            Select a collection and search by topic or keyword
          </p>
        </Card>
      )}
    </div>
  );
};
