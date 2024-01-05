const express = require('express');
const multer = require('multer');
const crypto = require('crypto');
const CryptoJS = require("crypto-js");
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const cors = require('cors');
const util = require('util');
const { count } = require('console');
const readdir = util.promisify(fs.readdir);
const stat = util.promisify(fs.stat);

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
//rc4 için şifreleme anahtarını oluştur crtpyo-js ile
const secretKey = crypto.randomBytes(16).toString('hex');

// Dosya yükleme ve şifreleme endpoint'i


// Klasör olusturma endpoint'i
app.post('/create', (req, res) => {
    const folderName = req.body.folderName;
    const folderPath = path.join(__dirname, 'uploads', folderName);
    fs.mkdir(folderPath, (err) => {
        if (err) {
            res.status(500).send('Klasör oluşturulurken bir hata oluştu.');
            return;
        }
        res.send(`Klasör başarıyla oluşturuldu: ${folderPath}`);
    });
});

// Directory listing endpoint'i
app.get('/create', async (req, res) => {
    try {
        const files = await readdir(".");
        res.json(files);
        console.log('Klasördeki Dosyalar:', files);
    } catch (err) {
        console.error('Dosya Listeleme Hatası:', err);
    }
});

function findFileInDirectory(dir, partialFileName) {

    console.log("partialFileName: ", partialFileName);

    if (!dir || typeof dir !== 'string') {
        // Geçersiz dizin yolu
        return null;
    }

    let files;
    try {
        files = fs.readdirSync(dir);
    } catch (error) {
        console.error('Dizin okunurken hata oluştu:', error);
        return null;
    }

    for (const file of files) {
        // dosya adı node_modules ile başlıyorsa atla
        if (file.startsWith('node_modules')) {
            continue;
        }
        const fullPath = path.join(dir, file);
        console.log('fullPath: ', fullPath);
        let stat;
        try {
            stat = fs.statSync(fullPath);
        } catch (error) {
            console.error('Dosya durumu okunurken hata oluştu:', error);
            continue; // Bir sonraki dosyaya geç
        }

        if (stat.isDirectory()) {
            const result = findFileInDirectory(fullPath, partialFileName);
            if (result) return result;
        } else if (fullPath.includes(partialFileName)) {
            console.log('DOSYA BULUNDU: ', fullPath);
            return fullPath;
        }
    }

    return null;
}

const readDirDir = async (dir, dirs) => {
    let files;
    try {
        files = await fsPromises.readdir(dir);
    } catch (err) {
        console.error('Dizin okunurken hata oluştu:', err);
        return;
    }

    for (let file of files) {
        if (file.startsWith('node_modules')) {
            continue;
        }
        let fullPath = path.join(dir, file);
        let stats;
        try {
            stats = await fsPromises.stat(fullPath);
        } catch (err) {
            console.error('Dosya bilgisi alınırken hata oluştu:', err);
            continue;
        }
        if (stats.isDirectory()) {
            console.log('Klasör bulundu: ', file);
            dirs.push(fullPath);
            await readDirDir(fullPath, dirs);
        }
    }
};


// belli bir dizindeki dizinleri listeleme endpoint'i

app.get('/listDir', async (req, res) => {
    try {
        const dir = "./";
        //dizindeki klasörleri bul

        let dirs = [];

        await readDirDir(dir, dirs);

        console.log('Klasördeki Klasörler:', dirs);

        res.json(dirs);


    } catch (err) {
        console.error('Dosya Listeleme Hatası:', err);
    }
});


app.post('/upload', (req, res) => {


    const base64Data = req.body.byteArray;
    console.log('base64Data: ', base64Data);
    console.log('fileName: ', req.body.fileName);

    // let utf8Encode = new TextEncoder();

    
    // let utf8Buffer = utf8Encode.encode(base64Data);
    // console.log('utf8Encode: ', utf8Encode.encode(base64Data));
    console.log('base64 : ', base64Data );


    // eğer uploads klasörü yoksa oluştur
    if (!fs.existsSync('./uploads')) {
        fs.mkdirSync('./uploads');
    }

    const filePath = path.join(__dirname, 'uploads', "encrypted_"+req.body.fileName);
    const fileNamewithoutExtension = req.body.fileName.split('.')[0];

    // Dosya ile birlikte gönderilen şifreleme anahtarını RC4 ile şifrele ve encrypted klasörüne anahtar algoritması ile kaydet

    console.log('key: ', req.body.key);
    console.log('secretKey: ', secretKey);

    if (!fs.existsSync('./encryptkeys')) {
        fs.mkdirSync('./encryptkeys');
    }

    const cipherText = CryptoJS.RC4.encrypt(req.body.key, secretKey).toString();
    const encryptedKeyFilePath = path.join(__dirname, 'encryptkeys', req.body.algorithm+"-encrypted_"+fileNamewithoutExtension+".enc");

    Promise.all([
        new Promise((resolve, reject) => {
            fs.writeFile(encryptedKeyFilePath, cipherText, (err) => {
                if (err) {
                    reject('Dosya yazılırken bir hata oluştu.');
                } else {
                    resolve(`Dosya başarıyla kaydedildi: ${encryptedKeyFilePath}`);
                }
            });
        }),
        new Promise((resolve, reject) => {
            fs.writeFile(filePath, base64Data, "utf8", (err) => {
                if (err) {
                    reject('Dosya yazılırken bir hata oluştu.');
                } else {
                    resolve(`Dosya başarıyla kaydedildi: ${filePath}`);
                }
            });
        })
    ]).then((results) => {
        res.send(results);
    }).catch((error) => {
        res.status(500).send(error);
    });
    
});

