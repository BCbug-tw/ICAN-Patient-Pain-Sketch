import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import SelectCharts from './pages/SelectCharts';
import Detail from './pages/Detail';
import Summary from './pages/Summary';
import Header from './components/Header';
import { useState, useEffect } from 'react';

function App() {
  const [sessionData, setSessionData] = useState({
    patientId: '', // MRN
    fullName: '',
    dob: '',
    date: new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Taipei' }), // YYYY-MM-DD for date input
    selectedCharts: [], // Array of selected chart IDs
    chartImages: {} // Map of chartId -> Data URL
  });
  const [debugLog, setDebugLog] = useState([]);

  useEffect(() => {
    const handleErr = (e) => setDebugLog(prev => [...prev, e.message || String(e)]);
    window.addEventListener('error', handleErr);
    window.addEventListener('unhandledrejection', (e) => handleErr(e.reason));
    return () => {
      window.removeEventListener('error', handleErr);
      window.removeEventListener('unhandledrejection', handleErr);
    }
  }, []);

  return (
    <Router>
      <Header />
      <div className="bg-light min-vh-100 py-4">
        {debugLog.length > 0 && (
          <div className="container mb-3 p-3 bg-danger text-white rounded">
            <strong>Debug Log:</strong>
            {debugLog.map((log, i) => <div key={i}>{String(log)}</div>)}
          </div>
        )}
        <Routes>
          <Route path="/" element={<Home sessionData={sessionData} setSessionData={setSessionData} />} />
          <Route 
            path="/select" 
            element={<SelectCharts sessionData={sessionData} setSessionData={setSessionData} />} 
          />
          <Route 
            path="/detail" 
            element={<Detail sessionData={sessionData} setSessionData={setSessionData} />} 
          />
          <Route 
            path="/summary" 
            element={<Summary sessionData={sessionData} setSessionData={setSessionData} />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
