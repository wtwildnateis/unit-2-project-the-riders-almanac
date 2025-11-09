import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Title from "../../pages/title";
import './TitleToHomeSlider.css';

function TitleToHomeSLider() {
    const [animateOut, setAnimateOut] = useState(false);
    const navigate = useNavigate();

    const handleTitleClick = () => {
        setAnimateOut(true);

        setTimeout(() => {
            navigate("/home", { state: { fromTitle: true } });
        }, 1000);

    };

    return (
        <div className="titletohomecontainer">
            <div
                className={`title-wrapper ${animateOut ? "slide-up" : ""}`}
                onClick={handleTitleClick}>
                <Title />
            </div>
        </div>
    );
}

export default TitleToHomeSLider;