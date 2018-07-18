`<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button-group>
        <el-button type="primary" v-if="dictManager_btn_add" icon="plus" @click="handlerAdd">添加</el-button>
        <el-button type="primary" v-if="dictManager_btn_edit" icon="edit" @click="handlerEdit">编辑</el-button>
        <el-button type="primary" v-if="dictManager_btn_del" icon="delete" @click="handleDelete">删除</el-button>
      </el-button-group>
    </div>

    <el-row>
      <el-col :span="8" style='margin-top:15px;'>
        <el-tree
          class="filter-tree"
          :data="treeData"
          node-key="id"
          highlight-current
          :props="defaultProps"
          :filter-node-method="filterNode"
          @node-click="getNodeData"
          default-expand-all
        >
        </el-tree>
      </el-col>
      <el-col :span="16" style='margin-top:15px;'>
        <el-card class="box-card">
          <el-form :label-position="labelPosition" label-width="100px" :model="form" ref="form">
            <div class="hidden">
              <el-input v-model="form.id"></el-input>
              <el-input v-model="form.parentId"></el-input>
            </div>
            <el-form-item label="字典关键字" prop="keyworld">
              <el-input v-model="form.keyworld" :disabled="formEdit"  placeholder="请输入名称"></el-input>
            </el-form-item>
            <el-form-item label="字典描述" prop="valueDesc">
              <el-input v-model="form.valueDesc" :disabled="formEdit"  placeholder="请输入描述"></el-input>
            </el-form-item>
            <el-form-item label="字典类型" prop="classLevel">
              <el-select class="filter-item" v-model="form.classLevel" :disabled="formEdit" placeholder="请输入类型">
                <el-option v-for="item in  classLevelOptions" :key="item" :label="item | classLevelFilter"
                           :value="item"></el-option>
              </el-select>
            </el-form-item>
             <el-form-item label="字典类别" prop="classType">
              <el-input v-model="form.classType" :disabled="formEdit"  placeholder="请输入类别"></el-input>
            </el-form-item>
            <el-form-item label="排序" prop="classOrder">
              <el-input v-model="form.classOrder" :disabled="formEdit" placeholder="请输入排序"></el-input>
            </el-form-item>
            <el-form-item label="是否可用" prop="isDeleted">
              <el-select class="filter-item" v-model="form.isDeleted" :disabled="formEdit" placeholder="请输入是否可用">
                <el-option v-for="item in  typeOptions" :key="item" :label="item | enabledFilter"
                           :value="item"></el-option>
              </el-select>
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
  import { fetchTree, getObj, addObj, delObj, putObj } from '@/api/dict'
  import { mapGetters } from 'vuex'
  export default {
    name: 'dict',
    data() {
      return {
        list: null,
        total: null,
        formEdit: true,
        formAdd: true,
        formStatus: '',
        showElement: false,
        typeOptions: [0, 1],
        classLevelOptions: [0,1],
        methodOptions: ['GET', 'POST', 'PUT', 'DELETE'],
        listQuery: {
          name: undefined
        },
        treeData: [],
        defaultProps: {
          children: 'children',
          label: 'valueDesc'
        },
        labelPosition: 'right',
        form: {
          keyworld: undefined,
          valueDesc: undefined,
          classLevel: undefined,
          classType: undefined,
          classOrder: undefined,
          parentId: undefined,
          isDeleted: undefined,
          id: undefined
        },
        currentId: 0,
        dictManager_btn_add: false,
        dictManager_btn_edit: false,
        dictManager_btn_del: false
      }
    },
    filters: {
      enabledFilter(type) {
        const typeMap = {
          0: '可用',
          1: '不可用'
        }
        return typeMap[type]
      },
      classLevelFilter(type) {
        const typeMap = {
          0: '父级类型',
          1: '子级类型'
        }
        return typeMap[type]
      }
    },
    created() {
      this.getList()
      this.dictManager_btn_add = this.permissions['sys_dict_add']
      this.dictManager_btn_edit = this.permissions['sys_dict_edit']
      this.dictManager_btn_del = this.permissions['sys_dict_del']
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
        return data.label.indexOf(value) !== -1
      },
      getNodeData(data) {
        if (!this.formEdit) {
          this.formStatus = 'update'
        }
        getObj(data.id).then(response => {
          this.form = response.data
        })
        this.currentId = data.id
        this.showElement = true
      },
      handlerEdit() {
        if (this.form.id) {
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
        putObj(this.form).then(() => {
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
        addObj(this.form).then(() => {
          this.getList()
          this.$notify({
            title: '成功',
            message: '创建成功',
            type: 'success',
            duration: 2000
          })
        })
      },
      onCancel() {
        this.formEdit = true
        this.formStatus = ''
      },
      resetForm() {
        this.form = {
          parentId: this.currentId,
          keyworld: undefined,
          valueDesc: undefined,
          classLevel: undefined,
          classType: undefined,
          isDeleted: undefined,
          id: undefined,
          classOrder: undefined
        }
      }
    }
  }
</script>

