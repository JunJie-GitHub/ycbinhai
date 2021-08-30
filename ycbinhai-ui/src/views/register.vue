<template>
  <div class="register">
    <div class="main" >
      <!--<img src="@/assets/logo/logo.png" alt="" class="img1">-->
      <img src="@/assets/images/img_bg.png" alt="" class="img2">
      <h3>XXX系统管理</h3>
      <h4>XXX SYSTEM MANAGEMENT</h4>
      <el-form ref="registerForm" :model="registerForm" :rules="registerRules" class="register-form">
        <h3 class="title">用 户 注 册</h3>
        <el-form-item prop="username">
          <el-input v-model="registerForm.username" type="text" auto-complete="off" @focus="isUsername=true" @blur="isUsername=false" placeholder="账号">
            <svg-icon slot="prefix" icon-class="user" v-bind:class="{'color-class':isUsername}" class="el-input__icon input-icon" />
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="registerForm.password" type="password" auto-complete="off" @focus="isPassword=true" @blur="isPassword=false" placeholder="密码" @keyup.enter.native="handleRegister" >
            <svg-icon slot="prefix" icon-class="password" v-bind:class="{'color-class':isPassword}" class="el-input__icon input-icon" />
          </el-input>
        </el-form-item>
        <el-form-item prop="confirmPassword">
          <el-input v-model="registerForm.confirmPassword" type="password" auto-complete="off" @focus="confirmPassword=true" @blur="confirmPassword=false" placeholder="确认密码" @keyup.enter.native="handleRegister" >
            <svg-icon slot="prefix" icon-class="password" v-bind:class="{'color-class':confirmPassword}" class="el-input__icon input-icon" />
          </el-input>
        </el-form-item>
        <el-form-item prop="code" v-if="captchaOnOff">
          <el-input v-model="registerForm.code" auto-complete="off" @focus="isValidCode=true" @blur="isValidCode=false" placeholder="验证码" @keyup.enter.native="handleRegister" >
            <svg-icon slot="prefix" icon-class="validCode" v-bind:class="{'color-class':isValidCode}" class="el-input__icon input-icon" />
          </el-input>
          <div class="register-code">
            <img :src="codeUrl" @click="getCode"/>
          </div>
        </el-form-item>
        <el-form-item style="width:100%;">
          <el-button
            :loading="loading"
            size="medium"
            type="primary"
            style="width:100%;"
            @click.native.prevent="handleRegister"
          >
            <span v-if="!loading">注 册</span>
            <span v-else>注 册 中...</span>
          </el-button>
          <div style="float: right;">
            <router-link class="link-type" :to="'/login'">使用已有账户登录</router-link>
          </div>
        </el-form-item>
      </el-form>
    </div>
    <!--  底部  -->
    <div class="el-login-footer"><span>主办单位名称：XXXXXXX公司 网站备案/许可证号：湘ICP备202100xxxx号-1<br>技术支持：XXXXXXXX大数据产业发展有限公司</span></div>
  </div>
</template>

<script>
import {getCodeImg, register} from "@/api/login";

export default {
  name: "Register",
  data() {
    const equalToPassword = (rule, value, callback) => {
      if (this.registerForm.password !== value) {
        callback(new Error("两次输入的密码不一致"));
      } else {
        callback();
      }
    };
    return {
      isUsername:false,
      isPassword:false,
      confirmPassword:false,
      isValidCode:false,
      codeUrl: "",
      registerForm: {
        username: "",
        password: "",
        confirmPassword: "",
        code: "",
        uuid: ""
      },
      registerRules: {
        username: [
          { required: true, trigger: "blur", message: "请输入您的账号" },
          { min: 2, max: 20, message: '用户账号长度必须介于 2 和 20 之间', trigger: 'blur' }
        ],
        password: [
          { required: true, trigger: "blur", message: "请输入您的密码" },
          { min: 5, max: 20, message: '用户密码长度必须介于 5 和 20 之间', trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, trigger: "blur", message: "请再次输入您的密码" },
          { required: true, validator: equalToPassword, trigger: "blur" }
        ],
        code: [{ required: true, trigger: "change", message: "请输入验证码" }]
      },
      loading: false,
      captchaOnOff: true
    };
  },
  created() {
    this.getCode();
  },
  methods: {
    getCode() {
      getCodeImg().then(res => {
        this.captchaOnOff = res.captchaOnOff === undefined ? true : res.captchaOnOff;
        if (this.captchaOnOff) {
          this.codeUrl = res.img;
          this.registerForm.uuid = res.uuid;
        }
      });
    },
    handleRegister() {
      this.$refs.registerForm.validate(valid => {
        if (valid) {
          this.loading = true;
          register(this.registerForm).then(res => {
            const username = this.registerForm.username;
            this.$alert("<font color='red'>恭喜你，您的账号 " + username + " 注册成功！</font>", '系统提示', {
              dangerouslyUseHTMLString: true
            }).then(() => {
              this.$router.push("/login");
            }).catch(() => {});
          }).catch(() => {
            this.loading = false;
            if (this.captchaOnOff) {
              this.getCode();
            }
          })
        }
      });
    }
  }
};
</script>

<style rel="stylesheet/scss" lang="scss">
    .register {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
      background-color: #0D1D30;
      position: relative;
    }
  .main {
    position: relative;
    width: 1024px;
    height: 495px;
    background: rgba(25, 41, 59, 1);
    border-radius: 12px;
    box-shadow: 0px 2px 12px 0px rgba(9, 23, 39, 1);
    color: rgba(255, 255, 255, 1);

  .img1 {
    position: absolute;
    top: 46px;
    left: 53px;
    width: 110px;
  }
  .img2 {
    position: absolute;
    top: 63px;
    left: 132px;
    width: 348px;
    height: 299px;
  }
  h3 {
    margin-left: 52px;
    margin-top: 383px;
    margin-bottom: 0;
    font-size: 32px;
  }
  h4 {
    margin-left: 52px;
    font-size: 24px;
    margin-top: 16px;
  }
  .register-form {
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
      margin: 0px auto 32px auto;
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
.register-form {
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
.register-code {
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
