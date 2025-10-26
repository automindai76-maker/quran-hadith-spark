import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, BookMarked, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Hadith {
  arabicText: string;
  englishText: string;
  urduText: string;
  hadithNumber: number;
  book: string;
  section?: string;
  narrator?: string;
  grade?: string;
  reference?: string;
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
    { value: "bukhari", label: "Sahih al-Bukhari", araEdition: "ara-bukhari", engEdition: "eng-bukhari", urdEdition: "urd-bukhari" },
    { value: "muslim", label: "Sahih Muslim", araEdition: "ara-muslim", engEdition: "eng-muslim", urdEdition: "urd-muslim" },
    { value: "tirmidhi", label: "Jami' at-Tirmidhi", araEdition: "ara-tirmidhi", engEdition: "eng-tirmidhi", urdEdition: "urd-tirmidhi" },
    { value: "abudawud", label: "Sunan Abu Dawud", araEdition: "ara-abudawud", engEdition: "eng-abudawud", urdEdition: "urd-abudawud" },
    { value: "nasai", label: "Sunan an-Nasa'i", araEdition: "ara-nasai", engEdition: "eng-nasai", urdEdition: "urd-nasai" },
    { value: "ibnmajah", label: "Sunan Ibn Majah", araEdition: "ara-ibnmajah", engEdition: "eng-ibnmajah", urdEdition: "urd-ibnmajah" },
  ];

const extractNarrator = (text: string): string | undefined => {
  if (!text) return;
  const patterns = [
    /^Narrated\s+([^:：]+):/i,
    /^It was narrated (?:that )?([^:：]+):/i,
    /^Reported\s+by\s+([^:：]+):/i,
    /^From\s+([^:：]+):/i,
    /^On the authority of\s+([^:：]+):/i,
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (m) return m[1].trim();
  }
  const idx = text.indexOf(":");
  if (idx > 0 && idx < 60) return text.slice(0, idx).trim();
  return undefined;
};

