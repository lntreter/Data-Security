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

// Dosya indirme ve deşifreleme endpoint'i
app.get('/download/:filename', (req, res) => {
    const encryptedFilePath = path.join('uploads', `${req.params.filename}`);
    const encryptedData = JSON.parse(fs.readFileSync(encryptedFilePath, 'utf8'));
    const decryptedData = decryptFile(encryptedData);

    res.write(decryptedData);
    res.end();
    res.send(`Dosya başarıyla indirildi `);
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