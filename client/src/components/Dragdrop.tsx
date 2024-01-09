import React, {useRef, useState, useEffect, useCallback } from 'react';

const Dragdrop = ({ handleFileRead, rc4 }: { handleFileRead: (event: any) => Promise<void> , rc4:any}) => {
    const [dragOver, setDragOver] = useState(false);
    const [fileList, setFileList] = useState([]);
    const fileInputRef = useRef(null);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        setDragOver(true);
    }, []);


    const handleFileReadButton = () => {
        const fileInputOnChangeEvent = {
            target: {
                files: fileList
            }
        };
        handleFileRead(fileInputOnChangeEvent).then(() => {
            setFileList([]);
        });
    }

    const handleDragLeave = useCallback(() => {
        setDragOver(false);
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setDragOver(false);
        const files = Array.from(e.dataTransfer.files);
        setFileList(prevFiles => [...prevFiles, ...files]);
    }, []);
    
    const getFileExt = (file) => {
        return "."+file.name.split('.').pop();
    }

    const openFileSelector = () => {
        fileInputRef.current.click();
    };

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        setFileList(prevFiles => [...prevFiles, ...files]);
    };

    useEffect(() => {
        const dropzone = document.getElementById('dropzone');
        dropzone.addEventListener('dragover', handleDragOver);
        dropzone.addEventListener('dragleave', handleDragLeave);
        dropzone.addEventListener('drop', handleDrop);

        return () => {
            dropzone.removeEventListener('dragover', handleDragOver);
            dropzone.removeEventListener('dragleave', handleDragLeave);
            dropzone.removeEventListener('drop', handleDrop);
        };
    }, [handleDragOver, handleDragLeave, handleDrop]);

    return (
        <div>
            <div
                id='dropzone'
                onClick={openFileSelector}
                className={dragOver ? 'border-blue-500 border-2' : ''}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
            >
                Dosyaları buraya sürükleyin veya tıklayın
            </div>
            <input 
                id='fileInput'
                ref={fileInputRef} 
                type='file' 
                style={{ display: 'none' }}
                onChange={handleFileSelect}
                multiple
            />
            <link rel="stylesheet" href="https://unpkg.com/flowbite@1.4.4/dist/flowbite.min.css" />
            <ul id='fileList'>
                {fileList.map((file, index) => (
                    <li className='p-3 flex items-center user-card trans fade-in' key={index}>

                        <div className="flex items-center">
                            {
                                //dosya uzantısına göre icon ekleme
                                getFileExt(file) == '.pdf' ? (
                                    <img className="w-10 h-10 rounded-full" src="https://img.icons8.com/color/48/000000/pdf-2.png" alt="Christy"/>
                                ) : getFileExt(file) == '.docx' ? (
                                    <img className="w-10 h-10 rounded-full" src="https://img.icons8.com/color/48/000000/ms-word.png" alt="Christy"/>
                                ) : getFileExt(file) == '.txt' ? (
                                    <img className="w-10 h-10 rounded-full" src="https://img.icons8.com/color/48/000000/txt.png" alt="Christy"/>
                                ) : getFileExt(file) == '.jpg' ? (
                                    <img className="w-10 h-10 rounded-full" src="https://img.icons8.com/color/48/000000/jpg.png" alt="Christy"/>
                                ) : getFileExt(file) == '.png' ? (
                                    <img className="w-10 h-10 rounded-full" src="https://img.icons8.com/color/48/000000/png.png" alt="Christy"/>
                                ) : getFileExt(file) == '.mp4' ? (
                                    <img className="w-10 h-10 rounded-full" src="https://img.icons8.com/color/48/000000/mp4.png" alt="Christy"/>
                                ) : getFileExt(file) == '.mp3' ? (
                                    <img className="w-10 h-10 rounded-full" src="https://img.icons8.com/color/48/000000/mp3.png" alt="Christy"/>
                                ) : getFileExt(file) == '.zip' ? (
                                    <img className="w-10 h-10 rounded-full" src="https://img.icons8.com/color/48/000000/zip.png" alt="Christy"/>
                                ) : getFileExt(file) == '.rar' ? (
                                    <img className="w-10 h-10 rounded-full" src="https://img.icons8.com/color/48/000000/rar.png" alt="Christy"/>
                                ) : getFileExt(file) == '.exe' ? (
                                    <img className="w-10 h-10 rounded-full" src="https://img.icons8.com/color/48/000000/exe.png" alt="Christy"/>
                                ) : getFileExt(file) == '.html' ? (
                                    <img className="w-10 h-10 rounded-full" src="https://img.icons8.com/color/48/000000/html-5--v1.png" alt="Christy"/>
                                ) : getFileExt(file) == '.css' ? (
                                    <img className="w-10 h-10 rounded-full" src="https://img.icons8.com/color/48/000000/css3.png" alt="Christy"/>
                                ) : getFileExt(file) == '.js' ? (
                                    <img className="w-10 h-10 rounded-full" src="https://img.icons8.com/color/48/000000/javascript--v1.png" alt="Christy"/>
                                ) : getFileExt(file) == '.ts' ? (
                                    <img className="w-10 h-10 rounded-full" src="https://img.icons8.com/color/48/000000/typescript.png" alt="Christy"/>
                                ) : getFileExt(file) == '.php' ? (
                                    <img className="w-10 h-10 rounded-full" src="https://img.icons8.com/color/48/000000/php.png" alt="Christy"/>
                                ) : getFileExt(file) == '.json' ? (
                                    <img className="w-10 h-10 rounded-full" src="https://img.icons8.com/color/48/000000/json--v1.png" alt="Christy"/>
                                ) : getFileExt(file) == '.xml' ? (
                                    <img className="w-10 h-10 rounded-full" src="https://img.icons8.com/color/48/000000/xml.png" alt="Christy"/>
                                ) : getFileExt(file) == '.java' ? (
                                    <img className="w-10 h-10 rounded-full" src="https://img.icons8.com/color/48/000000/java-coffee-cup-logo--v1.png" alt="Christy"/>
                                ) : getFileExt(file) == '.py' ? (
                                    <img className="w-10 h-10 rounded-full" src="https://img.icons8.com/color/48/000000/python--v1.png" alt="Christy"/>
                                ) : getFileExt(file) == '.c' ? (
                                    <img className="w-10 h-10 rounded-full" src="https://img.icons8.com/color/48/000000/c-programming.png" alt="Christy"/>
                                ) : getFileExt(file) == '.cpp' ? (
                                    <img className="w-10 h-10 rounded-full" src="https://img.icons8.com/color/48/000000/c-plus-plus-logo.png" alt="Christy"/>  
                                ) : getFileExt(file) == '.cs' ? (
                                    <img className="w-10 h-10 rounded-full" src="https://img.icons8.com/color/48/000000/c-sharp-logo.png" alt="Christy"/>
                                ) : getFileExt(file) == '.go' ? (
                                    <img className="w-10 h-10 rounded-full" src="https://img.icons8.com/color/48/000000/golang.png" alt="Christy"/>
                                ) : getFileExt(file) == '.vb' ? (
                                    <img className="w-10 h-10 rounded-full" src="https://img.icons8.com/color/48/000000/visual-basic.png" alt="Christy"/>
                                ) : getFileExt(file) == '.kt' ? (
                                    <img className="w-10 h-10 rounded-full" src="https://img.icons8.com/color/48/000000/kotlin.png" alt="Christy"/>
                                ) : getFileExt(file) == '.swift' ? (
                                    <img className="w-10 h-10 rounded-full" src="https://img.icons8.com/color/48/000000/swift.png" alt="Christy"/>
                                ) : getFileExt(file) == '.t' ? (
                                    <img className="w-10 h-10 rounded-full" src="https://img.icons8.com/color/48/000000/perl.png" alt="Christy"/>
                                ) : getFileExt(file) == '.svg' ? (
                                    <img className="w-10 h-10 rounded-full" src="https://img.icons8.com/color/48/000000/svg.png" alt="Christy"/>
                                ) : getFileExt(file)
                                
                            }
                            <span className="ml-4 font-medium">{file.name}</span>
                        </div>

                    </li>
                ))}
            </ul>
            {
                rc4 ? (
                    <button onClick={handleFileReadButton} className="ml-4 w-11/12 text-gray-600 mb-3 mt-2 middle none center rounded-lg bg-gradient-to-tr to-slate-200 from-blue-500 via-indigo-700 py-3 px-5 font-sans text-xs font-bold uppercase shadow-md shadow-blue-500/20 transition-all hover:shadow-lg hover:shadow-blue-500/40 active:opacity-[0.85] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none">
                    Yükle
                </button>
                ) : (<button disabled={true} onClick={handleFileReadButton} className="ml-4 w-11/12 text-gray-600 mb-3 mt-2 middle none center rounded-lg bg-gradient-to-tr to-slate-200 from-blue-500 via-indigo-700 py-3 px-5 font-sans text-xs font-bold uppercase shadow-md shadow-blue-500/20 transition-all hover:shadow-lg hover:shadow-blue-500/40 active:opacity-[0.85] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none">
                Yükle
            </button>)
            }
        </div>
    );
};

export default Dragdrop;
