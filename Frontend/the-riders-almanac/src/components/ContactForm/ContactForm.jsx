import { useState } from "react";
import emailjs from "@emailjs/browser";
import Button from "../Button/Button";

const ContactForm = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });

    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const validateEmail = (email) => {
        return /^\S+@\S+\.\S+$/.test(email)
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        //user validation
        if (!formData.name.trim()) {
            setError("Name is required!");
            return;
        }

        if (!formData.email.trim() || !validateEmail(formData.email)) {
            setError("A vlaid email is required!");
            return;
        }

        try {
            const result = await emailjs.send(
                import.meta.env.VITE_EMAILJS_SERVICE_ID,
                import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
                formData,
                import.meta.env.VITE_EMAILJS_PUBLIC_KEY
            );
            setSubmitted(true);
        } catch (err) {
            setError("Something went wrong. Please try again later.");
        }
    };

    if (submitted) {
        return (
            <div className="thank-you-message">
                <h2>Your message was sent!</h2>
                <p>We'll be in contact soon!</p>
            </div>
        );
    }

    return (

        <>
            <div className="modalstyle" style= {{marginTop: '30px', width: '60%', height: '100%', overflow: 'hidden'}}>
                <h2 style= {{textAlign: 'center', marginBottom: '-1px'}}> Contact Us</h2>

                <hr style={{width: '60%', margin: '5px auto'}}/>

                <form className="contact-form" onSubmit={handleSubmit} noValidate>

                    {error && <p className="error">{error}</p>}

                    <label>
                        Name:
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter your name.."
                            required
                        />
                    </label>

                    <label>
                        Email:
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email.."
                            required
                        />
                    </label>

                    <label>
                        Why Are You Reaching Out:
                        <input
                            type="text"
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            placeholder="Enter a subject.."
                        />
                    </label>

                    <label>
                        Your Message:
                        <textarea
                            name="message"
                            rows="5"
                            value={formData.message}
                            onChange={handleChange}
                            placeholder="Slide into our dm's!"
                            required
                        ></textarea>
                    </label>

                    <Button type="submit">Send Message</Button>
                </form>
            </div>
        </>
    );
};

export default ContactForm;