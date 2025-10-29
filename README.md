# PSW Voice Documentation System

> **PHIPA-Compliant Healthcare Documentation Platform for Ontario, Canada**
> **100% Local AI Processing - All Patient Data Stays in Ontario**

A secure, enterprise-grade voice-enabled documentation system for Personal Support Workers (PSWs) in Ontario, Canada. Features conversational AI, multi-language support, and **PHIPA compliance** (Personal Health Information Protection Act, 2004) with all AI processing and data storage running locally on your Mac in Ontario.

---

## 🎯 Key Features

- ✅ **Voice & Text Documentation** - Natural conversation with AI assistant
- ✅ **100% Local AI** - Ollama (LLaMA 3.3 70B), Whisper.cpp, Coqui XTTS
- ✅ **Multi-Language Support** - English, Filipino, Spanish, Portuguese, Hindi, Tibetan
- ✅ **Encrypted Database** - SQLCipher AES-256-CBC encryption
- ✅ **Multi-Factor Authentication** - TOTP with backup codes
- ✅ **WCAG 2.1 AA Accessible** - Full keyboard navigation, screen reader support
- ✅ **Real-time Health Monitoring** - System and AI service monitoring
- ✅ **Hybrid Deployment** - Frontend on Vercel, backend on your Mac

---

## 🏗️ Architecture

```
Frontend (Vercel)          Cloudflare Tunnel          Backend (Your Mac)
┌─────────────────┐              │                 ┌──────────────────┐
│  Next.js 16     │ ─── HTTPS ───┤───── HTTPS ──── │  Express Server  │
│  React 19       │              │                 │  SQLCipher DB    │
│  Tailwind 4     │              │                 │  Ollama AI       │
└─────────────────┘              │                 │  Whisper.cpp     │
                                 │                 │  Coqui XTTS      │
                                 │                 └──────────────────┘
```

**Why Hybrid Architecture?**
- **PHIPA Compliance:** All PHI stays in Ontario (your Mac) - never crosses Canadian border
- **Data Sovereignty:** Patient data never leaves your physical location
- **Privacy:** 100% local AI processing (no cloud AI services)
- **Cost:** $0/month (Vercel + Cloudflare free tiers + local compute)
- **Performance:** Vercel CDN for fast frontend, M3 Ultra for AI speed
- **Security:** End-to-end encryption, no exposed ports
- **Flexibility:** Update frontend/backend independently

---

## 🚀 Quick Start

### Prerequisites

- **macOS** with M-series chip (M1/M2/M3)
- **Node.js** 22.21.0+
- **Homebrew** (for package management)
- **GitHub** account (free)
- **Vercel** account (free)

### 1. Install Local AI Services

```bash
# Install Ollama
brew install ollama
ollama serve &
ollama pull llama3.3:70b

# Install Cloudflare Tunnel
brew install cloudflare/cloudflare/cloudflared
```

See [docs/LOCAL_AI_MODELS_SETUP.md](docs/LOCAL_AI_MODELS_SETUP.md) for Whisper.cpp and XTTS setup.

### 2. Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
nano .env  # Edit DATABASE_ENCRYPTION_KEY and other settings

# Start backend
npm start
```

**Backend runs on:** http://localhost:4000

### 3. Start Cloudflare Tunnel

```bash
# Quick tunnel (URL changes each time)
cloudflared tunnel --url http://localhost:4000

