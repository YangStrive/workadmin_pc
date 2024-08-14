<template>
	<el-dialog
		title="排班"
		size="tiny"
		:visible.sync="vaisable"
		:before-close="handleDrawerBeforeClose">
		<div class="dialog-schedule-main">
			<el-tabs v-model="activeScheduleName" @tab-click="handleScheduleTabsClick">
        <el-tab-pane label="固定班次" name="fixed"></el-tab-pane>
        <el-tab-pane label="临时班次" name="temp"></el-tab-pane>
			</el-tabs>
			<div class="schedule-box" v-loading="loading">
			<div class="schedule-box-item" v-if="activeScheduleName == 'fixed'">
				<div class="schedule-list-box">
				<ul class="schedule-list">
					<li
					class="schedule-item"
					v-for="(item, index) in fixedSchedules"
					:class="[ temporaryStorage.schedule_id == item.schedule_id ? 'active-schedule' : '','colorblock_item_' + item.schedule_name]"
					:key="index"
					@click="handleScheduleItemClick(item,index)"
					>
					<div class="colorblock">
						<p>班次名称 {{ item.schedule_name }}</p>
						<p>工作时间 {{ item.start_time }} - {{ item.end_time }}</p>
						<p>工作时长 {{ item.work_hours }}</p>
					</div>
					</li>
				</ul>

				</div>
			</div>
			<div class="schedule-box-item" v-else>
				<el-form  label-width="80px" :model="temporarySchedule">
				<el-form-item label="工作时间">
					<div class="work-time-picker" v-for="(item, index) in temporarySchedule.workTimetList" :key="index">
					<el-time-picker
						size="small"
						format="HH:mm"
						v-model="temporarySchedule.workTimetList[index].start_time"
						placeholder="请选择">
					</el-time-picker>
					<span class="time-picker-c">至</span>  
					<el-time-picker
						size="small"
						format="HH:mm"
						v-model="temporarySchedule.workTimetList[index].end_time"
						placeholder="任意时间点">
					</el-time-picker>
					<div class="dialog-delete-btn" @click="handleDeleteWorkTime(index)" v-if="temporarySchedule.workTimetList.length > 1">
						<i class="el-icon-close" ></i>
					</div>
					</div>
					<el-button type="text" @click="handleAddWorkTime">添加</el-button>
				</el-form-item>
				<template v-if="temporarySchedule.workTimetList.length == 1">
					<el-form-item label="休息时间">
					<el-radio class="radio" v-model="temporarySchedule.rest" label="1">启用</el-radio>
					<el-radio class="radio" v-model="temporarySchedule.rest" label="2">不起用</el-radio>
					</el-form-item>
					<el-form-item label="" v-if="temporarySchedule.rest == 1">   
					<div class="rest-time-picker">
						<el-time-picker
              size="small"
              format="HH:mm"
              v-model="temporarySchedule.rest_start_time"
              placeholder="任意时间点">
						</el-time-picker>
						<span class="time-picker-c">至</span> 
						<el-time-picker
              size="small"
              format="HH:mm"
              v-model="temporarySchedule.rest_end_time"
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
			<el-button type="primary" class="save-btn" @click="handleSaveSchedule">确定</el-button>
			</div>
		</div>
	</el-dialog>
</template>
<script>

import { ajaxPromise, getLocalStorage, ajaxPromiseJSON } from "@/assets/js/util.js";

