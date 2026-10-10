
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ReportItem from "./pages/ReportItem";
import MyReports from "./pages/MyReports";
import Admin from "./pages/Admin";
import ItemDetails from "./pages/ItemDetails";
import Notifications from "./pages/Notifications";
import Sidebar from "./components/Sidebar";
import MyClaims from "./pages/MyClaims";

function App() {
  return (
    <BrowserRouter>
     <Navbar />
<Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/report" element={<ReportItem />} />
        <Route path="/my-reports" element={<MyReports />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/item/:id" element={<ItemDetails />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/my-claims" element={<MyClaims />} />
          </Routes>
    </BrowserRouter>
  );
}

export default App;