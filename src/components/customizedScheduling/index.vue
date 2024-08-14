<template>
  <div class="customized-scheduling">
    <div class="kqeditpb_top">
      <breadcrumb>
        <router-link to="kqaddmin" replace>考勤管理</router-link>
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
      <div class="schuedle-operate" v-if="!deteleStatus">
        <div class="operate-selected">
          <div class="select-text">
            <span v-if="selectedSchedulingNum == 0">选择格子</span>
            <span v-else>已选择 {{ selectedSchedulingNum }} 个</span>
            <span>，为其排班</span>
          </div>
          <template v-if="currentSelectedSchedule.length != 0">
            <div 
              class="selected-schedlu-info"  
              v-for="(item,index) in currentSelectedSchedule"
              :key="index"
              :class="['colorblock_item_' + item.schedule_name]">
              <p>{{item.schedule_name}}</p>
              <p>{{item.start_time}}-{{ item.start_time }}</p>
            </div>
          </template>
          <div class="set-schuedle-btn" >
            <el-button type="primary" size="mini" @click="handleClickSchedulingSelect" v-if="currentSelectedSchedule.length == 0">选择班次</el-button>
            <el-button type="primary" size="mini" @click="handleClickSchedulingSwitch" v-if="currentSelectedSchedule.length != 0">切换班次</el-button>

          </div>
        </div>
        <div class="operate_btn">
          <el-button type="primary" v-if="selectedSchedulingNum != 0" size="mini" @click="handleScheduleDataCancel">取消</el-button>
          <el-button type="primary" v-if="selectedSchedulingNum != 0" size="mini" @click="handleScheduleDataSave">保存</el-button>
          <el-button v-if="selectedSchedulingNum == 0" type="primary" size="mini" @click="handleScheduleDataDetele">删除排班</el-button>
        </div>  
      </div>

      <!--删除按钮-->
      <div class="delete-schedule-btn" v-if="deteleStatus">
        <div class="detele-info">
          <p>选择格子，点击批量删除进行删除。 已选择{{ selectedSchedulingNum }} 个格子</p>
        </div>
        <div class="detele-btn">
          <el-button type="primary" size="mini" @click="handleScheduleDataDeteleCancel">取消</el-button>
          <el-button type="primary" size="mini" @click="handleDeleteSelectedSchedule">批量删除</el-button>
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
                  <div  v-for="(sitem,index) in scope.row[item.key].scheduleList" :key="index" class="schedule-list-item">
                    <p v-if="activeScheduleName == 'fixed'">{{sitem.schedule_name }}</p>
                    <p v-if="sitem.start_time">{{sitem.start_time }}-{{ sitem.end_time }}</p>
                    <p v-if="sitem.rest_start_time">{{sitem.rest_start_time }}-{{ sitem.rest_end_time }} 休息</p>
                    <p v-if="sitem.work_hours">{{ sitem.work_hours }}</p>
                  </div>
                </div>
              </template>
              <template v-else>
                <div class="cell-schedule-box" :class="[scope.row[item.key].currentCellSelected ? 'select-border-style' : '','colorblock_item_'+scope.row[item.key].style]" >
                  <div  v-for="(sitem,index) in scope.row[item.key].scheduleList" :key="index" class="schedule-list-item">
                    <p v-if="currentSelectedSchedule.length == 1">{{sitem.schedule_name }}</p>
                    <p v-if="sitem.start_time">{{sitem.start_time }}-{{ sitem.end_time }}</p>
                    <p v-if="sitem.rest_start_time">{{sitem.rest_start_time }}-{{ sitem.rest_end_time }} 休息</p>
                    <p v-if="sitem.work_hours">{{ sitem.work_hours }}</p>
                  </div>
                </div>
              </template>
            </template>
          </el-table-column>
        </el-table>
        <!-- 设置编辑弹窗内容 -->
      </div>
    </div>
    <ScheduleDialog
      :closeDialog="updateDrawerVisibility"
      :saveScheduleData="handleSaveScheduleData"
      :scheduleType="activeScheduleName"
      :drawerVisibility="drawerVisibility"
    />
    <ScheduleDialog
    />
    <ScheduleDialogEdit
      :closeDialog="handleEditDialogVisible"
      :saveScheduleData="handleEditSaveScheduleData"
      :drawerVisibility="drawerEditVisibility"
      :task_id="task_id"
      :project_id="project_id"
      :team_id="team_id"
      :start_date="weekFirstDate"
      :editInfo="editInfo"
    />

    <el-dialog
      title="排班详情"
      :visible.sync="scheduleDetailDialogVisible"
		  size="tiny"
      center>
      <div class="schedule-detail">
        <div class="schedule-detail-item">
          <span>姓名：</span>
          <span>{{scheduleDetail.user_name}}</span>
        </div>
        <div class="schedule-detail-item">
          <span>排班日期：</span>
          <span>{{scheduleDetail.dateString}} 星期{{ scheduleDetail.day }}</span>
        </div>
        <div>
          <h3 class="schedule-detail-item-title">班次信息 
            <button type="button" class="el-button el-button--primary el-button--mini" @click="handleScheduleDetailEditBtn">修改班次</button>
          </h3>
        </div>
        <div class="schedule-detail-item-main" v-for="(item,index) in scheduleDetail.scheduleList" :key="index">
          <div class="schedule-detail-item">
            <span>班次名称：</span>
            <span >{{item.schedule_name}}</span>
          </div>
          <div class="schedule-detail-item" v-if="item.start_time">
            <span>上班时间：</span>
            <span>{{item.start_time}}-{{item.end_time}}</span>
          </div>
          <div class="schedule-detail-item" v-if="item.rest_start_time">
            <span>休息时间：</span>
            <span>{{item.rest_start_time}}-{{item.rest_end_time}}</span>
          </div>
          <div class="schedule-detail-item" v-if="item.work_hours">
            <span>工作时长：</span>
            <span>{{item.work_hours}}</span>
          </div>
        </div>
        
      </div>
    </el-dialog>
  </div>
