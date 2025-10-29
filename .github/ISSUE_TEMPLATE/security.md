---
name: Security Issue
about: Report a security vulnerability (PRIVATE - use GitHub Security Advisories for sensitive issues)
title: '[SECURITY] '
labels: ['security', 'needs-triage']
assignees: ''
---

## ⚠️ IMPORTANT: Reporting Security Vulnerabilities

**For sensitive security issues that could expose PHI or compromise the system:**
- **DO NOT** open a public issue
- **DO** use [GitHub Security Advisories](https://github.com/tailoredcaresolutions/2424/security/advisories/new)
- **DO** contact maintainers directly

**For non-sensitive security improvements:**
You may use this template to suggest security enhancements.

---

## Security Issue Type

<!-- Check all that apply -->

- [ ] Potential PHI exposure
- [ ] Authentication/Authorization issue
- [ ] Data encryption concern
- [ ] Dependency vulnerability
- [ ] XSS (Cross-Site Scripting)
- [ ] SQL Injection
- [ ] CSRF (Cross-Site Request Forgery)
- [ ] Rate limiting issue
- [ ] Other: ___________

## Description

<!-- Non-sensitive description of the security concern -->

## Impact

<!-- What is the potential impact? -->

- [ ] 🔴 Critical - PHI exposure or system compromise
- [ ] 🟠 High - Authentication bypass or data leak
- [ ] 🟡 Medium - Security weakness exists but not easily exploitable
- [ ] 🟢 Low - Security enhancement suggestion

## PHIPA Compliance Impact

<!-- Does this affect Ontario healthcare compliance? -->

- [ ] Could lead to PHI breach
- [ ] Violates PHIPA requirements
- [ ] Affects audit logging
- [ ] Affects data encryption
- [ ] No PHIPA impact

## Affected Components

<!-- Which parts of the system are affected? -->

- [ ] Frontend (Next.js app)
- [ ] Backend API
- [ ] Database
- [ ] Authentication system
- [ ] AI processing
- [ ] Other: ___________

## Reproduction Steps

<!-- If non-sensitive, describe how to reproduce -->

**Note:** Do not include sensitive information or actual exploit code.

## Proposed Solution

<!-- If you have suggestions for fixing this -->

## Additional Context

<!-- Any other relevant information -->

---

**Remember**: For critical vulnerabilities, use [GitHub Security Advisories](https://github.com/tailoredcaresolutions/2424/security/advisories/new) instead of public issues.
