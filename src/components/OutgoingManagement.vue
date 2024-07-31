<template>
  <div class="departure-manage" id="departure-manage" style="margin: 0 0 20px 0">
    <div class="header-title">
      <h2>外出管理</h2>
    </div>
    <div class="select-status">
      <div class="status-main">
        <el-form label-width="90px">
          <div class="from-item-list">
            <el-form-item label="状态：">
              <el-select v-model="fromData.status" class="mystatus" style="width:100px">
                <template v-for="item in statusArr">
                  <el-option :key="item.id" :label="item.text" :value="item.id">
                  </el-option>
                </template>
              </el-select>
            </el-form-item>
          </div>
          <div class="from-item-list">
            <el-form-item label="开始日期：">
              <!-- 开始日期-->
              <el-date-picker
                v-model="fromData.start_at"
                type="date"
                placeholder="选择日期"
                style="width: 135px"
                value-format="yyyy-MM-dd"
                format="yyyy-MM-dd"
                :picker-options="pickerDisabled"
                clearable>
              </el-date-picker>
            </el-form-item>
          </div>
          <div class="from-item-list">
            <el-form-item label="结束日期：">
              <!-- 开始日期-->
              <el-date-picker
                v-model="fromData.end_at"
                type="date"
                placeholder="选择日期"
                style="width: 135px"
                value-format="yyyy-MM-dd"
                format="yyyy-MM-dd"
                :picker-options="pickerDisabled"
                clearable>
              </el-date-picker>
            </el-form-item>
          </div>
          <div class="from-item-list">
            <el-form-item label="人员：">
              <el-autocomplete popper-class="my-autocomplete2" style="width:135px;" v-model="fromData.member" :fetch-suggestions="querySearch" custom-item="my-item-zh" :trigger-on-focus="false" placeholder="姓名/手机号" @select="handleSelect">
              </el-autocomplete>
            </el-form-item>
          </div>
          <div class="from-item-list">
            <el-button type="primary" @click="seachMember" class="seach-btn">搜 索</el-button>
          </div>
        </el-form>
      </div>
    </div>
    <div class="depManTable">
      <el-table :height="tableHeight" v-loading.body="loading" :data="tableData" border style="width: 100%">
        <el-table-column prop="name" label="申请人" width="100">
        </el-table-column>
        <el-table-column prop="mobile" label="手机号" width="130">
        </el-table-column>
        <el-table-column prop="create_at" label="申请时间" width="130">
        </el-table-column>
        <el-table-column prop="change_start_at" label="外出开始时间" width="150">
        </el-table-column>
        <el-table-column prop="change_end_at" label="外出结束时间" width="150">
        </el-table-column>
        <el-table-column prop="target_group_name" label="外出地" width="150">
        </el-table-column>
        <el-table-column prop="current_group_name" label="隶属地" width="150">
        </el-table-column>
        <el-table-column prop="apply_reason" class="leave_reason" min-width="130" label="外出原因">
          <template slot-scope="scope">
            <span class="leave_reason">{{ scope.row.apply_reason}}</span>
          </template>
        </el-table-column>
        <el-table-column label="处理状态" width="120" prop="apply_status_str">
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template slot-scope="scope">
            <div v-if="scope.row.status == 1 && scope.row.is_approve == 1" class="doBtn">
              <button :class="['approval']" type="text"  @click="changeStoreApprove(scope.row,'2')">批准</button>
              <button :class="['refused']" type="text"  @click="changeStoreApprove(scope.row,'3')">拒绝</button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <div class="page depart-page" v-if="total_page > 0">
        <div class="block">
          <el-pagination @current-change="handleCurrentChange" :page-size="page_size" layout="total, prev, pager, next" :page-count="total_page" :total="total_num">
          </el-pagination>
        </div>
      </div>
    </div>
    <div class="dialog-deparapp">
      <el-dialog title="审批意见" :visible.sync="dialogDepRef" @close="resetFormRef('changeStoreRef')" size="tiny">
        <div class="myform">
          <el-form :model="changeStoreFrom" label-width="115px"  ref="changeStoreRef" class="demo-ruleForm">
            <el-form-item label="审批意见" class="depart-desc" prop="audit_refuse_reason">
              <el-input type="textarea" placeholder="请输入审批意见" v-model="changeStoreFrom.reason"></el-input>
            </el-form-item>
          </el-form>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button @click="resetFormRef('changeStoreRef')" class="btn1">取 消</el-button>
          <el-button type="primary" @click="submitFormFef('changeStoreRef')" class="btn2">确 定</el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import * as util from '../assets/js/util.js'
