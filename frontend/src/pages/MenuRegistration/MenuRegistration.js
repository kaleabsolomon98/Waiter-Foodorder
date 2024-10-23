import './MenuRegistration.css';
import { useState } from "react";
// import {validateEmail} from "../src/utils"; 

const PasswordErrorMessage = () => {
    return (
        <p className="FieldError">Password should have at least 8 characters</p>
    );
};

function MenuRegistration() {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState({
        value: "",
        isTouched: false,
    });
    const [role, setRole] = useState("role");
    const [isFridgeItem, setIsFridgeItem] = useState("");

    const getIsFormValid = () => {
        return (
            firstName &&
            //  validateEmail(email) && 
            // password.value.length >= 8 &&
            role !== "role"
        );
    };

    const clearForm = () => {
        setFirstName("");
        setLastName("");
        setEmail("");
        setPassword({
            value: "",
            isTouched: false,
        });
        setRole("role");
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        alert("Account created!");
        clearForm();
    };

    return (
        <div className="App">
            <form onSubmit={handleSubmit}>
                <fieldset>
                    <h2 className='h2'>Add New Menu</h2>
                    <div className="Field">
                        <label>
                            Select Printer <sup>*</sup>
                        </label>
                        <select value={role} onChange={(e) => setRole(e.target.value)}>
                            <option value="role">Role</option>
                            <option value="individual">Individual</option>
                            <option value="business">Business</option>
                        </select>
                    </div>
                    <div className="Field">
                        <label>Is Fridge Item?</label>
                        <div className='RadioButton'>
                            <label>
                                <input
                                    type="radio"
                                    value="yes"
                                    checked={isFridgeItem === "yes"}
                                    onChange={() => setIsFridgeItem("yes")}
                                />
                                Yes
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    value="no"
                                    checked={isFridgeItem === "no"}
                                    onChange={() => setIsFridgeItem("no")}
                                />
                                No
                            </label>
                        </div>
                    </div>
                    <div className="Field">
                        <label>
                            Category <sup>*</sup>
                        </label>
                        <select value={role} onChange={(e) => setRole(e.target.value)}>
                            <option value="role">Role</option>
                            <option value="individual">Individual</option>
                            <option value="business">Business</option>
                        </select>
                    </div>
                    <div className="Field">
                        <label>
                            Sub Category
                        </label>
                        <select value={role} onChange={(e) => setRole(e.target.value)}>
                            <option value="role">Role</option>
                            <option value="individual">Individual</option>
                            <option value="business">Business</option>
                        </select>
                    </div>
                    <div className="Field">
                        <label>
                            Menu Name <sup>*</sup>
                        </label>
                        <input
                            value={firstName}
                            onChange={(e) => {
                                setFirstName(e.target.value);
                            }}
                            placeholder="Menu name"
                        />
                    </div>
                    <div className="Field">
                        <label>
                            Price  <sup>*</sup>
                        </label>
                        <input
                            value={lastName}
                            onChange={(e) => {
                                setLastName(e.target.value);
                            }}
                            placeholder="Price"
                        />
                    </div>
                    <div className="Field">
                        <label>
                            Description
                        </label>
                        <input
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                            }}
                            placeholder="Description"
                        />
                    </div>
                    <button type="submit" disabled={!getIsFormValid()}>
                        Create account
                    </button>
                </fieldset>
            </form>
        </div>
    );
}

export default MenuRegistration; 