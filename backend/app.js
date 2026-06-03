const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const PORT = process.env.PORT || 3000;
const path = require('path');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/*Discussion Routes*/
app.use('/api/discussion', require('./routes/discussion'));
app.use('/api/discussion/get-posts', require('./routes/discussion'));
app.use('/api/discussion/get-posts/:post_id', require('./routes/discussion'));

/*Comment Routes*/
app.use('/api/comment', require('./routes/comment'));
app.use('/api/comment/get-comments/:post_id', require('./routes/comment'));

/*Authentication Routes*/
app.use('/api/authentication/handle-token', require('./routes/authentication'));
app.use('/api/authentication/reset-password', require('./routes/authentication'));

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