export default {
	props: {
		drawerVisibility: {
      type: Boolean,
      default: false
    },
    scheduleType: {
      type: String,
      default: 'fixed'
    },
    closeDialog: {
      type: Function,
      default: () => {}
    },
    saveScheduleData: {
      type: Function,
      default: () => {}
    },
    currentCellSchedule:{
      type:Object,
      default:'',
    }
  },
	computed: {
		vaisable: {
			get() {
				return this.drawerVisibility;
			},
      set(val) {
        if(val){
          this.init();
          this.getFixedSchedules();
        }
      }
		}
	},
		
	data() {
		return {
      activeScheduleName: 'fixed',
      fixedSchedules: [],
      temporarySchedule: {
        schedule_name: '',
        start_time: '',
        end_time: '',
        work_hours: '',
				workTimetList: [
          {
            start_time:new Date(2024,8,1,9,0),
            end_time:new Date(2024,8,1,18,0),
          }
        ],
        rest: '1',
        rest_start_time: '',
				rest_end_time: '',
			},
			temporaryStorage: {},
      loading: true,
    }
  },
  created() {
  },
	methods: {

    init(){
      this.activeScheduleName = this.scheduleType;
    },

    //获取所有固定班次
    async getFixedSchedules(){
      this.loading = true;
      this.team_id = getLocalStorage("projectStorageInfo").team_id;
      this.project_id = getLocalStorage("projectStorageInfo").project_id;
      this.task_id = window.localStorage.getItem("schedule_task_id");   
      try {
        let res = await ajaxPromise(
        { 
          url: "/attendance/task_schedule2",
          type: "GET",
          data: {
            team_id: this.team_id,
            project_id: this.project_id,
            task_id: this.task_id,
          }
        });

        if(res.errno == 0 ){
          this.fixedSchedules = res.data.fixedSchedules;
        }
      } catch (error) {
        throw error
      } finally {
        this.loading = false;
      }
    },

    //班次设置保存
		handleSaveSchedule(){
      if(this.activeScheduleName == 'fixed'){
        this.saveScheduleData(this.temporaryStorage,'fixed');
        this.handleDrawerClose();
      }

      if(this.activeScheduleName == 'temp'){
        if(!this.checkTemporarySchedule()){
          return;
        }

        if(this.temporarySchedule.workTimetList.length == 1 && this.temporarySchedule.rest == 1){
          if(!this.temporarySchedule.rest_start_time || !this.temporarySchedule.rest_end_time){
            this.$message({
              message: '请填写休息时间',
              type: 'warning'
            });
            return;
          }
        }
        this.saveTemporarySchedule();
      }
    },

    //保存临时班次
    async saveTemporarySchedule(){
      try {
        let schedule_list = [];

        //临时班次只有一个工作时间
        if(this.temporarySchedule.workTimetList.length == 1){
          schedule_list.push({
            start_time:  this.getFormattedTime(this.temporarySchedule.workTimetList[0].start_time),
            end_time: this.getFormattedTime(this.temporarySchedule.workTimetList[0].end_time),
            rest_start_time: this.temporarySchedule.rest_start_time ? this.getFormattedTime(this.temporarySchedule.rest_start_time) : '',
            rest_end_time: this.temporarySchedule.rest_end_time ? this.getFormattedTime(this.temporarySchedule.rest_end_time) : '',
            type:0,
            id:this.temporarySchedule.workTimetList[0].id ? this.temporarySchedule.workTimetList[0].id : '0',
            name:this.temporarySchedule.workTimetList[0].name ? this.temporarySchedule.workTimetList[0].name : '',
            cross:0,
          })

        }else{
          //临时班次有多个工作时间
          this.temporarySchedule.workTimetList.forEach(item => {
              schedule_list.push({
              start_time: this.getFormattedTime(item.start_time),
              end_time:   this.getFormattedTime(item.end_time),
              rest_start_time: '',
              rest_end_time: '',
              type:0,
              id:item.id ? item.id : '0',
              name:item.name ? item.name : '',  
              cross:0,
            })
          })
        }
        console.log("schedule_list",JSON);
        let res = await ajaxPromise(
        { 
          url: "/attendance/task_schedule/add",
          type: "POST",
          data: {
            team_id: this.team_id,
            project_id: this.project_id,
            task_id: this.task_id,
            schedule_list: JSON.stringify(schedule_list),
          }
        });

        if(res.errno == 0 ){
          this.saveScheduleData(res.data.schedule_list,'temp');
          this.handleDrawerClose();
        }
        
      } catch (error) {
        
      }
    },

    //检查临时班次时间不能交叉，并且不能重复，并且结束时间不能早于开始时间
    checkTemporarySchedule(){
      let workTimetList = this.temporarySchedule.workTimetList;
      let workTimetListLength = workTimetList.length;
      let isCross = false;
      let isRepeat = false;
      let isEndBeforeStart = false;
      //检查工作时间不能为空
      for(let i = 0; i < workTimetListLength; i++){
        if(!workTimetList[i].start_time || !workTimetList[i].end_time){
          this.$message({
            message: '工作时间不能为空',
            type: 'warning'
          });
          return false;
        }
      }

      for(let i = 0; i < workTimetListLength; i++){
        for(let j = i + 1; j < workTimetListLength; j++){
          if(workTimetList[i].start_time < workTimetList[j].end_time && workTimetList[i].end_time > workTimetList[j].start_time){
            isCross = true;
            break;
          }
        }
      }

      if(isCross){
        this.$message({
          message: '工作时间不能交叉',
          type: 'warning'
        });
        return false;
      }

      for(let i = 0; i < workTimetListLength; i++){
        for(let j = i + 1; j < workTimetListLength; j++){
          if(workTimetList[i].start_time == workTimetList[j].start_time && workTimetList[i].end_time == workTimetList[j].end_time){
            isRepeat = true;
            break;
          }
        }
      }

      if(isRepeat){
        this.$message({
          message: '工作时间不能重复',
          type: 'warning'
        });
        return false;
      }

      for(let i = 0; i < workTimetListLength; i++){
        if(workTimetList[i].start_time > workTimetList[i].end_time){
          isEndBeforeStart = true;
          break;
        }
      }

      if(isEndBeforeStart){
        this.$message({
          message: '结束时间不能早于开始时间',
          type: 'warning'
        });
        return false;
      }

      return true;
    },

    //取消班次选择
    handleDrawerClose(){
      this.vaisable = false;
      this.temporaryStorage = {};
      this.closeDialog(false);
    },

    //排班添加工作时间
    handleAddWorkTime(){
      this.temporarySchedule.workTimetList.push({
        start_time:new Date(2024,8,1,9,0),
        end_time: new Date(2024,8,1,18,0),
      })
    },

    //排班删除工作时间
    handleDeleteWorkTime(index){
      this.temporarySchedule.workTimetList.splice(index, 1);
    },

    //切换排班固定班次和临时班次
    handleScheduleTabsClick(tab) {
      this.activeScheduleName = tab.name;
    },

    //before close 排班弹窗
    handleDrawerBeforeClose(done) {
      this.temporaryStorage = {};
      this.temporarySchedule = {
        schedule_name: '',
        start_time: '',
        end_time: '',
        work_hours: '',
        workTimetList: [
          {
            start_time:new Date(2024,8,1,9,0),
            end_time:new Date(2024,8,1,18,0),
          }
        ],
        rest: '1',
        rest_start_time: '',
        rest_end_time: '',
      };
      this.closeDialog(false);
      done();
    },

     // 点击排班弹框中的班次
		handleScheduleItemClick(item,index) {
      console.log("点击排班弹框中的班次", item);
      this.temporaryStorage = {...item,style:item.schedule_name};
    },

    getFormattedTime(date) {
      let hours = date.getHours();
      let minutes = date.getMinutes();

      // 格式化为两位数
      if (hours < 10) {
          hours = '0' + hours;
      }
      if (minutes < 10) {
          minutes = '0' + minutes;
      }

      return `${hours}:${minutes}`;
    },
  }
}
</script>

<style scoped>
  .colorblock p{
    font-size: 14px;
    line-height: 18px;
  }
</style>