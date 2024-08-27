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
						value-format="yyyy-MM-dd"
						format="yyyy-MM-dd"
						clearable
						@change="search"
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
				<el-table-column type="selection" width="55"></el-table-column>
				<el-table-column prop="worker_name" label="姓名" width="100"></el-table-column>
				<el-table-column prop="worker_phone" label="手机号" width="120"></el-table-column>
				<el-table-column prop="r_type" label="费用类型" width="100">
					<template slot-scope="scope">
						{{scope.row.r_type == 10 ? '奖金' : '津贴'}}
					</template>
				</el-table-column>
				<el-table-column prop="amount" label="金额(元)" width="100"></el-table-column>
				<el-table-column prop="pay_status" label="结算状态" width="100"></el-table-column>
				<el-table-column prop="remark" label="说明" width="100"></el-table-column>
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
		<!-- 写个el-dialog 包含人员搜索的select 费用类型的select 包含奖金和津贴两项，金额（元） 说明限制100字 -->
		<el-dialog 
			title="编辑"
			:visible.sync="dialogVisibleEdit"
			size="tiny"
		>
			<div class="allowance-form">
				<el-form :model="editForm" label-width="80px">
					<el-form-item label="人员">
						<el-select v-model="editForm.user_id" placeholder="请选择" style="width: 100%;">
							<el-option
								v-for="item in personList"
								:key="item.value"
								:label="item.label"
								:value="item.value"
							></el-option>
						</el-select>
					</el-form-item>
					<el-form-item label="费用类型">
						<el-select v-model="editForm.r_type" placeholder="请选择"  style="width: 100%;">
							<!--10 奖金 20 津贴-->
							<el-option value="10" label="奖金"></el-option>
							<el-option value="20" label="津贴"></el-option>
						</el-select>
					</el-form-item>
					<el-form-item label="金额(元)">
						<el-input v-model="editForm.amount"></el-input>
					</el-form-item>
					<el-form-item label="说明">
						<el-input v-model="editForm.remarks" type="textarea" :autosize="{ minRows: 2, maxRows: 4}"></el-input>
					</el-form-item>
				</el-form>
			</div>
			<div slot="footer" class="dialog-footer">
				<el-button @click="dialogVisibleEdit = false">取 消</el-button>
				<el-button type="primary" @click="dialogVisibleEdit = false">确 定</el-button>
			</div>
		</el-dialog>
		<el-dialog 
			title="新建"
			:visible.sync="dialogVisibleAdd"
			size="tiny"
		>
			<div class="allowance-form">
				<el-form :model="addForm" label-width="80px">
					<el-form-item label="日期">
						<el-date-picker
							v-model="addForm.attendancedate"
							type="date"
							placeholder="选择日期"
							value-format="yyyy-MM-dd"
							format="yyyy-MM-dd"
						></el-date-picker>
					</el-form-item>
					<el-form-item label="人员">
						<el-select v-model="addForm.user_id" placeholder="请选择" style="width: 100%;">
							<el-option
								v-for="item in personList"
								:key="item.value"
								:label="item.label"
								:value="item.value"
							></el-option>
						</el-select>
					</el-form-item>
					<el-form-item label="费用类型">
						<el-select v-model="addForm.r_type" placeholder="请选择"  style="width: 100%;">
							<!--10 奖金 20 津贴-->
							<el-option value="10" label="奖金"></el-option>
							<el-option value="20" label="津贴"></el-option>
						</el-select>
					</el-form-item>
					<el-form-item label="金额(元)">
						<el-input v-model="addForm.amount"></el-input>
					</el-form-item>
					<el-form-item label="说明">
						<el-input v-model="addForm.remarks" type="textarea" :autosize="{ minRows: 2, maxRows: 4}"></el-input>
					</el-form-item>
				</el-form>
			</div>
			<div slot="footer" class="dialog-footer">
				<el-button @click="dialogVisibleAdd = false">取 消</el-button>
				<el-button type="primary" @click="dialogVisibleAdd = false">确 定</el-button>
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
			searchForm: {
				date: '',
				user_id: ''
			},
			tableData: [
				{
					name: '张三',
					phone: '13888888888',
					type: '奖金',
					money: '1000',
					status: '未结算',
					remark: '无'
				},
				{
					name: '李四',
					phone: '13888888888',
					type: '津贴',
					money: '2000',
					status: '已结算',
					remark: '无'
				}
			],
			personList: [],
			page_no: 1,
			page_size: 10,
			total_num: 100,
			dialogVisibleEdit: false,
			editForm: {
				user_id: '',
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
			//sea/api/1.0/client/v1/thirdsettlement/bonus_list
		},

		async remoteMethod(query){
			if (query !== '') {
				this.searchPersonloading = true;
				///group/member_search
				try {
					let res = await ajaxPromise({
						url: '/group/member_search',
						method: 'post',
						data: {
							team_id: this.team_id,
							project_id: this.project_id,
							keyword: query,
							page_no: 1,
							page_size: 20,
							group_id: ''
						}
					})
					if(res.code == 0){
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
			//sea/api/1.0/client/v1/thirdsettlement/bonus_list
			try {
				let res = await ajaxPromise({
					url: '/sea/api/1.0/client/v1/thirdsettlement/bonus_list',
					method: 'post',
					data: {
						team_id: this.team_id,
						project_id: this.project_id,
						page_no: this.page_no,
						page_size: this.page_size,
						start_time: this.searchForm.date[0],
						end_time: this.searchForm.date[1],
					}
				})
			} catch (error) {
				
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
			console.log(row)
			this.dialogVisibleEdit = true;
		},

		//删除
		handeleClickDelete(row){
			//二次确认
			this.$confirm('此操作将永久删除该记录, 是否继续?', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			}).then(() => {
				//ajax
				//sea/api/1.0/client/v1/thirdsettlement/bonus_delete
			}).catch(() => {
				this.$message({
					type: 'info',
					message: '已取消删除'
				});          
			});
		},

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