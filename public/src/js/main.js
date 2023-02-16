"use strict";

function _toConsumableArray(arr) {
  return (
    _arrayWithoutHoles(arr) ||
    _iterableToArray(arr) ||
    _unsupportedIterableToArray(arr) ||
    _nonIterableSpread()
  );
}
function _nonIterableSpread() {
  throw new TypeError(
    "Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."
  );
}
function _iterableToArray(iter) {
  if (
    (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null) ||
    iter["@@iterator"] != null
  )
    return Array.from(iter);
}
function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) return _arrayLikeToArray(arr);
}
function _createForOfIteratorHelper(o, allowArrayLike) {
  var it =
    (typeof Symbol !== "undefined" && o[Symbol.iterator]) || o["@@iterator"];
  if (!it) {
    if (
      Array.isArray(o) ||
      (it = _unsupportedIterableToArray(o)) ||
      (allowArrayLike && o && typeof o.length === "number")
    ) {
      if (it) o = it;
      var i = 0;
      var F = function F() {};
      return {
        s: F,
        n: function n() {
          if (i >= o.length) return { done: true };
          return { done: false, value: o[i++] };
        },
        e: function e(_e) {
          throw _e;
        },
        f: F,
      };
    }
    throw new TypeError(
      "Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."
    );
  }
  var normalCompletion = true,
    didErr = false,
    err;
  return {
    s: function s() {
      it = it.call(o);
    },
    n: function n() {
      var step = it.next();
      normalCompletion = step.done;
      return step;
    },
    e: function e(_e2) {
      didErr = true;
      err = _e2;
    },
    f: function f() {
      try {
        if (!normalCompletion && it.return != null) it.return();
      } finally {
        if (didErr) throw err;
      }
    },
  };
}
function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
    return _arrayLikeToArray(o, minLen);
}
function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;
  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
  return arr2;
}
//选择头像的input
var changeAvatarInput = document.querySelector(".change-avatar-input");
//头像显示
var selectAvatar = document.querySelector(".select-avatar");
//登录界面
var loginLayout = document.querySelector(".login-layout");
//聊天界面
var appLayout = document.querySelector(".app-layout");
//所有的聊天组
var allChatGroup = document
  .getElementById("right")
  .getElementsByClassName("chat-group");
//所有的聊天组
var allChatGroupChatWindow = document.getElementsByClassName("chat-window");
//所有的聊天框的input
var allChatGroupinput = document
  .getElementById("right")
  .getElementsByClassName("input-message");
var allChatGroupSendBtn = document
  .getElementById("right")
  .getElementsByClassName("send");
//用户名input
var userNameInput = document.querySelector(".user-name-input");
//所有用户容器
var userserItemContainer = document.querySelector(".left .user-list-group");

// 所有用户
var allUserItem = document
  .getElementById("user-list-group")
  .getElementsByClassName("item");
//除去第一个聊天室
var userItemNotFirstChild = document.querySelectorAll(
  ".left .user-list-group .item:not(:nth-child(2))"
);

//用户前面的tag条
var userTag = document.getElementById("tag");
//聊天室的名字
var chatGroupTitle = document.querySelector(".right .title>span");
//所有输入信息的input
var messageInput = document.querySelectorAll(".input-message");
//进入btn
var joinBtn = document.querySelector(".join");
// unserInfo
var userInfo = document.querySelector(".left .user-info");
userNameInput.focus();
//选择头像事件
changeAvatarInput.addEventListener("change", function () {
  var file = changeAvatarInput.files[0];
  var fileMaxSize = 500; //只能上传500kb以内
  var flieSize = file.size / 1024;
  if (!file) {
    changeAvatarInput.value = "";
    return;
  } else if (!file.name.match(/.jpg|.png/gi)) {
    alert("请选择jpg格式或者png格式的文件");
    changeAvatarInput.value = "";
    return;
  }
  if (flieSize > fileMaxSize) {
    alert("图片不能超过500kb");
    changeAvatarInput.value = "";
    return;
  }

  // 把图片转成base64然后赋值给src
  var fr = new FileReader();
  fr.readAsDataURL(file);
  fr.onload = function () {
    selectAvatar.src = fr.result;
  };
});
var myUserInfo;
var socket;
var topMoveDistance = 4.9; //  4.5 + 0.4rem
var init = true;
var activeIndex = 0;
var notOneselfUsersInfo;
//聊天室的input enter事件
messageInput[0].addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    e.preventDefault();
    if (!messageInput[0].value) {
      return;
    }
    socket.emit("chat message", messageInput[0].value, myUserInfo);
    messageInput[0].value = "";
  }
});
//聊天室的btn click 事件
allChatGroupSendBtn[0].addEventListener("click", function (e) {
  e.preventDefault();
  if (!messageInput[0].value) {
    return;
  }
  socket.emit("chat message", messageInput[0].value, myUserInfo);
  messageInput[0].value = "";
});

