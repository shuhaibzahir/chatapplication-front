// Generate color from string (username)
export const stringToColor = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Generate HSL color with fixed saturation and lightness for readability
  const h = Math.abs(hash % 360);
  const s = 75; // High saturation for vibrant colors
  const l = 60; // Medium lightness for readability
  
  return `hsl(${h}, ${s}%, ${l}%)`;
};

// Get initials from name
export const getInitials = (name: string): string => {
  if (!name) return '?';
  
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

// Generate avatar data for a user
export const generateAvatar = (username: string) => {
  const color = stringToColor(username);
  const initials = getInitials(username);
  
  return { color, initials };
};