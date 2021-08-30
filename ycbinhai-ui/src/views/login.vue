<template>
  <div class="login">
    <div class="main" >
      <!--<img src="@/assets/logo/logo.png" alt="" class="img1">-->
      <img src="@/assets/images/img_bg.png" alt="" class="img2">
      <h3>XXX系统管理</h3>
      <h4>XXX SYSTEM MANAGEMENT</h4>
      <el-form ref="loginForm" :model="loginForm" :rules="loginRules" class="login-form">
        <h2 class="title">欢 迎 登 录</h2>
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" type="text" maxlength="16" auto-complete="off"  @focus="isUsername=true" @blur="isUsername=false" placeholder="用户名">
            <svg-icon slot="prefix" icon-class="user" v-bind:class="{'color-class':isUsername}" class="el-input__icon input-icon" />
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" type="password" maxlength="20" auto-complete="off" placeholder="密码" @focus="isPassword=true" @blur="isPassword=false" @keyup.enter.native="handleLogin">
            <svg-icon slot="prefix" icon-class="password" v-bind:class="{'color-class':isPassword}" class="el-input__icon input-icon " />
          </el-input>
        </el-form-item>
        <el-form-item prop="code" v-if="captchaOnOff">
          <el-input v-model="loginForm.code" auto-complete="off" maxlength="4" placeholder="验证码" @focus="isValidCode=true" @blur="isValidCode=false" @keyup.enter.native="handleLogin" >
            <svg-icon slot="prefix" icon-class="validCode" v-bind:class="{'color-class':isValidCode}" class="el-input__icon input-icon "  />
          </el-input>
          <div class="login-code">
            <img :src="codeUrl" @click="getCode" />
          </div>
        </el-form-item>
        <el-checkbox v-model="loginForm.rememberMe" style="margin:0px 0px 25px 0px;">记住密码</el-checkbox>
        <div style="float:right;font-size: 14px;" v-if="register">
          <router-link class="link-type" :to="'/register'">立即注册</router-link>
        </div>
        <el-form-item style="width:100%;">
          <el-button :loading="loading" size="medium" type="primary" style="width:100%;" @click.native.prevent="handleLogin" >
            <span v-if="!loading">登 录</span>
            <span v-else>登 录 中...</span>
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!--  底部  -->
    <div class="el-login-footer"><span>主办单位名称：XXXXXXX公司 网站备案/许可证号：湘ICP备202100xxxx号-1<br>技术支持：XXXXXXXX大数据产业发展有限公司</span></div>
  </div>
</template>

<script>
import {getCodeImg, getRegStatus} from "@/api/login";
import Cookies from "js-cookie";
import {decrypt, encrypt} from '@/utils/jsencrypt'

export default {
    name: "Login",
    data() {
      return {
        isUsername:false,
        isPassword:false,
        isValidCode:false,
        codeUrl: "",
        loginForm: {
          username: "",
          password: "",
          rememberMe: false,
          code: "",
          uuid: ""
        },
        loginRules: {
          username: [{ required: true, trigger: "blur", message: "用户名不能为空" }],
          password: [{ required: true, trigger: "blur", message: "密码不能为空" }],
          code: [{ required: true, trigger: "change", message: "验证码不能为空" }]
        },
        loading: false,
		    captchaOnOff: true,
        register: false,
        redirect: undefined
      };
    },
    watch: {
      $route: {
        handler: function(route) {
          this.redirect = route.query && route.query.redirect;
        },
        immediate: true
      }
    },
    created() {
      this.getCode();
      this.getCookie();
    },
    methods: {
      getCode() {

        getRegStatus().then(res =>{
          this.register = res.regStatus;
        })

        getCodeImg().then(res => {
          this.captchaOnOff = res.captchaOnOff === undefined ? true : res.captchaOnOff;
          if (this.captchaOnOff) {
            this.codeUrl = res.img;
            this.loginForm.uuid = res.uuid;
          }
        });
      },
      getCookie() {
        const username = Cookies.get("username");
        const password = Cookies.get("password");
        const rememberMe = Cookies.get('rememberMe')
        this.loginForm = {
          username: username === undefined ? this.loginForm.username : username,
          password: password === undefined ? this.loginForm.password : decrypt(password),
          rememberMe: rememberMe === undefined ? false : Boolean(rememberMe)
        };
      },
      handleLogin() {
        this.$refs.loginForm.validate(valid => {
          if (valid) {
            this.loading = true;
            if (this.loginForm.rememberMe) {
              Cookies.set("username", this.loginForm.username, { expires: 30 });
              Cookies.set("password", encrypt(this.loginForm.password), { expires: 30 });
              Cookies.set('rememberMe', this.loginForm.rememberMe, { expires: 30 });
            } else {
              Cookies.remove("username");
              Cookies.remove("password");
              Cookies.remove('rememberMe');
            }
			this.loginForm.password = encrypt(this.loginForm.password);
            this.$store
              .dispatch("Login", this.loginForm)
              .then(() => {
                this.$router.push({ path: this.redirect || "/" });
              })
              .catch(() => {
                this.loading = false;
				this.getCookie();
                if (this.captchaOnOff) {
					this.getCode();
				}
              });
          }
        });
      }
    }
  };
</script>

<style rel="stylesheet/scss" lang="scss">
  .login {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    background-color: #0D1D30;
    position: relative;
  }
  .main{
    position: relative;
    width: 1024px;
    height: 495px;
    background:rgba(25,41,59,1);
    border-radius:12px;
    box-shadow:0px 2px 12px 0px rgba(9,23,39,1);
    color:rgba(255,255,255,1);
    .img1{
      position:absolute;
      top: 46px;
      left: 53px;
      width: 110px;
    }
    .img2{
      position:absolute;
      top: 63px;
      left: 132px;
      width: 348px;
      height: 299px;
    }
    h3{
      margin-left: 52px;
      margin-top: 383px;
      margin-bottom: 0;
      font-size:32px;

    }
    h4{
      margin-left: 52px;
      font-size:24px;
      margin-top: 16px;
    }
    .login-form {
      position:absolute;
      right: 0;
      top: 0;
      border-radius: 6px;
      background: #ffffff;
      width: 375px;
      height: 495px;
      padding: 58px 33px 33px 33px;
      .title {
        font-size:20px;
        margin: 0px auto 62px auto;
        border-bottom: 3px rgba(27,74,127,1) ridge;
        text-align: center;
        color: #08396f;
        padding-bottom: 8px;
        font-weight: bold;
      }
      .el-input {
        height: 32px;
        input:focus  {
          color:rgba(6,104,185,1);
        }

        input {
          outline:none;
          height: 38px;
          border-top: 0;
          border-left: 0;
          border-right: 0;
          border-radius:0;
        }

      }
      .color-class{
        color:rgba(6,104,185,1);
      }

    }
  }
  .login-code {
    position:absolute;
    width: 88px;
    height: 32px;
    right: 0;
    bottom: 8px;
    img {
      width: 88px;
      height: 32px;
      cursor: pointer;
      vertical-align: middle;
    }
  }
  .el-login-footer {
    margin-top: 30px;
    line-height: 20px;
    position: absolute;
    transform: translateY(273px);
    width: 100%;
    text-align: center;
    color: #fff;
    font-family: Arial;
    font-size: 12px;
    letter-spacing: 1px;
    span{
      img{
        height: 12px;
      }
    }
  }

</style>
