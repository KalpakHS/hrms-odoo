import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { IntroAnimation } from './components/IntroAnimation';
import { Home } from './pages/Home';

function App() {
  const [showIntro, setShowIntro] = useState(true);

  return (
    <>
      <AnimatePresence mode="wait">
        {showIntro ? (
          <IntroAnimation key="intro" onComplete={() => setShowIntro(false)} />
        ) : (
          <Home key="home" />
        )}
      </AnimatePresence>
    </>
  );
}

export default App;
