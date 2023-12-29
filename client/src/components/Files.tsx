import React, { useState } from 'react';

// localhost:3000/list adresine get request atıp, dönen sonucu ekrana yazdırır.

interface FileData {
    names: {
      uploadFiles: string[];
      encryptedFiles: string[];
    };
    size: {
      uploadFilesSize: number[];
      encryptedFilesSize: number[];
    };
    extension: {
      uploadFilesExtension: string[];
      encryptedFilesExtension: string[];
    };
  }

const Files = () => {
    
    const [data, setData] = useState<FileData | null> (null as any);

    const getData = async () => {
        const response = await fetch('http://localhost:3000/list');
        const data = await response.text();
        setData(JSON.parse(data));
        console.log(data);

        document.getElementById("getData").innerHTML = "⟳ Dosyaları Yenile";
    }

    return (

        // <div className="md:px-32 py-8 w-full">

        // <div className="flex flex-col items-center justify-center min-h-screen py-2">
        //     <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={getData}>
        //         Get Data
        //     </button>
        //     <div>
        //         {data.map((item: any) => (
        //             <div key={item.id}>
        //                 <h1>{item.name}</h1>
        //                 <p>{item.email}</p>
        //             </div>
        //         ))}
        //     </div>
        // </div>

        // <div className="shadow overflow-hidden rounded border-b border-gray-200">
        //     <table className="min-w-full bg-white">
        //     <thead className="bg-gray-800 text-white">
        //         <tr>
        //         <th className="w-1/3 text-left py-3 px-4 uppercase font-semibold text-sm">Name</th>
        //         <th className="w-1/3 text-left py-3 px-4 uppercase font-semibold text-sm">Last name</th>
        //         <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Phone</th>
        //         <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Email</th>
        //         </tr>
        //     </thead>
        //     <tbody className="text-gray-700">
        //     <tr>
        //         <td className="w-1/3 text-left py-3 px-4">Lian</td>
        //         <td className="w-1/3 text-left py-3 px-4">Smith</td>
        //         <td className="text-left py-3 px-4"><a className="hover:text-blue-500" href="tel:622322662">622322662</a></td>
        //         <td className="text-left py-3 px-4"><a className="hover:text-blue-500" href="mailto:jonsmith@mail.com">jonsmith@mail.com</a></td>
        //     </tr>
        //     <tr className="bg-gray-100">
        //         <td className="w-1/3 text-left py-3 px-4">Emma</td>
        //         <td className="w-1/3 text-left py-3 px-4">Johnson</td>
        //         <td className="text-left py-3 px-4"><a className="hover:text-blue-500" href="tel:622322662">622322662</a></td>
        //         <td className="text-left py-3 px-4"><a className="hover:text-blue-500" href="mailto:jonsmith@mail.com">jonsmith@mail.com</a></td>
        //     </tr>
        //     <tr>
        //         <td className="w-1/3 text-left py-3 px-4">Oliver</td>
        //         <td className="w-1/3 text-left py-3 px-4">Williams</td>
        //         <td className="text-left py-3 px-4"><a className="hover:text-blue-500" href="tel:622322662">622322662</a></td>
        //         <td className="text-left py-3 px-4"><a className="hover:text-blue-500" href="mailto:jonsmith@mail.com">jonsmith@mail.com</a></td>
        //     </tr>
        //     <tr className="bg-gray-100">
        //         <td className="w-1/3 text-left py-3 px-4">Isabella</td>
        //         <td className="w-1/3 text-left py-3 px-4">Brown</td>
        //         <td className="text-left py-3 px-4"><a className="hover:text-blue-500" href="tel:622322662">622322662</a></td>
        //         <td className="text-left py-3 px-4"><a className="hover:text-blue-500" href="mailto:jonsmith@mail.com">jonsmith@mail.com</a></td>
        //     </tr>
        //     </tbody>
        //     </table>
        // </div>
        // </div>

        <div className="md:px-32 py-8 w-full">

            <button id="getData" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={getData}>
                Dosyaları Görüntüle
            </button>
            
            <div className="shadow overflow-hidden round ed border-b border-gray-200">
            <table className="min-w-full leading-normal">
                <thead className="bg-gray-800 text-white">
                    <tr>
                    <th className="w-1/3 text-left py-3 px-4 uppercase font-semibold text-sm">Dizin</th>
                        <th className="w-1/3 text-left py-3 px-4 uppercase font-semibold text-sm">Dosya Adı</th>
                        <th className="w-1/3 text-left py-3 px-4 uppercase font-semibold text-sm">Boyut</th>
                        <th className="w-1/3 text-center py-3 px-4 uppercase font-semibold text-sm">Tür (Uzantı)</th>
                        <th className="w-4/5 text-right px-3 uppercase font-semibold text-sm">İndir</th>
                        <th className="w-1/3 text-left px-3 uppercase font-semibold text-sm">Sil</th>
                        {/* Diğer başlık sütunları gerekirse buraya eklenebilir */}
                    </tr>
                </thead>
                <tbody className="text-gray-700">
                    {data ? (
                        <>
                            {data.names.uploadFiles.map((fileName, index) => {
                                const fileSize = data.size.uploadFilesSize[index];
                                const fileExt = data.extension.uploadFilesExtension[index];

                                return (
                                    <tr className="bg-gray-100" key={index}>
                                        <td className="w-1/3 text-left py-3 px-4"><a className="hover:text-green-500">Uploads</a></td>
                                        <td className="w-1/3 text-left py-3 px-4"><a className="hover:text-green-500">{fileName}</a></td>
                                        <td className="w-1/3 text-left py-3 px-7"><a className="hover:text-green-500">{fileSize}</a></td>
                                        <td className="w-1/3 text-center py-3 px-4"><a className="hover:text-green-500">{fileExt}</a></td>
                                        <td className="w-4/5 text-right px-3"><a className="hover:text-blue-500"><button>İndir</button></a></td>
                                        <td className="w-1/3 text-left px-3"><a className="hover:text-blue-500"><button >Sil</button></a></td>
                                    </tr>
                                );
                            })}
                            {data.names.encryptedFiles.map((fileName, index) => {
                                const fileSize = data.size.encryptedFilesSize[index];
                                const fileExt = data.extension.encryptedFilesExtension[index];

                                return (
                                    <tr className="bg-gray-100" key={index}>
                                        <td className="w-1/3 text-left py-3 px-4"><a className="hover:text-green-500">Encrypted</a></td>
                                        <td className="w-1/3 text-left py-3 px-4"><a className="hover:text-green-500">{fileName}</a></td>
                                        <td className="w-1/3 text-left py-3 px-7"><a className="hover:text-green-500">{fileSize}</a></td>
                                        <td className="w-1/3 text-center py-3 px-4"><a className="hover:text-green-500">{fileExt}</a></td>
                                        <td className="w-4/5 text-right px-3"><a className="hover:text-blue-500"><button>İndir</button></a></td>
                                        <td className="w-1/3 text-left px-3"><a className="hover:text-blue-500"><button>Sil</button></a></td>
                                    </tr>
                                );
                            })}
                        </>
                    ) : (
                        <tr>
                            <td colSpan={6}>Dosya bilgileri yükleniyor...</td>
                        </tr>
                    )}
                </tbody>
            </table>

            </div>
        </div>
    
    );
}

export default Files;