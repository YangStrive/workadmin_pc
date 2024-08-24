<template>
  <div class="allowance-manage">
		<div class="allowance-header">
			<!--搜索 账单周期 和人员-->
			<el-form :inline="true" :model="searchForm" class="demo-form-inline">
				<el-form-item label="账单周期">
					<el-date-picker
						v-model="searchForm.date"
						type="daterange"
						range-separator="至"
						start-placeholder="开始日期"
						end-placeholder="结束日期"
						value-format="yyyy-MM-dd"
						format="yyyy-MM-dd"
						clearable
						:picker-options="pickerOptions"
						@change="search"
					></el-date-picker>
				</el-form-item>
				<el-form-item label="人员">
					<el-select v-model="searchForm.person" placeholder="请选择" @change="search">
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
					<el-button type="primary" @click="search">新建</el-button>
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
				<el-table-column prop="name" label="姓名" width="100"></el-table-column>
				<el-table-column prop="phone" label="手机号" width="120"></el-table-column>
				<el-table-column prop="type" label="费用类型" width="100"></el-table-column>
				<el-table-column prop="money" label="金额(元)" width="100"></el-table-column>
				<el-table-column prop="status" label="结算状态" width="100"></el-table-column>
				<el-table-column prop="remark" label="说明" width="100"></el-table-column>
				<el-table-column label="操作" >
					<template slot-scope="scope">
						<el-button type="text" size="small" @click="handleEdit(scope.row)">编辑</el-button>
						<el-button type="text" size="small" @click="handleEdit(scope.row)">删除</el-button>
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
						<el-select v-model="editForm.person" placeholder="请选择" style="width: 100%;">
							<el-option
								v-for="item in personList"
								:key="item.value"
								:label="item.label"
								:value="item.value"
							></el-option>
						</el-select>
					</el-form-item>
					<el-form-item label="费用类型">
						<el-select v-model="editForm.type" placeholder="请选择"  style="width: 100%;">
							<el-option
								v-for="item in typeList"
								:key="item.value"
								:label="item.label"
								:value="item.value"
							></el-option>
						</el-select>
					</el-form-item>
					<el-form-item label="金额(元)">
						<el-input v-model="editForm.money"></el-input>
					</el-form-item>
					<el-form-item label="说明">
						<el-input v-model="editForm.remark" type="textarea" :autosize="{ minRows: 2, maxRows: 4}"></el-input>
					</el-form-item>
				</el-form>
			</div>
			<div slot="footer" class="dialog-footer">
				<el-button @click="dialogVisibleEdit = false">取 消</el-button>
				<el-button type="primary" @click="dialogVisibleEdit = false">确 定</el-button>
			</div>
		</el-dialog>
	</div>
</template>

<script>
export default {
	name: 'allowance-manage',
	data(){
		return {
			searchForm: {
				date: '',
				person: ''
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
			personList: [
				{
					value: '1',
					label: '张三'
				},
				{
					value: '2',
					label: '李四'
				}
			],
			pickerOptions: {
				shortcuts: [
					{
						text: '最近一周',
						onClick(picker) {
							const end = new Date();
							const start = new Date();
							start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
							picker.$emit('pick', [start, end]);
						}
					},
					{
						text: '最近一个月',
						onClick(picker) {
							const end = new Date();
							const start = new Date();
							start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
							picker.$emit('pick', [start, end]);
						}
					},
					{
						text: '最近三个月',
						onClick(picker) {
							const end = new Date();
							const start = new Date();
							start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
							picker.$emit('pick', [start, end]);
						}
					}
				]
			},
			page_no: 1,
			page_size: 10,
			total_num: 100,
			dialogVisibleEdit: false,
			editForm: {
				person: '',
				type: '',
				money: '',
				remark: ''
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

		}
	},

	methods: {
		handleEdit(row){
			console.log(row)
			this.dialogVisibleEdit = true;
		},
		search(){
			console.log(this.searchForm)
		},
		handleSizeChange(val){
			console.log(val)
		},
		handleClickConfirmBillBtn(){
			this.dialogVisibleEdit = true;
		},
		handleSizeChange(val){
			console.log(`每页 ${val} 条`);
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