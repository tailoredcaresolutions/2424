import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'pt-BR' : 'en');
  };

  return (
    <Button
      onClick={toggleLanguage}
      variant="ghost"
      size="sm"
      className="flex items-center gap-2 text-sm font-medium text-gold hover:text-gold/80 hover:bg-gold/10"
      title={language === 'en' ? 'Switch to Portuguese' : 'Mudar para Inglês'}
    >
      {language === 'en' ? (
        <>
          <span className="text-2xl">🇧🇷</span>
          <span className="hidden sm:inline">PT</span>
        </>
      ) : (
        <>
          <span className="text-2xl">🇺🇸</span>
          <span className="hidden sm:inline">EN</span>
        </>
      )}
    </Button>
  );
}
