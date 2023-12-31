'use client';

// routes
import { useRouter } from 'src/routes/hook';
import { paths } from 'src/routes/paths';
//
import { SplashScreen } from '@components/loading-screen';
import { getUser } from '@utils/storage-available';
import { useWeb3React } from '@web3-react/core';
import { useCallback, useEffect, useState } from 'react';
import useAuthStore from 'src/store/auths';

// ----------------------------------------------------------------------

const loginPaths: Record<string, string> = {
  jwt: paths.auth.login,
};

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export default function AuthGuard({ children }: Props) {
  const router = useRouter();
  const authenticated = useAuthStore((state) => state.isAuthenticated);
  const initialized = useAuthStore((state) => state.isInitialized);
  // const user = useAuthStore((state) => state.user);
  const { isActivating } = useWeb3React();
  const [checked, setChecked] = useState(false);
  const user = getUser();
  const check = useCallback(() => {
    if (!authenticated) {
      const searchParams = new URLSearchParams({ returnTo: window.location.pathname }).toString();

      const loginPath = loginPaths.jwt;

      const href = `${loginPath}?${searchParams}`;

      router.replace(href);
    } else {
      setChecked(true);
    }
  }, [authenticated, router]);

  useEffect(() => {
    check();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!checked) {
    return null;
  }
  if (isActivating && !initialized) {
    return <SplashScreen />;
  }
  return <>{children}</>;
}
