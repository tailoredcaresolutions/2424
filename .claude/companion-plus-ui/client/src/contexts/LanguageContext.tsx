import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'pt-BR';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translations
const translations = {
  'en': {
    // Header
    'app.title': 'Companion Plus',
    'app.subtitle': 'Your caring AI friend',
    'status.connected': 'Connected',
    
    // Home Page
    'home.greeting': "Hello! I'm here to help you today. How are you feeling?",
    'home.tapMic': 'Tap the microphone to talk',
    'home.quickAccess': 'Quick Access',
    'home.todaySummary': "Today's Summary",
    'home.mood': 'Mood',
    'home.stepsToday': 'Steps Today',
    'home.sleepLastNight': 'Sleep Last Night',
    'home.viewAvatarDemo': 'View Avatar Demo',
    
    // Navigation
    'nav.chats': 'Chats',
    'nav.memories': 'Memories',
    'nav.routine': 'Routine',
    'nav.safety': 'Safety',
    'nav.health': 'Health',
    'nav.family': 'Family',
    'nav.caregiver': 'Caregiver',
    'nav.settings': 'Settings',
    
    // Health Dashboard
    'health.title': 'Health Dashboard',
    'health.cognitiveHealth': 'Cognitive Health',
    'health.score': 'Score',
    'health.excellent': 'Excellent',
    'health.vitalSigns': 'Vital Signs',
    'health.heartRate': 'Heart Rate',
    'health.bloodPressure': 'Blood Pressure',
    'health.temperature': 'Temperature',
    'health.sleepAnalysis': 'Sleep Analysis',
    'health.lastNight': 'Last Night',
    'health.deepSleep': 'Deep Sleep',
    'health.remSleep': 'REM Sleep',
    'health.lightSleep': 'Light Sleep',
    'health.activityTracking': 'Activity Tracking',
    'health.steps': 'Steps',
    'health.distance': 'Distance',
    'health.calories': 'Calories',
    'health.activeMinutes': 'Active Minutes',
    'health.medications': 'Medications',
    'health.taken': 'Taken',
    'health.pending': 'Pending',
    'health.morning': 'Morning',
    'health.afternoon': 'Afternoon',
    'health.evening': 'Evening',
    'health.night': 'Night',
    
    // Memories Page
    'memories.title': 'Memory Lane',
    'memories.subtitle': 'Cherished moments and precious memories',
    'memories.photoCollection': 'Photo Collection',
    'memories.videoMessages': 'Video Messages from Family',
    'memories.reminiscenceTherapy': 'Reminiscence Therapy Tips',
    'memories.tip1': 'Look through photos together and ask open-ended questions',
    'memories.tip2': 'Play music from their younger years',
    'memories.tip3': 'Create memory books with familiar faces and places',
    'memories.tip4': 'Use sensory items (smells, textures) to trigger memories',
    
    // Daily Routine
    'routine.title': 'Daily Routine',
    'routine.subtitle': 'Track your daily activities and stay on schedule',
    'routine.progress': 'Today\'s Progress',
    'routine.completed': 'Completed',
    'routine.morningRoutine': 'Morning Routine',
    'routine.afternoonActivities': 'Afternoon Activities',
    'routine.eveningRoutine': 'Evening Routine',
    'routine.wakeUp': 'Wake up',
    'routine.breakfast': 'Breakfast',
    'routine.morningMeds': 'Morning medications',
    'routine.morningWalk': 'Morning walk',
    'routine.lunch': 'Lunch',
    'routine.afternoonActivity': 'Afternoon activity',
    'routine.snackTime': 'Snack time',
    'routine.socialTime': 'Social time',
    'routine.dinner': 'Dinner',
    'routine.eveningMeds': 'Evening medications',
    'routine.relaxation': 'Relaxation time',
    'routine.bedtimePrep': 'Bedtime preparation',
    
    // Settings
    'settings.title': 'Settings',
    'settings.subtitle': 'Customize your experience',
    'settings.language': 'Language',
    'settings.english': 'English',
    'settings.portuguese': 'Brazilian Portuguese',
    'settings.textSize': 'Text Size',
    'settings.small': 'Small',
    'settings.medium': 'Medium',
    'settings.large': 'Large',
    'settings.extraLarge': 'Extra Large',
    'settings.voiceVolume': 'Voice Volume',
    'settings.notifications': 'Notifications',
    'settings.medicationReminders': 'Medication Reminders',
    'settings.activityReminders': 'Activity Reminders',
    'settings.familyMessages': 'Family Messages',
    'settings.accessibility': 'Accessibility',
    'settings.highContrast': 'High Contrast Mode',
    'settings.voiceGuidance': 'Voice Guidance',
    'settings.simplifiedInterface': 'Simplified Interface',
    'settings.about': 'About',
    'settings.version': 'Version',
    'settings.support': 'Support',
    'settings.privacy': 'Privacy Policy',
  },
  'pt-BR': {
    // Header
    'app.title': 'Companion Plus',
    'app.subtitle': 'Seu amigo carinhoso de IA',
    'status.connected': 'Conectado',
    
    // Home Page
    'home.greeting': 'Olá! Estou aqui para ajudá-lo hoje. Como você está se sentindo?',
    'home.tapMic': 'Toque no microfone para falar',
    'home.quickAccess': 'Acesso Rápido',
    'home.todaySummary': 'Resumo de Hoje',
    'home.mood': 'Humor',
    'home.stepsToday': 'Passos Hoje',
    'home.sleepLastNight': 'Sono da Última Noite',
    'home.viewAvatarDemo': 'Ver Demo do Avatar',
    
    // Navigation
    'nav.chats': 'Conversas',
    'nav.memories': 'Memórias',
    'nav.routine': 'Rotina',
    'nav.safety': 'Segurança',
    'nav.health': 'Saúde',
    'nav.family': 'Família',
    'nav.caregiver': 'Cuidador',
    'nav.settings': 'Configurações',
    
    // Health Dashboard
    'health.title': 'Painel de Saúde',
    'health.cognitiveHealth': 'Saúde Cognitiva',
    'health.score': 'Pontuação',
    'health.excellent': 'Excelente',
    'health.vitalSigns': 'Sinais Vitais',
    'health.heartRate': 'Frequência Cardíaca',
    'health.bloodPressure': 'Pressão Arterial',
    'health.temperature': 'Temperatura',
    'health.sleepAnalysis': 'Análise do Sono',
    'health.lastNight': 'Última Noite',
    'health.deepSleep': 'Sono Profundo',
    'health.remSleep': 'Sono REM',
    'health.lightSleep': 'Sono Leve',
    'health.activityTracking': 'Rastreamento de Atividades',
    'health.steps': 'Passos',
    'health.distance': 'Distância',
    'health.calories': 'Calorias',
    'health.activeMinutes': 'Minutos Ativos',
    'health.medications': 'Medicamentos',
    'health.taken': 'Tomado',
    'health.pending': 'Pendente',
    'health.morning': 'Manhã',
    'health.afternoon': 'Tarde',
    'health.evening': 'Noite',
    'health.night': 'Madrugada',
    
    // Memories Page
    'memories.title': 'Caminho das Memórias',
    'memories.subtitle': 'Momentos queridos e memórias preciosas',
    'memories.photoCollection': 'Coleção de Fotos',
    'memories.videoMessages': 'Mensagens de Vídeo da Família',
    'memories.reminiscenceTherapy': 'Dicas de Terapia de Reminiscência',
    'memories.tip1': 'Veja fotos juntos e faça perguntas abertas',
    'memories.tip2': 'Toque músicas dos anos mais jovens',
    'memories.tip3': 'Crie livros de memórias com rostos e lugares familiares',
    'memories.tip4': 'Use itens sensoriais (cheiros, texturas) para ativar memórias',
    
    // Daily Routine
    'routine.title': 'Rotina Diária',
    'routine.subtitle': 'Acompanhe suas atividades diárias e mantenha-se no horário',
    'routine.progress': 'Progresso de Hoje',
    'routine.completed': 'Concluído',
    'routine.morningRoutine': 'Rotina Matinal',
    'routine.afternoonActivities': 'Atividades da Tarde',
    'routine.eveningRoutine': 'Rotina Noturna',
    'routine.wakeUp': 'Acordar',
    'routine.breakfast': 'Café da manhã',
    'routine.morningMeds': 'Medicamentos da manhã',
    'routine.morningWalk': 'Caminhada matinal',
    'routine.lunch': 'Almoço',
    'routine.afternoonActivity': 'Atividade da tarde',
    'routine.snackTime': 'Hora do lanche',
    'routine.socialTime': 'Tempo social',
    'routine.dinner': 'Jantar',
    'routine.eveningMeds': 'Medicamentos da noite',
    'routine.relaxation': 'Tempo de relaxamento',
    'routine.bedtimePrep': 'Preparação para dormir',
    
    // Settings
    'settings.title': 'Configurações',
    'settings.subtitle': 'Personalize sua experiência',
    'settings.language': 'Idioma',
    'settings.english': 'Inglês',
    'settings.portuguese': 'Português Brasileiro',
    'settings.textSize': 'Tamanho do Texto',
    'settings.small': 'Pequeno',
    'settings.medium': 'Médio',
    'settings.large': 'Grande',
    'settings.extraLarge': 'Extra Grande',
    'settings.voiceVolume': 'Volume da Voz',
    'settings.notifications': 'Notificações',
    'settings.medicationReminders': 'Lembretes de Medicamentos',
    'settings.activityReminders': 'Lembretes de Atividades',
    'settings.familyMessages': 'Mensagens da Família',
    'settings.accessibility': 'Acessibilidade',
    'settings.highContrast': 'Modo de Alto Contraste',
    'settings.voiceGuidance': 'Orientação por Voz',
    'settings.simplifiedInterface': 'Interface Simplificada',
    'settings.about': 'Sobre',
    'settings.version': 'Versão',
    'settings.support': 'Suporte',
    'settings.privacy': 'Política de Privacidade',
  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
