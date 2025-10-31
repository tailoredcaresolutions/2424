# AI Companion Avatar - Sprite-Based Facial Animation

A professional React component with **natural mouth movements** and facial expressions for AI companions, perfect for healthcare, elderly care, and conversational AI applications.

## 🎭 Features

- **8 High-Quality Expression Frames** - Neutral, Speaking (3 variations), Happy, Listening, Thinking, Surprised
- **Realistic Lip-Sync Animation** - Mouth cycles through speaking frames every 150ms for natural speech
- **33 AI States** - Comprehensive animation states for all AI interactions
- **Minimal Body Movement** - Focus on facial expressions (3-5px bounce max)
- **Cinema-Quality Animations** - Framer Motion with spring physics
- **Fully Customizable** - Colors, size, animation speed, effects
- **Production Ready** - TypeScript, optimized performance, 60fps

## 📦 Package Contents

```
avatar-animation-package/
├── images/
│   ├── avatar-neutral.png          # Neutral expression (idle state)
│   ├── avatar-speaking-1.png       # Speaking - mouth slightly open
│   ├── avatar-speaking-2.png       # Speaking - mouth more open
│   ├── avatar-speaking-3.png       # Speaking - mouth wide
│   ├── avatar-happy.png            # Happy/joyful expression
│   ├── avatar-listening.png        # Attentive listening expression
│   ├── avatar-thinking.png         # Contemplative expression
│   ├── avatar-surprised.png        # Surprised/amazed expression
│   └── companion-avatar-hd.png     # Original HD avatar (fallback)
├── AICompanionAvatar.tsx           # Main React component
└── README.md                       # This file
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install framer-motion
```

### 2. Copy Files

- Copy `AICompanionAvatar.tsx` to your `src/components/` directory
- Copy all images from `images/` folder to your `public/` directory

### 3. Use the Component

```tsx
import AICompanionAvatar from './components/AICompanionAvatar';

function App() {
  const [aiState, setAiState] = useState('idle');

  return (
    <AICompanionAvatar
      state={aiState}
      size="lg"
      primaryColor="#c9a063"
      secondaryColor="#d4b078"
      glowIntensity={0.25}
      animationSpeed={1.0}
    />
  );
}
```

## 🎨 Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `state` | AIState | `"idle"` | Current AI state (see states below) |
| `expression` | Expression | `"neutral"` | Facial expression overlay |
| `avatarUrl` | string | auto | Custom avatar image URL |
| `size` | "sm" \| "md" \| "lg" \| "xl" | `"lg"` | Avatar size |
| `primaryColor` | string | `"#c9a063"` | Primary brand color (hex) |
| `secondaryColor` | string | `"#d4b078"` | Secondary accent color |
| `glowIntensity` | number | `0.25` | Glow effect intensity (0-1) |
| `animationSpeed` | number | `1.0` | Animation speed multiplier |
| `showParticles` | boolean | `true` | Show particle effects |
| `showRings` | boolean | `true` | Show voice rings |
| `showSparkles` | boolean | `true` | Show sparkle effects |
| `enableHover` | boolean | `true` | Enable hover interactions |
| `enableClick` | boolean | `false` | Enable click interactions |
| `onClick` | function | - | Click handler |
| `onStateChange` | function | - | State change callback |

## 🎭 AI States

### Speaking States (with mouth animation)
- `speaking` - Cycles through 4 mouth positions for lip-sync
- `laughing` - Animated mouth with joyful expression
- `excited` - Energetic speaking animation
- `encouraging` - Supportive speaking animation
- `welcoming` - Warm greeting animation

### Expression States
- `idle` - Neutral, calm breathing
- `listening` - Attentive expression
- `thinking` - Contemplative look
- `happy` - Joyful smile
- `surprised` - Amazed expression
- `confused` - Questioning look
- `celebrating` - Triumphant joy

### Emotional States
- `concerned` - Worried expression
- `relieved` - Relaxed, exhaling
- `comforting` - Gentle, soothing
- `reassuring` - Calm, steady
- `sympathetic` - Empathetic
- `grateful` - Thankful
- `loving` - Warm affection
- `proud` - Accomplished
- `confident` - Strong presence

### Action States
- `nodding` - Vertical head movement (agreement)
- `shaking` - Horizontal head movement (disagreement)
- `focused` - Intense concentration
- `meditative` - Deep, slow breathing
- `sleeping` - Resting state
- `tired` - Low energy, yawning
- `playful` - Light, teasing
- `curious` - Interested, leaning in
- `determined` - Forward, strong
- `sad` - Downward, low energy
- `amazed` - Wide-eyed wonder

## 💡 Usage Examples

### Basic AI Chat Integration

