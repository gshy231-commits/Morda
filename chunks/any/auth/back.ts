import express, { Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import path from "path";

const app = express();
const PORT = 3000;
const SECRET_KEY = "supersecret";

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

const users = [{ username: "admin", password: bcrypt.hashSync("1", 10) }];

app.post("/login", async (req: Request, res: any) => {
  const { username, password } = req.body;
  const user = users.find((u) => u.username === username);

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Неверные данные" });
  }

  const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "1h" });
  res.json({ token });
});

app.get("/profile", (req: Request, res: any) => {
    const authHeader = req.headers.authorization;
    console.log(authHeader);
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Нет токена" });
    }
  
    const token = authHeader.split(" ")[1];
  
    try {
      const decoded = jwt.verify(token, SECRET_KEY);
      res.json({ message: "Добро пожаловать!", user: decoded });
    } catch (error) {
      console.error("Ошибка верификации токена:", error);
      res.status(401).json({ message: "Неверный токен" });
    }
  });

app.get("/", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => console.log(`Сервер запущен на http://localhost:${PORT}`));