const fetchHadiths = async () => {
  if (!selectedCollection) return;

  setLoading(true);
  setHadiths([]);
  setCurrentPage(1);

  try {
    const collection = collections.find((c) => c.value === selectedCollection);
    if (!collection) return;

    // Load the full editions for Arabic, English, and Urdu to ensure complete, real data
    const [araResponse, engResponse, urdResponse] = await Promise.all([
      fetch(`https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/${collection.araEdition}.json`),
      fetch(`https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/${collection.engEdition}.json`),
      fetch(`https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/${collection.urdEdition}.json`),
    ]);

    if (!araResponse.ok || !engResponse.ok || !urdResponse.ok) {
      throw new Error("Failed to load hadith editions");
    }

    const [araJson, engJson, urdJson] = await Promise.all([
      araResponse.json(),
      engResponse.json(),
      urdResponse.json(),
    ]);

    const sectionsMap: Record<string, string> = engJson?.metadata?.sections || {};

    const mapByNumber = (arr: any[] | undefined) => {
      const m = new Map<number, any>();
      (arr || []).forEach((h: any) => {
        if (typeof h?.hadithnumber === "number") m.set(h.hadithnumber, h);
      });
      return m;
    };

    const engBy = mapByNumber(engJson?.hadiths);
    const araBy = mapByNumber(araJson?.hadiths);
    const urdBy = mapByNumber(urdJson?.hadiths);

    const allNums = Array.from(new Set([...engBy.keys(), ...araBy.keys(), ...urdBy.keys()])).sort((a, b) => a - b);

    const merged: Hadith[] = allNums
      .map((num) => {
        const e = engBy.get(num);
        const a = araBy.get(num);
        const u = urdBy.get(num);
        const ref = e?.reference || a?.reference || u?.reference;
        const grades = (e?.grades || a?.grades || u?.grades || []) as any[];
        const gradeStr = grades
          .map((g: any) => g?.grade || g?.name)
          .filter(Boolean)
          .join(", ");
        const sectionTitle = ref?.book != null ? sectionsMap[String(ref.book)] : undefined;
        return {
          arabicText: a?.text || "",
          englishText: e?.text || "",
          urduText: u?.text || "",
          hadithNumber: num,
          book: collection.label,
          section: sectionTitle || "",
          narrator: e?.text ? extractNarrator(e.text) : undefined,
          grade: gradeStr || undefined,
          reference: ref ? `Book ${ref.book}, Hadith ${ref.hadith}` : undefined,
        };
      })
      .filter((h) => h.arabicText || h.englishText || h.urduText);

    if (merged.length > 0) {
      setHadiths(merged);
      toast({
        title: "Hadiths loaded successfully",
        description: `Loaded ${merged.length} hadiths from ${collection.label}`,
      });
    } else {
      toast({
        title: "No hadiths found",
        description: "Try a different collection or search term",
        variant: "destructive",
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
    fetchHadiths();
  };

const filteredHadiths = hadiths.filter((hadith) => {
    if (!searchQuery) return true;
    const q = searchQuery.trim().toLowerCase();
    const num = parseInt(q, 10);
    const isNum = !isNaN(num);
    return (
      (isNum && (String(hadith.hadithNumber).includes(q) || hadith.reference?.toLowerCase().includes(q))) ||
      hadith.englishText.toLowerCase().includes(q) ||
      hadith.arabicText.includes(searchQuery) ||
      hadith.urduText.includes(searchQuery) ||
      (hadith.narrator?.toLowerCase().includes(q) ?? false) ||
      (hadith.section?.toLowerCase().includes(q) ?? false)
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
              placeholder="Search by text, number or narrator..."
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
            <Card key={`${hadith.hadithNumber}-${index}`} className="p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="space-y-4">
                {/* Reference Header */}
                <div className="flex items-center justify-between border-b pb-2">
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold">
                      {hadith.book}
                    </p>
                    {hadith.section && (
                      <p className="text-sm font-semibold text-primary">
                        {hadith.section}
                      </p>
                    )}
                    {hadith.reference && (
                      <p className="text-xs text-muted-foreground">{hadith.reference}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                      Hadith #{hadith.hadithNumber}
                    </span>
                    {hadith.grade && (
                      <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                        {hadith.grade}
                      </span>
                    )}
                  </div>
                </div>

                {/* Arabic Text */}
                {hadith.arabicText && (
                  <div className="bg-secondary/30 p-4 rounded-lg">
                    <p className="text-xs text-muted-foreground font-semibold mb-2 flex items-center gap-1">
                      <BookMarked className="h-3 w-3" />
                      Arabic (العربية)
                    </p>
                    <p className="text-right text-xl font-arabic leading-loose text-foreground">
                      {hadith.arabicText}
                    </p>
                  </div>
                )}

                {hadith.narrator && (
                  <div className="bg-secondary/20 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground font-semibold mb-1">Narrator</p>
                    <p className="text-sm text-foreground">{hadith.narrator}</p>
                  </div>
                )}

                {/* English Translation */}
                {hadith.englishText && (
                  <div className="bg-secondary/20 p-4 rounded-lg">
                    <p className="text-xs text-muted-foreground font-semibold mb-2 flex items-center gap-1">
                      <BookMarked className="h-3 w-3" />
                      English Translation
                    </p>
                    <p className="text-base leading-relaxed text-foreground">
                      {hadith.englishText}
                    </p>
                  </div>
                )}

                {/* Urdu Translation */}
                {hadith.urduText && (
                  <div className="bg-secondary/20 p-4 rounded-lg">
                    <p className="text-xs text-muted-foreground font-semibold mb-2 flex items-center gap-1">
                      <BookMarked className="h-3 w-3" />
                      Urdu Translation (اردو)
                    </p>
                    <p className="text-right text-lg font-arabic leading-loose text-foreground">
                      {hadith.urduText}
                    </p>
                  </div>
                )}
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
