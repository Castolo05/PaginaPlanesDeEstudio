require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

// Conectar a MongoDB Atlas
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ Conectado a MongoDB Atlas"))
.catch(err => console.error("❌ Error al conectar a MongoDB", err));

// Esquemas
const userSchema = new mongoose.Schema({
  dni: String,
  password: String,
});

const progressSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  career: String,
  states: Object,
});

const User = mongoose.model('User', userSchema);
const Progress = mongoose.model('Progress', progressSchema);

// Registro
app.post('/api/register', async (req, res) => {
  const { dni, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ dni, password: hashed });
  res.json({ success: true });
});

// Login
app.post('/api/login', async (req, res) => {
  const { dni, password } = req.body;
  const user = await User.findOne({ dni });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Credenciales incorrectas' });
  }

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
  res.json({ token });
});

// Guardar progreso
app.post('/api/progress', async (req, res) => {
  const { token, career, states } = req.body;
  const { userId } = jwt.verify(token, process.env.JWT_SECRET);
  await Progress.findOneAndUpdate(
    { userId, career },
    { states },
    { upsert: true }
  );
  res.json({ success: true });
});

// Cargar progreso
app.post('/api/load', async (req, res) => {
  const { token, career } = req.body;
  const { userId } = jwt.verify(token, process.env.JWT_SECRET);
  const progress = await Progress.findOne({ userId, career });
  res.json({ states: progress?.states || {} });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en puerto ${PORT}`));
