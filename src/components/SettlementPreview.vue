<template>
  <div id="PayListDetail" v-loading="fullscreenLoading" :style="{height:PayListDetailHeight}">
    <div class="kq-wapper">
      <div class="headertitle clearfix">
        <h2 class="fl"><span @click="goPayrollList">账单管理</span>
           <i class="icon-arrow-right"></i>
           {{this.settlement_info.title}}
        </h2>
          <!-- <h3 class="fr frlast" @click="delPayroll" ><i class="deleteico_svg"></i>删除</h3> -->
        <h3 class="fr frfirst" @click="exportPayroll()"><i class="cexportico_svg"></i>导出</h3>
        <h3 class="fr frfirst" @click="dialogVisibleExport = true"><i class="cexportico_svg"></i>查看导出列表</h3>
      </div>
      <div class="kq-header">
        <div class="kq-tab clearfix">
          <h2>基本信息</h2>
          <div class="paystatus fl">
            <p class="labletitel">
              <em>状态</em><span class="statusinfo ">{{ settlement_info.listing_status }}<i class="thedraftico_svg"></i></span>
            </p>
            <p class="labletitel"><em>结算周期</em><span class="statusinfo ">{{settlement_info.start_date}} ~ {{settlement_info.end_date}}</span></p>
            <p class="labletitel"><em>总人数</em><span class="statusinfo">{{settle_user_count}}</span></p>
            <p class="labletitel"><em>总工时</em><span class="statusinfo">{{settle_total_attendancetime}}</span></p>

          </div>
          <div class="payroll_info fr">
            <el-dropdown trigger="click" @visible-change="visibleChange">
              <div class="combined_pay">
                <span class="moneylabe">总金额：</span>
                <span class="money"><i>￥</i>{{settle_total_amount}}</span>
                <i class="el-icon-caret-bottom el-icon--right clickSjBtn" :class="[transform ? 'transformR' : 'transformL']"></i>
              </div>
              <ul slot="dropdown" class="el-dropdown-menu payListDrop" :class="{'cssHeight':!transform}" :style="{display: !transform ? 'none' : 'block' }">
                <li class="el-dropdown-menu__item"><span class="lablel">工资</span><span class="labler">￥{{settle_total_wage}}</span></li>
                <li class="el-dropdown-menu__item"><span class="lablel">税费</span><span class="labler">￥{{settle_total_fee}}</span></li>
              </ul>
            </el-dropdown>
          </div>
        </div>
        <div class="kq-tab">
          <h2>账单人数 ({{settle_user_count}}人)</h2>

          <div class="kq-count-day">
            <div class="select-person">
              <el-form :inline="true" class="demo-form-inline">
                <el-form-item label="人员：">
                  <el-input v-model="searchPerson" placeholder="姓名"></el-input>
                </el-form-item>
                <el-button type="primary" @click="seachMember()" class="seach-btn">搜 索</el-button>
                <el-button type="primary" @click="showAllDetail()" class="seach-btn">查看所有人员明细 </el-button>
              </el-form>
            </div>
            <div class="kq-table-day yf-payrolllist">
              <el-table :data="settle_list"  @row-click="gotoAttendanceDetail"
                border empty-text="暂无数据" >
                <el-table-column prop="worker_name" show-overflow-tooltip label="姓名" min-width="150" class-name="tablefirst"></el-table-column>
                <el-table-column prop="worker_phone" show-overflow-tooltip label="手机号" min-width="160">
                  <template slot-scope="scope">
                    <el-popover
                        placement="top"
                        title=""
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
                  <el-table-column prop="total_days"  show-overflow-tooltip label="出勤天数" min-width="160" ></el-table-column>
                </template>
                <el-table-column prop="total_hours" show-overflow-tooltip label="工时" min-width="160" ></el-table-column>
                <el-table-column prop="hourly_wage" show-overflow-tooltip label="时薪(元)" min-width="160" ></el-table-column>
                <el-table-column prop="total_wage" show-overflow-tooltip label="工资(元)" min-width="160" ></el-table-column>
                <el-table-column prop="total_tax_fee" show-overflow-tooltip label="税费(元)" min-width="160" ></el-table-column>
                <el-table-column prop="total_amount" show-overflow-tooltip label="合计(元)" min-width="160" ></el-table-column>
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
            <el-button type="primary" @click="confirmexit" class="confirm">确 定</el-button>
          </span>
        </el-dialog>
      </div>

  </div>

  <div class="protocol-dialog">
    <el-dialog title="提示" :visible.sync="dialogTableprotocol" size="tiny" :before-close="handleClose = false">
      <div>
        <div>
          <p style="color:red;font-size:16px;margin-bottom:8px">请注意：当前支付方式是{{payment_type_name}}</p>
        </div>
        <div>
          <div >
            <div>

            </div>
            <div>
              <span>未签订合同</span>
            </div>
          </div>

          <div  style="margin-top:10px">
            <div>

            </div>
            <div>
              <span>发薪信息未同步成功</span>
            </div>
          </div>
          <div style="margin-top:10px">
              <span>是否暂扣人员工资，继续支付其他人员工资？</span>
          </div>



        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button class="cancel" @click="dialogTableprotocol = false">再想想</el-button>
        <el-button type="primary" @click="rejectedconfirm(2)">继续支付其他人员工资</el-button>
      </span>
    </el-dialog>
  </div>
    <downloadList :dialogExportVisible="dialogVisibleExport" :type="4" :closeDialog="handleClickCloseDialog"/>
  </div>
