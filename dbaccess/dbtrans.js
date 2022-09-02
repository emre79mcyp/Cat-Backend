const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userSchema = require("../model/dbmodel");
const nodemailer = require("nodemailer");

const SECRET_TOKEN = process.env.SECRET_TOKEN;

exports.createTrans = async (req, res) => {
  try {
    const checkExist = await userSchema.findOne({ email: req.body.email });

    if (checkExist) {
      return res.status(201).json({
        success: false,
        error: `error: email ${req.body.email} has already been used `,
      });
    }

    const hashPassword = await bcrypt.hash(req.body.password, 10);

    const newUser = new userSchema({
      name: req.body.name,
      email: req.body.email,
      // password: req.body.password,
      password: hashPassword,
      memtype: req.body.memtype,
    });

    const user = await newUser.save();

    const token = createToken(user._id);

    // res.cookie( 'myjwt', token, {
    //     maxAge: 24 * 60 * 60 * 1000,
    //     httpOnly: true
    // });

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        email: user.email,
        name: user.name,
        memtype: user.memtype,
        adoptedCats: user.adoptedCats,
      },
      token: token,
    });
  } catch (error) {
    console.log("DB save error. please check inputs.", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.getTrans = async (req, res) => {
  try {
    const result = await userSchema.find();

    return res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.log("DB find error");
    return res.status(500).json({
      success: false,
      error: "DB find error",
    });
  }
};

exports.updateTrans = async (req, res) => {
  console.log("check params id is ", req.params.id);

  try {
    let result = await userSchema.findById(req.params.id);

    result.name = req.body.name;
    result.email = req.body.email;
    result.password = result.password;
    result.memtype = req.body.memtype;
    result.adoptedCats = result.adoptedCats;

    console.log("check in update ", result);

    const user = await result.save();

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        email: user.email,
        name: user.name,
        memtype: user.memtype,
        adoptedCats: user.adoptedCats,
      },
    });
  } catch (error) {
    console.log("DB Update error");
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const sendMail = async (option) => {
  // 1) CREATE A TRANSPORTER
  var transport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // 2) SPECIFY EMAIL OPTIONS
  const mailOptions = {
    from: "Emre <admin@gmail.com>",
    to: option.email,
    subject: option.subject,
    text: option.message,
  };

  // 3) SEND EMAIL
  await transport.sendMail(mailOptions);
};

exports.updateTransCats = async (req, res) => {
  console.log("check params id is ", req.params.id);

  try {
    const result = await userSchema.findByIdAndUpdate(
      { _id: req.params.id },
      { $addToSet: { adoptedCats: req.body.id } },
      {
        new: true, //this means return new updated document
        runValidators: true, // validate data everytime it change
      }
    );

    await sendMail({
      email: "mubasherali0331@gmail.com",
      subject: "Cat Adoption",
      message: `${result.email} has Adopted a Cat`,
    });

    res.status(201).json({
      success: true,
      data: {
        adoptedCats: result.adoptedCats,
        userid: result._id,
        name: result.name,
        email: result.email,
        memtype: result.memtype,
      },
    });
  } catch (error) {
    console.log("DB Update error");
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.getTransById = async (req, res) => {
  try {
    const user = await userSchema.findById(req.params.id);

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        email: user.email,
        name: user.name,
        memtype: user.memtype,
      },
    });
  } catch (error) {
    console.log("find by id error");
    return res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

exports.deleteTrans = async (req, res) => {
  try {
    const result = await userSchema.findByIdAndDelete(req.params.id);

    console.log("Success in deletion.");

    return res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.log("error in DB record deletion");
    return res.status(401).json({
      success: false,
      error: error.message,
    });
  }
};

// 3 day * 24 hr * 60 min * 60 sec * 1000 msec
const maxAge = 3 * 24 * 60 * 60 * 1000;

const createToken = (id) => {
  return jwt.sign({ id }, SECRET_TOKEN, {
    expiresIn: maxAge,
  });
};

exports.checkLogin = async (req, res) => {
  try {
    const user = await userSchema.findOne({ email: req.body.email });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: `Error: email ${req.body.email} is not found`,
      });
    }

    console.log("at login 1 user > ", user);

    const match = await bcrypt.compare(req.body.password, user.password);

    if (match) {
      const token = createToken(user._id);

      // res.cookie( 'myjwt', token, {
      //     maxAge: maxAge * 1000,
      //     httpOnly: true
      // });

      console.log("at login match token ", token);

      res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          email: user.email,
          name: user.name,
          memtype: user.memtype,
          adoptedCats: user.adoptedCats,
        },
        token: token,
      });
    } else {
      return res.status(401).json({
        success: false,
        error: "wrong email or password",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.checkUser = (req, res, next) => {
  const token = req.cookies.myjwt;

  if (token) {
    jwt.verify(token, SECRET_TOKEN, async (err, decodedToken) => {
      if (err) {
        res.locals.user = null;

        res.status(201).json({
          success: false,
          data: {
            _id: null,
            name: null,
            email: null,
            memtype: null,
            adoptedCats: [],
          },
        });

        next();
      } else {
        let user = await userSchema.findById(decodedToken.id);
        res.locals.user = user;

        console.log(">> ", res.locals.user);

        res.status(201).json({
          success: true,
          data: {
            _id: user._id,
            name: user.name,
            email: user.email,
            memtype: user.memtype,
          },
        });
        next();
      }
    });
  } else {
    res.locals.user = null;
    res.status(201).json({
      success: false,
      data: {
        _id: null,
        name: null,
        email: null,
        memtype: null,
      },
    });
    next();
  }
};

exports.checkEmail = async (req, res) => {
  try {
    const user = await userSchema.findOne({ email: req.params.id });
    if (user) {
      res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          memtype: user.memtype,
        },
      });
    }
  } catch (error) {
    console.log("no such email ", error);
  }
};

exports.logout = (req, res) => {
  res.status(201).json({
    success: true,
    data: {
      _id: null,
      name: null,
      email: null,
      memtype: null,
      adoptedCats: [],
    },
    token: "_",
  });
};
