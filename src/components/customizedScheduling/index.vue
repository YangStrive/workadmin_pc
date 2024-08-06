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
          <div class="selected-schedlu-info"  v-if="currentSelectedSchedule.scheduleId">
            <p>固定A班次</p>
            <p>9:00-18:00</p>
          </div>
          <div class="set-schuedle-btn" >
            <el-button type="primary" size="mini" @click="handleClickSchedulingSelect" v-if="!currentSelectedSchedule.scheduleId">选择班次</el-button>
            <el-button type="primary" size="mini" @click="handleClickSchedulingSwitch" v-if="currentSelectedSchedule.scheduleId">切换班次</el-button>

          </div>
        </div>
        <div class="operate_btn">
          <el-button type="primary" size="mini">取消</el-button>
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
                <div class="cell-schedule-box cell-disable" >
                  <p>{{scope.row[item.key].scheduleName }}</p>
                  <p>{{scope.row[item.key].scheduleInfo }}</p>
                </div>
              </template>
              <template v-else>
                <div class="cell-schedule-box" :class="[scope.row[item.key].currentCellSelected ? 'select-border-style' : '']" >
                  <p>{{scope.row[item.key].scheduleName }}</p>
                  <p>{{scope.row[item.key].scheduleInfo }}</p>
                </div>
              </template>
            </template>
          </el-table-column>
        </el-table>
        <!-- 设置编辑弹窗内容 -->
      </div>
    </div>
    <el-dialog
      title="排班"
      size="tiny"
      :visible.sync="drawerVisibility"
      :before-close="handleDrawerBeforeClose">
      <div class="dialog-schedule-main">
        <el-tabs v-model="activeScheduleName" @tab-click="handleScheduleTabsClick">
          <el-tab-pane label="固定班次" name="first"></el-tab-pane>
          <el-tab-pane label="临时班次" name="second"></el-tab-pane>
        </el-tabs>
        <div class="schedule-box">
          <div class="schedule-box-item" v-if="activeScheduleName == 'first'">
            <div class="schedule-list-box">
              <h3>当日班次</h3>
              <ul class="schedule-list">
                <li
                  class="schedule-item"
                  v-for="(item, index) in fixedSchedules"
                  :key="index"
                  @click="handleScheduleItemClick(item)"
                >
                  <div class="colorblock" :class="'colorblock_item_' + item.style">
                    <p>{{ item.name }}</p>
                    <p>{{ item.start_time }} - {{ item.end_time }}</p>
                    <p>工作时间：{{ item.work_hours }}</p>
                  </div>
                </li>
              </ul>

            </div>
          </div>
          <div class="schedule-box-item" v-else>
            <el-form  label-width="80px" :model="temporarySchedule">
              <el-form-item label="工作时间">
                <div class="work-time-picker" v-for="(item, index) in temporarySchedule.workTimeStartList" :key="index">
                  <el-time-picker
                    size="small"
                    format="HH:mm"
                    v-model="temporarySchedule.workTimeStartList[index].workTimeStart"
                    :picker-options="{
                      selectableRange: '18:30:00 - 20:30:00'
                    }"
                    placeholder="请选择">
                  </el-time-picker>
                  <span class="time-picker-c">至</span>  
                  <el-time-picker
                    size="small"
                    format="HH:mm"
                    v-model="temporarySchedule.workTimeStartList[index].workTimeEnd"
                    :picker-options="{
                      selectableRange: '18:30:00 - 20:30:00'
                    }"
                    placeholder="任意时间点">
                  </el-time-picker>
                  <div class="dialog-delete-btn" @click="handleDeleteWorkTime(index)" v-if="temporarySchedule.workTimeStartList.length > 1">
                    <i class="el-icon-close" ></i>
                  </div>
                </div>
                <el-button type="text" @click="handleAddWorkTime">添加</el-button>
              </el-form-item>
              <template v-if="temporarySchedule.workTimeStartList.length == 1">
                <el-form-item label="休息时间">
                  <el-radio class="radio" v-model="temporarySchedule.rest" label="1">启用</el-radio>
                  <el-radio class="radio" v-model="temporarySchedule.rest" label="2">不起用</el-radio>
                </el-form-item>
                <el-form-item label="" v-if="temporarySchedule.rest == 1">   
                  <div class="rest-time-picker">
                    <el-time-picker
                      size="small"
                      format="HH:mm"
                      v-model="temporarySchedule.restTimeStart"
                      :picker-options="{
                        selectableRange: '18:30:00 - 20:30:00'
                      }"
                      placeholder="任意时间点">
                    </el-time-picker>
                    <span class="time-picker-c">至</span> 
                    <el-time-picker
                      size="small"
                      format="HH:mm"
                      v-model="temporarySchedule.restTimeEnd"
                      :picker-options="{
                        selectableRange: '18:30:00 - 20:30:00'
                      }"
                      placeholder="任意时间点">
                    </el-time-picker>
                  </div>
                </el-form-item>
              </template>
            </el-form>
          </div>
        </div>
        <div class="doalig-footer">
          <el-button @click="handleDrawerClose">取消</el-button>
          <el-button type="primary" class="save-btn" @click="handleSaveSchedule">保存</el-button>
        </div>
      </div>
    </el-dialog>
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
      schedulingList:[],
      schedulingTableHeader: [],

      drawerVisibility: false,
      showSchedulingBtn:false,
      activeScheduleName: "first",

      //临时班次
      temporarySchedule: {
        time: "",
        rest: "1",
        restTimeStart: "",
        restTimeStartEnd: "",
        workTimeStartList:[
          {
            workTimeStart:"",
            workTImeEnd: "",
          }
        ],
        
      },


      currentSchedulingData: {
        schedule: [],
      },

      currentSelectedSchedule: {
        scheduleId: 0,
        scheduleName: "A",
        scheduleStyle: "",
        scheduleInfo: "9:00 - 18:00",
      },

      selectedScheduleInfo:{
        type:1,//1固定 2临时
        schedule:{
          scheduleId: 0,
          scheduleName: "A",
          scheduleStyle: "",
          scheduleInfo: "9:00 - 18:00",
        },
      },
      fixedSchedules:[
        {
            "id": "1899",
            "name": "A",
            "start_time": "07:00",
            "end_time": "10:00",
            "cross": 0,
            "type": "1",
            "rest_start_time": "",
            "rest_end_time": "",
            "work_hours": 3
        },
        {
            "id": "1900",
            "name": "B",
            "start_time": "10:00",
            "end_time": "16:00",
            "cross": 0,
            "type": "1",
            "rest_start_time": "",
            "rest_end_time": "",
            "work_hours": 6
        },
        {
            "id": "1901",
            "name": "C",
            "start_time": "16:00",
            "end_time": "22:00",
            "cross": 0,
            "type": "1",
            "rest_start_time": "",
            "rest_end_time": "",
            "work_hours": 6
        }
      ],
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
    setTimeout(() => {
      
      this.load_end = false;
    }, 1000);

    this.init();
  },
  methods: {
    //初始化
    init() {
      let m = this.getAllSchedulingList();
    },

    handleWeekChange(val) {
      //val为输入框显示内容
      this.start_date = util.getLocalTime(
        this.kq_week_obj.getTime() - 24 * 60 * 60 * 1000,
        "yyyy-MM-dd"
      );
      this.end_date = util.getLocalTime(
        this.kq_week_obj.getTime() + 5 * 24 * 60 * 60 * 1000,
        "yyyy-MM-dd"
      );
      //this.getAllSchedulingList();
      this.schedulingTableHeader = util.getWeekDates(this.start_date)
    },

    //班次设置保存
     handleSaveSchedule(){
      console.log("班次设置保存");
      console.log(this.temporarySchedule);
      console.log(this.activeScheduleName);
    },

    //排班添加工作时间
    handleAddWorkTime(){
      this.temporarySchedule.workTimeStartList.push({
        workTimeStart:"",
        workTimeEnd: "",
      })
    },

    //排班删除工作时间
    handleDeleteWorkTime(index){
      this.temporarySchedule.workTimeStartList.splice(index, 1);
    },

    //切换排班固定班次和临时班次
    handleScheduleTabsClick(tab) {
      this.activeScheduleName = tab.name;
    },

    //before close 排班弹窗
    handleDrawerBeforeClose(done) {
      this.drawerVisibility = false;
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

    // 点击排班弹框中的班次
    handleScheduleItemClick(item) {
      console.log("点击排班弹框中的班次", item);
      //this.currentSchedulingData.schedule = [item];
      //this.drawerVisibility = false;
    },



    handleCellClick(row, column, cell, event){
      let columnProperty = column.property;
      let rowProperty = row.user_id;
      this.schedulingList.forEach((item) => {
        if (item.user_id == rowProperty) {
          item[columnProperty].currentCellSelected = !item[columnProperty].currentCellSelected;
        }
      });

      //this.showSchedulingBtn = true;
    },

    handleHeaderClick(){

    },

    //获取所有人的排班信息
    async getAllSchedulingList() {
      try {
      let res = await util.ajaxPromise(
        { url: "/attendance/user_schedule",
          type: "GET",
          data: {
            team_id: this.team_id,
            project_id: this.project_id,
            task_id: this.task_id,
            start_date: this.start_date,
            group_ids: this.group_ids,
            user_ids: this.user_ids,
          }})
      },

      if(res.code == 0 ){
        let data = res.data;
        let schedulingList = [];
        
        this.schedulingList
      }
      } catch (error) {
        
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
