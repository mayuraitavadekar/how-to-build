import { useEffect, useState } from 'react';
import App, { GlobalDefs } from './App';
import { Home } from './Home';

/** Tiny hash router: #/ = home, #/build = builder, #/build/7 = builder at step 8. */
function parse(hash: string): { page: 'home' | 'build'; step?: number } {
  const m = hash.match(/^#\/build(?:\/(\d+))?/);
  if (!m) return { page: 'home' };
  return { page: 'build', step: m[1] !== undefined ? Number(m[1]) : undefined };
}

export default function Root() {
  const [route, setRoute] = useState(() => parse(window.location.hash));

  useEffect(() => {
    const on = () => setRoute(parse(window.location.hash));
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);

  useEffect(() => {
    document.title = route.page === 'home' ? 'PC Build Academy · Learn to build a PC' : 'Builder · PC Build Academy';
  }, [route.page]);

  return (
    <>
      <GlobalDefs />
      {route.page === 'home' ? (
        <Home onStart={(step) => (window.location.hash = step === undefined ? '#/build' : `#/build/${step}`)} />
      ) : (
        <App key={route.step ?? 'build'} startStep={route.step} onHome={() => (window.location.hash = '#/')} />
      )}
    </>
  );
}
