import React, { useState } from 'react'
import './Home.css'
import Header from '../../components/Header/Header'
import ExploreMenu from '../../components/ExploreMenu/ExploreMenu'
import FoodDisplay from '../../components/FoodDisplay/FoodDisplay'

const Home = () => {
    const [category, setCategory] = useState('All');
    const [subCategory, setSubCategory] = useState('All');


    return (
        <div>
            <Header />
            <ExploreMenu category={category} setCategory={setCategory} subCategory={subCategory} setSubCategory={setSubCategory} />
            <FoodDisplay category={category} subCategory={subCategory} />
        </div>
    )
}

export default Home