</template>
<script>
import downloadList from "@/components/common/downloadList";

import * as util from '../assets/js/util.js'
let $ = require("jquery")
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
      seachInput:'',
      settle_total_wage:0,
      settle_total_attendancetime:0,
      settle_user_count:0,
      settle_total_amount: 0,
      settle_total_fee:0,
      settlement_info: {
            title: "",
            start_date:"",
            end_date: "",
            listing_status: ""
      },
      settle_list:[],
      searchPerson: '',


      dialogTableprotocol: false,
      PayListDetailHeight: 0,
      fixedbarwidth: 0,
      transform: false,
      showsetexit: false,
      fullscreenLoading: true,
      showsetdel: false,
      btnDisable: false,
      showrejected: false,
      foreachStar: [1, 2, 3, 4, 5],
      team_id: 0,
      project_id: 0,
      create_user_name: '',
      user_id: 0,
      settle_id: 0,
      export_wage_order: false,
      dialogVisibleExport: false,
      // unSignListLength: 0
    }
  },
  vuex: {
    getters: {

    },
    actions: {

    }
  },
  computed: {
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
      this.PayListDetailHeight = $('.side_bar').height() + 'px';
      if(util.getLocalStorage('projectStorageInfo') && util.getLocalStorage('projectStorageInfo').team_id) {
        this.team_id = util.getLocalStorage('projectStorageInfo').team_id
      }
      if(util.getLocalStorage('projectStorageInfo') && util.getLocalStorage('projectStorageInfo').project_id) {
        this.project_id = util.getLocalStorage('projectStorageInfo').project_id
      }
      if(document.URL.split('?')[1].split('&')[0].split('=')[1]) {
        this.settle_id = document.URL.split('?')[1].split('&')[0].split('=')[1]
      }
      this.getData()
    },

    gotoAttendanceDetail(row){
      this.$router.replace('SettlementDetail?settle_id='+this.settle_id+'&user_id='+row.work_no)
    },
    showAllDetail(){
      this.$router.replace('SettlementDetail?settle_id='+this.settle_id+'&user_id=0')
    },
    getData() {
      console.log(this.settle_id)
      util.ajax({
        url: '/thirdsettlement/overview',
        type: 'GET',
        data: {
          team_id: this.team_id,
          project_id: this.project_id,
          settle_id: this.settle_id,
          user_name:this.searchPerson,
          page_no: this.page_no,
          page_size: this.page_size,
        },
        timeout: 60000,
        success: (result) => {
          if (result && result.errno == 0) {
            this.total = result.data.total_num
            this.total_page = result.data.total_page
            this.settle_total_wage = result.data.settle_total_wage
            this.settle_total_attendancetime = result.data.settle_total_attendancetime
            this.settle_total_fee = result.data.settle_total_fee
            this.settle_user_count = result.data.settle_user_count
            this.settle_total_amount = result.data.settle_total_amount
            this.settlement_info = result.data.settlement_info
            this.settle_list = result.data.list
            this.fullscreenLoading = false;


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

    seachMember(){
      this.getData()
    },
    //导出工资单
    exportPayroll() {
      this.showsetexit = true
    },
    async confirmexit(){
      try {
        let res = await ajaxPromise({
          url: '/thirdsettlement/export',
          type: 'post',
          data: {
            team_id: this.team_id,
            project_id: this.project_id,
            settle_id :this.settle_id,
            type: 4,
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

      }
    },
    handleClickCloseDialog(){
      this.dialogVisibleExport = false;
    },
    //工资单位变为元
    formatter(row, column) {
      return (+row[column.property]) / 100
    },

    //返回列表
    goPayrollList() {
      this.$router.replace('billAllowanceManage')
    },
    //
    visibleChange(bln) {
      ;
      this.transform = bln
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
    console.log('this.$route', this.$route.query.ifConfirmEmail)
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
