import {
  changeAvatarInput, //选择头像的input
  selectAvatar, //显示头像img
  userNameInput,
} from "./getEle.js";
// 按钮聚焦
userNameInput.focus();
//选择头像事件
changeAvatarInput.addEventListener("change", () => {
  const file = changeAvatarInput.files[0];
  const fileMaxSize = 500; //只能上传500kb以内
  const flieSize = file.size / 1024;
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
  const fr = new FileReader();
  fr.readAsDataURL(file);
  fr.onload = () => {
    selectAvatar.src = fr.result;
  };
});
