const express = require('express');
const multer = require('multer');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
const upload = multer({ dest: 'uploads/' }); // Dosyaları 'uploads' klasörüne kaydet
const encryptionAlgorithm = 'aes-256-cbc';
const secretKey = 'your-secret-key'; // Güçlü bir anahtarla değiştirilmelidir
const iv = crypto.randomBytes(16); // Initialization vector
const encryptedFolderPath = 'encrypted';

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
app.post('/upload', upload.single('file'), (req, res) => {
    const fileBuffer = fs.readFileSync(req.file.path);
    const encrypted = encryptFile(fileBuffer);

    const encryptedFilePath = path.join('encrypted', `${req.file.filename}.enc`);
    fs.writeFileSync(encryptedFilePath, JSON.stringify(encrypted));

    res.send(`Dosya şifrelendi ve kaydedildi: ${encryptedFilePath}`);
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
app.get('/list', (req, res) => {
    fs.readdir(encryptedFolderPath, (err, files) => {
        if (err) {
            console.error('Dosya Listeleme Hatası:', err);
            return;
        }
        console.log('Klasördeki Dosyalar:', files);
        res.json(files);
    });
    
});



app.listen(3000, () => {
    console.log('Sunucu 3000 portunda başlatıldı.');
});
