<template>
	<div class="SocialSecurity">
    <div class="s-wapper">
      <!-- <h2>社保管理</h2> -->
      <div class="search">
        <el-form :inline="true" :model="form" class="demo-form-inline">
          <el-form-item label="月份：">
            <el-date-picker
              v-model="form.month"
              type="month"
              placeholder="选择月">
            </el-date-picker>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="getSSList('search')">搜 索</el-button>
          </el-form-item>
        </el-form>
      </div>
      
      <div class="table_operate">
        操作：
        <span>
          <el-button type="primary" @click="handleClickCreateRecon">创建对账单</el-button>
        </span>
      </div>
      <div class="table">
        <el-table
          :data="tableData"
          border
          style="width: 100%">
          <!--月份、缴纳人数、项目名、企业合计、个人合计、服务费合计、总计、状态-->
          <el-table-column prop="month" label="月份" />
          <el-table-column prop="count" label="缴纳人数" />statementDetails
          <el-table-column prop="saas_project_name" label="项目名" />
          <el-table-column prop="enterprise_toal_money" label="企业合计" />
          <el-table-column prop="personal_total_money" label="个人合计" />
          <el-table-column prop="service_total_money" label="服务费合计" />
          <el-table-column prop="total_money" label="总计" />
          <el-table-column prop="status" label="状态" >
            <template slot-scope="scope">
              <el-tag  v-if="scope.row.status == 0" type="info">待生成</el-tag>
              <el-tag  v-if="scope.row.status == 1" type="info">生成中</el-tag>
              <el-tag  v-if="scope.row.status == 2" type="success">已生成</el-tag>
              <el-tag  v-if="scope.row.status == 3" type="warning">已锁定</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150">
            <template slot-scope="scope">
              <el-button type="text" @click="handleClickUnlock(scope.row.id,$event)" v-if="scope.row.status == 3">解锁</el-button>
              <el-button type="text" @click="handleClickLock(scope.row.id,$event)" v-if="scope.row.status == 2">锁定</el-button>
              <el-button type="text" @click="gotoMemberInfoList(scope.row)" >详情</el-button>
            </template>
          </el-table-column>
        </el-table>
        <!--分页-->
        <div class="pagination" style="float: right;" v-if="total_num">
          <el-pagination
            background
            @current-change="handleCurrentPageChange"
            :current-page.sync="currentPage"
            :page-size="20"
            layout="total, prev, pager, next"
            :page-count="total_page"
            :total="total_num">
          </el-pagination>
        </div>
      </div>
    </div>

  <!--添加社保 弹层-->
    <div class="dialog-adds">
      <el-dialog
        title="请选月份"
        :visible.sync="dialogAddS"
        @close="resetForm('ruleForm')">
          <div>
            <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="80px" class="demo-ruleForm">
            <el-form-item label="月份：" prop="month" >
              <el-date-picker
                v-model="ruleForm.month"
                type="month"
                placeholder="选择月">
              </el-date-picker>
            </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer footerdiv">
              <el-button @click="resetForm('ruleForm')">取 消</el-button>
              <el-button type="primary" @click="submitForm('ruleForm')">创 建</el-button>
            </span>
          </div>
      </el-dialog>
    </div>

	</div>
</template>

<script>
import $ from 'jquery'
import * as util from '@/assets/js/util.js'

