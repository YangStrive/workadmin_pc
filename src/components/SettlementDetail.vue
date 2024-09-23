<template>
  <div id="PayListDetail" v-loading="fullscreenLoading" >
    <div class="kq-wapper">
      <div class="headertitle clearfix">
        <h2 class="fl"><span @click="goPayrollList">账单管理</span>
           <i class="icon-arrow-right"></i>
           <span @click="goSettlementPreview">{{this.settlement_info.title}}</span>
           <i class="icon-arrow-right"></i>
           {{this.settlement_info.user_name}}
        </h2>
          <!-- <h3 class="fr frlast" @click="delPayroll" ><i class="deleteico_svg"></i>删除</h3> -->
        <h3 class="fr frfirst" @click="exportPayroll()"><i class="cexportico_svg"></i>导出</h3>
        <h3 class="fr frfirst" @click="dialogVisibleExport = true"><i class="cexportico_svg"></i>查看导出列表</h3>
      </div>
      <div class="kq-header">
        <div class="kq-tab">
          <div class="kq-count-day">
            <div class="kq-table-day yf-payrolllist">
              <el-table :data="attendance_list"
                border empty-text="暂无数据" >
                <el-table-column prop="worker_name" show-overflow-tooltip label="姓名" width="180" class-name="tablefirst"></el-table-column>
                <el-table-column prop="worker_phone" show-overflow-tooltip label="手机号" width="180">
                  <template slot-scope="scope">
                    <el-popover
                        placement="top"
                        title=""
                        min-width="180"
                        trigger="hover">
                        <span style="margin-left:35px">{{scope.row.worker_phone}}</span>
                        <span slot="reference">{{scope.row.worker_phone.substr(0,3)+"****"+scope.row.worker_phone.substr(7)}}</span>
                    </el-popover>
                  </template>
                </el-table-column>
                <el-table-column
                  label="身份证号"
                  label-class-name="border"
                  min-width="185"
                >
                  <template slot-scope="scope">
                    <el-popover
                      placement="top"
                      title=""
                      trigger="hover">
                      <span style="margin-left:10px">{{scope.row.worker_identitycard}}</span>
                      <span slot="reference">{{scope.row.worker_identitycard.substr(0,3)+"****"+scope.row.worker_identitycard.substr(14)}}</span>
                    </el-popover>
                  </template>
                </el-table-column>
                <template>
                  <el-table-column prop="attendancedate"  show-overflow-tooltip label="考勤日期" min-width="160" ></el-table-column>
                </template>
                <el-table-column prop="actual_attendancetime" show-overflow-tooltip label="工时" min-width="100" ></el-table-column>
                <el-table-column prop="r_type_text" show-overflow-tooltip label="费用类型" min-width="80" ></el-table-column>

                <el-table-column prop="amount" show-overflow-tooltip label="金额(元)" min-width="100" ></el-table-column>
              </el-table>
              <el-pagination
                    @current-change="handleSizeChange"
                    :current-page.sync="page_no"
                    :page-size="page_size"
                    layout="total, prev, pager, next"
                    :total="total">
              </el-pagination>

            </div>
          </div>
        </div>
      </div>

      <!-- 导出 -->
      <div class="export-dialog checkconfirm">
        <el-dialog title="提示" top="35%" :visible.sync="showsetexit" @close="showsetexit = false" size="tiny">
          <span>是否确认导出{{this.settlement_info.title}}</span>
          <span slot="footer" class="dialog-footer">
            <el-button @click="showsetexit = false" class="cancel">取 消</el-button>
            <el-button type="primary" @click="confirmDownload" class="confirm">确 定</el-button>
          </span>
        </el-dialog>
      </div>

  </div>

    <downloadList :dialogExportVisible="dialogVisibleExport" :type="5" :closeDialog="handleClickCloseDialog"/>
  </div>
</template>
<script>
import downloadList from "@/components/common/downloadList";

