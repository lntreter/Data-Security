import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CryptoJS from 'crypto-js';
import { Buffer } from 'buffer';

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
    const [fileContent, setFileContent] = useState('');

    const [selectedOption, setSelectedOption] = useState('');

    useEffect(() => {
        console.log(selectedOption);
    }), [selectedOption];

    useEffect(() => {
        console.log(fileContent);
    } ), [fileContent];

    const handleSelectChange = (event) => {
        setSelectedOption(event.target.value);
    }

    function uint8ArrayToBase64(uint8Array) {
        // Uint8Array'i bir karakter dizisine dönüştür
        const chars = Array.from(uint8Array, byte => String.fromCharCode(byte as number)).join('');
    
        // Bu karakter dizisini Base64'e dönüştür
        return btoa(chars);
    }

    const getData = async () => {
        const response = await fetch('http://localhost:3000/list');
        const data = await response.text();
        setData(JSON.parse(data));
        console.log(data);

        document.getElementById("getData").innerHTML = "⟳ Dosyaları Yenile";
    }

    const handleFileRead = async (event) => {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
            const arrayBuffer = e.target?.result as ArrayBuffer;
            const uint8Array = new Uint8Array(arrayBuffer);
            // Şimdi uint8Array'ı şifreleyebilirsiniz
            if (selectedOption == 'DES') {

                console.log("uint8Array: " + uint8Array);

                const base64Data = uint8ArrayToBase64(uint8Array);

                const encrypted = CryptoJS.DES.encrypt(base64Data, '12345678');

                setFileContent(encrypted.toString());

                console.log("base64Data: " + base64Data)

                axios.post('http://localhost:3000/upload', {
                    byteArray: base64Data
                })
                .then(response => console.log(response.data))
                .catch(error => console.error(error));
            }
            else if (selectedOption == 'AES') {
                const encrypted = CryptoJS.AES.encrypt(uint8Array.toString(), '12345678');
                setFileContent(encrypted.toString());
            }
            else if (selectedOption == 'Blowfish') {
                const encrypted = CryptoJS.Blowfish.encrypt(uint8Array.toString(), '12345678');
                setFileContent(encrypted.toString());
            }
            else if (selectedOption == 'RSA') {
                const encrypted = CryptoJS.AES.encrypt(uint8Array.toString(), '12345678');
                setFileContent(encrypted.toString());
            }
            else {
                alert("Lütfen bir şifreleme algoritması seçiniz.");
            }
                
        };
        reader.readAsArrayBuffer(file);
        // dosyayı seçilen şifreleme algoritmasına göre şifrelenecek
        // şifreleme algoritması seçilmediyse uyarı verilecek

        // dosya şifrelendikten sonra şifrelenmiş dosya sunucuya gönderilecek
    }

    return (

        <div className="md:px-32 py-8 w-full">


            <button id="getData" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={getData}>
                Dosyaları Görüntüle
            </button>


            <p className="mt-5"> </p>
            
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
                                            <td className="w-1/3 text-left py-3 px-7"><a className="hover:text-green-500">{fileSize} byte</a></td>
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
                                            <td className="w-1/3 text-left py-3 px-7"><a className="hover:text-green-500">{fileSize} byte</a></td>
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

            <link rel="stylesheet" href="https://unpkg.com/flowbite@1.4.4/dist/flowbite.min.css" />
            
            <div className=" float-right">
                
                <link rel="stylesheet" href="https://unpkg.com/flowbite@1.4.4/dist/flowbite.min.css" />
                
                <div className=" mt-5 max-h-9 ml-auto">

                    <select value={selectedOption} onChange={handleSelectChange} id="encrypt" className=" ml-auto bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                        <option selected>Bir şifreleme algoritması seçin</option>
                        <option id='opt1' value="RSA">RSA</option>
                        <option id='opt2' value="DES">DES</option>
                        <option id='opt3' value="AES">AES</option>
                        <option id='opt4' value="Blowfish">Blowfish</option>
                    </select>
                    
                    <input type="text" id="first_name" className="mt-2 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Anahtar Değeri" required/>

                    <input id='file_input' onChange={handleFileRead} className=" ml-auto mt-2 block text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" type="file"/>

                    <script src="https://unpkg.com/flowbite@1.4.0/dist/flowbite.js"></script>
                    
                </div>

                <script src="https://unpkg.com/flowbite@1.4.0/dist/flowbite.js"></script>
            </div>
        </div>
    
    );
}

export default Files;