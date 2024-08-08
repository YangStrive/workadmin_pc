<template>
	<el-dialog
		title="排班"
		size="tiny"
		:visible.sync="vaisable"
		:before-close="handleDrawerBeforeClose">
		<div class="dialog-schedule-main">
			<el-tabs v-model="activeScheduleName" @tab-click="handleScheduleTabsClick">
			<el-tab-pane label="固定班次" name="first"></el-tab-pane>
			<el-tab-pane label="临时班次" name="second"></el-tab-pane>
			</el-tabs>
			<div class="schedule-box">
			<div class="schedule-box-item" v-if="activeScheduleName == 'first'">
				<div class="schedule-list-box">
				<ul class="schedule-list">
					<li
					class="schedule-item"
					v-for="(item, index) in fixedSchedules"
					:class="[ temporaryStorage.schedule_id == item.schedule_id ? 'active-schedule' : '','colorblock_item_' + index]"
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
export default {
	props: {
		drawerVisibility: {
      type: Boolean,
      default: false
    },
    temporaryStorage: {
      type: Object,
      default: () => ({
        schedule_id: '',
        schedule_name: '',
        start_time: '',
        end_time: '',
        work_hours: '',
        workTimetList: [],
        rest: 2,
        rest_start_time: '',
        restTimeEnd: ''
      })
    },
    fixedSchedules: {
      type: Array,
      default: () => [
        {
            "schedule_id": "1899",
            "schedule_name": "A",
            "start_time": "07:00",
            "end_time": "10:00",
            "cross": 0,
            "type": "1",
            "rest_start_time": "",
            "rest_end_time": "",
            "work_hours": 3
        },
        {
            "schedule_id": "1900",
            "schedule_name": "B",
            "start_time": "10:00",
            "end_time": "16:00",
            "cross": 0,
            "type": "1",
            "rest_start_time": "",
            "rest_end_time": "",
            "work_hours": 6
        },
        {
            "schedule_id": "1901",
            "schedule_name": "C",
            "start_time": "16:00",
            "end_time": "22:00",
            "cross": 0,
            "type": "1",
            "rest_start_time": "",
            "rest_end_time": "",
            "work_hours": 6
        }
			]
    }
  },
	computed: {
		vaisable: {
			get() {
				return this.drawerVisibility;
			},
			set(val) {
				this.$emit('update:drawerVisibility', val);
			}
		}
	},
		
	data() {
		return {
      activeScheduleName: 'first',
      temporarySchedule: {
				schedule_id: '',
        schedule_name: '',
        start_time: '',
        end_time: '',
        work_hours: '',
				workTimetList: [],
        rest: 2,
        rest_start_time: '',
				rest_end_time: '',
				temporaryStorage: {}
			}
    }
  },
	methods: {
    //班次设置保存
		handleSaveSchedule(){
      if(this.activeScheduleName == "first"){
        console.log("保存固定班次设置");
        this.currentSelectedSchedule = this.temporaryStorage;
      }else{
        console.log("保存临时班次设置");
      }

      console.log(this.temporarySchedule)
      this.vaisable = false;
      let scheduleList = this.schedulingList;
      //遍历scheduleList 将currentCellSelected为true的班次设置为当前选择的班次
      // for(let i = 0; i < scheduleList.length; i++){
      //   for(let key in scheduleList[i]){
      //     if(scheduleList[i][key].currentCellSelected){
      //       scheduleList[i][key].scheduleList = [this.currentSelectedSchedule];
      //       scheduleList[i][key].currentCellSelected = true;
      //     }
      //   }
      // }
    },

    //取消班次选择
    handleDrawerClose(){
      this.vaisable = false;
      this.temporaryStorage = {};
    },

    //排班添加工作时间
    handleAddWorkTime(){
      this.temporarySchedule.workTimetList.push({
        start_time:"",
        workTimeEnd: "",
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
      this.vaisable = false;
    },

     // 点击排班弹框中的班次
		handleScheduleItemClick(item,index) {
      console.log("点击排班弹框中的班次", item);
      this.temporaryStorage = {...item,style:index};
    },
}
</script>

<style>

</style>