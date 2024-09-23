<template>
<el-dialog
  :visible.sync="visable"
  title="考勤确认"
  :before-close="handleClickBeforeClose">
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
  </el-dialog>
</template>

<script>
import * as util from "@/assets/js/util.js";

export default {
  name: "kqconfirminfo",
  props: {
    dialogKqConfirmVisible: {
      type: Boolean,
      default: false,
    },
    closeDialog: {
      type: Function,
      default: () => {},
    },
    kqConfirmTaskId: {
      type: Number,
      default: 0,
    },
    kqConfirmUserId: {
      type: Number,
      default: 0,
    },
    kqConfirmDate: {
      type: String,
      default: "",
    },
  },
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
    };
  },
  computed: {
    visable: {
      get () {
        if(this.dialogKqConfirmVisible) {
          this.init();
        }
        return this.dialogKqConfirmVisible
      },
      set (val) {
        this.$emit('update:dialogExportVisible', val)
      }
    }
  },
  watch: {
  },
  methods: {
    init() {
      //获取用户信息
      this.team_id = util.getLocalStorage("projectStorageInfo").team_id;
      this.project_id = util.getLocalStorage("projectStorageInfo").project_id;
      this.task_id = this.kqConfirmTaskId;
      this.user_id = this.kqConfirmUserId;
      this.getAttendanceInfo(this.kqConfirmDate);
    },
    GetQueryString(name) {
      var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
      var r = ('?' + window.location.href.split('?')[1]).substr(1).match(reg);
      if (r != null) return unescape(r[2]);
      return null;
    },
    getAttendanceInfo(date) {
      let task_id = this.kqConfirmTaskId
      util.ajax({
        url: "/attendance/detail",
        type: "GET",
        data: {
          user_id: this.user_id,
          team_id: this.team_id,
          project_id: this.project_id,
          task_id: this.task_id,
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
          }else {
            this.$message({
              type: 'error',
              message:res.errmsg
            });
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
      },

      handleClickBeforeClose(done) {
        done();
        this.closeDialog();
      },
  },
  //删除固定时段/班次
  mounted () {
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
<style scoped>
/*考勤方式*/
.kq_type_main {
  position: relative;
  width: 468px;
  /*height: 120px;*/
  background-color: #f7f9fc;
  border-top: 1px solid #e7eef6;
  margin-top: 14px;
}

.arrow {
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

.kq_type_main .main_title {
  height: 14px;
  line-height: 14px;
  font-size: 14px;
  color: #99a9bf;
  text-indent: 20px;
  margin-top: 26px;
}

.kq_type_main .all_timearea {
  padding: 0 20px;
}

.kq_type_main .all_timearea .selecttimeinterval {
  height: 68px;
  border-bottom: 1px solid #e8edf2;
  padding: 16px 0;
  box-sizing: border-box;
}

.kq_type_main .all_timearea .selecttimeinterval>div {
  float: left;
}

.kq_type_main .all_timearea .selecttimeinterval .name {
  width: 54px;
  font-size: 14px;
  color: #5e6d82;
}

.kq_type_main .all_timearea .selecttimeinterval .line {
  width: 28px;
  color: #beccda;
  text-align: center;
}

.kq_type_main .all_timearea .selecttimeinterval .start,
.kq_type_main .all_timearea .selecttimeinterval .end {}

.kq_type_main .all_timearea .selecttimeinterval .delate {
  width: 40px;
  height: 36px;
  background: url(../../../assets/imgs/delate.svg) no-repeat 15px center;
  cursor: pointer;
}

.kq_type_main .all_timearea .selecttimeinterval .delate:hover {
  background: url(../../../assets/imgs/delate_hover.svg) no-repeat 15px center;
}

.kq_type_main .all_timearea .selecttimeinterval .delate.undel {
  background: url(../../../assets/imgs/delate_disabled.svg) no-repeat 15px center;
}

.kq_type_main .addtime {
  height: 24px;
  padding: 14px 166px;
  /*cursor: pointer;*/
}

.kq_type_main .setworktime {
  height: 36px;
  padding: 16px 20px;
}
</style>
