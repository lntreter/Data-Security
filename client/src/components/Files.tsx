import React, { useState } from 'react';

// localhost:3000/list adresine get request atıp, dönen sonucu ekrana yazdırır.

const Files = () => {
    const [data, setData] = useState([]);

    const getData = async () => {
        const response = await fetch('http://localhost:3000/list');
        const data = await response.text();
        setData(JSON.parse(data));
        console.log(data);
    }

    return (
        <div className='flex mx-auto space-x-8 justify-center items-center'>
            <button onClick={getData}>Get Data</button>
            <p>{data}</p>
        </div>
    );
}

export default Files;