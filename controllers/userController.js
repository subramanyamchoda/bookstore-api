const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const dotenv=require('dotenv');
dotenv.config();

const userFilePath = path.join(__dirname, '..', 'data', 'User.json');
const secretKey = process.env.SECRET_KEY || 'subbu' ;

const userRegister = async (req, res) => {
    const { email, password } = req.body;

    try {
        let users = [];
        try {
            const data = await fs.readFile(userFilePath, 'utf-8');
            users = data ? JSON.parse(data) : [];
        } catch (err) {
            if (err.code !== 'ENOENT') throw err;
        
        }        
        const existingUser = users.find(user => user.email === email);
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = {
            id: uuidv4(),
            email,
            password: hashedPassword
        };
        users.push(newUser);
        await fs.writeFile(userFilePath, JSON.stringify(users, null, 2));

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


const userLogin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const data = await fs.readFile(userFilePath, 'utf-8');
        const users = data ? JSON.parse(data) : [];

        const user = users.find(user => user.email === email);
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign({ id: user.id, email: user.email }, secretKey, { expiresIn: '1h' });

        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = { userRegister ,userLogin };