# Save the URL: https://random-name.trycloudflare.com
```

**For permanent URL:** See [docs/CLOUDFLARE_TUNNEL_SETUP.md](docs/CLOUDFLARE_TUNNEL_SETUP.md)

### 4. Deploy Frontend to Vercel

1. Push code to GitHub (see [docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md))
2. Import repository to Vercel
3. Add environment variables:
   ```
   NEXT_PUBLIC_BACKEND_URL=https://your-tunnel-url.trycloudflare.com
   NEXTAUTH_SECRET=your-secret-here
   ```
4. Deploy!

**Your app will be live at:** https://your-app.vercel.app

---

## 📁 Project Structure

```
/
├── app/                          # Next.js 16 App Router
│   ├── (auth)/                   # Auth pages
│   ├── admin/                    # Admin dashboard
│   ├── analytics/                # Analytics
│   ├── profile/                  # User profile
│   ├── reports/                  # Reports listing
│   ├── review/                   # Report review
│   ├── search/                   # Search interface
│   ├── session/                  # Voice documentation
│   ├── settings/                 # User settings
│   └── layout.tsx                # Root layout
│
├── backend/                      # Express.js Backend (Local)
│   ├── routes/                   # API routes
│   │   ├── auth.js               # MFA authentication
│   │   ├── ai.js                 # AI features
│   │   ├── search.js             # Advanced search
│   │   ├── backup.js             # Database backup
│   │   └── health.js             # Health checks
│   ├── lib/                      # Shared libraries (copied)
│   ├── server.js                 # Express server
│   ├── package.json              # Backend dependencies
│   └── .env.example              # Backend config template
│
├── components/                   # React Components
│   ├── PSWVoiceReporter.js       # Main voice UI (1934 lines)
│   ├── GoldOrb3D.js              # 3D avatar animation
│   └── Navigation.tsx            # Navigation component
│
├── lib/                          # Frontend Libraries
│   ├── ai/                       # AI adapters
│   ├── database/                 # Database layer
│   ├── security/                 # MFA service
│   ├── monitoring/               # Health monitoring
│   ├── api-client.ts             # API client helper
│   └── logger.ts                 # Logging service
│
├── data/                         # SQLite Database (Local)
│   └── local_psw_data.db         # Encrypted database
│
├── docs/                         # Documentation
│   ├── DEPLOYMENT_GUIDE.md       # Full deployment guide
│   ├── CLOUDFLARE_TUNNEL_SETUP.md # Tunnel setup
│   ├── LOCAL_AI_MODELS_SETUP.md  # AI setup
│   └── ...                       # 28 total docs
│
├── scripts/                      # Utility Scripts
│   ├── start-all-services.sh     # Start everything
│   ├── start-backend.sh          # Start backend only
│   ├── start-tunnel.sh           # Start tunnel only
│   └── stop-all-services.sh      # Stop everything
│
├── .env.example.frontend         # Frontend environment template
├── vercel.json                   # Vercel configuration
├── .vercelignore                 # Files to exclude from Vercel
└── package.json                  # Frontend dependencies
```

---

## 🛠️ Development

### Start Everything

```bash
# One command to start all services
./scripts/start-all-services.sh
```

This starts:
1. Ollama (localhost:11434)
2. Backend Server (localhost:4000)
3. Cloudflare Tunnel

### Start Services Individually

```bash
# Backend only
./scripts/start-backend.sh

# Tunnel only
./scripts/start-tunnel.sh

# Frontend (development)
npm run dev
```

### Stop Everything

```bash
./scripts/stop-all-services.sh
```

---

## 🔒 Security

### Authentication
- **NextAuth.js v5** - Credentials provider with JWT sessions
- **Multi-Factor Authentication** - TOTP (Google Authenticator, Authy)
- **Backup Codes** - 10 single-use recovery codes
- **Password Hashing** - bcrypt/Argon2id

### Data Protection
- **SQLCipher Encryption** - AES-256-CBC at rest
- **PBKDF2 Key Derivation** - 256,000 iterations (HIPAA 2025)
- **Audit Logging** - All data access tracked
- **Secure Tunnel** - Cloudflare encrypted connection

### Ontario Healthcare Compliance
- ✅ **PHIPA (Ontario)** - Personal Health Information Protection Act, 2004
  - All PHI stored in Ontario only (your Mac)
  - No cross-border data transfer without consent
  - Encryption at rest and in transit
  - Audit trails for all data access
  - 100% local AI (no cloud processing)
- ✅ **WCAG 2.1 AA** - Accessibility standards for Ontario healthcare

---

## 📊 Monitoring

### Health Checks

```bash
# Backend health
curl http://localhost:4000/health

# From Vercel frontend
curl https://your-tunnel-url.trycloudflare.com/health
```

### Logs

```bash
# Backend logs
tail -f /tmp/psw-backend.log

# Tunnel logs
tail -f /tmp/cloudflared.log

