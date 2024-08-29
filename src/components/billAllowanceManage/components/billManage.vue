<template>
	<div class="bill-manage">
		<div class="bill-header">
			<el-form :inline="true" :model="searchForm" class="bill-form-inline">
				<el-form-item label="账单周期">
					<el-date-picker v-model="searchForm.date" type="daterange" placeholder="请选择" range-separator="至"
						start-placeholder="开始日期" end-placeholder="结束日期" value-format="yyyy-MM-dd" format="yyyy-MM-dd" clearable
						@change="search"></el-date-picker>
				</el-form-item>
				<el-form-item label="账单状态">
					<el-select v-model="searchForm.listing_status" placeholder="请选择账单状态" clearable>
						<el-option v-for="(value,key) in listStatus" :key="key" :label="value" :value="key" />
					</el-select>
				</el-form-item>
				<el-form-item label="支付状态">
					<el-select v-model="searchForm.payment_status" placeholder="请选择支付状态" clearable>
						<el-option v-for="(value,key) in paymentStatus" :key="key" :label="value" :value="key" />
					</el-select>
				</el-form-item>
				<el-form-item label="账单名称">
					<el-input v-model="searchForm.title" placeholder="请输入账单名称" clearable></el-input>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="handleClickSearch()">查询</el-button>
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
							<p>{{ headerOverview.total_hours }}</p>
						</div>
					</section>
				</el-col>
				<el-col :span="3">
					<section class="card-section">
						<div slot="header" class="clearfix">
							<span>工资总额（元）</span>
						</div>
						<div class="bill-statistics-content">
							<p>{{ headerOverview.total_wage }}</p>
						</div>
					</section>
				</el-col>
				<el-col :span="4">
					<section class="card-section">
						<div slot="header" class="clearfix">
							<span>服务费（元）</span>
						</div>
						<div class="bill-statistics-content">
							<p>{{ headerOverview.service_fee }}</p>
						</div>
					</section>
				</el-col>
				<el-col :span="4">
					<section class="card-section">
						<div slot="header" class="clearfix">
							<span>税费（元）</span>
						</div>
						<div class="bill-statistics-content">
							<p>{{ headerOverview.tax_fee }}</p>
						</div>
					</section>
				</el-col>
				<el-col :span="4">
					<section class="card-section">
						<div slot="header" class="clearfix">
							<span>费用合计（元）</span>
						</div>
						<div class="bill-statistics-content">
							<p>{{ headerOverview.total_amount }}</p>
						</div>
					</section>
				</el-col>
				<el-col :span="3">
					<section class="card-section">
						<div slot="header" class="clearfix">
							<span>其他费用（元）</span>
						</div>
						<div class="bill-statistics-content">
							<p>{{ headerOverview.other_amount }}</p>
						</div>
					</section>
				</el-col>
				<el-col :span="3">
					<section class="card-section">
						<div slot="header" class="clearfix">
							<span>账单金额（元）</span>
						</div>
						<div class="bill-statistics-content">
							<p>{{ headerOverview.settlement_amount }}</p>
						</div>
					</section>
				</el-col>
			</el-row>
		</div>
		<!-- 表格-->
		<div class="bill-table">
			<el-table :data="tableData" style="width: 100%">
				<el-table-column prop="title" label="账单名称" width="180" />
				<el-table-column prop="listing_status" label="状态" width="100" />
				<el-table-column  label="账单周期" width="200" >
					<template slot-scope="scope">
						<span>{{ scope.row.start_date }}至{{ scope.row.end_date }}</span>
					</template>
				</el-table-column>
				<el-table-column prop="other_amount" label="其他费用" width="180" />
				<el-table-column prop="total_amount" label="费用合计" width="100" />
				<el-table-column prop="modify_at" label="最新同步时间" width="180" />
				<el-table-column prop="payment_at" label="支付时间" width="100" />
				<el-table-column prop="payment_status" label="支付状态" width="180" />
				<el-table-column prop="settlement_amount" label="账单金额（元）" width="180" />
				<el-table-column label="操作" width="220" fixed="right">
					<template slot-scope="scope">
						<el-button type="text" size="small" v-if="scope.row.view_permission == 1" @click="handleClickPreviewDetial(scope.row.id)">查看</el-button>
						<el-button type="text" size="small" v-if="scope.row.download_permission == 1">下载</el-button>
						<el-button type="text" size="small" @click="handleClickConfirmBillBtn(scope.row)" v-if="scope.row.confirm_permission == 1">确认账单</el-button>
						<el-button type="text" size="small" @click="handleClickReturn(scope.row.id)" v-if="scope.row.refuse_permission == 1">退回</el-button>
					</template>
				</el-table-column>
			</el-table>
			<div class="pagination-table" v-if="total_num / page_size > 1">
				<el-pagination @current-change="handleSizeChange" :current-page.sync="page_no" :page-size="page_size"
					layout="total, prev, pager, next" :total="total_num">
				</el-pagination>
			</div>
		</div>

		<!-- 写个el-dialog 里面展示账单名称 账单周期 账单金额，还有一个输入验证码的input 和一个获取验证码的按钮-->
		<el-dialog title="账单确认" :visible.sync="dialogVisibleConfirmBill" size="tiny">
			<div class="form-bill-box">

				<el-form :model="billForm" label-width="80px" ref="billForm" :rules="rulesBillForm">
					<el-form-item label="账单名称">
						<el-input disabled v-model="billForm.title"></el-input>
					</el-form-item>
					<el-form-item label="账单周期">
						<el-input disabled v-model="billForm.billCycle"></el-input>
					</el-form-item>
					<el-form-item label="账单金额">
						<el-input disabled v-model="billForm.settlement_amount"></el-input>
					</el-form-item>
					<el-form-item label="验证码" prop="code">
						<div class="code-box">
							<el-input v-model="billForm.code"></el-input>
							<el-button 
								type="primary" 
								:disabled="getCodeText != '获取验证码'"
								style="width: 100px;"
								@click="handleClickGetCode">{{ getCodeText }}</el-button>
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
			searchForm: {
				date: '',
				listing_status: '',
				payment_status: '',
				title: ''
			},
			tableData: [],
			total_num: 100,
			page_no: 1,
			page_size: 10,
			dialogVisibleConfirmBill: false,
			billForm: {
				title: '',
				billCycle: '',
				settlement_amount: '',
				code: ''
			},
			rulesBillForm: {
				code: [
					{ required: true, message: '请输入验证码', trigger: 'blur' }
				]
			},

			team_id: '',
			project_id: '',
			getCodeText: '获取验证码',
			paymentStatus:[],
			listStatus:[],
			headerOverview:{},

		}
	},

	created() {
		this.team_id = util.getLocalStorage("projectStorageInfo").team_id;
		this.project_id = util.getLocalStorage("projectStorageInfo").project_id;
		this.getTablesData();
	},

	methods: {
		handleClickSearch() {
			this.page_no = 1;
			this.getTablesData();
		},

		async getTablesData() {

			try {
				let {
					listing_status,
					payment_status,
					title,
					date
				} = this.searchForm;

				let res = await ajaxPromise({
					url: '/thirdsettlement/list',
					type: 'post',
					data: {
						listing_status,
						payment_status,
						title,
						team_id: this.team_id,
						project_id: this.project_id,
						page_no: this.page_no,
						page_size: this.page_size,
						start_date: util.formatData1(date[0]),
						end_date: util.formatData1(date[1]),
					}
				});

				if (res.errno == 0) {
					this.tableData = res.data.list;
					this.total_num = res.data.total_num;
					this.paymentStatus = res.data.payment_status;
					this.listStatus = res.data.listing_status;
					this.headerOverview = res.data.overview;
				} else {
					this.$message({
						type: 'error',
						message:res.errmsg
					});
				}
			} catch (error) {
				throw error;
			}
		},

		//分页
		handleSizeChange(val) {
			console.log(`每页 ${val} 条`);
			this.page_size = val;
			this.getTablesData();
		},

		//点击确认账单
		handleClickConfirmBillBtn(row) {
			let { title, start_date, end_date, settlement_amount } = row;
			this.billForm = {
				title,
				billCycle: `${start_date}至${end_date}`,
				settlement_amount,
				code: '',
				id: row.id,
			};
			
			clearInterval(window.TIMER);
			this.getCodeText = '获取验证码';
			this.dialogVisibleConfirmBill = true;
		},

		async handleClickGetCode() {
			if (this.getCodeText != '获取验证码') return;
			
			try {
				//thirdsettlement/verification/code
				let res = await ajaxPromise({
					url: '/thirdsettlement/verification/code',
					type: 'post',
					data: {
						team_id: this.team_id,
						project_id: this.project_id,
						settle_id: this.billForm.id,
					}
				});

				if (res.errno == 0) {
					this.$message({
						type: 'success',
						message: '验证码发送成功'
					});
					this.countDown();
				} else {
					this.$message({
						type: 'error',
						message:res.errmsg
					});
				}
			} catch (error) {
				throw error;
			}
		},

		//计算验证码倒计时
		countDown() {
			let time = 60;
			this.getCodeText = `${time}s`;
			window.TIMER = setInterval(() => {
				time--;
				this.getCodeText = `${time}s`;
				if (time <= 0) {
					clearInterval(window.TIMER);
					this.getCodeText = '获取验证码';
				}
			}, 1000);
		},

		//账单退回
		handleClickReturn(id) {
			// 退回二次确认
			this.$confirm('确认退回账单？', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			}).then(() => {
				this.submitBillReturn(id);
			}).catch(() => {
			});
		},

		//提交账单退回
		async submitBillReturn(id) {
			try {
				let res = await ajaxPromise({
					url: '/thirdsettlement/cancel',
					type: 'post',
					data: {
						team_id: this.team_id,
						project_id: this.project_id,
						settle_id:id,
					}
				});

				if (res.errno == 0) {
					this.$message({
						type: 'success',
						message: '账单退回成功'
					});
					this.getTablesData();

				} else {
					this.$message({
						type: 'error',
						message:res.errmsg
					});
				}
			} catch (error) {
				throw error;
			}
		},

		//账单确认
		handleClickBillConfirm() {
			this.$refs.billForm.validate((valid) => {
				if (valid) {
					this.submitBillConfirm();
				} else {
					return false;
				}
			});
		},

		//提交账单确认
		async submitBillConfirm() {
			try {
				let res = await ajaxPromise({
					url: '/thirdsettlement/submit',
					type: 'post',
					data: {
						team_id: this.team_id,
						project_id: this.project_id,
						settle_id: this.billForm.id,
						code: this.billForm.code,
					}
				});

				if (res.errno == 0) {
					this.$message({
						type: 'success',
						message: '账单确认成功'
					});
					this.dialogVisibleConfirmBill = false;
					this.getTablesData();
				} else {
					this.$message({
						type: 'error',
						message:res.errmsg
					});
				}
			} catch (error) {

			}
		},

		handleClickPreviewDetial(id) {
			this.$router.push({
				name: 'SettlementPreview',
				query: {
					id
				}
			});
		}

	}
}
</script>

<style scoped>
.card-section {
	border-right: 1px solid #e0e6ed;
}

/** 最后一个元素不显示边框 */
.el-col-4:last-child .card-section {
	border-right: none;
}

.bill-statistics {
	padding: 12px;
	background-color: #eff2f7;
}

.card-section .bill-statistics-content p {
	text-align: center;
	font-size: 22px;
	font-weight: bold;
	color: #333;
	margin-top: 12px;
}

.card-section .clearfix {
	text-align: center;
	font-size: 14px;
	color: #666;

}

.bill-table {
	margin-top: 12px;
}

.pagination-table {
	display: flex;
	justify-content: flex-end;
	margin-top: 12px;
	align-items: center;
}

.form-bill-box {
	padding:30px 40px 30px 30px;
}

.form-bill-box .code-box {
	display: flex;
	justify-content: space-between;
}

.form-bill-box .code-box el-input {
	width: 70%;
}
</style>