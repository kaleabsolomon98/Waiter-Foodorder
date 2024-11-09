import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CircularProgress from '@mui/material/CircularProgress';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import styles from './Employee.module.css';
import baseUrl from '../../components/Constants/base_url';
import "react-datepicker/dist/react-datepicker.css";
// import moment from 'moment-timezone';


const EmployeeRegistration = () => {
    const [employees, setEmployees] = useState([]);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [newEmployee, setNewEmployee] = useState({
        employeeTitle: '', firstName: '', middleName: '', lastName: '', phone: '', salary: '', dailyWage: '',
        taxAmount: '', hireDate: new Date(), loginRequired: false, image: null, salaryPaymentType: ''
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const [selectedDate, setSelectedDate] = useState(new Date());

    // Assuming the user's timezone is 'America/Los_Angeles'
    const userTimezone = 'America/Los_Angeles';

    const handleDateChange = (date) => {
        // Convert the selected date to the user's timezone
        const dateInUserTimezone = date.toDate();
        setSelectedDate(dateInUserTimezone);
    };


    useEffect(() => {
        const fetchEmployees = async () => {
            console.log("---FETCHING DATE------", newEmployee.hireDate);
            try {
                const response = await axios.get(`${baseUrl}employees`);
                console.log(response);
                setEmployees(response.data);
            } catch (error) {
                console.error('Error fetching employees:', error);
            }
        };

        fetchEmployees();
    }, []);

    const openModal = (employee = null) => {
        if (employee) {
            setEditingEmployee(employee);
            setNewEmployee({
                employeeTitle: employee.employeeTitle,
                firstName: employee.firstName,
                middleName: employee.middleName,
                lastName: employee.lastName,
                phone: employee.phone,
                salary: employee.salary,
                dailyWage: employee.dailyWage,
                taxAmount: employee.taxAmount,
                hireDate: employee.hireDate.toISOString(),
                loginRequired: employee.loginRequired,
                image: null,
                salaryPaymentType: employee.salaryPaymentType
            });
        } else {
            setEditingEmployee(null);
            setNewEmployee({
                employeeTitle: '', firstName: '', middleName: '', lastName: '', phone: '', salary: '', dailyWage: '',
                taxAmount: '', hireDate: new Date().toISOString(), loginRequired: false, image: null, salaryPaymentType: ''
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setNewEmployee({
            employeeTitle: '', firstName: '', middleName: '', lastName: '', phone: '', salary: '', dailyWage: '',
            taxAmount: '', hireDate: '', loginRequired: false, image: null, salaryPaymentType: ''
        });
        setEditingEmployee(null);
    };

    const handleImageChange = (e) => {
        setNewEmployee({ ...newEmployee, image: e.target.files[0] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        formData.append('employeeTitle', newEmployee.employeeTitle);
        formData.append('firstName', newEmployee.firstName);
        formData.append('middleName', newEmployee.middleName);
        formData.append('lastName', newEmployee.lastName);
        formData.append('phone', newEmployee.phone);
        formData.append('salary', newEmployee.salary);
        formData.append('dailyWage', newEmployee.dailyWage);
        formData.append('taxAmount', newEmployee.taxAmount);
        formData.append('hireDate', newEmployee.hireDate.toISOString());
        formData.append('loginRequired', newEmployee.loginRequired ? 'true' : 'false');
        formData.append('salaryPaymentType', newEmployee.salaryPaymentType);
        formData.append('image', newEmployee.image ? newEmployee.image : editingEmployee?.image);

        try {
            if (editingEmployee) {
                const response = await axios.put(`${baseUrl}employees/${editingEmployee.id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                const updatedEmployee = response.data;
                setEmployees(employees.map(emp =>
                    emp.id === editingEmployee.id ? { ...emp, ...updatedEmployee } : emp
                ));
            } else {
                const response = await axios.post(`${baseUrl}employees`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                setEmployees([...employees, response.data]);
            }

            closeModal();
        } catch (error) {
            console.error('Error saving employee:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        setDeletingId(id);
        try {
            await axios.delete(`${baseUrl}employees/${id}`);
            setEmployees(employees.filter(emp => emp.id !== id));
        } catch (error) {
            console.error('Error deleting employee:', error);
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className={styles.container}>
            <h2>Manage Employees</h2>

            <button className={styles['add-btn']} onClick={() => openModal()}>
                <FaPlus /> Add New Employee
            </button>

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
                        <th>Image</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {employees.map((employee) => (
                        <tr key={employee.id}>
                            <td>{employee.title}</td>
                            <td>{employee.firstName}</td>
                            <td>{employee.lastName}</td>
                            <td>{employee.phone}</td>
                            <td>${(parseFloat(employee.salary) || 0).toFixed(2)}</td>
                            <td>${(parseFloat(employee.dailyWage) || 0).toFixed(2)}</td>
                            <td>${(parseFloat(employee.taxAmount) || 0).toFixed(2)}</td>
                            <td>{employee.hireDate}</td>
                            <td>{employee.loginRequired ? 'Yes' : 'No'}</td>
                            <td>
                                {employee.image ? (
                                    <img src={employee.image} alt={employee.firstName} style={{ width: '30px', height: '30px' }} />
                                ) : 'No Image'}
                            </td>
                            <td className={styles.actions}>
                                <button className={styles['edit-btn']} onClick={() => openModal(employee)}>
                                    <FaEdit />
                                </button>
                                <button
                                    className={styles['delete-btn']}
                                    onClick={() => handleDelete(employee.id)}
                                    disabled={deletingId === employee.id}
                                >
                                    {deletingId === employee.id ? (
                                        <CircularProgress size={24} />
                                    ) : (
                                        <FaTrash />
                                    )}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {isModalOpen && (
                <div className={styles.modal}>
                    <div className={styles['modal-content']}>
                        <div className={styles['modal-header']}>
                            <h2>{editingEmployee ? 'Edit Employee' : 'Add New Employee'}</h2>
                            <span className={styles.close} onClick={closeModal}>&times;</span>
                        </div>
                        <form onSubmit={handleSubmit} className={styles['form-layout']}>
                            <div className={styles['form-grid']}>
                                <div className={styles.field}>
                                    <label>Title</label>
                                    <input
                                        type="text"
                                        placeholder="Enter Employee Title"
                                        value={newEmployee.employeeTitle}
                                        onChange={(e) => setNewEmployee({ ...newEmployee, employeeTitle: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className={styles.field}>
                                    <label>First Name</label>
                                    <input
                                        type="text"
                                        placeholder="Enter First Name"
                                        value={newEmployee.firstName}
                                        onChange={(e) => setNewEmployee({ ...newEmployee, firstName: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className={styles.field}>
                                    <label>Middle Name</label>
                                    <input
                                        type="text"
                                        placeholder="Enter Middle Name"
                                        value={newEmployee.middleName}
                                        onChange={(e) => setNewEmployee({ ...newEmployee, middleName: e.target.value })}
                                    />
                                </div>
                                <div className={styles.field}>
                                    <label>Last Name</label>
                                    <input
                                        type="text"
                                        placeholder="Enter Last Name"
                                        value={newEmployee.lastName}
                                        onChange={(e) => setNewEmployee({ ...newEmployee, lastName: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className={styles.field}>
                                    <label>Phone</label>
                                    <input
                                        type="text"
                                        placeholder="Enter Phone"
                                        value={newEmployee.phone}
                                        onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className={styles.field}>
                                    <label>Salary</label>
                                    <input
                                        type="number"
                                        placeholder="Enter Salary"
                                        value={newEmployee.salary}
                                        onChange={(e) => setNewEmployee({ ...newEmployee, salary: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className={styles.field}>
                                    <label>Daily Wage</label>
                                    <input
                                        type="number"
                                        placeholder="Enter Daily Wage"
                                        value={newEmployee.dailyWage}
                                        onChange={(e) => setNewEmployee({ ...newEmployee, dailyWage: e.target.value })}
                                    />
                                </div>
                                <div className={styles.field}>
                                    <label>Tax Amount</label>
                                    <input
                                        type="number"
                                        placeholder="Enter Tax Amount"
                                        value={newEmployee.taxAmount}
                                        onChange={(e) => setNewEmployee({ ...newEmployee, taxAmount: e.target.value })}
                                    />
                                </div>
                                <div className={styles.field}>
                                    <label>Hire Date</label>
                                    <DatePicker
                                        selected={newEmployee.hireDate} // Controlled component with current state
                                        onChange={(date) => setNewEmployee({ ...newEmployee, hireDate: date })}
                                        dateFormat="yyyy-MM-dd" // Display format
                                        className="your-custom-class" // Optional: for custom styling
                                    />
                                </div>
                                <div className={styles.field}>
                                    <label>Login Required?</label>
                                    <div className={styles['radio-group']}>  {/* Radio buttons in one line */}
                                        <label>
                                            <input
                                                type="radio"
                                                name="loginRequired"
                                                value="yes"
                                                checked={newEmployee.loginRequired === 'yes'}
                                                onChange={(e) => setNewEmployee({ ...newEmployee, loginRequired: e.target.value })}
                                            />
                                            Yes
                                        </label>
                                        <label>
                                            <input
                                                type="radio"
                                                name="loginRequired"
                                                value="no"
                                                checked={newEmployee.loginRequired === 'no'}
                                                onChange={(e) => setNewEmployee({ ...newEmployee, loginRequired: e.target.value })}
                                            />
                                            No
                                        </label>
                                    </div>
                                </div>

                                <div className={styles.field}>
                                    <label>Salary Payment Type</label>
                                    <div className={styles['radio-group']}>  {/* Another radio group, also in one line */}
                                        <label>
                                            <input
                                                type="radio"
                                                name="salaryPaymentType"
                                                value="Salary"
                                                checked={newEmployee.salaryPaymentType === 'Salary'}
                                                onChange={(e) => setNewEmployee({ ...newEmployee, salaryPaymentType: e.target.value })}
                                            />
                                            Salary
                                        </label>
                                        <label>
                                            <input
                                                type="radio"
                                                name="salaryPaymentType"
                                                value="Daily"
                                                checked={newEmployee.salaryPaymentType === 'Daily'}
                                                onChange={(e) => setNewEmployee({ ...newEmployee, salaryPaymentType: e.target.value })}
                                            />
                                            Daily
                                        </label>
                                        <label>
                                            <input
                                                type="radio"
                                                name="salaryPaymentType"
                                                value="Both"
                                                checked={newEmployee.salaryPaymentType === 'Both'}
                                                onChange={(e) => setNewEmployee({ ...newEmployee, salaryPaymentType: e.target.value })}
                                            />
                                            Both
                                        </label>
                                    </div>
                                </div>

                                <div className={styles.field}>
                                    <label>Image</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                    />
                                </div>
                            </div>
                            <button type="submit" disabled={loading}>
                                {loading ? <CircularProgress size={24} /> : 'Save Employee'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeeRegistration;
