import express from "express"
const app = express();
const port = 3000;

app.use(express.json());
import redis from "./config/redis.js";
import mailer from "./config/nodemailer.js";
import nodemailer from "nodemailer"


const otpGeneration = () => Math.floor(100000 + Math.random() * 900000).toString();


app.get("/",async(req,res)=>{ res.send("hello world")})

app.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ msg: "Email is required" });
    }

    const otp = otpGeneration();

    await redis.set(`otp:${email}`, otp, "EX", 300);

    const info = await mailer.sendMail({
      from: "vishalgupta120703@gmail.com",
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is: ${otp}`
    });

    return res.status(200).json({ msg: "OTP has been sent" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: error.message });
  }
});
app.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ msg: "Email and OTP required" });
    }
    const storedOtp = await redis.get(`otp:${email}`);

    if (!storedOtp) {
      return res.status(400).json({ msg: "OTP expired or not found" });
    }

    if (storedOtp !== otp) {
      return res.status(400).json({ msg: "Invalid OTP" });
    }

    await redis.del(`otp:${email}`);

    return res.status(200).json({ msg: "OTP verified successfully" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: error.message });
  }
});

app.listen(port,(req,res)=>{
    console.log(`Server is running on port : ${port}`);
})