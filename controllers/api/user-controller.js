const User = require("../../models/user-model"),
  passport = require("passport"),
  jwt = require("jsonwebtoken");

//Login process
exports.user_login_process = (req, res, next) => {
  const { username, password } = req.body;

  console.log(username, password);
  if (!username || !password) {
    return res.status(400).json({
      message: "Vui lòng điền đủ thông tin"
    });
  }
  passport.authenticate(
    "local-login",
    { session: false },
    (err, user, info) => {
      if (err || !user) {
        console.log(err);
        return res.status(400).json({
          message: info ? info.message : "Đăng nhập không thành công"
        });
      }

      req.login(user, { session: false }, err => {
        if (err) {
          return res.send(err);
        }
        const token = jwt.sign(
          { username: user.username },
          process.env.TOKEN_SECRET
        );
        jwt;

        res.header("auth-token", token);
        return res.json({
          token,
          user
        });
      });
    }
  )(req, res, next);
};

//Register process
exports.user_register_process = async (req, res) => {
  const { fullName, nickName, username, password } = req.body;

  if (!username || !password || !fullName || !nickName) {
    return res.status(400).json({
      message: "Vui lòng điền đủ thông tin"
    });
  }

  if (await User.checkUsername(username)) {
    return res.status(400).json({
      message: `Tài khoản ${username} đã tồn tại`
    });
  }

  let newUser = new User.list({
    fullName: fullName,
    nickName: nickName,
    username: username,
    password: password
  });

  if (User.saveUser(newUser)) {
    return res.status(200).json({
      message: "Đăng ký thành công"
    });
  }
};

//Info of the user who has just logged in
exports.user_info = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, async (err, user, info) => {
    if (err) {
      return res.status(400).json({
        error: err
      });
    }

    if (info) {
      return res.status(400).json({
        message: info.message
      });
    } else {
      return res.status(200).json({
        fullName: user.fullName,
        nickName: user.nickName,
        username: user.username,
        point: user.point,
        rank: user.rank,
        numberNegativePoint: user.numberNegativePoint,
        urlAvatar: user.urlAvatar
      });
    }
  })(req, res, next);
};

//Update info of user
exports.update_info = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, async (err, user, info) => {
    if (err) {
      return res.status(400).json({
        error: err
      });
    }

    if (info) {
      return res.status(400).json({
        message: info.message
      });
    } else {
      const { fullName, nickName, urlAvatar } = req.body;
      if (!fullName || !nickName) {
        return res.status(400).json({
          message: "Vui lòng điền đủ thông tin"
        });
      }
      User.updateInfo(user.username, fullName, nickName, urlAvatar, res);
    }
  })(req, res, next);
};

//Change password of user
exports.change_password = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, async (err, user, info) => {
    if (err) {
      return res.status(400).json({
        error: err
      });
    }

    if (info) {
      return res.status(400).json({
        message: info.message
      });
    } else {
      const { newPassword, oldPassword } = req.body;
      console.log("old " + oldPassword);
      console.log("new " + newPassword);
      console.log(user.username);
      if (!newPassword || !oldPassword) {
        return res.status(400).json({
          message: "Vui lòng điền đủ thông tin"
        });
      }
      User.changePassword(
        user.username,
        user.password,
        newPassword,
        oldPassword,
        res
      );
    }
  })(req, res, next);
};

exports.update_point_and_rank = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, async (err, user, info) => {
    if (err) {
      console.log(err);
      return res.status(400).json({
        error: err
      });
    }

    if (info) {
      console.log(info);
      return res.status(400).json({
        message: info.message
      });
    } else {
      const { newRank, newPoint, newNumberNegativePoint } = req.body;
      console.log(user.username);
      if (newRank === '' || newPoint === null || newNumberNegativePoint === null) {
        console.log(newRank, newPoint, newNumberNegativePoint);
        console.log("Chưa điền đủ thông tin");
        return res.status(400).json({
          message: "Vui lòng điền đủ thông tin"
        });
      }
      User.updatePointAndRank(user.username ,newRank, newPoint, newNumberNegativePoint, res);
    }
  })(req, res, next);
};