export default {
  	name: 'SocialSecurity',
  	data () {
    	return {
        dialogAddS:false,
        team_id:'',
        project_id:'',
        form:{
          month:''
        },
        tableData:[],
        ruleForm:{
          month:'',
        },
        montharr:[
          {label:'01',value:'01'},
          {label:'02',value:'02'},
          {label:'03',value:'03'},
          {label:'04',value:'04'},
          {label:'05',value:'05'},
          {label:'06',value:'06'},
          {label:'07',value:'07'},
          {label:'08',value:'08'},
          {label:'09',value:'09'},
          {label:'10',value:'10'},
          {label:'11',value:'11'},
          {label:'12',value:'12'}
        ],
        montharr2:[],
        rules: {
          month: [
            { required: true, message: '请选择月份', trigger: 'blur',type:'date' }
          ]
        },
        page_no:1,
        currentPage: 1, // 分页--当前显示页码
        total_num:'',
        total_page:'',
        exist_year_month:[]
    	}
  	},
  	methods: {
    	init() {
        this.team_id = util.getLocalStorage('projectStorageInfo').team_id
        this.project_id = util.getLocalStorage('projectStorageInfo').project_id
        //获取社保列表
        this.getSSList()
    	},
      //去往社保详情列表页
      gotoMemberInfoList(row){
        //util.setLocalStorage('currUserInfoData',row)
        this.$router.push({ path: 'StatementDetails', query: {ssas_id: row.id}})
      },
      // 创建提交
      submitForm(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            ///ss/accountstatement/make
            util.ajax({
              url:'/ss/accountstatement/make',
              type:'POST',
              data:{
                team_id: this.team_id,
                project_id: this.project_id,
                month: util.getLocalTime(this.ruleForm.month,'yyyy-MM'),
                is_save: 1,
              },
              timeout:10000,
              success:(obj) => {
                if(obj && obj.errno == 0){
                  this.$message({
                    showClose: true,
                    message: '创建成功',
                    type: 'success'
                  });
                  this.dialogAddS = false
                  this.getSSList()
                }else{
                  this.$message({
                    showClose: true,
                    message: obj.errmsg,
                    type: 'warning'
                  });
                }
              },   
              error: (xhr, status) => {
                
              },
              noNetwork: () => {
                //网络超时
              }
            })
          } else {
            // console.log('error submit!!');
            return false;
          }
        });
      },
      //取消
      resetForm(formName) {
          this.dialogAddS = false
          this.$refs[formName].resetFields();
      },
      handleCurrentPageChange(val) {
        this.page_no = val
        this.getSSList()
      },


      getSSList(pre){
        let time = ''
        if(pre){
          this.page_no = 1
          if(this.form.month){
            time = util.getLocalTime(this.form.month,'yyyy-MM')
            time = time+'-01'
          }else{
            time = ''
          }
        }else{
          time = ''
        }
        
        util.ajax({
            url:'/ss/accountstatement/list',
            type:'GET',
            data:{
                team_id: this.team_id,
                project_id: this.project_id,
                month:time,
                page:this.page_no,
                page_size:20
            },
            timeout:10000,
            success:(obj) => {
              if(obj && obj.errno == 0){
                  this.tableData = obj.data.list
                  this.total_num = obj.data.total_num
                  this.total_page = obj.data.total_page            
              }else{
                this.$message({
                    showClose: true,
                    message: obj.errmsg,
                    type: 'warning'
                });
              }
            },   
            error: (xhr, status) => {
              
            },
            noNetwork: () => {
              //网络超时
            }
        })
      },

      handleClickLock(ssas_id,ev){
        ev.stopPropagation()
        this.$confirm('是否锁定该对账单？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          ///ss/accountstatement/lock
          util.ajax({
            url:'/ss/accountstatement/lock',
            type:'POST',
            data:{
              ssas_id: ssas_id
            },
            timeout:10000,
            success:(obj) => {
              if(obj && obj.errno == 0){
                this.$message({
                  showClose: true,
                  message: '锁定成功',
                  type: 'success'
                });
                this.getSSList()
              }else{
                this.$message({
                  showClose: true,
                  message: obj.errmsg,
                  type: 'warning'
                });
              }
            },   
            error: (xhr, status) => {
              
            },
            noNetwork: () => {
              //网络超时
            }
          })
        }).catch(() => {        
        });
      },

      handleClickUnlock(ssas_id,ev){
        ev.stopPropagation()
        this.$confirm('是否解锁该对账单？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          ////ss/accountstatement/unlock
          util.ajax({
            url:'/ss/accountstatement/unlock',
            type:'POST',
            data:{
              ssas_id: ssas_id
            },
            timeout:10000,
            success:(obj) => {
              if(obj && obj.errno == 0){
                this.$message({
                  showClose: true,
                  message: '解锁成功',
                  type: 'success'
                });
                this.getSSList()
              }else{
                this.$message({
                  showClose: true,
                  message: obj.errmsg,
                  type: 'warning'
                });
              }
            },   
            error: (xhr, status) => {
              
            },
            noNetwork: () => {
              //网络超时
            }
          })
        }).catch(() => {        
        });
      },

      handleClickCreateRecon(){
        this.dialogAddS = true
        this.ruleForm.year = ''
        this.ruleForm.month = ''
      }
  	},
  	mounted() {
    	this.init()
  	},
  	watch: {
  	  '$route' (to, from) {
  	    // 对路由变化作出响应...
        this.init()
  	  }
  	}
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<!-- <style  src='../assets/css/reset.css'></style> -->
<style  src='../assets/css/social.css'></style>
<style scoped>
.table_operate {
  margin: 10px 0;
}
.operate_wrap {
  float: right;
  margin-top: 5px;
  font-size: 16px;
}
.operate_wrap .batchBtn {
  margin-right: 5px;
}
</style>
