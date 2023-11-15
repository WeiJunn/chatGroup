const app = require("express")();
const http = require("http").Server(app);
const io = require("socket.io")(http, { cors: true });
const port = 3000;
//监听用户的连接的事件
// socket表示用户连接
// socket.emit 表示触发某个事件
// socket.on 表示注册某个事件
app.get("/", function (req, res) {
  res.send("<h1>如果你看到了这个界面那么服务已经启动了</h1>");
});
const users = [];
io.on("connection", (socket) => {
  console.log("有用户连接上");
  // 当客户端触发chat message时 会给所有连接上的客服端广播一个chat message事件
  socket.on("chat message", (msg, userInfo) => {
    //广播事件
    io.emit("chat message", msg, userInfo);
  });
  //登录事件
  socket.on("login", (userInfo) => {
    let user;
    if (users) {
      user = users.find((item) => item.userName === userInfo.userName);
    }
    //先判断用户名是否重复的如果重复则不给登录提示用户重复
    if (user) {
      //告诉浏览器登录失败用户名重复
      socket.emit("loginError");
      console.log("用户名重复");
    } else {
      socket.userName = userInfo.userName;
      socket.avatar = userInfo.avatar;
      userInfo.id = socket.id;
      users.push(userInfo);
      socket.emit("loginSucceed", userInfo);
      //当有人登录成功告诉广播一个事件告诉浏览器有人加入了群聊 把所有的用户一起返回和刚加入群聊的姓名返回
      io.emit("connectChat", users, {
        id: socket.id,
        userName: socket.userName,
        avatar: socket.avatar,
      });
    }
    // console.log("socket", io.sockets.sockets);
  });
  //用户断开连接功能
  socket.on("disconnect", (reason) => {
    console.log("有人退出");
    //找出登出那个人的位置删掉它
    let index = users.findIndex((item) => item.id === socket.id);
    users.splice(index, 1);
    //广播告诉浏览器有人退出了群聊
    io.emit("quitChat", users, {
      id: socket.id,
      userName: socket.userName,
      avatar: socket.avatar,
    });
  });
  //用户私聊
  socket.on("privateChat", (msg, sourceUserInfo, destinationUserInfo) => {
    console.log("msg", msg);
    console.log("源id", sourceUserInfo.id);
    console.log("目的id", destinationUserInfo.id);
    //有私聊消息进来给收到私聊的用户和发送消息的用户都触发一个事件
    io.to(destinationUserInfo.id).emit("privateChat", msg, sourceUserInfo);
    io.to(sourceUserInfo.id).emit("privateChat", msg, sourceUserInfo);
  });
});

http.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});
