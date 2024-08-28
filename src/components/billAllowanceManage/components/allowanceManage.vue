<template>
  <div class="allowance-manage">
		<div class="allowance-header">
			<!--搜索 账单周期 和人员-->
			<el-form :inline="true" :model="searchForm" class="demo-form-inline">
				<el-form-item label="账单周期">
					<el-date-picker
						v-model="searchForm.date"
						type="daterange"
						 placeholder="请选择"
						range-separator="至"
						start-placeholder="开始日期"
						end-placeholder="结束日期"
						format="yyyy-MM-dd"
						clearable
					></el-date-picker>
				</el-form-item>
				<el-form-item label="人员">
					<el-select 
					v-model="searchForm.user_id" 
					placeholder="请输入关键词" 
					multiple
					filterable
					remote
					:remote-method="remoteMethod"
					:loading="searchPersonloading">
						<el-option
							v-for="item in personList"
							:key="item.value"
							:label="item.label"
							:value="item.value"
						></el-option>
					</el-select>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="search">查询</el-button>
					<el-button type="primary" @click="handleClickAddAllowance">新建</el-button>
				</el-form-item>
			</el-form>

		</div>
		<div class="allowance-table">
				<!--表格 姓名手机号费用类型金额(元)结算状态 说明 操作-->
			<el-table
				:data="tableData"
				style="width: 100%"
			>
				<el-table-column prop="worker_name" label="姓名" width="100"></el-table-column>
				<el-table-column prop="worker_phone" label="手机号" width="120"></el-table-column>
				<el-table-column prop="r_type" label="费用类型" width="100">
					<template slot-scope="scope">
						{{scope.row.r_type == 10 ? '奖金' : '津贴'}}
					</template>
				</el-table-column>
				<el-table-column prop="amount" label="金额(元)" width="100"></el-table-column>
				<el-table-column prop="pay_status" label="结算状态" width="100"></el-table-column>
				<el-table-column prop="remarks" label="说明" width="100"></el-table-column>
				<el-table-column label="操作" >
					<template slot-scope="scope">
						<el-button type="text" size="small" @click="handleClickEdit(scope.row)">编辑</el-button>
						<el-button type="text" size="small" @click="handeleClickDelete(scope.row)">删除</el-button>
					</template>
				</el-table-column>
			</el-table>
			
			<div class="pagination-table" v-if="total_num / page_size > 1">
				<el-pagination
					@current-change="handleSizeChange"
					:current-page.sync="page_no"
					:page-size="page_size"
					layout="total, prev, pager, next"
					:total="total_num"
				>
				</el-pagination>
			</div>
		</div>

		<!-- 编辑奖金津贴 -->
		<el-dialog 
			title="编辑"
			:visible.sync="dialogVisibleEdit"
			size="tiny"
		>
			<div class="allowance-form">
				<el-form :model="editForm" label-width="80px" ref="editForm" :rules="addFormRule">
					<el-form-item label="人员">
						<el-input v-model="editForm.worker_name" disabled></el-input>
					</el-form-item>
					<el-form-item label="费用类型" prop="r_type">
						<el-select v-model="editForm.r_type" placeholder="请选择"  style="width: 100%;">
							<!--10 奖金 20 津贴-->
							<el-option :value="+10" label="奖金"></el-option>
							<el-option :value="+20" label="津贴"></el-option>
						</el-select>
					</el-form-item>
					<el-form-item label="金额(元)" prop="amount">
						<el-input v-model="editForm.amount"></el-input>
					</el-form-item>
					<el-form-item label="说明" prop="remarks">
						<el-input v-model="editForm.remarks" type="textarea" :autosize="{ minRows: 2, maxRows: 4}"></el-input>
					</el-form-item>
				</el-form>
			</div>
			<div slot="footer" class="dialog-footer">
				<el-button @click="dialogVisibleEdit = false">取 消</el-button>
				<el-button type="primary" @click="handleClickEditAllowance">确 定</el-button>
			</div>
		</el-dialog>

		<!-- 新建奖金津贴 -->
		<el-dialog 
			title="新建"
			:visible.sync="dialogVisibleAdd"
			size="tiny"
		>
			<div class="allowance-form">
				<el-form :model="addForm" label-width="80px" :rules="addFormRule" ref="addForm">
					<el-form-item label="日期" prop="attendancedate">
						<el-date-picker
							style="width: 100%;"
							v-model="addForm.attendancedate"
							type="date"
							placeholder="选择日期"
							format="yyyy-MM-dd"
						></el-date-picker>
					</el-form-item>
					<el-form-item label="人员" prop="user_id">
						<el-select 
							style="width: 100%;"
							v-model="addForm.user_id" 
							placeholder="请输入关键词" 
							multiple
							filterable
							remote
							:remote-method="remoteMethod"
							:loading="searchPersonloading">
								<el-option
									v-for="item in personList"
									:key="item.value"
									:label="item.label"
									:value="item.value"
								></el-option>
						</el-select>
					</el-form-item>
					<el-form-item label="费用类型" prop="r_type">
						<el-select v-model="addForm.r_type" placeholder="请选择"  style="width: 100%;">
							<!--10 奖金 20 津贴-->
							<el-option value="10" label="奖金"></el-option>
							<el-option value="20" label="津贴"></el-option>
						</el-select>
					</el-form-item>
					<el-form-item label="金额(元)" prop="amount">
						<el-input v-model="addForm.amount"></el-input>
					</el-form-item>
					<el-form-item label="说明" prop="remarks">
						<el-input v-model="addForm.remarks" type="textarea" :autosize="{ minRows: 2, maxRows: 4}"></el-input>
					</el-form-item>
				</el-form>
			</div>
			<div slot="footer" class="dialog-footer">
				<el-button @click="dialogVisibleAdd = false">取 消</el-button>
				<el-button type="primary" @click="handleClickAddAllowanceConfirm">确 定</el-button>
			</div>
		</el-dialog>
	</div>
