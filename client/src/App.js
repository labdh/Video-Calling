import './App.css';
import Video from './pages/Video';
import {Route, Routes, BrowserRouter as Router} from "react-router-dom"


function App() {


  return (
    <Router>
      <Routes>
      <Route path="/" element={<Video />} />
      <Route path="/:room" element={<Video />} />
    </Routes>
    </Router>
  );
}

export default App;
