<template>
  <el-container class="mgrFunKeyWord">
    <el-main class="main">
      <!-- 编辑关键词弹出框-->
      <el-dialog class="dialog_edit_keywords" :visible.sync="dialog_edit_keywords" width="61.8%" top="50px" :append-to-body="true" :modal-append-to-body="true" :lock-scroll="true" :show-close="true" :close-on-click-modal="false" :close-on-press-escape="false">
        <el-form :model="form_update_keyWord" :disabled="isSubmitting" :status-icon="true" label-width="150px" label-position="left" size="mini"></el-form>
      </el-dialog>
      <el-card class="card operations" :body-style="{padding:'5px',display: 'flex','justify-content': 'space-between'}">
        <el-form :model="form_search" :disabled="isSearching" :status-icon="true" label-width="150px" label-position="left" size="mini">
          <div style="width: 40%;">
            <el-form-item label="功能名称:">
              <el-input v-model.trim="form_search.name" auto-complete="off" :clearable="true"></el-input>
            </el-form-item>
            <el-form-item label="跳转链接:">
              <el-input v-model.trim="form_search.url" auto-complete="off" :clearable="true"></el-input>
            </el-form-item>
          </div>
          <div style="width: 40%;">
            <el-form-item label="关键词:">
              <el-input v-model.trim="form_search.marketTerm" auto-complete="off"></el-input>
            </el-form-item>
            <el-form-item label="关键词有效期:">
              <el-date-picker v-model="form_search.dateRange" type="daterange" value-format="yyyy/MM/dd" format="yyyy/MM/dd" align="center" :unlink-panels="true" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" :picker-options="date_picker_options" size="mini" style="width: 100%;"></el-date-picker>
            </el-form-item>
          </div>
          <div style="width: 20%;">
            <el-button type="primary" @click="fetchData('0')" icon="el-icon-search" :loading="isSearching" size="mini">搜索</el-button>
            <el-button type="primary" @click="resetFormSearch" icon="el-icon-error" size="mini">重置</el-button>
            <el-button type="primary" @click="exportCSV" icon="el-icon-download" size="mini">导出</el-button>
          </div>
        </el-form>
      </el-card>
      <div class="table-container">
        <el-table class="table" :data="tableData" :height="table_height" :stripe="true" :border="true" size="mini" tooltip-effect="light" @cell-click="handlerCellClick">
          <el-table-column prop="id" label="条目ID" min-width="100px"></el-table-column>
          <el-table-column prop="name" label="功能名称" min-width="100px"></el-table-column>
          <el-table-column prop="parent" label="父级功能标识" min-width="150px"></el-table-column>
          <el-table-column prop="wordList" label="关键词 (可编辑)" :show-overflow-tooltip="true" min-width="300px" :formatter="formatKeyWords" class-name="cursor-pointer"></el-table-column>
          <el-table-column prop="marketTerm" label="营销术语 (可编辑)" min-width="300px" :formatter="formatMarketTerm" class-name="cursor-pointer"></el-table-column>
          <el-table-column prop="url" label="跳转链接" min-width="300px"></el-table-column>
          <el-table-column prop="sonUrl" label="子跳转链接" min-width="300px"></el-table-column>
          <el-table-column prop="actionType" label="跳转链接类型" min-width="100px"></el-table-column>
          <el-table-column prop="appVersion" label="最低可兼容APP版本" min-width="180px"></el-table-column>
          <el-table-column prop="level" label="功能层级" min-width="100px"></el-table-column>
          <el-table-column prop="fatherId" label="父节点ID" min-width="100px"></el-table-column>
          <el-table-column prop="status" label="功能标识" min-width="100px"></el-table-column>
          <el-table-column prop="remark" label="说明" min-width="100px"></el-table-column>
          <el-table-column prop="updateBy" label="更新人" min-width="150px"></el-table-column>
          <el-table-column prop="updateDate" label="更新日期" min-width="150px"></el-table-column>
          <el-table-column prop="clientSystem" label="客户端操作系统" min-width="120px"></el-table-column>
          <el-table-column prop="androidLowVersion" label="最低可兼容Android版本" min-width="180px"></el-table-column>
          <el-table-column prop="iosLowVersion" label="最低可兼容IOS版本" min-width="150px"></el-table-column>
          <el-table-column prop="weight" label="权重" min-width="50px"></el-table-column>
          <el-table-column prop="appRemark" label="功能标识" min-width="100px"></el-table-column>
          <el-table-column prop="imgUrl" label="图标链接" min-width="100px"></el-table-column>
        </el-table>
      </div>
      <div class="pagination">
        <el-pagination @size-change="handlePageSizeChange" @current-change="handleCurrentPageChange" :current-page="current_page" :total="page_total" :page-size="10" :page-sizes="[10, 20, 50, 100]" layout="total, sizes, prev, pager, next, jumper" :background="true" :small="true"></el-pagination>
      </div>
    </el-main>
  </el-container>
</template>

