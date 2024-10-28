import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CircularProgress from '@mui/material/CircularProgress';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import styles from './SubCategory.module.css';

const SubCategory = () => {
    const [subCategories, setSubCategories] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newSubCategory, setNewSubCategory] = useState({ name: '', category_id: '', description: '', image: '' });
    const [editingSubCategory, setEditingSubCategory] = useState(null);

    // Fetch categories and subcategories from APIs
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get('http://localhost:4422/categories');
                setCategories(response.data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        const fetchSubCategories = async () => {
            setLoading(true);
            try {
                const response = await axios.get('http://localhost:4422/subcategories');
                setSubCategories(response.data);
            } catch (error) {
                console.error('Error fetching subcategories:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
        fetchSubCategories();
    }, []);

    const openModal = (subCategory = null) => {
        if (subCategory) {
            setEditingSubCategory(subCategory);
            setNewSubCategory({
                subcategory: subCategory.subcategory,
                category_id: subCategory.category_id,
                description: subCategory.description,
                image: subCategory.image
            });
        } else {
            setEditingSubCategory(null);
            setNewSubCategory({ name: '', category_id: '', description: '', image: '' });
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
                await axios.put(`http://localhost:4422/subcategories/${editingSubCategory.id}`, newSubCategory);
                setSubCategories(subCategories.map(item =>
                    item.id === editingSubCategory.id ? { ...item, ...newSubCategory } : item
                ));
            } else {
                const response = await axios.post('http://localhost:4422/subcategories', newSubCategory);
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
            await axios.delete(`http://localhost:4422/subcategories/${id}`);
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
            ) : (
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Subcategory</th>
                            <th>Category</th>
                            <th>Description</th>
                            <th>Image</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {subCategories.map((item) => (
                            <tr key={item.id}>
                                <td>{item.subcategory}</td>
                                <td>{categories.find(cat => cat.id === item.category_id)?.name || 'Unknown'}</td>
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
                                    value={newSubCategory.category_id}
                                    onChange={(e) => setNewSubCategory({ ...newSubCategory, category_id: e.target.value })}
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
                                <input
                                    type="text"
                                    placeholder="Enter Subcategory Name"
                                    value={newSubCategory.subcategory}
                                    onChange={(e) => setNewSubCategory({ ...newSubCategory, subcategory: e.target.value })}
                                    required
                                />
                            </div>

                            <div className={styles.field}>
                                <label>Description</label>
                                <input
                                    type='text'
                                    placeholder="Enter Description"
                                    value={newSubCategory.description}
                                    onChange={(e) => setNewSubCategory({ ...newSubCategory, description: e.target.value })}
                                    required
                                />
                            </div>

                            {/* Image Upload */}
                            <div className={styles.field}>
                                <label>Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setNewSubCategory({ ...newSubCategory, image: e.target.value })}
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

export default SubCategory;
