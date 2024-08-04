<template>
  <div class="customized-scheduling">
    <div class="kqeditpb_top">
      <breadcrumb>
        <router-link to="kqaddmin" replace>考勤管理</router-link>
        <router-link to="kqtasklist" replace>考勤规则管理</router-link>
        <router-link to="">排班</router-link>
      </breadcrumb>
      <div class="kqpb_export_date">
        <el-dialog title="导出" :visible.sync="showExport">
          <p class="des">导出时间范围不能超过一个月</p>
          <div class="sel_date">
            <div class="sel_date_t">时间范围</div>
            <div class="sel_date_m">
              <el-date-picker
                v-model="export_date"
                :clearable="false"
                @change="exportDateChangeFn"
                type="daterange"
                style="width: 248px"
                placeholder="选择日期范围"
              >
              </el-date-picker>
            </div>
          </div>
          <div class="export_date_foot">
            <div class="btns">
              <el-button @click="showExport = false">取 消</el-button>
              <el-button type="primary" @click="confirmExport">确 定</el-button>
            </div>
          </div>
        </el-dialog>
      </div>
    </div>
    <div class="kqeditpb_main" v-loading="!load_end">
      <div class="kqpb_title">
        <h2>排班日历</h2>
      </div>
      <div class="kqpb_sel">
        <div class="sel_item">
          <span>工作日期</span>
          <el-date-picker
            v-model="kq_week_obj"
            :clearable="false"
            type="week"
            format="yyyy第WW周"
            placeholder="当前周"
            :picker-options="picker_options"
            @change="showWeek"
            style="width: 137px"
          ></el-date-picker>
        </div>
        <div class="sel_item">
          <span>人员范围</span>
          <el-button
            @click="openGroupSelecter"
            class="select_member"
            style="position: relative; width: 169px; text-align: left"
            >{{ selected_members_groups.length ? computedMemberGroup() : "全部"
            }}<i
              class="el-icon-caret-bottom"
              style="position: absolute; right: 12px; top: 14px; color: #d3dce6"
            ></i
          ></el-button>
        </div>
        <select-member-group-multi
          title="人员范围"
          ref="profile"
          :all-groups="all_groups"
          :selected-members-groups="selected_members_groups"
          v-on:confirmGroupSelecter="confirmGroupSelecter"
        ></select-member-group-multi>
        <div class="set_btn">
          <div class="btnbox">
            <el-button type="primary" @click="savePb">保 存</el-button>
            <el-button @click="reGetAllList">恢 复</el-button>
          </div>
        </div>
      </div>

      <!-- 班次说明-->
      <div class="bc_explain">
        <div class="t">班次说明</div>
        <div class="bcs">
          <div class="bc_item" v-for="item in workScheduleList">
            <div class="colorbox"></div>
            <span class="bc_time"
              >{{ item.name }} {{ item.start_time }}-{{
                item.cross == 1 ? "次日" : ""
              }}{{ item.end_time }}</span
            >
          </div>
          <div class="setup_bc" @click="setupBc" v-if="showSetupBc">
            <!-- <el-button type="text" icon="edit">班次设置</el-button> -->
            <i class="editico_svg"></i>班次设置
          </div>


          <div class="setup_bc scheduling-btn" @click="handleClickScheduling" v-if="showSchedulingBtn">
            <!-- <el-button type="text" icon="edit">班次设置</el-button> -->
            <i class="editico_svg"></i>排班
          </div>
        </div>
        <el-dialog
          title="班次设置"
          :visible.sync="showAddBcDialog"
          @open="openSetupBc"
        >
          <div class="add_bc">
            <div class="add_bc_item" v-for="(item, index) in bc_list_active">
              <div class="add_bc_name">{{ item.name }}班次</div>
              <div class="add_bc_time">
                <el-time-picker
                  placeholder="起始时间"
                  :clearable="false"
                  :editable="false"
                  v-model="item.start_time"
                  @change="startChange(item)"
                  format="HH:mm"
                  :picker-options="{
                    selectableRange: startRange(item.end_time),
                  }"
                >
                </el-time-picker>
                <span style="margin: 0 5px; color: #beccda">-</span>
                <el-time-picker
                  placeholder="结束时间"
                  :clearable="false"
                  :editable="false"
                  v-model="item.end_time"
                  @change="endChange(item)"
                  :format="formatEndtime(item)"
                  :picker-options="{
                    selectableRange: endRange(item.start_time),
                  }"
                >
                </el-time-picker>
              </div>
              <template v-if="index <= 9">
                <div
                  class="add_bc_btn"
                  @click="setupBcFn(index)"
                  v-if="index != 9 && index == bc_list_active.length - 1"
                >
                  <div class="icon icon_add"></div>
                </div>
                <div
                  class="add_bc_btn"
                  @click="setupBcFn(index)"
                  v-if="
                    item.id == 0 &&
                    ((index != 9 && index < bc_list_active.length - 1) ||
                      (index == 9 && index == bc_list_active.length - 1))
                  "
                >
                  <div class="icon icon_del"></div>
                </div>
              </template>
            </div>
          </div>
          <div class="add_bc_foot">
            <div class="btns">
              <el-button @click="showAddBcDialog = false">取 消</el-button>
              <el-button type="primary" @click="confirmAddBc">确 定</el-button>
            </div>
          </div>
        </el-dialog>
      </div>

      <!--排班table-->
      <div class="pb_edit_table">
        <el-table
          border
          @cell-click="handleCellClick"
          @header-click="handleHeaderClick"
          :data="schedulingList"
          style="width: 100%"
        >
          <el-table-column prop="user_name" label="姓名" width="80">
          </el-table-column>
          <template v-for="(a, index) in schedulingList[0].date_schedule">
            <el-table-column
              :prop="index + ''"
              :label="new Date(a.date * 1000).getDate() + ''"
              min-width="101"
            >
              <template slot-scope="scope">
                <div class="per_bc_day">
                  <div
                    class="item"
                    v-for="item in scope.row.date_schedule[index].schedule"
                    :class="'colorblock_item_' + item.style"
                  >
                    {{ item.schedule_name }}
                  </div>
                </div>
              </template>
            </el-table-column>
          </template>
        </el-table>

        <!-- 分页 -->
        <div class="pagination_wrap">
          <div class="pagination" v-show="sourceSchedulingList.length">
            <el-pagination
              @current-change="handleCurrentChange"
              :current-page.sync="currentPage"
              :page-size="10"
              layout="prev, pager, next"
              :total="sourceSchedulingList.length"
            >
            </el-pagination>
          </div>
          <div class="total_num">共{{ sourceSchedulingList.length }}人</div>
        </div>

        <!-- 设置编辑弹窗内容 -->
        <div class="pb_tooltip" v-show="schedulingTooltipVisable" @click.stop>
          <div class="title">{{ currentSchedulingData.title }}</div>
          <div class="sel_bcs">
            <div v-for="(item2,index) in currentSchedulingData.schedule" :key="index">
              <div
                class="item"
                :class="{ selected: item2.selected == 1 }"
                @click="selectBcFn(item2)"
              >
                <div class="item_in" :class="'colorblock_item_' + item2.style">
                  {{ item2.name }}
                </div>
              </div>
            </div>
            <div style="clear: both"></div>
          </div>

          <div class="title" v-if="personAllWorkAddr.length">工作地点：</div>
          <div class="pb_addr" v-if="personAllWorkAddr.length">
            <el-select
              v-model="currentSchedulingData.position_id"
              placeholder="请选择"
              :clearable="true"
            >
              <el-option
                v-for="item3 in personAllWorkAddr"
                :key="item3.workplace_id"
                :label="item3.workplace_name"
                :value="item3.workplace_id"
              >
              </el-option>
            </el-select>
          </div>
          <div class="pb_btns">
            <div class="btn_r">
              <el-button @click="cancelBcAddr">取消</el-button>
              <el-button
                type="primary"
                @click="changeBcAddr"
                style="margin-left: 4px; width: 42px"
                >确定</el-button
              >
            </div>
          </div>
        </div>
      </div>
      <!-- 班次统计-->
      <div class="pb_tj_table">
        <div class="tj_top">
          <div class="title">排班统计</div>
          <div class="toggle">
            <!-- <div class="left select">班次</div>
  						<div class="right">地点</div> -->
            <el-radio-group
              v-model="tj_type_sel"
              @change="changeTjTypeSel"
              fill="#6699ee"
            >
              <el-radio-button label="0">班次</el-radio-button>
              <el-radio-button label="1">地点</el-radio-button>
            </el-radio-group>
          </div>
        </div>
        <div class="tj_table">
          <!-- 以班次为维度-->
          <div class="by_bc" v-show="tj_type_sel == 0">
            <el-table
              border
              @cell-click="cellClickFn2"
              :data="statisticsSchedulingData"
              style="width: 100%"
            >
              <el-table-column prop="bc_name" label="班次" width="120">
                <template slot-scope="scope">
                  <div
                    :class="'tj_item colorblock_item_' + scope.row.bc_style"
                  ></div>
                  <div class="bc_name" v-if="scope.row.bc_name">
                    {{ scope.row.bc_name }}班次
                  </div>
                </template>
              </el-table-column>
              <template v-for="(a, index) in schedulingList[0].date_schedule">
                <el-table-column
                  :prop="'' + index"
                  :label="new Date(a.date * 1000).getDate() + ''"
                  min-width="101"
                >
                  <template slot-scope="scope">{{
                    scope.row.bc_date[index].sum
                  }}</template>
                </el-table-column>
              </template>
            </el-table>
            <!-- 弹窗内容 -->
            <div class="by_bc_tooltip" v-show="statisticsSchedulingTooltipVisable" @click.stop>
              <div class="by_title">
                <!-- 备用 -->
              </div>
              <div class="by_main">
                <div class="by_main_item" v-for="item in statisticsSchedulingCellData.pers">
                  <div class="left">{{ item.user_name }}</div>
                  <div
                    class="right"
                    :class="{ onlyone: statisticsSchedulingCellData.pers.length == 1 }"
                  >
                    <div
                      class="icon"
                      :class="{ nocoor: item.addr_id == 0 }"
                    ></div>
                    <p v-if="item.addr_id == 0" style="color: #8492a6">
                      未设置工作地点
                    </p>
                    <p v-else>{{ item.addr_name || "未设置工作地点" }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 以地点为维度-->
          <div class="by_addr" v-show="tj_type_sel == 1">
            <el-table
              border
              @cell-click="cellClickFn3"
              :data="locationStatistics"
              style="width: 100%"
            >
              <el-table-column
                prop="addr_name"
                label="工作地点"
                min-width="152"
              >
              </el-table-column>
              <template v-for="(a, index) in schedulingList[0].date_schedule">
                <el-table-column
                  :prop="'' + index"
                  :label="new Date(a.date * 1000).getDate() + ''"
                  min-width="90"
                >
                  <template slot-scope="scope">{{
                    scope.row.addr_date[index].sum
                  }}</template>
                </el-table-column>
              </template>
            </el-table>
            <!-- 弹窗内容 -->
            <div class="by_addr_tooltip" v-show="statisticsAddrTooltipVisable" @click.stop>
              <div class="by_title">
                <!-- 备用 -->
              </div>
              <div class="by_main">
                <div class="by_main_item" v-for="item in locationStatisticsCellData.pers">
                  <div class="left">{{ item.user_name }}</div>
                  <div
                    class="right"
                    :class="{ onlyone: locationStatisticsCellData.pers.length == 1 }"
                  >
                    <div class="bc_item" v-for="item2 in item.bcs">
                      <div
                        :class="
                          'color_block colorblock_item_' + item2.schedule_name
                        "
                      ></div>
                      {{ item2.schedule_name }}班次
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <el-dialog
      title="排班"
      :visible.sync="drawerVisibility"
      :before-close="handleDrawerBeforeClose">
      <div class="dialog-schedule-main">
        
      </div>
    </el-dialog>
  </div>
</template>

<script>
import $ from "jquery";
import * as util from "../../assets/js/util.js";

import SelectMemberGroupMulti from "@/components/common/SelectMemberGroupMulti";
import breadcrumb from "@/components/common/breadcrumb";

export default {
  name: "kqeditpb",
  components: {
    SelectMemberGroupMulti,
    breadcrumb,
  },
  data() {
    return {
      team_id: 0,
      project_id: 0,
      picker_options: {
        //选择时间控件 选项
        firstDayOfWeek: 1,
      },
      kq_week_obj: new Date().getTime(), //选择的日期对象-周
      start_date: "",
      end_date: "",
      all_groups: [], //管辖范围内所有成员及小组
      selected_members_groups: [], //选择的成员及小组
      group_ids: "", //选择的小组  ‘，’拼接
      user_ids: "", //选择的成员  ‘，’拼接
      export_date: "", //导出时的时间范围
      export_date_str: "", //导出时的时间范围
      showAddBcDialog: false,
      showSetupBc: false,
      load_end: false,
      showExport: false,
      // 所有班次
      workScheduleList: [
        //  			{
        // end_time: "18:30",
        //                id: "82",
        //                name: "A",
        //                start_time: "18:00"
        //     }
      ],
      bc_list_active: [], //操作时
      bc_list_del: [], //删除的班次
      // 所有人的排班情况
      sourceSchedulingList: [],
      //当前展示的排班情况
      schedulingList: [
        {
          user_id: 0,
          user_name: "",
          date_schedule: [
            {
              schedule: [
                // {
                //     position_id: 0,
                //     schedule_id: 0,
                //     schedule_name: "A",
                //     task_id: 0
                // }
              ],
              date: "1500220800",
            },
            {
              schedule: [],
              date: "1500307200",
            },
            {
              schedule: [],
              date: "1500393600",
            },
            {
              schedule: [],
              date: "1500480000",
            },
            {
              schedule: [],
              date: "1500566400",
            },
            {
              schedule: [],
              date: "1500652800",
            },
            {
              schedule: [],
              date: "1500739200",
            },
          ],
        },
      ],
      date_schedule_changed: [], //修改过的排班信息
      //所有地址（所有被排班的人的地点合集）
      all_addr: [
        // {
        //     workplace_id: 191,
        //     workplace_name: "联创大厦(上地西路)"
        // },
      ],
      //所有地址（被排班的个人）
      personAllWorkAddr: [
        // {
        //            workplace_id: 0,
        //            workplace_name: ""
        // }
      ],
      //编辑排班时的弹窗数据
      currentSchedulingData: {
        title: "修改员工当天班次：",
        isAllDay: 0,
        isAllPer: 0,
        data_coordinate: [],
        position_id: 0,
        position_name: "",
        schedule: [
          // {
          //     schedule_id: 0,
          //     schedule_name: "A",
          // }
        ],
      },

      //排班弹框visible
      schedulingTooltipVisable: false,

      //以班次为维度的统计某天统计详情 visible
      statisticsSchedulingTooltipVisable: false,

      //以地点为维度的统计某天统计详情 visible
      statisticsAddrTooltipVisable: false,
      currentPage: 1,
      // 排版统计 按班次
      statisticsSchedulingData: [
        {
          bc_name: "",
          bc_id: 0,
          bc_date: [
            {
              date: 0,
              sum: "",
              pers: [
                {
                  user_name: "",
                  user_id: 0,
                  addr_name: "",
                  addr_id: 0,
                },
              ],
            },
            {
              date: 0,
              sum: "",
              pers: [
                {
                  user_name: "",
                  user_id: 0,
                  addr_name: "",
                  addr_id: 0,
                },
              ],
            },
            {
              date: 0,
              sum: "",
              pers: [
                {
                  user_name: "",
                  user_id: 0,
                  addr_name: "",
                  addr_id: 0,
                },
              ],
            },
            {
              date: 0,
              sum: "",
              pers: [
                {
                  user_name: "",
                  user_id: 0,
                  addr_name: "",
                  addr_id: 0,
                },
              ],
            },
            {
              date: 0,
              sum: "",
              pers: [
                {
                  user_name: "",
                  user_id: 0,
                  addr_name: "",
                  addr_id: 0,
                },
              ],
            },
            {
              date: 0,
              sum: "",
              pers: [
                {
                  user_name: "",
                  user_id: 0,
                  addr_name: "",
                  addr_id: 0,
                },
              ],
            },
            {
              date: 0,
              sum: "",
              pers: [
                {
                  user_name: "",
                  user_id: 0,
                  addr_name: "",
                  addr_id: 0,
                },
              ],
            },
          ],
        },
      ],

      // 排版统计 按班次某天详情
      statisticsSchedulingCellData: {
        //某个单元格的详情
        date: 0,
        sum: "",
        pers: [
          {
            user_name: "",
            user_id: 0,
            addr_name: "",
            addr_id: 0,
          },
        ],
      },
      // 排版统计 按地点
      locationStatistics: [],

      // 排版统计 按地点某天详情
      locationStatisticsCellData: {
        //某个单元格的详情
        date: 0,
        sum: "",
        pers: [
          {
            user_name: "",
            user_id: 0,
            bcs: [
              {
                position_id: 0,
                schedule_id: 0,
                schedule_name: "A",
                task_id: 0,
              },
            ],
          },
        ],
      },
      tj_type_sel: 0, //0--班次；1--地点
      // 排版统计 按地址

      drawerVisibility: false,
      showSchedulingBtn:false,
    };
  },
  methods: {
    handleDrawerBeforeClose(done) {
      this.drawerVisibility = false;
    },


    handleClickScheduling() {
      console.log("点击排班");
      this.drawerVisibility = true;
    },


    statisticsAddr() {
      setTimeout(() => {
        let locationStatistics = [];
        if (this.all_addr.length) {
          this.all_addr.forEach((obj1, addr_index) => {
            let tempObj1 = {};
            tempObj1.addr_name = obj1.workplace_name;
            tempObj1.addr_id = obj1.workplace_id;
            tempObj1.index = addr_index;
            tempObj1.addr_date = [];
            this.sourceSchedulingList[0].date_schedule.forEach((obj2, index) => {
              let tempObj2 = {};
              tempObj2.date = obj2.date;
              tempObj2.pers = [];
              this.sourceSchedulingList.forEach((obj3) => {
                let tempObj3 = {};
                if (
                  obj3.date_schedule[index].schedule.length &&
                  obj3.date_schedule[index].schedule[0].position_id ==
                    obj1.workplace_id
                ) {
                  tempObj3.user_name = obj3.user_name;
                  tempObj3.user_id = obj3.user_id;
                  tempObj3.bcs = obj3.date_schedule[index].schedule;
                  tempObj2.pers.push(tempObj3);
                }
              });
              tempObj2.sum = tempObj2.pers.length ? tempObj2.pers.length : "";
              tempObj1.addr_date.push(tempObj2);
            });
            locationStatistics.push(tempObj1);
          });
          console.log(locationStatistics);
          this.locationStatistics = locationStatistics;
        } else {
          let addrData = [];
          
          while(addrData.length < 7){
            addrData.push({
              date: 0,
              sum: "",
              pers: [
                {
                  user_name: "",
                  user_id: 0,
                  bcs: [
                    {
                      position_id: 0,
                      schedule_id: 0,
                      schedule_name: "A",
                      task_id: 0,
                    },
                  ],
                },
              ],
            });
          }
          //没有地点
          this.locationStatistics = {
            addr_name: "",
            addr_id: 0,
            addr_date: addrData,
          };
        }
      }, 0);
    },

    //统计排班信息
    statisticsScheduling() {
      setTimeout(() => {
        let banci = [];
        for (let i = 0; i < 10; i++) {
          // console.log(String.fromCharCode(65 + i));
          banci.push(String.fromCharCode(65 + i));
        }
        const b = [...banci, ...banci, ...banci];
        let statisticsSchedulingData = [];
        console.log("eeeefffffffffffffffffffffffffff", this.workScheduleList);
        this.workScheduleList.forEach((obj1, bc_index) => {
          let tempObj1 = {};
          tempObj1.bc_name = obj1.name;
          tempObj1.bc_style = b[bc_index];
          tempObj1.bc_id = obj1.id;
          tempObj1.index = bc_index;
          tempObj1.bc_date = [];
          this.sourceSchedulingList[0].date_schedule.forEach((obj2, index) => {
            let tempObj2 = {};
            tempObj2.date = obj2.date;
            tempObj2.pers = [];
            this.sourceSchedulingList.forEach((obj3) => {
              let tempObj3 = {};
              obj3.date_schedule[index].schedule.forEach((obj4, i) => {
                if (obj4.schedule_id == obj1.id) {
                  const inx = i;
                  console.log("inxxxxxxxxxxxxxxxx", i);
                  console.log("inxxxxxxxxxxxxxxxx", b);
                  tempObj3.user_name = obj3.user_name;
                  tempObj3.user_id = obj3.user_id;
                  tempObj3.addr_name = obj4.position_name;
                  tempObj3.addr_id = obj4.position_id;
                  tempObj3.bc_style = b[inx];
                  tempObj2.pers.push(tempObj3);
                }
              });
              console.log("alsjkfskfjdf", tempObj2.pers);
            });
            tempObj2.sum = tempObj2.pers.length ? tempObj2.pers.length : "";
            tempObj1.bc_date.push(tempObj2);
          });
          statisticsSchedulingData.push(tempObj1);
        });
        console.log("tj_bctj_bctj_bctj_bctj_bc", statisticsSchedulingData);
        this.statisticsSchedulingData = statisticsSchedulingData;
      }, 0);
    },

    //初始化
    init() {
      $(".kqeditpb").height($(window).height() - 60);
      //获取用户信息
      this.team_id = util.getLocalStorage("projectStorageInfo").team_id;
      this.project_id = util.getLocalStorage("projectStorageInfo").project_id;
      this.task_id = util.getLocalStorage("kqpb_task_id");

      let week_day = new Date().getDay();

      //获取当前周的周一日期
      let currentDate = util.getLocalTime(
        new Date().getTime() -
          (week_day == 0 ? 6 : week_day - 1) * 24 * 60 * 60 * 1000,
        "yyyy-MM-dd"
      );
      this.start_date = currentDate;
      //获取班次信息
      this.getWorkScheduleList();
      //获取权限信息
      this.getPermission();

      $(window).click(() => {
        //点击其他 弹窗消失
        this.schedulingTooltipVisable = false;
        this.statisticsSchedulingTooltipVisable = false;
        this.statisticsAddrTooltipVisable = false;
        $(".el-table__body-wrapper td + td .cell").css({
          border: "1px solid transparent",
        });
      });

      this.setTabTitle();
      //获取管辖范围的小组和人员
      this.getMemberGroup();
      //获取所有人的所有考勤地点
      // this.getAllAddr()
    },

    //获取可选择小组和人员列表
    getMemberGroup() {
      util.ajax({
        url: "/group/node_data_tree",
        type: "GET",
        data: {
          group_id: 0,
          team_id: this.team_id,
          project_id: this.project_id,
        },
        success: (res) => {
          // console.log('小组和人员列表')
          // console.log(res)
          if (res && res.errno == 0) {
            this.all_groups = res.data;
          }
        },
        error: (xhr, status) => {},
        noNetwork: () => {
          // 网络超时
          this.$message({
            showClose: true,
            message: "网络连接失败，请检查网络",
            type: "warning",
          });
        },
      });
    },

    //展示人员选择弹窗
    openGroupSelecter() {
      //显示组件
      this.$refs.profile.openGroupSelecter();
    },

    //提交人员选择数据
    confirmGroupSelecter(val) {
      //点击确定后执行的函数
      // console.log(val)
      this.selected_members_groups = val;
      let group_ids = [];
      let user_ids = [];
      val.forEach((obj) => {
        if (obj.selType === "group") {
          group_ids.push(obj.id);
        } else {
          user_ids.push(obj.id);
        }
      });
      this.group_ids = group_ids.join(",");
      this.user_ids = user_ids.join(",");
      this.getAllSchedulingList();
    },


    computedMemberGroup() {
      let members = 0,
        groups = 0;
      this.selected_members_groups.forEach((obj) => {
        if (obj.selType === "group") {
          groups++;
        } else {
          members++;
        }
      });
      if (groups == 0) {
        return `已选${members}人`;
      } else if (members == 0) {
        return `已选${groups}组`;
      } else {
        return `已选${groups}组、${members}人`;
      }
    },

    //获取权限
    getPermission() {
      util.ajax({
        url: "/permission/application",
        type: "GET",
        data: {
          team_id: this.team_id,
          project_id: this.project_id,
          application_id: 1,
        },
        success: (res) => {
          // console.log('所有权限')
          // console.log(res)
          if (res && res.errno == 0) {
            this.showSetupBc = res.data.some((obj) => {
              // console.log(obj.id_name)
              return obj.id_name === "attendance_set_schedule";
            });
          } else {
            this.$message({
              showClose: true,
              message: res.errmsg,
              type: "warning",
            });
          }
        },
        error: (xhr, status) => {},
        noNetwork: () => {
          // 网络超时
          this.$message({
            showClose: true,
            message: "网络连接失败，请检查网络",
            type: "warning",
          });
        },
      });
    },

    //获取所有人的工作地点
    getAllAddr() {
      util.ajax({
        url: "/attendance/user_position_batch",
        type: "GET",
        data: {
          team_id: this.team_id,
          project_id: this.project_id,
          task_id: this.task_id,
          group_ids: this.group_ids,
          user_ids: this.user_ids,
        },
        success: (res) => {
          // console.log('所有人的所有地点1111')
          // console.log(res)
          if (res && res.errno == 0) {
            if (res.data.length) {
              this.all_addr = res.data;
            } else {
              this.all_addr = [
                {
                  workplace_id: "",
                  workplace_name: "",
                },
              ];
            }
            this.statisticsAddr();
          } else {
            this.$message({
              showClose: true,
              message: res.errmsg,
              type: "warning",
            });
          }
        },
        error: (xhr, status) => {},
        noNetwork: () => {
          // 网络超时
          this.$message({
            showClose: true,
            message: "网络连接失败，请检查网络",
            type: "warning",
          });
        },
      });
    },

    //获取某个人的所有工作地点
    getAllAddrPer(user_id, cb) {
      util.ajax({
        url: "/attendance/user_position",
        type: "GET",
        data: {
          team_id: this.team_id,
          project_id: this.project_id,
          task_id: this.task_id,
          user_id: user_id,
        },
        success: (res) => {
          // console.log('个人所有地点')
          // console.log(res)
          if (res && res.errno == 0) {
            this.personAllWorkAddr = res.data;
            cb();
          } else {
            this.$message({
              showClose: true,
              message: res.errmsg,
              type: "warning",
            });
          }
        },
        error: (xhr, status) => {},
        noNetwork: () => {
          // 网络超时
          this.$message({
            showClose: true,
            message: "网络连接失败，请检查网络",
            type: "warning",
          });
        },
      });
    },

    //获取所有设置的班次列表
    getWorkScheduleList() {
      util.ajax({
        url: "/attendance/task_schedule",
        type: "GET",
        data: {
          team_id: this.team_id,
          project_id: this.project_id,
          task_id: this.task_id,
        },
        success: (res) => {
          console.log("所有班次");
          if (res && res.errno == 0) {
            this.workScheduleList = res.data;

            //获取所有人的排班信息
            this.getAllSchedulingList(); 
          } else {
            this.$message({
              showClose: true,
              message: res.errmsg,
              type: "warning",
            });
          }
        },
        error: (xhr, status) => {},
        noNetwork: () => {
          // 网络超时
          this.$message({
            showClose: true,
            message: "网络连接失败，请检查网络",
            type: "warning",
          });
        },
      });
    },

    //获取所有人的排班信息
    getAllSchedulingList() {
      // return
      this.load_end = false;
      util.ajax({
        url: "/attendance/user_schedule",
        type: "GET",
        data: {
          team_id: this.team_id,
          project_id: this.project_id,
          task_id: this.task_id,
          start_date: this.start_date,
          group_ids: this.group_ids,
          user_ids: this.user_ids,
        },
        success: (res) => {
          if (res && res.errno == 0) {
            this.load_end = true;

            //如果没有返回数据  自己设置假数据
            if (!res.data.length) {
              let scheduleList = [];
              let i = 0;
              while(i < 7 ) {
                scheduleList.push({
                  schedule: [],
                  date:'',
                });
                i++;
              }

              this.sourceSchedulingList = this.schedulingList = [
                {
                  user_id: 0,
                  user_name: "",
                  date_schedule: scheduleList,
                },
              ];

              //没有返回数据  自己设置假数据
              let week_day = new Date().getDay();
              //获取当前周的周一到周日时间戳
              this.schedulingList[0].date_schedule.forEach((obj, index) => {
                obj.date =
                  (new Date().getTime() -
                    24 * 60 * 60 * 1000 * (week_day - index - 1)) /
                  1000;
              });
            } else {
              let sourceSchedulingList = res.data;
              sourceSchedulingList.forEach((obj, index) => {
                obj.index = index;
              });
              let banci = [];
              for (let i = 0; i < 10; i++) {
                // console.log(String.fromCharCode(65 + i));
                banci.push(String.fromCharCode(65 + i));
              }
              const b = [...banci, ...banci, ...banci];
              sourceSchedulingList.forEach((obj, index) => {
                sourceSchedulingList[0].date_schedule.forEach((obj1, index1) => {
                  obj.date_schedule[index1].schedule.forEach((obj1, index2) => {
                    obj1.style = b[index2];
                  });
                });
              });

              this.sourceSchedulingList = sourceSchedulingList;
              this.schedulingList = this.sourceSchedulingList.slice(0, 10);
              
            }

            this.statisticsScheduling();
            this.getAllAddr();

            // this.statisticsAddr()
            //设置过期的表格
            setTimeout(() => {
              this.schedulingList[0].date_schedule.forEach((obj, index) => {
                if (
                  util.getLocalTime(obj.date * 1000, "yyyy-MM-dd") <
                  util.getLocalTime(new Date().getTime(), "yyyy-MM-dd")
                ) {
                  $(".pb_edit_table .el-table__header-wrapper th + th")
                    .eq(index)
                    .addClass("disabled_style");
                  $(".pb_edit_table .el-table__body-wrapper tr").each(
                    function () {
                      $(this)
                        .find("td")
                        .eq(index + 1)
                        .addClass("disabled_style");
                    }
                  );

                  if (index == this.schedulingList[0].date_schedule.length - 1) {
                    $(".pb_edit_table .el-table__body-wrapper tr").each(
                      function () {
                        $(this).find("td").eq(0).addClass("disabled_style");
                      }
                    );
                  }
                } else {
                  $(".pb_edit_table .el-table__header-wrapper th + th")
                    .eq(index)
                    .removeClass("disabled_style");
                  $(".pb_edit_table .el-table__body-wrapper tr").each(
                    function () {
                      $(this)
                        .find("td")
                        .eq(index + 1)
                        .removeClass("disabled_style");
                    }
                  );

                  if (index == this.schedulingList[0].date_schedule.length - 1) {
                    $(".pb_edit_table .el-table__body-wrapper tr").each(
                      function () {
                        $(this).find("td").eq(0).removeClass("disabled_style");
                      }
                    );
                  }
                }
              });
              this.load_end = true;
            }, 0);
            this.currentPage = 1;
            this.setTabTitle();
          } else {
            this.load_end = true;
            this.$message({
              showClose: true,
              message: res.errmsg,
              type: "warning",
            });
          }
        },
        error: (xhr, status) => {
          this.load_end = true;
        },
        noNetwork: () => {
          this.load_end = true;
          // 网络超时
          this.$message({
            showClose: true,
            message: "网络连接失败，请检查网络",
            type: "warning",
          });
        },
      });
    },

    setDisabledTable() {
      setTimeout(() => {
        this.schedulingList[0].date_schedule.forEach((obj, index) => {
          if (
            util.getLocalTime(obj.date * 1000, "yyyy-MM-dd") <
            util.getLocalTime(new Date().getTime(), "yyyy-MM-dd")
          ) {
            $(".pb_edit_table .el-table__header-wrapper th + th")
              .eq(index)
              .addClass("disabled_style");
            $(".pb_edit_table .el-table__body-wrapper tr").each(function () {
              $(this)
                .find("td")
                .eq(index + 1)
                .addClass("disabled_style");
            });

            if (index == this.schedulingList[0].date_schedule.length - 1) {
              $(".pb_edit_table .el-table__body-wrapper tr").each(function () {
                $(this).find("td").eq(0).addClass("disabled_style");
              });
            }
          } else {
            $(".pb_edit_table .el-table__header-wrapper th + th")
              .eq(index)
              .removeClass("disabled_style");
            $(".pb_edit_table .el-table__body-wrapper tr").each(function () {
              $(this)
                .find("td")
                .eq(index + 1)
                .removeClass("disabled_style");
            });

            if (index == this.schedulingList[0].date_schedule.length - 1) {
              $(".pb_edit_table .el-table__body-wrapper tr").each(function () {
                $(this).find("td").eq(0).removeClass("disabled_style");
              });
            }
          }
        });
      }, 0);
    },

    reGetAllList() {
      this.$confirm("是否确认恢复", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
      })
        .then(() => {
          this.getAllSchedulingList();
        })
        .catch(() => {
          // this.$message({
          //     type: 'info',
          //     message: '取消'
          // });
        });
    },

    setTabTitle() {
      //设置表头格式
      setTimeout(() => {
        let Dom_div = "";
        this.schedulingList[0].date_schedule.forEach((obj, index) => {
          // console.log(new Date(obj.date/1).getDay())
          switch (new Date(obj.date * 1000).getDay()) {
            case 0:
              Dom_div =
                '<div style="position:absolute;right:18px;bottom:6px;padding:0;">日</div>';
              break;
            case 1:
              Dom_div =
                '<div style="position:absolute;right:18px;bottom:6px;padding:0;">一</div>';
              break;
            case 2:
              Dom_div =
                '<div style="position:absolute;right:18px;bottom:6px;padding:0;">二</div>';
              break;
            case 3:
              Dom_div =
                '<div style="position:absolute;right:18px;bottom:6px;padding:0;">三</div>';
              break;
            case 4:
              Dom_div =
                '<div style="position:absolute;right:18px;bottom:6px;padding:0;">四</div>';
              break;
            case 5:
              Dom_div =
                '<div style="position:absolute;right:18px;bottom:6px;padding:0;">五</div>';
              break;
            case 6:
              Dom_div =
                '<div style="position:absolute;right:18px;bottom:6px;padding:0;">六</div>';
              break;
          }
          //删除 星期
          $(".pb_edit_table .el-table__header-wrapper th + th")
            .eq(index)
            .children()
            .eq(1)
            .remove();
          $(".by_bc .el-table__header-wrapper th + th")
            .eq(index)
            .children()
            .eq(1)
            .remove();
          $(".by_addr .el-table__header-wrapper th + th")
            .eq(index)
            .children()
            .eq(1)
            .remove();
          //重新插入
          $(".pb_edit_table .el-table__header-wrapper th + th")
            .eq(index)
            .append(Dom_div);
          $(".by_bc .el-table__header-wrapper th + th")
            .eq(index)
            .append(Dom_div);
          $(".by_addr .el-table__header-wrapper th + th")
            .eq(index)
            .append(Dom_div);
        });
      }, 0);
    },

    showWeek(val) {
      //val为输入框显示内容
      this.start_date = util.getLocalTime(
        this.kq_week_obj.getTime() - 24 * 60 * 60 * 1000,
        "yyyy-MM-dd"
      );
      this.end_date = util.getLocalTime(
        this.kq_week_obj.getTime() + 5 * 24 * 60 * 60 * 1000,
        "yyyy-MM-dd"
      );
      // console.log(this.start_date+'~'+this.end_date)
      this.getAllSchedulingList();
    },
    exportDialog() {
      this.showExport = true;
    },
    setupBc() {
      this.showAddBcDialog = true;
    },

    //编辑时  选择某个班次时回调
    selectBcFn(item) {
      console.log("efeff", item);
      if (item.selected == 1) {
        item.selected = 0;
      } else {
        let n = 0;
        // this.currentSchedulingData.schedule.forEach((obj) => {
        //     if(obj.selected == 1) n++
        // })
        // console.log(item)
        for (let i = 0; i < this.currentSchedulingData.schedule.length; i++) {
          if (this.currentSchedulingData.schedule[i].selected == 1) {
            n++;
            if (n >= 3) {
              this.$message({
                showClose: true,
                message: "最多选择3个班次",
                type: "warning",
              });
              return;
            }
            if (item.cross == 1 && this.currentSchedulingData.schedule[i].cross == 1) {
              //两个都是跨天 一定交叉
              this.$message({
                showClose: true,
                message: "不可选择时间交叉的班次",
                type: "warning",
              });
              return;
            }
            // console.log(item)
            // console.log(this.currentSchedulingData.schedule[i].start_time)
            // 不满10点的用0补齐
            item.start_time =
              item.start_time.length == 4
                ? "0" + item.start_time
                : item.start_time;
            item.end_time =
              item.end_time.length == 4 ? "0" + item.end_time : item.end_time;
            this.currentSchedulingData.schedule[i].start_time =
              this.currentSchedulingData.schedule[i].start_time.length == 4
                ? "0" + this.currentSchedulingData.schedule[i].start_time
                : this.currentSchedulingData.schedule[i].start_time;
            this.currentSchedulingData.schedule[i].end_time =
              this.currentSchedulingData.schedule[i].end_time.length == 4
                ? "0" + this.currentSchedulingData.schedule[i].end_time
                : this.currentSchedulingData.schedule[i].end_time;
            if (item.start_time === this.currentSchedulingData.schedule[i].start_time) {
              this.$message({
                showClose: true,
                message: "不可选择时间交叉的班次",
                type: "warning",
              });
              return;
            } else if (
              item.start_time < this.currentSchedulingData.schedule[i].start_time
            ) {
              if (
                (item.cross == 0 &&
                  item.end_time >= this.currentSchedulingData.schedule[i].start_time) ||
                item.cross == 1
              ) {
                this.$message({
                  showClose: true,
                  message: "不可选择时间交叉的班次",
                  type: "warning",
                });
                return;
              }
            } else {
              if (
                this.currentSchedulingData.schedule[i].cross == 1 ||
                (this.currentSchedulingData.schedule[i].cross == 0 &&
                  item.start_time <= this.currentSchedulingData.schedule[i].end_time)
              ) {
                this.$message({
                  showClose: true,
                  message: "不可选择时间交叉的班次",
                  type: "warning",
                });
                return;
              }
            }
          }
        }
        item.selected = 1;
      }
    },
    //编辑排班 点击取消
    cancelBcAddr() {
      this.schedulingTooltipVisable = false;
      $(".el-table__body-wrapper td + td .cell").css({
        border: "1px solid transparent",
      });
    },

    savePb() {
      let date_schedule = [];
      this.sourceSchedulingList.forEach((obj1) => {
        obj1.date_schedule.forEach((obj2) => {
          if (obj2.changed == 1) {
            let tempObj = {};
            tempObj.user_id = obj1.user_id;
            tempObj.date = obj2.date;
            tempObj.schedule_ids = [];
            obj2.schedule.forEach((obj3) => {
              tempObj.schedule_ids.push(obj3.schedule_id);
            });
            tempObj.schedule_ids = tempObj.schedule_ids.join(",");
            if (obj2.schedule.length) {
              tempObj.position_id = obj2.schedule[0].position_id;
            } else {
              tempObj.position_id = 0;
            }

            date_schedule.push(tempObj);
          }
        });
      });
      // console.log(date_schedule)
      if (!date_schedule.length) {
        this.$message({
          showClose: true,
          message: "保存成功",
          type: "success",
        });
        return;
      }
      this.$confirm("修改后，今日及未发生的考勤将按照新规则处理", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
      })
        .then(() => {
          util.ajax({
            url: "/attendance/user_schedule/set",
            type: "POST",
            data: {
              team_id: this.team_id,
              project_id: this.project_id,
              task_id: this.task_id,
              date_schedule: date_schedule,
            },
            success: (res) => {
              // console.log(res)
              if (res && res.errno == 0) {
                this.$message({
                  showClose: true,
                  message: "保存成功",
                  type: "success",
                });

                this.sourceSchedulingList.forEach((obj1) => {
                  obj1.date_schedule.forEach((obj2) => {
                    obj2.changed = 0;
                  });
                });
              } else {
                this.$message({
                  showClose: true,
                  message: res.errmsg,
                  type: "warning",
                });
              }
            },
            error: (xhr, status) => {},
            noNetwork: () => {
              // 网络超时
              this.$message({
                showClose: true,
                message: "网络连接失败，请检查网络",
                type: "warning",
              });
            },
          });
        })
        .catch(() => {
          // this.$message({
          //     type: 'info',
          //     message: '取消'
          // });
        });
    },

    //编辑排班 点击确定
    changeBcAddr() {
      let banci = [];
      for (let i = 0; i < 10; i++) {
        // console.log(String.fromCharCode(65 + i));
        banci.push(String.fromCharCode(65 + i));
      }
      const b = [...banci, ...banci, ...banci];
      
      let tempArr = [];
      this.currentSchedulingData.schedule.forEach((obj, index) => {
        if (obj.selected == 1) {
          let tempObj = {};
          tempObj.position_id = this.currentSchedulingData.position_id;
          tempObj.position_name = "";
          this.personAllWorkAddr.forEach((obj) => {
            if (obj.workplace_id == this.currentSchedulingData.position_id) {
              tempObj.position_name = obj.workplace_name;
            }
          });
          tempObj.schedule_id = obj.id;
          tempObj.schedule_name = obj.name;
          tempObj.style = b[index];
          tempArr.push(tempObj);
        }
      });
      if (this.currentSchedulingData.isAllDay == 1) {
        // console.log(this.currentSchedulingData)
        this.sourceSchedulingList[
          this.currentSchedulingData.data_coordinate[0]
        ].date_schedule.forEach((obj) => {
          if (
            util.getLocalTime(obj.date * 1000, "yyyy-MM-dd") >=
            util.getLocalTime(new Date().getTime(), "yyyy-MM-dd")
          ) {
            obj.schedule = tempArr;
            obj.changed = 1;
          }
        });
      } else if (this.currentSchedulingData.isAllPer == 1) {
        this.sourceSchedulingList.forEach((obj) => {
          obj.date_schedule[this.currentSchedulingData.data_coordinate[1]].schedule =
            tempArr;
          obj.date_schedule[this.currentSchedulingData.data_coordinate[1]].changed = 1;
        });
      } else {
        this.sourceSchedulingList[this.currentSchedulingData.data_coordinate[0]].date_schedule[
          this.currentSchedulingData.data_coordinate[1]
        ].schedule = tempArr;
        this.sourceSchedulingList[this.currentSchedulingData.data_coordinate[0]].date_schedule[
          this.currentSchedulingData.data_coordinate[1]
        ].changed = 1;
      }

      // console.log(this.sourceSchedulingList)
      this.schedulingTooltipVisable = false;
      $(".el-table__body-wrapper td + td .cell").css({
        border: "1px solid transparent",
      });

      // if(this.tj_type_sel == 0){
      this.statisticsScheduling();
      // }else{
      this.statisticsAddr();
      // }
    },

    //点击表头 设置当天所有人
    handleHeaderClick(column, event) {
      if (!this.sourceSchedulingList.length) return;
      event.stopPropagation();
      this.statisticsSchedulingTooltipVisable = false;
      this.statisticsAddrTooltipVisable = false;
      // 去掉所有边框
      $(".el-table__body-wrapper td + td .cell").css({
        border: "1px solid transparent",
      });
      if (
        column.property !== "user_name" &&
        !$(".pb_edit_table .el-table__header-wrapper th + th")
          .eq(column.property)
          .hasClass("disabled_style")
      ) {
        console.log(column);
        let cell = $(".pb_edit_table .el-table__header-wrapper th + th").eq(
          column.property
        )[0];
        // console.log($(cell).position())
        // return
        //弹出 编辑排班弹窗
        if (
          $(".pb_edit_table").width() -
            $(cell).position().left -
            $(cell).width() <
          222
        ) {
          if (
            $(".pb_edit_table .pb_tooltip").position().left ==
              $(cell).position().left - 222 &&
            $(".pb_edit_table .pb_tooltip").position().top ==
              $(cell).position().top + 2
          ) {
            //点击的单元格没变
            this.schedulingTooltipVisable = !this.schedulingTooltipVisable;
            // if(!this.schedulingTooltipVisable){
            //     $(cell).find('.cell').css({'border': '1px solid transparent'})
            // }
          } else {
            this.schedulingTooltipVisable = true;
            $(".pb_edit_table .pb_tooltip").css({
              left: $(cell).position().left - 222,
              top: $(cell).position().top + 2,
            });
          }
        } else {
          if (
            $(".pb_edit_table .pb_tooltip").position().left ==
              $(cell).position().left + $(cell).width() + 3 &&
            $(".pb_edit_table .pb_tooltip").position().top ==
              $(cell).position().top + 2
          ) {
            //点击的单元格没变
            this.schedulingTooltipVisable = !this.schedulingTooltipVisable;
            // if(!this.schedulingTooltipVisable){
            //     $(cell).find('.cell').css({'border': '1px solid transparent'})
            // }
          } else {
            this.schedulingTooltipVisable = true;
            $(".pb_edit_table .pb_tooltip").css({
              left: $(cell).position().left + $(cell).width() + 3,
              top: $(cell).position().top + 2,
            });
          }
        }
        //设置弹窗信息
        let banci = [];
        for (let i = 0; i < 10; i++) {
          // console.log(String.fromCharCode(65 + i));
          banci.push(String.fromCharCode(65 + i));
        }
        const b = [...banci, ...banci, ...banci];
        this.currentSchedulingData.schedule = [];
        this.currentSchedulingData.title = "修改所有员工当天班次：";
        this.workScheduleList.forEach((obj1, index) => {
          let tempobj = JSON.parse(JSON.stringify(obj1));
          tempobj.selected = 0;
          tempobj.style = b[index];
          this.currentSchedulingData.schedule.push(tempobj);
        });
        this.currentSchedulingData.isAllDay = 0;
        this.currentSchedulingData.isAllPer = 1;
        this.currentSchedulingData.data_coordinate = [-1, column.property];
        this.personAllWorkAddr = [];
        this.currentSchedulingData.position_id = "";
        this.currentSchedulingData.position_name = "";
      } else {
        this.schedulingTooltipVisable = false;
      }
    },

    handleCellClick(row, column, cell, event){
      event.stopPropagation(); 
      let $cell = $(cell)
      if($cell.hasClass("disabled_style") || row.user_id == 0) return;

      if ($cell.find(".per_bc_day").length && !$cell.find(".per_bc_day").children().length) {
        if($cell.find(".cell").hasClass("select-border-style")){
          $cell.find(".cell").removeClass("select-border-style")
        }else{
          $cell.find(".cell").addClass("select-border-style")
        }
      }

      this.showSchedulingBtn = true;
    },

    //点击表格单元格
    handleCellClick1(row, column, cell, event) {
      event.stopPropagation();
      this.statisticsSchedulingTooltipVisable = false;
      this.statisticsAddrTooltipVisable = false;
      //如果请求数据失败 会有默认一行空表格 如点击则取消行为
      if (row.user_id == 0) return;
      console.log($(cell))
      if (!$(cell).hasClass("disabled_style")) {
        console.log(9999999999999);
        //是空单元格 没有排班 单元格加边框
        if ($(cell).find(".per_bc_day").length && !$(cell).find(".per_bc_day").children().length) {
          $(cell).find(".cell").css({ border: "1px solid #6699ee" });
        }
        //弹出 编辑排班弹窗
        //判断弹框应该出现在单元格左边还是右边 
        //出现在左边
        if ($(".pb_edit_table").width() - $(cell).position().left - $(cell).width() <  222) {
          
          if (
            $(".pb_edit_table .pb_tooltip").position().left ==
              $(cell).position().left - 222 &&
            $(".pb_edit_table .pb_tooltip").position().top ==
              $(cell).position().top + 44 + 3
          ) {
            //点击的单元格没变
            this.schedulingTooltipVisable = !this.schedulingTooltipVisable;
            if (!this.schedulingTooltipVisable && column.property !== "user_name") {
              $(cell).find(".cell").css({ border: "1px solid transparent" });
            }
          } else {
            this.schedulingTooltipVisable = true;
            $(".pb_edit_table .pb_tooltip").css({
              left: $(cell).position().left - 222,
              top: $(cell).position().top + 44 + 3,
            });
          }
        } else {
          //出现在右边
          if (
            $(".pb_edit_table .pb_tooltip").position().left ==
              $(cell).position().left + $(cell).width() + 3 &&
            $(".pb_edit_table .pb_tooltip").position().top ==
              $(cell).position().top + 44 + 3
          ) {
            //点击的单元格没变
            this.schedulingTooltipVisable = !this.schedulingTooltipVisable;
            if (!this.schedulingTooltipVisable && column.property !== "user_name") {
              $(cell).find(".cell").css({ border: "1px solid transparent" });
            }
          } else {
            this.schedulingTooltipVisable = true;
            $(".pb_edit_table .pb_tooltip").css({
              left: $(cell).position().left + $(cell).width() + 3,
              top: $(cell).position().top + 44 + 3,
            });
          }
        }
        //获取所有考勤地点
        // console.log(row)
        // console.log(column.property)
       // debugger
        //获取某个人的所有工作地点
        this.getAllAddrPer(row.user_id, () => {
          if (
            column.property !== "user_name" &&
            row.date_schedule[column.property].schedule.length &&
            row.date_schedule[column.property].schedule[0].position_id != 0
          ) {
            this.currentSchedulingData.position_id =
              row.date_schedule[column.property].schedule[0].position_id;
            this.personAllWorkAddr.forEach((obj) => {
              if (obj.workplace_id == this.currentSchedulingData.position_id) {
                this.currentSchedulingData.position_name = obj.workplace_name;
              }
            });
            if (!this.currentSchedulingData.position_name) {
              this.currentSchedulingData.position_id = "";
            }
            // this.currentSchedulingData.position_name = row.date_schedule[column.property].schedule[0].position_name || '暂无'
          } else {
            this.currentSchedulingData.position_id = "";
            this.currentSchedulingData.position_name = "";
          }
        });
        //设置弹窗信息
        let banci = [];
        for (let i = 0; i < 10; i++) {
          // console.log(String.fromCharCode(65 + i));
          banci.push(String.fromCharCode(65 + i));
        }
        const b = [...banci];
        this.currentSchedulingData.schedule = [];
        if (column.property === "user_name") {
          //点击的是人名列
          this.currentSchedulingData.title = "修改员工一周班次：";
          this.workScheduleList.forEach((obj1, index) => {
            let tempobj = JSON.parse(JSON.stringify(obj1));
            tempobj.selected = 0;
            tempobj.style = b[index];
            this.currentSchedulingData.schedule.push(tempobj);
          });
          this.currentSchedulingData.isAllDay = 1;
          this.currentSchedulingData.isAllPer = 0;
          this.currentSchedulingData.data_coordinate = [row.index, -1];
          console.log(this.currentSchedulingData);
        } else {
          this.currentSchedulingData.title = "修改员工当天班次：";
          this.workScheduleList.forEach((obj1, index) => {
            let tempobj = JSON.parse(JSON.stringify(obj1));
            tempobj.selected = 0;
            tempobj.style = b[index];

            //选择已经排班的班次
            row.date_schedule[column.property].schedule.forEach((obj2) => {
              if (tempobj.id == obj2.schedule_id) {
                tempobj.selected = 1;
              }
            });
            this.currentSchedulingData.schedule.push(tempobj);
          });
          this.currentSchedulingData.isAllDay = 0;
          this.currentSchedulingData.isAllPer = 0;
          this.currentSchedulingData.data_coordinate = [row.index, column.property];
          console.log(this.currentSchedulingData);
        }
      } else {
        this.schedulingTooltipVisable = false;
      }
    },
    
    //分页页码变化回调
    handleCurrentChange() {
      // console.log(this.sourceSchedulingList.slice(this.currentPage*10-10,this.currentPage*10))
      this.schedulingList = this.sourceSchedulingList.slice(
        this.currentPage * 10 - 10,
        this.currentPage * 10
      );
      //设置过期的表格
      this.setDisabledTable();
    },

    //排版统计-按班次
    cellClickFn2(row, column, cell, event) {
      event.stopPropagation();
      this.schedulingTooltipVisable = false;
      this.statisticsAddrTooltipVisable = false;
      // 去掉所有边框
      $(".el-table__body-wrapper td + td .cell").css({
        border: "1px solid transparent",
      });
      //非空单元格加边框 可点击
      // console.log($(cell).find('.cell').text())
      if ($(cell).find(".cell").text() && column.property !== "bc_name") {
        $(cell).find(".cell").css({ border: "1px solid #6699ee" });
        // console.log(row)
        // console.log(column)
        this.statisticsSchedulingCellData = this.statisticsSchedulingData[row.index].bc_date[column.property];
        // console.log(this.statisticsSchedulingCellData)
        // console.log($('.by_bc').width() - $(cell).position().left - $(cell).width())
        //弹出 编辑排班弹窗
        if (
          $(".by_bc").width() - $(cell).position().left - $(cell).width() <
          271
        ) {
          //出现在左边
          if (
            $(".by_bc .by_bc_tooltip").position().left ==
              $(cell).position().left - 271 &&
            $(".by_bc .by_bc_tooltip").position().top ==
              $(cell).position().top + 44 + 3
          ) {
            //点击的单元格没变
            this.statisticsSchedulingTooltipVisable = !this.statisticsSchedulingTooltipVisable;
            if (!this.statisticsSchedulingTooltipVisable) {
              $(cell).find(".cell").css({ border: "1px solid transparent" });
            }
          } else {
            this.statisticsSchedulingTooltipVisable = true;
            $(".by_bc .by_bc_tooltip").css({
              left: $(cell).position().left - 271,
              top: $(cell).position().top + 44 + 3,
            });
          }
        } else {
          //右边
          if (
            $(".by_bc .by_bc_tooltip").position().left ==
              $(cell).position().left + $(cell).width() + 3 &&
            $(".by_bc .by_bc_tooltip").position().top ==
              $(cell).position().top + 44 + 3
          ) {
            //点击的单元格没变
            this.statisticsSchedulingTooltipVisable = !this.statisticsSchedulingTooltipVisable;
            if (!this.statisticsSchedulingTooltipVisable) {
              $(cell).find(".cell").css({ border: "1px solid transparent" });
            }
          } else {
            this.statisticsSchedulingTooltipVisable = true;
            $(".by_bc .by_bc_tooltip").css({
              left: $(cell).position().left + $(cell).width() + 3,
              top: $(cell).position().top + 44 + 3,
            });
          }
        }
      } else {
        this.statisticsSchedulingTooltipVisable = false;
      }
    },

    //排版统计-按地点
    cellClickFn3(row, column, cell, event) {
      event.stopPropagation();
      this.schedulingTooltipVisable = false;
      this.statisticsSchedulingTooltipVisable = false;
      // 去掉所有边框
      $(".el-table__body-wrapper td + td .cell").css({
        border: "1px solid transparent",
      });
      if ($(cell).find(".cell").text() && column.property !== "addr_name") {
        $(cell).find(".cell").css({ border: "1px solid #6699ee" });

        this.locationStatisticsCellData = this.locationStatistics[row.index].addr_date[column.property];

        // console.log($('.by_bc').width() - $(cell).position().left - $(cell).width())
        //弹出 编辑排班弹窗
        if (
          $(".by_addr").width() - $(cell).position().left - $(cell).width() <
          271
        ) {
          //出现在左边
          if (
            $(".by_addr .by_addr_tooltip").position().left ==
              $(cell).position().left - 271 &&
            $(".by_addr .by_addr_tooltip").position().top ==
              $(cell).position().top + 44 + 3
          ) {
            //点击的单元格没变
            this.statisticsAddrTooltipVisable = !this.statisticsAddrTooltipVisable;
            if (!this.statisticsAddrTooltipVisable) {
              $(cell).find(".cell").css({ border: "1px solid transparent" });
            }
          } else {
            this.statisticsAddrTooltipVisable = true;
            $(".by_addr .by_addr_tooltip").css({
              left: $(cell).position().left - 271,
              top: $(cell).position().top + 44 + 3,
            });
          }
        } else {
          //右边
          if (
            $(".by_addr .by_addr_tooltip").position().left ==
              $(cell).position().left + $(cell).width() + 3 &&
            $(".by_addr .by_addr_tooltip").position().top ==
              $(cell).position().top + 44 + 3
          ) {
            //点击的单元格没变
            this.statisticsAddrTooltipVisable = !this.statisticsAddrTooltipVisable;
            if (!this.statisticsAddrTooltipVisable) {
              $(cell).find(".cell").css({ border: "1px solid transparent" });
            }
          } else {
            this.statisticsAddrTooltipVisable = true;
            $(".by_addr .by_addr_tooltip").css({
              left: $(cell).position().left + $(cell).width() + 3,
              top: $(cell).position().top + 44 + 3,
            });
          }
        }
      } else {
        this.statisticsAddrTooltipVisable = false;
      }
    },


    openSetupBc() {
      this.bc_list_active = JSON.parse(JSON.stringify(this.workScheduleList));
      this.bc_list_active.forEach((obj) => {
        obj.start_time = new Date(
          2017,
          8,
          10,
          obj.start_time.split(":")[0],
          obj.start_time.split(":")[1]
        );
        obj.end_time = new Date(
          2017,
          8,
          10,
          obj.end_time.split(":")[0],
          obj.end_time.split(":")[1]
        );
      });
    },


    startRange(end_time) {
    },


    endRange(start_time) {
    },


    formatEndtime(item) {
      if (
        item.start_time.toString().substr(16) <
        item.end_time.toString().substr(16)
      ) {
        item.cross = 0;
        return "HH:mm";
      } else {
        item.cross = 1;
        return "次日HH:mm";
      }
    },


    startChange(item) {
      if (
        item.start_time.toString().substr(16) ==
        item.end_time.toString().substr(16)
      ) {
        item.start_time = new Date(item.start_time.getTime() - 60 * 1000);
      }
    },


    endChange(item) {
      if (
        item.start_time.toString().substr(16) ==
        item.end_time.toString().substr(16)
      ) {
        item.end_time = new Date(item.end_time.getTime() + 60 * 1000);
      }
    },


    confirmAddBc() {
      let isV = this.bc_list_active.every((obj) => {
        return obj.start_time && obj.end_time;
      });
      // console.log(isV)
      if (isV) {
        // console.log(this.bc_list_active)
        let bc_list_active = [];
        this.bc_list_active.forEach((obj) => {
          // console.log(obj.start_time.toString().substr(16,5))
          let tempObj = {};
          tempObj.id = obj.id;
          tempObj.name = obj.name;
          tempObj.start_time = obj.start_time.toString().substr(16, 5);
          tempObj.end_time = obj.end_time.toString().substr(16, 5);
          tempObj.cross = obj.cross;
          bc_list_active.push(tempObj);
        });
        // console.log(bc_list_active)
        // return
        this.$confirm("修改后，今日及未发生的考勤将按照新规则处理", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
        })
          .then(() => {
            this.showAddBcDialog = false;
            util.ajax({
              url: "/attendance/task_schedule/set",
              type: "POST",
              data: {
                team_id: this.team_id,
                project_id: this.project_id,
                task_id: this.task_id,
                schedule_list: bc_list_active.concat(this.bc_list_del),
              },
              success: (res) => {
                // console.log('修改班次成功')
                // console.log(res)
                if (res && res.errno == 0) {
                  this.workScheduleList = bc_list_active;
                  //修改班次成功后重新拉下班次信息
                  util.ajax({
                    url: "/attendance/task_schedule",
                    type: "GET",
                    data: {
                      team_id: this.team_id,
                      project_id: this.project_id,
                      task_id: this.task_id,
                    },
                    success: (res) => {
                      // console.log('所有班次')
                      // console.log(res)
                      if (res && res.errno == 0) {
                        this.workScheduleList = res.data;
                      } else {
                        this.$message({
                          showClose: true,
                          message: res.errmsg,
                          type: "warning",
                        });
                      }
                    },
                    error: (xhr, status) => {},
                    noNetwork: () => {
                      // 网络超时
                      this.$message({
                        showClose: true,
                        message: "网络连接失败，请检查网络",
                        type: "warning",
                      });
                    },
                  });
                } else {
                  this.$message({
                    showClose: true,
                    message: res.errmsg,
                    type: "warning",
                  });
                }
              },
              error: (xhr, status) => {},
              noNetwork: () => {
                // 网络超时
                this.$message({
                  showClose: true,
                  message: "网络连接失败，请检查网络",
                  type: "warning",
                });
              },
            });
          })
          .catch(() => {
            // this.$message({
            //     type: 'info',
            //     message: '已取消删除'
            // });
          });
      } else {
        this.$message({
          showClose: true,
          message: "请选择时间",
          type: "warning",
        });
      }
    },


    setupBcFn(index) {
      //0--删除；1--增加
      // console.log(index)
      if (this.bc_list_active.length - 1 > index || index == 9) {
        //删除
        // this.bc_list_active[index].name = -1
        // this.bc_list_del.push(this.bc_list_active[index])
        this.bc_list_active.splice(index, 1);
        // console.log(this.bc_list_active)
      } else {
        //添加
        this.bc_list_active.push({
          end_time:
            this.bc_list_active[this.bc_list_active.length - 1].end_time,
          id: 0,
          name: "",
          start_time:
            this.bc_list_active[this.bc_list_active.length - 1].start_time,
          cross: 0,
        });
      }
      this.bc_list_active.forEach((obj, index) => {
        switch (index) {
          case 0:
            obj.name = "A";
            break;
          case 1:
            obj.name = "B";
            break;
          case 2:
            obj.name = "C";
            break;
          case 3:
            obj.name = "D";
            break;
          case 4:
            obj.name = "E";
            break;
          case 5:
            obj.name = "F";
            break;
          case 6:
            obj.name = "G";
            break;
          case 7:
            obj.name = "H";
            break;
          case 8:
            obj.name = "I";
            break;
          case 9:
            obj.name = "J";
            break;
        }
      });
    },


    changeTjTypeSel() {
      if (this.tj_type_sel == 1 && !this.locationStatistics.length) {
        this.statisticsAddr();
      }
    },


    confirmExport() {
      // console.log(this.export_date_str)
      if (this.exportDateChangeFn(this.export_date_str)) {
        console.log("导出");
      }
    },


    exportDateChangeFn(val) {
      this.export_date_str = val;
      val = val.split(" - ");
      let dateRange =
        (util.getStampFromDate(val[1]) - util.getStampFromDate(val[0])) /
          1000 /
          60 /
          60 /
          24 +
        1;
      // console.log(dateRange)
      if (dateRange > 31) {
        this.$message({
          showClose: true,
          message: "导出时间范围不能超过一个月",
          type: "warning",
        });
        return false;
      }
      return true;
    },
  },
  mounted() {
    this.init();
  },
  watch: {
    $route(to, from) {
      // 对路由变化作出响应...
      this.init();
    },
  },
};
</script>
<style src="./index.css"></style>
