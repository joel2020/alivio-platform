import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle2, HelpCircle, Star, ThumbsDown, CalendarCheck } from 'lucide-react';
import { supabaseFunctionsUrl } from '../../lib/supabase';

// (rest unchanged until endpoint)

const endpoint = useMemo(() => {
  if (!token || !supabaseFunctionsUrl) return null;
  return `${supabaseFunctionsUrl}/client-shortlist-public?token=${encodeURIComponent(token)}`;
}, [token]);
