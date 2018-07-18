<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button-group>
        <el-button type="primary" v-if="menuManager_btn_add" icon="plus" @click="handlerAdd">添加</el-button>
        <el-button type="primary" v-if="menuManager_btn_edit" icon="edit" @click="handlerEdit">编辑</el-button>
        <el-button type="primary" v-if="menuManager_btn_del" icon="delete" @click="handleDelete">删除</el-button>
      </el-button-group>
    </div>

    <el-row>
      <el-col :span="8" style='margin-top:15px;'>
        <el-tree class="filter-tree"
                 :data="treeData" node-key="id"
                 highlight-current :props="defaultProps"
                 :filter-node-method="filterNode"
                 @node-click="getNodeData" default-expand-all>
        </el-tree>
      </el-col>
      <el-col :span="16" style='margin-top:15px;'>
        <el-card class="box-card">
          <el-form :label-position="labelPosition" label-width="80px" :model="menuForm" ref="menuForm" :rules="rules">
            <div class="hidden">
              <el-input v-model="menuForm.id"></el-input>
              <el-input v-model="menuForm.parentId"></el-input>
            </div>
            <el-form-item label="标题" prop="menuName">
              <el-input v-model="menuForm.menuName" :disabled="formEdit" placeholder="请输入标题"></el-input>
            </el-form-item>
            <el-form-item label="权限标识" prop="permission">
              <el-input v-model="menuForm.permission" :disabled="formEdit" placeholder="请输入权限标识"></el-input>
            </el-form-item>
            <el-form-item label="图标" prop="menuIcon">
              <el-input v-model="menuForm.menuIcon" :disabled="formEdit" placeholder="请输入图标"></el-input>
            </el-form-item>
            <el-form-item label="资源路径" prop="menuUrl">
              <el-input v-model="menuForm.menuUrl" :disabled="formEdit" placeholder="请输入资源路径"></el-input>
            </el-form-item>
            <el-form-item label="请求方法" prop="menuMethod">
              <el-select class="filter-item" v-model="menuForm.menuMethod" :disabled="formEdit" placeholder="请输入资源请求类型">
                <el-option v-for="item in  methodOptions" :key="item" :label="item" :value="item"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="类型" prop="menuType">
              <el-select class="filter-item" v-model="menuForm.menuType" :disabled="formEdit" placeholder="请输入资源请求类型">
                <el-option v-for="item in  typeOptions" :key="item" :label="item | typeFilter"
                           :value="item"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="是否显示" prop="isShow">
              <el-select class="filter-item" v-model="menuForm.isShow" :disabled="formEdit" placeholder="请输入资源是否显示">
                <el-option v-for="item in  typeOptions" :key="item" :label="item | showFilter"
                           :value="item"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="排序" prop="menuSort">
              <el-input v-model="menuForm.menuSort" :disabled="formEdit" placeholder="请输入排序"></el-input>
            </el-form-item>
            <el-form-item label="前端地址" prop="menuPath">
              <el-input v-model="menuForm.menuPath" :disabled="formEdit" placeholder="iframe嵌套地址"></el-input>
            </el-form-item>
            <el-form-item v-if="formStatus == 'update'">
              <el-button type="primary" @click="update">更新</el-button>
              <el-button @click="onCancel">取消</el-button>
            </el-form-item>
            <el-form-item v-if="formStatus == 'create'">
              <el-button type="primary" @click="create">保存</el-button>
              <el-button @click="onCancel">取消</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
  import {fetchTree, getObj, addObj, delObj, putObj} from '@/api/menu'
  import {mapGetters} from 'vuex'

  export default {
    name: 'menu',
    data() {
      return {
        list: null,
        total: null,
        formEdit: true,
        formAdd: true,
        formStatus: '',
        showElement: false,
        typeOptions: [0, 1],
        methodOptions: ['GET', 'POST', 'PUT', 'DELETE'],
        listQuery: {
          name: undefined
        },
        treeData: [],
        defaultProps: {
          children: 'children',
          label: 'name'
        },
        labelPosition: 'right',
        menuForm: {
          permission: undefined,
          menuName: undefined,
          id: undefined,
          parentId: undefined,
          menuUrl: undefined,
          menuIcon: undefined,
          menuSort: undefined,
          isShow: undefined,
          menuType: undefined,
          menuMethod: undefined,
          menuPath: undefined
        },
        rules: {
          menuName: [{
            required: true,
            message: "请输入标题",
            trigger: "blur"
          },
            {
              min: 2,
              max: 20,
              message: "标题不能为空",
              trigger: "blur"
            }],
          menuUrl: [
            {
              required: true,
              message: "请选择请求资源",
              trigger: "blur"
            }
          ]
        },
        currentId: 0,
        menuManager_btn_add: false,
        menuManager_btn_edit: false,
        menuManager_btn_del: false
      }
    },
    filters: {
      typeFilter(type) {
        const typeMap = {
          0: '菜单',
          1: '按钮'
        }
        return typeMap[type]
      },
      showFilter(type) {
        const typeMap = {
          0: '显示',
          1: '不显示'
        }
        return typeMap[type]
      }
    },
    created() {
      this.getList()
      this.menuManager_btn_add = this.permissions['sys_menu_add']
      this.menuManager_btn_edit = this.permissions['sys_menu_edit']
      this.menuManager_btn_del = this.permissions['sys_menu_del']
    },
    computed: {
      ...mapGetters([
        'elements',
        'permissions'
      ])
    },
    methods: {
      getList() {
        fetchTree(this.listQuery).then(response => {
          this.treeData = response.data
        })
      },
      filterNode(value, data) {
        if (!value) return true
        return data.label.indexOf(value) !== 0
      },
      getNodeData(data) {
        if (!this.formEdit) {
          this.formStatus = 'update'
        }
        getObj(data.id).then(response => {
          this.menuForm = response.data
        })
        this.currentId = data.id
        this.showElement = true
      },
      handlerEdit() {
        if (this.menuForm.id) {
          this.formEdit = false
          this.formStatus = 'update'
        }
      },
      handlerAdd() {
        this.resetForm()
        this.formEdit = false
        this.formStatus = 'create'
      },
      handleDelete() {
        this.$confirm('此操作将永久删除, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          delObj(this.currentId).then(() => {
            this.getList()
            this.resetForm()
            this.onCancel()
            this.$notify({
              title: '成功',
              message: '删除成功',
              type: 'success',
              duration: 2000
            })
          })
        })
      },
      update() {
        putObj(this.menuForm).then(() => {
          this.getList()
          this.$notify({
            title: '成功',
            message: '更新成功',
            type: 'success',
            duration: 2000
          })
        })
      },
      create() {
        this.$refs.menuForm.validate(valid => {
          if (valid) {
            addObj(this.menuForm).then(() => {
              this.getList()
              this.$notify({
                title: '成功',
                message: '创建成功',
                type: 'success',
                duration: 2000
              })
            })
          }
        })
      },
      onCancel() {
        this.formEdit = true
        this.formStatus = ''
      },
      resetForm() {
        this.menuForm = {
          permission: undefined,
          menuName: undefined,
          id: undefined,
          parentId: this.currentId,
          menuUrl: undefined,
          menuIcon: undefined,
          menuSort: undefined,
          menuType: undefined,
          menuMethod: undefined,
          isShow: undefined,
          menuPath: undefined
        }
      }
    }
  }
</script>

