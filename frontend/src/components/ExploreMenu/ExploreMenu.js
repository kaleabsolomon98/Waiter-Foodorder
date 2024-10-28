import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ExploreMenu.css';

const ExploreMenu = ({ category, setCategory }) => {
    const [menuCategories, setMenuCategories] = useState([]);
    const [subMenuItems, setSubMenuItems] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);

    // Fetch categories on component mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get('http://localhost:4422/categories');
                setMenuCategories(response.data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        fetchCategories();
    }, []);

    // Fetch all subcategories once
    useEffect(() => {
        const fetchSubCategories = async () => {
            try {
                const response = await axios.get('http://localhost:4422/subcategories');
                setSubMenuItems(response.data);
            } catch (error) {
                console.error('Error fetching subcategories:', error);
            }
        };

        fetchSubCategories();
    }, []);

    // Update selected category on category change
    useEffect(() => {
        const selected = menuCategories.find(item => item.name === category) || null;
        setSelectedCategory(selected);
    }, [category, menuCategories]);

    // Filter subcategories based on selected category ID
    const filteredSubMenuItems = subMenuItems.filter(subItem => selectedCategory && subItem.category_id === selectedCategory.id);

    return (
        <div className='explore-menu' id='explore-menu'>
            <h1>Explore our menu</h1>
            <p>Choose from a diverse menu featuring a delectable array of dishes crafted with the finest ingredients and culinary expertise. Our mission is to satisfy your dining experience, one delicious meal at a time.</p>
            <div className='explore-menu-list'>
                {menuCategories.map((item, index) => (
                    <div
                        onClick={() => setCategory(prev => prev === item.name ? 'All' : item.name)}
                        key={index}
                        className='explore-menu-list-item'
                    >
                        <img
                            className={category === item.name ? 'active' : ''}
                            src={item.image}  // Assuming each category has an `image` property
                            alt={item.name}
                        />
                        <p>{item.name}</p>
                    </div>
                ))}
            </div>
            <hr />

            {filteredSubMenuItems.length > 0 && (
                <div>
                    <h2>Sub Menu</h2>
                    <div className='explore-menu-list'>
                        {filteredSubMenuItems.map((item, index) => (
                            <div
                                onClick={() => setCategory(prev => prev === item.name ? 'All' : item.name)}
                                key={index}
                                className='explore-menu-list-item'
                            >
                                <img
                                    className={category === item.name ? 'active' : ''}
                                    src={item.image}  // Assuming each subcategory has an `image` property
                                    alt={item.name}
                                />
                                <p>{item.name}</p>
                            </div>
                        ))}
                    </div>
                    <hr />
                </div>
            )}
        </div>
    );
};

export default ExploreMenu;
