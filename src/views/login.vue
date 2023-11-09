<template>
  <div class="login">
    <el-form
      ref="loginForm"
      :model="loginForm"
      :rules="loginRules"
      class="login-form"
    >
      <div class="form-cont">
        <el-tabs class="form" v-model="loginForm.loginType" style="float: none">
          <el-tab-pane label="账号密码登录" value="uname">
            <!-- 账号密码登录 -->
            <el-form-item prop="username">
              <el-input
                v-model="loginForm.username"
                type="text"
                auto-complete="off"
                placeholder="账号"
              >
                <svg-icon
                  slot="prefix"
                  icon-class="user"
                  class="el-input__icon input-icon"
                />
              </el-input>
            </el-form-item>
            <el-form-item prop="password">
              <el-input
                v-model="loginForm.password"
                type="password"
                auto-complete="off"
                placeholder="密码"
                @keyup.enter.native="handleLogin"
              >
                <svg-icon
                  slot="prefix"
                  icon-class="password"
                  class="el-input__icon input-icon"
                />
              </el-input>
            </el-form-item>
            <el-form-item v-if="captchaEnabled">
              <el-input
                v-model="loginForm.code"
                auto-complete="off"
                placeholder="验证码"
                style="width: 63%"
                @keyup.enter.native="handleLogin"
              >
                <svg-icon
                  slot="prefix"
                  icon-class="validCode"
                  class="el-input__icon input-icon"
                />
              </el-input>
              <div class="login-code">
                <img :src="codeUrl" @click="getCode" class="login-code-img" />
              </div>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="短信验证码登录" value="sms">
            <!-- 短信验证码登录 -->
            <el-form-item prop="mobile">
              <el-input
                v-model="loginForm.mobile"
                type="text"
                auto-complete="off"
                placeholder="请输入手机号"
              >
                <svg-icon
                  slot="prefix"
                  icon-class="phone"
                  class="el-input__icon input-icon"
                />
              </el-input>
            </el-form-item>
            <el-form-item prop="mobileCode">
              <el-input
                v-model="loginForm.mobileCode"
                type="text"
                auto-complete="off"
                placeholder="短信验证码"
                class="sms-login-mobile-code-prefix"
                @keyup.enter.native="handleLogin"
              >
                <template>
                  <svg-icon
                    slot="prefix"
                    icon-class="password"
                    class="el-input__icon input-icon"
                  />
                </template>
                <template slot="append">
                  <span
                    v-if="mobileCodeTimer <= 0"
                    class="getMobileCode"
                    @click="getSmsCode"
                    style="cursor: pointer"
                    >获取验证码</span
                  >
                  <span v-if="mobileCodeTimer > 0" class="getMobileCode"
                    >{{ mobileCodeTimer }}秒后可重新获取</span
                  >
                </template>
              </el-input>
            </el-form-item>
          </el-tab-pane>
        </el-tabs>

        <el-checkbox
          v-model="loginForm.rememberMe"
          style="margin: 0px 0px 25px 0px"
          >记住密码</el-checkbox
        >
        <el-form-item style="width: 100%">
          <el-button
            :loading="loading"
            size="medium"
            type="primary"
            style="width: 100%"
            @click.native.prevent="handleLogin"
          >
            <span v-if="!loading">登 录</span>
            <span v-else>登 录 中...</span>
          </el-button>
          <div style="float: right" v-if="register">
            <router-link class="link-type" :to="'/register'"
              >立即注册</router-link
            >
          </div>
        </el-form-item>
        <div>
          <el-button size="large" type="text" @click="unbind()"
            >绑定钉钉</el-button
          >
        </div>
      </div>
    </el-form>
    <!--  底部  -->
    <div class="el-login-footer">
      <span>Copyright © 2018-2023 ruoyi.vip All Rights Reserved.</span>
    </div>
  </div>
</template>

<script>
import { getCodeImg,sendSmsCode,dinGing} from "@/api/login";
import Cookies from "js-cookie";
import { encrypt, decrypt } from "@/utils/jsencrypt";
import {socialBind, socialUnbind} from "@/api/system/socialUser";