//dosya dizini değiştirme endpoint'i

app.post('/changeDir', (req, res) => {
    
    const dir = req.body.dir;
    console.log('dir: ', dir);
    const fileName = req.body.folderName;
    const filePath = findFileInDirectory("./", fileName);
    console.log('*****************************************' + filePath);

    //Bulunan dosyayı istenilen dizine taşı
    const newFilePath = path.join(__dirname, dir, fileName);
    console.log( newFilePath);

    Promise.all([
        new Promise((resolve, reject) => {
            fs.rename(filePath, newFilePath, (err) => {
                if (err) {
                    reject('Dosya taşınırken bir hata oluştu.');
                } else {
                    resolve(`Dosya başarıyla taşındı: ${newFilePath}`);
                }
            });
        })
    ]).then((results) => {
        res.send(results);
    }).catch((error) => {
        res.status(500).send(error);
    });

});



//dosya silme endpoint'i

app.get('/delete/:filename', (req, res) => {

    const dir = './';
    const fileName = req.params.filename;
    const filePath = findFileInDirectory(dir, fileName);
    console.log('*****************************************' + filePath);

    const encryptedKeyFilePath = findFileInDirectory(dir, fileName.split('.')[0]+".enc");

    // Dosyayı sil

    Promise.all([
        new Promise((resolve, reject) => {
            fs.unlink(filePath, (err) => {
                if (err) {
                    reject('Dosya silinirken bir hata oluştu.');
                } else {
                    resolve(`Dosya başarıyla silindi: ${filePath}`);
                }
            });
        }),
        new Promise((resolve, reject) => {
            fs.unlink(encryptedKeyFilePath, (err) => {
                if (err) {
                    reject('Dosya silinirken bir hata oluştu.');
                } else {
                    resolve(`Dosya başarıyla silindi: ${encryptedKeyFilePath}`);
                }
            });
        })
    ]).then((results) => {
        res.send(results);
    }).catch((error) => {
        res.status(500).send(error);
    });
    
});


// Dosya indirme ve deşifreleme endpoint'i
app.get('/download/:filename', (req, res) => {
    //istenilen dosyanın adına göre hangi dizinde olduğunu bul
    const dir = './';
    const fileName = req.params.filename;
    const filePath = findFileInDirectory(dir, fileName);
    console.log('*****************************************' + filePath);

    let results = [];
    
    const encryptedKeyFilePath = findFileInDirectory(dir, fileName.split('.')[0]+".enc");
    const realEFilename = path.basename(encryptedKeyFilePath);

    const algorithm = realEFilename.split('-')[0];

    // Dosyayı oku
    const readData = fs.readFileSync(filePath, "utf8");

    console.log('base64string: ', readData);
    
    const encryptedKey = fs.readFileSync(encryptedKeyFilePath, "utf8");
    const decryptedKey = CryptoJS.RC4.decrypt(encryptedKey, secretKey).toString(CryptoJS.enc.Utf8);

    console.log('encryptedKey: ', encryptedKey);

    console.log('decryptedKey: ', decryptedKey);

    results.push({
        name: fileName,
        data: readData,
        key: decryptedKey,
        algorithm: algorithm,
    });

    res.json(results);

});

const getFiles = (dir, parentPath = '') => {
    let results = [];
    fs.readdirSync(dir).forEach(file => {
        // node_modules klasörünü atla
        if (file === 'node_modules') {
            return;
        }

        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);

        // Eğer bir klasörse, içindeki dosyaları da tarar
        if (stats.isDirectory()) {
            results = results.concat(getFiles(filePath, path.join(parentPath, file))); //
        } else {
            results.push({
                name: file,
                path: path.join(parentPath, file), // Dosyanın yolu, üst dizinlerle birleştirilmiş
                extension: path.extname(file),
                size: stats.size,
                isDirectory: stats.isDirectory(),
                modifiedDate: stats.mtime
            });
        }
    }); 

    console.log('results: ', results);
    return results;
};

app.get('/list', (req, res) => {
    const dir = './'; // Örnek olarak mevcut dizini kullanıyoruz
    try {
        const files = getFiles(dir);
        res.json(files);
        console.log('Klasördeki Dosyalar:', files);
    } catch (error) {
        res.status(500).send('Dosya bilgileri alınamadı');
    }
});


app.listen(3000, () => {
    console.log('Sunucu 3000 portunda başlatıldı.');
});