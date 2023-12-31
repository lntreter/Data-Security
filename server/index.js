const express = require('express');
const multer = require('multer');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const util = require('util');
const readdir = util.promisify(fs.readdir);
const stat = util.promisify(fs.stat);

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
const upload = multer({ dest: 'uploads/' }); // Dosyaları 'uploads' klasörüne kaydet
const encryptionAlgorithm = 'aes-256-cbc';
const secretKey = 'your-secret-key'; // Güçlü bir anahtarla değiştirilmelidir
const iv = crypto.randomBytes(16); // Initialization vector
const encryptedFolderPath = 'encrypted';
const uploadsFolderPath = 'uploads';

// Dosya şifreleme fonksiyonu
function encryptFile(buffer) {
    const cipher = crypto.createCipheriv(encryptionAlgorithm, secretKey, iv);
    const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
    return { iv: iv.toString('hex'), content: encrypted.toString('hex') };
}

// Dosya deşifreleme fonksiyonu
function decryptFile(encrypted) {
    const decipher = crypto.createDecipheriv(encryptionAlgorithm, secretKey, Buffer.from(encrypted.iv, 'hex'));
    const decrypted = Buffer.concat([decipher.update(Buffer.from(encrypted.content, 'hex')), decipher.final()]);
    return decrypted;
}

// Dosya yükleme ve şifreleme endpoint'i
app.post('/upload', (req, res) => {

    const base64Data = req.body.byteArray;
    console.log('base64Data: ', base64Data);
    console.log('fileName: ', req.body.fileName);
    const buffer = Buffer.from(base64Data, 'base64');

    const filePath = path.join(__dirname, 'uploads', "encrypted_"+req.body.fileName);

    fs.writeFile(filePath, buffer, (err) => {
        if (err) {
            res.status(500).send('Dosya yazılırken bir hata oluştu.');
            return;
        }
        res.send(`Dosya başarıyla kaydedildi: ${filePath}`);
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

// Klasör olustururken klasor bilşgisi alma endpoint'i
app.get('/create', async (req, res) => {
    try {
        const folderPath = path.join(__dirname, 'uploads');
        const folderNames = await readdir(folderPath);
        res.json(folderNames);
    } catch (err) {
        console.error('Klasör Listeleme Hatası:', err);
    }
});


// Dosya indirme ve deşifreleme endpoint'i
app.get('/download/:filename', (req, res) => {
    const encryptedFilePath = path.join('encrypted', `${req.params.filename}.enc`);
    const encryptedData = JSON.parse(fs.readFileSync(encryptedFilePath, 'utf8'));
    const decryptedData = decryptFile(encryptedData);

    res.write(decryptedData);
    res.end();
});

// klasörleri listelemek için get endpoint'i
app.get('/list', async (req, res) => {
    try {
        let Files;
        const encryptedFiles = await readdir(encryptedFolderPath);
        console.log(encryptedFiles);

        const uploadFiles = await readdir(uploadsFolderPath);
        
        const encryptedFilesSizes = await Promise.all(
            encryptedFiles.map(file => stat(path.join(encryptedFolderPath, file)).then(stats => stats.size))
        );
        const uploadFilesSizes = await Promise.all(
            uploadFiles.map(file => stat(path.join(uploadsFolderPath, file)).then(stats => stats.size))
        );

        Files = {
            names : {
                encryptedFiles,
                uploadFiles
            },
            size: {
                encryptedFilesSize: encryptedFilesSizes,
                uploadFilesSize: uploadFilesSizes
            },
            extension: {
                encryptedFilesExtension: encryptedFiles.map(file => path.extname(file)),
                uploadFilesExtension: uploadFiles.map(file => path.extname(file))
            }
        }

        res.json(Files);
        
        console.log('Klasördeki Dosyalar:', typeof(Files), Files);
    } catch (err) {
        console.error('Dosya Listeleme Hatası:', err);
    }
});


app.listen(3000, () => {
    console.log('Sunucu 3000 portunda başlatıldı.');
});
