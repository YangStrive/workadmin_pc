<template>
  <div class="customized-scheduling">
    <div class="kqeditpb_top">
      <breadcrumb>
        <router-link to="kqaddmin" replace>考勤管理</router-link>
        <router-link to="kqtasklist" replace>考勤规则管理</router-link>
        <router-link to="">排班</router-link>
      </breadcrumb>
    </div>
    <div class="kqeditpb_main" v-loading="load_end">
      <div class="kqpb_title">
        <h2>排班日历</h2>
      </div>
      <div class="kqpb_sel">
        <div class="sel_item">
          <span>工作日期</span>
          <el-date-picker
            v-model="kq_week_obj"
            :clearable="false"
            type="week"
            format="yyyy第WW周"
            placeholder="当前周"
            :picker-options="picker_options"
            @change="handleWeekChange"
            style="width: 137px"
          ></el-date-picker>
        </div>
      </div>

      <!-- 班次说明-->
      <div class="schuedle-operate">
        <div class="operate-selected">
          <div class="select-text">
            <span v-if="selectedSchedulingNum == 0">选择格子</span>
            <span v-else>已选择 {{ selectedSchedulingNum }} 个</span>
            <span>，为其排班</span>
          </div>
          <div class="selected-schedlu-info"  v-if="currentSelectedSchedule.schedule_id" :class="['colorblock_item_' + currentSelectedSchedule.style]">
            <p>{{currentSelectedSchedule.schedule_name}}</p>
            <p>{{currentSelectedSchedule.start_time}}-{{ currentSelectedSchedule.start_time }}</p>
          </div>
          <div class="set-schuedle-btn" >
            <el-button type="primary" size="mini" @click="handleClickSchedulingSelect" v-if="!currentSelectedSchedule.schedule_id">选择班次</el-button>
            <el-button type="primary" size="mini" @click="handleClickSchedulingSwitch" v-if="currentSelectedSchedule.schedule_id">切换班次</el-button>

          </div>
        </div>
        <div class="operate_btn">
          <el-button type="primary" size="mini" @click="handleScheduleDataCancel">取消</el-button>
          <el-button type="primary" size="mini">保存</el-button>
        </div>  
      </div>
      <!--排班table-->
      <div class="pb_edit_table">
        <el-table
          :border="true"
          @cell-click="handleCellClick"
          @header-click="handleHeaderClick"
          :data="schedulingList"
          style="width: 100%"
        >
          <el-table-column prop="user_name" label="姓名" width="80">
          </el-table-column>
          <el-table-column
            v-for="(item, index) in schedulingTableHeader"
            :prop="item.key"
            :key="index"
            :label="item.date + ' ' + item.day"
            min-width="101"
          >
            <template slot-scope="scope">
              <template v-if="scope.row[item.key].disabled">
                <div class="cell-schedule-box cell-disable">
                  <div  v-for="(sitem,index) in scope.row[item.key].scheduleList" :key="index">
                    <p>{{sitem.schedule_name }}</p>
                    <p v-if="sitem.start_time">工作时间{{sitem.start_time }}-{{ sitem.end_time }}</p>
                    <p v-if="sitem.work_hours">工作时长{{ sitem.work_hours }}</p>
                  </div>
                </div>
              </template>
              <template v-else>
                <div class="cell-schedule-box" :class="[scope.row[item.key].currentCellSelected ? 'select-border-style' : '','colorblock_item_'+scope.row[item.key].style]" >
                  <div  v-for="(sitem,index) in scope.row[item.key].scheduleList" :key="index">
                    <p>{{sitem.schedule_name }}</p>
                    <p v-if="sitem.start_time">工作时间{{sitem.start_time }}-{{ sitem.end_time }}</p>
                    <p v-if="sitem.work_hours">工作时长{{ sitem.work_hours }}</p>
                  </div>
                </div>
              </template>
            </template>
          </el-table-column>
        </el-table>
        <!-- 设置编辑弹窗内容 -->
      </div>
    </div>
  </div>
</template>

<script>
// 这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
// 例如：import 《组件名称》 from '《组件路径》'

import breadcrumb from "@/components/common/breadcrumb";
import * as util from "@/assets/js/util.js";

