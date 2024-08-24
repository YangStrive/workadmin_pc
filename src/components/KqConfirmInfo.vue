<template>
  <div class="kqsettask">
    <div class="settask_top">
      <breadcrumb>
        <router-link to="kqtasklist">考勤确认</router-link>
      </breadcrumb>
    </div>
    <div class="settask_main">
      <div class="settask_title">
        <h2>考勤确认</h2>
      </div>
      <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="120px">
        <el-form-item label="打卡日期" prop="date" style="margin-bottom: 19px" id="kqrq">
          <div class="work_date">
            <el-date-picker v-model="start_date" :editable="false" :clearable="false" type="date" placeholder="开始日期"
                            style="width: 150px" @change="dateChange(item)">
            </el-date-picker>
          </div>

        </el-form-item>
        <el-form-item label="打卡时间" prop="kq_type"  id="kqfs">
          <div class="kq_type_main">
            <template>
              <div class="all_timearea">
                <div class="selecttimeinterval" v-for="(item, index) in times_list">
                  <div class="start" >
                    <el-time-picker style="width: 180px" placeholder="上班打卡时间" :clearable="false"
                                     v-model="item.start_time" @change="startChange(item)" format="HH:mm" v-if="item.start_time" :picker-options="{
                           selectableRange: startRange(item.start_time),
                        }">
                    </el-time-picker>
                  </div>
                  <div class="line">-</div>
                  <div class="end">
                    <el-time-picker style="width: 180px" placeholder="下班打卡时间" :clearable="false"
                                     v-model="item.end_time" @change="endChange(item)" :format="formatEndtime(item)"  :picker-options="{
                          selectableRange: endRange(item.end_time),
                        }">
                    </el-time-picker>
                  </div>
                </div>
                <div class="addtime" v-if="times_list.length < 2" >
                  <div class="add_item" @click="addTimeFn" style="opacity: 0.5; cursor: not-allowed">添加时段</div>
                </div>
              </div>
            </template>
          </div>
        </el-form-item>
        <el-form-item label="备注" prop="confirm_remark">
          <el-input v-model="ruleForm.confirm_remark" placeholder="请输入" style="width: 468px"></el-input>
        </el-form-item>
        <el-form-item label="" prop="" style="margin-bottom: 67px">
          <el-button type="primary" @click="validateKqSet">{{
              "保存"
            }}</el-button>
        </el-form-item>
      </el-form>
    </div>

  </div>
</template>

<script>
import $ from "jquery";
import * as util from "../assets/js/util.js";

import breadcrumb from "@/components/common/breadcrumb";
import SelectMemberGroupMulti from "@/components/common/SelectMemberGroupMulti";
import SetRequireField from "@/components/common/SetRequireField";

import p_icon1 from "@/assets/imgs/position/p_icon1.svg";
// import location_icon from '@/assets/imgs/position/location.svg'

let map,
  geolocation,
  placeSearch,
  citycode,
  marker,
  geocoder,
  infoWindow,
  point;
