export type SessionStatus =
  | 'gathering_prefs'
  | 'confirmed'
  | 'cooking'
  | 'completed'
  | 'abandoned';

export type IngredientStatus = 'pending' | 'added';

export type StepStatus = 'pending' | 'active' | 'completed';

export type NoteType =
  | 'tip'
  | 'substitution'
  | 'preference'
  | 'warning'
  | 'joke_fact';

export interface CookingSession {
  id: string;
  userId: string;
  dishName: string;
  status: SessionStatus;
  currentStep: number;
  totalSteps: number;
  createdAt: string;
  updatedAt: string;
}

export interface Ingredient {
  id: string;
  sessionId: string;
  name: string;
  quantity: string;
  unit: string;
  status: IngredientStatus;
  sortOrder: number;
}

export interface Step {
  id: string;
  sessionId: string;
  stepNumber: number;
  instruction: string;
  durationMinutes: number | null;
  status: StepStatus;
  startedAt: string | null;
  completedAt: string | null;
}

export interface Note {
  id: string;
  sessionId: string;
  content: string;
  noteType: NoteType;
  createdAt: string;
}

export interface SessionWithDetails extends CookingSession {
  ingredients: Ingredient[];
  steps: Step[];
}

export interface SessionsResponse {
  sessions: CookingSession[];
}

export interface SessionResponse {
  session: SessionWithDetails;
}

export interface NotesResponse {
  notes: Note[];
}

export interface CreateSessionResponse {
  session: CookingSession;
}
