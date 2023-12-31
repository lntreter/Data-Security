import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CryptoJS from 'crypto-js';
import { Popover } from '@material-tailwind/react';

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
    extension: {s
      uploadFilesExtension: string[];
      encryptedFilesExtension: string[];
    };
  }

const Files = () => {
    
    const [data, setData] = useState<FileData | null> (null as any);
    const [fileContent, setFileContent] = useState('');
    const [folderContent, setFolderContent] = useState('');

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




    const ModalClick = () => {
        document.getElementById("modal").classList.add('scale-100')
    }

    const CloseModalClick = () => {
        document.getElementById("modal").classList.remove('scale-100')
    }




    function uint8ArrayToBase64(uint8Array) {
        // Uint8Array'i bir karakter dizisine dönüştür
        const chars = Array.from(uint8Array, byte => String.fromCharCode(byte as number)).join('');
    
        // Bu karakter dizisini Base64'e dönüştür
        return btoa(chars);
    }

    const getFolderData = async () => {
        const response = await fetch('http://localhost:3000/list');
        const data = await response.text();
        setFolderContent(JSON.parse(data));
        console.log("Dosyalar: "+ data);
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

        const fileName = file.name;

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
                    byteArray: encrypted.toString(),
                    fileName: fileName

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

        <div className="md:px-32 py-8 w-full BG-">


            <button id="getData" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={getData}>
                Dosyaları Görüntüle
            </button>

            
            <button
                data-ripple-light="true"
                data-popover-target="popover"
                className="middle none center rounded-lg bg-gradient-to-tr from-pink-600 to-pink-400 py-3 px-6 font-sans text-xs font-bold uppercase text-white shadow-md shadow-pink-500/20 transition-all hover:shadow-lg hover:shadow-pink-500/40 active:opacity-[0.85] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                >Show Popover
            </button>
            <div
                data-popover="popover"
                data-popover-placement="right"
                className="absolute w-max whitespace-normal break-words rounded-lg border border-blue-gray-50 bg-white p-4 font-sans text-sm font-normal text-blue-gray-500 shadow-lg shadow-blue-gray-500/10 focus:outline-none"
                >This is a very beautiful popover, show some love.
            </div>

            <div>
                <button onClick={ModalClick} id="buttonmodal" className="mt-2 p-2 bg-blue-600 text-white bg-opacity-75 rounded-lg" type="button">
                    Dosya Yükle</button>
            </div>

            <div id="modal"
                className="fixed top-0 left-0 w-screen h-screen flex items-center justify-center bg-gray-500 bg-opacity-50 transform scale-0 transition-transform duration-300">
                
                <div className="bg-gradient-to-bl from-blue-50 to-violet-50 flex items-center justify-center">
                    <div className="container mx-auto p-4">
                        
                        
                        <div className="relative flex w-96 flex-col rounded-xl bg-white bg-clip-border text-gray-700 shadow-md">
                            <div className="p-6">
                                <h5 className="mb-2 block font-sans text-xl font-semibold leading-snug tracking-normal text-blue-gray-900 antialiased">
                                UI/UX Review Check
                                </h5>
                                <p className="block font-sans text-base font-light leading-relaxed text-inherit antialiased">
                                The place is close to Barceloneta Beach and bus stop just 2 min by walk
                                and near to "Naviglio" where you can enjoy the main night life in
                                Barcelona.
                                </p>
                            </div>
                            <div className="p-6 pt-0">
                            <button
                                data-ripple-light="true"
                                data-popover-target="popover"
                                className="middle none center rounded-lg bg-gradient-to-tr from-pink-600 to-pink-400 py-3 px-6 font-sans text-xs font-bold uppercase text-white shadow-md shadow-pink-500/20 transition-all hover:shadow-lg hover:shadow-pink-500/40 active:opacity-[0.85] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                                >Show Popover
                            </button>
                            <div
                                data-popover="popover"
                                data-popover-placement="right"
                                className="absolute w-max whitespace-normal break-words rounded-lg border border-blue-gray-50 bg-white p-4 font-sans text-sm font-normal text-blue-gray-500 shadow-lg shadow-blue-gray-500/10 focus:outline-none"
                                >This is a very beautiful popover, show some love.
                            </div>
                            </div>
                        </div>

                        <div className="relative flex w-96 flex-col rounded-xl bg-white bg-clip-border text-gray-700 shadow-md">
                            <div className="p-6">
                                <h5 className="mb-2 block font-sans text-xl font-semibold leading-snug tracking-normal text-blue-gray-900 antialiased">
                                UI/UX Review Check
                                </h5>
                                <p className="block font-sans text-base font-light leading-relaxed text-inherit antialiased">
                                ASFDS
                                </p>
                            </div>
                            <div className="p-6 pt-0">
                                <button
                                className="select-none rounded-lg bg-pink-500 py-3 px-6 text-center align-middle font-sans text-xs font-bold uppercase text-white shadow-md shadow-pink-500/20 transition-all hover:shadow-lg hover:shadow-pink-500/40 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                                type="button"
                                data-ripple-light="true"
                                >
                                Read More
                                </button>
                            </div>
                            
                        </div>
                        
                        
                    </div>
                </div>
            </div>



           
            
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

                    
                </div>

                
            </div>


            <div className="mt-5 bg-gray-100">
                <div className=" max-w-lg my-10">
                    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                        <ul className="divide-y divide-gray-200">
                            <li className="p-3 flex justify-between items-center user-card"> <h1><b>DOSYALAR</b></h1></li>
                            {data ? (
                                <>
                                    {data.names.uploadFiles.map((fileName, index) => {
                                        const fileSize = data.size.uploadFilesSize[index];
                                        const fileExt = data.extension.uploadFilesExtension[index];

                                        return (
                                            <li className="p-3 flex justify-between items-center user-card">
                                                <div className="flex items-center">
                                                    {
                                                        //dosya uzantısına göre icon ekleme
                                                        fileExt == '.pdf' ? (
                                                            <img className="w-10 h-10 rounded-full" src="https://img.icons8.com/color/48/000000/pdf-2.png" alt="Christy"/>
                                                        ) : fileExt == '.docx' ? (
                                                            <img className="w-10 h-10 rounded-full" src="https://img.icons8.com/color/48/000000/ms-word.png" alt="Christy"/>
                                                        ) : fileExt == '.txt' ? (
                                                            <img className="w-10 h-10 rounded-full" src="https://img.icons8.com/color/48/000000/txt.png" alt="Christy"/>
                                                        ) : fileExt == '.jpg' ? (
                                                            <img className="w-10 h-10 rounded-full" src="https://img.icons8.com/color/48/000000/jpg.png" alt="Christy"/>
                                                        ) : fileExt == '.png' ? (
                                                            <img className="w-10 h-10 rounded-full" src="https://img.icons8.com/color/48/000000/png.png" alt="Christy"/>
                                                        ) : fileExt == '.mp4' ? (
                                                            <img className="w-10 h-10 rounded-full" src="https://img.icons8.com/color/48/000000/mp4.png" alt="Christy"/>
                                                        ) : fileExt == '.mp3' ? (
                                                            <img className="w-10 h-10 rounded-full" src="https://img.icons8.com/color/48/000000/mp3.png" alt="Christy"/>
                                                        ) : fileExt == '.zip' ? (
                                                            <img className="w-10 h-10 rounded-full" src="https://img.icons8.com/color/48/000000/zip.png" alt="Christy"/>
                                                        ) : fileExt == '.rar' ? (
                                                            <img className="w-10 h-10 rounded-full" src="https://img.icons8.com/color/48/000000/rar.png" alt="Christy"/>
                                                        ) : fileExt == '.exe' ? (
                                                            <img className="w-10 h-10 rounded-full" src="https://img.icons8.com/color/48/000000/exe.png" alt="Christy"/>
                                                        ) : fileExt == '.html' ? (
                                                            <img className="w-10 h-10 rounded-full" src="https://img.icons8.com/color/48/000000/html-5--v1.png" alt="Christy"/>
                                                        ) : fileExt == '.css' ? (
                                                            <img className="w-10 h-10 rounded-full" src="https://img.icons8.com/color/48/000000/css3.png" alt="Christy"/>
                                                        ) : fileExt == '.js' ? (
                                                            <img className="w-10 h-10 rounded-full" src="https://img.icons8.com/color/48/000000/javascript--v1.png" alt="Christy"/>
                                                        ) : fileExt == '.ts' ? (
                                                            <img className="w-10 h-10 rounded-full" src="https://img.icons8.com/color/48/000000/typescript.png" alt="Christy"/>
                                                        ) : fileExt == '.php' ? (
                                                            <img className="w-10 h-10 rounded-full" src="https://img.icons8.com/color/48/000000/php.png" alt="Christy"/>
                                                        ) : fileExt == '.json' ? (
                                                            <img className="w-10 h-10 rounded-full" src="https://img.icons8.com/color/48/000000/json--v1.png" alt="Christy"/>
                                                        ) : fileExt == '.xml' ? (
                                                            <img className="w-10 h-10 rounded-full" src="https://img.icons8.com/color/48/000000/xml.png" alt="Christy"/>
                                                        ) : fileExt == '.java' ? (
                                                            <img className="w-10 h-10 rounded-full" src="https://img.icons8.com/color/48/000000/java-coffee-cup-logo--v1.png" alt="Christy"/>
                                                        ) : fileExt == '.py' ? (
                                                            <img className="w-10 h-10 rounded-full" src="https://img.icons8.com/color/48/000000/python--v1.png" alt="Christy"/>
                                                        ) : fileExt == '.c' ? (
                                                            <img className="w-10 h-10 rounded-full" src="https://img.icons8.com/color/48/000000/c-programming.png" alt="Christy"/>
                                                        ) : fileExt == '.cpp' ? (
                                                            <img className="w-10 h-10 rounded-full" src="https://img.icons8.com/color/48/000000/c-plus-plus-logo.png" alt="Christy"/>  
                                                        ) : fileExt == '.cs' ? (
                                                            <img className="w-10 h-10 rounded-full" src="https://img.icons8.com/color/48/000000/c-sharp-logo.png" alt="Christy"/>
                                                        ) : fileExt == '.go' ? (
                                                            <img className="w-10 h-10 rounded-full" src="https://img.icons8.com/color/48/000000/golang.png" alt="Christy"/>
                                                        ) : fileExt == '.vb' ? (
                                                            <img className="w-10 h-10 rounded-full" src="https://img.icons8.com/color/48/000000/visual-basic.png" alt="Christy"/>
                                                        ) : fileExt == '.kt' ? (
                                                            <img className="w-10 h-10 rounded-full" src="https://img.icons8.com/color/48/000000/kotlin.png" alt="Christy"/>
                                                        ) : fileExt == '.swift' ? (
                                                            <img className="w-10 h-10 rounded-full" src="https://img.icons8.com/color/48/000000/swift.png" alt="Christy"/>
                                                        ) : fileExt == '.t' ? (
                                                            <img className="w-10 h-10 rounded-full" src="https://img.icons8.com/color/48/000000/perl.png" alt="Christy"/>
                                                        ) : fileExt
                                                    }
                                                    <span className="ml-4 font-medium">uploads/{fileName}</span>
                                                </div>
                                                <div>
                                                    <span className="mr-4 font-medium">{fileSize} byte</span>
                                                    <button
                                                        data-ripple-light="true"
                                                        data-popover-target={"popover" + index}
                                                        className="middle none center rounded-lg bg-gradient-to-tr from-pink-600 to-pink-400 py-3 px-6 font-sans text-xs font-bold uppercase text-white shadow-md shadow-pink-500/20 transition-all hover:shadow-lg hover:shadow-pink-500/40 active:opacity-[0.85] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                                                        >Show Popover
                                                    </button>
                                                    <div
                                                        data-popover= {"popover" + index}
                                                        data-popover-placement="right"
                                                        className="absolute w-max whitespace-normal break-words rounded-lg border border-blue-gray-50 bg-white p-4 font-sans text-sm font-normal text-blue-gray-500 shadow-lg shadow-blue-gray-500/10 focus:outline-none"
                                                        >This is a very beautiful popover, show some love.
                                                    </div>
                                                </div>
                                            </li>
                                        );
                                    })}
                                    {data.names.encryptedFiles.map((fileName, index) => {
                                        const fileSize = data.size.encryptedFilesSize[index];
                                        const fileExt = data.extension.encryptedFilesExtension[index];

                                        return (
                                            <li className="p-3 flex justify-between items-center user-card">
                                                <div className="flex items-center">
                                                    {
                                                        //dosya uzantısına göre icon ekleme
                                                        fileExt == '.pdf' ? (
                                                            <img className="w-10 h-10 rounded-full" src="https://img.icons8.com/color/48/000000/pdf-2.png" alt="Christy"/>
                                                        ) : fileExt == '.docx' ? (
                                                            <img className="w-10 h-10 rounded-full" src="https://img.icons8.com/color/48/000000/ms-word.png" alt="Christy"/>
                                                        ) : fileExt == '.txt' ? (
                                                            <img className="w-10 h-10 rounded-full" src="https://img.icons8.com/color/48/000000/txt.png" alt="Christy"/>
                                                        ) : fileExt == '.jpg' ? (
                                                            <img className="w-10 h-10 rounded-full" src="https://img.icons8.com/color/48/000000/jpg.png" alt="Christy"/>
                                                        ) : fileExt == '.png' ? (
                                                            <img className="w-10 h-10 rounded-full" src="https://img.icons8.com/color/48/000000/png.png" alt="Christy"/>
                                                        ) : fileExt == '.mp4' ? (
                                                            <img className="w-10 h-10 rounded-full" src="https://img.icons8.com/color/48/000000/mp4.png" alt="Christy"/>
                                                        ) : fileExt == '.mp3' ? (
                                                            <img className="w-10 h-10 rounded-full" src="https://img.icons8.com/color/48/000000/mp3.png" alt="Christy"/>
                                                        ) : fileExt == '.zip' ? (
                                                            <img className="w-10 h-10 rounded-full" src="https://img.icons8.com/color/48/000000/zip.png" alt="Christy"/>
                                                        ) : fileExt == '.rar' ? (
                                                            <img className="w-10 h-10 rounded-full" src="https://img.icons8.com/color/48/000000/rar.png" alt="Christy"/>
                                                        ) : fileExt == '.exe' ? (
                                                            <img className="w-10 h-10 rounded-full" src="https://img.icons8.com/color/48/000000/exe.png" alt="Christy"/>
                                                        ) : fileExt == '.html' ? (
                                                            <img className="w-10 h-10 rounded-full" src="https://img.icons8.com/color/48/000000/html-5--v1.png" alt="Christy"/>
                                                        ) : fileExt == '.css' ? (
                                                            <img className="w-10 h-10 rounded-full" src="https://img.icons8.com/color/48/000000/css3.png" alt="Christy"/>
                                                        ) : fileExt == '.js' ? (
                                                            <img className="w-10 h-10 rounded-full" src="https://img.icons8.com/color/48/000000/javascript--v1.png" alt="Christy"/>
                                                        ) : fileExt == '.ts' ? (
                                                            <img className="w-10 h-10 rounded-full" src="https://img.icons8.com/color/48/000000/typescript.png" alt="Christy"/>
                                                        ) : fileExt == '.php' ? (
                                                            <img className="w-10 h-10 rounded-full" src="https://img.icons8.com/color/48/000000/php.png" alt="Christy"/>
                                                        ) : fileExt == '.json' ? (
                                                            <img className="w-10 h-10 rounded-full" src="https://img.icons8.com/color/48/000000/json--v1.png" alt="Christy"/>
                                                        ) : fileExt == '.xml' ? (
                                                            <img className="w-10 h-10 rounded-full" src="https://img.icons8.com/color/48/000000/xml.png" alt="Christy"/>
                                                        ) : fileExt == '.java' ? (
                                                            <img className="w-10 h-10 rounded-full" src="https://img.icons8.com/color/48/000000/java-coffee-cup-logo--v1.png" alt="Christy"/>
                                                        ) : fileExt == '.py' ? (
                                                            <img className="w-10 h-10 rounded-full" src="https://img.icons8.com/color/48/000000/python--v1.png" alt="Christy"/>
                                                        ) : fileExt == '.c' ? (
                                                            <img className="w-10 h-10 rounded-full" src="https://img.icons8.com/color/48/000000/c-programming.png" alt="Christy"/>
                                                        ) : fileExt == '.cpp' ? (
                                                            <img className="w-10 h-10 rounded-full" src="https://img.icons8.com/color/48/000000/c-plus-plus-logo.png" alt="Christy"/>  
                                                        ) : fileExt == '.cs' ? (
                                                            <img className="w-10 h-10 rounded-full" src="https://img.icons8.com/color/48/000000/c-sharp-logo.png" alt="Christy"/>
                                                        ) : fileExt == '.go' ? (
                                                            <img className="w-10 h-10 rounded-full" src="https://img.icons8.com/color/48/000000/golang.png" alt="Christy"/>
                                                        ) : fileExt == '.vb' ? (
                                                            <img className="w-10 h-10 rounded-full" src="https://img.icons8.com/color/48/000000/visual-basic.png" alt="Christy"/>
                                                        ) : fileExt == '.kt' ? (
                                                            <img className="w-10 h-10 rounded-full" src="https://img.icons8.com/color/48/000000/kotlin.png" alt="Christy"/>
                                                        ) : fileExt == '.swift' ? (
                                                            <img className="w-10 h-10 rounded-full" src="https://img.icons8.com/color/48/000000/swift.png" alt="Christy"/>
                                                        ) : fileExt == '.t' ? (
                                                            <img className="w-10 h-10 rounded-full" src="https://img.icons8.com/color/48/000000/perl.png" alt="Christy"/>
                                                        ) : fileExt
                                                    }
                                                    <span className="ml-2 font-medium">encrypted/{fileName}</span>
                                                </div>
                                                <div>
                                                    <span className="mr-4 font-medium">{fileSize} byte</span>

                                                    <button
                                                        data-ripple-light="true"
                                                        data-popover-target={"popover" + index}
                                                        className="middle none center rounded-lg bg-gradient-to-tr from-pink-600 to-pink-400 py-3 px-6 font-sans text-xs font-bold uppercase text-white shadow-md shadow-pink-500/20 transition-all hover:shadow-lg hover:shadow-pink-500/40 active:opacity-[0.85] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                                                        >Show Popover
                                                    </button>
                                                    <div
                                                        data-popover= {"popover" + index}
                                                        data-popover-placement="right"
                                                        className="absolute w-max whitespace-normal break-words rounded-lg border border-blue-gray-50 bg-white p-4 font-sans text-sm font-normal text-blue-gray-500 shadow-lg shadow-blue-gray-500/10 focus:outline-none"
                                                        >This is a very beautiful popover, show some love.
                                                    </div>

                                                    <Popover children={''}/>

                                                </div>
                                                
                                            </li>
                                        );
                                    })}
                                </>
                            ) : (
                                <li className="p-3 flex justify-between items-center user-card"> Dosya bilgileri bekleniyor...</li>
                            )}
                        </ul>
                    </div>
                </div>
            </div>
                                

            <script type="module" src="https://unpkg.com/@material-tailwind/html@latest/scripts/popover.js"></script>
            <script src="https://unpkg.com/flowbite@1.4.0/dist/flowbite.js"></script>
        </div>
    
    );
}

export default Files;