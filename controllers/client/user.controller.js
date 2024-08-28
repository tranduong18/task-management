const md5 = require('md5');
const User = require("../../models/user.model");
const ForgotPassword = require("../../models/forgot-password.model");

const generateHelper = require("../../helpers/generate.helper");
const sendEmailHelper = require("../../helpers/sendEmail.helper");

// [POST] /users/register
module.exports.register = async (req, res) => {
    try {
        const existUser = await User.findOne({
            email: req.body.email,
            deleted: false
        });

        if (existUser) {
            res.json({
                code: 400,
                message: "Email đã tồn tại!"
            });
            return;
        }

        const token = generateHelper.generateRandomString(30);

        const dataUser = {
            fullName: req.body.fullName,
            email: req.body.email,
            password: md5(req.body.password),
            token: token
        };

        const user = new User(dataUser);
        await user.save();

        res.json({
            code: 200,
            message: "Đăng ký thành công!",
            token: token
        });
    } catch (error) {
        res.json({
            message: "Not Found"
        });
    }
}

// [POST] /users/login
module.exports.login = async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    const user = await User.findOne({
        email: email,
        deleted: false
    });

    if(!user){
        res.json({
            code: 400, 
            message: "Email không tồn tại!"
        });
        return;
    }

    if(md5(password) != user.password){
        res.json({
            code: 400,
            message: "Sai mật khẩu!"
        });

        return;
    }    

    res.json({
        code: 200,
        message: "Đăng nhập thành công!",
        token: user.token
    })
}

// [POST] /users/password/forgot
module.exports.forgotPassword = async (req, res) => {
    const email = req.body.email;

    const user = await User.findOne({
        email: email,
        deleted: false
    });

    if(!user){
        res.json({
            code: 400,
            message: "Email không tồn tại trong hệ thống!"
        });
        return;
    }

    const otp = generateHelper.generateRandomNumber(6);

    // Việc 1: Lưu email, OTP vào database
    const forgotPasswordData = {
        email: email,
        otp: otp,
        expireAt: Date.now() + 3*60*1000
    };

    const forgotPassword = new ForgotPassword(forgotPasswordData);
    await forgotPassword.save();

    // Việc 2: Gửi mã OTP qua email của user
    const subject = "Mã OTP lấy lại mật khẩu."
    const htmlSendEmail = `Mã OTP xác thực của bạn là <b style="color: green;">${otp}</b>. Mã OTP có hiệu lực trong 3 phút. Vui lòng không cung cấp mã OTP cho người khác.`;

    sendEmailHelper.sendEmail(email, subject, htmlSendEmail);

    res.json({
        code: 200,
        message: "Đã gửi mã OTP qua email"
    })
}

// [POST] /users/password/otp
module.exports.otpPassword = async (req, res) => {
    const email = req.body.email;
    const otp = req.body.otp;

    const result = await ForgotPassword.findOne({
        email: email,
        otp: otp
    });

    if(!result){
        res.json({
            code: 400,
            message: "OTP không hợp lệ"
        });

        return;
    }

    const user = await User.findOne({
        email: email
    });

    console.log(user);

    res.json({
        code: 200,
        message: "xác thực thành công!",
        token: user.token
    })
}

// [PATCH] /users/password/reset
module.exports.resetPassword = async (req, res) => {
    const token = req.body.token;
    const password = req.body.password;

    await User.updateOne({
        token: token,
        deleted: false
    }, {
        password: md5(password)
    });

    res.json({
        code: 200,
        message: "Đổi mật khẩu thành công!"
    })
}

// [GET] /users/profile
module.exports.profile = async (req, res) => {
    const user = await User.findOne({
        token: req.tokenVerify,
        deleted: false
    }).select("-password -token");

    res.json({
        code: 200,
        message: "Thành công!",
        user: user
    })
}