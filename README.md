# PSW Voice Documentation System

A multilingual voice-enabled documentation system for Personal Support Workers (PSWs) built with Next.js, OpenAI, and Supabase.

## Features

- 🎤 **Voice Recognition**: Multi-language speech-to-text support
- 🗣️ **AI Voice Responses**: Natural conversation flow with OpenAI TTS
- 🌍 **Multilingual Support**: English, Filipino, Spanish, Portuguese, Hindi, and Tibetan
- 📝 **AI Report Generation**: Professional healthcare documentation
- 📱 **Cross-Platform**: Works on desktop and mobile devices
- 🔒 **Secure**: Built with healthcare data privacy in mind

## Supported Languages

- English (Canadian)
- Filipino (Tagalog)
- Spanish
- Portuguese
- Hindi
- Tibetan

## Technology Stack

- **Frontend**: Next.js 13, React, Tailwind CSS
- **Backend**: Next.js API Routes
- **AI Services**: OpenAI GPT-4 Turbo, OpenAI TTS
- **Database**: Supabase
- **Voice**: Web Speech API, OpenAI Text-to-Speech

## Prerequisites

Before running this application, you need:

1. **Node.js** (version 18 or higher)
2. **OpenAI API Key** - Get one from [OpenAI Platform](https://platform.openai.com/api-keys)
3. **Supabase Project** - Create one at [Supabase](https://supabase.com)

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/psw-voice-documentation.git
cd psw-voice-documentation
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables (see above)

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Database Setup

The application uses Supabase for data storage. You'll need to create the following table:

```sql
CREATE TABLE shift_documentation (
  id SERIAL PRIMARY KEY,
  psw_name TEXT NOT NULL,
  client_name TEXT NOT NULL,
  shift_date DATE NOT NULL,
  shift_time TEXT NOT NULL,
  observations TEXT[],
  care_activities TEXT[],
  client_responses TEXT[],
  communications TEXT[],
  conversation_transcript JSONB,
  languages_used TEXT[],
  urgent_alerts TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Usage

1. **Start Documentation**: The system will greet you and ask for basic information
2. **Voice or Text**: Use voice input (if supported) or text input for responses
3. **Multilingual**: Speak in any supported language - the system will detect and respond accordingly
4. **Professional Reports**: Generate comprehensive healthcare documentation
5. **Download**: Export reports as text files for record-keeping

## Browser Compatibility

- **Best Experience**: Chrome, Firefox, Edge (desktop)
- **Mobile**: iOS Safari and Android Chrome (with text input fallback)
- **Voice Recognition**: Limited on iOS Safari (text input recommended)

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms

This application can be deployed to any platform that supports Node.js:
- Netlify
- Railway
- Heroku
- DigitalOcean App Platform

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Privacy & Security

This application is designed with healthcare data privacy in mind:
- No audio recordings are stored permanently
- Conversations are processed securely through OpenAI
- Database connections are encrypted
- Environment variables keep API keys secure

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue on GitHub or contact the development team.

## Acknowledgments

- OpenAI for GPT-4 and TTS services
- Supabase for database infrastructure
- The healthcare workers who inspired this project