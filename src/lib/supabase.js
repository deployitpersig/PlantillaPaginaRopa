import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kusvojmbbmwurxuidbce.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1c3Zvam1iYm13dXJ4dWlkYmNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyOTU3NzQsImV4cCI6MjA4OTg3MTc3NH0.8FU8AjMPulLPYjOanC7T9Epu1YUm5VDLNTWQJfKga7A';

export const supabase = createClient(supabaseUrl, supabaseKey);
