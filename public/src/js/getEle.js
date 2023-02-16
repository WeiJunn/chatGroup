//选择头像的input
export const changeAvatarInput = document.querySelector(".change-avatar-input");
//头像显示
export const selectAvatar = document.querySelector(".select-avatar");
//登录界面
export const loginLayout = document.querySelector(".login-layout");
//聊天界面
export const appLayout = document.querySelector(".app-layout");
//所有的聊天组
export const allChatGroup = document
  .getElementById("right")
  .getElementsByClassName("chat-group");
//所有的聊天组
export const allChatGroupChatWindow =
  document.getElementsByClassName("chat-window");
//所有的聊天框的input
export const allChatGroupinput = document
  .getElementById("right")
  .getElementsByClassName("input-message");
export const allChatGroupSendBtn = document
  .getElementById("right")
  .getElementsByClassName("send");
//用户名input
export const userNameInput = document.querySelector(".user-name-input");
//所有用户容器
export const userserItemContainer = document.querySelector(
  ".left .user-list-group"
);

// 所有用户
export const allUserItem = document
  .getElementById("user-list-group")
  .getElementsByClassName("item");
//除去第一个聊天室
export const userItemNotFirstChild = document.querySelectorAll(
  ".left .user-list-group .item:not(:nth-child(2))"
);

//用户前面的tag条
export const userTag = document.getElementById("tag");
//聊天室的名字
export const chatGroupTitle = document.querySelector(".right .title>span");
//所有输入信息的input
export const messageInput = document.querySelectorAll(".input-message");
//进入btn
export const joinBtn = document.querySelector(".join");
// unserInfo
export const userInfo = document.querySelector(".left .user-info");