export default {
  name: "Login",
  data() {
    return {
      mobileCodeTimer: 0,
      codeUrl: "",
      loginForm: {
        loginType: "uname",
        username: "admin",
        password: "123456",
        rememberMe: false,
        code: "",
        uuid: "",
      },
      loginRules: {
        username: [
          { required: true, trigger: "blur", message: "请输入您的账号" },
        ],
        password: [
          { required: true, trigger: "blur", message: "请输入您的密码" },
        ],
        // code: [{ required: true, trigger: "change", message: "请输入验证码" }],
      },
      loading: false,
      // 验证码开关
      captchaEnabled: true,
      // 注册开关
      register: false,
      redirect: undefined,
    };
  },
  watch: {
    $route: {
      handler: function (route) {
        this.redirect = route.query && route.query.redirect;
      },
      immediate: true,
    },
  },
  created() {
    this.getCode();
    this.getCookie();
    // socialBind("", code, state).then(resp => {
    //   this.$modal.msgSuccess("绑定成功");
    //   this.$router.replace('/user/profile');
    //   // 调用父组件, 刷新
    //   this.getUser();
    //   this.setActiveTab('userSocial');
    // });
  },
  methods: {
    unbind(){
      let url="http://5ncxfk.natappfree.cc/system/dinging/auth";
        dinGing(url).then((res)=>{
          if(res.code==0){
            window.location.href=res.data
          }
        })
    },
    bind() {
      // 计算 redirectUri
      const redirectUri =  'http://vxw7qt.natappfree.cc'+ '/user/profile';
      // 进行跳转
      socialAuthRedirect( encodeURIComponent(redirectUri)).then((res) => {
        // console.log(res.url);
        window.location.href = res.data;
      });
    },
    getSmsCode() {
      if (this.mobileCodeTimer > 0) return;
      this.$refs.loginForm.validate((valid) => {
        if (!valid) return;
        sendSmsCode(
          {phone:this.loginForm.mobile,}
          // this.scene,
          // this.loginForm.uuid,
          // this.loginForm.code
        ).then((res) => {
          this.$modal.msgSuccess("获取验证码成功");
          this.mobileCodeTimer = 60;
          let msgTimer = setInterval(() => {
            this.mobileCodeTimer = this.mobileCodeTimer - 1;
            if (this.mobileCodeTimer <= 0) {
              clearInterval(msgTimer);
            }
          }, 1000);
        });
      });
    },
    getCode() {
      getCodeImg().then((res) => {
        this.captchaEnabled =
          res.captchaEnabled === undefined ? true : res.captchaEnabled;
        if (this.captchaEnabled) {
          this.codeUrl = "data:image/gif;base64," + res.img;
          this.loginForm.uuid = res.uuid;
        }
      });
    },
    getCookie() {
      const username = Cookies.get("username");
      const password = Cookies.get("password");
      const rememberMe = Cookies.get("rememberMe");
      this.loginForm = {
        username: username === undefined ? this.loginForm.username : username,
        password:
          password === undefined ? this.loginForm.password : decrypt(password),
        rememberMe: rememberMe === undefined ? false : Boolean(rememberMe),
      };
    },
    handleLogin() {
      this.$refs.loginForm.validate((valid) => {
        if (valid) {
          this.loading = true;
          if (this.loginForm.rememberMe) {
            Cookies.set("username", this.loginForm.username, { expires: 30 });
            Cookies.set("password", encrypt(this.loginForm.password), {
              expires: 30,
            });
            Cookies.set("rememberMe", this.loginForm.rememberMe, {
              expires: 30,
            });
          } else {
            Cookies.remove("username");
            Cookies.remove("password");
            Cookies.remove("rememberMe");
          }
          this.$store
            .dispatch("Login", this.loginForm)
            .then(() => {
              this.$router.push({ path: this.redirect || "/" }).catch(() => {});
            })
            .catch(() => {
              this.loading = false;
              if (this.captchaEnabled) {
                this.getCode();
              }
            });
        }
      });
    },
  },
};
</script>

<style rel="stylesheet/scss" lang="scss">
.login {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  background-image: url("../assets/images/login-background.jpg");
  background-size: cover;
}
// .title {
//   margin: 0px auto 30px auto;
//   text-align: center;
//   color: #707070;
// }
.form-cont {
  margin: 0px auto 30px auto;
  text-align: center;
  color: #707070;
}
.login-form {
  border-radius: 6px;
  background: #ffffff;
  width: 400px;
  padding: 25px 25px 5px 25px;
  .el-input {
    height: 38px;
    input {
      height: 38px;
    }
  }
  .input-icon {
    height: 39px;
    width: 14px;
    margin-left: 2px;
  }
}
.login-tip {
  font-size: 13px;
  text-align: center;
  color: #bfbfbf;
}
.login-code {
  width: 33%;
  height: 38px;
  float: right;
  img {
    cursor: pointer;
    vertical-align: middle;
  }
}
.el-login-footer {
  height: 40px;
  line-height: 40px;
  position: fixed;
  bottom: 0;
  width: 100%;
  text-align: center;
  color: #fff;
  font-family: Arial;
  font-size: 12px;
  letter-spacing: 1px;
}
.login-code-img {
  height: 38px;
}
</style>
