import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CircularProgress from '@mui/material/CircularProgress';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import styles from './Category.module.css';

const Category = () => {
    const [categories, setCategories] = useState([]);
    const [loadingEditId, setLoadingEditId] = useState(null); // Tracks loading state for edit actions
    const [loadingDeleteId, setLoadingDeleteId] = useState(null); // Tracks loading state for delete actions
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [newCategory, setNewCategory] = useState({ name: '', description: '', image: null });

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get('http://localhost:4422/categories');
                setCategories(response.data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };
        fetchCategories();
    }, []);

    const openModal = (category = null) => {
        if (category) {
            setEditingCategory(category);
            setNewCategory({ name: category.name, description: category.description, image: category.image });
        } else {
            setEditingCategory(null);
            setNewCategory({ name: '', description: '', image: null });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingCategory(null);
    };

    const handleFileChange = (e) => {
        setNewCategory({ ...newCategory, image: e.target.files[0] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoadingEditId(editingCategory ? editingCategory.id : 'new');

        const formData = new FormData();
        formData.append('name', newCategory.name);
        formData.append('description', newCategory.description);
        if (newCategory.image) formData.append('image', newCategory.image);

        try {
            if (editingCategory) {
                const response = await axios.put(`http://localhost:4422/categories/${editingCategory.id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                setCategories(categories.map((item) =>
                    item.id === editingCategory.id ? response.data : item
                ));
            } else {
                const response = await axios.post('http://localhost:4422/categories', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                console.log(response.data);
                setCategories([...categories, response.data]);
            }
            closeModal();
        } catch (error) {
            console.error('Error saving category:', error);
        } finally {
            setLoadingEditId(null);
        }
    };

    const handleDelete = async (id) => {
        setLoadingDeleteId(id);
        try {
            await axios.delete(`http://localhost:4422/categories/${id}`);
            setCategories(categories.filter(item => item.id !== id));
        } catch (error) {
            console.error('Error deleting category:', error);
        } finally {
            setLoadingDeleteId(null);
        }
    };

    return (
        <div className={styles.container}>
            <h2>Manage Categories</h2>
            <button className={styles['add-btn-category']} onClick={() => openModal()}>
                <FaPlus /> Add New Category
            </button>

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
                            <td>{item.name}</td>
                            <td>{item.description}</td>
                            <td>
                                {item.image && (
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        style={{ width: '50px', height: '50px' }}
                                    />
                                )}
                            </td>
                            <td className={styles.actions}>
                                <button
                                    className={styles['edit-btn']}
                                    onClick={() => openModal(item)}
                                    disabled={loadingDeleteId === item.id}
                                >
                                    {loadingEditId === item.id ? (
                                        <CircularProgress size={20} />
                                    ) : (
                                        <FaEdit />
                                    )}
                                </button>
                                <button
                                    className={styles['delete-btn']}
                                    onClick={() => handleDelete(item.id)}
                                    disabled={loadingEditId === item.id}
                                >
                                    {loadingDeleteId === item.id ? (
                                        <CircularProgress size={20} />
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
                            <h2>{editingCategory ? 'Edit Category' : 'Add New Category'}</h2>
                            <span className={styles.close} onClick={closeModal}>&times;</span>
                        </div>
                        <form onSubmit={handleSubmit} className={styles['form-layout']}>
                            <div className={styles.field}>
                                <label>Category</label>
                                <input
                                    type='text'
                                    placeholder="Enter Category Name"
                                    value={newCategory.name}
                                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
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
                            <div className={styles.field}>
                                <label>Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                            </div>
                            <button type="submit" className={styles['submit-btn']}>
                                {loadingEditId === 'new' || loadingEditId === editingCategory?.id ? (
                                    <CircularProgress size={24} />
                                ) : (
                                    editingCategory ? 'Update Category' : 'Add Category'
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Category;
