import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import countryRoute from './routes/countries.js';


const app = express();
app.use(cors());
app.use(bodyParser.json())
app.use(express.json())

app.use("/countries", countryRoute)

app.get("/status", async (req, res) => {
    res.json({message: "API is running fine"})
});

export default app;