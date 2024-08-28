<template>
  <div class="bill-manage">
    <div class="bill-header">
			<el-form :inline="true" :model="formInline" class="bill-form-inline">
				<el-form-item label="账单周期">
					<el-date-picker
						v-model="formInline.date"
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
				<el-col :span="3">
					<section class="card-section">
						<div slot="header" class="clearfix">
							<span>总工时（小时）</span>
						</div>
						<div class="bill-statistics-content">
							<p>0</p>
						</div>
					</section>
				</el-col>
				<el-col :span="3">
					<section class="card-section">
						<div slot="header" class="clearfix">
							<span>工资总额（元）</span>
						</div>
						<div class="bill-statistics-content">
							<p>0</p>
						</div>
					</section>
				</el-col>
				<el-col :span="4">
					<section class="card-section">
						<div slot="header" class="clearfix">
							<span>服务费（元）</span>
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
				<el-col :span="3">
					<section class="card-section">
						<div slot="header" class="clearfix">
							<span>其他费用（元）</span>
						</div>
						<div class="bill-statistics-content">
							<p>0</p>
						</div>
					</section>
				</el-col>
				<el-col :span="3">
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
				<el-table-column prop="address" label="最新同步时间" width="180"/>
				<el-table-column prop="name" label="支付时间" width="100"/>
				<el-table-column prop="address" label="支付状态" width="180"/>
				<el-table-column prop="address" label="账单金额（元）" width="180"/>
				<el-table-column label="操作" width="210" fixed="right">
					<template slot-scope="scope">
						<el-button type="text" size="small">查看</el-button>
						<el-button type="text" size="small">下载</el-button>
						<el-button type="text" size="small" @click="handleClickConfirmBillBtn">确认账单</el-button>
						<el-button type="text" size="small" @click="handleClickReturn">退回</el-button>
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
			title="账单确认" 
			:visible.sync="dialogVisibleConfirmBill"
			size="tiny"
			>
			<div class="form-bill-box">

				<el-form :model="billForm" label-width="80px" ref="billForm" :rules="rulesBillForm">
					<el-form-item label="账单名称">
						<el-input disabled v-model="billForm.name"></el-input>
					</el-form-item>
					<el-form-item label="账单周期">
						<el-input disabled v-model="billForm.region"></el-input>
					</el-form-item>
					<el-form-item label="账单金额">
						<el-input disabled v-model="billForm.address"></el-input>
					</el-form-item>
					<el-form-item label="验证码" prop="code">
						<div class="code-box">
							<el-input v-model="billForm.code"></el-input>
							<el-button type="primary" :disabled="getCodeText != '获取验证码'" @click="handleClickGetCode">{{getCodeText}}</el-button>
						</div>
					</el-form-item>
				</el-form>
			</div>
			<div slot="footer" class="dialog-footer">
				<el-button @click="dialogVisibleConfirmBill = false">取 消</el-button>
				<el-button type="primary" @click="handleClickBillConfirm">确 定</el-button>
			</div>
		</el-dialog>
  </div>
</template>

<script>

import * as util from "@/assets/js/util.js";
let { ajaxPromise } = util;

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
				 address: '',
				 code: ''
			 },
			 rulesBillForm: {
				 code: [
					 { required: true, message: '请输入验证码', trigger: 'blur' }
				 ]
			 },

			 team_id: '',
			 project_id: '',
			 getCodeText: '获取验证码'

		 }
	 },

	 created(){
    this.team_id = util.getLocalStorage("projectStorageInfo").team_id;
    this.project_id = util.getLocalStorage("projectStorageInfo").project_id;
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
		 },

		 async handleClickGetCode(){
			if(this.getCodeText != '获取验证码') return;

			try {
				//thirdsettlement/verification/code
				let res =  await ajaxPromise({
					url:'/thirdsettlement/verification/code', 
					method: 'post',
					data:{
						team_id: this.team_id,
						project_id: this.project_id,
						settle_id: this.settle_id
					}
				});

				if(res.code == 0){
					this.$message({
						type: 'success',
						message: '验证码发送成功'
					});
					this.countDown();
				}else{
					
				}
			} catch (error) {
				throw error;
			}
		 },

		 //计算验证码倒计时
		 countDown(){
			let time = 60;
			this.getCodeText = `${time}s`;
			let timer = setInterval(() => {
				time--;
				this.getCodeText = `${time}s`;
				if(time <= 0){
					clearInterval(timer);
					this.getCodeText = '获取验证码';
				}
			}, 1000);
		},

		//账单退回
		 handleClickReturn(){
			// 退回二次确认
			this.$confirm('确认退回账单？', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			}).then(() => {
				// ajax
			}).catch(() => {
				this.$message({
					type: 'info',
					message: '已取消退回'
				});          
			});
		 },

		 //账单确认
		 handleClickBillConfirm(){
			this.$refs.billForm.validate((valid) => {
				if (valid) {
					this.submitBillConfirm();
				} else {
					return false;
				}
			});
		 },

		 async submitBillConfirm(){
			try {
				let res =  await ajaxPromise({
					url:'/thirdsettlement/submit', 
					method: 'post',
					data:{
						team_id: this.team_id,
						project_id: this.project_id,
						settle_id: this.settle_id,
						code: this.billForm.code,
					}
				});

				if(res.code == 0){
					this.$message({
						type: 'success',
						message: '账单确认成功'
					});
					this.dialogVisibleConfirmBill = false;

				}else{
					this.$message({
						type: 'error',
						message: res.msg
					});
				}
			} catch (error) {
				
			}
		},			

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