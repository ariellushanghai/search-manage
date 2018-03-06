<template lang="pug">
    el-container.mgrFunKeyWord
        el-main.user-manager-main
            el-card.card.operations(:body-style="{padding:'10px',display: 'flex','justify-content': 'space-between'}")
                el-form(:model='form_search', :disabled='isSearching', :status-icon='true', label-width="100px", label-position='left', size='mini')
                    div(style='width: 40%;')
                        el-form-item(label='功能名称:')
                            el-input(v-model.trim='form_search.name', auto-complete='off')
                        el-form-item(label='跳转链接:')
                            el-input(v-model.trim='form_search.keyWords', auto-complete='off')
                    div(style='width: 40%;')
                        el-form-item(label='关键词:')
                            el-input(v-model.trim='form_search.marketTerm', auto-complete='off')
                        el-form-item(label='关键词有效期:')
                            el-col(:span="11")
                                el-date-picker(type="date" placeholder="选择日期" v-model="form_search.beginDate" style="width: 100%;")
                            el-col(:span="2", style='text-align: center;')
                                | 至
                            el-col(:span="11")
                                el-date-picker(type="date" placeholder="选择日期" v-model="form_search.endDate" style="width: 100%;")
                    div(style='width: 20%;')
                        el-button(type='primary', @click="", icon='el-icon-search', :loading='isSearching', size='mini')
                            | 搜索
                        el-button(type='primary', @click="", icon='el-icon-error', size='mini')
                            | 重置

            el-card.card(:body-style="{padding:'10px'}")
                el-table.table(:data='tableData', :height='table_height', :stripe='true', :border='true')
                    el-table-column(prop='id', label='条目ID')
                    el-table-column(prop='name', label='功能名称')
                    el-table-column(prop='name', label='功能名称')

</template>

<script>
  // @flow
  import API from '@/service/api'
  import {map, extend, assign, debounce, isEmpty} from 'lodash'
  import format from 'date-fns/format'
  import ElCard from "element-ui/packages/card/src/main";

  const zh_cn = require('date-fns/locale/zh-CN')

  export default {
    name: 'mgrFunKeyWord',
    metaInfo: {
      titleTemplate: '%s-用户管理'
    },
    data() {
      return {
        isSearching: false,
        form_search: {
          name: '',
          keyWords: '',
          marketTerm: '',
          beginDate: '',
          endDate: ''
        },
        fun_key_words: [],
        table_height: this.resizeHandler()
      }
    },
    computed: {
      tableData: () => {
        return this.fun_key_words;
      }
    },
    mounted() {
      // this.fetchData();
      this.table_height = this.resizeHandler();
      console.log(this.resizeHandler());
      window.onresize = debounce(() => {
        this.table_height = this.resizeHandler();
      }, 300);
    },
    beforeDestroy: function () {
      window.onresize = undefined;
    },
    methods: {
      resizeHandler(): number {
        return document.querySelector('#router_view').getBoundingClientRect().height - (20 + 64 + 10 + 30);
      },
      fetchData() {
        let loading = this.$loading({
          target: '.mgrFunKeyWord',
          lock: true,
          text: '正在获取数据。。。',
          background: 'rgba(250,235,215,0.5)'
        });
        return API.getAllApp().then(res => {
          this.fun_key_words = res;
          loading.close();
        }, err => {
          console.error(`err: `, err);
          loading.close();
          this.$notify({
            message: `${err.message}`,
            type: 'error',
            duration: 0
          });
        });
      },
      sortCreateDate(a: number, b: number): number {
        return Number(a.createDate) - Number(b.createDate);
      },
      handleAddUser() {
        console.log(`handleAddUser()`);
        this.operation = 'add_user';
        this.form_add_user = extend({}, this.tmpl_form_add_user);
        this.dialog_add_user_visible = true;
      },
      cancelForm(formName: string) {
        console.log(`cancelForm(${formName})`);
        this.$refs[formName].resetFields();
        this.form_add_user = extend({}, this.tmpl_form_add_user);
        this.dialog_add_user_visible = false;
      },
      validateForm(form: string) {
        console.log('validateForm(form): ', form);
        console.log(this.$refs[form]);

        this.$refs[form].validate((valid) => {
          console.log(`valid: `, valid);
          if (valid) {
            // alert('submit!');
            return this.postForm(this.form_add_user);
          } else {
            console.error('error submit!!');
            return false;
          }
        });
      },
      postForm(data) {
        console.log(`postForm(): `, data);
        API[this.form_actions[this.operation].api_name](data).then(res => {
          this.$notify({
            message: `${this.form_actions[this.operation].display_name}成功`,
            type: 'success',
            duration: 2000
          });
          this.isSendingForm = false;
          this.cancelForm(this.form_actions[this.operation].form_name);
          return this.fetchData();
        }, err => {
          console.log(`err: `, err);
          this.$notify({
            message: `${err.message}`,
            type: 'error',
            duration: 0
          });
          this.isSendingForm = false;
        });
      }
    },
    components: {ElCard}
  }
</script>

<style lang="stylus" scoped>
    .mgrFunKeyWord
        background-color antiquewhite
        min-height 100%
        position relative

    .user-manager-main
        display flex
        flex-direction column
        padding 10px
        width 100%
        height 100%
        position relative
        overflow hidden

    .card
        margin-bottom 10px
        flex-shrink 0

    .card:last-of-type
        margin-bottom 0
        flex-shrink 1
        height calc(100% - 74px)

    .card.operations /deep/ .el-card__body
        padding 10px

    .card.operations .el-form
        width 100%
        display flex

    .card.operations .el-form-item
        width 80%
        margin-bottom 10px

    .table
        padding 0
        width 100%
        font-size 12px

</style>