//用户名input enter事件  进入聊天室事件
userNameInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    if (!userNameInput.value) {
      return;
    } else if (userNameInput.value.length > 15) {
      alert("用户名长度不能超过15");
      return;
    }
    createdSocket();
    var src = selectAvatar.getAttribute("src");
    var _userInfo = {
      userName: userNameInput.value,
      avatar: src,
    };
    socket.emit("login", _userInfo);
  }
});
//joinBtn click
joinBtn.addEventListener("click", function () {
  if (!userNameInput.value) {
    return;
  } else if (userNameInput.value.length > 15) {
    alert("用户名长度不能超过15");
    return;
  }
  createdSocket();
  var src = selectAvatar.getAttribute("src");
  socket.emit("login", {
    userName: userNameInput.value,
    avatar: src,
  });
});
//创建聊天室的聊天信息
function createdChatRommMessage(msg, userInfo) {
  // isMymessage 判断是不是自己发的消息 true为自己发的
  var isMymessage = myUserInfo.id === userInfo.id;
  var attr = '\n           <div class="avatar">\n             <img src="'
    .concat(
      isMymessage ? myUserInfo.avatar : userInfo.avatar,
      '" alt="" />\n           </div>\n           <div class="content">\n             <div class="user-name">'
    )
    .concat(
      isMymessage ? myUserInfo.userName : userInfo.userName,
      '</div>\n             <div class="user-mesaage">\n               '
    )
    .concat(msg, "\n             </div>\n           </div>\n       ");
  var ele = document.createElement("div");
  ele.classList.add(isMymessage ? "my-item" : "item");
  ele.innerHTML = attr;
  allChatGroupChatWindow[0].appendChild(ele);
  var userList = document.querySelectorAll(".user-list-group .item");
  updateScroll(0);
  if (activeIndex !== 0) {
    var flag = createdNewMessage(userList, 0);
    if (!flag) {
      var _ele = document.createElement("div");
      _ele.classList.add("new-message");
      _ele.innerHTML = 1;
      userList[0].appendChild(_ele);
    }
  }
}
//创建私聊的的聊天信息
function createdChatMessage(msg, userInfo) {
  // isMymessage 判断是不是自己发的消息 true为自己发的
  var isMymessage = myUserInfo.id === userInfo.id;
  var attr = '\n           <div class="avatar">\n             <img src="'
    .concat(
      isMymessage ? myUserInfo.avatar : userInfo.avatar,
      '" alt="" />\n           </div>\n           <div class="content">\n             <div class="user-name">'
    )
    .concat(
      isMymessage ? myUserInfo.userName : userInfo.userName,
      '</div>\n             <div class="user-mesaage">\n               '
    )
    .concat(msg, "\n             </div>\n           </div>\n       ");
  var ele = document.createElement("div");
  ele.classList.add(isMymessage ? "my-item" : "item");
  ele.innerHTML = attr;

  // 如果是自己发的消息就渲染到当前打开的聊天组即可
  //如果是收到别人发的消息得找到是谁发的并且找到这个人的index'

  if (isMymessage) {
    allChatGroupChatWindow[activeIndex].appendChild(ele);
    updateScroll(activeIndex);
  } else {
    var index =
      notOneselfUsersInfo.findIndex(function (item) {
        return item.id === userInfo.id;
      }) + 1;
    allChatGroupChatWindow[index].appendChild(ele);
    //如果当前用户不在就这个聊天界面 就添加一个new-message
    if (activeIndex !== index) {
      var userList = document.querySelectorAll(".user-list-group .item");
      var flag = createdNewMessage(userList, index);
      if (!flag) {
        var _ele2 = document.createElement("div");
        _ele2.classList.add("new-message");
        _ele2.innerHTML = 1;
        userList[index].appendChild(_ele2);
      }
    }
    updateScroll(index);
  }
}
//创建new-message
function createdNewMessage(userList, index) {
  var _iterator = _createForOfIteratorHelper(userList[index].childNodes),
    _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done; ) {
      var item = _step.value;
      if (item.classList) {
        var _iterator2 = _createForOfIteratorHelper(item.classList),
          _step2;
        try {
          for (_iterator2.s(); !(_step2 = _iterator2.n()).done; ) {
            var item1 = _step2.value;
            if (item1 === "new-message") {
              item.innerText = parseInt(item.innerText) + 1;
              return true;
            }
          }
        } catch (err) {
          _iterator2.e(err);
        } finally {
          _iterator2.f();
        }
      }
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
}
//滚动条到底部
function updateScroll(index) {
  // 定时改变高度，实现滚动效果
  var timeTop = setInterval(function () {
    allChatGroupChatWindow[index].scrollTop += 40;
    //不懂为啥会得出小数可能我的屏幕显示比例的问题
    if (
      allChatGroupChatWindow[index].scrollTop +
        1 +
        allChatGroupChatWindow[index].clientHeight >=
      allChatGroupChatWindow[index].scrollHeight
    ) {
      clearInterval(timeTop);
    }
  }, 10);
}

