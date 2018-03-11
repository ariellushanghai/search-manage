<template lang="pug">
    el-container.mgrFunKeyWord
        el-main.main
            el-card.card.operations(:body-style="{padding:'5px',display: 'flex','justify-content': 'space-between'}")
                el-form(:model='form_search', :disabled='isSearching', :status-icon='true', label-width="100px", label-position='left', size='mini')
                    div(style='width: 40%;')
                        el-form-item(label='功能名称:')
                            el-input(v-model.trim='form_search.name', auto-complete='off', :clearable='true')

                        el-form-item(label='跳转链接:')
                            el-input(v-model.trim='form_search.url', auto-complete='off', :clearable='true')

                    div(style='width: 40%;')
                        el-form-item(label='关键词:')
                            el-input(v-model.trim='form_search.marketTerm', auto-complete='off')

                        el-form-item(label='关键词有效期:')
                            <!--el-col(:span="11")-->
                            <!--el-date-picker(type="date" placeholder="选择日期" v-model="form_search.beginDate" style="width: 100%;")-->
                            <!--el-col(:span="2", style='text-align: center;')-->
                            <!--| 至-->
                            <!--el-col(:span="11")-->
                            <!--el-date-picker(type="date" placeholder="选择日期" v-model="form_search.endDate" style="width: 100%;")-->
                            el-date-picker(v-model='form_search.dateRange', type='daterange', format='yyyy/MM/dd', align='right', :unlink-panels='true', range-separator='至' start-placeholder='开始日期' end-placeholder='结束日期', :picker-options='date_picker_options')

                    div(style='width: 20%;')
                        el-button(type='primary', @click="fetchData", icon='el-icon-search', :loading='isSearching', size='mini')
                            | 搜索
                        el-button(type='primary', @click="resetFormSearch", icon='el-icon-error', size='mini')
                            | 重置
                        el-button(type='primary', @click="", icon='el-icon-download', size='mini')
                            | 导出

            .table-container
                el-table.table(:data='tableData', :height='table_height', :stripe='true', :border='true', size='mini', tooltip-effect='light')
                    el-table-column(prop='id', label='条目ID')
                    el-table-column(prop='name', label='功能名称')
                    el-table-column(prop='parent', label='父级功能标识')
                    el-table-column(prop='weightWord', label='权重关键词')
                    el-table-column(prop='keyWords', label='关键词', :show-overflow-tooltip='true', width='200px')
                    el-table-column(prop='marketTerm', label='营销术语')
                    el-table-column(prop='url', label='跳转链接', width='300px')
                    el-table-column(prop='sonUrl', label='子跳转链接')
                    el-table-column(prop='actionType', label='跳转链接类型')
                    el-table-column(prop='appVersion', label='最低可兼容APP版本')
                    el-table-column(prop='level', label='功能层级')
                    el-table-column(prop='fatherId', label='父节点ID')
                    el-table-column(prop='status', label='功能标识')
                    el-table-column(prop='remark', label='说明')
                    el-table-column(prop='updateBy', label='更新人')
                    el-table-column(prop='updateDate', label='更新日期')
                    el-table-column(prop='clientSystem', label='客户端操作系统')
                    el-table-column(prop='androidLowVersion', label='最低可兼容Android版本')
                    el-table-column(prop='iosLowVersion', label='最低可兼容IOS版本')
                    el-table-column(prop='weight', label='权重')
                    el-table-column(prop='appRemark', label='功能标识')
                    el-table-column(prop='imgUrl', label='图标链接')

            .pagination
                el-pagination(@size-change='handlePageSizeChange', @current-change='handleCurrentPageChange', :current-page='current_page', :total='page_total', :page-size='10', layout='total, sizes, prev, pager, next, jumper', :page-sizes='[10, 20, 50, 100]', :background='true', :small='true')

</template>

<script>
  // @flow
  import API from '@/service/api'
  import {map, extend, assign, debounce, isEmpty, cloneDeep} from 'lodash'
  import ElCard from "element-ui/packages/card/src/main";

  export default {
    name: 'mgrFunKeyWord',
    metaInfo: {
      titleTemplate: '%s-功能服务'
    },
    data() {
      return {
        isSearching: false,
        form_search: {
          name: '',
          keyWords: '',
          url: '',
          beginDate: '',
          endDate: '',
          dateRange: '',
          startIndex: 0,
          pageSize: 10
        },
        tmpl_form_search: {
          name: '',
          keyWords: '',
          url: '',
          beginDate: '',
          endDate: '',
          dateRange: '',
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
        if (isEmpty(this.fun_key_words)) {
          return [];
        }
        console.log(cloneDeep(this.fun_key_words));
        return cloneDeep(this.fun_key_words);
      }
    },
    mounted() {
      console.log(`功能服务 mounted()`)
      window.onresize = debounce(() => {
        this.table_height = this.resizeHandler();
      }, 200);
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
          return document.querySelector('.table-container').getBoundingClientRect().height - (12);
        }
        return 0;
      },
      fetchData() {
        let loading = this.$loading({
          target: '.mgrFunKeyWord',
          lock: true,
          text: '正在获取数据。。。',
          background: 'rgba(255,255,255,0.3)'
        });
        this.form_search.startIndex = this.current_page - 1;
        this.form_search.pageSize = this.page_size;
        return API.getAllApp(this.form_search).then(res => {
          console.log(`res.list: `, res.list);
          this.fun_key_words = res.list;
          this.page_total = res.total;
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
      resetFormSearch() {
        this.form_search = extend({}, this.tmpl_form_search);
        return this.fetchData();
      },
      handleCurrentPageChange(val) {
        console.log(`当前页: ${val}`);
        this.current_page = val;
        return this.fetchData();
      },
      handlePageSizeChange(val) {
        console.log(`每页 ${val} 条`);
        this.page_size = val;
        return this.fetchData();
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
        padding 5px
        padding-bottom 0px
</style>