```tsx
function ChatInterface() {
  const [aiState, setAiState] = useState('idle');
  const [message, setMessage] = useState('');

  const handleUserMessage = async (text) => {
    setAiState('listening');
    
    // Send to AI
    const response = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message: text })
    });
    
    setAiState('thinking');
    const data = await response.json();
    
    setAiState('speaking');
    setMessage(data.response);
    
    // Speak the response
    speakText(data.response);
    
    // Return to idle after speaking
    setTimeout(() => setAiState('idle'), 3000);
  };

  return (
    <div>
      <AICompanionAvatar
        state={aiState}
        size="xl"
        primaryColor="#c9a063"
      />
      <p>{message}</p>
    </div>
  );
}
```

### Voice Recognition Integration

```tsx
function VoiceChat() {
  const [aiState, setAiState] = useState('idle');

  const startListening = () => {
    setAiState('listening');
    
    // Start voice recognition
    recognition.start();
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setAiState('thinking');
      
      // Process with AI
      processAIResponse(transcript).then(() => {
        setAiState('speaking');
      });
    };
  };

  return (
    <div>
      <AICompanionAvatar
        state={aiState}
        size="lg"
        onStateChange={(state) => console.log('State:', state)}
      />
      <button onClick={startListening}>
        Start Voice Chat
      </button>
    </div>
  );
}
```

### Emotional Response System

```tsx
function EmotionalAI() {
  const [aiState, setAiState] = useState('idle');
  const [expression, setExpression] = useState('neutral');

  const analyzeEmotion = (userMessage) => {
    // Analyze user's emotional state
    const emotion = detectEmotion(userMessage);
    
    // Respond with appropriate expression
    if (emotion === 'sad') {
      setAiState('comforting');
      setExpression('empathy');
    } else if (emotion === 'happy') {
      setAiState('celebrating');
      setExpression('joy');
    } else if (emotion === 'confused') {
      setAiState('reassuring');
      setExpression('attentive');
    }
  };

  return (
    <AICompanionAvatar
      state={aiState}
      expression={expression}
      size="xl"
      primaryColor="#c9a063"
      glowIntensity={0.3}
    />
  );
}
```

## 🎬 Animation Details

### Lip-Sync System
The component automatically cycles through 4 speaking frames when in speaking states:
1. `avatar-speaking-1.png` - Slight mouth opening
2. `avatar-speaking-2.png` - Medium mouth opening
3. `avatar-speaking-3.png` - Wide mouth opening
4. `avatar-speaking-2.png` - Back to medium (smooth loop)

Frame changes occur every **150ms** for natural speech rhythm.

### Movement Reduction
Body movements are minimal (3-5px max) to keep focus on facial expressions:
- **Speaking**: 3px bounce, subtle rotation
- **Happy**: 5px bounce, gentle sway
- **Listening**: 2px movement, attentive stillness

### Expression Mapping
Each AI state automatically selects the appropriate facial expression:
- **Speaking states** → Cycles through speaking frames
- **Happy states** → Happy/smiling frame
- **Listening states** → Attentive listening frame
- **Thinking states** → Contemplative frame
- **Surprised states** → Amazed expression frame
- **Idle/neutral states** → Neutral calm frame

## 🎨 Customization

### Custom Colors

```tsx
<AICompanionAvatar
  state="speaking"
  primaryColor="#ff6b6b"      // Red theme
  secondaryColor="#ffd93d"    // Yellow accent
  glowIntensity={0.4}         // Stronger glow
/>
```

### Custom Avatar Images

```tsx
<AICompanionAvatar
  state="speaking"
  avatarUrl="/custom-avatar.png"  // Your own character
/>
```

### Animation Speed Control

```tsx
<AICompanionAvatar
  state="speaking"
  animationSpeed={1.5}  // 50% faster
/>
```

### Minimal Effects Mode

```tsx
<AICompanionAvatar
  state="speaking"
  showParticles={false}
  showRings={false}
  showSparkles={false}
  glowIntensity={0.1}
/>
```

## 📱 Responsive Sizing

The component automatically adapts to different screen sizes:

- **sm**: 80px - Mobile compact
- **md**: 120px - Mobile standard
- **lg**: 180px - Desktop standard
- **xl**: 240px - Desktop hero

## 🎯 Use Cases

- **Healthcare Apps** - Elderly care, dementia support, patient engagement
- **Customer Service** - AI chatbots, virtual assistants
- **Education** - Learning companions, tutoring systems
- **Mental Health** - Therapy bots, emotional support
- **Smart Home** - Voice assistant interfaces
- **Gaming** - NPC characters, companions

## 🔧 Technical Details

- **Framework**: React 18+ with TypeScript
- **Animation**: Framer Motion with spring physics
- **Performance**: 60fps, optimized rendering
- **Image Format**: PNG with transparency
- **Image Size**: 832x1248px (portrait)
- **File Size**: ~50-80KB per frame (optimized)
- **Browser Support**: Modern browsers (Chrome, Firefox, Safari, Edge)

## 📄 License

This component and all avatar images are provided for use in your projects. Feel free to customize and adapt as needed.

## 🙏 Credits

Created with Manus AI for the Companion Plus project - AI companion interface for dementia care.

---

**Need help?** The component includes extensive inline documentation and TypeScript types for easy integration.
