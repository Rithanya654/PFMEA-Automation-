import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import IntroductionPage from './components/IntroductionPage';
import PFMEAAnalysisForm from './components/PFMEAAnalysisForm';
import ResultsPage from './components/ResultsPage';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('intro');
  const [results, setResults] = useState(null);

  const handleFormSubmit = (resultsData) => {
    setResults({
      ...resultsData,
      showHtml: false
    });
    setCurrentPage('results');
  };

  const handleToggleHtmlPreview = () => {
    setResults(prev => ({
      ...prev,
      showHtml: !prev.showHtml
    }));
  };

  const handleNewAnalysis = () => {
    setResults(null);
    setCurrentPage('intro');
  };

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -30 },
  };

  const pageTransition = {
    duration: 0.6,
    ease: 'easeInOut'
  };

  return (
    <div className="App">
      <AnimatePresence mode="wait">
        {currentPage === 'intro' && (
          <motion.div
            key="intro"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            transition={pageTransition}
          >
            <IntroductionPage onStart={() => setCurrentPage('form')} />
          </motion.div>
        )}

        {currentPage === 'form' && (
          <motion.div
            key="form"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            transition={pageTransition}
          >
            <PFMEAAnalysisForm 
              onSubmit={handleFormSubmit} 
              onBack={() => setCurrentPage('intro')}
            />
          </motion.div>
        )}

        {currentPage === 'results' && results && (
          <motion.div
            key="results"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            transition={pageTransition}
          >
            <ResultsPage 
              results={results} 
              onNewAnalysis={handleNewAnalysis}
              onToggleHtml={handleToggleHtmlPreview}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
