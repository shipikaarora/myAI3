// config.ts

import { openai } from "@ai-sdk/openai";
import { wrapLanguageModel, extractReasoningMiddleware } from "ai";

/* --------------------------------------------------------------------------
 * 1. MODEL CONFIGURATION
 * -------------------------------------------------------------------------- */

export const MODEL = openai("gpt-4.1");

// If later you want to use DeepSeek via Fireworks, uncomment:
// import { fireworks } from "@ai-sdk/fireworks";
// export const MODEL = wrapLanguageModel({
//   model: fireworks("fireworks/deepseek-r1-0528"),
//   middleware: extractReasoningMiddleware({ tagName: "think" }),
// });

/* --------------------------------------------------------------------------
 * 2. DATE & TIME HELPER
 * -------------------------------------------------------------------------- */

function getDateAndTime(): string {
  return new Date().toISOString();
}

export const DATE_AND_TIME = getDateAndTime();

/* --------------------------------------------------------------------------
 * 3. BRANDING & STATIC TEXT
 * -------------------------------------------------------------------------- */

export const AI_NAME = "Udyami";
export const OWNER_NAME = "Abhishek and Shipika";

/**
 * ❗ FIXED: Your previous WELCOME_MESSAGE had invalid JS syntax.
 * You MUST wrap a template string with backticks (`…`).
 */
export const WELCOME_MESSAGE = `Hello! I'm ${AI_NAME}.  
I will ask a few quick questions about your business and then suggest suitable MSME schemes and a document checklist.`;

/** Button label for clearing chat */
export const CLEAR_CHAT_TEXT = "New";

/* --------------------------------------------------------------------------
 * 4. MODERATION MESSAGES
 * -------------------------------------------------------------------------- */

export const MODERATION_DENIAL_MESSAGE_SEXUAL =
  "I can't discuss explicit sexual content. Please ask something else.";
export const MODERATION_DENIAL_MESSAGE_SEXUAL_MINORS =
  "I can't discuss anything involving minors in a sexual context. Please ask something else.";
export const MODERATION_DENIAL_MESSAGE_HARASSMENT =
  "I can't engage with harassing content. Please be respectful.";
export const MODERATION_DENIAL_MESSAGE_HARASSMENT_THREATENING =
  "I can't engage with threatening or harassing content. Please be respectful.";
export const MODERATION_DENIAL_MESSAGE_HATE =
  "I can't engage with hateful content. Please be respectful.";
export const MODERATION_DENIAL_MESSAGE_HATE_THREATENING =
  "I can't engage with threatening hate speech. Please be respectful.";
export const MODERATION_DENIAL_MESSAGE_ILLICIT =
  "I can't discuss illegal activities. Please ask something else.";
export const MODERATION_DENIAL_MESSAGE_ILLICIT_VIOLENT =
  "I can't discuss violent illegal activities. Please ask something else.";
export const MODERATION_DENIAL_MESSAGE_SELF_HARM =
  "I'm really sorry you're feeling this way, but I can't assist with self-harm. Please reach out to a mental health professional or crisis helpline.";
export const MODERATION_DENIAL_MESSAGE_SELF_HARM_INTENT =
  "I'm really sorry you're feeling this way, but I can't assist with self-harm. Please reach out to a mental health professional or crisis helpline.";
export const MODERATION_DENIAL_MESSAGE_SELF_HARM_INSTRUCTIONS =
  "I can't provide instructions for self-harm. Please reach out to a mental health professional or crisis helpline.";
export const MODERATION_DENIAL_MESSAGE_VIOLENCE =
  "I can't discuss violent content. Please ask something else.";
export const MODERATION_DENIAL_MESSAGE_VIOLENCE_GRAPHIC =
  "I can't discuss graphic violent content. Please ask something else.";
export const MODERATION_DENIAL_MESSAGE_DEFAULT =
  "Your message violates our guidelines. I can't answer that.";

/* --------------------------------------------------------------------------
 * 5. PINECONE CONFIGURATION
 * -------------------------------------------------------------------------- */

export const PINECONE_TOP_K = 20;
export const PINECONE_INDEX_NAME = "msme-schemes";

/* --------------------------------------------------------------------------
 * 6. USER PREFERENCES (UI / LANGUAGE / THEME / FEATURES)
 * -------------------------------------------------------------------------- */

export const DEFAULT_PREFERENCES = {
  language: "en" as "en" | "hi" | "hinglish",
  theme: "warm" as "warm" | "cool" | "high-contrast",
  showTooltips: true,
  enableSound: true,
  enableAnimations: true,
};

export type Preferences = typeof DEFAULT_PREFERENCES;

/* --------------------------------------------------------------------------
 * 7. DEFAULT USER PROFILE (used in the Profile Modal)
 * -------------------------------------------------------------------------- */

export const DEFAULT_USER_PROFILE = {
  businessName: "",
  ownerName: "",
  location: "",
  sector: "",
  turnover: "",
  employees: "",
  registrationStatus: "", // Udyam registered? GST registered?
};

/* --------------------------------------------------------------------------
 * 8. DISCLAIMER TEXT
 * -------------------------------------------------------------------------- */

export const DISCLAIMER_TEXT = `This chatbot provides informational guidance based on MSME rules, 
government schemes, and general documentation processes.  
It does not replace official government notifications or professional legal/financial advice.`;

/* --------------------------------------------------------------------------
 * 9. SCHEME CATEGORIES (Used in floating navigator)
 * -------------------------------------------------------------------------- */

export const SCHEME_CATEGORIES = [
  "PMEGP",
  "CGTMSE",
  "CLCSS",
  "MSE-CDP",
  "TEQUP",
  "SIDBI Schemes",
  "State-Level Schemes",
];
