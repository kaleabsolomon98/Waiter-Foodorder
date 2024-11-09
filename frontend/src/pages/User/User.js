import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CircularProgress from '@mui/material/CircularProgress';
import DatePicker from 'react-datepicker';
import styles from './User.module.css';
import baseUrl from '../../components/Constants/base_url';
import "react-datepicker/dist/react-datepicker.css";

const UserRegistration = () => {
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [newUser, setNewUser] = useState({
        username: '',
        password: '',
        role: '',
    });

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const response = await axios.get(`${baseUrl}useremployees`);
                setEmployees(response.data);
            } catch (error) {
                console.error('Error fetching employees:', error);
            }
        };

        fetchEmployees();
    }, []);

    const openModal = (employee) => {
        setSelectedEmployee(employee);
        setNewUser({ username: '', password: '', role: '' }); // Clear fields for a new entry
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedEmployee(null);
        setNewUser({ username: '', password: '', role: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Step 1: Save new user to the Users table
            const userResponse = await axios.post(`${baseUrl}users`, {
                username: newUser.username,
                password: newUser.password,
                employeeId: selectedEmployee.id,
                role: newUser.role
            });

            // // Step 2: Update loginRequirement status in Employees table
            // await axios.put(`${baseUrl}employees/${selectedEmployee.id}`, {
            //     loginRequired: 'Login'
            // });

            closeModal();
        } catch (error) {
            console.error('Error saving user:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <h2>Manage Employees</h2>

            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Phone</th>
                        <th>Salary</th>
                        <th>Daily Wage</th>
                        <th>Tax Amount</th>
                        <th>Hire Date</th>
                        <th>Login Required</th>
                    </tr>
                </thead>
                <tbody>
                    {employees.map((employee) => (
                        <tr key={employee.id} onClick={() => openModal(employee)} className={styles.row}>
                            <td>{employee.employeeTitle}</td>
                            <td>{employee.firstName}</td>
                            <td>{employee.lastName}</td>
                            <td>{employee.phone}</td>
                            <td>${parseFloat(employee.salary).toFixed(2)}</td>
                            <td>${parseFloat(employee.dailyWage).toFixed(2)}</td>
                            <td>${parseFloat(employee.taxAmount).toFixed(2)}</td>
                            <td>{employee.hireDate}</td>
                            <td>{employee.loginRequired}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {isModalOpen && (
                <div className={styles.modal}>
                    <div className={styles['modal-content']}>
                        <div className={styles['modal-header']}>
                            <h2>Add User</h2>
                            <span className={styles.close} onClick={closeModal}>&times;</span>
                        </div>
                        <form onSubmit={handleSubmit} className={styles['form-layout']}>
                            <div className={styles['form-grid']}>
                                <div className={styles.field}>
                                    <label>Username</label>
                                    <input
                                        type="text"
                                        placeholder="Enter Username"
                                        value={newUser.username}
                                        onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className={styles.field}>
                                    <label>Password</label>
                                    <input
                                        type="password"
                                        placeholder="Enter Password"
                                        value={newUser.password}
                                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className={styles.field}>
                                    <label>Role</label>
                                    <input
                                        type="text"
                                        placeholder="Enter Role"
                                        value={newUser.role}
                                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <button type="submit" disabled={loading}>
                                {loading ? <CircularProgress size={24} /> : 'Save User'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserRegistration;
