# Contributing to PSW Voice Documentation System

Thank you for your interest in contributing to this project! This guide will help you get started.

## Development Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/yourusername/psw-voice-documentation.git
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Copy environment variables:
   ```bash
   cp .env.example .env.local
   ```
5. Fill in your API keys in `.env.local`
6. Start development server:
   ```bash
   npm run dev
   ```

## Code Style

- Use TypeScript where possible
- Follow existing code formatting
- Use meaningful variable and function names
- Add comments for complex logic
- Keep components focused and reusable

## Commit Guidelines

- Use clear, descriptive commit messages
- Start with a verb (Add, Fix, Update, Remove)
- Keep the first line under 50 characters
- Add detailed description if needed

Example:
```
Add multilingual support for Hindi

- Implement Hindi language detection
- Add Hindi voice recognition
- Update UI translations
```

## Pull Request Process

1. Create a feature branch from `main`
2. Make your changes
3. Test thoroughly
4. Update documentation if needed
5. Submit a pull request with:
   - Clear title and description
   - Screenshots if UI changes
   - Testing instructions

## Areas for Contribution

- **Language Support**: Add new languages
- **Voice Recognition**: Improve accuracy
- **UI/UX**: Enhance user experience
- **Documentation**: Improve guides and comments
- **Testing**: Add unit and integration tests
- **Accessibility**: Improve accessibility features

## Reporting Issues

When reporting bugs, please include:
- Browser and version
- Operating system
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable

## Questions?

Feel free to open an issue for questions or join our discussions.