import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CircularProgress from '@mui/material/CircularProgress';
import styles from './OrderDetails.module.css'; // Adjust import as necessary
import baseUrl from '../../components/Constants/base_url'; // Make sure this path is correct
import { useParams } from 'react-router-dom';

const OrderDetails = () => {
    const [orderDetails, setOrderDetails] = useState([]);
    const [loading, setLoading] = useState(false);
    const { id } = useParams(); // Use useParams to get the ID from the route

    useEffect(() => {
        const fetchOrderDetails = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${baseUrl}order-details/${id}`);
                if (Array.isArray(response.data)) {
                    setOrderDetails(response.data);
                } else {
                    console.error('Unexpected response format:', response.data);
                    setOrderDetails([]);
                }
            } catch (error) {
                console.error('Error fetching order details:', error);
                setOrderDetails([]);
            } finally {
                setLoading(false);
            }
        };

        fetchOrderDetails();
    }, [id]);

    return (
        <div className={styles.container}>
            <h2>Order Details</h2>

            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Item Name</th>
                        <th>Category</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Sub Total</th>
                        <th>Status</th>
                        <th>Note</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan="7" style={{ textAlign: 'center' }}>
                                <CircularProgress />
                            </td>
                        </tr>
                    ) : (
                        orderDetails.map((detail) => (
                            <tr key={detail.Receipt_DetailID}>
                                <td>{detail.Item_Name}</td>
                                <td>{detail.Category}</td>
                                <td>{detail.Quantity}</td>
                                <td>${(parseFloat(detail.Price) || 0).toFixed(2)}</td>
                                <td>${(parseFloat(detail.Sub_Total) || 0).toFixed(2)}</td>
                                <td>{detail.Status !== null ? (detail.Status ? 'Active' : 'Inactive') : 'N/A'}</td>
                                <td>{detail.Note || 'N/A'}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default OrderDetails;
