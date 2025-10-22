import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, BookMarked, Home } from "lucide-react";
import { QuranReader } from "@/components/QuranReader";
import { HadithBrowser } from "@/components/HadithBrowser";

type View = "home" | "quran" | "hadith";

const Index = () => {
  const [currentView, setCurrentView] = useState<View>("home");

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-arabic font-bold text-primary">Hidayah Hub</h1>
            </div>
            <nav className="flex gap-2">
              <Button
                variant={currentView === "home" ? "default" : "ghost"}
                onClick={() => setCurrentView("home")}
                className="gap-2"
              >
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">Home</span>
              </Button>
              <Button
                variant={currentView === "quran" ? "default" : "ghost"}
                onClick={() => setCurrentView("quran")}
                className="gap-2"
              >
                <BookOpen className="h-4 w-4" />
                <span className="hidden sm:inline">Qur'an</span>
              </Button>
              <Button
                variant={currentView === "hadith" ? "default" : "ghost"}
                onClick={() => setCurrentView("hadith")}
                className="gap-2"
              >
                <BookMarked className="h-4 w-4" />
                <span className="hidden sm:inline">Hadith</span>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {currentView === "home" && (
          <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
            <div className="text-center space-y-4 py-12">
              <h2 className="text-4xl md:text-5xl font-arabic font-bold text-primary">
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </h2>
              <p className="text-xl text-muted-foreground">
                Your Islamic Spiritual Companion
              </p>
              <p className="text-base text-muted-foreground max-w-2xl mx-auto">
                Access the Holy Qur'an with Arabic text, Urdu & English translations, 
                audio recitations, tafsir, and explore authentic Hadith collections 
                with complete narrator chains.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card 
                className="p-8 hover:shadow-xl transition-all duration-300 cursor-pointer group border-2 hover:border-primary"
                onClick={() => setCurrentView("quran")}
                style={{ boxShadow: "var(--shadow-elegant)" }}
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <BookOpen className="h-10 w-10 text-primary-foreground" />
                  </div>
                  <h3 className="text-2xl font-arabic font-bold text-primary">
                    القرآن الكريم
                  </h3>
                  <p className="text-lg font-semibold">The Holy Qur'an</p>
                  <p className="text-sm text-muted-foreground">
                    Read with Arabic text, Urdu & English translations, listen to recitations, and study detailed tafsir
                  </p>
                  <Button className="mt-4 w-full" variant="default">
                    Start Reading
                  </Button>
                </div>
              </Card>

              <Card 
                className="p-8 hover:shadow-xl transition-all duration-300 cursor-pointer group border-2 hover:border-primary"
                onClick={() => setCurrentView("hadith")}
                style={{ boxShadow: "var(--shadow-elegant)" }}
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <BookMarked className="h-10 w-10 text-primary-foreground" />
                  </div>
                  <h3 className="text-2xl font-arabic font-bold text-primary">
                    الحديث الشريف
                  </h3>
                  <p className="text-lg font-semibold">Authentic Hadith</p>
                  <p className="text-sm text-muted-foreground">
                    Browse Sahih collections including Bukhari, Muslim, and others with complete narrator chains
                  </p>
                  <Button className="mt-4 w-full" variant="default">
                    Browse Hadith
                  </Button>
                </div>
              </Card>
            </div>

            <Card className="p-6 bg-secondary/30 border-accent/20">
              <div className="flex items-start gap-4">
                <div className="text-4xl">📿</div>
                <div>
                  <h4 className="font-semibold text-lg mb-2">About Hidayah Hub</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Hidayah Hub provides easy access to Islamic knowledge with beautiful, 
                    reverent design. Whether you're reading daily, studying tafsir, or 
                    researching hadith authenticity, we're here to support your spiritual journey.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {currentView === "quran" && <QuranReader />}
        {currentView === "hadith" && <HadithBrowser />}
      </main>

      <footer className="border-t border-border mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>May Allah accept our efforts and guide us all. Ameen.</p>
          <p className="mt-2 font-arabic text-base">جَزَاكَ ٱللَّٰهُ خَيْرًا</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
