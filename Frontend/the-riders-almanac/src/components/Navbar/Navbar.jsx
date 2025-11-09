import './Navbar.css';
import { NavLink } from "react-router-dom";
import logo from "../../assets/logo.png";
import { Sling as Hamburger } from "hamburger-react";
import { useState, useRef, useEffect } from 'react';
const Navbar = () => {
    const [isNavOpen, setNavOpen] = useState(false);
    const mobileNavRef = useRef(null);

    const hamburgerRef = useRef(null);

    useEffect(() => {
        const handleOffNavClick = (event) => {
            if (
                isNavOpen &&
                mobileNavRef.current &&
                !mobileNavRef.current.contains(event.target) &&
                hamburgerRef.current &&
                !hamburgerRef.current.contains(event.target)

            ) {
                setNavOpen(false);
            }


        };

        document.addEventListener("mousedown", handleOffNavClick);
        return () => {
            document.removeEventListener("mousedown", handleOffNavClick);

        };
    }, [isNavOpen]);

    return (
        <>
            {/*navbar for tablets and mobiles*/}
            <nav className="navbar">
                <div className="navbar-container">

                    <div className="hamBurger" ref={hamburgerRef}>
                        <Hamburger toggled={isNavOpen} toggle={setNavOpen} size={24} color="white" />
                    </div>

                    <div className="navlogocontainer">
                        <NavLink to="/">
                            <img className="navlogo" src={logo} alt="Logo" />
                        </NavLink>
                    </div>

                    {/*my original desktop nav */}
                    <div className="navbar-links forDesktop">

                        <NavLink to="/home" className="navbuttonleft">

                            Home

                        </NavLink>
                        <NavLink to="/events" className="navbuttonleft">

                            Events

                        </NavLink>
                        <div className="spacebetween"></div>

                        <NavLink to="/resources" className="navbuttonright">

                            Resources

                        </NavLink>

                        <NavLink to="/contact-us" className="navbuttonright">

                            Contact Us

                        </NavLink>
                    </div>
                </div>

                <div ref={mobileNavRef}
                    className={`mobilenav ${isNavOpen ? "open" : ""}`}>
                    <hr className="mobilenavhr" />
                    <NavLink to="/home" className="mobnavbut" onClick={() => setNavOpen(false)}>Home</NavLink>
                    <NavLink to="/events" className="mobnavbut"  onClick={() => setNavOpen(false)}>Events</NavLink>
                    <NavLink to="/resources" className="mobnavbut"  onClick={() => setNavOpen(false)}>Resources</NavLink>
                    <NavLink to="/contact-us" className="mobnavbut"  onClick={() => setNavOpen(false)}>Contact</NavLink>
                </div>
            </nav>
        </>
    );
};

export default Navbar;