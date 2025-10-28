# Global Configuration - V0 API & Context7

**Date**: October 25, 2025  
**Scope**: All VS Code workspaces (global)  
**Status**: ✅ Configured

---

## ✅ What's Been Configured Globally

### 1. Context7 (Upstash) - Already Active! ✅

Context7 is **already enabled globally** in your VS Code settings:

**File**: `~/Library/Application Support/Code/User/settings.json`

```json
{
  "github.copilot.chat.newWorkspace.useContext7": true,
  "chat.mcp.gallery.enabled": true,
  "workbench.settings.applyToAllProfiles": [
    "github.copilot.chat.newWorkspace.useContext7",
    "chat.mcp.gallery.enabled"
  ]
}
```

**What this means**:
- ✅ Context7 works in ALL workspaces automatically
- ✅ No per-project configuration needed
- ✅ I can access library documentation anywhere
- ✅ MCP server gallery enabled globally

### 2. V0 API Key - Now Globally Available! ✅

I've configured V0 API key globally for all terminal sessions:

**File**: `~/.v0_config` (sourced by all shells)

```bash
# V0 API Configuration - Global for all workspaces
export V0_API_KEY="your_v0_api_key_here"
```

**File**: `~/.zshrc` (updated to source config)

```bash
# V0 API - Global configuration
source ~/.v0_config 2>/dev/null || true
```

**What this means**:
- ✅ V0 API key available in ALL VS Code terminals
- ✅ Works across ALL workspaces
- ✅ No per-project `.env.local` needed (but still works if present)
- ✅ Terminal commands inherit the key automatically

---

## 📝 How to Add Your V0 API Key Globally

### Option 1: Edit Global Config (Recommended)

```bash
# Open the global config file
nano ~/.v0_config

# Find this line:
export V0_API_KEY="your_v0_api_key_here"

# Replace with your actual key:
export V0_API_KEY="v0_sk_abc123xyz_your_actual_key"

# Save: Ctrl+O, Enter, Ctrl+X

# Reload shell:
source ~/.zshrc
```

### Option 2: One-Line Command

```bash
# Replace YOUR_KEY_HERE with your actual key
echo 'export V0_API_KEY="YOUR_KEY_HERE"' > ~/.v0_config && source ~/.zshrc
```

### Option 3: TextEdit (Mac)

```bash
open -a TextEdit ~/.v0_config
# Edit the key, save, then run:
source ~/.zshrc
```

---

## ✅ Verification - Check It Works

### Test Context7 (Should Already Work)

Open ANY workspace in VS Code and ask:
```
"Show me documentation for Next.js routing"
```

I should automatically fetch Context7 docs! ✅

### Test V0 API (After Adding Your Key)

In ANY VS Code terminal in ANY workspace:

```bash
# Check if key is loaded
echo $V0_API_KEY
# Should show your key (not "your_v0_api_key_here")

# Test component generation
node scripts/generate-v0-component.js "Create a button"
# Should generate successfully
```

---

## 🌍 How Global Configuration Works

### Context7 (Upstash MCP)

```
VS Code User Settings (Global)
    ↓
All Workspaces Inherit
    ↓
Context7 Available Everywhere
```

**Location**: `~/Library/Application Support/Code/User/settings.json`  
**Applies to**: ALL workspaces opened in VS Code  
**No action needed**: Already configured! ✅

### V0 API Key

```
~/.v0_config (Global Shell Config)
    ↓
Sourced by ~/.zshrc (All Terminals)
    ↓
VS Code Terminals Inherit
    ↓
Available in ALL Workspaces
```

**Location**: `~/.v0_config` (sourced by `~/.zshrc`)  
**Applies to**: ALL terminal sessions (VS Code, iTerm, Terminal.app)  
**Action needed**: Add your key to `~/.v0_config` ⏳

---

## 📂 Project-Specific Override (Optional)

If you want different keys per project, `.env.local` overrides global config:

```
~/.v0_config (Global)
    ↓
Project .env.local (Override if exists)
    ↓
Uses project-specific key
```

**Priority**:
1. `.env.local` in project (highest priority)
2. `~/.v0_config` global (fallback)
3. Shell environment variables (lowest priority)

---

## 🔐 Security - Global vs Project

### Global Configuration (`~/.v0_config`)

**Pros**:
- ✅ Works everywhere automatically
- ✅ One place to update
- ✅ No per-project setup

**Cons**:
- ⚠️ All projects use same key
- ⚠️ Key in home directory (still safe)

**Best for**: Personal development, single account

### Project Configuration (`.env.local`)

**Pros**:
- ✅ Different keys per project
- ✅ Project-isolated credentials
- ✅ Gitignored by default

**Cons**:
- ⚠️ Must configure each project
- ⚠️ Repeat same key if same account

**Best for**: Teams, multiple accounts, shared machines

---

## 🎯 Current Status

### Context7 (Upstash)
✅ **Already configured globally**  
✅ **Works in all workspaces**  
✅ **No action needed**

### V0 API
✅ **Global config file created** (`~/.v0_config`)  
✅ **Shell configured to load it** (`~/.zshrc`)  
⏳ **Your action**: Add your key to `~/.v0_config`

---

## 📝 Quick Reference

### Files Modified

| File | Purpose | Scope |
|------|---------|-------|
| `~/.v0_config` | V0 API key storage | Global (all workspaces) |
| `~/.zshrc` | Sources V0 config | Global (all shells) |
| VS Code `settings.json` | Context7 enabled | Global (all workspaces) |

### Commands

```bash
# Edit global V0 config
nano ~/.v0_config

# Reload shell after changes
source ~/.zshrc

# Check if key is loaded
echo $V0_API_KEY

# Test in any workspace
node scripts/generate-v0-component.js "Create a button"
```

---

## 🚀 Next Steps

1. **✅ Context7**: Already working globally - no action needed!

2. **⏳ V0 API Key**: Add your key to `~/.v0_config`:
   ```bash
   nano ~/.v0_config
   # Replace: your_v0_api_key_here
   # With: v0_sk_your_actual_key
   # Save and run: source ~/.zshrc
   ```

3. **✅ Test**: Open ANY workspace, open terminal:
   ```bash
   echo $V0_API_KEY  # Should show your key
   ```

4. **🎨 Use It**: Tell me what components you need in ANY workspace!

---

## 💡 Benefits of Global Setup

### For You:
- Open any project → V0 API ready
- Context7 documentation always available
- No repetitive configuration
- One place to update credentials

### For AI Assistant:
- Generate components in any workspace
- Access library docs everywhere
- Consistent environment
- Seamless workflow

---

## ✨ Ready to Go!

**Context7**: ✅ Working globally  
**V0 API**: ⏳ Add your key to `~/.v0_config`  
**All Workspaces**: Will inherit both automatically  
**Your Projects**: Zero per-project setup needed!

**Just add your V0 API key to `~/.v0_config` and we're ready across ALL workspaces!** 🌍✨
