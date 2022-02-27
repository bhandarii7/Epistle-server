const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require('dotenv');
dotenv.config();
const fetchUser = require("../middleware/fetchuser");

const JWT_SECRET = process.env.JWT_SECRET;

//ROUTE 1: create a user using : POST "/api/auth/createuser"
router.post(
  "/createuser",
  [
    body("name", "enter a valid name").isLength({
      min: 3,
    }),
    body("email", "enter valid email").isEmail(),
    body("password").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    // return errors
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    //check whether the user with same email exist already

    try {
      let user = await User.findOne({
        email: req.body.email,
      });
      if (user) {
        return res.status(400).json({success,
          error: "A user with this email already exist.",
        });
      }
      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password, salt);

      // create a new user
      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secPass,
      });

      const data = {
        user: {
          id: user.id,
        },
      };

      const authToken = jwt.sign(data, JWT_SECRET);
      success = true;
      console.log(authToken);
      res.json({
        success,
        authToken,
      });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error");
    }
  }
);

//ROUTE 2: authenticate a user using POST '/api/auth/login'

router.post(
  "/login",
  [
    body("email", "enter valid email").isEmail(),
    body("password", "cannot be empty").exists(),
  ],
  async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    // console.log(req.body)
    const email = req.body.email;
    const password = req.body.password;

    try {
      let user = await User.findOne({ email });

      if (!user) {
        success = false;
        return res
          .status(400)
          .json({ success, error: "please login with correct credentials." });
      }

      const comparePassword = await bcrypt.compare(password, user.password);

      if (!comparePassword) {
        return res
          .status(400)
          .json({ success, error: "please login with correct credentials." });
      }

      const data = {
        user: {
          id: user.id,
        },
      };

      const authToken = jwt.sign(data, JWT_SECRET);
      success = true;
      res.json({
        success,
        authToken,
      });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error");
    }
  }
);

// ROUTE 3: get logged in user details POST: api/auth/getuser

router.post("/getuser", fetchUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    res.send(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("internal server error");
  }
});

module.exports = router;
