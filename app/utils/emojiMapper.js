/**
 * Semantic emoji mapper for activities and challenges
 * Intelligently assigns context-specific emojis based on activity titles
 * Includes typo normalization and fallback to local rules if API doesn't return emoji
 */

export function getAccurateEmoji(activityTitle = "", currentEmoji = "") {
  // If emoji is specific (not generic/placeholder), keep it
  const isGeneric = !currentEmoji || currentEmoji === "✨" || currentEmoji === "🌟" || currentEmoji === "🎯";
  if (!isGeneric) return currentEmoji;

  // Normalize title: lowercase and remove diacritics (handles typos like scrackbook vs scrapbook)
  const normalizedTitle = activityTitle
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();

  // Semantic rules with keyword matching
  const rules = [
    { keywords: ["scrackbook", "scrapbook", "recortar", "papel", "tijera", "collage", "corte"], emoji: "✂️" },
    { keywords: ["manualidad", "costura", "tejer", "hilo", "crochet", "punto", "aguja"], emoji: "🧵" },
    { keywords: ["pintar", "dibujar", "pincel", "arte", "acuarela", "oleo", "lienzo"], emoji: "🎨" },
    { keywords: ["cine", "pelicula", "serie", "maraton", "ver tv", "netflix"], emoji: "🎬" },
    { keywords: ["cafe", "cafeteria", "te", "infusion", "bebida", "tomar algo"], emoji: "☕" },
    { keywords: ["dulce", "golosina", "chocolate", "postre", "caramelo", "helado"], emoji: "🍬" },
    { keywords: ["cocinar", "hornear", "receta", "comida", "preparar", "cocina"], emoji: "🧑‍🍳" },
    { keywords: ["skincare", "piel", "crema", "maquillaje", "rutina", "facial", "belleza"], emoji: "💄" },
    { keywords: ["yoga", "estirar", "meditar", "relax", "relajacion", "meditacion"], emoji: "🧘‍♀️" },
    { keywords: ["caminar", "pasear", "ejercicio", "aire libre", "parque", "caminata"], emoji: "🚶‍♀️" },
    { keywords: ["leer", "libro", "lectura", "novela", "cuento", "poesia"], emoji: "📖" },
    { keywords: ["musica", "cantar", "bailar", "playlist", "concierto", "ritmo"], emoji: "🎵" },
    { keywords: ["jugar", "videojuego", "juego", "gaming"], emoji: "🎮" },
    { keywords: ["fotografiar", "foto", "fotografia"], emoji: "📸" },
    { keywords: ["floración", "flores", "plantas", "jardin", "jardineria"], emoji: "🌸" },
    { keywords: ["masaje", "spa", "relajar"], emoji: "💆‍♀️" },
    { keywords: ["amiga", "amigo", "amigas", "tiempo con amigos", "reunir"], emoji: "👯‍♀️" },
  ];

  // Find first matching rule
  for (const rule of rules) {
    if (rule.keywords.some(keyword => normalizedTitle.includes(keyword))) {
      return rule.emoji;
    }
  }

  // Fallback emoji if no match
  return "🎯";
}
