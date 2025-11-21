import { useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { initSession } from '@/app/store/slices/auth-slice';
import { getSupabaseClient } from '@/shared/lib/supabase-client';
import {
  selectAuthStatus,
  selectUser
} from '@/app/store/slices/auth-slice/selectors';
import { fetchLensesForUser } from '@/app/store/slices/lens-management-slice/slice';

export const SessionProvider = ({
  children
}: {
  children: React.ReactNode;
}) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const status = useAppSelector(selectAuthStatus);
  const [ready, setReady] = useState(false);
  const didInitRef = useRef(false);

  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;
    const supabase = getSupabaseClient();
    // Mark ready only after receiving INITIAL_SESSION from Supabase
    const { data: subscription } = supabase.auth.onAuthStateChange((event) => {
      dispatch(initSession());
      // INITIAL_SESSION fires once on mount; if no session, we should still mark ready
      if (event === 'INITIAL_SESSION') {
        setReady(true);
      }
    });
    // Kick off an initial session sync as well
    dispatch(initSession());
    return () => {
      subscription.subscription.unsubscribe();
    };
  }, [dispatch]);

  // Load lenses when user session is available
  useEffect(() => {
    if (user?.id) {
      dispatch(fetchLensesForUser({ userId: user.id }));
    }
  }, [user?.id, dispatch]);

  // In case INITIAL_SESSION event is missed (edge), fallback on status change
  if (!ready && status !== 'authenticating') {
    setReady(true);
  }

  return <>{children}</>;
};
