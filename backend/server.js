const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path =require('path');

const app = express();
const PORT = 5000;

// Middleware

app.use(cors());
app.use(bodyParser.json());


const _dirname= path.resolve()
// MongoDB Connection
mongoose.connect('mongodb+srv://abishek01yadav:uPO3Ww9EsMidY6GX@cluster0.h1dir.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('Connected to MongoDB'))
  .catch(err => console.log('MongoDB connection error:', err));

// Define the Question Schema
const questionSchema = new mongoose.Schema({
    title: { type: String, required: true },
    type: { type: String, required: true },
    siblingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    options: [String],
    anagramType: { type: String },
    blocks: [{
        siblingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
        solution: { type: String },
    }],
});

const Question = mongoose.model('Question', questionSchema, 'questionsdata');

// API to search questions by title
app.get('/api/questions', async (req, res) => {
    try {
        const { title, page = 1, limit = 10 } = req.query;
        const query = title ? { title: { $regex: title, $options: 'i' } } : {};
        const questions = await Question.find(query)
            .skip((page - 1) * limit)
            .limit(Number(limit));
        const total = await Question.countDocuments(query);

        res.json({
            questions,
            total,
            page: Number(page),
            pages: Math.ceil(total / limit),
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching questions', error });
    }
});


app.use(express.static(path.join(_dirname ,"/quest-frontend/dist")));

app.get('*', (req ,res)=>{
    res.sendFile(path.resolve(_dirname, "quest-frontend/dist" , "index.html"));
});
// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