export default {
  name: "kqconfirminfo",
  data () {
    let _this = this;
    var checkName = (rule, value, callback) => {
      if (!value) {
        callback(new Error("请输入规则名称"));
        document.getElementById("kqfs").scrollIntoView(false);
      } else if (value.length > 20) {
        callback(new Error("考勤规则名称不能超过20个字"));
        document.getElementById("kqfs").scrollIntoView(false);
      } else {
        callback();
      }
    };
    var checkMembersGroups = (rule, value, callback) => {
      if (!this.ruleForm.selected_members_groups.length) {
        document.getElementById("kqfs").scrollIntoView(false);
        callback(new Error("请选择参与小组或人员"));
      } else {
        callback();
      }
    };
    var checkTimesList = (rule, value, callback) => {
      // console.log(rule)
      // console.log(value)
      // console.log(callback)
        //固定 后一时段必须在前一时段之后
        if (this.times_list[1]) {
          if (
            new Date(
              2000,
              1,
              1,
              util.getLocalTime(this.times_list[1].start_time.getTime(), "HH"),
              util.getLocalTime(this.times_list[1].start_time.getTime(), "mm")
            ).getTime() <=
            new Date(
              2000,
              1,
              1,
              util.getLocalTime(this.times_list[0].end_time.getTime(), "HH"),
              util.getLocalTime(this.times_list[0].end_time.getTime(), "mm")
            ).getTime() ||
            this.times_list[0].cross == 1
          ) {
            document.getElementById("kqfs").scrollIntoView(false);
            // return false
            callback(new Error("后一时间段开始时间必须在上一时间段之后"));
          } else {
            if (this.times_list[2]) {
              if (
                new Date(
                  2000,
                  1,
                  1,
                  util.getLocalTime(
                    this.times_list[2].start_time.getTime(),
                    "HH"
                  ),
                  util.getLocalTime(
                    this.times_list[2].start_time.getTime(),
                    "mm"
                  )
                ).getTime() <=
                new Date(
                  2000,
                  1,
                  1,
                  util.getLocalTime(
                    this.times_list[1].end_time.getTime(),
                    "HH"
                  ),
                  util.getLocalTime(
                    this.times_list[1].end_time.getTime(),
                    "mm"
                  )
                ).getTime() ||
                this.times_list[0].cross == 1 ||
                this.times_list[1].cross == 1
              ) {
                document.getElementById("kqfs").scrollIntoView(false);
                // return false
                callback(new Error("后一时间段开始时间必须在上一时间段之后"));
              } else {
                callback();
              }
            } else {
              callback();
            }
          }
        } else {
          callback();
        }
    };
    // var checkDate = (rule, value, callback) => {
    //   document.getElementById("kqrq").scrollIntoView(false);
    //  // callback(new Error("请设置打卡日期"));
    // };
    return {
      team_id: 0,
      project_id: 0,
      task_id: 0,
      schedule_is_attend:window.localStorage.getItem('schedule_is_attend'),
      ruleForm: {
        confirm_remark: "",
        kq_type:0,
        start_date: true,
      },
      rules: {
        name: [{ validator: checkName, required: true, trigger: "blur" }],
        kq_type: [{ validator: checkTimesList, required: true }],
        //date: [{ validator: checkDate, required: true }],
      },
      //考勤方式
      times_list: [
        //固定
        {
          id: 0,
          start_time: new Date(2000, 1, 1, 9, 0),
          end_time: new Date(2000, 1, 1, 18, 0),
          cross: 0,
        },
      ],
      kqStartT: "00:00", //考勤开始时间
      //考勤日期
      start_date: new Date(),
      startOptions: {
        disabledDate (time) {
          if (this.start_date) {
            return (
              time.getTime() < Date.now() - 8.64e7 ||
              time.getTime() > this.start_date.getTime()
            );
          } else {
            return time.getTime() < Date.now() - 8.64e7;
          }
        },
      },
      endOptions: {
        disabledDate (time) {
          if (this.start_date) {
            return (
              time.getTime() < Date.now() - 8.64e7 ||
              time.getTime() <
              util.getStampFromDate(
                util.getLocalTime(this.start_date.getTime(), "yyyy-MM-dd")
              )
            );
          } else {
            return time.getTime() < Date.now() - 8.64e7;
          }
        },
      },
    };
  },
  computed: {
  },
  watch: {
  },
  methods: {
    init() {
      //获取用户信息
      this.team_id = util.getLocalStorage("projectStorageInfo").team_id;
      this.project_id = util.getLocalStorage("projectStorageInfo").project_id;
      this.task_id = this.GetQueryString('task_id');
      this.user_id = this.GetQueryString('user_id');
      this.getAttendanceInfo(this.GetQueryString('date'));
    },
    GetQueryString(name) {
      var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
      var r = ('?' + window.location.href.split('?')[1]).substr(1).match(reg);
      if (r != null) return unescape(r[2]);
      return null;
    },
    getAttendanceInfo(date) {
      let task_id = this.GetQueryString('task_id')
      util.ajax({
        url: "/attendance/detail",
        type: "GET",
        data: {
          user_id: this.GetQueryString('user_id'),
          team_id: this.team_id,
          project_id: this.project_id,
          task_id: this.GetQueryString('task_id'),
          date: date
        },
        success: res => {
          console.log(res);

          // console.log(task_id)
          if (res && res.errno == 0) {

            //按月统计时 用过一次的task_id需要重置为undefined  因为它是加在行上的 下次请求重新获取对应task_id

            this.start_date = date;
            this.ruleForm.start_date = date;
            //如果有attendance_id 则只查看一条考勤记录 遍历找到对应的 删除其他的
            let tempArr = [];
            //遍历状态
            tempArr = [];
            if (res.data.work_time_range){
              this.times_list = [];
              res.data.work_time_range.forEach((obj) => {
                let tempObj = {};
                tempObj.start_time = new Date(
                  2000,
                  1,
                  1,
                  obj.start.time.split(":")[0],
                  obj.start.time.split(":")[1]
                );
                tempObj.start_id = obj.start.id;
                tempObj.start_type = obj.start.type;
                tempObj.end_time = new Date(
                  2000,
                  1,
                  1,
                  obj.end.time.split(":")[0],
                  obj.end.time.split(":")[1]
                );
                tempObj.end_id = obj.end.id;
                tempObj.cross = obj.cross;
                tempObj.end_type = obj.end.type;
                this.times_list.push(tempObj);
              });
            }
            res.data.attendance_list.forEach((obj1, att_index) => {
              //遍历状态
              if (obj1.status[0] && obj1.status[0].value == 1) {
                //正常 只有一个status
                obj1.flog = 1;
                tempArr.push(obj1);

              } else {
                //其他异常情况
                if (!obj1.status[0]) {
                  //status是空数组  还没到判定缺卡时间或还没到打卡时间
                  obj1.flog = -1;
                  tempArr.push(obj1);
                } else {
                  obj1.flog = 0;
                  tempArr.push(obj1);
                }
              }
              // }
            });
            res.data.attendance_list = tempArr;
            //遍历图片字段  组装数据
            res.data.attendance_list.forEach((obj1, att_index) => {
              obj1.form_data = obj1.form_data ? obj1.form_data : [];
            });
            res.data.attendance_list.task_id = task_id;
            this.attendance_list = res.data;


            this.kq_detail = res.data;
          }
          setTimeout(() => {
            this.loading_kq_detail = false;
          }, 1000);
        },
        error: (xhr, status) => {
          this.loading_kq_detail = false;
        },
        noNetwork: () => {
          this.loading_kq_detail = false;
          // 网络超时
          this.$message({
            showClose: true,
            message: "网络连接失败，请检查网络",
            type: "warning"
          });
        }
      });
    },

    validateKqSet() {

      this.$refs["ruleForm"].validate((valid) => {
        if (valid) {
          // alert('submit!');
          this.saveKqSetFn();
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    saveKqSetFn() {
      let date = this.start_date;
      let ajaxData = {
        team_id: this.team_id,
        project_id: this.project_id,
        task_id: this.task_id,
        confirm_remark: this.ruleForm.confirm_remark,
        user_id: this.user_id,
        work_time_range: [],
        date: date,
      };
      console.log(this.ruleForm);
      this.times_list.forEach((obj) => {
        let tempObj = {};
        tempObj.start = {
          id: obj.start_id ? obj.start_id : 0,
          time: util.getLocalTime(obj.start_time.getTime(), "HH:mm"),
          type: obj.start_type ? obj.start_type: 1,
        };
        tempObj.end = {
          id: obj.end_id ? obj.end_id : 0,
          time: util.getLocalTime(obj.end_time.getTime(), "HH:mm"),
          type: obj.end_type ? obj.end_type : 2,
        };
        tempObj.cross = obj.cross;
        ajaxData.work_time_range.push(tempObj);
      });
      console.log(ajaxData);
      let url = "/attendance/record_edit";
      this.ajax(url, ajaxData);
    },
    ajax (url, ajaxData) {
      console.log(ajaxData);
      util.ajax({
        url: url,
        type: "POST",
        data: ajaxData,
        success: (res) => {
          console.log("确认设置");
          console.log(res);
          if (res && res.errno == 0) {
            this.$message({
              showClose: true,
              message: "操作成功",
              type: "success",
            });
            this.$router.replace("kqaddmin");
          }
        },
        error: (xhr, status) => { },
        noNetwork: () => {
          // 网络超时
          this.$message({
            showClose: true,
            message: "网络连接失败，请检查网络",
            type: "warning",
          });
        },
      });
    },
    dateChange(row){
     let date = util.getLocalTime(
        this.start_date.getTime(),
        "yyyy-MM-dd"
      );
      this.getAttendanceInfo(date);
    },
    startRange (end_time) {

    },
    endRange (start_time) {

    },
    formatEndtime (item) {
      if (
        item.start_time.toString().substr(16) <
        item.end_time.toString().substr(16)
      ) {
        item.cross = 0;
        return "HH:mm";
      } else {
        item.cross = 1;
        return "次日HH:mm";
      }
    },
    startChange (item) {
      if (
        item.start_time.toString().substr(16)==
        item.end_time.toString().substr(16)
      ) {
        item.start_time = new Date(item.start_time.getTime() - 60 * 1000);
      }
    },
    endChange (item) {
      if (
        item.start_time.toString().substr(16) ==
        item.end_time.toString().substr(16)
      ) {
        item.end_time = new Date(item.end_time.getTime() + 60 * 1000);
      }
    },
    isCross () {
      return this.times_list.some((obj) => {
        return obj.cross == 1;
      });
    },
    //添加固定时段/班次
    addTimeFn () {
        this.times_list.push({
          id:0,
          start_time: new Date(2000, 1, 1, 9, 0),
          end_time: new Date(2000, 1, 1, 18, 0),
        });
      }
    },
    //删除固定时段/班次
   delTimeFn (index) {
       this.times_list.splice(index, 1);
    },
  mounted () {
    this.init();
  },
  beforeDestroy () {
    localStorage.removeItem("naixue_project_kaoqin");
  },
  // watch: {
  //   '$route' (to, from) {
  //     // 对路由变化作出响应...
  //      this.init()
  //   }
  // }
};
</script>

<style>
.kqsettask .settask_main .el-radio__label {
  padding-left: 10px;
}

.kqsettask .settask_main .el-form-item {
  margin-bottom: 30px;
}

.kqsettask .settask_main .el-form-item .el-form-item__label {
  text-align: left;
  text-indent: 23px;
}

.kqsettask .settask_main .el-form-item.is-required .el-form-item__label {
  position: relative;
}

.kqsettask .settask_main .el-form-item.is-required .el-form-item__label:before {
  content: "";
  color: #ffaa00;
  /*margin-right: 8px;*/
  display: block;
  width: 7px;
  height: 7px;
  background: url(../assets/imgs/x_icon.svg) no-repeat center left;
  color: #ffaa00;
  position: absolute;
  left: 0px;
  top: 14px;
}

.kqsettask .settask_main .new_addr .form_wrap .el-form-item {
  margin-bottom: 24px;
}

.kqsettask .settask_main .new_addr .form_wrap .el-form-item .el-form-item__content {
  margin-left: 90px !important;
}

.kqsettask .settask_main .new_addr .form_wrap .el-form-item .el-form-item__label {
  text-align: right;
  text-indent: 0px;
}

.kqsettask .settask_main .el-radio+.el-radio {
  margin-left: 41px;
}

.kqsettask .settask_main .select_addr .el-dialog {
  width: 640px;
}

.kqsettask .settask_main .new_addr .el-dialog {
  width: 741px;
}

.kqsettask .settask_main .new_addr .new_addr_main .main_top .el-input {
  box-shadow: 0 1px 2px 0 rgba(170, 172, 173, 0.5);
}

.kqsettask .settask_main .new_addr .new_addr_main .main_top .el-input__inner {
  padding-left: 36px;
  border: none;
}

.kqsettask .settask_main .new_addr .new_addr_main .main_top .el-input__inner:hover,
.kqsettask .settask_main .new_addr .new_addr_main .main_top .el-input__icon:hover+.el-input__inner,
.kqsettask .settask_main .new_addr .new_addr_main .main_top .el-input__inner:focus {
  border: none !important;
}

.kqsettask .settask_main .select_addr .select_addr_main .el-input__inner {
  padding-left: 36px;
}

.kqsettask .settask_main .select_addr .select_addr_main .main_table .table_body .table_item .pos_edit .el-button>span {
  font-size: 12px;
}

/*.kqsettask .settask_main .select_addr .select_addr_main .main_table .el-table .cell{
	white-space: nowrap;
	padding-right: 10px;
}
.kqsettask .settask_main .select_addr .select_addr_main .main_table .el-table-column--selection .cell{
	padding-left: 11px;
	padding-right: 0;
}
.kqsettask .settask_main .select_addr .select_addr_main .main_table .pos_name .cell{
	padding-left: 10px;
}
.kqsettask .settask_main .select_addr .select_addr_main .main_table .el-table__header-wrapper th{
	height: 36px;
}
.kqsettask .settask_main .select_addr .select_addr_main .main_table .el-table__header-wrapper th.pos_name,
.kqsettask .settask_main .select_addr .select_addr_main .main_table .el-table__header-wrapper th.pos_addr{
	border-right: 1px solid #e0e6ed;
}
.kqsettask .settask_main .select_addr .select_addr_main .main_table .el-table__body-wrapper td{
	height: 43px;
}
.kqsettask .settask_main .select_addr .select_addr_main .main_table .el-table__body-wrapper td.pos_name .cell{
	font-size: 13px;
	color: #1f2d3d;
}
.kqsettask .settask_main .select_addr .select_addr_main .main_table .el-table__body-wrapper td.pos_addr .cell{
	font-size: 12px;
	color: #8492a6;
}*/
</style>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.kqsettask {
  padding: 0 20px;
}

.kqsettask .settask_top {
  height: 50px;
  border-bottom: 1px solid #e0e6ed;
}

.kqsettask .settask_main {
  /*margin:8px 0 16px;*/
}

.kqsettask .settask_main .settask_title {
  height: 70px;
}

.kqsettask .settask_main .settask_title h2 {
  float: left;
  line-height: 70px;
  font-size: 16px;
  font-weight: 500;
  font-style: normal;
  color: #475568;
}

/*考勤范围*/
.kqsettask .settask_main .g_m_wrap {
  width: 468px;
  /*height: 36px;*/
  padding: 5px 11px 0;
  border-radius: 1px;
  border: 1px solid #e0e6ed;
  box-sizing: border-box;
  cursor: pointer;
}

.kqsettask .settask_main .el-form-item.is-error.is-required .g_m_wrap {
  border: 1px solid #ff6600;
}

.kqsettask .settask_main .g_m_wrap:after {
  content: "";
  display: block;
  clear: both;
}

.kqsettask .settask_main .g_m_wrap:hover {
  border: 1px solid #c0ccda;
}

.kqsettask .settask_main .add_item {
  float: left;
  height: 24px;
  line-height: 24px;
  font-size: 14px;
  color: #6699ee;
  background: url(../assets/imgs/shareIcon/add_hover.svg) left no-repeat;
  text-indent: 18px;
  cursor: pointer;
}

.kqsettask .settask_main .add_item:active {
  color: #517ed6;
}

.kqsettask .settask_main .g_m_wrap .g_m_item {
  float: left;
  display: flex;
  /*width: 94px;*/
  height: 24px;
  box-sizing: border-box;
  border-radius: 2px;
  background-color: #f3f8ff;
  border: solid 1px #d4e5ff;
  margin: 0 6px 5px 0;
}

.kqsettask .settask_main .g_m_wrap .g_m_item .item_icon {
  width: 26px;
  /*background: url(../assets/imgs/peple_ico.svg)  no-repeat center;*/
  background: url(../assets/imgs/group_ico.svg) no-repeat center;
}

.kqsettask .settask_main .g_m_wrap .g_m_item .item_icon.item_icon_p {
  background: url(../assets/imgs/peple_ico.svg) no-repeat center;
}

.kqsettask .settask_main .g_m_wrap .g_m_item .item_name {
  flex: 1;
  line-height: 24px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  color: #6699ee;
  padding-right: 6px;
}

/*考勤方式*/
.kqsettask .settask_main .kq_type_main {
  position: relative;
  width: 468px;
  /*height: 120px;*/
  background-color: #f7f9fc;
  border-top: 1px solid #e7eef6;
  margin-top: 14px;
}

.kqsettask .settask_main .arrow {
  position: absolute;
  width: 8px;
  height: 8px;
  border: 1px solid transparent;
  border-top: 1px solid #e7eef6;
  border-right: 1px solid #e7eef6;
  background-color: #f7f9fc;
  transform: rotate(-45deg);
  left: 38px;
  top: -5px;
}

.kqsettask .settask_main .kq_type_main .main_title {
  height: 14px;
  line-height: 14px;
  font-size: 14px;
  color: #99a9bf;
  text-indent: 20px;
  margin-top: 26px;
}

.kqsettask .settask_main .kq_type_main .all_timearea {
  padding: 0 20px;
}

.kqsettask .settask_main .kq_type_main .all_timearea .selecttimeinterval {
  height: 68px;
  border-bottom: 1px solid #e8edf2;
  padding: 16px 0;
  box-sizing: border-box;
}

.kqsettask .settask_main .kq_type_main .all_timearea .selecttimeinterval>div {
  float: left;
}

.kqsettask .settask_main .kq_type_main .all_timearea .selecttimeinterval .name {
  width: 54px;
  font-size: 14px;
  color: #5e6d82;
}

.kqsettask .settask_main .kq_type_main .all_timearea .selecttimeinterval .line {
  width: 28px;
  color: #beccda;
  text-align: center;
}

.kqsettask .settask_main .kq_type_main .all_timearea .selecttimeinterval .start,
.kqsettask .settask_main .kq_type_main .all_timearea .selecttimeinterval .end {}

.kqsettask .settask_main .kq_type_main .all_timearea .selecttimeinterval .delate {
  width: 40px;
  height: 36px;
  background: url(../assets/imgs/delate.svg) no-repeat 15px center;
  cursor: pointer;
}

.kqsettask .settask_main .kq_type_main .all_timearea .selecttimeinterval .delate:hover {
  background: url(../assets/imgs/delate_hover.svg) no-repeat 15px center;
}

.kqsettask .settask_main .kq_type_main .all_timearea .selecttimeinterval .delate.undel {
  background: url(../assets/imgs/delate_disabled.svg) no-repeat 15px center;
}

.kqsettask .settask_main .kq_type_main .addtime {
  height: 24px;
  padding: 14px 166px;
  /*cursor: pointer;*/
}

.kqsettask .settask_main .kq_type_main .setworktime {
  height: 36px;
  padding: 16px 20px;
}

/* wifi考勤弹窗 */
.wifi-body {
  width: 100%;
  box-sizing: border-box;
  padding: 20px 10px;
}

.wifi-tips {
  padding-top: 20px;
}

.wifi-body .tips-title {
  font-size: 14px;
  color: #48576a;
  margin-bottom: 8px;
}

.wifi-body .tips {
  font-size: 12px;
  color: #99a9bf;
  line-height: 28px;
  padding-left: 10px;
}

/*考勤日期*/
.kqsettask .settask_main .work_week {
  position: relative;
  width: 468px;
  height: 130px;
  background-color: #f7f9fc;
  border-top: 1px solid #e7eef6;
  margin-top: 22px;
}

.kqsettask .settask_main .work_week .work_week_wrap {
  padding: 24px 0 0 20px;
  box-sizing: border-box;
}

.kqsettask .settask_main .work_week .work_week_wrap:after {
  content: "";
  display: block;
  clear: both;
}

.kqsettask .settask_main .work_week li.week_item {
  position: relative;
  width: 80px;
  height: 35px;
  line-height: 33px;
  background-color: #fff;
  border-radius: 1px;
  border: solid 1px #e0e6ed;
  text-align: center;
  color: #1f2d3d;
  font-size: 14px;
  display: block;
  float: left;
  margin-right: 7px;
  margin-bottom: 16px;
  cursor: pointer;
  box-sizing: border-box;
}

.kqsettask .settask_main .work_week li.week_item:hover {
  color: #6699ee;
  border-color: #6699ee;
}

.kqsettask .settask_main .work_week li.checked {
  border-color: #6699ee;
  color: #6699ee;
}

.kqsettask .settask_main .work_week li.checked:after {
  position: absolute;
  top: 0;
  right: -1px;
  content: "";
  display: block;
  width: 20px;
  height: 20px;
  background: url(../assets/imgs/checkbox_cd.svg) no-repeat;
}

/*考勤地点*/
.kqsettask .settask_main .addr_tip {
  width: 468px;
  font-size: 14px;
  color: #99a9bf;
  margin-bottom: 7px;
}

.kqsettask .settask_main .addr_wrap {
  width: 468px;
  background-color: #f7f9fc;
}

.kqsettask .settask_main .addr_wrap .addrs {
  padding: 0 20px;
  box-sizing: border-box;
  max-height: 312px;
  overflow: auto;
}

.kqsettask .settask_main .addr_wrap .addr_item {
  display: flex;
  height: 52px;
  border-bottom: 1px solid #e8edf2;
  box-sizing: border-box;
}

.kqsettask .settask_main .addr_wrap .addr_item>div {
  line-height: 51px;
}

.kqsettask .settask_main .addr_wrap .addr_item>div.addr_icon {
  width: 25px;
  background: url(../assets/imgs/coor.svg) left center no-repeat;
}

.kqsettask .settask_main .addr_wrap .addr_item>div.addr_name {
  max-width: 373px;
  font-size: 14px;
  color: #1f2d3d;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.kqsettask .settask_main .addr_wrap .addr_item>div.addr_poi {
  flex: 1;
  font-size: 13px;
  color: #5e6d82;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-indent: 10px;
}

.kqsettask .settask_main .addr_wrap .addr_item>div.addr_del {
  width: 30px;
  background: url(../assets/imgs/delate.svg) no-repeat 10px center;
  cursor: pointer;
}

.kqsettask .settask_main .addr_wrap .addr_item>div.addr_del:hover {
  background: url(../assets/imgs/delate_hover.svg) no-repeat 10px center;
}

.kqsettask .settask_main .addr_wrap .add_addr {
  height: 24px;
  padding: 14px 5px;
  display: flex;
  justify-content: center;
  /*cursor: pointer;*/
}

/*考勤地点弹窗*/
.kqsettask .settask_main .select_addr_main {
  padding: 34px 40px 24px;
  border-bottom: 1px solid #e0e6ed;
}

.kqsettask .settask_main .new_addr_main .main_top {
  position: absolute;
  z-index: 999999;
  top: 47px;
  left: 36px;
}

.kqsettask .settask_main .select_addr_main .main_top {
  position: relative;
  margin-bottom: 10px;
}

.kqsettask .settask_main .new_addr_main .main_top>i.el-icon-search,
.kqsettask .settask_main .select_addr_main .main_top>i.el-icon-search {
  position: absolute;
  z-index: 999;
  top: 11px;
  left: 12px;
  font-size: 16px;
  color: #e0e6ed;
}

.kqsettask .settask_main .new_addr_main .main_top .add_item,
.kqsettask .settask_main .select_addr_main .main_top .add_item {
  float: right;
  margin: 6px 2px;
}

.kqsettask .settask_main .select_addr_main .main_table {
  width: 560px;
  /*height: 307px;*/
  box-sizing: border-box;
  border: 1px solid #e0e6ed;
}

.kqsettask .settask_main .select_addr_main .main_table .table_title {
  width: 560px;
  height: 36px;
  box-sizing: border-box;
  border-bottom: 1px solid #e0e6ed;
  background-color: #edeef2;
  display: flex;
}

.kqsettask .settask_main .select_addr_main .main_table .table_title>div {
  line-height: 36px;
  font-size: 12px;
  font-weight: 600;
  color: #475669;
  box-sizing: border-box;
}

.kqsettask .settask_main .select_addr_main .main_table .table_body {
  height: 270px;
  overflow: auto;
}

.kqsettask .settask_main .select_addr_main .main_table .table_body .empty_text {
  line-height: 270px;
  text-align: center;
  font-size: 16px;
  color: #c0ccda;
}

.kqsettask .settask_main .select_addr_main .main_table .table_body .table_item {
  display: flex;
  border-bottom: 1px solid #e0e6ed;
}

.kqsettask .settask_main .select_addr_main .main_table .table_body .table_item>div {
  box-sizing: border-box;
  line-height: 42px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.kqsettask .settask_main .select_addr_main .main_table .table_body .table_item .checkbox {
  width: 40px;
  padding-left: 12px;
}

.kqsettask .settask_main .select_addr_main .main_table .table_body .table_item .pos_name {
  width: 98px;
  padding: 0 17px 0 0;
  font-size: 13px;
  color: #1f2d3d;
}

.kqsettask .settask_main .select_addr_main .main_table .table_body .table_item .pos_addr {
  width: 320px;
  padding: 0 17px;
  font-size: 12px;
  color: #8492a6;
}

.kqsettask .settask_main .select_addr_main .main_table .table_body .table_item .pos_edit {
  width: 100px;
  padding: 0 17px;
}

.kqsettask .settask_main .new_addr_foot,
.kqsettask .settask_main .select_addr_foot {
  height: 68px;
}

.kqsettask .settask_main .new_addr_foot .btns,
.kqsettask .settask_main .select_addr_foot .btns {
  float: right;
  margin: 16px 20px;
}

.kqsettask .settask_main .new_addr_main {
  position: relative;
  padding: 30px 20px 0px;
  border-bottom: 1px solid #e0e6ed;
}

.kqsettask .settask_main .new_addr_main .search_result {
  position: absolute;
  z-index: 999999;
  left: 36px;
  top: 84px;
  width: 312px;
  max-height: 241px;
  background-color: #fff;
  overflow: auto;
  padding-bottom: 8px;
  box-sizing: border-box;
}

.kqsettask .settask_main .new_addr_main .search_result .result_item {
  display: flex;
  height: 32px;
  line-height: 32px;
  padding: 0 28px 0 16px;
  box-sizing: border-box;
  cursor: pointer;
}

.kqsettask .settask_main .new_addr_main .search_result .result_item:hover {
  background-color: #f5f5f5;
}

.kqsettask .settask_main .new_addr_main .search_result .result_item .item_name {
  font-size: 13px;
  color: #1f2d3d;
}

.kqsettask .settask_main .new_addr_main .search_result .result_item .item_addr {
  flex: 1;
  text-indent: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  color: #99a9bf;
}

.kqsettask .settask_main .new_addr_main .map_wrap {
  height: 356px;
  margin-bottom: 16px;
}

.kqsettask .settask_main .new_addr_main .big_small {
  position: absolute;
  z-index: 999;
  right: 36px;
  top: 306px;
  width: 32px;
  height: 64px;
  border-radius: 2px;
  background-color: #ffffff;
  box-shadow: 0 1px 2px 0 rgba(170, 172, 173, 0.5);
  cursor: pointer;
}

.kqsettask .settask_main .new_addr_main .fix_position {
  position: absolute;
  z-index: 999;
  right: 36px;
  top: 258px;
  height: 32px;
  width: 32px;
  background: #fff url(../assets/imgs/position/location.svg) center no-repeat;
  box-shadow: 0 1px 2px 0 rgba(170, 172, 173, 0.5);
  cursor: pointer;
}

.kqsettask .settask_main .new_addr_main .big_small .big {
  height: 31px;
  background: url(../assets/imgs/position/big.svg) center no-repeat;
}

.kqsettask .settask_main .new_addr_main .big_small .small {
  height: 32px;
  background: url(../assets/imgs/position/small.svg) center no-repeat;
}

/*考勤填写项*/

/*考勤通知*/
</style>
