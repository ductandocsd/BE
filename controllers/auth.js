import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { createError } from "../utils/error.js";
import jwt from "jsonwebtoken";

export const register = async (req, res, next) => {
  try {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password, salt);

    const newUser = new User({
      ...req.body,
      password: hash,
    });

    await newUser.save();
    res.status(200).send("User has been created.");
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return next(createError(404, "User not found!"));

    const isPasswordCorrect = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!isPasswordCorrect)
      return next(createError(400, "Wrong password or username!"));

    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT,
      { expiresIn: "1h" }
    );

    const { password, isAdmin, ...otherDetails } = user._doc;
    res
      .cookie("access_token", token, {
        httpOnly: true,
      })
      .status(200)
      .json({ details: { ...otherDetails }, isAdmin, token });
  } catch (err) {
    next(err);
  }
};

export const loginGet = async (req, res, next) => {
  try {
    // Lấy thông tin user từ token
    const decodedToken = jwt.decode(req.cookies.access_token);
    const userId = decodedToken.id;

    // Kiểm tra quyền truy cập (isAdmin)
    const isAdmin = decodedToken.isAdmin;

    // Lấy thông tin user từ database
    const user = await User.findById(userId);

    if (!user) {
      return next(createError(404, "User not found!"));
    }

    // Tính tổng cheapestPrice và rooms
    let totalCheapestPrice = 1000;
    let totalRooms = 3;

    const { password, ...otherDetails } = user._doc;
    res.status(200).json({
      details: { ...otherDetails },
      totalCheapestPrice,
      totalRooms,
    });
  } catch (err) {
    next(err);
  }
};
