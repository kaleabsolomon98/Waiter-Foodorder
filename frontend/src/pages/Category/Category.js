import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CircularProgress from '@mui/material/CircularProgress';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import styles from './SubCategory.module.css';

const Category = () => {
    const [categories, setCategory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSubCategory, setEditingSubCategory] = useState(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                // Set your categories data here
                setCategories(
                    [
                        {
                            "id": 1,
                            "category": "Food",
                            "subcategory": "Vegetables",
                            "description": "Fresh and organic vegetables.",
                            "image": "https://example.com/images/vegetables.jpg"
                        },
                        {
                            "id": 2,
                            "category": "Food",
                            "subcategory": "Fruits",
                            "description": "Juicy and fresh fruits.",
                            "image": "https://example.com/images/fruits.jpg"
                        },
                        {
                            "id": 3,
                            "category": "Dairy",
                            "subcategory": "Milk",
                            "description": "Fresh dairy products including milk and cheese.",
                            "image": "https://example.com/images/milk.jpg"
                        },
                        {
                            "id": 4,
                            "category": "Snacks",
                            "subcategory": "Chips",
                            "description": "Various types of crunchy chips.",
                            "image": "https://example.com/images/chips.jpg"
                        },
                        {
                            "id": 5,
                            "category": "Beverages",
                            "subcategory": "Juices",
                            "description": "Natural fruit juices.",
                            "image": "https://example.com/images/juices.jpg"
                        }
                    ]
                );
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        // const fetchSubCategories = async () => {
        //     setLoading(true);
        //     try {
        //         // Fetch your subcategories data here
        //     } catch (error) {
        //         console.error('Error fetching subcategories:', error);
        //     } finally {
        //         setLoading(false);
        //     }
        // };

        fetchCategories();
        // fetchSubCategories();
    }, []);

    const openModal = (subCategory = null) => {
        if (subCategory) {
            setEditingSubCategory(subCategory);
            setCategory({ subcategory: subCategory.subcategory, category_id: subCategory.category_id, description: subCategory.description, image: subCategory.image });
        } else {
            setEditingSubCategory(null);
            setCategory({ name: '', category_id: '', description: '', image: '' });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setNewSubCategory({ name: '', category_id: '', description: '', image: '' });
        setEditingSubCategory(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (editingSubCategory) {
                await axios.put(`https://hotel.samesoft.app/subcategories/${editingSubCategory.id}`, newSubCategory);
                setSubCategories(subCategories.map(item =>
                    item.id === editingSubCategory.id ? { ...item, ...newSubCategory } : item
                ));
            } else {
                const response = await axios.post('https://hotel.samesoft.app/subcategories', newSubCategory);
                setSubCategories([...subCategories, response.data]);
            }
            closeModal();
        } catch (error) {
            console.error('Error saving subcategory:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        setLoading(true);
        try {
            await axios.delete(`https://hotel.samesoft.app/subcategories/${id}`);
            setSubCategories(subCategories.filter(item => item.id !== id));
        } catch (error) {
            console.error('Error deleting subcategory:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <h2>Manage Subcategories</h2>

            <button className={styles['add-btn-category']} onClick={() => openModal()}>
                <FaPlus /> Add New Sub Category
            </button>

            {loading ? (
                null
                // <CircularProgress />
            ) : (
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Category</th>
                            <th>Description</th>
                            <th>Image</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map((item) => (
                            <tr key={item.id}>
                                <td>{item.category}</td>
                                <td>{item.description}</td>
                                <td>
                                    {item.image && <img src={item.image} alt={item.name} style={{ width: '50px', height: '50px' }} />}
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
            )}

            {isModalOpen && (
                <div className={styles.modal}>
                    <div className={styles['modal-content']}>
                        <div className={styles['modal-header']}>
                            <h2>{editingSubCategory ? 'Edit Sub Category' : 'Add New Subcategory'}</h2>
                            <span className={styles.close} onClick={closeModal}>&times;</span>
                        </div>
                        <form onSubmit={handleSubmit} className={styles['form-layout']}>
                            <div className={styles.field}>
                                <label>Category</label>
                                <select
                                    value={newCategory.category_id}
                                    onChange={(e) => setNewCategory({ ...newCategory, category_id: e.target.value })}
                                    required
                                >
                                    <option value="" disabled>Select Category</option>
                                    {categories.map(category => (
                                        <option key={category.id} value={category.id}>{category.category}</option>
                                    ))}
                                </select>
                            </div>


                            <div className={styles.field}>
                                <label>Description</label>
                                <input
                                    type='text'
                                    placeholder="Enter Description"
                                    value={newSubCategory.description}
                                    onChange={(e) => setNewCategory({ ...newSubCategory, description: e.target.value })}
                                    required
                                />
                            </div>

                            {/* Image Upload */}
                            <div className={styles.field}>
                                <label>Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setNewCategory({ ...newSubCategory, image: e.target.value })}
                                />
                            </div>
                            <button type="submit" className={styles['submit-btn']}>
                                {loading ? <CircularProgress size={24} /> : (editingSubCategory ? 'Update Sub Category' : 'Add Sub Category')}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Category;
