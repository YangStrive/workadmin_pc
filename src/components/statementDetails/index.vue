<template>
    <div class="ssTab_wrap">
      <h1 class="ss_title">社保管理</h1>
      <div class="form_wrap">
        <el-form :inline="true" :model="formInline" class="demo-form-inline">
          <el-form-item label="人员信息：">
            <el-input v-model="formInline.user" placeholder="姓名/身份证号"></el-input>
          </el-form-item>
          <el-form-item label="账单月份">
            <el-date-picker v-model="formInline.billMonth" type="month" placeholder="请选择">
            </el-date-picker>
          </el-form-item>
          <el-form-item label="供应商名称：">
            <el-select v-model="formInline.supplier_name" placeholder="请选择" style="width:100%" clearable>
              <el-option v-for="(item, index) in (searchData.supplier||[])" :label="item" :key="index" :value="item"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onSubmit">搜索</el-button>
            <el-button type="info" plain @click="resetFun">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      <div class="table_wrap">
        <div class="table_operate">
          <!-- 操作：
          <span>
            <el-button type="danger" @click="deleteFun">删除</el-button>
          </span> -->
          <span class="operate_wrap">
            <!-- <el-button class="batchBtn" type="text" @click="addImport">
              <span style="font-size:14px">账单导入</span>
            </el-button> -->
            <el-button class="batchBtn" type="text" @click="billExport">
              <span style="font-size:14px">账单导出</span>
            </el-button>
          </span>
        </div>
        <div class="table_list">
          <el-table ref="multipleTable" :data="tableData" border tooltip-effect="dark" style="width: 100%" @selection-change="handleSelectionChange">
            <el-table-column label="滞纳金" prop="late_fee" width="100">
            </el-table-column>
            <el-table-column label="其他费用" prop="other_fee" width="100">
            </el-table-column>
            <el-table-column label="服务费" prop="service_fee" width="100">
            </el-table-column>
            <el-table-column label="社保公积金企业小计" prop="company_total" width="150">
            </el-table-column>
            <el-table-column label="社保公积金个人小计" prop="person_total" width="150">
            </el-table-column>
            <el-table-column label="总合计(含服务费)" prop="total" width="150">
            </el-table-column>
            <el-table-column label="备注" prop="remark">
            </el-table-column>

          </el-table>
          <!--分页-->
          <div class="pagination">
            <el-pagination background @current-change="handleCurrentPageChange" :current-page.sync="page_no" :page-size="page_size" layout="total, prev, pager, next" :total="total_num">
            </el-pagination>
          </div>
        </div>
      </div>
      <!-- 新增导入 -->
      <ssBillImport ref="importRef" :tempHref="searchData.social_security_bill_template" :userInfo="userInfo" @updateListFun="updateListFun"></ssBillImport>
      <!-- 账单导出 -->
      <ssBillExport ref="exportRef" :requestUrl="requestUrl_export" :resultUrl="resultUrl_export" :exportParams="exportParams" :resultParams="resultParams"   @updateListFun="updateListFun"></ssBillExport>
    </div>

  </template>
  
  <script>
  import * as util from "@/assets/js/util.js";
  import ssBillImport from "../ssBillImport.vue";
  import ssBillExport from "../ssBillExport.vue";
  import mixinAll from '@/mixins/searchMixin.js'
  let mixinInstance = new mixinAll({
    list_type: 1
  })
  
  export default {
    name: "",
    components: {
      ssBillImport,
      ssBillExport
    },
    props: {},
    mixins: [mixinInstance],
    data() {
      return {
        searchData: {},
        userInfo: {},
        formInline: {
          user: '',
          billMonth: '',
          supplier_name: '',
        },
        tableData: [],
        multipleSelection: [],
        total_num: 0,
        page_size: 10,
        page_no: 1,
        selectedArr: [],
        requestUrl_export: '/fulltimess/social_security_bill/export',  // 导出名单
        resultUrl_export: '/fulltimess/social_security_bill/get_export_result',  // 导出名单结果查询
        exportParams: {},
        resultParams: {}
      }
    },
    computed: {
  
    },
    watch: {
  
    },
    mounted() {
      this.init()
    },
    methods: {
      init() {
        this.getUserinfo()
        this.team_id = util.getLocalStorage('projectStorageInfo').team_id
        this.project_id = util.getLocalStorage('projectStorageInfo').project_id
        // console.log('this.team_id===', this.team_id)
        // console.log('this.project_id===', this.project_id)
        this.getList()
      },
      onSubmit() {
        this.page_no = 1;
        this.page_size = 10;
        this.getList();
      },
      resetFun() {
        this.formInline = {
          user: '',
          billMonth: '',
          supplier_name: ''
        }
      },
      handleSelectionChange(val) {
        this.multipleSelection = val;
      },
      handleCurrentPageChange(val) {
        this.page_no = val;
        this.getList();
      },
      updateListFun() {
        this.page_no = 1;
        this.getList();
      },
      getList() {
        let current_billing_month = ''
        if (this.formInline.billMonth) {
          current_billing_month = util.formatData1(this.formInline.billMonth)
        }
        const currParams = {
          page: this.page_no,
          pageSize: this.page_size,
          current_billing_month,
          saas_project_id: this.project_id,
          supplier_name: this.formInline.supplier_name,
          user_info: this.formInline.user,
        };
        util.ajax({
          url: '/fulltimess/social_security_bill',
          data: currParams,
          type: 'POST',
          success: (res) => {
            if (res.errno == 0) {
              this.tableData = res.data.list;
              this.total_num = Number(res.data.total_num) || 0;
            } else {
              this.$message({
                showClose: true,
                message: res.errmsg,
                type: 'warning'
              });
            }
          },
          error: (xhr, status) => {
            console.log('xhr==', xhr)
          },
          noNetwork: () => {
            // 网络超时
            this.$message({
              showClose: true,
              message: '网络连接失败，请检查网络',
              type: 'warning'
            });
          }
        })
      },
      handleSelectionChange(val) {
        this.selectedArr = val
      },
      deleteFun() {
        if (this.selectedArr.length === 0) {
          this.$message({
            showClose: true,
            message: '删除前请先勾选列表项',
            type: 'warning'
          });
          return;
        }
        const prepay_ids = [];
        this.selectedArr.forEach(item => {
          prepay_ids.push(item.id)
        })
        const currParams = {
          prepay_ids: prepay_ids.join(','),
          user_name: this.userInfo.name
        };
        util.ajax({
          url: '/fulltimess/social_security_bill/delete',
          data: currParams,
          type: 'POST',
          success: (res) => {
            if (res.errno == 0) {
              this.$message({
                message: '删除成功',
                type: "success",
              });
              this.page_no = 1;
              this.getList();
            } else {
              this.$message({
                showClose: true,
                message: res.errmsg,
                type: 'warning'
              });
            }
          },
          error: (xhr, status) => {
            console.log('xhr==', xhr)
          },
          noNetwork: () => {
            // 网络超时
            this.$message({
              showClose: true,
              message: '网络连接失败，请检查网络',
              type: 'warning'
            });
          }
        })
      },
      // 新增导入
      addImport() {
        this.$refs.importRef.dialogImport = true;
      },
      // 账单导出
      billExport() {
        let current_billing_month = ''
        if (this.formInline.billMonth) {
          current_billing_month = util.formatData1(this.formInline.billMonth)
        }
        const exportParams = {
          current_billing_month,
          saas_project_id: this.project_id,
          supplier_name: this.formInline.supplier_name,
          user_info: this.formInline.user,
          platform: 'saas'
        };
        const resultParams = {
          saas_project_id: this.project_id,
          list_type: 2,
        }
        this.exportParams = exportParams;
        this.resultParams = resultParams;
        setTimeout(()=> {
          this.$refs.exportRef.submitImport();
        }, 500)
      },
      // 获取用户信息
      getUserinfo() {
        util.ajax({
          url: '/cloud/banner/get',
          type: 'GET',
          data: {
            team_id: 0,
            project_id: 0
          },
          timeout: 10000,
          success: (obj) => {
            // console.log(obj)
            if (obj && obj.errno == 0) {
              this.userInfo = obj.data.setting_data.user
            }
          },
          error: (xhr, status) => {
  
          },
          noNetwork: () => {
            //网络超时
            this.$message({
              showClose: true,
              message: '网络连接失败，请检查网络',
              type: 'warning'
            });
          }
        })
      },
    },
  }
  </script>
  <style scoped>
  .ssTab_wrap {
    padding: 16px 20px 0 20px;
    margin: 0 0 20px 0;
    }
    .ss_title {
    font-size: 16px;
    font-weight: 600;
    text-align: left;
    color: #475568;
    margin: 0 0 15px 0;
    }
  .table_operate {
    margin: 0 0 10px 0;
  }
  .operate_wrap {
    float: right;
    margin-top: 5px;
    font-size: 16px;
  }
  .operate_wrap .batchBtn {
    margin-right: 5px;
  }
  .downDialog div {
    font-size: 14px;
  }
  .downBody {
    margin: 10px 20px;
    font-size: 14px;
  }
  .downPersons {
    margin: 15px 0;
  }
  .downPersons span {
    font-size: 14px;
  }
  .downTips {
    color: red;
  }
  .quitSelect {
    margin: 20px 0;
  }
  .quitSelect span {
    font-size: 14px;
  }
  .quitSelect2 {
  }
  .ss_check {
    margin: 0 0 5px 0;
  }
  .pagination {
    display: flex;
    justify-content: flex-end;
}
  </style>
  