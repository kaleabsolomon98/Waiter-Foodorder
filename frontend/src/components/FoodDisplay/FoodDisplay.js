import React, { useContext } from 'react'
import { StoreContext } from '../../context/StoreContext';
import FoodItem from '../FoodItem/FoodItem';
import './FoodDisplay.css'

const FoodDisplay = ({ category }) => {
    const { food_list } = useContext(StoreContext);
    return (
        <div className='food-display' id='food-display'>
            <h2>Top dishes near you</h2>
            <div className='food-display-list'>
                {food_list.map((item, index) => {
                    console.log("----KAL-------"); 
                    console.log(category);
                    console.log(item);
                    { console.log(category, item.category); }
                    if (category === "All" || category === item.category) {
                        return <FoodItem key={index} id={item._id} name={item.name} price={item.price} description={item.description} image={item.image} />
                    }
                })}
            </div>
        </div>
    )
}

export default FoodDisplay
