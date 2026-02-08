import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import{ context } from './context/DataContext';
import axiosBase from "./AxiosConfig";
import ProtectedLayout from './routes/ProtectedRoute';
import QuestionDetail from './pages/QuestionDetail'
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AskQuestion from './pages/AskQuestion';
import Campus from './pages/Campus';
import Department from './pages/Departments';
import MyQuestions from './pages/MyQuestions';
import CategoryDetail from './pages/CategoryDetail';
import AdminDashboard from './pages/AdminDashboard';
import './App.css'
function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
     useEffect(() => {
    const storedToken = localStorage.getItem("token");

    if (!storedToken) {
      setLoading(false);
      return;
    }

    async function checkUser() {
      try {
        const { data } = await axiosBase.get("/users/check-user", {
          headers: { Authorization: `Bearer ${storedToken}` },
        });
 
        setUser(data.username);
        setToken(storedToken);
        setRole(data.role); 
      } catch (err) {
        localStorage.clear();
        setUser(null);
        setToken(null);
        setRole(null);
      } finally {
        setLoading(false);
      }
    }

    checkUser();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
  
    <context.Provider value = {{user, setUser, token, setToken, 
      role, setRole, loading
    }}>
      <Routes>
          { /* 🌐 Public */ }
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
         {/* 🔐 Protected with Navbar */}
       <Route element={<ProtectedLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/ask-question" element={<AskQuestion />} />
          <Route path="/question/:id" element={<QuestionDetail />} />
          
          <Route path="/campus" element={<Campus />} />
          <Route path="/campus/:id" element={<CategoryDetail type="campus" />} />
          <Route path="/my-questions" element={<MyQuestions />} />
          <Route path="/department" element={<Department />} />
          <Route path="/department/:id" element={<CategoryDetail type="department" />} />

          {/* 🛡️ Admin Dashboard Route */}
          <Route 
            path="/admin" 
            element={role === 'admin' ? <AdminDashboard /> : <Navigate to="/" />} 
          />
        </Route>
      </Routes>
    </context.Provider>
  )
}
export default App
