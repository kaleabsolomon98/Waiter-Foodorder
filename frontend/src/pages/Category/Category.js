import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CircularProgress from '@mui/material/CircularProgress';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import styles from './Category.module.css'

const Category = () => {
    const [categories, setCategory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [newCategory, setNewCategory] = useState({ name: '', category_id: '', description: '', image: '' });

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setCategory(
                    [
                        {
                            "id": 1,
                            "category": "Food",
                            "description": "Fresh and organic vegetables.",
                            "image": "https://example.com/images/vegetables.jpg"
                        },
                        {
                            "id": 2,
                            "category": "Food",
                            "description": "Juicy and fresh fruits.",
                            "image": "https://example.com/images/fruits.jpg"
                        },
                        {
                            "id": 3,
                            "category": "Dairy",
                            "description": "Fresh dairy products including milk and cheese.",
                            "image": "https://example.com/images/milk.jpg"
                        },
                        {
                            "id": 4,
                            "category": "Snacks",
                            "description": "Various types of crunchy chips.",
                            "image": "https://example.com/images/chips.jpg"
                        },
                        {
                            "id": 5,
                            "category": "Beverages",
                            "description": "Natural fruit juices.",
                            "image": "https://example.com/images/juices.jpg"
                        }
                    ]
                );
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };


        fetchCategories();
    }, []);

    const openModal = (category = null) => {
        if (category) {
            setEditingCategory(category);
            setNewCategory({ category_id: category.id, category: category.category, description: category.description, image: category.image });
        } else {
            setEditingCategory(null);
            setNewCategory({ name: '', category_id: '', description: '', image: '' });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingCategory(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (editingCategory) {
                await axios.put(`https://hotel.samesoft.app/subcategories/${editingCategory.id}`, categories);
                setCategory(Category.map(item =>
                    item.id === editingCategory.id ? { ...item, ...categories } : item
                ));
            } else {
                const response = await axios.post('https://hotel.samesoft.app/subcategories', categories);
                setCategory([...categories, response.data]);
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
            setCategory(Category.filter(item => item.id !== id));
        } catch (error) {
            console.error('Error deleting subcategory:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <h2>Manage Categories</h2>

            <button className={styles['add-btn-category']} onClick={() => openModal()}>
                <FaPlus /> Add New Category
            </button>

            {loading ? (
                null

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
                            <h2>{editingCategory ? 'Edit Category' : 'Add New Category'}</h2>
                            <span className={styles.close} onClick={closeModal}>&times;</span>
                        </div>
                        <form onSubmit={handleSubmit} className={styles['form-layout']}>
                            <div className={styles.field}>
                                <label>Category</label>
                                <input
                                    type='text'
                                    placeholder="Enter Description"
                                    value={newCategory.category}
                                    onChange={(e) => setNewCategory({ ...newCategory, category: e.target.value })}
                                    required
                                />

                            </div>
                            <div className={styles.field}>
                                <label>Description</label>
                                <input
                                    type='text'
                                    placeholder="Enter Description"
                                    value={newCategory.description}
                                    onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                                    required
                                />
                            </div>

                            {/* Image Upload */}
                            <div className={styles.field}>
                                <label>Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setNewCategory({ ...newCategory, image: e.target.value })}
                                />
                            </div>
                            <button type="submit" className={styles['submit-btn']}>
                                {loading ? <CircularProgress size={24} /> : (editingCategory ? 'Update Category' : 'Add Category')}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Category;

