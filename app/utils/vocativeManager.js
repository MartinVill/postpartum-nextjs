/**
 * Vocative Manager: Dynamic name/nickname rotation for natural, warm AI interactions
 * Implements 60/30/10 rule: 60% real name, 30% nickname, 10% no vocative
 */

/**
 * Select a vocative term (name or nickname) based on frequency rules
 * @param {string} realName - User's real name
 * @param {Array<string>} nicknames - Array of user's preferred nicknames
 * @returns {string} Selected vocative or empty string
 */
export function selectVocative(realName = 'hermosa', nicknames = []) {
  const random = Math.random() * 100;

  // 60% chance: use real name
  if (random < 60) {
    return realName;
  }

  // 30% chance: use nickname (if available)
  if (random < 90 && nicknames && nicknames.length > 0) {
    return nicknames[Math.floor(Math.random() * nicknames.length)];
  }

  // 10% chance: no vocative
  return '';
}

/**
 * Get the primary nickname (first choice from array)
 * @param {Array<string>} nicknames
 * @returns {string} Primary nickname or empty string
 */
export function getPrimaryNickname(nicknames = []) {
  return nicknames && nicknames.length > 0 ? nicknames[0] : '';
}

/**
 * Format a greeting with dynamic vocative
 * @param {string} template - Template with ${vocative} placeholder
 * @param {string} realName - User's real name
 * @param {Array<string>} nicknames - Array of nicknames
 * @returns {string} Formatted greeting
 */
export function formatGreetingWithVocative(template = 'Hola, ${vocative}', realName = 'hermosa', nicknames = []) {
  const vocative = selectVocative(realName, nicknames);
  return template.replace('${vocative}', vocative).replace(/,\s*$/, vocative ? ',' : '');
}

/**
 * Build a contextualized system prompt with user identification
 * Includes vocative frequency rules
 * @param {string} basePrompt - Base system prompt
 * @param {string} realName - User's real name
 * @param {Array<string>} nicknames - Array of nicknames
 * @returns {string} Enhanced system prompt
 */
export function buildContextualizedPrompt(basePrompt = '', realName = '', nicknames = []) {
  const primaryNickname = getPrimaryNickname(nicknames);

  const userContext = `USER IDENTIFICATION RULES:
- User Real Name: ${realName || 'Unknown'}
- User Preferred Nickname(s): ${primaryNickname || 'None'}

VOCATIVE DYNAMICS & FREQUENCY RULE (60/30/10):
- 60% of the time: Address the user by her real name ("${realName}") naturally in conversation.
- 30% of the time: Use her chosen nickname ("${primaryNickname || 'Reina'}") especially during moments of:
  * Praise or celebration (e.g., "¡Lo hiciste genial hoy, ${primaryNickname || 'Reina'}!")
  * Empathetic support (e.g., "Tómate una pausa, ${primaryNickname || 'Reina'}")
  * Milestone completion (e.g., "Muy bien, ${primaryNickname || 'Reina'}!")
- 10% of the time: Omit vocatives entirely for conversational variety and natural rhythm.
- CRITICAL: Never repeat the nickname or name back-to-back in consecutive sentences. It must feel organic, warm, and human—like a supportive friend, not a chatbot.
- TONE: Be warm, encouraging, and authentic. Vary your expressions naturally.`;

  return `${basePrompt}\n\n${userContext}`;
}

/**
 * Get a random greeting that uses vocative naturally
 * @param {string} realName - User's real name
 * @param {Array<string>} nicknames - User's nicknames
 * @returns {object} Object with greeting templates
 */
export function getRandomGreetings(realName = 'hermosa', nicknames = []) {
  const greetingTemplates = [
    '¡Hola, ${vocative}! ✨',
    '¡Qué bueno verte, ${vocative}! 💜',
    '¡Bienvenida, ${vocative}! 🌸',
    '${vocative}, ¡qué alegría verte por aquí! 💕',
    '¡Hola de nuevo, ${vocative}! 🌙'
  ];

  const selectedTemplate = greetingTemplates[Math.floor(Math.random() * greetingTemplates.length)];
  const vocative = selectVocative(realName, nicknames);

  return {
    greeting: selectedTemplate.replace('${vocative}', vocative).trim(),
    vocative
  };
}