export default {
  components: {
    breadcrumb,
  },
  data () {
    return {
      weekFirstDate:"",
      team_id: "",
      project_id: "",
      task_id: "",
      load_end: true,
      kq_week_obj: new Date().getTime(), //选择的日期对象-周
      picker_options: {
        //选择时间控件 选项
        firstDayOfWeek: 1,
      },
      showSchedulingBtn: false, //是否显示排班按钮
      schedulingList:[],//排班所有数据
      schedulingTableHeader: [],//排班表头

      drawerVisibility: false,
      showSchedulingBtn:false,
      activeScheduleName: "first",

      //临时班次


      currentSelectedSchedule: {
      },

      //临时存放选中的班次
      temporaryStorage:{}

    }
  },
  // 监听属性 类似于data概念
  computed: {
    selectedSchedulingNum() {
      //计算已选择的班次数量
      let num = 0;
      this.schedulingList.forEach((item) => {
        for (let key in item) {
          if (item[key].currentCellSelected) {
            num++;
          }
        }
      });
      return num;
    },
  },
  // 监控data中的数据变化
  watch: {},
  // 生命周期 - 创建完成（可以访问当前this实例）
  created () {
      //获取用户信息
    this.team_id = util.getLocalStorage("projectStorageInfo").team_id;
    this.project_id = util.getLocalStorage("projectStorageInfo").project_id;
    this.task_id = util.getLocalStorage("kqpb_task_id");
    this.schedulingTableHeader = util.getWeekDates()
    
  },
  // 生命周期 - 挂载完成（可以访问DOM元素）
  mounted () {

    this.init();
  },
  methods: {
    //初始化
    init() {
      this.getCurrentWeekFirstDate();
      let m = this.getAllSchedulingList();
    },

    //获取当前周的周一日期
    getCurrentWeekFirstDate(){
      let week_day = new Date().getDay();
      let sun = util.getLocalTime(
        new Date().getTime() -
          (week_day == 0 ? 6 : week_day - 1) * 24 * 60 * 60 * 1000,
        "yyyy-MM-dd"
      );
      // console.log(sun)
      this.weekFirstDate = sun;
    },

    handleWeekChange(val) {
      //val为输入框显示内容
      this.weekFirstDate = util.getLocalTime(
        this.kq_week_obj.getTime() - 24 * 60 * 60 * 1000,
        "yyyy-MM-dd"
      );
      this.end_date = util.getLocalTime(
        this.kq_week_obj.getTime() + 5 * 24 * 60 * 60 * 1000,
        "yyyy-MM-dd"
      );
      //this.getAllSchedulingList();
      this.schedulingTableHeader = util.getWeekDates(this.weekFirstDate)
    },



    // 点击排班按钮
    handleClickSchedulingSelect() {
      console.log("点击排班");
      this.drawerVisibility = true;
    },

    handleClickSchedulingSwitch(){
      console.log("点击切换班次");
      this.drawerVisibility = true;
    },

    //点击单元格
    handleCellClick(row, column, cell, event){
      let columnProperty = column.property;
      let rowProperty = row.user_id;
      let scheduleList = this.schedulingList;
      let currentSelectedSchedule = this.currentSelectedSchedule;

      if(row[columnProperty].scheduleList.length > 0 && !row[columnProperty].currentCellSelected){
        console.log('编辑单个人排班')
        return false;
      }

      console.log(column)
      for(let i = 0; i < scheduleList.length; i++){

        //点击单元格数据为当前用户的数据
        if(scheduleList[i].user_id == rowProperty){
          //过期的排班不可编辑
          if(scheduleList[i][columnProperty].disabled) return;

          //点击已有排班，切换班次
          scheduleList[i][columnProperty].currentCellSelected = !scheduleList[i][columnProperty].currentCellSelected;
          if(currentSelectedSchedule.schedule_id && scheduleList[i][columnProperty].currentCellSelected){
            scheduleList[i][columnProperty].scheduleList = [currentSelectedSchedule];
            scheduleList[i][columnProperty].style = currentSelectedSchedule.style;
          }

          if(!scheduleList[i][columnProperty].currentCellSelected){
            scheduleList[i][columnProperty].scheduleList = [];
            scheduleList[i][columnProperty].style = "";
          }

          break;
        }
      }
    },

    handleHeaderClick(){

    },

    //获取所有人的排班信息
    async getAllSchedulingList() {
      try {
        let res = await util.ajaxPromise(
        { 
          url: "/attendance/user_schedule",
          type: "GET",
          data: {
            team_id: this.team_id,
            project_id: this.project_id,
            task_id: this.task_id,
            start_date: this.weekFirstDate,
            group_ids: this.group_ids,
            user_ids: this.user_ids,
          }
        });

        if(res.errno == 0 ){
          let scheduleData = [];
          let currnetTimer = (new Date().getTime())/1000;
          res.data.forEach((item) => {
            let obj = {
              user_id: item.user_id,
              user_name: item.user_name,
            };

            for (let i = 0; i < 7; i++) {
              obj['day'+(i+1)] = {
                currentCellSelected: false,
                scheduleList: item['date_schedule'][i].schedule,
                disabled: item['date_schedule'][i].date + 86400  < currnetTimer ? true : false,//
              };
            }
            scheduleData.push(obj);
          });

          this.schedulingList = scheduleData;
          console.log(this.schedulingList,999);
        }
      } catch (error) {
        throw error
      } finally {
        this.load_end = false;
      }
    },

    handleScheduleDataCancel(){
      this.getAllSchedulingList();
    }
  }
  //beforeCreate () { }, // 生命周期 - 创建之前
  //beforeMount () { }, // 生命周期 - 挂载之前
  //beforeUpdate () { }, // 生命周期 - 更新之前
  //updated () { }, // 生命周期 - 更新之后
  //beforeDestroy () { }, // 生命周期 - 销毁之前
  //destroyed () { }, // 生命周期 - 销毁完成
  //activated () { }, // 如果页面有keep-alive缓存功能，这个函数会触发
  // 方法集合
}
</script>

<style src="./index.css"></style>
