import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CircularProgress from '@mui/material/CircularProgress';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import styles from './SubCategory.module.css';
import baseUrl from '../../components/Constants/base_url';

const SubCategory = () => {
    const [subCategories, setSubCategories] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loadingEditId, setLoadingEditId] = useState(null); // Tracks loading state for edit actions
    const [loadingDeleteId, setLoadingDeleteId] = useState(null); // Tracks loading state for delete actions
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newSubCategory, setNewSubCategory] = useState({ name: '', category_id: '', description: '', image: null });
    const [editingSubCategory, setEditingSubCategory] = useState(null);

    // Fetch categories and subcategories from APIs
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get(`${baseUrl}categories`);
                setCategories(response.data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        const fetchSubCategories = async () => {
            try {
                const response = await axios.get(`${baseUrl}subcategories`);
                setSubCategories(response.data);
            } catch (error) {
                console.error('Error fetching subcategories:', error);
            }
        };

        fetchCategories();
        fetchSubCategories();
    }, []);

    const openModal = (subCategory = null) => {
        if (subCategory) {
            setEditingSubCategory(subCategory);
            setNewSubCategory({
                name: subCategory.name,
                category_id: subCategory.category_id,
                description: subCategory.description,
                image: subCategory.image
            });
        } else {
            setEditingSubCategory(null);
            setNewSubCategory({ name: '', category_id: '', description: '', image: null });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingSubCategory(null);
    };

    const handleFileChange = (e) => {
        setNewSubCategory({ ...newSubCategory, image: e.target.files[0] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoadingEditId(editingSubCategory ? editingSubCategory.id : 'new');

        const formData = new FormData();
        formData.append('name', newSubCategory.name);
        formData.append('category_id', newSubCategory.category_id);
        formData.append('description', newSubCategory.description);
        if (newSubCategory.image) formData.append('image', newSubCategory.image);

        try {
            if (editingSubCategory) {
                const response = await axios.put(`${baseUrl}subcategories/${editingSubCategory.id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                setSubCategories(subCategories.map((item) =>
                    item.id === editingSubCategory.id ? response.data : item
                ));
            } else {
                const response = await axios.post(`${baseUrl}subcategories`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                setSubCategories([...subCategories, response.data]);
            }
            closeModal();
        } catch (error) {
            console.error('Error saving subcategory:', error);
        } finally {
            setLoadingEditId(null);
        }
    };

    const handleDelete = async (id) => {
        setLoadingDeleteId(id);
        try {
            await axios.delete(`${baseUrl}/subcategories/${id}`);
            setSubCategories(subCategories.filter(item => item.id !== id));
        } catch (error) {
            console.error('Error deleting subcategory:', error);
        } finally {
            setLoadingDeleteId(null);
        }
    };

    return (
        <div className={styles.container}>
            <h2>Manage Subcategories</h2>
            <button className={styles['add-btn-category']} onClick={() => openModal()}>
                <FaPlus /> Add New Sub Category
            </button>

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
                            <td>{item.name}</td>
                            <td>{categories.find(cat => cat.id === item.category_id)?.name || 'Unknown'}</td>
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
                            <h2>{editingSubCategory ? 'Edit Subcategory' : 'Add New Subcategory'}</h2>
                            <span className={styles.close} onClick={closeModal}>&times;</span>
                        </div>
                        <form onSubmit={handleSubmit} className={styles['form-layout']}>
                            <div className={styles.field}>
                                <label>Subcategory Name</label>
                                <input
                                    type='text'
                                    placeholder="Enter Subcategory Name"
                                    value={newSubCategory.name}
                                    onChange={(e) => setNewSubCategory({ ...newSubCategory, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className={styles.field}>
                                <label>Category</label>
                                <select
                                    value={newSubCategory.category_id}
                                    onChange={(e) => setNewSubCategory({ ...newSubCategory, category_id: e.target.value })}
                                    required
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
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
                            <div className={styles.field}>
                                <label>Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                            </div>
                            <button type="submit" className={styles['submit-btn']}>
                                {loadingEditId === 'new' || loadingEditId === editingSubCategory?.id ? (
                                    <CircularProgress size={24} />
                                ) : (
                                    editingSubCategory ? 'Update Subcategory' : 'Add Subcategory'
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubCategory;
