import "dotenv/config";
import app from "./app.js";
import connectDB from "./db/db.js";

const port = process.env.PORT || 8000;

// server started

connectDB()
    .then(() => {
        app.listen(port, () => {
            console.log(`Server is listening on http://localhost:${port}`);
        });
    })
    .catch(() => {
        console.error(`MONGODB faied to connect...`);
    });
