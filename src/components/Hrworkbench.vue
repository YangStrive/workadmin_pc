<template>
  <div id="memberAdmin" style="margin: 0 0 20px 0">
    <div class="member-wapper">
      <h2>考勤管理</h2>
      <select-group-multi
        ref="profile"
        :all-groups="all_groups"
        v-on:confirmGroupSelecter="confirmGroupSelecter"
      ></select-group-multi>
      <!-- 搜索 -->
      <div class="seach-cout">
        <el-form label-width="40px" style="display:flex;flex-wrap:wrap;">
          <div class="from-item-list">
            <el-form-item label="姓名：">
              <el-input v-model="fromData.user_name" 
              style="width:100px"
              clearable auto-complete="off"></el-input>
            </el-form-item>
          </div>

          <div class="from-item-list">
            <el-form-item label="确认状态：" label-width="60px">
              <el-select
                v-model="fromData.confirm_status"
                class="mystatus"
                style="width:120px"
              >
                  <el-option
                  v-for="item in confirm_status"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                  >
                  </el-option>
              </el-select>
            </el-form-item>
          </div>
          <div class="from-item-list">
            <el-form-item label="结算状态：" label-width="60px">
              <el-select
                v-model="fromData.payment_status"
                class="mystatus"
                style="width:120px"
              >
                  <el-option
                  v-for="item in payment_status"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                  >
                  </el-option>
              </el-select>
            </el-form-item>
          </div>
          <div class="from-item-list">
              <el-form-item label="考勤日期" prop="kqDate" label-width="60px">
                  <el-date-picker v-model="fromData.kqDate" type="daterange" style="width:225px;"
                    :editable="false" placeholder="选择日期范围">
                  </el-date-picker>
            </el-form-item>
          </div>

          <div class="from-item-list">
            <el-button
              type="primary"
              @click="seachMember()"
              class="seach-btn"
            >搜 索</el-button>
          </div>
        </el-form>
        <el-form label-width="40px">
          <div class="from-item-list">
            <el-form-item
              label="操作："
              style="margin-bottom: 10px;"
            >
                <el-button
                  v-if="isdisabled"
                  type="primary"
                  :disabled="true"
                  class="sign-btn station disabled"
                >确认&nbsp;|&nbsp;作废</el-button>
                <el-button
                  v-else
                  type="primary"
                  class="sign-btn station default"
                  @click="selectPayStatus"
                >确认&nbsp;|&nbsp;作废</el-button>
            </el-form-item>
          </div>

          <div class="someTips">
            <div class="buttons">
              <div
                class="btn-item export"
                @click="exportMemberList"
              >
                <i class="export-icon"></i>
                <el-button type="text" @click="batchConfirm">批量确认</el-button>
              </div>
            </div>
          </div>
        </el-form>
      </div>
      <!-- 人员管理表单 -->
      <div class="from-member">
        <el-table
          :data="tableData.user_list"
          tooltip-effect="dark"
          style="width: 100%"
          border
          :height="winHeight"
          v-loading.body="loading"
          @selection-change="handleSelectionChange"
        >
          <el-table-column
            type="selection"
            className="noclick"
            fixed
            width="55"
          >
          </el-table-column>

          <el-table-column
            label="小组"
            show-overflow-tooltip
            label-class-name="border"
            width="150"
          >
            <template slot-scope="scope">
              <span class="user-name">
                {{ scope.row.group_name }}
              </span>
            </template>
          </el-table-column>

          <el-table-column
            label="姓名"
            show-overflow-tooltip
            label-class-name="border"
            width="130"
          >
            <template slot-scope="scope">
              <span class="user-name">
                {{ scope.row.worker_name }}
              </span>
            </template>
          </el-table-column>
          <el-table-column
            label="手机号"
            label-class-name="border"
            min-width="120"
          >
            <template slot-scope="scope">
              <el-popover
                placement="top"
                title=""
                width="120"
                trigger="hover">
                <span style="margin-left:35px">{{scope.row.worker_phone}}</span>
                <span slot="reference">{{scope.row.worker_phone.substr(0,3)+"****"+scope.row.worker_phone.substr(7)}}</span>
              </el-popover>
            </template>
          </el-table-column>
          <el-table-column
            label="身份证号"
            label-class-name="border"
            min-width="120"
          >
            <template slot-scope="scope">
              <el-popover
                placement="top"
                title=""
                width="120"
                trigger="hover">
                <span style="margin-left:10px">{{scope.row.worker_identitycard}}</span>
                <span slot="reference">{{scope.row.worker_identitycard.substr(0,3)+"****"+scope.row.worker_identitycard.substr(14)}}</span>
              </el-popover>
            </template>
          </el-table-column>
          <el-table-column
            label="考勤日期"
            show-overflow-tooltip
            label-class-name="border"
            min-width="120"
          >
            <template slot-scope="scope">
              <span>{{ scope.row.attendancedate }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="工时"
            show-overflow-tooltip
            label-class-name="border"
            min-width="120"
          >
            <template slot-scope="scope">
              <span>{{ scope.row.actual_attendancetime }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="金额"
            show-overflow-tooltip
            label-class-name="border"
            min-width="120"
          >
            <template slot-scope="scope">
              <span>{{ scope.row.amount }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="确认状态"
            show-overflow-tooltip
            label-class-name="border"
            min-width="120"
          >
            <template slot-scope="scope">
              <span>{{ scope.row.pay_status }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="结算状态"
            show-overflow-tooltip
            label-class-name="border"
            min-width="120"
          >
            <template slot-scope="scope">
              <span>{{ scope.row.payment_status }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <!-- 分页组件 -->
      <div
        class="page"
        v-if="tableData.total_page != 0"
      >
        <div class="block">
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentPageChange"
            :current-page.sync="currentPage"
            :page-size="20"
            layout="total, prev, pager, next"
            :page-count="tableData.total_page"
            :total="tableData.total_num"
          >
          </el-pagination>
        </div>
      </div>
    </div>

    <!-- 弹层————更改确认状态 -->
    <div class="dialog-group-select">
      <el-dialog
        title="提示"
        class="size-dialog"
        @close="cancelBtn"
        :visible.sync="dialogPayStatusSelect"
        size="tiny"
      >
        <h3>确认状态：</h3>
        <div
          class="station"
          style="position: relative;"
        >
          <el-select
            v-model="currSelectPayStatus"
            filterable
            placeholder="请选择"
            style="width:100%;height:150px;"
          >
            <el-option
              v-for="item in confirm_status"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            >
            </el-option>
          </el-select>
        </div>
        <span
          slot="footer"
          class="dialog-footer"
        >
          <el-button
            class="btn1"
            @click="cancelBtn"
          >取 消</el-button>
          <el-button
            class="btn2"
            type="primary"
            @click="commitChangePayStatus"
          >确 定</el-button>
        </span>

      </el-dialog>
    </div>

  </div>

</template>

<script>
import * as util from "../assets/js/util.js";
let $ = require("jquery");
export default {
  name: "memberAdmin",
  components: {
  },
  data: function() {
    return {
      searchData: {},
      loading: false,
      pream: 1,
      winHeight: "",
      team_id: "",
      project_id: "",
      curr_login_user_id: "",
      seachData: "",
      /*人员列表表格相关部分*/
      tableData: {
        user_list: [],
        total_num: "",
        total_page: ""
      },
      page_no: 1,
      currentPage: 1, // 分页--当前显示页码
      currSelectMemberData: "", //复选框--当前选择的人员数据
      fromData: {
        user_name: "", //人员搜索
        kqDate:"",
        confirm_status:"",
        payment_status:"",
        currSeachRester: "",
      },
      dialogPayStatusSelect:false,
      showStationName: [],
      user_list: [],
      isdisabled:true,
      confirm_status: [
        // { id: -99, name: "全部" },
        // { id: 0, name: "未确认" },
        { id: 20, name: "店长已确认" },
        { id: 50, name: "HR已确认" },
        { id: -1, name: "驳回" }
      ],
      payment_status:[
        // { id: -99, name: "全部" },
        { id: 0, name: "未发起结算" },
        { id: 1, name: "已发起结算" },
      ],
      currSelectPayStatus:'',
    };
  },
  computed: {},
  watch: {
    filterText(val) {
      this.$refs.all_groups.filter(val);
    },
    $route() {
      this.init();
    }
  },
  methods: {
    closeDialog() {
      this.getMemberList();
    },
    init() {
      util.setLocalStorage("origin_selected_groups", []);
      this.team_id = util.getLocalStorage("projectStorageInfo").team_id;
      this.project_id = util.getLocalStorage("projectStorageInfo").project_id;
      this.curr_login_user_id = util.getLocalStorage("currLoginUserId");
      //获取人员列表
      this.getMemberList();
    },

    //获取人员列表
    getMemberList() {
      setTimeout(() => {
        $(".el-table__body-wrapper").scrollTop(0);
      });
      
      if (this.pream == 1) {
        this.loading = true;
      }
      let _data = {
        team_id: this.team_id,
        project_id: this.project_id,
        page_no: this.seachData != "" ? "" : this.page_no,
        page_size: this.seachData != "" ? "" : 20,
        user_name: this.fromData.user_name,
        confirm_status: this.fromData.confirm_status,
        payment_status: this.fromData.payment_status,
        start_date: util.formatData1(this.fromData.kqDate[0]),
        end_date: util.formatData1(this.fromData.kqDate[1]),
      };
      console.log(_data);
      util.ajax({
        url: "/confirm/workbench/attendance/list",
        type: "GET",
        data: _data,
        timeout: 10000,
        success: obj => {
          this.loading = false;
          if (obj && obj.errno == 0) {
            this.tableData = obj.data;

            console.log(this.tableData);
          } 
        },
        error: (xhr, status) => {
          this.loading = false;
          this.$message({
            showClose: true,
            message: "网络连接失败，请检查网络",
            type: "warning"
          });
        },
        noNetwork: () => {
          this.loading = false;
          //网络超时
          this.$message({
            showClose: true,
            message: "网络连接失败，请检查网络",
            type: "warning"
          });
        }
      });
    },

    /*********************列表部分*********************/
    //表单全选操作或单选复选款操作
    handleSelectionChange(val) {
      this.currSelectMemberData = val;
      if (val.length) {
        this.isdisabled = false;
      } else {
        this.isdisabled = true;
      }
    },

    /*分页操作*/
    handleSizeChange(val) {
      // console.log(`每页 ${val} 条`);
    },
    handleCurrentPageChange(val) {
      this.page_no = val;
      this.getMemberList();
    },


    /******************弹窗————选择状态*******************/

    selectPayStatus() {
      this.dialogPayStatusSelect = true;
    },
    commitChangePayStatus() {
      console.log(this.currSelectPayStatus);
      let _id_list = [];
      this.currSelectMemberData.forEach(o => {
        _id_list.push(o.id);
      });
      util.ajax({
        url: "/confirm/workbench/attendance/update",
        type: "POST",
        data: {
          team_id: this.team_id,
          project_id: this.project_id,
          pay_status: this.currSelectPayStatus,
          id_list: _id_list.join(",")
        },
        timeout: 10000,
        success: obj => {
          // console.log(obj)
          if (obj && obj.errno == 0) {
            this.dialogPayStatusSelect = false;
            this.currSelectPayStatus = "";
            this.getMemberList();
            this.$message({
              showClose: true,
              message: "修改成功",
              type: "success"
            });
          }else{
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
    },
    cancelBtn() {
      this.dialogPayStatusSelect = false;
      this.currSelectPayStatus = "";
    },

    //搜索按钮
    seachMember() {
      this.page_no = 1;
      this.currentPage = 1;
      this.getMemberList();
    },
    batchConfirm(){
      this.$router.push('AttendanceConfirm')
    }

  },
  mounted() {
    this.init();
    let that = this;
    $(window).click(() => {
      that.isshow = false;
    });
    let oldH = $(window).height();
    this.winHeight = $(window).height() - 300 - 10;
    $(window).resize(function() {
      that.winHeight = $(window).height() - 300 - 10;
      if ($(window).height() == oldH) {
        that.winHeight = $(window).height() - 300 - 10;
      }
    });
  },
  watch: {
    $route(to, from) {
      this.getIsNxProject();
    },
    "ruleForm.group_id"(){
      console.log('changeeeee');
      this.getCustomFields(this.ruleForm.group_id)
    },
  },
};
</script>

<style  src='../assets/css/member.css'></style>
