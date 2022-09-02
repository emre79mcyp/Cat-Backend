require("dotenv").config(); // this line means we are using environment variable and this should be at top

const mongoose = require("mongoose");
const app = require("./app");

const PORT = process.env.PORT || 5000;
const DATABASE = process.env.DB_MONGO_URL;

mongoose
  .connect(DATABASE, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })
  .then(() => {
    console.log("DATABASE CONNECTION SUCCESSFUL <3");
    app.listen(PORT, () => console.log(`server listening ${PORT}`));
  })
  .catch((err) => {
    console.log("CANNOT CONNECT DATABASE");
    console.log(err);
  });
