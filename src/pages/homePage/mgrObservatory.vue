<template lang="pug">
    el-container.mgrObservatory
        el-main.main
            el-card.card.operations(:body-style="{padding:'5px',display: 'flex','justify-content': 'space-between'}")
                div
                    el-button(type='primary', @click="addMain", icon='el-icon-circle-plus', size='mini')
                        | 新增主版本号
                    el-button(type='primary', @click="addFork", icon='el-icon-circle-plus', size='mini')
                        | 新增分支号

            .table-container
                el-table.table(:data='tableData', :height='table_height', :stripe='true', :border='true', size='mini', tooltip-effect='light')
                    el-table-column(prop='module', label='域', width='75px')
                    el-table-column(prop='versionNum', label='主版本号', width='75px')
                    el-table-column(prop='branchNum', label='分支号', width='75px')
                    el-table-column(prop='title', label='标题', width='150px')
                    el-table-column(prop='content', label='内容描述', width='150px')
                    el-table-column(prop='openFlag', label='是否开启', width='150px')
                    el-table-column(prop='userTagId', label='标签ID', width='200px')
                    el-table-column(prop='createTime', label='创建时间', width='200px')
                    el-table-column(prop='updateTime', label='修改时间', width='200px')


            .pagination
                el-pagination(@size-change='handlePageSizeChange', @current-change='handleCurrentPageChange', :current-page='current_page', :total='page_total', :page-size="10", :page-sizes="[10, 20, 50, 100]", layout='total, sizes, prev, pager, next, jumper', :background='true', :small='true')
                <!--el-pagination(@size-change="handlePageSizeChange", @current-change="handleCurrentPageChange", :current-page="current_page", :page-sizes="[100, 200, 300, 400]", :page-size="100", layout="total, prev, pager, next, jumper", :total="400")-->
</template>

<script>
  // @flow
  import API from '@/service/api'
  import {map, extend, assign, debounce, isEmpty, cloneDeep, omitBy, omit} from 'lodash'
  import ElCard from "element-ui/packages/card/src/main";

  export default {
    name: 'mgrObservatory',
    metaInfo: {
      titleTemplate: '%s-版本配置'
    },
    data() {
      return {
        isSearching: false,
        form_version: {
          name: '',
          keyWords: '',
          url: '',
          beginDate: '',
          endDate: '',
          dateRange: [],
          startIndex: 0,
          pageSize: 10
        },
        tmpl_form_version: {
          name: '',
          keyWords: '',
          url: '',
          beginDate: '',
          endDate: '',
          dateRange: [],
          startIndex: 0,
          pageSize: 10
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
      console.log(`版本配置 mounted()`)
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
          target: '.mgrObservatory',
          lock: true,
          text: '正在获取数据。。。',
          background: 'rgba(255,255,255,0.3)'
        });
        this.form_version.startIndex = startIndex ? Number(startIndex) : this.current_page - 1;
        this.form_version.pageSize = Number(this.page_size);
        if (!isEmpty(this.form_version.dateRange)) {
          this.form_version.beginDate = this.form_version.dateRange[0];
          this.form_version.endDate = this.form_version.dateRange[1];
        }
        return API.getAllApp(omit(this.form_version, ['dateRange'])).then(res => {
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
        this.form_version = extend({}, this.tmpl_form_version);
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
      }
    },
    components: {ElCard}
  }
</script>

<style lang="stylus" scoped>
    .mgrObservatory
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
        padding 5px
        padding-bottom 0px
</style>
