import express from "express";
import searchRouter from "./routes/search.ts";

const app: express.Application = express();
const router = express.Router();
const PORT = 3230;

router.use((req, res, next) => {
    console.log(`${req.method} - ${req.url}`);
    next();
}) 

app.use(express.json());
app.use("/search", searchRouter);

app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});
