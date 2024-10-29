import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CircularProgress from '@mui/material/CircularProgress';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import styles from './MenuRegistration.module.css';
import baseUrl from '../../components/Constants/base_url';


const MenuRegistration = () => {
    const [printerItems, setPrinterItems] = useState([]);
    const [menuItems, setMenuItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [editingMenuItem, setEditingMenuItem] = useState(null);
    const [newMenuItem, setNewMenuItem] = useState({
        name: '', price: '', category_id: '', subcategory_id: '', image: null, printerName: '', isFridge: 'no'
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get(`${baseUrl}categories`);
                setCategories(response.data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        const fetchMenuItems = async () => {
            try {
                const response = await axios.get(`${baseUrl}menus`);
                console.log(response.data);
                setMenuItems(response.data);
            } catch (error) {
                console.error('Error fetching menu items:', error);
            }
        };

        const fetchPrinterItems = async () => {
            try {
                const response = await axios.get(`${baseUrl}printers`);
                console.log(response.data);
                setPrinterItems(response.data);
            } catch (error) {
                console.error('Error fetching printer items:', error);
            }
        };


        fetchCategories();
        fetchMenuItems();
        fetchPrinterItems();
    }, []);

    const openModal = async (item = null) => {
        if (item) {
            setEditingMenuItem(item);
            setNewMenuItem({
                name: item.name,
                price: item.price,
                category_id: item.category_id,
                subcategory_id: item.subcategory_id,
                image: null,
                printerName: item.printerName,
                isFridge: item.isFridge
            });

            // Fetch subcategories for the selected category
            await fetchSubCategories(item.category_id);
        } else {
            setEditingMenuItem(null);
            setNewMenuItem({
                name: '',
                price: '',
                category_id: '',
                subcategory_id: '',
                image: null,
                printerName: '',
                isFridge: 'no'
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setNewMenuItem({
            name: '', price: '', category_id: '', subcategory_id: '', image: null, printerName: '', isFridge: 'no'
        });
        setEditingMenuItem(null);
    };

    const handleImageChange = (e) => {
        setNewMenuItem({ ...newMenuItem, image: e.target.files[0] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        formData.append('name', newMenuItem.name);
        formData.append('price', newMenuItem.price);
        formData.append('category_id', newMenuItem.category_id);
        formData.append('subcategory_id', newMenuItem.subcategory_id);
        formData.append('printerName', newMenuItem.printerName);
        formData.append('isFridge', newMenuItem.isFridge);
        formData.append('image', newMenuItem.image ? newMenuItem.image : editingMenuItem.image);

        try {
            if (editingMenuItem) {
                const response = await axios.put(`${baseUrl}menus/${editingMenuItem.id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                // Replace the edited item in menuItems with the response data
                const updatedItem = response.data;
                setMenuItems(menuItems.map(item =>
                    item.id === editingMenuItem.id ? { ...item, ...updatedItem } : item
                ));
            } else {
                const response = await axios.post(`${baseUrl}menus`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                setMenuItems([...menuItems, response.data]);
            }

            closeModal();
        } catch (error) {
            console.error('Error saving menu item:', error);
        } finally {
            setLoading(false);
        }
    };



    const handleDelete = async (id) => {
        setDeletingId(id);
        try {
            await axios.delete(`${baseUrl}menus/${id}`);
            setMenuItems(menuItems.filter(item => item.id !== id));
        } catch (error) {
            console.error('Error deleting menu item:', error);
        } finally {
            setDeletingId(null);
        }
    };

    const fetchSubCategories = async (categoryId) => {
        try {
            const response = await axios.get(`${baseUrl}subcategories/${categoryId}`);
            setSubCategories(response.data);
        } catch (error) {
            console.error('Error fetching subcategories:', error);
        }
    };

    const handleCategoryChange = async (e) => {
        const categoryId = e.target.value;
        setNewMenuItem({ ...newMenuItem, category_id: categoryId, subcategory_id: '' });
        await fetchSubCategories(categoryId);
    };

    return (
        <div className={styles.container}>
            <h2>Manage Menu</h2>

            <button className={styles['add-btn-category']} onClick={() => openModal()}>
                <FaPlus /> Add New Menu Item
            </button>

            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Printer Name</th>
                        <th>Is Fridge</th>
                        <th>Category</th>
                        <th>Sub Category</th>
                        <th>Menu</th>
                        <th>Price</th>
                        <th>Image</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {menuItems.map((item) => (
                        <tr key={item.id}>
                            <td>{item.printerName}</td>
                            <td>{item.isFridge ? 'Yes' : 'No'}</td>
                            <td>{item.category}</td>
                            <td>{item.subCategory}</td>
                            <td>{item.name}</td>
                            <td>${(parseFloat(item.price) || 0).toFixed(2)}</td>
                            <td>
                                {item.image ? (
                                    <img src={item.image} alt={item.name} style={{ width: '30px', height: '18px' }} />
                                ) : 'No Image'}
                            </td>
                            <td className={styles.actions}>
                                <button className={styles['edit-btn']} onClick={() => openModal(item)}>
                                    <FaEdit />
                                </button>
                                <button
                                    className={styles['delete-btn']}
                                    onClick={() => handleDelete(item.id)}
                                    disabled={deletingId === item.id}
                                >
                                    {deletingId === item.id ? (
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
                            <h2>{editingMenuItem ? 'Edit Menu Item' : 'Add New Menu Item'}</h2>
                            <span className={styles.close} onClick={closeModal}>&times;</span>
                        </div>
                        <form onSubmit={handleSubmit} className={styles['form-layout']}>
                            <div className={styles.field}>
                                <label>Select Printer</label>
                                <select
                                    value={newMenuItem.printerName}
                                    onChange={(e) => setNewMenuItem({ ...newMenuItem, printerName: e.target.value })}
                                    required
                                >
                                    <option value="" disabled>Select Printer Location</option>
                                    {printerItems.map(printer => (
                                        <option key={printer.id} value={printer.name}>{printer.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className={styles.field}>
                                <label className={styles.radiolabel}>Is Fridge Item?</label>
                                <div className={styles.RadioButton}>
                                    <label>
                                        <input
                                            type="radio"
                                            value="yes"
                                            checked={newMenuItem.isFridge === "yes" || newMenuItem.isFridge === false}
                                            onChange={() => setNewMenuItem({ ...newMenuItem, isFridge: "yes" })}
                                        />
                                        Yes
                                    </label>
                                    <label>
                                        <input
                                            type="radio"
                                            value="no"
                                            checked={newMenuItem.isFridge === "no" || newMenuItem === true}
                                            onChange={() => setNewMenuItem({ ...newMenuItem, isFridge: "no" })}
                                        />
                                        No
                                    </label>
                                </div>
                            </div>

                            <div className={styles.field}>
                                <label>Category</label>
                                <select
                                    value={newMenuItem.category_id}
                                    onChange={handleCategoryChange}
                                    required
                                >
                                    <option value="" disabled>Select Category</option>
                                    {categories.map(category => (
                                        <option key={category.id} value={category.id}>{category.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className={styles.field}>
                                <label>Sub Category</label>
                                <select
                                    value={newMenuItem.subcategory_id}
                                    onChange={(e) => setNewMenuItem({ ...newMenuItem, subcategory_id: e.target.value })}

                                >
                                    <option value="" disabled>Select Sub Category</option>
                                    {subCategories.map(subCategory => (
                                        <option key={subCategory.id} value={subCategory.id}>{subCategory.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className={styles.field}>
                                <label>Menu Item Name</label>
                                <input
                                    type="text"
                                    placeholder="Enter Menu Item Name"
                                    value={newMenuItem.name}
                                    onChange={(e) => setNewMenuItem({ ...newMenuItem, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className={styles.field}>
                                <label>Price</label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    placeholder="Enter Price"
                                    value={newMenuItem.price}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (/^\d*$/.test(value)) { // allows only digits
                                            setNewMenuItem({ ...newMenuItem, price: value });
                                        }
                                    }}
                                    required
                                />
                            </div>
                            <div className={styles.field}>
                                <label>Upload Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                            </div>
                            <button type="submit" className={styles['submit-btn']} disabled={loading}>
                                {loading ? <CircularProgress size={24} /> : 'Save'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MenuRegistration;
