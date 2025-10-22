import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Pause, BookOpen, Volume2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VerseData {
  arabic: string;
  urdu: string;
  english: string;
  tafsir: string;
  audio?: string;
}

export const QuranReader = () => {
  const [selectedSurah, setSelectedSurah] = useState<string>("");
  const [verseData, setVerseData] = useState<VerseData | null>(null);
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const { toast } = useToast();

  const surahs = [
    { value: "1", label: "1. Al-Fatiha (The Opening)" },
    { value: "2", label: "2. Al-Baqarah (The Cow)" },
    { value: "3", label: "3. Ali 'Imran (Family of Imran)" },
    { value: "36", label: "36. Ya-Sin" },
    { value: "55", label: "55. Ar-Rahman (The Beneficent)" },
    { value: "67", label: "67. Al-Mulk (The Sovereignty)" },
    { value: "112", label: "112. Al-Ikhlas (The Sincerity)" },
  ];

  const fetchVerse = async (surahNumber: string) => {
    setLoading(true);
    try {
      const response = await fetch("https://afshi.app.n8n.cloud/webhook-test/afshan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "quran",
          surah: surahNumber,
          verse: "1"
        }),
      });

      if (!response.ok) throw new Error("Failed to fetch verse");

      const data = await response.json();
      setVerseData(data);
      
      toast({
        title: "Verse loaded successfully",
        description: `Surah ${surahNumber} retrieved`,
      });
    } catch (error) {
      toast({
        title: "Error loading verse",
        description: "Please check your connection and try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSurahChange = (value: string) => {
    setSelectedSurah(value);
    fetchVerse(value);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-arabic font-bold text-primary flex items-center gap-2">
          <BookOpen className="h-8 w-8" />
          القرآن الكريم
        </h1>
        <Select value={selectedSurah} onValueChange={handleSurahChange}>
          <SelectTrigger className="w-[280px]">
            <SelectValue placeholder="Select a Surah" />
          </SelectTrigger>
          <SelectContent>
            {surahs.map((surah) => (
              <SelectItem key={surah.value} value={surah.value}>
                {surah.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading && (
        <Card className="p-8 text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4 mx-auto"></div>
            <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
          </div>
        </Card>
      )}

      {verseData && !loading && (
        <div className="space-y-6 animate-slide-in">
          <Card className="p-6 shadow-lg" style={{ boxShadow: "var(--shadow-elegant)" }}>
            <div className="space-y-6">
              <div className="text-right">
                <p className="text-4xl font-arabic leading-loose text-foreground">
                  {verseData.arabic || "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ"}
                </p>
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="gap-2"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="h-4 w-4" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Play Audio
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-secondary/50">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <Volume2 className="h-5 w-5 text-primary" />
              Translations
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1 font-semibold">Urdu</p>
                <p className="text-base text-foreground font-arabic text-right leading-relaxed">
                  {verseData.urdu || "شروع اللہ کے نام سے جو بڑا مہربان نہایت رحم والا ہے"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1 font-semibold">English</p>
                <p className="text-base text-foreground leading-relaxed">
                  {verseData.english || "In the name of Allah, the Entirely Merciful, the Especially Merciful."}
                </p>
              </div>
            </div>
          </Card>

          {verseData.tafsir && (
            <Card className="p-6 bg-card">
              <h3 className="font-semibold text-lg mb-3 text-accent">Tafsir (Commentary)</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {verseData.tafsir}
              </p>
            </Card>
          )}
        </div>
      )}

      {!verseData && !loading && (
        <Card className="p-12 text-center">
          <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg text-muted-foreground">Select a Surah to begin reading</p>
        </Card>
      )}
    </div>
  );
};
