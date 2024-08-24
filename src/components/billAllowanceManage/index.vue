<template>
	<div class="bill-allowance-manage">
		<div class="box-header">
			<h3>账单确认</h3>
		</div>
		<div class="bill-allowance-man">
			<el-tabs v-model="activeTab" @tab-click="handleTabClick">
				<el-tab-pane label="账单确认" name="billManage">
					<bill-manage></bill-manage>
				</el-tab-pane>
				<el-tab-pane label="奖金/津贴" name="allowanceManage">
					<allowance-manage></allowance-manage>
				</el-tab-pane>
			</el-tabs>
		</div>
	</div>
</template>

<script>
import billManage from './components/billManage.vue'
import allowanceManage from './components/allowanceManage.vue'

export default {
	components: {
		billManage,
		allowanceManage
	},
	data() {
		return {
			activeTab: 'billManage'
		}
	},
	methods: {
		handleTabClick(tab) {
			this.activeTab = tab.name
		}
	}
}
</script>

<style>
.bill-allowance-manage {
	padding: 0 20px;
}
.box-header {
	border-bottom: 1px solid #e0e6ed;
	margin-bottom: 12px;

}
.box-header h3 {
	font-size: 16px;
	font-weight: 700;
	text-align: left;
	color: #475568;
	height: 54px;
	line-height: 54px;
}
</style>