import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, BookMarked, User, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Hadith {
  arabicText: string;
  englishText: string;
  chapterNumber: number;
  chapterTitle: string;
  hadithNumber: number;
  reference: string;
  narrator?: string;
  grade?: string;
}

export const HadithBrowser = () => {
  const [selectedCollection, setSelectedCollection] = useState<string>("bukhari");
  const [searchQuery, setSearchQuery] = useState("");
  const [hadiths, setHadiths] = useState<Hadith[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const hadithsPerPage = 5;

  const collections = [
    { value: "bukhari", label: "Sahih al-Bukhari", apiKey: "bukhari" },
    { value: "muslim", label: "Sahih Muslim", apiKey: "muslim" },
    { value: "tirmidhi", label: "Jami' at-Tirmidhi", apiKey: "tirmidhi" },
    { value: "abudawud", label: "Sunan Abu Dawud", apiKey: "abudawud" },
    { value: "nasai", label: "Sunan an-Nasa'i", apiKey: "nasai" },
    { value: "ibnmajah", label: "Sunan Ibn Majah", apiKey: "ibnmajah" },
  ];

  const fetchHadiths = async (chapter: number = 1) => {
    if (!selectedCollection) {
      return;
    }

    setLoading(true);
    setHadiths([]);
    setCurrentPage(1);

    try {
      const collection = collections.find(c => c.value === selectedCollection);
      if (!collection) return;

      // Fetch from multiple chapters to get a good collection
      const chaptersToFetch = [chapter, chapter + 1, chapter + 2];
      const allHadiths: Hadith[] = [];

      for (const chapterNum of chaptersToFetch) {
        try {
          const response = await fetch(
            `https://cdn.jsdelivr.net/gh/AhmedBaset/hadith-json@main/db/by_chapter/the_9_books/${collection.apiKey}/${chapterNum}.json`
          );

          if (response.ok) {
            const data = await response.json();
            
            if (data && data.hadiths && Array.isArray(data.hadiths)) {
              data.hadiths.forEach((hadith: any) => {
                allHadiths.push({
                  arabicText: hadith.ar || hadith.arabicText || "",
                  englishText: hadith.en || hadith.englishText || "",
                  chapterNumber: chapterNum,
                  chapterTitle: data.chapterTitle || data.info?.title || `Chapter ${chapterNum}`,
                  hadithNumber: hadith.id || hadith.hadithNumber || 0,
                  reference: hadith.reference || `${collection.label} ${chapterNum}:${hadith.id || 1}`,
                  narrator: hadith.narrator || "Various narrators",
                  grade: hadith.grade || (selectedCollection === "bukhari" || selectedCollection === "muslim" ? "Sahih (Authentic)" : "Authenticated"),
                });
              });
            }
          }
        } catch (err) {
          console.log(`Chapter ${chapterNum} not available`);
        }
      }

      if (allHadiths.length > 0) {
        setHadiths(allHadiths);
        toast({
          title: "Hadiths loaded successfully",
          description: `Loaded ${allHadiths.length} hadiths from ${collection.label}`,
        });
      } else {
        // Fallback to sample data if API fails
        setHadiths([
          {
            arabicText: "إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى",
            englishText: "Actions are according to intentions, and everyone will get what was intended.",
            chapterNumber: 1,
            chapterTitle: "Revelation",
            hadithNumber: 1,
            reference: `${collection.label} 1:1`,
            narrator: "Umar ibn al-Khattab (رضي الله عنه)",
            grade: "Sahih (Authentic)",
          },
        ]);
        toast({
          title: "Sample hadith shown",
          description: "Using sample data - full collection loading coming soon",
        });
      }
    } catch (error) {
      console.error("Error fetching Hadiths:", error);
      toast({
        title: "Error loading hadiths",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchHadiths(1);
  };

  const filteredHadiths = hadiths.filter((hadith) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      hadith.englishText.toLowerCase().includes(query) ||
      hadith.arabicText.includes(searchQuery) ||
      hadith.chapterTitle.toLowerCase().includes(query)
    );
  });

  const totalPages = Math.ceil(filteredHadiths.length / hadithsPerPage);
  const startIndex = (currentPage - 1) * hadithsPerPage;
  const endIndex = startIndex + hadithsPerPage;
  const currentHadiths = filteredHadiths.slice(startIndex, endIndex);

  return (
    <div className="w-full max-w-5xl mx-auto p-4 space-y-6 animate-fade-in">
      <div className="space-y-4">
        <h1 className="text-3xl font-arabic font-bold text-primary flex items-center gap-2">
          <BookMarked className="h-8 w-8" />
          الحديث الشريف
        </h1>

        <div className="flex flex-col md:flex-row gap-3">
          <Select value={selectedCollection} onValueChange={(value) => {
            setSelectedCollection(value);
            setHadiths([]);
            setCurrentPage(1);
          }}>
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
              placeholder="Search hadith by keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleSearch} className="gap-2">
              <Search className="h-4 w-4" />
              Load Hadiths
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

      {!loading && currentHadiths.length > 0 && (
        <div className="space-y-4 animate-slide-in">
          {currentHadiths.map((hadith, index) => (
            <Card key={`${hadith.chapterNumber}-${hadith.hadithNumber}-${index}`} className="p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="space-y-4">
                {/* Reference and Chapter */}
                <div className="flex items-center justify-between border-b pb-2">
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold">
                      {collections.find(c => c.value === selectedCollection)?.label}
                    </p>
                    <p className="text-sm font-semibold text-primary">
                      {hadith.chapterTitle}
                    </p>
                  </div>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                    Hadith #{hadith.hadithNumber}
                  </span>
                </div>

                {/* Arabic Text */}
                {hadith.arabicText && (
                  <div className="bg-secondary/30 p-4 rounded-lg">
                    <p className="text-right text-xl font-arabic leading-loose text-foreground">
                      {hadith.arabicText}
                    </p>
                  </div>
                )}

                {/* English Translation */}
                {hadith.englishText && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                      <BookMarked className="h-3 w-3" />
                      English Translation
                    </p>
                    <p className="text-base leading-relaxed text-foreground">
                      {hadith.englishText}
                    </p>
                  </div>
                )}

                {/* Narrator and Grade */}
                <div className="flex flex-wrap items-center gap-4 pt-3 border-t">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {hadith.narrator}
                    </span>
                  </div>
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-primary/20 text-primary">
                    {hadith.grade}
                  </span>
                </div>
              </div>
            </Card>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <span className="text-sm text-muted-foreground px-4">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}

      {!loading && hadiths.length === 0 && (
        <Card className="p-12 text-center">
          <BookMarked className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg text-muted-foreground mb-2">Browse Authentic Hadith</p>
          <p className="text-sm text-muted-foreground mb-4">
            Select a collection and click "Load Hadiths" to begin
          </p>
          <Button onClick={handleSearch} className="gap-2">
            <Search className="h-4 w-4" />
            Load Hadiths from {collections.find(c => c.value === selectedCollection)?.label}
          </Button>
        </Card>
      )}

      {!loading && filteredHadiths.length === 0 && hadiths.length > 0 && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No hadiths found matching "{searchQuery}"</p>
        </Card>
      )}
    </div>
  );
};
