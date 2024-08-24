<template>
  <div class="bill-manage">
    <div class="bill-header">
			<el-form :inline="true" :model="formInline" class="bill-form-inline">
				<el-form-item label="账单周期">
					<el-select v-model="formInline.region" placeholder="请选择账单周期">
						<el-option label="周期" value="周期"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="账单状态">
					<el-select v-model="formInline.region" placeholder="请选择账单状态">
						<el-option label="待同步" value="1">待同步</el-option>
						<el-option label="待确认" value="2">待确认</el-option>
						<el-option label="已退回" value="3">已退回</el-option>
						<el-option label="已确认" value="4">已确认</el-option>
						<el-option label="待开票" value="5">待开票</el-option>
						<el-option label="已开票" value="6">已开票</el-option>
						<el-option label="已作废" value="7">已作废</el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="支付状态">
					<el-select v-model="formInline.region" placeholder="请选择支付状态">
						<el-option label="待支付" value="1">待支付</el-option>
						<el-option label="部分支付" value="2">部分支付</el-option>
						<el-option label="已支付" value="3">已支付</el-option>

					</el-select>
				</el-form-item>
				<el-form-item label="账单名称">
					<el-input v-model="formInline.user" placeholder="请输入账单名称"></el-input>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="submitForm('formInline')">查询</el-button>
				</el-form-item>
			</el-form>
    </div>
		<!-- 统计-->
		<div class="bill-statistics">
			<el-row>
				<el-col :span="4">
					<section class="card-section">
						<div slot="header" class="clearfix">
							<span>总工时（小时）</span>
						</div>
						<div class="bill-statistics-content">
							<p>0</p>
						</div>
					</section>
				</el-col>
				<el-col :span="4">
					<section class="card-section">
						<div slot="header" class="clearfix">
							<span>税费（元）</span>
						</div>
						<div class="bill-statistics-content">
							<p>0</p>
						</div>
					</section>
				</el-col>
				<el-col :span="4">
					<section class="card-section">
						<div slot="header" class="clearfix">
							<span>费用合计（元）</span>
						</div>
						<div class="bill-statistics-content">
							<p>0</p>
						</div>
					</section>
				</el-col>
				<el-col :span="4">
					<section class="card-section">
						<div slot="header" class="clearfix">
							<span>其他费用（元）</span>
						</div>
						<div class="bill-statistics-content">
							<p>0</p>
						</div>
					</section>
				</el-col>
				<el-col :span="4">
					<section class="card-section">
						<div slot="header" class="clearfix">
							<span>往期账单滞纳金（元）</span>
						</div>
						<div class="bill-statistics-content">
							<p>0</p>
						</div>
					</section>
				</el-col>
				<el-col :span="4">
					<section class="card-section">
						<div slot="header" class="clearfix">
							<span>账单金额（元）</span>
						</div>
						<div class="bill-statistics-content">
							<p>0</p>
						</div>
					</section>
				</el-col>
			</el-row>
		</div>
		<!-- 表格-->
		<div class="bill-table">
			<el-table :data="tableData" style="width: 100%">
				<el-table-column prop="date" label="账单名称" width="180"/>
				<el-table-column prop="name" label="状态" width="100"/>
				<el-table-column prop="address" label="账单周期" width="180"/>
				<el-table-column prop="address" label="其他费用" width="180"/>
				<el-table-column prop="name" label="费用合计" width="100"/>
				<el-table-column prop="address" label="往期账单滞纳金(元)" width="180"/>
				<el-table-column prop="name" label="补差费用" width="100"/>
				<el-table-column prop="address" label="最新同步时间" width="180"/>
				<el-table-column prop="address" label="应支付日期" width="180"/>
				<el-table-column label="操作" >
					<template slot-scope="scope">
						<el-button type="text" size="small">查看{{ scope.row.name }}</el-button>
						<el-button type="text" size="small">下载</el-button>
						<el-button type="text" size="small" @click="handleClickConfirmBillBtn">确认账单</el-button>
						<el-button type="text" size="small">退回</el-button>
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

		<!-- 写个el-dialog 里面展示账单名称 账单周期 账单金额，还有一个输入验证码的input 和一个获取验证码的按钮-->
		<el-dialog 
			title="账单详情" 
			:visible.sync="dialogVisibleConfirmBill"
			size="tiny"
			>
			<div class="form-bill-box">

				<el-form :model="billForm" label-width="80px">
					<el-form-item label="账单名称">
						<el-input v-model="billForm.name"></el-input>
					</el-form-item>
					<el-form-item label="账单周期">
						<el-input v-model="billForm.region"></el-input>
					</el-form-item>
					<el-form-item label="账单金额">
						<el-input v-model="billForm.address"></el-input>
					</el-form-item>
					<el-form-item label="验证码">
						<div class="code-box">
							<el-input v-model="billForm.address"></el-input>
							<el-button type="primary">获取验证码</el-button>
						</div>
					</el-form-item>
				</el-form>
			</div>
			<div slot="footer" class="dialog-footer">
				<el-button @click="dialogVisibleConfirmBill = false">取 消</el-button>
				<el-button type="primary" @click="dialogVisibleConfirmBill = false">确 定</el-button>
			</div>
		</el-dialog>
  </div>
</template>

<script>
export default {
   name: 'bill-manage',
	 data() {
		 return {
			 formInline: {
				 region: '',
				 user: ''
			 },
			 tableData: [{
				 date: '2016-05-02',
				 name: '王小虎',
				 address: '上海市普陀区金沙江路 1518 弄'
			 }, 
			 {
				 date: '2016-05-04',
				 name: '王小虎',
				 address: '2'
			 }, 
			 {
				 date: '2016-05-01',
				 name: '王小虎',
				 address: '上海市普陀区金沙江路 1519 弄'
			 }, 
			 {
				 date: '2016-05-03',
				 name: '王小虎',
				 address: '上海市普陀区金沙江路 1516 弄'
			 }],
			 total_num: 100,
			 page_no: 1,
			 page_size: 10,
			 dialogVisibleConfirmBill: false,
			 billForm: {
				 name: '',
				 region: '',
				 address: ''
			 }

		 }
	 },

	 methods: {
		 submitForm(formName) {
			console.log(this.formInline);

		 },
		 handleSizeChange(val) {
			 console.log(`每页 ${val} 条`);
		 },
		 handleClickConfirmBillBtn(){
			 this.dialogVisibleConfirmBill = true;
		 }
	 }
}
</script>

<style scoped>
	.card-section{
		border-right: 1px solid #e0e6ed;
	}
	/** 最后一个元素不显示边框 */
	.el-col-4:last-child .card-section{
		border-right: none;
	}

	.bill-statistics{
		padding: 12px;
		background-color:#eff2f7;
	}
	.card-section .bill-statistics-content p{
		text-align: center;
		font-size: 22px;
		font-weight: bold;
		color: #333;
		margin-top: 12px;
	}
	.card-section .clearfix{
		text-align: center;
		font-size: 14px;
		color: #666;

	}

	.bill-table{
		margin-top: 12px;
	}

	.pagination-table{
		display: flex;
		justify-content: flex-end;
		margin-top: 12px;
		align-items: center;
	}

	.form-bill-box{
		padding: 20px;
	}

	.form-bill-box .code-box{
		display: flex;
		justify-content: space-between;
	}

	.form-bill-box .code-box el-input{
		width: 70%;
	}

</style>