# Ollama logs
tail -f /tmp/ollama.log
```

### Dashboard

Access monitoring dashboard:
- **Local:** http://localhost:4000/api/monitoring/dashboard
- **Production:** https://your-tunnel-url.trycloudflare.com/api/monitoring/dashboard

---

## 🧪 Testing

### Unit Tests

```bash
npm run test              # Run tests
npm run test:ui           # Test UI
npm run test:coverage     # Coverage report
```

### E2E Tests

```bash
npm run test:e2e          # Playwright tests
npm run test:e2e:ui       # Interactive mode
```

### Manual Testing

See [docs/LOCAL_SETUP.md](docs/LOCAL_SETUP.md) for testing scenarios

---

## 📚 Documentation

### Essential Guides
- **[PHIPA_COMPLIANCE_ONTARIO.md](docs/PHIPA_COMPLIANCE_ONTARIO.md)** - ⭐ Ontario healthcare compliance guide
- **[DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md)** - Complete deployment walkthrough
- **[CLOUDFLARE_TUNNEL_SETUP.md](docs/CLOUDFLARE_TUNNEL_SETUP.md)** - Tunnel configuration + PHIPA notes
- **[LOCAL_SETUP.md](docs/LOCAL_SETUP.md)** - 5-minute quick start
- **[LOCAL_AI_MODELS_SETUP.md](docs/LOCAL_AI_MODELS_SETUP.md)** - AI service setup

### Architecture Docs
- **[PHASE1_COMPLETION_REPORT.md](docs/PHASE1_COMPLETION_REPORT.md)** - Phase 1 review (819 lines)
- **[AI_MODELS_PSW_FOCUSED_OCT_2025.md](docs/AI_MODELS_PSW_FOCUSED_OCT_2025.md)** - AI model analysis
- **[COMPREHENSIVE_SYSTEM_AUDIT_PLAN.md](docs/COMPREHENSIVE_SYSTEM_AUDIT_PLAN.md)** - System audit

### Testing & QA
- **[ACCESSIBILITY_AUDIT_CHECKLIST.md](docs/ACCESSIBILITY_AUDIT_CHECKLIST.md)** - 100+ test cases
- **[CROSS_BROWSER_TESTING_GUIDE.md](docs/CROSS_BROWSER_TESTING_GUIDE.md)** - 6 browsers tested
- **[FINAL_COMPREHENSIVE_TEST_RESULTS.md](docs/FINAL_COMPREHENSIVE_TEST_RESULTS.md)** - Test results

**28 total documentation files available in `/docs`**

---

## 🚢 Deployment Checklist

### Before First Deploy

- [ ] **Read [PHIPA_COMPLIANCE_ONTARIO.md](docs/PHIPA_COMPLIANCE_ONTARIO.md)** ⚠️ REQUIRED
- [ ] Consult with healthcare privacy lawyer (Ontario PHIPA)
- [ ] Complete Privacy Impact Assessment (PIA)
- [ ] Implement formal consent processes
- [ ] Generate strong `DATABASE_ENCRYPTION_KEY` (32+ bytes)
- [ ] Generate strong `NEXTAUTH_SECRET` (32+ bytes)
- [ ] Update backend `.env` with secure values
- [ ] Test backend locally (`npm start`)
- [ ] Test tunnel connection
- [ ] Push to GitHub (verify no secrets leaked)
- [ ] Verify Sentry PII scrubbing or disable for production

### Vercel Configuration

- [ ] Add environment variables:
  - `NEXT_PUBLIC_BACKEND_URL`
  - `NEXTAUTH_SECRET`
  - `NEXTAUTH_URL`
- [ ] Verify build succeeds locally
- [ ] Deploy to Vercel
- [ ] Test production URL

### Post-Deploy

- [ ] Test health check endpoint
- [ ] Test voice recording (confirm local Whisper.cpp processing)
- [ ] Test AI features (confirm local Ollama processing)
- [ ] Test database operations (confirm data in Ontario only)
- [ ] Change default admin password
- [ ] Enable MFA for ALL accounts (PHIPA best practice)
- [ ] Create encrypted database backup
- [ ] Establish breach response procedures
- [ ] Train all users on PHIPA requirements
- [ ] Document consent processes
- [ ] Verify IPC of Ontario contact information

---

## 💰 Costs

| Service | Plan | Monthly Cost |
|---------|------|-------------|
| **Vercel** | Hobby | **$0** (100 GB bandwidth) |
| **GitHub** | Free | **$0** (private repo) |
| **Cloudflare Tunnel** | Free | **$0** (unlimited) |
| **Your Mac** | Local | **$0** (electricity only) |
| **TOTAL** | | **$0/month** 🎉 |

---

## 🆘 Support

### Troubleshooting

**Frontend shows "API Error"**
- Check backend is running: `lsof -i :4000`
- Check tunnel is running: `pgrep cloudflared`
- Verify `NEXT_PUBLIC_BACKEND_URL` in Vercel

**Database connection fails**
- Check encryption key in `backend/.env`
- Verify database file exists: `ls -la data/local_psw_data.db`
- Check file permissions

**Ollama not responding**
- Start Ollama: `ollama serve &`
- Test API: `curl http://localhost:11434/api/tags`
- Pull model: `ollama pull llama3.3:70b`

