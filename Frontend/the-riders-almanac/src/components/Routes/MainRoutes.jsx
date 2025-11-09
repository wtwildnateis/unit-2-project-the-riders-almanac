import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import Home from '../../pages/home';
import Events from '../../pages/events';
import Resources from '../../pages/resources';
import Contact from '../../pages/contact';
import Footer from "../Footer/Footer";
import LoginPage from '../../pages/login';
import RegisterPage from '../../pages/register';
//import ProtectedRoute from './ProtectedRoute';
//import ForumList from '../../pages/forum-list';
//import ForumPost from '../../pages/forum-post';
//import AdminUsers from '../../pages/admin-users';
//import ModTools from '../../pages/mod-tools';
import { useEffect } from 'react';

const MainRoutes = () => {
    const location = useLocation();
    const fromTitle = location.state?.fromTitle;
    const isHome = location.pathname === "/home";

    useEffect(() => {
        if (fromTitle && isHome) {
            const timer = setTimeout(() => {
                window.history.replaceState({}, document.title);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [fromTitle, isHome]);


    const showNavbar = location.pathname !== "/";

    return (
        <>

            {showNavbar && (
                < header className="navbarfade" style={{ zIndex: '10000' }}>
                    <Navbar />
                </header>
            )}
            <main>
                <section className="universalpagecontainer pagefadein" style={{ zIndex: 0 }} key={location.pathname}>
                    <Routes>
                        <Route
                            path="/home"
                            element={
                                <div className={`fade-wrapper ${fromTitle ? "fade-in" : ""}`}>
                                    <Home />
                                </div>
                            }
                        />

                        <Route path="/events" element={<Events />} />
                        <Route path="/resources" element={<Resources />} />
                        <Route path="/contact-us" element={<Contact />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        
                    </Routes>
                </section>
            </main>


            <Footer />
        </>
    );
};

export default MainRoutes;
