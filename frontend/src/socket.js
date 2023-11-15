import {
  messageInput, //输入信息的input
  selectAvatar, //显示头像img
  userNameInput, //用户名input
  loginLayout, //登录界面
  appLayout, //聊天界面
  chatGroupTitle, //聊天室的名字
  allChatGroup, //所有的聊天组
  allChatGroupinput, //聊天组所有的input
  allChatGroupSendBtn, //聊天组所有发送按钮
  allChatGroupChatWindow, //聊天组所有的聊天框
  logOutBtn, //登出按钮
  joinBtn,
  userInfo,
} from "./getEle.js";
import { io } from "socket.io-client";
let url = "http://localhost:3000/";
let myUserInfo;
let socket;
let topMoveDistance = 4.9; //  4.5 + 0.4rem
let init = true;
let activeIndex = 0;
let notOneselfUsersInfo;
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
    login();
  }
});
//joinBtn click
joinBtn.addEventListener("click", login);
//登出
logOutBtn.addEventListener("click", function () {
  //暴力登出刷新界面
  location.reload();
});
function login() {
  if (!userNameInput.value) {
    return;
  } else if (userNameInput.value.length > 15) {
    alert("用户名长度不能超过15");
    return;
  }
  createdSocket();
  let src = selectAvatar.getAttribute("src");
  let userInfo = { userName: userNameInput.value, avatar: src };
  socket.emit("login", userInfo);
  userNameInput.value = "";
}
//创建聊天室的聊天信息
function createdChatRommMessage(msg, userInfo) {
  // isMymessage 判断是不是自己发的消息 true为自己发的
  let isMymessage = myUserInfo.id === userInfo.id;
  let attr = `
           <div class="avatar">
             <img src="${
               isMymessage ? myUserInfo.avatar : userInfo.avatar
             }" alt="" />
           </div>
           <div class="content">
             <div class="user-name">${
               isMymessage ? myUserInfo.userName : userInfo.userName
             }</div>
             <div class="user-mesaage">
               ${msg}
             </div>
           </div>
       `;
  let ele = document.createElement("div");
  ele.classList.add(isMymessage ? "my-item" : "item");
  ele.innerHTML = attr;
  allChatGroupChatWindow[0].appendChild(ele);
  let userList = document.querySelectorAll(".user-list-group .item");
  updateScroll(0);
  if (activeIndex !== 0) {
    let flag = createdNewMessage(userList, 0);
    if (!flag) {
      let ele = document.createElement("div");
      ele.classList.add("new-message");
      ele.innerHTML = 1;
      userList[0].appendChild(ele);
    }
  }
}
//创建私聊的的聊天信息
function createdChatMessage(msg, userInfo) {
  // isMymessage 判断是不是自己发的消息 true为自己发的
  let isMymessage = myUserInfo.id === userInfo.id;
  let attr = `
           <div class="avatar">
             <img src="${
               isMymessage ? myUserInfo.avatar : userInfo.avatar
             }" alt="" />
           </div>
           <div class="content">
             <div class="user-name">${
               isMymessage ? myUserInfo.userName : userInfo.userName
             }</div>
             <div class="user-mesaage">
               ${msg}
             </div>
           </div>
       `;
  let ele = document.createElement("div");
  ele.classList.add(isMymessage ? "my-item" : "item");
  ele.innerHTML = attr;

  // 如果是自己发的消息就渲染到当前打开的聊天组即可
  //如果是收到别人发的消息得找到是谁发的并且找到这个人的index'

  if (isMymessage) {
    allChatGroupChatWindow[activeIndex].appendChild(ele);
    updateScroll(activeIndex);
  } else {
    let index =
      notOneselfUsersInfo.findIndex((item) => item.id === userInfo.id) + 1;
    allChatGroupChatWindow[index].appendChild(ele);
    //如果当前用户不在就这个聊天界面 就添加一个new-message
    if (activeIndex !== index) {
      let userList = document.querySelectorAll(".user-list-group .item");
      let flag = createdNewMessage(userList, index);
      if (!flag) {
        let ele = document.createElement("div");
        ele.classList.add("new-message");
        ele.innerHTML = 1;
        userList[index].appendChild(ele);
      }
    }
    updateScroll(index);
  }
}
//创建new-message
function createdNewMessage(userList, index) {
  for (const item of userList[index].childNodes) {
    if (item.classList) {
      for (const item1 of item.classList) {
        if (item1 === "new-message") {
          item.innerText = parseInt(item.innerText) + 1;
          console.log("item", item);
          return true;
        }
      }
    }
  }
}
//滚动条到底部
function updateScroll(index) {
  // 定时改变高度，实现滚动效果
  const timeTop = setInterval(() => {
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
  chatGroupTitle.innerHTML = `聊天室(${count})`;
}
/**
 更新左侧用户list
 *
 * @param {boolean} isJon 是加入还是离开
 * @param {string} userInfo 离开 加入用户的信息
 */
function updatedLeftuserList(isJon, userInfo) {
  let userListGroup = document.getElementById("user-list-group");
  let list = userListGroup.getElementsByClassName("item");
  if (myUserInfo.id === userInfo.id) {
    return;
  }
  if (isJon) {
    let ele = document.createElement("div");
    ele.classList.add("item");
    ele.innerHTML = `
    <div class="avatar">
    <img src="${userInfo.avatar}" alt="avatar" />
    </div>
    <div class="user-name">${userInfo.userName}</div>
    </div>
    `;
    userListGroup.appendChild(ele);
  } else {
    let flag = false;
    for (let i = 0; i < list.length; i++) {
      if (list[i].classList.contains("active")) {
        flag = true;
      }
      if (list[i].innerText === userInfo.userName) {
        let isActive = list[i].classList.contains("active");
        if (!flag) {
          //如果在找到后flag依旧是flase就让tag上移百分之10
          const top = parseInt(document.querySelector("#tag").style.top);
          document.getElementById("tag").style.top =
            top - topMoveDistance + "rem";
        }
        if (isActive) {
          document.getElementById("tag").style.top = `0%`;
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
  let allUserItem = document.querySelectorAll(".user-list-group .item");
  for (let i = 0; i < allUserItem.length; i++) {
    allUserItem[i].addEventListener("click", function () {
      for (let j = 0; j < allUserItem.length; j++) {
        allUserItem[j].classList.remove("active");
      }
      allUserItem[i].classList.add("active");
      //如何有new-message就删掉他
      for (const item of allUserItem[i].childNodes) {
        if (item.classList) {
          for (const item1 of item.classList) {
            if (item1 == "new-message") {
              allUserItem[i].removeChild(
                allUserItem[i].childNodes[allUserItem[i].childNodes.length - 1]
              );
            }
          }
        }
      }
      for (const item of allChatGroup) {
        item.style.display = "none";
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
  }
}
//发送消息的input绑定回车事件
function sendMessageInputBindEnterDown() {
  let inputGroup = document.querySelectorAll(".right .input-message");
  inputGroup[inputGroup.length - 1].addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      let val = inputGroup[inputGroup.length - 1].value;
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
  let inputGroup = document.querySelectorAll(".right .input-message");
  let btnGroup = document.querySelectorAll(".right .send");
  btnGroup[btnGroup.length - 1].addEventListener("click", function (e) {
    e.preventDefault();
    let val = inputGroup[inputGroup.length - 1].value;
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
  for (let i = 0; i < allChatGroupinput.length; i++) {
    allChatGroupinput[i].addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        let val = allChatGroupinput[i].value;
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
  }
}
//初始化发送消息的按钮click事件
function initSendMessageBtnBindClick() {
  for (let i = 0; i < allChatGroupSendBtn.length; i++) {
    allChatGroupSendBtn[i].addEventListener("click", function (e) {
      e.preventDefault();
      let val = allChatGroupinput[i].value;
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
  }
}
//初始化userList
function initLeftuserList(notOneselfUsersInfo) {
  let userListGroup = document.getElementById("user-list-group");
  notOneselfUsersInfo.forEach((item) => {
    let ele = document.createElement("div");
    ele.classList.add("item");
    ele.innerHTML = `
    <div class="avatar">
    <img src="${item.avatar}" alt="avatar" />
    </div>
    <div class="user-name">${item.userName}</div>
    </div>
    `;
    userListGroup.appendChild(ele);
  });
  allUserItemBindClick();
}
//创建退出和进入聊天室的消息提示
function createdChatTag(isJoin, userName) {
  let ele = document.createElement("div");
  ele.classList.add("alert-tga");
  ele.innerHTML = `${userName}${isJoin ? "加入" : "离开"}了群聊`;
  allChatGroupChatWindow[0].appendChild(ele);
}
//创建私聊的窗口
function createdChanWindows(currentUserInfo) {
  let right = document.getElementById("right");
  let ele = document.createElement("div");
  ele.classList.add("chat-group");
  ele.style.display = "none";
  ele.innerHTML = `
    <div class="title">
      <span>${currentUserInfo.userName}</span></span>
    </div>
    <div class="chat-window"></div>
    <div class="input-group">
      <form action="#">
        <input class="input-message" type="text"  placeholder="fype your message here"/>
        <button class="send" type="button">  
            <svg
            t="1673788544522"
            class="icon"
            viewBox="0 0 1045 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            p-id="2697"
            width="200"
            height="200"
          >
            <path
              d="M989.184 87.530667c30.421333-10.154667 60.736 15.637333 55.594667 47.296l-128 789.333333a42.666667 42.666667 0 0 1-63.082667 30.336l-340.736-192.213333-154.837333 66.282666a42.666667 42.666667 0 0 1-59.349334-36.181333L298.666667 789.269333l0.256-147.733333-277.226667-156.373333c-31.168-17.6-27.882667-62.890667 4.181333-76.394667l3.306667-1.237333z m-39.936 103.232L147.349333 458.069333l215.253334 121.408a42.666667 42.666667 0 0 1 21.546666 33.706667l0.149334 3.541333-0.192 107.882667 114.666666-49.066667a42.666667 42.666667 0 0 1 34.218667 0.277334l3.541333 1.792 305.792 172.501333 106.922667-659.349333z m-127.146667 123.264a42.666667 42.666667 0 0 1-2.858666 57.728l-2.602667 2.346666-256 213.333334a42.666667 42.666667 0 0 1-57.216-63.189334l2.602667-2.346666 256-213.333334a42.666667 42.666667 0 0 1 60.074666 5.461334z"
              fill="#ffffff"
              p-id="2698"
            ></path>
            </svg>
        </button>
      </form>
    </div>`;
  right.appendChild(ele);
}
//初始化私聊的窗口
function initChanWindows(notMyuserInfo) {
  let right = document.getElementById("right");
  notMyuserInfo.forEach((itme) => {
    let ele = document.createElement("div");
    ele.classList.add("chat-group");
    ele.style.display = "none";
    ele.innerHTML = `
    <div class="title">
      <span>${itme.userName}</span></span>
    </div>
    <div class="chat-window"></div>
    <div class="input-group">
    <form action="#">
      <input class="input-message" type="text"  placeholder="fype your message here"/>
      <button class="send" type="button">  
        <svg
        t="1673788544522"
        class="icon"
        viewBox="0 0 1045 1024"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        p-id="2697"
        width="200"
        height="200"
      >
        <path
          d="M989.184 87.530667c30.421333-10.154667 60.736 15.637333 55.594667 47.296l-128 789.333333a42.666667 42.666667 0 0 1-63.082667 30.336l-340.736-192.213333-154.837333 66.282666a42.666667 42.666667 0 0 1-59.349334-36.181333L298.666667 789.269333l0.256-147.733333-277.226667-156.373333c-31.168-17.6-27.882667-62.890667 4.181333-76.394667l3.306667-1.237333z m-39.936 103.232L147.349333 458.069333l215.253334 121.408a42.666667 42.666667 0 0 1 21.546666 33.706667l0.149334 3.541333-0.192 107.882667 114.666666-49.066667a42.666667 42.666667 0 0 1 34.218667 0.277334l3.541333 1.792 305.792 172.501333 106.922667-659.349333z m-127.146667 123.264a42.666667 42.666667 0 0 1-2.858666 57.728l-2.602667 2.346666-256 213.333334a42.666667 42.666667 0 0 1-57.216-63.189334l2.602667-2.346666 256-213.333334a42.666667 42.666667 0 0 1 60.074666 5.461334z"
          fill="#ffffff"
          p-id="2698"
        ></path>
        </svg>
      </button>
      </form>
    </div>`;
    right.appendChild(ele);
  });
}
//删除私聊窗口
function removeChanWindows(currentUserInfo) {
  let index = notOneselfUsersInfo.findIndex(
    (item) => item.id === currentUserInfo.id
  );
  right.removeChild(allChatGroup[index + 1]);
}
function initUserInfo() {
  let attr = `
  <img class="info-avatar" src="${myUserInfo.avatar}" alt="" />
  <span class="info-username">${myUserInfo.userName}</span>
  `;
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
  socket = io(url);
  //登录成功 获取自己的用户信息和所有用户的信息
  socket.on("loginSucceed", (userInfo) => {
    myUserInfo = userInfo;
    initUserInfo();
    loginLayout.style.display = "none";
    appLayout.style.display = "flex";
  });
  //登录失败
  socket.on("loginError", () => {
    alert("用户名重复");
  });
  //接收到服务器消息时触发
  socket.on("chat message", (msg, userInfo) => {
    createdChatRommMessage(msg, userInfo);
  });
  //接收私聊事件
  socket.on("privateChat", (msg, userInfo) => {
    createdChatMessage(msg, userInfo);
  });
  //有人进入群聊
  socket.on("connectChat", (usersInfo, currentUserInfo) => {
    // 构建除去自己的所有用户的数据
    let notMyuserInfo = [...usersInfo];
    const index = notMyuserInfo.findIndex((item) => myUserInfo.id === item.id);
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
  socket.on("quitChat", (usersInfo, currentUserInfo) => {
    // TODO 用户离开了 删除对应的私聊窗口
    let notMyuserInfo = [...usersInfo];
    const index = notMyuserInfo.findIndex((item) => myUserInfo.id === item.id);
    notMyuserInfo.splice(index, 1);
    if (notMyuserInfo) {
      removeChanWindows(currentUserInfo);
    }
    //如果离开的人在activeIndex之前就--
    //当前置零
    //之后不变
    notOneselfUsersInfo = notMyuserInfo;
    let quitUserIndex = notOneselfUsersInfo.findIndex(
      (item) => currentUserInfo === item.id
    );
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
