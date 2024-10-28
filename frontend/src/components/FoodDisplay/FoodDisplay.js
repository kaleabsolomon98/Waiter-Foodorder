import React, { useContext } from 'react';
import { StoreContext } from '../../context/StoreContext'; // Update the import path as necessary
import FoodItem from '../FoodItem/FoodItem';
import './FoodDisplay.css';

const FoodDisplay = ({ category, subCategory }) => {
    const { foodList } = useContext(StoreContext); // Access foodList from context

    // Filtered list based on category and subcategory
    const filteredFoodList = foodList.filter(
        item => item &&
            (category === "All" || category === item.category) &&
            (subCategory === "All" || subCategory === item.subCategory)
    );

    return (
        <div className='food-display' id='food-display'>
            {filteredFoodList.length > 0 ? (
                <>
                    <h2>Top dishes near you</h2>
                    <div className='food-display-list'>
                        {filteredFoodList.map((item, index) => (
                            <FoodItem
                                key={index}
                                id={item.id}
                                name={item.name}
                                price={item.price}
                                description={item.description}
                                image={item.image}
                            />
                        ))}
                    </div>
                </>
            ) : (
               null
            )}
        </div>
    );
};

export default FoodDisplay;