<script>
  // @flow
  import API from '@/service/api'
  import {map, extend, assign, debounce, isEmpty, cloneDeep, omitBy, omit, join} from 'lodash'
  import ElCard from "element-ui/packages/card/src/main";

  export default {
    name: 'mgrFunKeyWord',
    metaInfo: {
      titleTemplate: '%s-功能服务'
    },
    data() {
      return {
        isSearching: false,
        isSubmitting: false,
        dialog_edit_keywords: false,
        dialog_edit_market_term: false,
        form_search: {
          name: '',
          keyWords: '',
          url: '',
          beginDate: '',
          endDate: '',
          dateRange: [],
          startIndex: 0,
          pageSize: 10
        },
        tmpl_form_search: {
          name: '',
          keyWords: '',
          url: '',
          beginDate: '',
          endDate: '',
          dateRange: [],
          startIndex: 0,
          pageSize: 10
        },
        form_update_keyWord: {
          module: '',
          termId: '',
          wordList: []
        },
        tmpl_form_update_keyWord: {
          module: '',
          termId: '',
          wordList: []
        },
        tmpl_form_update_keyWord_wordList_item: {
          word: '',
          weight: 0,
          startDate: new Date(),
          endDate: ((new Date()).getTime() - 3600 * 1000 * 24 * 7)
        },
        date_picker_options: {
          shortcuts: [{
            text: '最近一周',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '最近一个月',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '最近三个月',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '最近半年',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 182);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '最近一年',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 365);
              picker.$emit('pick', [start, end]);
            }
          }]
        },
        current_page: 1,
        page_size: 10,
        page_total: 0,
        fun_key_words: [],
        table_height: 0
        // table_height: this.resizeHandler()
      }
    },
    computed: {
      tableData: function () {
        return cloneDeep(this.fun_key_words);
      }
    },
    mounted() {
      console.log(`功能服务 mounted()`)
      window.onresize = debounce(() => {
        this.table_height = this.resizeHandler();
      }, 500);
      this.triggerResize();
      return this.fetchData();
    },
    beforeDestroy: function () {
      window.onresize = undefined;
    },
    methods: {
      triggerResize() {
        let evt = document.createEvent('Event');
        evt.initEvent('resize', true, true);
        window.dispatchEvent(evt);
      },
      resizeHandler() {
        if (document.querySelector('.table-container')) {
          // debugger;
          return document.querySelector('.table-container').getBoundingClientRect().height - (12);
        }
        // debugger;
        return 0;
      },
      fetchData(startIndex) {
        let loading = this.$loading({
          target: '.mgrFunKeyWord',
          lock: true,
          text: '正在获取数据。。。',
          background: 'rgba(255,255,255,0.3)'
        });
        this.form_search.startIndex = startIndex ? Number(startIndex) : this.current_page - 1;
        this.form_search.pageSize = Number(this.page_size);
        if (!isEmpty(this.form_search.dateRange)) {
          this.form_search.beginDate = this.form_search.dateRange[0];
          this.form_search.endDate = this.form_search.dateRange[1];
        }
        return API.getAllApp(omit(this.form_search, ['dateRange'])).then(res => {
          console.log(`res.list: `, res.list);
          this.fun_key_words = res.list;
          this.page_total = Number(res.total);
          loading.close();
        }, err => {
          console.error(`err: `, err);
          loading.close();
          this.$notify({
            message: `${err.message}`,
            type: 'error',
            duration: 0
          });
          window.onresize();
        });
      },
      exportCSV() {
        return API.exportCSV({}).then(res => {
        }, err => {
          console.error(`err: `, err);
        });
      },
      resetFormSearch() {
        this.form_search = extend({}, this.tmpl_form_search);
        return this.fetchData();
      },
      handleCurrentPageChange(val) {
        console.log(`当前页: ${val}`);
        this.current_page = Number(val);
        return this.fetchData();
      },
      handlePageSizeChange(val) {
        console.log(`每页 ${val} 条`);
        this.page_size = Number(val);
        return this.fetchData();
      },
      handlerCellClick(row, column, cell, event) {
        // console.log(`handlerCellClick(): `, row[column.property])
        if (column.property === 'wordList') {
          this.dialog_edit_keywords = true;
        } else if (column.property === 'marketTerm') {
          this.dialog_edit_market_term = true;
        } else {
          return event.preventDefault();
        }
      },
      formatKeyWords(row, column, cellValue) {
        console.log(cellValue);
        return join(map(cellValue, 'word'), ', ');
      },
      formatMarketTerm(row, column, cellValue) {
        return cellValue;
      }
    },
    components: {ElCard}
  }
</script>

<style lang="stylus" scoped>
    .mgrFunKeyWord
        background-color #F8FAFE
        min-height 100%
        position relative

    .main
        display flex
        flex-direction column
        padding 5px
        width 100%
        height 100%
        position relative
        overflow hidden

    .card
        margin-bottom 5px
        flex-shrink 0
        flex-grow 0

    .card.operations /deep/ .el-card__body
        padding 5px

    .card.operations .el-form
        width 100%
        display flex

    .card.operations .el-form-item
        width 80%
        margin-bottom 5px

    .table
        padding 0
        width 100%
        height 100%
        font-size 12px

    .table-container /deep/ .el-table--mini th
        padding 5px 0

    .table-container /deep/ .el-table th > .cell
        color #303236

    .table-container
        flex-shrink 1
        flex-grow 1
        margin-bottom 0
        overflow hidden
        padding 5px
        border 1px solid #ebeef5
        background-color #fff
        box-shadow 0 2px 12px 0 rgba(0, 0, 0, .1)
        border-radius 4px

    .pagination
        display flex
        justify-content center
        flex none

    .pagination /deep/ .el-pagination
        display flex
        justify-content center
        align-items center
        padding 5px
        padding-bottom 0

    .operations /deep/ .el-date-editor .el-range-separator
        min-width 22px

    .table-container /deep/ .cursor-pointer:hover
        cursor pointer
</style>
