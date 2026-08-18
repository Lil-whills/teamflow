/**
 * Helper to get 2-letter uppercase initials for any name.
 * e.g. "Williams" -> "WI", "Crispen" -> "CR", "Joshua" -> "JO", "Alice" -> "AL"
 */
export const getInitials = (name) => {
  if (!name) return 'TF';
  const clean = name.trim();
  const parts = clean.split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return clean.substring(0, 2).toUpperCase();
};

/**
 * Deterministic color pairing based on name for consistent visual styling
 */
export const getAvatarStyle = (name) => {
  const styles = [
    { bg: '#0e7490', text: '#ecfeff', border: '#155e75' }, // Teal
    { bg: '#c2410c', text: '#fff7ed', border: '#9a3412' }, // Amber / Warm Orange
    { bg: '#6b21a8', text: '#faf5ff', border: '#581c87' }, // Purple
    { bg: '#be123c', text: '#fff1f2', border: '#9f1239' }, // Rose
    { bg: '#0369a1', text: '#f0f9ff', border: '#075985' }, // Sky
    { bg: '#047857', text: '#ecfdf5', border: '#065f46' }, // Emerald
    { bg: '#4338ca', text: '#eef2ff', border: '#3730a3' }, // Indigo
    { bg: '#b45309', text: '#fffbeb', border: '#92400e' }  // Bronze / Gold
  ];

  if (!name) return styles[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % styles.length;
  return styles[index];
};