</template>

<script>
// 这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
// 例如：import 《组件名称》 from '《组件路径》'

import breadcrumb from "@/components/common/breadcrumb";
import ScheduleDialog from "./components/ScheduleDialog"
import ScheduleDialogEdit from "./components/ScheduleDialogEdit"
import * as util from "@/assets/js/util.js";

export default {
  components: {
    breadcrumb,
    ScheduleDialog,
    ScheduleDialogEdit
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
      activeScheduleName: "fixed",//当前选中的班次类型
      currentSelectedSchedule:[],
      drawerEditVisibility: false,
      scheduleType: "fixed",
      currentCellSchedule:{},
      editUseColumn: "",
      deteleStatus: false,//是否进入删除状态 
      scheduleDetailDialogVisible: false,
      scheduleDetail: {
        user_name: "",
        schedule_list: [],
        dateString: "",
        day: "",
      },
      editInfo: {
        user_ids: "",
        date: "",
      },
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
    this.task_id = window.localStorage.getItem("schedule_task_id");
    this.schedulingTableHeader = util.getWeekDates()
    
  },
  // 生命周期 - 挂载完成（可以访问DOM元素）
  mounted () {

    this.init();
  },
  methods: {
    //初始化
    async init() {
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
      this.getAllSchedulingList();
      this.schedulingTableHeader = util.getWeekDates(this.weekFirstDate)
    },

    //班次设置保存
		handleSaveScheduleData(data,type){
      this.activeScheduleName = type;
      if(this.activeScheduleName == "fixed"){
        console.log("保存固定班次设置",data);
        this.currentSelectedSchedule = [data];
      }else{
        this.currentSelectedSchedule = data;
      }

      let scheduleList = this.schedulingList;
      //遍历scheduleList 将currentCellSelected为true的班次设置为当前选择的班次
      for(let i = 0; i < scheduleList.length; i++){
        for(let key in scheduleList[i]){
          if(scheduleList[i][key].currentCellSelected){
            scheduleList[i][key].scheduleList = this.currentSelectedSchedule;
            scheduleList[i][key].style = data.style;
          }
        }
      }

      this.scheduleList = scheduleList;
    },

    //保存编辑班次设置
    handleEditSaveScheduleData(data,type){
      let schedule = type == "fixed" ? [data] : data;
      let scheduleList = this.schedulingList;
      //找到当前编辑的用户，将编辑的班次设置为当前选择的班次，根据editInfo中的user_id和date
      for(let i = 0; i < scheduleList.length; i++){
        if(scheduleList[i].user_id == this.editInfo.user_ids){
          for(let key in scheduleList[i]){
            if(scheduleList[i][key].date == this.editInfo.date){
              scheduleList[i][key].scheduleList = schedule;
              scheduleList[i][key].style = data.style;
              scheduleList[i][key].currentCellSelected = false;
              break;
            }
          }
        }
      }

      this.scheduleList = scheduleList;
      this.scheduleDetailDialogVisible = false;

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

      //过期的排班不可编辑
      if(row[columnProperty].disabled) return;
      if(this.deteleStatus){
        this.deleteScheduleReferClickCell(row, column, cell, event);
        return false;
      }else{
        this.setScheduleReferClickCell(row, column, cell, event);
      }
    },

    setScheduleReferClickCell(row, column, cell, event){
      let columnProperty = column.property;
      let userId = row.user_id;
      let scheduleList = this.schedulingList;
      let currentSelectedSchedule = this.currentSelectedSchedule;

      if(row[columnProperty].scheduleList.length > 0 && !row[columnProperty].currentCellSelected){
        this.scheduleDetailDialogVisible = true;
        this.scheduleDetail.scheduleList = row[columnProperty].scheduleList;
        this.scheduleDetail.user_name = row.user_name;
        this.scheduleDetail.dateString = util.getLocalTime(row[columnProperty].date *1000, "yyyy-MM-dd");
        this.scheduleDetail.day = column.label.split(" ")[1];

        this.editInfo = {
          user_ids: userId,
          date: row[columnProperty].date,
        };

        return false;
      }

      console.log(column)
      for(let i = 0; i < scheduleList.length; i++){

        //点击单元格数据为当前用户的数据
        if(scheduleList[i].user_id == userId){

          //点击已有排班，切换班次
          scheduleList[i][columnProperty].currentCellSelected = !scheduleList[i][columnProperty].currentCellSelected;
          if(currentSelectedSchedule.length != 0 && scheduleList[i][columnProperty].currentCellSelected){
            scheduleList[i][columnProperty].scheduleList = currentSelectedSchedule;
            scheduleList[i][columnProperty].style = currentSelectedSchedule[0].style;
          }

          if(!scheduleList[i][columnProperty].currentCellSelected){
            scheduleList[i][columnProperty].scheduleList = [];
            scheduleList[i][columnProperty].style = "";
          }

          break;
        }
      }
    },

    deleteScheduleReferClickCell(row, column, cell, event){
      let columnProperty = column.property;
      if( row[columnProperty].scheduleList.length > 0){
        row[columnProperty].currentCellSelected = !row[columnProperty].currentCellSelected;
        return false;
      }

    },

    handleHeaderClick(){

    },

    //获取所有人的排班信息
    async getAllSchedulingList() {
      try {
        let res = await util.ajaxPromise(
        { 
          url: "/attendance/user_schedule2",
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
                date: item['date_schedule'][i].date,
              };
              if(item['date_schedule'][i].schedule[0]){
                obj['day'+(i+1)].style = item['date_schedule'][i].schedule[0].schedule_name;
              }
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
    },

    updateDrawerVisibility(val){
      console.log(val);
      this.drawerVisibility = val;
    },

    handleEditDialogVisible(val){
      this.drawerEditVisibility = val;
    },

    handleScheduleDataSave(){
      //遍历scheduleList,新生成一个数组，格式如下[{user_id:'11',date:'123233323',schedule_ids:[1,2,3,4],position_id:''}]
      let setCellNum = 0;
      let scheduleData = [];
      this.schedulingList.forEach((item) => {
        for(let key in item){
          if(item[key].currentCellSelected){
            let obj = {
              user_id: item.user_id,
              date: item[key].date,
              schedule_ids: [],
              position_id: "0",
            };

            item[key].scheduleList.forEach((sitem) => {
              setCellNum++;
              obj.schedule_ids.push(sitem.schedule_id);
            });
            obj.schedule_ids = obj.schedule_ids.join(",");
            scheduleData.push(obj);
          }
        }
      });

      if(setCellNum == 0){
        this.$message({
          message: "未设置排班",
          type: "warning",
        });
        return false;
      }
      
      if(scheduleData.length == 0){
        this.$message({
          message: "未进行排班操作",
          type: "warning",
        });
        return false;
      }
      this.$confirm("修改后，今日及未发生的考勤将按照新规则处理", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
      }).then(() => {
        this.saveScheduleData(scheduleData);
      }); 
    },

    async saveScheduleData(scheduleData){
      try {
        let res = await util.ajaxPromise(
        { 
          url: "/attendance/user_schedule/set",
          type: "POST",
          data: {
            team_id: this.team_id,
            project_id: this.project_id,
            task_id: this.task_id,
            date_schedule: scheduleData,
          }
        });

        if(res.errno == 0 ){
          this.$message({
            message: "保存成功",
            type: "success",
          });
          this.getAllSchedulingList();
        }
      } catch (error) {
        
      }
    },

    handleScheduleDataDetele(){
      console.log("删除排班");
      this.deteleStatus = true;
    },

    handleDeleteSelectedSchedule(){
      console.log("批量删除排班");
      let scheduleData = [];
      this.schedulingList.forEach((item) => {
        for(let key in item){
          if(item[key].currentCellSelected){
            let obj = {
              user_id: item.user_id,
              choose_date: item[key].date,
            };

            scheduleData.push(obj);
          }
        }
      });

      if(scheduleData.length == 0){
        this.$message({
          message: "未选择排班数据",
          type: "warning",
        });
        return false;
      }

      this.$confirm("确定删除选中的排班数据吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
      }).then(() => {
        this.deleteSelectedSchedule(scheduleData);
      });
    },

    async deleteSelectedSchedule(scheduleData){
      try {
        let res = await util.ajaxPromise(
        { 
          url: "/attendance/del_schedule_user",
          type: "POST",
          data: {
            team_id: this.team_id,
            project_id: this.project_id,
            task_id: this.task_id,
            date_schedule: scheduleData,
          }
        });

        if(res.errno == 0 ){
          this.$message({
            message: "删除成功",
            type: "success",
          });
          this.deteleStatus = false;
          this.getAllSchedulingList();
        }
      } catch (error) {
        
      }
    },

    handleScheduleDataDeteleCancel(){
      this.getAllSchedulingList();
      this.deteleStatus = false;
      
    },

    handleScheduleDetailEditBtn(){
      this.drawerEditVisibility = true;
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
