// export default Menu;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CircularProgress from '@mui/material/CircularProgress';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';// Modify as needed for your base URL
import styles from './MenuRegistration.module.css'; // Assuming you have a CSS module for styling

const MenuRegistration = () => {
    const [menuItems, setMenuItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [editingMenuItem, setEditingMenuItem] = useState(null);
    const [newMenuItem, setNewMenuItem] = useState({ name: '', price: '', category_id: '', image: null });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [subCategories, setSubCategories] = useState([]); // for subcategory dropdown
    const [isFridgeItem, setIsFridgeItem] = useState("no");
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get(`https://hotel.samesoft.app/categories`);
                setCategories(response.data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        const fetchMenuItems = async () => {
            try {
                //  const response = await axios.get(`https://hotel.samesoft.app/menus`);
                // setMenuItems(response.data);
                setMenuItems([
                    {
                        "printerName": "Printer A",
                        "isFridge": "Yes",
                        "category": "Beverages",
                        "subCategory": "Cold Drinks",
                        "menu": "Iced Tea",
                        "price": 2.50,
                        "image": "https://example.com/images/iced-tea.jpg"
                    },
                    {
                        "printerName": "Printer B",
                        "isFridge": "No",
                        "category": "Snacks",
                        "subCategory": "Chips",
                        "menu": "Potato Chips",
                        "price": 1.25,
                        "image": "https://example.com/images/potato-chips.jpg"
                    },
                    {
                        "printerName": "Printer C",
                        "isFridge": "Yes",
                        "category": "Dairy",
                        "subCategory": "Yogurt",
                        "menu": "Greek Yogurt",
                        "price": 3.00,
                        "image": "https://example.com/images/greek-yogurt.jpg"
                    },
                    {
                        "printerName": "Printer D",
                        "isFridge": "No",
                        "category": "Bakery",
                        "subCategory": "Bread",
                        "menu": "Whole Wheat Bread",
                        "price": 2.00,
                        "image": "https://example.com/images/whole-wheat-bread.jpg"
                    },
                    {
                        "printerName": "Printer E",
                        "isFridge": "Yes",
                        "category": "Desserts",
                        "subCategory": "Ice Cream",
                        "menu": "Vanilla Ice Cream",
                        "price": 4.50,
                        "image": "https://example.com/images/vanilla-ice-cream.jpg"
                    }
                ]
                );
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
            setNewMenuItem({ name: item.name, price: item.price, category_id: item.category_id, image: null });
        } else {
            setEditingMenuItem(null);
            setNewMenuItem({ name: '', price: '', category_id: '', image: null });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setNewMenuItem({ name: '', price: '', category_id: '', image: null });
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

        // Always append the image (even if it's null or the current one)
        formData.append('image', newMenuItem.image ? newMenuItem.image : editingMenuItem.image);

        try {
            if (editingMenuItem) {
                await axios.put(`https://hotel.samesoft.app/menus/${editingMenuItem.id}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });

                // Update the menu item in the state with the new data (if an image was provided, update it)
                setMenuItems(menuItems.map(item =>
                    item.id === editingMenuItem.id ? { ...item, ...newMenuItem, image: newMenuItem.image ? URL.createObjectURL(newMenuItem.image) : item.image } : item
                ));
            } else {
                const response = await axios.post(`https://hotel.samesoft.app/menus`, formData, {
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
            await axios.delete(`/menus/${id}`);
            setMenuItems(menuItems.filter(item => item.id !== id));
        } catch (error) {
            console.error('Error deleting menu item:', error);
        } finally {
            setLoading(false);
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
                            <td>{item.category}</td>
                            <td>{item.subCategory}</td>
                            <td>{item.menu}</td>
                            <td>${(parseFloat(item.price) || 0).toFixed(2)}</td>
                            {/* <td>{categories.find(cat => cat.id === item.category_id)?.name || 'Unknown'}</td> */}
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
                                    onChange={(e) => {
                                        const selectedCategoryId = e.target.value;
                                        setNewMenuItem({ ...newMenuItem, category_id: selectedCategoryId });
                                        // Fetch subcategories based on selected category
                                        const fetchSubCategories = async () => {
                                            try {
                                                const response = await axios.get(`https://hotel.samesoft.app/subcategories/${selectedCategoryId}`);
                                                setSubCategories(response.data);
                                            } catch (error) {
                                                console.error('Error fetching subcategories:', error);
                                            }
                                        };
                                        fetchSubCategories();
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
                                    value={newMenuItem.subCategory}
                                    onChange={(e) => {
                                        setNewMenuItem({ ...newMenuItem, subCategory: e.target.value });
                                        const selectElement = e.target;

                                        // Check if the selected value is the default option
                                        if (selectElement.value === "") {
                                            selectElement.classList.add("placeholder"); // Add placeholder class
                                        } else {
                                            selectElement.classList.remove("placeholder"); // Remove if not
                                        }
                                    }}
                                    className={newMenuItem.subCategory === "" ? "placeholder" : ""}
                                >
                                    <option value="" disabled>Select Sub Category</option>
                                    {subCategories.map(subCategory => (
                                        <option key={subCategory.id} value={subCategory.id}>{subCategory.name}</option>
                                    ))}
                                </select>


                            </div>

                            {/* Name */}
                            <div className={styles.field}>
                                <label>Menu Name</label>
                                <input
                                    type="text"
                                    placeholder="Enter Menu Name"
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
                                <label>Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setNewMenuItem({ ...newMenuItem, image: e.target.files[0] })}
                                />
                            </div>

                            <button type="submit" className={styles['submit-btn']}>
                                {loading ? <CircularProgress size={24} /> : (editingMenuItem ? 'Update Menu Item' : 'Add Menu Item')}
                            </button>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default MenuRegistration;

