import React from 'react'
import './ExploreMenu.css'
import { food_list, menu_list } from '../../assets/frontend_assets/assets'

const ExploreMenu = () => {
    return (
        <div className='explore-menu' id='explore-menu'>
            <h1>Explore our menu</h1>
            <p>Choose from a diverse menu featuring a delectable array of dishes crafted with the finest ingridents and culinary expertise.our mission is to satisfy your dining experience,one delicious meal at a time</p>
            <div className='explore-menu-list'>
                {menu_list.map((item, index) => {
                    return (<div key={index} className='explore-menu-list-item'>
                        <img src={item.menu_image} alt="" />
                        <p>{item.menu_name}</p>
                    </div>)
                })}
            </div>
            <hr />
        </div>
    )
}

export default ExploreMenu
