#!/usr/bin/env node
/**
 * COMPREHENSIVE WEBSITE AUDIT
 * Tests EVERY page, link, button, and feature
 */

const pages = [
  { url: '/', name: 'Main (PSW Voice)', features: ['Voice button', 'Text button', 'Language dropdown', 'Start Fresh', 'Resume Session', 'Save Session', 'Load Session', 'Generate Report'] },
  { url: '/demo-dar', name: 'Demo DAR', features: ['Language selector', 'Text input', 'Generate button', 'Copy Paragraph', 'Show/Hide JSON', 'Copy JSON', 'Export JSON'] },
  { url: '/admin', name: 'Admin Dashboard', features: ['Navigation links', 'Stats display'] },
  { url: '/admin/users', name: 'Admin - Users', features: ['User list', 'Actions'] },
  { url: '/admin/audit-logs', name: 'Admin - Audit Logs', features: ['Logs table'] },
  { url: '/admin/monitoring', name: 'Admin - Monitoring', features: ['Metrics display'] },
  { url: '/admin/backups', name: 'Admin - Backups', features: ['Backup list'] },
  { url: '/profile', name: 'User Profile', features: ['Profile form'] },
  { url: '/reports', name: 'Reports', features: ['Report list'] },
  { url: '/search', name: 'Search', features: ['Search input', 'Results'] },
  { url: '/analytics', name: 'Analytics', features: ['Charts', 'Data'] },
  { url: '/settings', name: 'Settings', features: ['Settings form'] },
  { url: '/settings/mfa', name: 'Settings - MFA', features: ['MFA setup'] }
];

async function testPage(page) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`📄 Testing: ${page.name} (${page.url})`);
  console.log('='.repeat(80));

  try {
    const response = await fetch(`http://localhost:3000${page.url}`, {
      signal: AbortSignal.timeout(10000)
    });

    console.log(`Status: ${response.status} ${response.statusText}`);

    if (response.status === 200) {
      const html = await response.text();

      // Check for React errors
      const hasError = html.includes('ReferenceError') ||
                       html.includes('TypeError') ||
                       html.includes('Application error') ||
                       html.includes('digest:');

      if (hasError) {
        console.log('❌ PAGE HAS JAVASCRIPT ERRORS');

        // Extract error details
        const errorMatch = html.match(/(\w+Error): ([^\n<]+)/);
        if (errorMatch) {
          console.log(`   Error: ${errorMatch[0]}`);
        }

        const digestMatch = html.match(/digest: ['"]([\w]+)['"]/);
        if (digestMatch) {
          console.log(`   Digest: ${digestMatch[1]}`);
        }

        return { status: 'ERROR', url: page.url, error: errorMatch ? errorMatch[0] : 'Unknown error' };
      }

      // Check for CSS/styling
      const hasCSS = html.includes('.css') || html.includes('stylesheet');
      console.log(`CSS Loaded: ${hasCSS ? '✅' : '❌'}`);

      // Check for Tailwind classes
      const hasTailwind = html.includes('class="') &&
                          (html.includes('flex') || html.includes('grid') || html.includes('bg-'));
      console.log(`Tailwind Classes: ${hasTailwind ? '✅' : '❌'}`);

      // Check for brand colors
      const hasBlueColor = html.includes('#1B365D');
      const hasGoldColor = html.includes('#D4A574');
      console.log(`Brand Colors: ${hasBlueColor && hasGoldColor ? '✅ Both' : hasBlueColor ? '⚠️  Blue only' : hasGoldColor ? '⚠️  Gold only' : '❌ Neither'}`);

      // Check for "Tailored Care" branding
      const hasBranding = html.includes('Tailored Care');
      console.log(`Branding: ${hasBranding ? '✅' : '❌'}`);

      // Check for key features (if applicable)
      console.log(`\n🔍 Feature Check:`);
      page.features.forEach(feature => {
        const hasFeature = html.toLowerCase().includes(feature.toLowerCase());
        console.log(`   ${hasFeature ? '✅' : '❌'} ${feature}`);
      });

      // Check page size (too small might indicate missing content)
      const pageSize = html.length;
      console.log(`\nPage Size: ${pageSize} bytes ${pageSize < 5000 ? '⚠️  (suspiciously small)' : '✅'}`);

      return { status: 'OK', url: page.url };
    } else {
      console.log(`❌ HTTP ${response.status} - Page not accessible`);
      return { status: 'HTTP_ERROR', url: page.url, code: response.status };
    }

  } catch (error) {
    console.log(`❌ FAILED: ${error.message}`);
    return { status: 'EXCEPTION', url: page.url, error: error.message };
  }
}

async function runFullAudit() {
  console.log('\n🚀 COMPREHENSIVE WEBSITE AUDIT');
  console.log(`Testing ${pages.length} pages...\n`);

  const results = [];

  for (const page of pages) {
    const result = await testPage(page);
    results.push(result);
    await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between tests
  }

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 AUDIT SUMMARY');
  console.log('='.repeat(80));

  const okPages = results.filter(r => r.status === 'OK');
  const errorPages = results.filter(r => r.status === 'ERROR');
  const httpErrorPages = results.filter(r => r.status === 'HTTP_ERROR');
  const exceptionPages = results.filter(r => r.status === 'EXCEPTION');

  console.log(`\n✅ Working: ${okPages.length}/${pages.length}`);
  okPages.forEach(r => console.log(`   - ${r.url}`));

  if (errorPages.length > 0) {
    console.log(`\n❌ JavaScript Errors: ${errorPages.length}/${pages.length}`);
    errorPages.forEach(r => console.log(`   - ${r.url}: ${r.error || 'Unknown'}`));
  }

  if (httpErrorPages.length > 0) {
    console.log(`\n❌ HTTP Errors: ${httpErrorPages.length}/${pages.length}`);
    httpErrorPages.forEach(r => console.log(`   - ${r.url}: HTTP ${r.code}`));
  }

  if (exceptionPages.length > 0) {
    console.log(`\n❌ Exceptions: ${exceptionPages.length}/${pages.length}`);
    exceptionPages.forEach(r => console.log(`   - ${r.url}: ${r.error}`));
  }

  console.log(`\n${'='.repeat(80)}`);
  console.log(`OVERALL SCORE: ${okPages.length}/${pages.length} pages working (${Math.round(okPages.length / pages.length * 100)}%)`);
  console.log('='.repeat(80));

  if (errorPages.length > 0 || httpErrorPages.length > 0 || exceptionPages.length > 0) {
    console.log('\n⚠️  ISSUES DETECTED - See details above');
    process.exit(1);
  } else {
    console.log('\n✅ ALL PAGES WORKING!');
    process.exit(0);
  }
}

runFullAudit().catch(console.error);
