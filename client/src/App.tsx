import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import TrendingVideos from './pages/TrendingVideos';
import Analytics from './pages/Analytics';
import Search from './pages/Search';
import Dataset from './pages/Dataset';

function App() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/trending" element={<TrendingVideos />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/search" element={<Search />} />
          <Route path="/dataset" element={<Dataset />} />
        </Routes>
      </Box>
    </Box>
  );
}

export default App;
