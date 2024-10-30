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
                console.log("--THIS IS RESPONSE DETAIL--------", response.data);
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
                            <tr key={detail.receipt_detailid}>
                                <td>{detail.item_name}</td>
                                <td>{detail.category}</td>
                                <td>{detail.quantity}</td>
                                <td>${(parseFloat(detail.price) || 0).toFixed(2)}</td>
                                <td>${(parseFloat(detail.sub_total) || 0).toFixed(2)}</td>
                                <td>{detail.Status !== null ? (detail.status ? 'Active' : 'Inactive') : 'N/A'}</td>
                                <td>{detail.note || 'N/A'}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default OrderDetails;
