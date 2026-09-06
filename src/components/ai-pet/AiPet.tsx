import { Sparkles } from 'lucide-react';
import { PET_ASSETS } from './aiPetAssets';
import type { PetState } from './aiPetState';
export function AiPet({ state, onOpen }: { state: PetState; onOpen: () => void }) { return <button type="button" onClick={onOpen} aria-label="Open AVENQUIS AI companion" className="fixed bottom-5 right-5 z-40 rounded-2xl bg-white/95 p-1 shadow-xl ring-1 ring-[#D8E5DF] transition-transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#C58A3E] sm:bottom-7 sm:right-7"><img src={PET_ASSETS[state]} alt="AVENQUIS AI Pet" className="h-14 w-14 object-contain sm:h-16 sm:w-16" /><span className="absolute -right-1 -top-1 rounded-full bg-[#113227] p-1 text-[#E9C882]"><Sparkles className="h-3 w-3" /></span></button>; }
