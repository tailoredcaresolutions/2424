# How to Get Figma File Keys

## Getting Figma File Keys

According to [Figma's official docs](https://developers.figma.com/docs/rest-api/), file keys come from the file URL.

---

## ✅ How to Get File Keys

### Method 1: From Figma File URL

1. Open your Figma file in browser
2. Look at the URL:
   ```
   https://www.figma.com/file/FILE_KEY_HERE/File-Name
   ```
3. The `FILE_KEY_HERE` is what you need!

### Method 2: From File Browser

1. In Figma, right-click on a file
2. Select "Copy link"
3. The link contains the file key:
   ```
   https://www.figma.com/file/abc123xyz456/My-File-Name
   ```
   → File key: `abc123xyz456`

### Method 3: Share Multiple File Keys

If you have multiple files, share them like this:
```bash
FIGMA_FILE_KEYS=abc123,def456,ghi789
```

Or add to `.env.local`:
```bash
# Comma-separated list of file keys
FIGMA_FILE_KEYS=your_file_key_1,your_file_key_2,your_file_key_3
```

---

## 🔍 What We Know

- ✅ Your account: `info@contead.com` (connected!)
- ✅ Personal token: Working
- ⚠️ Teams endpoint: 404 (requires organization account)

---

## 🚀 Once You Have File Keys

I can:
- ✅ Access each file directly
- ✅ Extract design tokens (colors, spacing, typography)
- ✅ Get component specifications
- ✅ Sync to Tailwind config automatically
- ✅ Implement designs pixel-perfectly!

---

## 💡 Quick Solution

**Option A**: Share file keys directly
- Copy file keys from Figma URLs
- I'll access them immediately!

**Option B**: Set up OAuth2 (if you want team/project access)
- Configure redirect URL
- Complete authorization flow
- Access all team files

**Which do you prefer?** 🎨


