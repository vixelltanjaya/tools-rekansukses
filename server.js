const express = require('express');
const QRCode = require('qrcode');
const sharp = require('sharp');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3005;

// Middleware
const upload = multer({ dest: 'uploads/' });
app.use(express.static('public')); 
app.use(express.json());

// --- ROUTES ---

// Home Hub
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

// Tool Routes
app.get('/qr-generator', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'qr.html'));
});
app.get('/image-compressor', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'compressor.html'));
});
app.get('/merge-pdf', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'merge-pdf.html'));
});
app.get('/cek-nama', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'cek-nama.html'));
});

// --- API: QR Logic ---
app.post('/api/generate-qr', upload.single('logo'), async (req, res) => {
    try {
        const url = req.body.url;
        const logoPath = req.file ? req.file.path : null;
        if (!url) return res.status(400).send('URL required');

        const qrBuffer = await QRCode.toBuffer(url, {
            errorCorrectionLevel: 'H',
            width: 500,
            margin: 2,
            color: { dark: '#000000', light: '#ffffff' }
        });

        let finalImage = qrBuffer;

        if (logoPath) {
            const logoBuffer = await sharp(logoPath).resize(100, 100).toBuffer();
            finalImage = await sharp(qrBuffer).composite([{ input: logoBuffer, gravity: 'center' }]).toBuffer();
            fs.unlinkSync(logoPath);
        }

        res.writeHead(200, { 'Content-Type': 'image/png', 'Content-Length': finalImage.length });
        res.end(finalImage);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error');
    }
});

app.listen(port, () => {
    console.log(`Rekan Sukses Tools running on port ${port}`);
});