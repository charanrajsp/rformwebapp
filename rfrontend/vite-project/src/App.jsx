import RequisitionForm from './components/RequisitionForm.jsx';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ApprovalPanel from "./pages/Approvalpanel.jsx";


import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RequisitionForm />} />
        <Route path="/approval" element={<ApprovalPanel />} />
      </Routes>
    </Router>
  );
}


export default App
