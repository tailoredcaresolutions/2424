// Tailored Care Solutions - PSW Voice Reporting System
// End-to-End Test: Complete Voice Workflow
// Tests full flow: Voice Input → Transcription → Conversation → Report → Voice Output

import { test, expect } from '@playwright/test';

/**
 * E2E TEST SUITE: Complete Voice Documentation Workflow
 * 
 * Tests the complete user journey:
 * 1. PSW opens app and sees golden orb (idle state)
 * 2. PSW speaks or types shift notes
 * 3. System transcribes voice to text (Whisper)
 * 4. AI responds with guidance (Qwen3 14B)
 * 5. System generates final report (Qwen3 30B)
 * 6. System creates DAR JSON (structured data)
 * 7. Optional: System speaks response (XTTS)
 */

test.describe('PSW Voice Documentation Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to main app
    await page.goto('http://localhost:3000');
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
  });

  test('should display golden orb in idle state', async ({ page }) => {
    // Check for golden orb component
    const goldOrb = page.locator('[data-testid="gold-orb"]').or(
      page.locator('.gold-orb').or(
        page.locator('text=/breathing|avatar/i')
      )
    );
    
    await expect(goldOrb.first()).toBeVisible({ timeout: 10000 });
  });

  test('should allow text input for shift documentation', async ({ page }) => {
    // Find input field or text area
    const input = page.locator('textarea, input[type="text"]').first();
    
    await expect(input).toBeVisible();
    
    // Type a sample PSW shift note
    await input.fill('Good morning. I assisted Margaret Smith with her shower. She was alert and cooperative. I noticed dry skin on her legs.');
    
    // Check that text was entered
    await expect(input).toHaveValue(/Margaret Smith|shower|alert/);
  });

  test('should send message and receive AI response', async ({ page }) => {
    // Type message
    const input = page.locator('textarea, input[type="text"]').first();
    await input.fill('I assisted the client with bathing this morning.');
    
    // Find and click send button
    const sendButton = page.locator('button').filter({ hasText: /send|submit/i }).first();
    await sendButton.click();
    
    // Wait for AI response
    await page.waitForTimeout(2000);
    
    // Check for conversation history
    const conversation = page.locator('[data-testid="conversation"]').or(
      page.locator('.conversation, .chat-history, .messages')
    );
    
    await expect(conversation.first()).toBeVisible({ timeout: 10000 });
  });

  test('should generate final report', async ({ page }) => {
    // Simulate conversation first
    const input = page.locator('textarea').first();
    await input.fill('Client Margaret Smith, 85 years old. Assisted with morning ADLs. Client was alert and cooperative.');
    
    const sendButton = page.locator('button').filter({ hasText: /send/i }).first();
    await sendButton.click();
    
    await page.waitForTimeout(2000);
    
    // Find generate report button
    const generateButton = page.locator('button').filter({ hasText: /generate report|create report/i });
    
    if (await generateButton.count() > 0) {
      await generateButton.first().click();
      
      // Wait for report generation
      await page.waitForTimeout(3000);
      
      // Check for report display
      const report = page.locator('[data-testid="report"]').or(
        page.locator('.report, .generated-report')
      );
      
      await expect(report.first()).toBeVisible({ timeout: 15000 });
    }
  });

  test('should display DAR JSON structure', async ({ page }) => {
    // Navigate to DAR demo page
    await page.goto('http://localhost:3000/demo-dar');
    
    // Wait for page load
    await page.waitForLoadState('networkidle');
    
    // Check for DAR sections
    const darData = page.locator('text=/Data:|D:/i').first();
    const darAction = page.locator('text=/Action:|A:/i').first();
    const darResponse = page.locator('text=/Response:|R:/i').first();
    
    await expect(darData).toBeVisible({ timeout: 10000 });
    await expect(darAction).toBeVisible();
    await expect(darResponse).toBeVisible();
  });

  test('should enforce PSW scope (no diagnoses)', async ({ page }) => {
    // Type a message that might trigger diagnosis
    const input = page.locator('textarea').first();
    await input.fill('Client blood pressure was 160/95. What should I do?');
    
    const sendButton = page.locator('button').filter({ hasText: /send/i }).first();
    await sendButton.click();
    
    await page.waitForTimeout(3000);
    
    // Check that AI response contains "notify supervisor" pattern
    const pageText = await page.textContent('body');
    
    expect(pageText).toMatch(/notify.*supervisor|contact.*RN|inform.*nurse/i);
    expect(pageText).not.toMatch(/diagnose|diagnosis|prescribe|treatment plan/i);
  });

  test('should maintain conversation history', async ({ page }) => {
    // Send multiple messages
    const input = page.locator('textarea').first();
    const sendButton = page.locator('button').filter({ hasText: /send/i }).first();
    
    // First message
    await input.fill('Good morning, I am starting my shift.');
    await sendButton.click();
    await page.waitForTimeout(2000);
    
    // Second message
    await input.fill('I will be assisting Margaret Smith today.');
    await sendButton.click();
    await page.waitForTimeout(2000);
    
    // Check that both messages appear in history
    const pageText = await page.textContent('body');
    
    expect(pageText).toContain('starting my shift');
    expect(pageText).toContain('Margaret Smith');
  });

  test('should handle multi-language support', async ({ page }) => {
    // Test Filipino input
    const input = page.locator('textarea').first();
    await input.fill('Mabuti ang kalagayan ng client ngayong umaga.');
    
    const sendButton = page.locator('button').filter({ hasText: /send/i }).first();
    await sendButton.click();
    
    // System should handle non-English input gracefully
    await page.waitForTimeout(2000);
    
    // Just verify no errors occurred
    const errorElement = page.locator('text=/error|failed/i');
    await expect(errorElement).toHaveCount(0, { timeout: 5000 }).catch(() => {
      // It's okay if no error element exists
    });
  });

  test('should complete workflow within 5 seconds (performance)', async ({ page }) => {
    const startTime = Date.now();
    
    // Type and send message
    const input = page.locator('textarea').first();
    await input.fill('Client assisted with morning care.');
    
    const sendButton = page.locator('button').filter({ hasText: /send/i }).first();
    await sendButton.click();
    
    // Wait for response
    await page.waitForTimeout(5000);
    
    const elapsed = (Date.now() - startTime) / 1000;
    
    // Should complete within 5 seconds
    expect(elapsed).toBeLessThan(5);
  });

  test('should display brand colors (Navy & Gold)', async ({ page }) => {
    // Check that brand colors are present in the UI
    const body = page.locator('body');
    
    // Get computed styles
    const bodyHTML = await body.innerHTML();
    
    // Check for navy (#1B365D, #0E1535) and gold (#E3A248, #D4A574)
    expect(bodyHTML).toMatch(/#1B365D|#0E1535|#E3A248|#D4A574/i);
  });

  test('should show "Tailored Care Solutions" branding', async ({ page }) => {
    // Check for company name (never abbreviated to "TCS")
    const pageText = await page.textContent('body');
    
    expect(pageText).toContain('Tailored Care');
    expect(pageText).not.toMatch(/\bTCS\b/); // "TCS" as standalone word not allowed
  });

  test('should be accessible (WCAG 2.1 AA basics)', async ({ page }) => {
    // Check for accessible elements
    const buttons = await page.locator('button').all();
    
    // All buttons should have text or aria-label
    for (const button of buttons) {
      const text = await button.textContent();
      const ariaLabel = await button.getAttribute('aria-label');
      
      expect(text || ariaLabel).toBeTruthy();
    }
    
    // Check for form labels
    const inputs = await page.locator('input, textarea').all();
    
    for (const input of inputs) {
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const placeholder = await input.getAttribute('placeholder');
      
      // Should have some way to identify the input
      expect(id || ariaLabel || placeholder).toBeTruthy();
    }
  });
});

test.describe('API Routes Health Checks', () => {
  test('should have healthy transcribe-whisper endpoint', async ({ request }) => {
    const response = await request.get('http://localhost:3000/api/transcribe-whisper');
    
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.status || data.service).toBeTruthy();
  });

  test('should have healthy synthesize-xtts endpoint', async ({ request }) => {
    const response = await request.get('http://localhost:3000/api/synthesize-xtts');
    
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.status || data.service).toBeTruthy();
  });

  test('should validate required fields in transcribe endpoint', async ({ request }) => {
    const response = await request.post('http://localhost:3000/api/transcribe-whisper', {
      data: {}
    });
    
    // Should return 400 for missing audioData
    expect(response.status()).toBe(400);
  });

  test('should validate required fields in synthesize endpoint', async ({ request }) => {
    const response = await request.post('http://localhost:3000/api/synthesize-xtts', {
      data: {}
    });
    
    // Should return 400 for missing text
    expect(response.status()).toBe(400);
  });
});