import * as util from '../assets/js/util.js'
let $ = require("jquery")
const paymentTypes = [0,2];
let { ajaxPromise } = util;
export default {
  components: {
    downloadList
  },
  data: function () {
    return {
      total:0,
      page_size:20,
      page_no:1,
      total_page:1,
      settlement_info: {
            title: "",
            user_name: "",
            start_date:"",
            end_date: "",
            listing_status: ""
      },
      attendance_list:[],
      transform: false,
      showsetexit: false,
      fullscreenLoading: true,
      btnDisable: false,
      showrejected: false,
      team_id: 0,
      project_id: 0,
      create_user_name: '',
      user_id: 0,
      settle_id: 0,
      dialogVisibleExport:false,
    }
  },
  vuex: {
    getters: {

    },
    actions: {

    }
  },
  computed: {
    hasPaymentType(){
      return paymentTypes.some((v)=>v==this.payment_type)
    }
  },
  watch: {
    '$route'(to, from) {
      // if (to.path.split('/').length > 2) {
      //   this.$router.push('PayrollAccounting')
      // }
      // console.log('to===', to)
      this.init();
    },
  },
  methods: {
    /**
     * 初始化
     * @method init
     * @public
     * @return {Null} void
     */
    init() {
      if(util.getLocalStorage('projectStorageInfo') && util.getLocalStorage('projectStorageInfo').team_id) {
        this.team_id = util.getLocalStorage('projectStorageInfo').team_id
      }
      if(util.getLocalStorage('projectStorageInfo') && util.getLocalStorage('projectStorageInfo').project_id) {
        this.project_id = util.getLocalStorage('projectStorageInfo').project_id
      }
      if(document.URL.split('?')[1].split('&')[0].split('=')[1]) {
        this.settle_id = document.URL.split('?')[1].split('&')[0].split('=')[1]
      }
      if(document.URL.split('?')[1].split('&')[0].split('=')[1]) {
        this.user_id = document.URL.split('?')[1].split('&')[1].split('=')[1]
      }
      this.getData()
    },

    gotoAttendanceDetail(row){
      this.$router.replace('SettlementDetail?settle_id='+this.settle_id+'&user_id='+row.work_no)
    },

    getData() {
      console.log(this.settle_id)
      util.ajax({
        url: '/thirdsettlement/details',
        type: 'GET',
        data: {
          team_id: this.team_id,
          project_id: this.project_id,
          settle_id: this.settle_id,
          user_id:this.user_id,
          page_no: this.page_no,
          page_size: this.page_size,
        },
        timeout: 60000,
        success: (result) => {
          if (result && result.errno == 0) {
            this.total = result.data.list.total_count
            this.total_page = result.data.list.total_page
            this.settlement_info = result.data.settlement_info
            this.attendance_list = result.data.list.list
            this.fullscreenLoading = false;
            console.log("this.total" +this.total + "this.total_page "+this.total_page )
          } else {
            this.alertinfo(result.errmsg);
          }
        },
        noNetwork: () => {
          this.alertinfo('网络连接失败，请检查网络');
        }
      })
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
      this.showrejected = false;
    },

    checkconfirm(formName, action_no) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.rejectedconfirm(0)
        } else {
          return false;
        }
      });
    },

    handleSizeChange(val){
        this.page_no = val;
        this.getData()
    },

    //导出工资单
    exportPayroll() {
      this.showsetexit = true
    },
    async confirmDownload(){
      try {
        let res = await ajaxPromise({
          url: '/thirdsettlement/export',
          type: 'post',
          data: {
            team_id: this.team_id,
            project_id: this.project_id,
            settle_id :this.settle_id,
            user_id:this.user_id,
            type: 5,
          }
        });

        if(res.errno == 0){
          this.showsetexit = false;
          this.$message({
            type: 'success',
            message: '已添加导出队列，稍后前往导出列表查看并下载！'
          });
        }else{
          this.$message({
            type: 'error',
            message:res.errmsg
          });
        }
      } catch (error) {
        alert(error);
      }
    },
    handleClickCloseDialog(){
      this.dialogVisibleExport = false;
    },
    //返回列表
    goPayrollList() {
      this.$router.replace('billAllowanceManage')
    },
    goSettlementPreview() {
      this.$router.replace('SettlementPreview?settle_id='+this.settle_id)
    },
    // 显示错误信息
    alertinfo(text, type) {
      this.btnDisable = false;
      this.fullscreenLoading = false;
      this.$message({
        showClose: true,
        message: text,
        type: type || 'warning',
      });
    },
  },

  created() {
    this.init();
    //console.log('this.$route', this.$route.query.ifConfirmEmail)
  },
  mounted() {
  }
}

</script>
<style src='../assets/css/PayListDetail.css'></style>
<style src='../assets/css/base.css'></style>
<style scope>
.applications {
  overflow-y: hidden;
}

.el-pagination{
    text-align: right;
}
</style>
