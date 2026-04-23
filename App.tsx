
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { TAOB } from './pages/TAOB';
import { ScrollRestoration } from './components/ScrollRestoration';
import { useTracker } from './hooks/useTracker';

const App: React.FC = () => {
  useTracker();
  
  return (
    <Router>
      <ScrollRestoration />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/taob" element={<TAOB />} />
      </Routes>
    </Router>
  );
};

export default App;