export default {
  name: 'departure-manage',
  components: {

  },
  data: function () {
    var auditRefuseReasonReg = (rule, value, callback) => {
      let vald = value.replace(/\s+/g, "");
      console.log(vald, !vald)
      if (!vald) {
        return callback(new Error('请输入拒绝离职原因'));
      } else {
        callback();
      }
    };
    return {
      pickerDisabled: {
      },
      btndis: false,
      loading: true,
      dialogDepApp: false,
      dialogDepRef: false,
      dialogDepAppView: false,
      dialogDepRefView: false,
      tableData: [],
      reasonArr: [],
      //拒绝离职
      changeStoreFrom: {
        reason:'',

      },
      rules: {
        audit_refuse_reason: [
          { required: true, validator: auditRefuseReasonReg, trigger: 'blur' }
        ]
      },
      total_page: '',
      page_size: 20,
      page_no: 1,
      currentPage: 1,
      total_num: '',
      project_id: '',
      team_id: '',
      status: 1,//1待审批 2 已审批
      tableHeight: 0,
      fromData: {
        status: 1,
        start_at: '',
        end_at: '',
        member: '',
      },
      seachData: "",
      states: [],
      statusArr: [
        {
          id: 1,
          text: "待审批"
        },
        {
          id: 2,
          text: "已审批"
        },
      ],
      rowData: {},
      timer: null,
      current_user_role_id: '',
      project_type: null,
      applyType:''
    }
  },
  computed: {

  },
  watch: {
    '$route'() {
      this.init();
    }
  },
  methods: {
    init() {
      this.tableHeight = window.innerHeight - 249;
      this.team_id = util.getLocalStorage('projectStorageInfo').team_id
      this.project_id = util.getLocalStorage('projectStorageInfo').project_id
      this.page_no = 1;
      this.status = 1;
      this.btndis = false;
      this.loading = true;
      this.getDepartureList();
    },
    /*
    获取离职列表
     */
    getDepartureList() {
      util.ajax({
        url: '/changestore/audit_list',
        type: 'GET',
        data: {
          team_id: this.team_id,
          project_id: this.project_id,
          status: this.fromData.status,
          start_at: util.formatData1(this.fromData.start_at),
          end_at: util.formatData1(this.fromData.end_at),
          member: this.seachData,
          pageSize: this.page_size,
          page: this.page_no
        },
        timeout: 10000,
        success: (obj) => {
          if (obj && obj.errno == 0) {
            let data = obj.data;
            if (data.list && data.list.length > 0) {
              data.list.forEach(item => {
                item.iBtnText = '离职证明';
                item.iDisabledFlag = false;
              });
            }
            this.tableData = data.list;
            this.total_page = data.total_page;
            this.total_num = data.total_num
          } else {
            this.$message({
              showClose: true,
              message: obj.errmsg,
              type: 'warning'
            });
          }
          this.loading = false;
        },
        error: (xhr, status) => {
          this.$message({
            showClose: true,
            message: '网络连接失败，请检查网络',
            type: 'warning'
          });
          this.loading = false;
        },
        noNetwork: () => {
          //网络超时
          this.$message({
            showClose: true,
            message: '网络连接失败，请检查网络',
            type: 'warning'
          });
          this.loading = false;
        }
      })
    },

    //人员检索
    querySearch(queryString, cb) {
      if (queryString) {
        this.fromData.currSeachRester = "";
        this.states = [];
        util.ajax({
          url: "/group/member_search",
          type: "GET",
          data: {
            team_id: this.team_id,
            project_id: this.project_id,
            group_id: "",
            keyword: queryString,
            page_no: "",
            page_size: ""
          },
          timeout: 10000,
          success: obj => {
            if (obj && obj.errno == 0) {
              let strArr = [];
              obj.data.list.forEach(o => {
                let str = "";
                str = {
                  value: o.user_name,
                  group_name: o.group_name,
                  group_id: o.group_id,
                  user_id: o.user_id
                };
                strArr.push(str);
              });
              this.restaurants = strArr;
              var results = queryString
                ? this.restaurants.filter(this.createFilter(queryString))
                : this.restaurants;
              if (results.length == 0) {
                results.push({ value: "无搜索结果", status: "-1" });
              }
              this.states = results;
              clearTimeout(this.timeout);
              this.timeout = setTimeout(() => {
                // 调用 callback 返回建议列表的数据
                cb(results);
              }, 1000 * Math.random());
            } else {
              this.$message({
                showClose: true,
                message: obj.errmsg,
                type: "warning"
              });
            }
          },
          error: (xhr, status) => {
            this.$message({
              showClose: true,
              message: "网络连接失败，请检查网络",
              type: "warning"
            });
          },
          noNetwork: () => {
            //网络超时
            this.$message({
              showClose: true,
              message: "网络连接失败，请检查网络",
              type: "warning"
            });
          }
        });
      }
    },
    createFilter(queryString) {
      return restaurant => {
        return (
          restaurant.value.toLowerCase() ||
          restaurant.value.indexOf(queryString) > -1
        );
      };
    },
    //搜索建议列表选择赋值
    handleSelect(item) {
      if (item.status == -1) {
        this.fromData.member = "";
        this.fromData.currSeachRester = "";
      } else {
        this.fromData.currSeachRester = item;
      }
    },

    changeStoreApprove(row,type) {
      this.applyType = type;
      this.changeStoreFrom.id = row.id;
      this.changeStoreFrom.reason = '';
      this.dialogDepRef = true;
    },

    //搜索按钮
    seachMember() {
      this.page_size = 20;
      this.page_no = 1;
      if (
        this.fromData.currSeachRester.user_id &&
        this.fromData.currSeachRester.user_id != -1
      ) {
        this.seachData = this.fromData.currSeachRester.user_id;
      }
      this.getDepartureList();
    },

    //提交审批
    submitFormFef(formName) {
      let that = this;
      if(this.btndis) return;
      this.btndis = true;

      if(this.applyType === '3' && !this.changeStoreFrom.reason){
        this.$message({
          showClose: true,
          message: '请输入拒绝原因',
          type: 'warning'
        });
        this.btndis = false;
        return;

      }
      let data = {
        id: this.changeStoreFrom.id,
        project_id: this.project_id,
        team_id: this.team_id,
        reason: this.changeStoreFrom.reason,
        action: this.applyType
      };
      util.ajax({
        url: '/changestore/approve',
        type: 'POST',
        data: data,
        timeout: 10000,
        success: (obj) => {
          if (obj && obj.errno == 0) {
            this.$message({
              showClose: true,
              message: '操作成功',
              type: 'success'
            });
            this.getDepartureList()
            this.dialogDepRef = false;
          } else {
            this.$message({
              showClose: true,
              message: obj.errmsg,
              type: 'warning'
            });
          }
          this.btndis = false;
        },
        error: (xhr, status) => {
          this.$message({
            showClose: true,
            message: '网络连接失败，请检查网络',
            type: 'warning'
          });
          this.dialogDepRef = false;
          this.btndis = false;
        },
        noNetwork: () => {
          //网络超时
          this.$message({
            showClose: true,
            message: '网络连接失败，请检查网络',
            type: 'warning'
          });
          this.dialogDepRef = false;
          this.btndis = false;
        }
      })
    },

    resetFormRef(formName) {
      this.dialogDepRef = false;
    },

    handleCurrentChange(val) {
      this.page_no = val;
      this.loading = true;
      this.getDepartureList();
    },
  },
  created() {
    this.init()

  },
  mounted() {
  }
}
</script>


<style  src='../assets/css/DepartureManage.css'></style>

<style  src='../assets/css/reset.css'></style>
