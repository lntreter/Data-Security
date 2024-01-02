const express = require('express');
const multer = require('multer');
const crypto = require('crypto');
const CryptoJS = require("crypto-js");
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const util = require('util');
const readdir = util.promisify(fs.readdir);
const stat = util.promisify(fs.stat);

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
//rc4 için şifreleme anahtarını oluştur crtpyo-js ile
const secretKey = crypto.randomBytes(16).toString('hex');

// Dosya yükleme ve şifreleme endpoint'i
app.post('/upload', (req, res) => {


    const base64Data = req.body.byteArray;
    console.log('base64Data: ', base64Data);
    console.log('fileName: ', req.body.fileName);
    const buffer = Buffer.from(base64Data, 'base64'); //

    const filePath = path.join(__dirname, 'uploads', "encrypted_"+req.body.fileName);
    const fileNamewithoutExtension = req.body.fileName.split('.')[0];

    // Dosya ile birlikte gönderilen şifreleme anahtarını RC4 ile şifrele ve encrypted klasörüne anahtar algoritması ile kaydet

    console.log('key: ', req.body.key);
    console.log('secretKey: ', secretKey);

    const cipherText = CryptoJS.RC4.encrypt(req.body.key, secretKey).toString();
    const encryptedKeyFilePath = path.join(__dirname, 'encryptkeys', req.body.algorithm+"-encrypted_"+fileNamewithoutExtension+".txt");

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
            fs.writeFile(filePath, buffer, (err) => {
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


// Dosya indirme ve deşifreleme endpoint'i
app.get('/download/:filename', (req, res) => {
    //istenilen dosyanın adına göre hangi dizinde olduğunu bul
    const dir = './';
    const fileName = req.params.filename;
    const filePath = findFileInDirectory(dir, fileName);
    console.log('*****************************************' + filePath);
    const realFileName = path.basename(filePath);

    const encryptedKeyFilePath = findFileInDirectory(dir, fileName.split('.')[0]+".txt");
    const realEFilename = path.basename(encryptedKeyFilePath);

    const algorithm = realEFilename.split('-')[0];

    // Dosyayı oku
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.status(500).send('Dosya okunurken bir hata oluştu.');
            return;
        }

        // Dosyayı rc4 ile şifrelenmiş anahtar ile deşifrele
        
        const encryptedKey = fs.readFileSync(encryptedKeyFilePath);
        const decryptedKey = CryptoJS.RC4.decrypt(encryptedKey, secretKey).toString(CryptoJS.enc.Utf8);

        // Okuduğumuz dosyayı istemciye gönder
        const File = {
            name: fileName,
            data: data,
            key: decryptedKey,
            algorithm: algorithm
        };
        
        res.json(File);

    });

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
            results = results.concat(getFiles(filePath, path.join(parentPath, file)));
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