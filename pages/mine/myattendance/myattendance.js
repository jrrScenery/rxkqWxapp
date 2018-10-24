var util = require('../../../utils/util.js');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    curtime: new Date().getFullYear()+"年"+(new Date().getMonth()+1)+"月",
    leavetype:[
      "请选择",
      "因公",
      "调休",
      "病假",
      "事假",
      "年假",
      "婚假",
      "产假",
      "哺乳假",
      "丧假",
      "迟到",
      "早退",
      "旷工"
    ],
  },
  //请假类型选择事件
  leavetypechange:function(e){
    var typeIndex = e.target.dataset.current;
    this.data.leavetypeIndex[typeIndex] = e.detail.value
    this.setData({
      leavetypeIndex: this.data.leavetypeIndex
    })
  },

//缺勤结束时间选择
  absEndTimechange:function(e){
    var timeIndex = e.target.dataset.current;
    this.data.selectAbsEndTime[timeIndex] = e.detail.value;
    this.setData({
      selectAbsEndTime: this.data.selectAbsEndTime
    }) 
  },

//请假原因多行文本框事件
  textareabindblur:function(e){
    var current = e.target.dataset.current;
    this.data.leavereason[current] = e.detail.value; 
    this.setData({
      leavereason: this.data.leavereason
    })
  },
  //添加信息点击事件
  addInfotap:function(e){
    var that = this;
    var pmendtime = wx.getStorageSync("loginData").pmendtime;
    var currentIndex = e.target.dataset.current;
    var currentleavetime = this.data.dataInfo[currentIndex].absBeginTime;
    var currentleavetime1 = this.data.dataInfo[currentIndex].absEndTime;
    if (this.data.leavetypeIndex[currentIndex] == 0) {
      wx.showToast({
        title: '请输入请假类型',
        icon:'none',
        duration:2000
      })
    } else if (currentleavetime == currentleavetime1){
      wx.showToast({
        title: '开始时间不能大于结束时间！',
        icon:'none',
        duration:2000
      })
    } else if (that.data.selectAbsEndTime[currentIndex] == pmendtime){
      wx.showToast({
        title: '当天考勤已补满！',
        icon: 'none',
        duration: 2000
      })
    }else{ //将新添数据添加在数组最后
      var attenInfo = {};
      attenInfo.punchDate = that.data.dataInfo[currentIndex].punchDate;
      attenInfo.beginTime = that.data.dataInfo[currentIndex].beginTime;
      attenInfo.endTime = that.data.dataInfo[currentIndex].endTime;
      attenInfo.processStatus = that.data.dataInfo[currentIndex].processStatus;
      attenInfo.absBeginTime = that.data.selectAbsEndTime[currentIndex];
      attenInfo.absEndTime = that.data.dataInfo[currentIndex].absEndTime;
      attenInfo.addrId = that.data.dataInfo[currentIndex].addrId;
      attenInfo.prjId = that.data.dataInfo[currentIndex].prjId;
      attenInfo.isNew = 0;
      that.data.selectAbsBeginTime[that.data.dataInfo.length] = that.data.selectAbsEndTime[currentIndex];
      that.data.selectAbsEndTime[that.data.dataInfo.length] = that.data.dataInfo[currentIndex].absEndTime;
      that.data.leavetypeIndex[that.data.dataInfo.length] = 0;
      that.data.cancleFlag[that.data.dataInfo.length] = false;
      that.data.addFlag[that.data.dataInfo.length] = true;
      that.data.dataInfo[that.data.dataInfo.length]=attenInfo;
      that.setData({
        dataInfo: that.data.dataInfo,
        selectAbsBeginTime: that.data.selectAbsBeginTime,
        selectAbsEndTime: that.data.selectAbsEndTime,
        leavetypeIndex: that.data.leavetypeIndex,
        cancleFlag: that.data.cancleFlag,
        addFlag: that.data.addFlag
      })
      //排序，将添加的数据放置到相应位置
      //将最后插入的一条数据赋值给相应变量
      var insert = that.data.dataInfo[that.data.dataInfo.length - 1];
      var insertselectTime = that.data.selectAbsBeginTime[that.data.dataInfo.length - 1];
      var insertselectTime1 = that.data.selectAbsEndTime[that.data.dataInfo.length - 1];
      var insertleavetypeIndex = that.data.leavetypeIndex[that.data.dataInfo.length - 1];
      for (var i = that.data.dataInfo.length - 1; i >= 0; i--) {
        if (i > currentIndex + 1) {
          var attenInfo1 = {};
          attenInfo1 = that.data.dataInfo[i - 1];
          that.data.selectAbsBeginTime[i] = that.data.dataInfo[i - 1].absBeginTime;
          that.data.selectAbsEndTime[i] = that.data.dataInfo[i - 1].absEndTime;
          that.data.leavetypeIndex[i] = that.data.leavetypeIndex[i - 1];
          that.data.dataInfo[i] = attenInfo1;
        } else if (i == currentIndex + 1) {
          that.data.selectAbsBeginTime[i] = insertselectTime;
          that.data.selectAbsEndTime[i] = insertselectTime1;
          that.data.leavetypeIndex[i] = insertleavetypeIndex;
          that.data.cancleFlag[i] = true;
          that.data.dataInfo[i] = insert;
        } else {
          if (i == currentIndex){
            that.data.dataInfo[i].absEndTime = insertselectTime;
            that.data.selectAbsEndTime[i] = insertselectTime;
            that.data.addFlag[i] = false;
          }else{
            var attenInfo1 = {};
            attenInfo1 = that.data.dataInfo[i];
            that.data.selectAbsBeginTime[i] = that.data.selectAbsBeginTime[i];
            that.data.selectAbsEndTime[i] = that.data.selectAbsEndTime[i];
            that.data.leavetypeIndex[i] = that.data.leavetypeIndex[i];
            that.data.dataInfo[i] = attenInfo1;
          }
        }
      }
      that.setData({
        dataInfo: that.data.dataInfo,
        selectAbsBeginTime: that.data.selectAbsBeginTime,
        selectAbsEndTime: that.data.selectAbsEndTime,
        leavetypeIndex: that.data.leavetypeIndex,
        cancleFlag: that.data.cancleFlag,
        addFlag: that.data.addFlag
      })
    }
  },
  //点击取消按钮事件
  cancleInfoTap:function(e){
    var that = this;
    var currentIndex = e.target.dataset.current;
    var selectAbsEndTime = that.data.selectAbsEndTime[currentIndex];
    //将当前条记录之后的记录依次前移
    for (var i = currentIndex; i < that.data.dataInfo.length;i++){
      if (i == currentIndex){//将当前记录选中的缺勤结束时间赋值给前一条的缺勤结束时间
        that.data.selectAbsEndTime[i - 1] = selectAbsEndTime;
        that.data.dataInfo[i - 1].absEndTime = selectAbsEndTime;
        that.data.addFlag[i - 1] = true;
      } else { //将当前条记录之后的记录一次前移
        var attenInfo1 = {};
        attenInfo1 = that.data.dataInfo[i];
        that.data.selectAbsBeginTime[i - 1] = that.data.selectAbsBeginTime[i];
        that.data.selectAbsEndTime[i - 1] = that.data.selectAbsEndTime[i];
        that.data.leavetypeIndex[i - 1] = that.data.leavetypeIndex[i];
        that.data.cancleFlag[i - 1] = that.data.cancleFlag[i]; 
        that.data.addFlag[i - 1] = that.data.addFlag[i];
        that.data.dataInfo[i - 1] = attenInfo1;
      }
    }
    //前移后将最后一条记录删除
    that.data.dataInfo.pop();
    that.data.selectAbsBeginTime.pop();
    that.data.selectAbsEndTime.pop();
    that.data.leavetypeIndex.pop();
    that.data.cancleFlag.pop();
    that.data.addFlag.pop();
    //删除目标记录之后更新数据
    that.setData({
      dataInfo: that.data.dataInfo,
      selectAbsBeginTime: that.data.selectAbsBeginTime,
      selectAbsEndTime: that.data.selectAbsEndTime,
      leavetypeIndex: that.data.leavetypeIndex,
      cancleFlag: that.data.cancleFlag,
      addFlag: that.data.addFlag
    })
  },

  //点击提交按钮事件
  formSubmit:function(e){
    var that = this;
    var n = 0;//记录请假类型是否有空值

    //判断请假类型是否有“请选择”选项，若有则提示输入请假类型
    for(var i = 0; i < that.data.leavetypeIndex.length; i++){
      if (this.data.leavetypeIndex[i] == 0){
        wx.showToast({
          title: '请输入请假类型',
          icon: 'none',
          duration: 2000
        })
        n++;
      }
    }

    var url = util.requestService("/api/hrkq/submitAttn");
    var postdata = {};
    var postdataInfo = [];
    var k = 0;
    for(var i = 0; i < that.data.dataInfo.length; i++){
      var dataInfo = {};   
          dataInfo.addrId = that.data.dataInfo[i].addrId;
          dataInfo.prjId = that.data.dataInfo[i].prjId;
      var processStatus = that.data.dataInfo[i].processStatus;
          dataInfo.processStatus = processStatus;
      if(processStatus == 0 || processStatus == 3){        
        if(that.data.dataInfo[i].id != null){
          dataInfo.id = that.data.dataInfo[i].id;
        }  
        dataInfo.punchDate = that.data.dataInfo[i].punchDate;
        dataInfo.leaveType = that.data.leavetypeIndex[i];
        dataInfo.absBeginTime = that.data.selectAbsBeginTime[i];
        dataInfo.absEndTime = that.data.selectAbsEndTime[i];
        // if (that.data.dataInfo[i].isNew == 0){
          dataInfo.isNew = that.data.dataInfo[i].isNew;
        // }
        if(!that.data.leavereason[i]){
          dataInfo.reason = "";
        }else{
          dataInfo.reason = that.data.leavereason[i];
        }
        postdataInfo[k++] = dataInfo;
      }
    }
    postdata.topEmpId = wx.getStorageSync("topEmpId");
    postdata.encryption = wx.getStorageSync("encryption");
    postdata.dataInfo = postdataInfo;
    console.log(postdata);
    function success(res) {
      console.log(res);
      if(res.data.code == 200){
        wx.showToast({
          title: '提交成功',
          icon:"success",
          duration:2000
        })
        for (var i = 0; i < that.data.dataInfo.length; i++) {
          that.data.dataInfo[i].absEndTime = that.data.selectAbsEndTime[i];
          if (that.data.dataInfo[i].processStatus != 2){
            that.data.dataInfo[i].processStatus = 1;
          }
        }
        that.setData({
          dataInfo: that.data.dataInfo,
          submitflag: true
        })
      } else if (res.data.code == 99) {
        util.mineRedirect(res.data.message);
      }else{
        wx.showToast({
          title: res.data.message,
          icon: "none",
          duration: 2000
        })
      }
    }
    if (n == 0){
      if (postdata.dataInfo.length != 0){
        wx.showModal({
          title: '提示',
          content: '确认提交考勤吗？',
          success: function (res) {
            if (res.confirm) {
              util.checkEncryption(url, postdata, success);
            } else if (res.cancel) {
              for (var i = 0; i < that.data.dataInfo.length; i++) {
                that.data.dataInfo[i].absEndTime = that.data.selectAbsEndTime[i];
              }
            }
          }
        })
      }else{
        wx.showToast({
          title: '已提交状态，不可重复提交',
          icon: "none",
          duration: 2000
        })
      }
    }
  },

  //页面跳转，跳转到补提本月考勤页面
  navToPage:function(e){
    let route = e.currentTarget.dataset.route
    wx.navigateTo({
      url: route
    })
  },

  /** 
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    wx.showLoading({
      title: '加载中',
    })
    var processStatus = util.getType().processStatus;
    var leaveType = util.getType().leaveType;
    var year = new Date().getFullYear();
    var month = new Date().getMonth() + 1;
    var attnMonth = year + "-" + month;//请求服务器年月份
    var curData = {
      attnMonth: attnMonth,
      wholeMonth: "1",//是否全月，0：是；1：不是
      topEmpId: wx.getStorageSync("topEmpId"),
      encryption: wx.getStorageSync("encryption")
    }
    if (options.id){//处理考勤页面点击驳回修改按钮传递过来的驳回数据
      var url = util.requestService("/api/hrkq/queryAttnDetail");
      var postdata = {
        id: options.id,
        wholeMonth: "1",
        topEmpId: wx.getStorageSync("topEmpId"),
        encryption: wx.getStorageSync("encryption")
      }
      function success(res){
        wx.hideLoading();
        if (res.data.code == 200) {
          var leavetypeIndex = [];  //定义请假类型下标数组     
          var leavereason = [];  //定义请假原因下标数组
          var selectAbsBeginTime = []; //picker选择器选择的缺勤开始时间数组
          var selectAbsEndTime = [];  // picker选择器选择的缺勤结束时间数组
          var cancleFlag = [];  // 取消按钮是否显示的数组
          var addFlag = [];   //增加按钮是否可用标识
          for (var i = 0; i < res.data.attenDetailInfo.length;i++){
            leavetypeIndex[i] = res.data.attenDetailInfo[i].leaveType;
            leavereason[i] = res.data.attenDetailInfo[i].reason;  
            selectAbsBeginTime[i] = res.data.attenDetailInfo[i].absBeginTime;
            selectAbsEndTime[i] = res.data.attenDetailInfo[i].absEndTime;
            cancleFlag[i] = false;
            addFlag[i] = true;
          }
          that.setData({
            processId:options.id,
            dataInfo: res.data.attenDetailInfo,
            leavetypeIndex: leavetypeIndex,
            leavereason: leavereason,
            submitflag: false,//提交按钮标识false未提交成功，true提交成功
            processStatus: processStatus,
            leaveType: leaveType,
            selectAbsBeginTime: selectAbsBeginTime,
            selectAbsEndTime: selectAbsEndTime,
            cancleFlag: cancleFlag,
            addFlag: addFlag
          })
        } else if (res.data.code == 99) {
          util.mineRedirect(res.data.message);
        }else{
          wx.showToast({
            title: res.data.message,
            icon:"none",
            duration:2000
          })
        }
      }
      util.checkEncryption(url, postdata, success);
    }else{
      var url = util.requestService("/api/hrkq/queryAttn");
      // 请求服务器成功
      function success(res) {
        console.log(res);
        wx.hideLoading();
        if (res.data.code == 200) {                    
          var leavetypeIndex = [];  //定义请假类型下标数组          
          var leavereason = [];  //定义请假原因下标数组
          var selectAbsBeginTime = []; //定义picker选择器选择的缺勤开始时间数组
          var selectAbsEndTime = [];  // 定义picker选择器选择的缺勤结束时间数组
          var cancleFlag = [];  // 定义取消按钮是否显示的数组
          var addFlag = [];   //增加按钮是否可用标识
          //根据考勤数据的条数定义数组的长度
          for (var i = 0; i < res.data.attnInfo.length; i++) {
            leavetypeIndex[i] = res.data.attnInfo[i].leaveType;
            if (res.data.attnInfo[i].reason != null){
              leavereason[i] = res.data.attnInfo[i].reason;
            }else{
              leavereason[i] = "";
            }
            selectAbsBeginTime[i] = res.data.attnInfo[i].absBeginTime;
            selectAbsEndTime[i] = res.data.attnInfo[i].absEndTime;
            cancleFlag[i] = false;
            addFlag[i] = true;  
          }
          that.setData({
            dataInfo: res.data.attnInfo,
            leavetypeIndex: leavetypeIndex,
            leavereason: leavereason,
            submitflag: false,//提交按钮标识false:未提交成功，true:提交成功
            processStatus: processStatus,
            leaveType: leaveType,
            selectAbsBeginTime: selectAbsBeginTime,  //picker选择器选择的缺勤开始时间
            selectAbsEndTime: selectAbsEndTime, //picker选择器选择的缺勤结束时间
            cancleFlag: cancleFlag, //控制取消按钮的显示与隐藏
            addFlag: addFlag
          })
        } else if (res.data.code == 99) {
          util.mineRedirect(res.data.message);
        }else{
          wx.showToast({
            title: res.data.message,
            icon: "none",
            duration: 2000
          })
        }
      }
      util.checkEncryption(url, curData, success);
    }    
  },
 
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    return {
      title: '打卡',
      desc: "打卡",
      path: 'pages/mine/myattendance/myattendance',
      success: function (res) {
        wx.showShareMenu({
          // 要求小程序返回分享目标信息
          withShareTicket: true
        });

      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
})