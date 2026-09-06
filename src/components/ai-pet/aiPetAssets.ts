import type { PetState } from './aiPetState';
const IDLE = '/assets/ai-pet/idle.png';
export const PET_ASSETS: Record<PetState, string> = { IDLE, THINKING: '/assets/ai-pet/thinking.png', WORKING: '/assets/ai-pet/working.png', SUCCESS: '/assets/ai-pet/success.png', ALERT: IDLE, CONFUSED: '/assets/ai-pet/thinking.png', ERROR: IDLE, SLEEPING: IDLE };