//更新群聊名
function updatedChatgroupName(count) {
  chatGroupTitle.innerHTML = "\u804A\u5929\u5BA4(".concat(count, ")");
}
/**
 更新左侧用户list
 *
 * @param {boolean} isJon 是加入还是离开
 * @param {string} userInfo 离开 加入用户的信息
 */
function updatedLeftuserList(isJon, userInfo) {
  var userListGroup = document.getElementById("user-list-group");
  var list = userListGroup.getElementsByClassName("item");
  if (myUserInfo.id === userInfo.id) {
    return;
  }
  if (isJon) {
    var ele = document.createElement("div");
    ele.classList.add("item");
    ele.innerHTML = '\n    <div class="avatar">\n    <img src="'
      .concat(
        userInfo.avatar,
        '" alt="avatar" />\n    </div>\n    <div class="user-name">'
      )
      .concat(userInfo.userName, "</div>\n    </div>\n    ");
    userListGroup.appendChild(ele);
  } else {
    var flag = false;
    for (var i = 0; i < list.length; i++) {
      if (list[i].classList.contains("active")) {
        flag = true;
      }
      if (list[i].innerText === userInfo.userName) {
        var isActive = list[i].classList.contains("active");
        if (!flag) {
          //如果在找到后flag依旧是flase就让tag上移百分之10
          var top = parseInt(document.querySelector("#tag").style.top);
          document.getElementById("tag").style.top =
            top - topMoveDistance + "rem";
        }
        if (isActive) {
          document.getElementById("tag").style.top = "0%";
          userListGroup
            .getElementsByClassName("item")[0]
            .classList.add("active");
          allChatGroup[0].style.display = "block";
        }
        userListGroup.removeChild(list[i]);
      }
    }
  }
  allUserItemBindClick();
}
//list绑定点击事件
function allUserItemBindClick() {
  var allUserItem = document.querySelectorAll(".user-list-group .item");
  var _loop = function _loop(i) {
    allUserItem[i].addEventListener("click", function () {
      for (var j = 0; j < allUserItem.length; j++) {
        allUserItem[j].classList.remove("active");
      }
      allUserItem[i].classList.add("active");
      //如何有new-message就删掉他
      var _iterator3 = _createForOfIteratorHelper(allUserItem[i].childNodes),
        _step3;
      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done; ) {
          var item = _step3.value;
          if (item.classList) {
            var _iterator5 = _createForOfIteratorHelper(item.classList),
              _step5;
            try {
              for (_iterator5.s(); !(_step5 = _iterator5.n()).done; ) {
                var item1 = _step5.value;
                if (item1 == "new-message") {
                  allUserItem[i].removeChild(
                    allUserItem[i].childNodes[
                      allUserItem[i].childNodes.length - 1
                    ]
                  );
                }
              }
            } catch (err) {
              _iterator5.e(err);
            } finally {
              _iterator5.f();
            }
          }
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }
      var _iterator4 = _createForOfIteratorHelper(allChatGroup),
        _step4;
      try {
        for (_iterator4.s(); !(_step4 = _iterator4.n()).done; ) {
          var _item = _step4.value;
          _item.style.display = "none";
        }
      } catch (err) {
        _iterator4.e(err);
      } finally {
        _iterator4.f();
      }
      if (allChatGroup[i]) {
        allChatGroup[i].style.display = "block";
      }
      if (activeIndex !== i) {
        updateScroll(i);
      }
      activeIndex = i;
      document.querySelector(".left .user-list-group .tag").style.top =
        i * topMoveDistance + "rem";
    });
  };
  for (var i = 0; i < allUserItem.length; i++) {
    _loop(i);
  }
}
//发送消息的input绑定回车事件
function sendMessageInputBindEnterDown() {
  var inputGroup = document.querySelectorAll(".right .input-message");
  inputGroup[inputGroup.length - 1].addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      var val = inputGroup[inputGroup.length - 1].value;
      if (!val) {
        return;
      }
      socket.emit(
        "privateChat",
        val,
        myUserInfo,
        notOneselfUsersInfo[activeIndex - 1]
      );
      inputGroup[inputGroup.length - 1].value = "";
    }
  });
}
//发送消息的按钮click事件
function sendMessageBtnBindClick() {
  var inputGroup = document.querySelectorAll(".right .input-message");
  var btnGroup = document.querySelectorAll(".right .send");
  btnGroup[btnGroup.length - 1].addEventListener("click", function (e) {
    e.preventDefault();
    var val = inputGroup[inputGroup.length - 1].value;
    if (!val) {
      return;
    }
    socket.emit(
      "privateChat",
      val,
      myUserInfo,
      notOneselfUsersInfo[activeIndex - 1]
    );
    inputGroup[inputGroup.length - 1].value = "";
  });
}