</template>

<script>

import * as util from "@/assets/js/util.js";

let { ajaxPromise } = util;


export default {
	name: 'allowance-manage',
	data(){
		return {
			addFormRule:{
				attendancedate: [
					{ required: true, message: '请选择日期', trigger: 'change',type: 'date', }
				],
				user_id: [
					{ required: true, message: '请选择人员', trigger: 'blur' }
				],
				r_type: [
					{ required: true, message: '请选择费用类型', trigger: 'blur' }
				],
				amount: [
					{ required: true, message: '请输入金额', trigger: 'blur' },
					//只支持数字，支持两位小数
					{ pattern: /^[0-9]+(.[0-9]{1,2})?$/, message: '请输入正确的金额', trigger: 'blur' }
				],
				remarks: [
					{ required: true, message: '请输入说明', trigger: 'blur' },
					{ max: 100, message: '说明不能超过100字', trigger: 'blur' }
				]
			},
			searchForm: {
				date: '',
				user_id: ''
			},
			tableData: [
				{
					worker_name: '张三',
					worker_phone: '13888888888',
					r_type: 10,
					amount: 100,
					pay_status: '已结算',
					remark: '备注'
				},
				{
					worker_name: '李四',
					worker_phone: '13888888888',
					r_type: 20,
					amount: 100,
					pay_status: '未结算',
					remark: '备注'
				}
			],
			personList: [],
			page_no: 1,
			page_size: 10,
			total_num: 100,
			dialogVisibleEdit: false,
			editForm: {
				worker_name: '',
				r_type: '',
				amount: '',
				remarks: ''
			},
			addForm:{
				attendancedate: '',
				user_id: '',
				r_type: '',
				amount: '',
				remarks: ''
			},
			typeList: [
				{
					value: '1',
					label: '奖金'
				},
				{
					value: '2',
					label: '津贴'
				}
			],
			team_id: '',
			project_id: '',
			dialogVisibleAdd: false,
			searchPersonloading: false,
			
		}
	},

	created(){
    this.team_id = util.getLocalStorage("projectStorageInfo").team_id;
    this.project_id = util.getLocalStorage("projectStorageInfo").project_id;
	},

	methods: {

		search(){
			this.getAllowanceList();
		},

		async remoteMethod(query){
			if (query !== '') {
				this.searchPersonloading = true;
				///group/member_search
				try {
					let res = await ajaxPromise({
						url: '/group/member_search',
						type: 'post',
						data: {
							team_id: this.team_id,
							project_id: this.project_id,
							keyword: query,
							page_no: 1,
							page_size: 20,
							group_id: ''
						}
					})
					if(res.errno == 0){
						this.personList = res.data.map(item => {
							return {
								value: item.user_id,
								label: item.user_name
							}
						})
					}
				} catch (error) {
					
				}finally{
					this.searchPersonloading = false;
				}

			} else {
				this.personList = [];
			}
		},

		async getAllowanceList(){
			//thirdsettlement/bonus_list
			try {
				let res = await ajaxPromise({
					url: '/thirdsettlement/bonus_list',
					type: 'post',
					data: {
						team_id: this.team_id,
						project_id: this.project_id,
						page_no: this.page_no,
						page_size: this.page_size,
						start_time: util.formatData1(this.searchForm.date[0]),
						end_time: util.formatData1(this.searchForm.date[1]),
					}
				})

				if(res.errno == 0){
					this.tableData = res.data.list;
					this.total_num = res.data.total_num;
				}else{
					this.$message({
						type: 'error',
						message:res.errmsg
					});
				}
			} catch (error) {
				throw error;
			}
		},

		handleSizeChange(val){
			console.log(val)
		},
		handleClickConfirmBillBtn(){
			this.dialogVisibleEdit = true;
		},

		handleSizeChange(val){
			console.log(`每页 ${val} 条`);
		},

		handleClickAddAllowance(){
			this.dialogVisibleAdd = true;
		},

		handleClickEdit(row){
			let {
				worker_name,
				r_type,
				amount,
				remarks,
				id
			} = row;
			this.editForm = {
				worker_name,
				r_type,
				amount,
				remarks,
				id
			}

			this.dialogVisibleEdit = true;
		},

		//确认编辑
		handleClickEditAllowance(){
			this.$refs.editForm.validate((valid) => {
				if (valid) {
					this.sumbitEditAllowance();
				} else {
					return false;
				}
			});
		},

		//提交编辑
		async sumbitEditAllowance(){
			let {
				r_type,
				amount,
				remarks,
				id
			} = this.editForm;
			try {
				let res = await ajaxPromise({
					url: '/thirdsettlement/bonus_update',
					type: 'post',
					data: {
						team_id: this.team_id,
						project_id: this.project_id,
						record_id: id,
						r_type,
						amount,
						remarks
					}
				})

				if(res.errno == 0){
					this.$message({
						type: 'success',
						message: '编辑成功'
					});
					this.dialogVisibleEdit = false;
					this.getAllowanceList();
				}else{
					this.$message({
						type: 'error',
						message:res.errmsg
					});
				}
			} catch (error) {
				
			}
		},

		//删除
		handeleClickDelete(row){
			//二次确认
			this.$confirm('此操作将永久删除该记录, 是否继续?', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			}).then(() => {
				this.submitDeleteRecord(row.id);    
			}).catch(() => {        
			});
		},

		async submitDeleteRecord(id){
			try {
				//thirdsettlement/bonus_update
				let res = await ajaxPromise({
					url: '/thirdsettlement/bonus_update',
					type: 'post',
					data: {
						team_id: this.team_id,
						project_id: this.project_id,
						record_id: id,
						pay_status: -1
					}
				})

				if(res.errno == 0){
					this.$message({
						type: 'success',
						message: '删除成功'
					});
					this.getAllowanceList();
				}else{
					this.$message({
						type: 'error',
						message:res.errmsg
					});
				}

			} catch (error) {
				
			}
		},

		handleClickAddAllowanceConfirm(){
			this.$refs.addForm.validate((valid) => {
				if (valid) {
					this.sumbitAddAllowance();
				} else {
					return false;
				}
			});
		},

		async sumbitAddAllowance(){
			///thirdsettlement/bonus_create
			let {
				attendancedate,
				user_id,
				r_type,
				amount,
				remarks
			} = this.addForm;
			try {
				let res = await ajaxPromise({
					url: '/thirdsettlement/bonus_create',
					type: 'post',
					data: {
						attendancedate,
						user_id,
						r_type,
						amount,
						remarks,
						team_id: this.team_id,
						project_id: this.project_id,
					}
				})

				if(res.errno == 0){
					this.$message({
						type: 'success',
						message: '新建成功'
					});
					this.dialogVisibleAdd = false;
					this.getAllowanceList();
					//清空表单
					this.$refs.addForm.resetFields();
				}else{
					this.$message({
						type: 'error',
						message:res.errmsg
					});
				}
			} catch (error) {
				
			}
		}

	}
}
</script>

<style scoped>
	.pagination-table{
		display: flex;
		justify-content: flex-end;
		margin-top: 12px;
		align-items: center;
	}

	.allowance-form{
		padding: 20px 40px;
		width: 400px;
	}
</style>