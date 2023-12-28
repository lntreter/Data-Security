import React, { useState } from 'react';

const Counter = () => {

    const [count, setCount] = React.useState(0);

    return (
        <div className="flex mx-auto space-x-8 justify-center items-center">

            <button className="bg-blue-700 text-white h-8 w-8"
                onClick={() => setCount(prev => prev + 1)}
            >+</button>

            <h1>{count}</h1>

            <button className="bg-red-700 text-white h-8 w-8"
                onClick={() => setCount(prev => prev - 1)}
            >-</button>
        </div>
    )
         
} 

export default Counter;