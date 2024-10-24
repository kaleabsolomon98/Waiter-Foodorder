import React, { useEffect } from 'react'
import './ExploreMenu.css'
import { food_list, menu_list, Salad, Sandwich, Rolls, Deserts, } from '../../assets/frontend_assets/assets'

const ExploreMenu = ({ category, setCategory }) => {

    useEffect(() => {
        console.log('Current category updated:', category); // Logs after every state update
    }, [category]); // This effect runs whenever `category` changes

    return (
        <div className='explore-menu' id='explore-menu'>
            <h1>Explore our menu</h1>
            <p>Choose from a diverse menu featuring a delectable array of dishes crafted with the finest ingredients and culinary expertise. Our mission is to satisfy your dining experience, one delicious meal at a time.</p>
            <div className='explore-menu-list'>
                {menu_list.map((item, index) => {
                    return (
                        <div
                            onClick={() => setCategory(prev => prev === item.menu_name ? 'All' : item.menu_name)}
                            key={index}
                            className='explore-menu-list-item'
                        >
                            <img
                                className={category === item.menu_name ? 'active' : ''}
                                src={item.menu_image}
                                alt={item.menu_name}
                            />
                            <p>{item.menu_name}</p>
                        </div>
                    )
                })}
            </div>
            <hr />

            {category !== 'All' && (
                <div>
                    <h2>sub menu</h2>
                    <div className='explore-menu-list'>
                        {Salad.map((item, index) => {
                            // Add the missing return here
                            return (
                                <div
                                    onClick={() => setCategory(prev => prev === item.menu_name ? 'All' : item.menu_name)}
                                    key={index}
                                    className='explore-menu-list-item'
                                >
                                    <img
                                        className={category === item.menu_name ? 'active' : ''}
                                        src={item.menu_image}
                                        alt={item.menu_name}
                                    />
                                    <p>{item.menu_name}</p>
                                </div>
                            );
                        })}
                    </div>
                    <hr />
                </div>
            )}
        </div>
    )
}

export default ExploreMenu;