### Resources

- **Cloudflare Tunnel:** https://developers.cloudflare.com/cloudflare-one/
- **Vercel:** https://vercel.com/docs
- **Next.js:** https://nextjs.org/docs
- **Ollama:** https://ollama.ai/docs

---

## 🤝 Contributing

We welcome contributions from the community! Whether you're fixing bugs, adding features, or improving documentation, your help is appreciated.

### Getting Started

1. **Read the Contributing Guide**: [CONTRIBUTING.md](CONTRIBUTING.md)
2. **Check Existing Issues**: Browse [open issues](https://github.com/tailoredcaresolutions/2424/issues)
3. **Fork & Clone**: Fork the repo and clone to your machine
4. **Create Branch**: Use descriptive branch names (`feature/`, `fix/`, `docs/`)
5. **Make Changes**: Follow our coding standards and guidelines
6. **Test Thoroughly**: Run tests and verify your changes
7. **Submit PR**: Use our [PR template](.github/pull_request_template.md)

### Contribution Guidelines

- ✅ **PHIPA Compliant**: All changes must maintain Ontario healthcare compliance
- ✅ **Accessible**: Follow WCAG 2.1 AA standards for UI changes
- ✅ **Tested**: Include tests for new features and bug fixes
- ✅ **Documented**: Update documentation for user-facing changes
- ✅ **Secure**: No secrets in code, proper input validation
- ✅ **Brand Consistent**: Use correct colors and "Tailored Care Solutions" branding

### Templates Available

- **Pull Request**: [.github/pull_request_template.md](.github/pull_request_template.md)
- **Bug Report**: [.github/ISSUE_TEMPLATE/bug_report.md](.github/ISSUE_TEMPLATE/bug_report.md)
- **Feature Request**: [.github/ISSUE_TEMPLATE/feature_request.md](.github/ISSUE_TEMPLATE/feature_request.md)
- **Documentation**: [.github/ISSUE_TEMPLATE/documentation.md](.github/ISSUE_TEMPLATE/documentation.md)
- **Security Issue**: [.github/ISSUE_TEMPLATE/security.md](.github/ISSUE_TEMPLATE/security.md)

### Resources for Contributors

- **Contributing Guide**: [CONTRIBUTING.md](CONTRIBUTING.md)
- **Project Context**: [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md)
- **PHIPA Compliance**: [docs/PHIPA_COMPLIANCE_ONTARIO.md](docs/PHIPA_COMPLIANCE_ONTARIO.md)
- **PSW Standards**: [PSW_ONTARIO_STANDARDS_RESEARCH.md](PSW_ONTARIO_STANDARDS_RESEARCH.md)

**Questions?** Open a [GitHub Discussion](https://github.com/tailoredcaresolutions/2424/discussions) or comment on an existing issue.

---

## 🎯 Roadmap

### Phase 1: Complete ✅
- Core voice documentation
- Local AI integration
- Database encryption
- MFA authentication
- Accessibility (WCAG 2.1 AA)
- Hybrid architecture

### Phase 2: In Progress
- Auth.js v5 migration
- Global settings context
- Conversation history

### Phase 3: Planned
- Mobile app (Expo)
- Advanced analytics
- Team collaboration
- Report templates
- Backup automation

---

**Built with ❤️ using Next.js 16, React 19, and 100% local AI**

**Status:** ✅ Production Ready (Hybrid Architecture)
**Version:** 1.0.0
**Last Updated:** October 28, 2025

<!-- Deploy trigger: 2025-10-29T01:16:13Z -->
