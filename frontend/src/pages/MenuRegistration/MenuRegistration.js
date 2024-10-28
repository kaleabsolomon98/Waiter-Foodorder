import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CircularProgress from '@mui/material/CircularProgress';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import styles from './MenuRegistration.module.css'; // Assuming you have a CSS module for styling

const MenuRegistration = () => {
    const [menuItems, setMenuItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]); // for subcategory dropdown
    const [editingMenuItem, setEditingMenuItem] = useState(null);
    const [newMenuItem, setNewMenuItem] = useState({ name: '', price: '', category_id: '', subCategory_id: '', image: null });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isFridgeItem, setIsFridgeItem] = useState("no");

    // Fetch categories and menu items from API
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get('http://localhost:4422/categories');
                setCategories(response.data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        const fetchMenuItems = async () => {
            try {
                const response = await axios.get('http://localhost:4422/menus');
                setMenuItems(response.data);
            } catch (error) {
                console.error('Error fetching menu items:', error);
            }
        };

        fetchCategories();
        fetchMenuItems();
    }, []);

    const openModal = (item = null) => {
        if (item) {
            setEditingMenuItem(item);
            setNewMenuItem({ name: item.name, price: item.price, category_id: item.category_id, subCategory_id: item.subCategory_id, image: null });
        } else {
            setEditingMenuItem(null);
            setNewMenuItem({ name: '', price: '', category_id: '', subCategory_id: '', image: null });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setNewMenuItem({ name: '', price: '', category_id: '', subCategory_id: '', image: null });
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
        formData.append('subCategory_id', newMenuItem.subCategory_id);
        formData.append('image', newMenuItem.image ? newMenuItem.image : editingMenuItem.image);

        try {
            if (editingMenuItem) {
                await axios.put(`http://localhost:4422/menus/${editingMenuItem.id}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });

                setMenuItems(menuItems.map(item =>
                    item.id === editingMenuItem.id ? { ...item, ...newMenuItem, image: newMenuItem.image ? URL.createObjectURL(newMenuItem.image) : item.image } : item
                ));
            } else {
                const response = await axios.post('http://localhost:4422/menus', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
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
        setLoading(true);
        try {
            await axios.delete(`http://localhost:4422/menus/${id}`);
            setMenuItems(menuItems.filter(item => item.id !== id));
        } catch (error) {
            console.error('Error deleting menu item:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSubCategories = async (categoryId) => {
        try {
            const response = await axios.get(`http://localhost:4422/subcategories/${categoryId}`);
            setSubCategories(response.data);
        } catch (error) {
            console.error('Error fetching subcategories:', error);
        }
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
                            <td>{item.isFridge}</td>
                            <td>{item.category.name}</td>
                            <td>{item.subCategory.name}</td>
                            <td>{item.name}</td>
                            <td>${(parseFloat(item.price) || 0).toFixed(2)}</td>
                            <td>
                                {item.image ? (
                                    <img src={item.image} alt={item.name} style={{ width: '30px', height: '18px' }} />
                                ) : (
                                    'No Image'
                                )}
                            </td>
                            <td className={styles.actions}>
                                <button className={styles['edit-btn']} onClick={() => openModal(item)}>
                                    <FaEdit />
                                </button>
                                <button className={styles['delete-btn']} onClick={() => handleDelete(item.id)}>
                                    <FaTrash />
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

                            {/* Printer Name */}
                            <div className={styles.field}>
                                <label>Printer Name</label>
                                <input
                                    type="text"
                                    placeholder="Enter Printer Name"
                                    value={newMenuItem.printerName}
                                    onChange={(e) => setNewMenuItem({ ...newMenuItem, printerName: e.target.value })}
                                    required
                                />
                            </div>
                            {/* Is Fridge Item */}
                            <div className={styles.field}>
                                <label className={styles.radiolabel}>Is Fridge Item?</label>
                                <div className={styles.RadioButton}>
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

                            {/* Category */}
                            <div className={styles.field}>
                                <label>Category</label>
                                <select
                                    value={newMenuItem.category_id}
                                    onChange={async (e) => {
                                        const selectedCategoryId = e.target.value;
                                        setNewMenuItem({ ...newMenuItem, category_id: selectedCategoryId, subCategory_id: '' }); // Reset subcategory
                                        fetchSubCategories(selectedCategoryId); // Fetch subcategories based on selected category
                                    }}
                                    required
                                >
                                    <option value="" disabled>Select Category</option>
                                    {categories.map(category => (
                                        <option key={category.id} value={category.id}>{category.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Sub Category */}
                            <div className={styles.field}>
                                <label>Sub Category</label>
                                <select
                                    value={newMenuItem.subCategory_id}
                                    onChange={(e) => setNewMenuItem({ ...newMenuItem, subCategory_id: e.target.value })}
                                    required
                                >
                                    <option value="" disabled>Select Sub Category</option>
                                    {subCategories.map(subCategory => (
                                        <option key={subCategory.id} value={subCategory.id}>{subCategory.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Menu Item Name */}
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

                            {/* Price */}
                            <div className={styles.field}>
                                <label>Price</label>
                                <input
                                    type="number"
                                    placeholder="Enter Price"
                                    value={newMenuItem.price}
                                    onChange={(e) => setNewMenuItem({ ...newMenuItem, price: e.target.value })}
                                    required
                                />
                            </div>

                            {/* Image Upload */}
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
