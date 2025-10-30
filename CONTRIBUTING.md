# Contributing to PSW Voice Documentation System

Thank you for your interest in contributing to the PSW Voice Documentation System for Tailored Care Solutions! This guide will help you get started.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing Requirements](#testing-requirements)
- [Healthcare Compliance](#healthcare-compliance)
- [Accessibility Requirements](#accessibility-requirements)
- [Security Guidelines](#security-guidelines)

---

## Code of Conduct

This project serves healthcare workers and vulnerable populations. We expect all contributors to:

- Be respectful and professional
- Prioritize patient privacy and data security
- Follow healthcare compliance requirements (PHIPA for Ontario)
- Maintain accessibility standards (WCAG 2.1 AA)
- Write clear, maintainable code

---

## Getting Started

### Prerequisites

- **Node.js** 22.21.0 or higher
- **npm** 10.0.0 or higher
- **macOS** with M-series chip (for local AI services)
- **Git** for version control

### Initial Setup

1. **Fork the repository** on GitHub

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/2424.git
   cd 2424
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/tailoredcaresolutions/2424.git
   ```

4. **Install dependencies**
   ```bash
   npm install
   ```

5. **Set up environment variables**
   ```bash
   # Frontend
   cp .env.example.frontend .env.local
   
   # Backend (if working on backend)
   cd backend
   cp .env.example .env
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

   Visit http://localhost:3000 to see the app running.

### Backend Setup (Optional)

If you're working on features that require the backend:

1. **Install local AI services** (see [docs/LOCAL_AI_MODELS_SETUP.md](docs/LOCAL_AI_MODELS_SETUP.md))
   - Ollama (LLaMA 3.3 70B)
   - Whisper.cpp
   - Coqui XTTS

2. **Start backend services**
   ```bash
   cd backend
   npm install
   npm start
   ```

3. **Set up Cloudflare Tunnel** (see [docs/CLOUDFLARE_TUNNEL_SETUP.md](docs/CLOUDFLARE_TUNNEL_SETUP.md))

---

## Development Workflow

### Creating a Branch

Always create a new branch for your work:

```bash
# Update main branch
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/bug-description
```

### Branch Naming Convention

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Adding or updating tests
- `chore/` - Maintenance tasks

Examples:
- `feature/multi-language-support`
- `fix/voice-recording-timeout`
- `docs/update-api-documentation`

### Commit Message Format

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, no logic change)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks
- `perf:` - Performance improvements
- `security:` - Security improvements

**Examples:**
```bash
git commit -m "feat(voice): add multi-language voice recognition support"
git commit -m "fix(dar): correct JSON validation schema for medications"
git commit -m "docs(api): update API endpoint documentation"
```

---

## Pull Request Process

### Before Creating a Pull Request

1. **Sync with upstream**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run tests**
   ```bash
   npm test                    # Unit tests
   npm run test:e2e           # E2E tests
   npm run lint               # Linting
   ```

3. **Build the project**
   ```bash
   npm run build
   ```

4. **Test your changes manually**
   - Test on multiple browsers (Chrome, Firefox, Safari)
   - Test keyboard navigation
   - Test screen reader compatibility (if UI changes)
   - Test on mobile devices (if applicable)

### Creating the Pull Request

1. **Push your branch**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create PR on GitHub**
   - Go to your fork on GitHub
   - Click "New Pull Request"
   - Select your branch
   - Fill out the PR template completely (it will auto-populate)

3. **Complete the PR Template**

   Our PR template includes important sections:
   - **Description**: Clear explanation of changes
   - **Type of Change**: Check all that apply
   - **Testing Checklist**: Document your testing
   - **PHIPA Compliance**: For healthcare-related changes
   - **Accessibility**: WCAG 2.1 AA verification
   - **Security**: Security considerations
   - **Brand Standards**: Brand consistency checks
   - **Screenshots**: Before/after for UI changes

   See `.github/pull_request_template.md` for the full template.

4. **Request Review**
   - Assign reviewers if you have permission
   - Link related issues using `Fixes #123` or `Closes #456`
   - Add appropriate labels

### During Code Review

- Respond promptly to feedback
- Make requested changes in new commits (don't force push during review)
- Mark conversations as resolved when addressed
- Re-request review after making changes

### After Approval

- Ensure all CI/CD checks are passing
- Squash commits if requested by maintainers
- Maintainers will merge your PR

---

## Coding Standards

### TypeScript/JavaScript

- Use TypeScript for new files when possible
- Follow ESLint configuration
- Use functional components and React Hooks
- Avoid `any` types in TypeScript
- Use meaningful variable and function names

### React Best Practices

- Use functional components with hooks
- Implement proper error boundaries
- Memoize expensive computations with `useMemo`
- Use `useCallback` for event handlers passed to child components
- Keep components focused and single-purpose

### Styling

- Use Tailwind CSS utility classes
- Follow brand color palette:
  - Navy: `#1B365D`
  - Gold: `#D4A574`
- Use CSS variables defined in `globals.css`
- Ensure responsive design (mobile-first)

### File Organization

- Place components in `components/`
- Place utilities in `lib/`
- Place API routes in `app/api/`
- Place page components in `app/`
- Keep files under 500 lines when possible

---

## Testing Requirements

### Unit Tests

Write unit tests for:
- Utility functions
- Business logic
- Custom hooks
- API route handlers

```bash
# Run unit tests
npm test

# Run with coverage
npm run test:coverage
```

### E2E Tests

Write E2E tests for:
- Critical user flows
- Form submissions
- Navigation
- API integrations

```bash
# Run E2E tests
npm run test:e2e

# Run in UI mode
npm run test:e2e:ui
```

### Manual Testing Checklist

For UI changes:
- [ ] Test on Chrome/Edge
- [ ] Test on Firefox
- [ ] Test on Safari
- [ ] Test on mobile devices
- [ ] Test keyboard navigation (Tab, Enter, Escape, Arrow keys)
- [ ] Test with screen reader (VoiceOver on macOS, NVDA/JAWS on Windows)
- [ ] Test color contrast with browser tools
- [ ] Test with reduced motion enabled

---

## Healthcare Compliance

### PHIPA (Ontario)

All contributions must comply with Ontario's Personal Health Information Protection Act:

- **No PHI in logs**: Never log personal health information
- **Local processing**: All AI processing must be local (no cloud AI services)
- **Data sovereignty**: Patient data must stay in Ontario
- **Encryption**: Use SQLCipher AES-256 for database encryption
- **Audit trails**: Log all data access

See [docs/PHIPA_COMPLIANCE_ONTARIO.md](docs/PHIPA_COMPLIANCE_ONTARIO.md) for details.

### Ontario PSW Scope

PSWs can only document **observations**, not clinical assessments:

**✅ Acceptable:**
- "Client reported feeling warm"
- "Blood pressure measured at 140/90 mmHg"
- "Client ate 75% of breakfast"
- "Skin appears dry on lower legs"

**❌ Not Acceptable:**
- "Client has hypertension" (diagnosis)
- "Client is dehydrated" (clinical assessment)
- "Recommend increasing fluids" (treatment plan)

See [PSW_ONTARIO_STANDARDS_RESEARCH.md](PSW_ONTARIO_STANDARDS_RESEARCH.md) for complete guidelines.

---

## Accessibility Requirements

We maintain **WCAG 2.1 AA** compliance:

### Required Standards

- **Keyboard Navigation**: All interactive elements must be keyboard accessible
- **Focus Indicators**: Visible focus indicators (minimum 2px outline)
- **Color Contrast**: Minimum 4.5:1 for normal text, 3:1 for large text
- **Screen Readers**: Proper ARIA labels and semantic HTML
- **Forms**: All inputs must have associated labels
- **Error Messages**: Clear, actionable error messages
- **Reduced Motion**: Respect `prefers-reduced-motion` setting

### Testing Tools

- **axe DevTools**: Browser extension for accessibility testing
- **WAVE**: Web accessibility evaluation tool
- **Lighthouse**: Chrome DevTools accessibility audit
- **Screen Readers**:
  - macOS: VoiceOver (Cmd+F5)
  - Windows: NVDA (free) or JAWS
  - Linux: Orca

---

## Security Guidelines

### Never Commit Secrets

- Use `.env.local` for local secrets (ignored by git)
- Use environment variables for API keys
- Use `.gitignore` to exclude sensitive files
- Run `git secrets` scan before pushing

### Input Validation

- Validate all user inputs on both client and server
- Sanitize HTML to prevent XSS
- Use parameterized queries to prevent SQL injection
- Implement rate limiting for API endpoints

### Authentication & Authorization

- Use NextAuth.js for authentication
- Implement Multi-Factor Authentication (MFA) for sensitive actions
- Use bcrypt or Argon2id for password hashing
- Implement proper session management

### Dependencies

- Keep dependencies up to date
- Run `npm audit` regularly
- Review security advisories
- Only add necessary dependencies

---

## Documentation

### Code Comments

- Use JSDoc for functions and components
- Explain "why" not "what" in comments
- Keep comments up to date with code changes
- Document complex algorithms or business logic

### README Updates

Update README.md when adding:
- New features
- New dependencies
- Configuration changes
- Deployment steps

### API Documentation

Document all API endpoints with:
- Request/response schemas
- Authentication requirements
- Error codes and messages
- Usage examples

---

## Getting Help

### Resources

- **Documentation**: See `/docs` folder
- **Project Context**: Read [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md)
- **AI Assistant Guide**: See [AI_ASSISTANT_GUIDE.md](AI_ASSISTANT_GUIDE.md)

### Ask Questions

- Open a GitHub Discussion for general questions
- Open an issue for bugs or feature requests
- Tag maintainers in PR comments for guidance

---

## License

By contributing to this project, you agree that your contributions will be licensed under the same license as the project.

---

**Thank you for contributing to the PSW Voice Documentation System!**

Your contributions help Personal Support Workers across Ontario provide better care to their clients.
