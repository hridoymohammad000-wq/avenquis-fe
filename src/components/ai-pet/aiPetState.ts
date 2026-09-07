export const PET_STATES = ['IDLE', 'THINKING', 'WORKING', 'SUCCESS', 'ALERT', 'CONFUSED', 'ERROR', 'SLEEPING'] as const;
export type PetState = typeof PET_STATES[number];
