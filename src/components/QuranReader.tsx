import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Pause, BookOpen, Volume2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Verse {
  number: number;
  arabic: string;
  urdu: string;
  english: string;
}

interface VerseData {
  verses: Verse[];
  tafsir: string;
  surahInfo: {
    name: string;
    englishName: string;
    englishNameTranslation: string;
    numberOfAyahs: number;
    revelationType: string;
  };
}

export const QuranReader = () => {
  const [selectedSurah, setSelectedSurah] = useState<string>("");
  const [selectedJuz, setSelectedJuz] = useState<string>("");
  const [verseData, setVerseData] = useState<VerseData | null>(null);
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [currentAyahPlaying, setCurrentAyahPlaying] = useState<number>(0);
  const [audioUrls, setAudioUrls] = useState<string[]>([]);
  const { toast } = useToast();

  const surahs = [
    { value: "1", label: "1. Al-Fatiha", juz: 1 }, { value: "2", label: "2. Al-Baqarah", juz: 1 },
    { value: "3", label: "3. Ali 'Imran", juz: 3 }, { value: "4", label: "4. An-Nisa", juz: 4 },
    { value: "5", label: "5. Al-Ma'idah", juz: 6 }, { value: "6", label: "6. Al-An'am", juz: 7 },
    { value: "7", label: "7. Al-A'raf", juz: 8 }, { value: "8", label: "8. Al-Anfal", juz: 9 },
    { value: "9", label: "9. At-Tawbah", juz: 10 }, { value: "10", label: "10. Yunus", juz: 11 },
    { value: "11", label: "11. Hud", juz: 11 }, { value: "12", label: "12. Yusuf", juz: 12 },
    { value: "13", label: "13. Ar-Ra'd", juz: 13 }, { value: "14", label: "14. Ibrahim", juz: 13 },
    { value: "15", label: "15. Al-Hijr", juz: 14 }, { value: "16", label: "16. An-Nahl", juz: 14 },
    { value: "17", label: "17. Al-Isra", juz: 15 }, { value: "18", label: "18. Al-Kahf", juz: 15 },
    { value: "19", label: "19. Maryam", juz: 16 }, { value: "20", label: "20. Ta-Ha", juz: 16 },
    { value: "21", label: "21. Al-Anbya", juz: 17 }, { value: "22", label: "22. Al-Hajj", juz: 17 },
    { value: "23", label: "23. Al-Mu'minun", juz: 18 }, { value: "24", label: "24. An-Nur", juz: 18 },
    { value: "25", label: "25. Al-Furqan", juz: 18 }, { value: "26", label: "26. Ash-Shu'ara", juz: 19 },
    { value: "27", label: "27. An-Naml", juz: 19 }, { value: "28", label: "28. Al-Qasas", juz: 20 },
    { value: "29", label: "29. Al-'Ankabut", juz: 20 }, { value: "30", label: "30. Ar-Rum", juz: 21 },
    { value: "31", label: "31. Luqman", juz: 21 }, { value: "32", label: "32. As-Sajdah", juz: 21 },
    { value: "33", label: "33. Al-Ahzab", juz: 21 }, { value: "34", label: "34. Saba", juz: 22 },
    { value: "35", label: "35. Fatir", juz: 22 }, { value: "36", label: "36. Ya-Sin", juz: 22 },
    { value: "37", label: "37. As-Saffat", juz: 23 }, { value: "38", label: "38. Sad", juz: 23 },
    { value: "39", label: "39. Az-Zumar", juz: 23 }, { value: "40", label: "40. Ghafir", juz: 24 },
    { value: "41", label: "41. Fussilat", juz: 24 }, { value: "42", label: "42. Ash-Shuraa", juz: 25 },
    { value: "43", label: "43. Az-Zukhruf", juz: 25 }, { value: "44", label: "44. Ad-Dukhan", juz: 25 },
    { value: "45", label: "45. Al-Jathiyah", juz: 25 }, { value: "46", label: "46. Al-Ahqaf", juz: 26 },
    { value: "47", label: "47. Muhammad", juz: 26 }, { value: "48", label: "48. Al-Fath", juz: 26 },
    { value: "49", label: "49. Al-Hujurat", juz: 26 }, { value: "50", label: "50. Qaf", juz: 26 },
    { value: "51", label: "51. Adh-Dhariyat", juz: 27 }, { value: "52", label: "52. At-Tur", juz: 27 },
    { value: "53", label: "53. An-Najm", juz: 27 }, { value: "54", label: "54. Al-Qamar", juz: 27 },
    { value: "55", label: "55. Ar-Rahman", juz: 27 }, { value: "56", label: "56. Al-Waqi'ah", juz: 27 },
    { value: "57", label: "57. Al-Hadid", juz: 27 }, { value: "58", label: "58. Al-Mujadila", juz: 28 },
    { value: "59", label: "59. Al-Hashr", juz: 28 }, { value: "60", label: "60. Al-Mumtahanah", juz: 28 },
    { value: "61", label: "61. As-Saf", juz: 28 }, { value: "62", label: "62. Al-Jumu'ah", juz: 28 },
    { value: "63", label: "63. Al-Munafiqun", juz: 28 }, { value: "64", label: "64. At-Taghabun", juz: 28 },
    { value: "65", label: "65. At-Talaq", juz: 28 }, { value: "66", label: "66. At-Tahrim", juz: 28 },
    { value: "67", label: "67. Al-Mulk", juz: 29 }, { value: "68", label: "68. Al-Qalam", juz: 29 },
    { value: "69", label: "69. Al-Haqqah", juz: 29 }, { value: "70", label: "70. Al-Ma'arij", juz: 29 },
    { value: "71", label: "71. Nuh", juz: 29 }, { value: "72", label: "72. Al-Jinn", juz: 29 },
    { value: "73", label: "73. Al-Muzzammil", juz: 29 }, { value: "74", label: "74. Al-Muddaththir", juz: 29 },
    { value: "75", label: "75. Al-Qiyamah", juz: 29 }, { value: "76", label: "76. Al-Insan", juz: 29 },
    { value: "77", label: "77. Al-Mursalat", juz: 29 }, { value: "78", label: "78. An-Naba", juz: 30 },
    { value: "79", label: "79. An-Nazi'at", juz: 30 }, { value: "80", label: "80. 'Abasa", juz: 30 },
    { value: "81", label: "81. At-Takwir", juz: 30 }, { value: "82", label: "82. Al-Infitar", juz: 30 },
    { value: "83", label: "83. Al-Mutaffifin", juz: 30 }, { value: "84", label: "84. Al-Inshiqaq", juz: 30 },
    { value: "85", label: "85. Al-Buruj", juz: 30 }, { value: "86", label: "86. At-Tariq", juz: 30 },
    { value: "87", label: "87. Al-A'la", juz: 30 }, { value: "88", label: "88. Al-Ghashiyah", juz: 30 },
    { value: "89", label: "89. Al-Fajr", juz: 30 }, { value: "90", label: "90. Al-Balad", juz: 30 },
    { value: "91", label: "91. Ash-Shams", juz: 30 }, { value: "92", label: "92. Al-Layl", juz: 30 },
    { value: "93", label: "93. Ad-Duhaa", juz: 30 }, { value: "94", label: "94. Ash-Sharh", juz: 30 },
    { value: "95", label: "95. At-Tin", juz: 30 }, { value: "96", label: "96. Al-'Alaq", juz: 30 },
    { value: "97", label: "97. Al-Qadr", juz: 30 }, { value: "98", label: "98. Al-Bayyinah", juz: 30 },
    { value: "99", label: "99. Az-Zalzalah", juz: 30 }, { value: "100", label: "100. Al-'Adiyat", juz: 30 },
    { value: "101", label: "101. Al-Qari'ah", juz: 30 }, { value: "102", label: "102. At-Takathur", juz: 30 },
    { value: "103", label: "103. Al-'Asr", juz: 30 }, { value: "104", label: "104. Al-Humazah", juz: 30 },
    { value: "105", label: "105. Al-Fil", juz: 30 }, { value: "106", label: "106. Quraysh", juz: 30 },
    { value: "107", label: "107. Al-Ma'un", juz: 30 }, { value: "108", label: "108. Al-Kawthar", juz: 30 },
    { value: "109", label: "109. Al-Kafirun", juz: 30 }, { value: "110", label: "110. An-Nasr", juz: 30 },
    { value: "111", label: "111. Al-Masad", juz: 30 }, { value: "112", label: "112. Al-Ikhlas", juz: 30 },
    { value: "113", label: "113. Al-Falaq", juz: 30 }, { value: "114", label: "114. An-Nas", juz: 30 },
  ];

  const juzList = Array.from({ length: 30 }, (_, i) => ({
    value: String(i + 1),
    label: `Juz ${i + 1}`,
  }));

  const fetchVerse = async (surahNumber: string) => {
    setLoading(true);
    try {
      // Fetch Arabic text
      const arabicResponse = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}`);
      const arabicData = await arabicResponse.json();
      
      // Fetch English translation
      const englishResponse = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/en.asad`);
      const englishData = await englishResponse.json();
      
      // Fetch Urdu translation
      const urduResponse = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/ur.ahmedali`);
      const urduData = await urduResponse.json();
      
      // Fetch audio
      const audioResponse = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/ar.alafasy`);
      const audioData = await audioResponse.json();

      if (!arabicData.data || !englishData.data || !urduData.data) {
        throw new Error("Failed to fetch complete verse data");
      }

      // Combine all verses
      const verses = arabicData.data.ayahs.map((ayah: any, index: number) => ({
        number: ayah.numberInSurah,
        arabic: ayah.text,
        english: englishData.data.ayahs[index]?.text || "",
        urdu: urduData.data.ayahs[index]?.text || "",
      }));

      // Extract all audio URLs
      const audios = audioData.data.ayahs.map((ayah: any) => ayah.audio).filter(Boolean);
      setAudioUrls(audios);

      setVerseData({
        verses,
        tafsir: `Surah ${arabicData.data.englishName} (${arabicData.data.name}) - ${arabicData.data.englishNameTranslation}. This Surah contains ${arabicData.data.numberOfAyahs} verses and was revealed in ${arabicData.data.revelationType}.`,
        surahInfo: {
          name: arabicData.data.name,
          englishName: arabicData.data.englishName,
          englishNameTranslation: arabicData.data.englishNameTranslation,
          numberOfAyahs: arabicData.data.numberOfAyahs,
          revelationType: arabicData.data.revelationType,
        },
      });
      
      toast({
        title: "Surah loaded successfully",
        description: `${arabicData.data.englishName} - ${arabicData.data.numberOfAyahs} verses`,
      });
    } catch (error) {
      console.error("Error fetching Quran data:", error);
      toast({
        title: "Error loading Surah",
        description: "Please check your connection and try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSurahChange = (value: string) => {
    setSelectedSurah(value);
    setSelectedJuz("");
    fetchVerse(value);
  };

  const handleJuzChange = (value: string) => {
    setSelectedJuz(value);
    setSelectedSurah("");
    const firstSurahInJuz = surahs.find(s => s.juz === parseInt(value));
    if (firstSurahInJuz) {
      fetchVerse(firstSurahInJuz.value);
    }
  };

  const playNextAyah = (index: number) => {
    if (index >= audioUrls.length) {
      setIsPlaying(false);
      setCurrentAyahPlaying(0);
      return;
    }

    const audio = new Audio(audioUrls[index]);
    setAudioElement(audio);
    setCurrentAyahPlaying(index);

    audio.onended = () => {
      playNextAyah(index + 1);
    };

    audio.onerror = () => {
      toast({
        title: "Audio error",
        description: `Failed to load audio for ayah ${index + 1}`,
        variant: "destructive",
      });
      playNextAyah(index + 1);
    };

    audio.play();
  };

  const toggleAudio = () => {
    if (audioUrls.length === 0) {
      toast({
        title: "Audio not available",
        description: "This Surah does not have audio",
        variant: "destructive",
      });
      return;
    }

    if (audioElement && isPlaying) {
      audioElement.pause();
      setIsPlaying(false);
      setAudioElement(null);
    } else {
      setIsPlaying(true);
      playNextAyah(currentAyahPlaying);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6 animate-fade-in">
      <div className="space-y-4">
        <h1 className="text-3xl font-arabic font-bold text-primary flex items-center gap-2">
          <BookOpen className="h-8 w-8" />
          القرآن الكريم
        </h1>
        <div className="flex flex-col md:flex-row gap-3">
          <Select value={selectedJuz} onValueChange={handleJuzChange}>
            <SelectTrigger className="md:w-[200px]">
              <SelectValue placeholder="Select Juz/Para" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {juzList.map((juz) => (
                <SelectItem key={juz.value} value={juz.value}>
                  {juz.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedSurah} onValueChange={handleSurahChange}>
            <SelectTrigger className="md:w-[280px]">
              <SelectValue placeholder="Select a Surah" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {surahs.map((surah) => (
                <SelectItem key={surah.value} value={surah.value}>
                  {surah.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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
            <div className="space-y-4">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-primary mb-2">
                  {verseData.surahInfo.englishName}
                </h2>
                <p className="text-lg font-arabic text-foreground mb-1">
                  {verseData.surahInfo.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {verseData.surahInfo.englishNameTranslation} • {verseData.surahInfo.numberOfAyahs} Verses • {verseData.surahInfo.revelationType}
                </p>
              </div>

              <div className="flex gap-2 justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleAudio}
                  className="gap-2"
                  disabled={audioUrls.length === 0}
                >
                  {isPlaying ? (
                    <>
                      <Pause className="h-4 w-4" />
                      Pause Recitation
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Play Complete Surah
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>

          <div className="space-y-4">
            {verseData.verses.map((verse) => (
              <Card 
                key={verse.number} 
                className={`p-6 transition-all ${
                  isPlaying && currentAyahPlaying === verse.number - 1 
                    ? 'ring-2 ring-primary shadow-lg' 
                    : ''
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-semibold">
                        {verse.number}
                      </div>
                      <span className="text-xs text-muted-foreground">Ayah {verse.number}</span>
                    </div>
                    {isPlaying && currentAyahPlaying === verse.number - 1 && (
                      <Volume2 className="h-5 w-5 text-primary animate-pulse" />
                    )}
                  </div>

                  <div className="text-right mb-4">
                    <p className="text-3xl font-arabic leading-loose text-foreground">
                      {verse.arabic}
                    </p>
                  </div>

                  <div className="space-y-3 border-t pt-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1 font-semibold">Urdu Translation</p>
                      <p className="text-base text-foreground font-arabic text-right leading-relaxed">
                        {verse.urdu}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1 font-semibold">English Translation</p>
                      <p className="text-base text-foreground leading-relaxed">
                        {verse.english}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

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
