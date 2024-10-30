import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CircularProgress from '@mui/material/CircularProgress';
import { FaTrash } from 'react-icons/fa';
import styles from './OrderList.module.css';
import baseUrl from '../../components/Constants/base_url';
import { useNavigate } from 'react-router-dom';

const OrderList = () => {
    const [orders, setOrders] = useState([]); // Initialize as an empty array
    const [loading, setLoading] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${baseUrl}orders`);
                if (Array.isArray(response.data)) {
                    setOrders(response.data);
                } else {
                    console.error('Unexpected response format:', response.data);
                    setOrders([]); // Set to empty array if response format is unexpected
                }
            } catch (error) {
                console.error('Error fetching orders:', error);
                setOrders([]); // Set to empty array on error
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const handleDelete = async (id) => {
        setDeletingId(id);
        try {
            await axios.delete(`${baseUrl}orders/${id}`);
            setOrders(orders.filter(order => order.id !== id));
        } catch (error) {
            console.error('Error deleting order:', error);
        } finally {
            setDeletingId(null);
        }
    };

    const handleRowClick = (id) => {
        navigate(`/order-details/${id}`);
    };

    return (
        <div className={styles.container}>
            <h2>Orders</h2>
            {loading ? (
                <CircularProgress />
            ) : (
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Order Number</th>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Table Number</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr key={order.id} onClick={() => handleRowClick(order.id)}>
                                <td>{order.orderNumber}</td>
                                <td>{new Date(order.date).toLocaleDateString()}</td>
                                <td>{new Date(order.time).toLocaleTimeString()}</td>
                                <td>{order.tableNumber}</td>
                                <td>${(parseFloat(order.amount) || 0).toFixed(2)}</td>
                                <td>{order.status}</td>
                                <td className={styles.actions}>
                                    <button
                                        className={styles['delete-btn']}
                                        onClick={(e) => {
                                            e.stopPropagation(); // Prevent navigation
                                            handleDelete(order.id);
                                        }}
                                        disabled={deletingId === order.id}
                                    >
                                        {deletingId === order.id ? (
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
            )}
        </div>
    );
};

export default OrderList;
