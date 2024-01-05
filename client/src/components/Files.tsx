import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CryptoJS from 'crypto-js';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Dragdrop from './Dragdrop';



const dsa = 5;

// localhost:3000/list adresine get request atıp, dönen sonucu ekrana yazdırır.

interface FileData {
    map(arg0: (name: any, index: any) => import("react/jsx-runtime").JSX.Element): unknown;
    name: string
    path: string
    extension: string
    size: number
    isDirectory: boolean
    modifiedDate: any
}

interface DFileData {
    map(arg0: (name: any, index: any) => import("react/jsx-runtime").JSX.Element): unknown;
    name: string
    data: string
    key: string
    algorithm: string,
}

const Files = () => {

    const [dirs , setDirs] = useState([] as any);

    const [selectedFile, setSelectedFile] = useState("");
    
    const [data, setData] = useState<FileData | null> (null as any);
    const [fileContent, setFileContent] = useState('');
    const [folderContent, setFolderContent] = useState('');

    const [selectedOption, setSelectedOption] = useState('');

    useEffect(() => {
        console.log(dirs);
    }
    , [dirs]);

    useEffect(() => {
        console.log(selectedFile);
    }
    , [selectedFile]);

    const notify = () => toast("Dosya başarıyla yüklendi!");
    const notifyD = () => toast("Dosya başarıyla indirildi!");
    const notifyDel = () => toast("Dosyalar başarıyla silindi!");
    const warning = () => toast.warn("Lütfen bir şifreleme algoritması seçiniz.");
    const notifyDir = () => toast("Klasör başarıyla oluşturuldu!");
    const notifyDirDel = () => toast("Klasör başarıyla silindi!");
    const notifyDirChange = () => toast("Dosya başarıyla taşındı!");

    const handleSelectChange = (event) => {
        setSelectedOption(event.target.value);
    }

    const ModalClick = () => {
        document.getElementById("modal").classList.add('scale-100')
    }

    const modal1Click = (fileName) => {
        setSelectedFile(fileName);
        document.getElementById("modal1").classList.add('scale-100')

    }

    const CloseModalClick = () => {
        document.getElementById("modal").classList.remove('scale-100')
    }

    const CloseModal1Click = () => {
        document.getElementById("modal1").classList.remove('scale-100')
    }

    function uint8ArrayToBase64(uint8Array) {
        // Uint8Array'i bir karakter dizisine dönüştür
        const chars = Array.from(uint8Array, byte => String.fromCharCode(byte as number)).join('');
    
        // Bu karakter dizisini Base64'e dönüştür
        return btoa(chars);
    }

    const changeDirectory = async (folderName, dirToChange) => {
        axios.post('http://localhost:3000/changeDir', {
            folderName: folderName,
            dir: dirToChange
        })
        .then(response => console.log(response.data))
    }

    const getFolderData = async () => {
        const response = await fetch('http://localhost:3000/list');
        const data = await response.text();
        setFolderContent(JSON.parse(data));
    }

    const getData = async () => {
        const response = await fetch('http://localhost:3000/list');
        const data = await response.text();
        setData(JSON.parse(data));
        getDirs();
    }

    const base64toByteArray = (base64Data) => {
        const raw = atob(base64Data);
        const uint8Array = new Uint8Array(raw.length);
        for (let i = 0; i < raw.length; i++) {
            uint8Array[i] = raw.charCodeAt(i);
        }
        return uint8Array;
    }

    const getDirs = async () => {
        const response = await fetch('http://localhost:3000/listDir');
        const data = await response.text();
        setDirs(JSON.parse(data));

    }

    const deleteFile = async (fileName) => {

        // Eğer dosya uzantısı .enc ise asıl dosyayı da sil
        const string = ["DES", "AES", "Blowfish", "RSA"];

        if (fileName.slice(-4) == '.enc' && (fileName.startsWith(string[0]) || fileName.startsWith(string[1]) || fileName.startsWith(string[2]) || fileName.startsWith(string[3])) ) {
            fileName = fileName.split("-")[1];
            const response = await fetch('http://localhost:3000/delete/' + fileName);
            const data = await response.text();
            console.log(data);
            deleteFile(fileName.slice(0, -4));
            
        }
        else {

            const response = await fetch('http://localhost:3000/delete/' + fileName);
            const data = await response.text();
            console.log(data);

        }
    }

    // listedeki dosyalardan birinin indirme butonuna tıklandığında çalışır
    const downloadFile = async (fileName, filePath) => {
        const response = await fetch('http://localhost:3000/download/' + fileName);
        const data = await response.text();

        const fileDataParsed = JSON.parse(data) as DFileData;

        let name = fileDataParsed[0].name;
        let key = fileDataParsed[0].key;
        let fileData = fileDataParsed[0].data;
        let algorithm = fileDataParsed[0].algorithm;
        let base64Data = fileDataParsed[0].base64Data;
        var decrypted = '';
        let byteArray;

        if (key == '') {
            key = '12345678';
        }
        console.log("key: " + key);
        console.log("fileData ", fileData);

        


        if (algorithm == 'DES') {

            decrypted = CryptoJS.DES.decrypt(fileData, key).toString(CryptoJS.enc.Utf8);
            byteArray = base64toByteArray(decrypted);
            console.log("DES: " + decrypted); // 
            console.log("byteArray: " , byteArray.toString());
            const blob = new Blob([byteArray], { type: 'application/octet-stream' });
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = fileName.split("_")[1];
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
        }

        else if (algorithm == 'AES') {
            decrypted = CryptoJS.AES.decrypt(fileData, key).toString(CryptoJS.enc.Utf8);
            console.log("AES: " + decrypted);
            byteArray = base64toByteArray(decrypted);
            console.log("byteArray: " , byteArray.toString());
            const blob = new Blob([byteArray], { type: 'application/octet-stream' });
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = fileName.split("_")[1];
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
 
        else if (algorithm == 'Blowfish') {
            decrypted = CryptoJS.Blowfish.decrypt(fileData, key).toString(CryptoJS.enc.Utf8);
            console.log("Blowfish: " + decrypted.toString());
            byteArray = base64toByteArray(decrypted);
            console.log("byteArray: " , byteArray.toString());
            const blob = new Blob([byteArray], { type: 'application/octet-stream' });
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = fileName.split("_")[1];
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }

        else if (algorithm == 'RSA') {
            decrypted = CryptoJS.AES.decrypt(fileData, key).toString(CryptoJS.enc.Utf8);
            console.log("RSA: " + decrypted.toString());
            byteArray = base64toByteArray(decrypted);
            console.log("byteArray: " , byteArray.toString());
            const blob = new Blob([byteArray], { type: 'application/octet-stream' });
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = fileName.split("_")[1];
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }

        else {
            warning();
        }

    }


    const handleFileRead = async (event) => {

        //anahtar değeri alınacak
        var key = (document.getElementById("first_name") as HTMLInputElement).value;

        if (key == '') {
            key = '12345678';
        }
        

        console.log("key: " + key);
        const file = event.target.files?.[0];
        if (!file) {
            console.log("Dosya seçilmedi");
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

                const encrypted = CryptoJS.DES.encrypt(base64Data, key);
                setFileContent(encrypted.toString());

                console.log("base64Data: " + base64Data)
                console.log("encrypted: " + encrypted.toString());

                console.log("dencrypted: " + CryptoJS.DES.decrypt(encrypted, key).toString(CryptoJS.enc.Utf8));

                axios.post('http://localhost:3000/upload', {
                    byteArray: encrypted.toString(),
                    fileName: fileName,
                    key: key,
                    algorithm: selectedOption

                })
                .then(response => console.log(response.data))
                .catch(error => console.error(error)).then(() => {
                    notify();
                }).then(() => {
                    key = '';
                }).then(() => {
                    document.getElementById("modal").classList.remove('scale-100')
                })
            }
            else if (selectedOption == 'AES') {
                const base64Data = uint8ArrayToBase64(uint8Array);
                const encrypted = CryptoJS.AES.encrypt(base64Data, key);

                setFileContent(encrypted.toString());

                axios.post('http://localhost:3000/upload', {
                    byteArray: encrypted.toString(),
                    fileName: fileName,
                    key: key,
                    algorithm: selectedOption

                })
                .then(response => console.log(response.data))
                .catch(error => console.error(error)).then(() => {
                    notify();
                }).then(() => {
                    key = '';
                });

            }
            else if (selectedOption == 'Blowfish') {
                const base64Data = uint8ArrayToBase64(uint8Array);
                const encrypted = CryptoJS.Blowfish.encrypt(base64Data, key);
                setFileContent(encrypted.toString());

                console.log("base64Data: " + base64Data)

                axios.post('http://localhost:3000/upload', {
                    byteArray: encrypted.toString(),
                    fileName: fileName,
                    key: key,
                    algorithm: selectedOption

                })
                .then(response => console.log(response.data))
                .catch(error => console.error(error)).then(() => {
                    notify();
                }).then(() => {
                    key = '';
                });
            }
            else if (selectedOption == 'RSA') {
                const encrypted = CryptoJS.AES.encrypt(uint8Array.toString(), key);
                setFileContent(encrypted.toString());
            }
            else {
                warning();
            }
                
        };
        reader.readAsArrayBuffer(file);
        // dosyayı seçilen şifreleme algoritmasına göre şifrelenecek
        // şifreleme algoritması seçilmediyse uyarı verilecek

        // dosya şifrelendikten sonra şifrelenmsiş dosya sunucuya gönderilecek
    }

    return (    

        <div className=" relative md:px-32 py-8 min-h-screen w-full">

            <div id="modal"
                className=" fixed top-0 left-0 min-w-screen h-screen w-screen flex items-center justify-center bg-gray-500 bg-opacity-50 transform scale-0 transition-transform duration-300">
                
                <div className="rounded-xl bg-gradient-to-bl from-blue-50 to-violet-50 flex items-center justify-center">
                    <div className=" container mx-auto p-4">
                        
                        <div className="flex flex-col w-96 rounded-md bg-white bg-clip-border text-gray-700 shadow-md">
                            
                            <div className="mt-3 ml-3">
                                <button onClick={CloseModalClick} className='mr-3 rounded-full hover:bg-purple-200'>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 14 14" id="cross"><path fill="#000" fill-rule="evenodd" d="M13 7C13 10.3137 10.3137 13 7 13C3.68629 13 1 10.3137 1 7C1 3.68629 3.68629 1 7 1C10.3137 1 13 3.68629 13 7ZM9.26274 4.73725C9.53611 5.01062 9.53611 5.45384 9.26274 5.7272L7.98995 7L9.26274 8.27279C9.53611 8.54615 9.53611 8.98937 9.26274 9.26274C8.98937 9.5361 8.54616 9.5361 8.27279 9.26274L7 7.98994L5.72721 9.26274C5.45384 9.5361 5.01063 9.5361 4.73726 9.26274C4.46389 8.98937 4.46389 8.54615 4.73726 8.27279L6.01005 7L4.73726 5.7272C4.46389 5.45384 4.46389 5.01062 4.73726 4.73725C5.01063 4.46389 5.45384 4.46389 5.72721 4.73725L7 6.01005L8.27279 4.73725C8.54616 4.46389 8.98937 4.46389 9.26274 4.73725Z" clip-rule="evenodd"></path></svg>
                                </button>
                            </div>

                            <div className="flex flex-col justify-center mt-4">
                                
                                <select value={selectedOption} onChange={handleSelectChange} id="encrypt" className="mr-4 ml-4 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                                    
                                    <option value="">Şifreleme Algoritması Seçiniz</option>
                                    <option id='opt1' value="RSA">RSA</option>
                                    <option id='opt2' value="DES">DES</option>
                                    <option id='opt3' value="AES">AES</option>
                                    <option id='opt4' value="Blowfish">Blowfish</option>
                                </select>
                                        
                                <input type="text" id="first_name" className="mt-3 mr-4 ml-4 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Anahtar Değeri" required/>
                                <Dragdrop handleFileRead={handleFileRead}/>
                            </div> 
                        </div>
                    </div>
                </div>
            </div>

            <div id="modal1"
                className=" fixed top-0 left-0 min-w-screen h-screen w-screen flex items-center justify-center bg-gray-500 bg-opacity-50 transform scale-0 transition-transform duration-300">
                
                <div className="rounded-xl bg-gradient-to-bl from-blue-50 to-violet-50 flex items-center justify-center">
                    <div className=" container mx-auto p-4">
                        
                        <div className="flex flex-col w-96 rounded-md bg-white bg-clip-border text-gray-700 shadow-md">
                            
                            <div className="mt-3 ml-3">
                                <button onClick={CloseModal1Click} className='mr-3 rounded-full hover:bg-purple-200'>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 14 14" id="cross"><path fill="#000" fill-rule="evenodd" d="M13 7C13 10.3137 10.3137 13 7 13C3.68629 13 1 10.3137 1 7C1 3.68629 3.68629 1 7 1C10.3137 1 13 3.68629 13 7ZM9.26274 4.73725C9.53611 5.01062 9.53611 5.45384 9.26274 5.7272L7.98995 7L9.26274 8.27279C9.53611 8.54615 9.53611 8.98937 9.26274 9.26274C8.98937 9.5361 8.54616 9.5361 8.27279 9.26274L7 7.98994L5.72721 9.26274C5.45384 9.5361 5.01063 9.5361 4.73726 9.26274C4.46389 8.98937 4.46389 8.54615 4.73726 8.27279L6.01005 7L4.73726 5.7272C4.46389 5.45384 4.46389 5.01062 4.73726 4.73725C5.01063 4.46389 5.45384 4.46389 5.72721 4.73725L7 6.01005L8.27279 4.73725C8.54616 4.46389 8.98937 4.46389 9.26274 4.73725Z" clip-rule="evenodd"></path></svg>
                                </button>
                            </div>

                            <div className="flex flex-col justify-center mt-4">
                                
                                <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                                    <ul className="divide-y divide-gray-200">
                                        <li className="p-3 justify-between items-center user-card">
                                            <h1 className='ml-3 mb-2'><b>DOSYAYI TAŞIMAK İSTEDİĞİNİZ KLASÖRE TIKLAYIN</b></h1>
                                            {
                                                dirs ? (
                                                    dirs.map((dir, index) => {
                                                        return(<li className="p-3 flex justify-between items-center user-card">
                                                            <div className="flex items-center">
                                                                <img className="w-10 h-10 rounded-full" src="https://img.icons8.com/color/48/000000/folder-invoices.png" alt="Christy"/>
                                                                <div className="ml-3">
                                                                    <p className="text-gray-700 dark:text-white">{dir}</p>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <button onClick={()=> changeDirectory(selectedFile, dir).then(()=>{CloseModal1Click();notifyDirChange()})} className='mr-3 rounded-full hover:bg-indigo-200'>
                                                                    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="35" height="35" viewBox="0 0 24 24">
                                                                        <path d="M 19.28125 5.28125 L 9 15.5625 L 4.71875 11.28125 L 3.28125 12.71875 L 8.28125 17.71875 L 9 18.40625 L 9.71875 17.71875 L 20.71875 6.71875 Z"></path>
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        </li>)
                                                        
    
                                                    })
                                                ) : (
                                                    <p>klasör yok</p>
                                                )
                                            }
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            <link rel="stylesheet" href="https://unpkg.com/flowbite@1.4.4/dist/flowbite.min.css" />


            <div className="">
                <div className=" max-w-4xl my-10">
                    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                        <ul className="divide-y divide-gray-200">
                            <li className="p-3 flex justify-between items-center user-card"> <h1><b>DOSYALAR</b> - Sunucu dizini</h1>
                                <div>
                                    <button     
                                        data-ripple-light="true"
                                        data-popover-target="popover"
                                        onClick={getData}
                                        className="mr-4 middle none center rounded-lg bg-gradient-to-tr to-slate-200 from-blue-500 via-indigo-700 py-3 px-3 font-sans text-xs font-bold uppercase text-white shadow-md shadow-blue-500/20 transition-all hover:shadow-lg hover:shadow-blue-500/40 active:opacity-[0.85] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                                        >
                                        {
                                            //eğer dosya bilgileri alındıysa yenile butonu göster
                                            data ? (<svg className="w-[18px] h-[18px] text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 20">
                                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 1v5h-5M2 19v-5h5m10-4a8 8 0 0 1-14.947 3.97M1 10a8 8 0 0 1 14.947-3.97"/>
                                            </svg>) : 
                                            <svg className="w-[18px] h-[18px] text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 15">
                                                <path d="M1 13a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6H1v7Zm5.293-3.707a1 1 0 0 1 1.414 0L8 9.586V8a1 1 0 0 1 2 0v1.586l.293-.293a1 1 0 0 1 1.414 1.414l-2 2a1 1 0 0 1-1.416 0l-2-2a1 1 0 0 1 .002-1.414ZM17 0H1a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V1a1 1 0 0 0-1-1Z"/>
                                            </svg>
                                
                                        }

                                    </button>
                                    <button     
                                        data-ripple-light="true"
                                        data-popover-target="popover2"
                                        className="mr-1 middle none center rounded-lg bg-gradient-to-tr to-slate-200 from-blue-500 via-indigo-700 py-3 px-3 font-sans text-xs font-bold uppercase text-white shadow-md shadow-blue-500/20 transition-all hover:shadow-lg hover:shadow-blue-500/40 active:opacity-[0.85] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                                        ><svg className="w-[18px] h-[18px] text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M18 7.5h-.423l-.452-1.09.3-.3a1.5 1.5 0 0 0 0-2.121L16.01 2.575a1.5 1.5 0 0 0-2.121 0l-.3.3-1.089-.452V2A1.5 1.5 0 0 0 11 .5H9A1.5 1.5 0 0 0 7.5 2v.423l-1.09.452-.3-.3a1.5 1.5 0 0 0-2.121 0L2.576 3.99a1.5 1.5 0 0 0 0 2.121l.3.3L2.423 7.5H2A1.5 1.5 0 0 0 .5 9v2A1.5 1.5 0 0 0 2 12.5h.423l.452 1.09-.3.3a1.5 1.5 0 0 0 0 2.121l1.415 1.413a1.5 1.5 0 0 0 2.121 0l.3-.3 1.09.452V18A1.5 1.5 0 0 0 9 19.5h2a1.5 1.5 0 0 0 1.5-1.5v-.423l1.09-.452.3.3a1.5 1.5 0 0 0 2.121 0l1.415-1.414a1.5 1.5 0 0 0 0-2.121l-.3-.3.452-1.09H18a1.5 1.5 0 0 0 1.5-1.5V9A1.5 1.5 0 0 0 18 7.5Zm-8 6a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7Z"/>
                                        </svg>
                                    </button>
                                    <div
                                        data-popover="popover"
                                        data-popover-placement="top"
                                        className="absolute w-max whitespace-normal break-words rounded-lg border border-blue-gray-50 bg-white p-4 font-sans text-sm font-normal text-blue-gray-500 shadow-lg shadow-blue-gray-500/10 focus:outline-none"
                                        >Dosyaları getir (yenile)
                                    </div>
                                    <div
                                        data-popover="popover2"
                                        data-popover-placement="right"
                                        className="flex flex-col absolute w-max whitespace-normal break-words rounded-lg border border-blue-gray-50 bg-white p-4 font-sans text-sm font-normal text-blue-gray-500 shadow-lg shadow-blue-gray-500/10 focus:outline-none"
                                        >

                                            <button onClick={ModalClick} className="flex text-gray-600 middle none center rounded-lg bg-gradient-to-tr to-slate-200 from-blue-500 via-indigo-700 py-3 px-3 font-sans text-xs font-bold uppercase shadow-md shadow-blue-500/20 transition-all hover:shadow-lg hover:shadow-blue-500/40 active:opacity-[0.85] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none">
                                                <svg className='mr-2' xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 512 512" id="upload"><path d="M398.1 233.2c0-1.2.2-2.4.2-3.6 0-65-51.8-117.6-115.7-117.6-46.1 0-85.7 27.4-104.3 67-8.1-4.1-17.2-6.5-26.8-6.5-29.5 0-54.1 21.9-58.8 50.5C57.3 235.2 32 269.1 32 309c0 50.2 40.1 91 89.5 91H224v-80h-48.2l80.2-83.7 80.2 83.6H288v80h110.3c45.2 0 81.7-37.5 81.7-83.4 0-45.9-36.7-83.2-81.9-83.3z"></path></svg>
                                                Dosya Yükle
                                            </button>

                                            <button className="flex mt-3 first-letter:flex text-gray-600 middle none center rounded-lg bg-gradient-to-tr to-slate-200 from-blue-500 via-indigo-700 py-3 px-3 font-sans text-xs font-bold uppercase shadow-md shadow-blue-500/20 transition-all hover:shadow-lg hover:shadow-blue-500/40 active:opacity-[0.85] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none">
                                                <svg className='mr-2' xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" id="add-folder"><g data-name="Layer 2"><path d="M19.5 7.05h-7L9.87 3.87a1 1 0 0 0-.77-.37H4.5A2.47 2.47 0 0 0 2 5.93v12.14a2.47 2.47 0 0 0 2.5 2.43h15a2.47 2.47 0 0 0 2.5-2.43V9.48a2.47 2.47 0 0 0-2.5-2.43zM14 15h-1v1a1 1 0 0 1-2 0v-1h-1a1 1 0 0 1 0-2h1v-1a1 1 0 0 1 2 0v1h1a1 1 0 0 1 0 2z" data-name="folder-add"></path></g></svg>
                                                Klasör Oluştur
                                            </button>

                                            <button className="flex text-gray-600 mt-3 middle none center rounded-lg bg-gradient-to-tr to-slate-200 from-blue-500 via-indigo-700 py-3 px-3 font-sans text-xs font-bold uppercase shadow-md shadow-blue-500/20 transition-all hover:shadow-lg hover:shadow-blue-500/40 active:opacity-[0.85] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none">
                                                <svg className='mr-2' xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" id="delete-folder"><path d="m19,6.25h-5.424c-.252,0-.495-.075-.703-.216l-1.922-1.308c-.458-.312-.993-.476-1.546-.476h-4.404c-1.517,0-2.75,1.233-2.75,2.75v10c0,1.517,1.233,2.75,2.75,2.75h14c1.517,0,2.75-1.233,2.75-2.75v-8c0-1.517-1.233-2.75-2.75-2.75Zm-5,7.5h-4c-.414,0-.75-.336-.75-.75s.336-.75.75-.75h4c.414,0,.75.336.75.75s-.336.75-.75.75Z"></path></svg>
                                                KLASÖR SİL
                                            </button>
                                    </div>
                                </div>
                                </li>
                            {data ? (
                                <>
                                    {data.map((file, index) => {
                                        const fileSize = file.size;  
                                        const fileExt = file.extension;
                                        const fileDir = file.path;

                                        return (
                                            <li className="p-3 flex justify-between items-center user-card trans fade-in">
                                                <div className="flex items-center">
                                                    {
                                                        //dosya uzantısına göre icon ekleme
                                                        fileExt == '.pdf' ? (
                                                            <img className="w-10 h-10 rounded-full" src="https://img.icons8.com/color/48/000000/pdf-2.png" alt="Christy"/>
                                                        ) : fileExt == '' ? (
                                                            <img className="w-10 h-10 rounded-full" src="https://img.icons8.com/color/48/000000/file.png" alt="Christy"/>
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
                                                        ) : fileExt == '.enc' ? (
                                                            <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="40" height="40" viewBox="0 0 50 50">
                                                                <path d="M 30.398438 2 L 7 2 L 7 48 L 43 48 L 43 14.601563 Z M 30 15 L 30 4.398438 L 40.601563 15 Z"></path>
                                                            </svg>
                                                        ) : fileExt == '.svg' ? (
                                                            <img className="w-10 h-10 rounded-full" src="https://img.icons8.com/color/48/000000/svg.png" alt="Christy"/>
                                                        ) : fileExt
                                                        
                                                    }
                                                    <span className="ml-4 font-medium">{
                                                        //eğer dosya ismi dosya yoluyla aynı ise yolu yazma
                                                        fileDir == file.name ? (
                                                            file.name
                                                        ) : fileDir
                                                    }</span>
                                                </div>
                                                <div>
                                                    <span className="mr-4 font-medium">{
                                                        //eğer dosya bir klasör ise boytu yazma
                                                        fileExt == '' ? (
                                                            ''
                                                        ) : fileSize + " byte"
                                                    }</span>
                                                    {
                                                        //eğer dosya adı dosya yoluyla aynı ise indirme butonları gösterme
                                                        fileDir == file.name ? (
                                                         <b className='mr-3'>SUNUCU DİZİNİ</b>
                                                        ) : (
                                                            <>

                                                            {
                                                                fileExt == '.enc' ? ("") :                                                             <button
                                                                    onClick={() => downloadFile(file.name, file.path).then(() => {
                                                                        notifyD();
                                                                    })
                                                                    }
                                                                    className='mr-3 rounded-full hover:bg-purple-200'
                                                                ><svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path d="M14.707 7.793a1 1 0 0 0-1.414 0L11 10.086V1.5a1 1 0 0 0-2 0v8.586L6.707 7.793a1 1 0 1 0-1.414 1.414l4 4a1 1 0 0 0 1.416 0l4-4a1 1 0 0 0-.002-1.414Z" />
                                                                        <path d="M18 12h-2.55l-2.975 2.975a3.5 3.5 0 0 1-4.95 0L4.55 12H2a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2Zm-3 5a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" />
                                                                    </svg>
                                                            </button>

                                                            }
                                                            
                                                            <button onClick={() => deleteFile(file.name).then(()=> {getData();notifyDel()} )} className='mr-3 rounded-full hover:bg-purple-200'>
                                                                <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 20">
                                                                    <path d="M17 4h-4V2a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v2H1a1 1 0 0 0 0 2h1v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6h1a1 1 0 1 0 0-2ZM7 2h4v2H7V2Zm1 14a1 1 0 1 1-2 0V8a1 1 0 0 1 2 0v8Zm4 0a1 1 0 0 1-2 0V8a1 1 0 0 1 2 0v8Z" />
                                                                </svg>
                                                            </button>
                                                            
                                                            <button onClick={()=> modal1Click(file.name)} className='mr-3 rounded-full hover:bg-purple-200'>
                                                                <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 3">
                                                                    <path d="M2 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm6.041 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM14 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z" />
                                                                </svg>
                                                            </button></>
                                                        )
                                                    }
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
            <ToastContainer />
        </div>
    
    );
}

export default Files;