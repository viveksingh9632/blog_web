const express = require("express");
const router = express.Router();

const User=require("../models/user")



router.get("/signup", (req, res) => {
    return res.render("signup");
});



router.post("/signup", async (req, res) => {
    const { name, email, password } = req.body;

    try {
        async function checkEmailExists(email) {
            const user = await User.findOne({ email });
            return !!user; // If user exists, return true; otherwise, return false
        }

        // Check if the email already exists
        const emailExists = await checkEmailExists(req.body.email);

        if (emailExists) {
            req.session.message = {
                type: "danger",
                message: "Admin email already exists."
            };
            return res.redirect("/user/signup");
        }

        await User.create({
            name,
            email,
            password
        });
        res.redirect("/");

    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
});

router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const token = await User.matchPasswordAndGenerateToken(email, password);
        
        if (token) {
            // Set the user session or token here if necessary
            return res.cookie("token", token).redirect("/");
        } else {
            return res.status(401).send("Invalid email or password");
        }
    } catch (error) {
        req.session.message = {
            type: "danger",
            message: "Invalid email or password"
        };
        return res.redirect("/user/login");
    }
});


router.get("/logout",(req,res)=>{
    res.clearCookie("token").redirect("/")

})



router.get("/login", (req, res) => {
    return res.render("login");
});


module.exports = router;
