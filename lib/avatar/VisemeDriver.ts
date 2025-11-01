/**
 * VisemeDriver - Controls avatar mouth shapes and idle animations
 * Maps viseme codes to SVG group visibility
 */

export interface VisemeDriver {
  show: (viseme: string) => void;
  idleStart: () => void;
  idleStop: () => void;
  dispose: () => void;
}

/**
 * Create a viseme driver for SVG avatar control
 */
export function createVisemeDriver(svgHost: HTMLElement): VisemeDriver {
  let idleInterval: NodeJS.Timeout | null = null;
  let blinkInterval: NodeJS.Timeout | null = null;
  let currentViseme: string = 'rest';
  
  // Find mouth element and viseme groups
  const mouthElement = svgHost.querySelector('#mouth');
  if (!mouthElement) {
    console.warn('No mouth element found in SVG');
  }
  
  // Get all viseme groups
  const visemeGroups: { [key: string]: Element | null } = {
    'MBP': svgHost.querySelector('#viseme-MBP'),
    'AI': svgHost.querySelector('#viseme-AI'),
    'E': svgHost.querySelector('#viseme-E'),
    'O': svgHost.querySelector('#viseme-O'),
    'U': svgHost.querySelector('#viseme-U'),
    'FV': svgHost.querySelector('#viseme-FV'),
    'L': svgHost.querySelector('#viseme-L'),
    'rest': svgHost.querySelector('#viseme-rest')
  };
  
  // Helper to hide all visemes
  const hideAllVisemes = () => {
    Object.values(visemeGroups).forEach(group => {
      if (group) {
        (group as HTMLElement).style.display = 'none';
      }
    });
  };
  
  // Helper to show specific viseme
  const showViseme = (viseme: string) => {
    hideAllVisemes();
    currentViseme = viseme;
    
    const group = visemeGroups[viseme] || visemeGroups['rest'];
    if (group) {
      (group as HTMLElement).style.display = 'inline';
    }
  };
  
  // Blink animation
  const blink = () => {
    const eyes = svgHost.querySelectorAll('#eye-left, #eye-right, #eyes');
    eyes.forEach(eye => {
      const el = eye as HTMLElement;
      // Quick scale animation to simulate blink
      el.style.transition = 'transform 0.1s ease-in-out';
      el.style.transform = 'scaleY(0.1)';
      setTimeout(() => {
        el.style.transform = 'scaleY(1)';
      }, 100);
    });
  };
  
  // Subtle movement animation
  const addSubtleMovement = () => {
    const head = svgHost.querySelector('#head, #avatar-main');
    if (head) {
      const el = head as HTMLElement;
      el.style.transition = 'transform 2s ease-in-out';
      const x = (Math.random() - 0.5) * 2; // -1 to 1
      const y = (Math.random() - 0.5) * 1; // -0.5 to 0.5
      el.style.transform = `translate(${x}px, ${y}px)`;
    }
  };
  
  // Start idle animations
  const idleStart = () => {
    // Stop any existing animations
    idleStop();
    
    // Show rest viseme
    showViseme('rest');
    
    // Start blink animation (every 2-4 seconds)
    blinkInterval = setInterval(() => {
      const delay = 2000 + Math.random() * 2000; // 2-4 seconds
      setTimeout(blink, delay);
    }, 4000);
    
    // Start subtle movement (every 3 seconds)
    idleInterval = setInterval(addSubtleMovement, 3000);
    
    // Initial blink and movement
    setTimeout(blink, 500);
    addSubtleMovement();
  };
  
  // Stop idle animations
  const idleStop = () => {
    if (blinkInterval) {
      clearInterval(blinkInterval);
      blinkInterval = null;
    }
    if (idleInterval) {
      clearInterval(idleInterval);
      idleInterval = null;
    }
    
    // Reset any transformations
    const head = svgHost.querySelector('#head, #avatar-main');
    if (head) {
      (head as HTMLElement).style.transform = '';
    }
    const eyes = svgHost.querySelectorAll('#eye-left, #eye-right, #eyes');
    eyes.forEach(eye => {
      (eye as HTMLElement).style.transform = '';
    });
  };
  
  // Cleanup
  const dispose = () => {
    idleStop();
    hideAllVisemes();
  };
  
  // Initialize with rest position
  showViseme('rest');
  
  return {
    show: showViseme,
    idleStart,
    idleStop,
    dispose
  };
}