//初始化发送消息的input绑定回车事件
function initSendMessageInputBindEnterDown() {
  var _loop2 = function _loop2(i) {
    allChatGroupinput[i].addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        var val = allChatGroupinput[i].value;
        if (!val) {
          return;
        }
        socket.emit(
          "privateChat",
          val,
          myUserInfo,
          notOneselfUsersInfo[activeIndex - 1]
        );
        allChatGroupinput[i].value = "";
      }
    });
  };
  for (var i = 0; i < allChatGroupinput.length; i++) {
    _loop2(i);
  }
}
//初始化发送消息的按钮click事件
function initSendMessageBtnBindClick() {
  var _loop3 = function _loop3(i) {
    allChatGroupSendBtn[i].addEventListener("click", function (e) {
      e.preventDefault();
      var val = allChatGroupinput[i].value;
      if (!val) {
        return;
      }
      socket.emit(
        "privateChat",
        val,
        myUserInfo,
        notOneselfUsersInfo[activeIndex - 1]
      );
      allChatGroupinput[i].value = "";
    });
  };
  for (var i = 0; i < allChatGroupSendBtn.length; i++) {
    _loop3(i);
  }
}
//初始化userList
function initLeftuserList(notOneselfUsersInfo) {
  var userListGroup = document.getElementById("user-list-group");
  notOneselfUsersInfo.forEach(function (item) {
    var ele = document.createElement("div");
    ele.classList.add("item");
    ele.innerHTML = '\n    <div class="avatar">\n    <img src="'
      .concat(
        item.avatar,
        '" alt="avatar" />\n    </div>\n    <div class="user-name">'
      )
      .concat(item.userName, "</div>\n    </div>\n    ");
    userListGroup.appendChild(ele);
  });
  allUserItemBindClick();
}
//创建退出和进入聊天室的消息提示
function createdChatTag(isJoin, userName) {
  var ele = document.createElement("div");
  ele.classList.add("alert-tga");
  ele.innerHTML = ""
    .concat(userName)
    .concat(isJoin ? "加入" : "离开", "\u4E86\u7FA4\u804A");
  allChatGroupChatWindow[0].appendChild(ele);
}
//创建私聊的窗口
function createdChanWindows(currentUserInfo) {
  var right = document.getElementById("right");
  var ele = document.createElement("div");
  ele.classList.add("chat-group");
  ele.style.display = "none";
  ele.innerHTML = '\n    <div class="title">\n      <span>'.concat(
    currentUserInfo.userName,
    '</span></span>\n    </div>\n    <div class="chat-window"></div>\n    <div class="input-group">\n      <form action="#">\n        <input class="input-message" type="text"  placeholder="fype your message here"/>\n        <button class="send" type="button">  \n            <svg\n            t="1673788544522"\n            class="icon"\n            viewBox="0 0 1045 1024"\n            version="1.1"\n            xmlns="http://www.w3.org/2000/svg"\n            p-id="2697"\n            width="200"\n            height="200"\n          >\n            <path\n              d="M989.184 87.530667c30.421333-10.154667 60.736 15.637333 55.594667 47.296l-128 789.333333a42.666667 42.666667 0 0 1-63.082667 30.336l-340.736-192.213333-154.837333 66.282666a42.666667 42.666667 0 0 1-59.349334-36.181333L298.666667 789.269333l0.256-147.733333-277.226667-156.373333c-31.168-17.6-27.882667-62.890667 4.181333-76.394667l3.306667-1.237333z m-39.936 103.232L147.349333 458.069333l215.253334 121.408a42.666667 42.666667 0 0 1 21.546666 33.706667l0.149334 3.541333-0.192 107.882667 114.666666-49.066667a42.666667 42.666667 0 0 1 34.218667 0.277334l3.541333 1.792 305.792 172.501333 106.922667-659.349333z m-127.146667 123.264a42.666667 42.666667 0 0 1-2.858666 57.728l-2.602667 2.346666-256 213.333334a42.666667 42.666667 0 0 1-57.216-63.189334l2.602667-2.346666 256-213.333334a42.666667 42.666667 0 0 1 60.074666 5.461334z"\n              fill="#ffffff"\n              p-id="2698"\n            ></path>\n            </svg>\n        </button>\n      </form>\n    </div>'
  );
  right.appendChild(ele);
}
//初始化私聊的窗口
function initChanWindows(notMyuserInfo) {
  var right = document.getElementById("right");
  notMyuserInfo.forEach(function (itme) {
    var ele = document.createElement("div");
    ele.classList.add("chat-group");
    ele.style.display = "none";
    ele.innerHTML = '\n    <div class="title">\n      <span>'.concat(
      itme.userName,
      '</span></span>\n    </div>\n    <div class="chat-window"></div>\n    <div class="input-group">\n    <form action="#">\n      <input class="input-message" type="text"  placeholder="fype your message here"/>\n      <button class="send" type="button">  \n        <svg\n        t="1673788544522"\n        class="icon"\n        viewBox="0 0 1045 1024"\n        version="1.1"\n        xmlns="http://www.w3.org/2000/svg"\n        p-id="2697"\n        width="200"\n        height="200"\n      >\n        <path\n          d="M989.184 87.530667c30.421333-10.154667 60.736 15.637333 55.594667 47.296l-128 789.333333a42.666667 42.666667 0 0 1-63.082667 30.336l-340.736-192.213333-154.837333 66.282666a42.666667 42.666667 0 0 1-59.349334-36.181333L298.666667 789.269333l0.256-147.733333-277.226667-156.373333c-31.168-17.6-27.882667-62.890667 4.181333-76.394667l3.306667-1.237333z m-39.936 103.232L147.349333 458.069333l215.253334 121.408a42.666667 42.666667 0 0 1 21.546666 33.706667l0.149334 3.541333-0.192 107.882667 114.666666-49.066667a42.666667 42.666667 0 0 1 34.218667 0.277334l3.541333 1.792 305.792 172.501333 106.922667-659.349333z m-127.146667 123.264a42.666667 42.666667 0 0 1-2.858666 57.728l-2.602667 2.346666-256 213.333334a42.666667 42.666667 0 0 1-57.216-63.189334l2.602667-2.346666 256-213.333334a42.666667 42.666667 0 0 1 60.074666 5.461334z"\n          fill="#ffffff"\n          p-id="2698"\n        ></path>\n        </svg>\n      </button>\n      </form>\n    </div>'
    );
    right.appendChild(ele);
  });
}
//删除私聊窗口
function removeChanWindows(currentUserInfo) {
  var index = notOneselfUsersInfo.findIndex(function (item) {
    return item.id === currentUserInfo.id;
  });
  right.removeChild(allChatGroup[index + 1]);
}
function initUserInfo() {
  var attr = '\n  <img class="info-avatar" src="'
    .concat(myUserInfo.avatar, '" alt="" />\n  <span class="info-username">')
    .concat(myUserInfo.userName, "</span>\n  ");
  userInfo.innerHTML = attr;
}
//初始化
function initFunction(notMyuserInfo) {
  initLeftuserList(notMyuserInfo);
  initChanWindows(notMyuserInfo);
  initSendMessageInputBindEnterDown();
  initSendMessageBtnBindClick();
}
//创建socket.io实例
function createdSocket() {
  socket = io();
  //登录成功 获取自己的用户信息和所有用户的信息
  socket.on("loginSucceed", function (userInfo) {
    myUserInfo = userInfo;
    initUserInfo();
    loginLayout.style.display = "none";
    appLayout.style.display = "flex";
  });
  //登录失败
  socket.on("loginError", function () {
    alert("用户名重复");
  });
  //接收到服务器消息时触发
  socket.on("chat message", function (msg, userInfo) {
    createdChatRommMessage(msg, userInfo);
  });
  //接收私聊事件
  socket.on("privateChat", function (msg, userInfo) {
    createdChatMessage(msg, userInfo);
  });
  //有人进入群聊
  socket.on("connectChat", function (usersInfo, currentUserInfo) {
    // 构建除去自己的所有用户的数据
    var notMyuserInfo = _toConsumableArray(usersInfo);
    var index = notMyuserInfo.findIndex(function (item) {
      return myUserInfo.id === item.id;
    });
    notMyuserInfo.splice(index, 1);
    notOneselfUsersInfo = notMyuserInfo;
    if (init) {
      //如果没有人在就不创建了
      if (notOneselfUsersInfo.length) {
        initFunction(notMyuserInfo);
      }
      init = false;
    } else {
      if (notMyuserInfo.length) {
        updatedLeftuserList(true, currentUserInfo);
        createdChanWindows(currentUserInfo);
        sendMessageInputBindEnterDown();
        sendMessageBtnBindClick();
      }
    }
    updatedChatgroupName(usersInfo.length);
    createdChatTag(true, currentUserInfo.userName);
  });
  //有人离开了群聊
  socket.on("quitChat", function (usersInfo, currentUserInfo) {
    // TODO 用户离开了 删除对应的私聊窗口
    var notMyuserInfo = _toConsumableArray(usersInfo);
    var index = notMyuserInfo.findIndex(function (item) {
      return myUserInfo.id === item.id;
    });
    notMyuserInfo.splice(index, 1);
    if (notMyuserInfo) {
      removeChanWindows(currentUserInfo);
    }
    //如果离开的人在activeIndex之前就--
    //当前置零
    //之后不变
    notOneselfUsersInfo = notMyuserInfo;
    var quitUserIndex = notOneselfUsersInfo.findIndex(function (item) {
      return currentUserInfo === item.id;
    });
    if (activeIndex - 1 > quitUserIndex) {
      activeIndex--;
    } else if (activeIndex - 1 === quitUserIndex) {
      activeIndex = 0;
    }
    updatedLeftuserList(false, currentUserInfo);
    updatedChatgroupName(usersInfo.length);
    initSendMessageInputBindEnterDown();
    initSendMessageBtnBindClick();
    createdChatTag(false, currentUserInfo.userName);
  });
}
