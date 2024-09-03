<template>
  <el-dialog 
    title="导出列表" 
    :visible.sync="visable" 
    top="10vh" 
    class="dialogSubAccount"
    :before-close="handleClickBeforeClose"
    >
    <el-table :data="exportData">
      <el-table-column property="file_name" label="文件名称" width="350"></el-table-column>
      <el-table-column property="create_at" label="导出时间" width="160"></el-table-column>
      <el-table-column property="" label="操作" align="center">
        <template slot-scope="scope">
          <el-button type="text" @click="downLoadFile(scope.row.file_url)">下载</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination_wrap" slot="footer">
      <el-pagination
        background
        @current-change="export_handleCurrentChange"
        :current-page.sync="export_currentPage"
        :page-size="export_pageSize"
        layout="total, prev, pager, next"
        :total="export_total_num">
      </el-pagination>
    </div>
  </el-dialog>
</template>

<script>
// 这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
// 例如：import 《组件名称》 from '《组件路径》'

import * as util from "@/assets/js/util.js";

export default {
  components: {},
  props: {
    type: {
      type: String|Array,
      default: '1'
    },
    dialogExportVisible: {
      type: Boolean,
      default: false
    },
    closeDialog: {
      type: Function,
      default: () => {}
    },
  },
  data () {
    return {
      exportData: [],
      export_currentPage: 1,
      export_pageSize: 10,
      export_total_num: 0,
      project_id: 0,

    }
  },
  // 监听属性 类似于data概念
  computed: {
    visable: {
      get () {
        if(this.dialogExportVisible) {
          this.exportList();
        }
        return this.dialogExportVisible
      },
      set (val) {
        this.$emit('update:dialogExportVisible', val)
      }
    }

  },
  // 监控data中的数据变化
  watch: {},
  // 生命周期 - 创建完成（可以访问当前this实例）
  created () {
		this.project_id = util.getLocalStorage("projectStorageInfo").project_id;

  },
  // 生命周期 - 挂载完成（可以访问DOM元素）
  mounted () {
    
  },
  methods: {
    downLoadFile(file) {
      if(file) {
        window.location.href = file;
      } else {
        this.$message({
          showClose: true,
          message: '文件下载出了问题',
          type: "warning"
        });
      }
    },

    exportList() {
      util.ajax({
        url: "/group/export_member_list",
        type: "GET",
        data: {
          project_id: this.project_id,
          page_no: this.export_currentPage, 
          page_size: this.export_pageSize,
          type: JSON.stringify(this.type),
        },
        timeout: 10000,
        success: obj => {
          // console.log(JSON.stringify(obj))
          if (obj && obj.errno == 0) {
            this.exportData = obj.data.list;
            this.export_total_num = Number(obj.data.total_count) || 0;
          } else {
            this.$message({
              showClose: true,
              message: obj.errmsg,
              type: "warning"
            });
          }
        },
        error: (xhr, status) => {},
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

    export_handleCurrentChange(val) {
      // console.log(`当前页: ${val}`);
      this.export_currentPage = val;
      this.exportList();
    },

    handleClickBeforeClose(done) {
      console.log('handleClickBeforeClose');
      this.exportData = [];
      this.export_currentPage = 1;
      this.export_total_num = 0;
      done();

      this.closeDialog();
    }
  }
  //beforeCreate () { }, // 生命周期 - 创建之前
  //beforeMount () { }, // 生命周期 - 挂载之前
  //beforeUpdate () { }, // 生命周期 - 更新之前
  //updated () { }, // 生命周期 - 更新之后
  //beforeDestroy () { }, // 生命周期 - 销毁之前
  //destroyed () { }, // 生命周期 - 销毁完成
  //activated () { }, // 如果页面有keep-alive缓存功能，这个函数会触发
  // 方法集合
}
</script>

<style src=''></style>
<style scoped>

</style>
