import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import TitleToHomeSlider from './components/TitlePageSlider/TitleToHomeSlider';
import MainRoutes from './components/Routes/MainRoutes';

function AppRoutes() {
  const location = useLocation();

  return (
    <Routes>
      <Route path="/" element={<TitleToHomeSlider />} />
      <Route path="*" element={<MainRoutes />} />

    </Routes>
  );
}

function App() {

  return (
    <>
        <Router>
          <AppRoutes />
        </Router>

    </>
  );
}

export default App;
