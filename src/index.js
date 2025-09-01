import app from "./app.js";
import { connectDB } from "./db.js";
import { PORT, HOSTNAME } from './config.js';

connectDB();
app.listen(PORT, HOSTNAME, () => {  
    console.log(`Server running at http://${HOSTNAME}:${PORT}/`);
});