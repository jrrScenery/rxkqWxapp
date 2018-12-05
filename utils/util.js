const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  // return [hour, minute, second].map(formatNumber).join(':')
  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

//请求地址
function requestService(serverMethod) {
  var httpInfo = "https://wbm.dcits.com" + serverMethod;
  // var httpInfo = "http://10.1.200.187:8808" + serverMethod;
  return httpInfo;
}

//页面跳转
function navigateTo(event){
  console.log(event);
  let route = event.currentTarget.dataset.route;
  var id = event.currentTarget.dataset.id;
  if (event.currentTarget.dataset.current!=null){
    var loaType = event.currentTarget.dataset.current;
    wx.navigateTo({
      url: route + "?id=" + id + "&loaType=" + loaType
    })
  }else{
    wx.navigateTo({
      url: route + "?id=" + id
    })
  }
}

//跳转登录页面代码
function redirect(res){
  wx.showModal({
    title: '提示',
    content: res,
    success: function (res) {
      if (res.confirm) {
        wx.redirectTo({
          url: '../login/login',
        })
      } else if (res.cancel) {
        console.log('用户点击取消')
      }
    }
  })
}
function mineRedirect(res) {
  wx.showModal({
    title: '提示',
    content: res,
    success: function (res) {
      if (res.confirm) {
        wx.redirectTo({
          url: '../../login/login',
        })
      } else if (res.cancel) {
        console.log('用户点击取消')
      }
    }
  })
}

function checkEncryption(url, postdata, success) {
  if (wx.getStorageSync("encryption")) {
    wx.checkSession({
      success: function (res) {
        getPostRequest(url, postdata, success);
      },
      fail: function () {
        wx.hideLoading();
        mineRedirect("登录失效，请重新登录");
      }
    })
  } else {
    wx.hideLoading();
    mineRedirect("您未登录，请先登录");
  }
}

function getPostRequest(url, data, success) {
  wx.request({
    method: 'POST',
    url: url,
    data: data,
    header: { 'content-type': 'application/json' },
    success: success,
    fail: function (res) {
      console.log(res);
      wx.showToast({
        title: res.errMsg,
        icon:'none',
        duration:2000
      })
    }
  });
}

function sendUniformMessage(data,success){
  var accessTokenUrl = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=wxa8405bb1ac18d4b5&secret=99f4bc81bd325c4cc40215c8ece52adb";
  wx.request({
    url: accessTokenUrl,
    success: function (res) {
      console.log(res);       
        var access_token = res.data.access_token;
        var sendTemplateUrl = "https://api.weixin.qq.com/cgi-bin/message/wxopen/template/uniform_send?access_token=" + access_token;
        getPostRequest(sendTemplateUrl, data, success);
    }
  })
}
//流程待办提醒
function getSendTemplateData(touser, processId, template_id,leaveName,leaveType,staffName){
  var sendTemplateData = {
    touser: touser,
    mp_template_msg: {
      appid: 'wxb75346adcf2d7a64',
      template_id: template_id,
      url: "pages/mine/mybatchaudit/mybatchaudit",
      miniprogram: {
        appid: "wxa8405bb1ac18d4b5",
        pagepath: "pages/mine/myaudit/myaudit" + "?id=" + processId
      },
      data: {
        first: {
          "value": leaveName+"审批提醒",
          "color": "#173177"
        },
        keyword1: {
          value: leaveType + "-" + staffName
        },
        keyword2: {
          value: formatTime(new Date())
        },
      }
    }
  }
  function success(res) {
    console.log(res)
  }
  sendUniformMessage(sendTemplateData, success);
}
//流程审核提醒
function getSendTemplateResult(touser, processId,template_id, leaveName, leaveType,auditType) {
  var firstName='';
  if (auditType=='ok'){
    firstName = "您的" + leaveName + "流程已审核通过"
  }else{
    firstName = "您的" + leaveName + "流程已驳回"
  }
  var sendTemplateResult = {
    touser: touser,
    mp_template_msg: {
      appid: 'wxb75346adcf2d7a64',
      template_id: template_id,
      url: "pages/mine/mybatchaudit/mybatchaudit",
      miniprogram: {
        appid: "wxa8405bb1ac18d4b5",
        pagepath: "pages/mine/mybatchaudit/mybatchaudit" + "?id=" + processId
      },
      data: {
        first: {
          "value": firstName,
          "color": "#173177"
        },
        keyword1: {
          value: leaveType+"申请"
        },
        keyword2: {
          value: formatTime(new Date())
        },
      }
    }
  }
  function success(res) {
    console.log(res)
  }
  sendUniformMessage(sendTemplateResult, success);
}

function upload(url,page, path,data,success) {
  wx.uploadFile({
    url: url,
    filePath: path,
    name: 'image',
    formData: data,
    header: { "Content-Type": "multipart/form-data/application/json" },
    success: success,
    fail: function (e) {
      wx.showModal({
        title: '提示',
        content: '提交失败',
        showCancel: false
      })
    },
    complete: function () {
      wx.hideToast();  //隐藏Toast
    }
  })
}

function getType(){
  var data = {
    loaType:{
      0: "请假",
      1: "加班",
      2: "考勤",
      3: "报派工",
      4: "批量加班"
    },
    leaveType:{
      1: "因公",
      2: "调休",
      3: "病假",
      4: "事假",
      5: "年假",
      6: "婚假",
      7: "产假",
      8: "哺乳假",
      9: "丧假",
      10: "迟到",
      11: "早退",
      12: "旷工",
      13: "产检假"
    },
    relaxation:{
      0:"调休",
      1:"有偿"
    },
    processStatus:{
      0 : "未提交",
      1 : "审批中",
      2 : "已审批",
      3: "修改"
    },
    auditType:{
      0 : "同意",
      1 : "驳回"
    },
    processType:{
      0: "代办任务",
      1 : "审批记录"
    }
  }
  return data;
}

module.exports = {
  formatTime: formatTime,
  requestService: requestService,
  redirect: redirect,
  mineRedirect: mineRedirect,
  checkEncryption: checkEncryption,
  getPostRequest: getPostRequest,
  getType: getType,
  navigateTo: navigateTo,
  upload:upload,
  sendUniformMessage: sendUniformMessage,
  getSendTemplateData: getSendTemplateData,
  getSendTemplateResult: getSendTemplateResult
}

